;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .factory( 'approvalHoursFactory', approvalHoursFactory )

    approvalHoursFactory.$invoke = [ '$http', '$q', 'UserFactory', 'imputeHoursFactory' ];
    function approvalHoursFactory( $http, $q, UserFactory, imputeHoursFactory ) {
    
        const IMPUTETYPES = imputeHoursFactory.getImputeTypesIndexConst();
        var mainOBJ;
        var data;

        return {

            getEmployeesTimesheets: function ( _mainOBJ ) { // LEO WAS HERE
                mainOBJ = _mainOBJ;
                var month = mainOBJ.currentMonth;
                var year = mainOBJ.currentYear;
                var managerId = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.get( buildURL( 'getEmployeesTimesheets' ) + managerId + '?month=' + month + '&year=' + year )
                    .then( prepareData.bind( null, dfd ) )
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            }
        }

        function prepareData( dfd, _data ) {
            data = _data;
            var calendars = data.data.calendars;
            var employees = data.data.employees;
            employees.forEach( function( employee ) {
                employee.opened = false;
                var totalImputeHours = 0;
                var totalDailyWork   = 0;
                for( var projectId in employee.timesheetDataModel ) {
                    employee.timesheetDataModel[ projectId ].info.opened = false;
                    var imputeHours = 0;
                    var dailyWork   = 0;
                    for( var day in employee.timesheetDataModel[ projectId ] ) {
                        if( day == 'info' ) continue; // 'info' is where all project info is stored, so, it is necessary to skip it

                        // getting dayType
                        var dayType = getDayTypeByDay( calendars, employee.calendarID, day );

                        // getting dayType milliseconds
                        var dayTypeMilliseconds = getDayTypeMilliseconds( calendars, employee.calendarID, dayType );

                        for( var imputeType in employee.timesheetDataModel[ projectId ][ day ] ) {
                            
                            if( imputeType != IMPUTETYPES.Guardias ) { // calculate just 'Hours'. 'Guardias' are not taken in account here.
                                for( var imputeSubType in employee.timesheetDataModel[ projectId ][ day ][ imputeType ] ) {
                                    

                                    var imputeValue = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].value;
                                    var dailyWorkValue = calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  );

                                    totalImputeHours+= imputeValue;
                                    imputeHours+= imputeValue;
                                    totalDailyWork+= dailyWorkValue;
                                    dailyWork+= dailyWorkValue;
                                }
                            }
                        }
                    }
                    employee.timesheetDataModel[ projectId ].info.imputeHours = imputeHours;
                    employee.timesheetDataModel[ projectId ].info.dailyWork   = Number( dailyWork.toFixed( 1 ) ); // round to 1 decimal
                }
                employee.totalImputeHours = totalImputeHours;
                employee.totalDailyWork   = Number( totalDailyWork.toFixed( 1 ) ); // round to 1 decimal
            });
            prepareTableDaysData( dfd );
        }

        // getting dayType acoording to day and calendarID
        function getDayTypeByDay( calendars, calendarID, day ) {
            var dayType = '';
            if( calendars[ calendarID ] ) {
                var calendar = calendars[ calendarID ];
                if( calendar.eventHours[0].eventDates[ day ] ) {
                    dayType = calendar.eventHours[0].eventDates[ day ].type;
                }
            }
            return dayType;
        }

        // getting millisecons acoording to dayType and calendarID
        function getDayTypeMilliseconds( calendars, calendarID, dayType ) {
            var milliseconds = 0;
            if( calendars[ calendarID ] ) {
                var calendar = calendars[ calendarID ];
                if( calendar.eventHours[0].totalPerType[ dayType ] ) {
                    milliseconds = calendar.eventHours[0].totalPerType[ dayType ].milliseconds;
                }
            }
            return milliseconds;
        }

        function prepareTableDaysData( dfd ) {
            var employees = data.data.employees;
            employees.forEach( function( employee ) {
                    employee.isPending = false;
                    for( var projectId in employee.timesheetDataModel ) {

                        for( var day in employee.timesheetDataModel[ projectId ] ) {
                            if( day == 'info' ) continue; // 'info' is where all project info is stored, so, it is necessary to skip it
    
                            for( var imputeType in employee.timesheetDataModel[ projectId ][ day ] ) {
                                for( var imputeSubType in employee.timesheetDataModel[ projectId ][ day ][ imputeType ] ) {

                                    var tableName = imputeType + '_' + imputeSubType;
                                    if( !employee.timesheetDataModel[ projectId ].info.tables[tableName]) {
                                        employee.timesheetDataModel[ projectId ].info.tables[tableName] = {};
                                        var newTable = employee.timesheetDataModel[ projectId ].info.tables[tableName];
                                        newTable.name = tableName;
                                        newTable.imputeType = imputeType;
                                        newTable.imputeSubType = imputeSubType;
                                        newTable.days = [];
                                        createTable( newTable );
                                    }
                                    var table     = employee.timesheetDataModel[ projectId ].info.tables[tableName];
                                    var value     = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][imputeSubType].value;
                                    var status    = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][imputeSubType].status;
                                    var isEnabled = status == 'sent' ? true : false;
                                    
                                    if( !employee.isPending && isEnabled ) employee.isPending = true;

                                    var currentDay = new Date( parseInt( day,10 ) ).getDate();

                                    var dayToSet = table.days.find( function( dayObj ) {
                                        return dayObj.day == currentDay;
                                    });
                                    dayToSet.value   = value;
                                    dayToSet.enabled = isEnabled;
                                    employee.timesheetDataModel[ projectId ][ day ][ imputeType ][imputeSubType].enabled = isEnabled;
                                }
                            }
                        }
                    }
            });

            function createTable( newTable ) {
                for( var day = 1; day <= mainOBJ.totalMonthDays; day++ ) {
                    var dayTimestamp = new Date( mainOBJ.currentYear, mainOBJ.currentMonth, day ).getTime();
                    newTable.days.push( { day : day, dayTimestamp : dayTimestamp, value : 0, approved : 'NA', enabled : false } );
                }
            }
            prepareDayType( dfd );
        }

        function prepareDayType( dfd ) {
            var employees = data.data.employees;
            var calendars = data.data.calendars;
            employees.forEach( function( employee ) {
                var calendarID = employee.calendarID;
                for( var projectId in employee.timesheetDataModel ) {
                    for( var table in employee.timesheetDataModel[ projectId ].info.tables) {
                        var currentTable =  employee.timesheetDataModel[ projectId ].info.tables[ table ];
                        currentTable.days.forEach( function( day ) {
                            var currentDay = new Date( mainOBJ.currentYear, mainOBJ.currentMonth,  parseInt( day.day, 10) ).getTime();
                            var dayType = calendars[calendarID].eventHours[0].eventDates[currentDay].type;
                            day.dayType = dayType;
                        });
                    }
                }
            });

            return dfd.resolve( data.data.employees );
        }
    }

}());
