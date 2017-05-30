;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .factory( 'approvalHoursFactory', approvalHoursFactory )

    approvalHoursFactory.$invoke = [ '$http', '$q', 'UserFactory', 'imputeHoursFactory', 'projectInfoFactory' ];
    function approvalHoursFactory( $http, $q, UserFactory, imputeHoursFactory, projectInfoFactory ) {
    
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
        };

        // getting projects summary info and set opened fields
        function prepareData( dfd, _data ) {
            data = _data;
            var calendars = data.data.calendars;
            var employees = data.data.employees;

            employees.forEach( function( employee, index, thisArray ) {
                var projectsInfo = {};
                var ts = employee.timesheetDataModel;
                var calendarId = employee.calendarID;
                var calendar = calendars[ calendarId ];
                employee.opened = false;
                // getting projects summary info
                projectsInfo = projectInfoFactory.getProjectsInfo( ts, calendar );
                employee.projectInfoSummary = projectsInfo.summary;
                for( var projectId in employee.timesheetDataModel ) {
                    employee.timesheetDataModel[ projectId ].info.summary = projectsInfo[ projectId ];
                    employee.timesheetDataModel[ projectId ].info.opened  = false;
                }
            });
            prepareTableDaysData( dfd );
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
                                    if( !employee.timesheetDataModel[ projectId ].info.tables[ tableName ] ) {
                                        employee.timesheetDataModel[ projectId ].info.tables[ tableName ] = {};
                                        var newTable = employee.timesheetDataModel[ projectId ].info.tables[ tableName ];
                                        newTable.name = tableName;
                                        newTable.imputeType = imputeType;
                                        newTable.imputeSubType = imputeSubType;
                                        newTable.days = [];
                                        createTable( newTable );
                                    }
                                    var table     = employee.timesheetDataModel[ projectId ].info.tables[ tableName ];
                                    var value     = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].value;
                                    var status    = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].status;
                                    var isEnabled = status == 'sent' ? true : false;
                                    
                                    if( !employee.isPending && isEnabled ) employee.isPending = true;

                                    var currentDay = new Date( parseInt( day, 10 ) ).getDate();

                                    var dayToSet = table.days.find( function( dayObj ) {
                                        return dayObj.day == currentDay;
                                    });
                                    dayToSet.value   = value;
                                    dayToSet.status  = status;
                                    dayToSet.enabled = isEnabled;
                                    employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].enabled = isEnabled;
                                }
                            }
                        }
                    }
            });

            // insert standar days content for the new table
            function createTable( newTable ) {
                for( var day = 1; day <= mainOBJ.totalMonthDays; day++ ) {
                    var dayTimestamp = new Date( mainOBJ.currentYear, mainOBJ.currentMonth, day ).getTime();
                    newTable.days.push( { day : day, dayTimestamp : dayTimestamp, value : 0, approved : 'NA', enabled : false, status : 'draft' } );
                }
            }
            prepareDayType( dfd );
        }

        // setting 'dayType' of each day inside each table
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
                            var dayType = calendars[ calendarID ].eventHours[ 0 ].eventDates[ currentDay ].type;
                            day.dayType = dayType;
                        });
                    }
                }
            });

            return dfd.resolve( data.data.employees );
        }
    }

}());
