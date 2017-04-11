;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'CalendarFactory', '$q', 'userProjects' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, CalendarFactory, $q, userProjects ) {

        var currentFirstDay  = new Date();
        var currentMonth = currentFirstDay.getMonth();
        var currentYear  = currentFirstDay.getFullYear();
        var calendarID   = UserFactory.getcalendarID();
        var generalDataModel = {};
        $scope.weekViewMode  = true;
        // IMPUTE TYPES AND SUBTYPES
        $scope.imputeTypes                = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel    = $scope.imputeTypes[0];
        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];
        // USER PROJECTS
        $scope.userProjects = angular.copy( userProjects );
        $scope.projectModel = $scope.userProjects[0];

        Init();

        function Init() {
            $scope.showDaysObj  = imputeHoursFactory.getShowDaysObj( currentMonth, currentYear );
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            if( generalDataModel[ currentFirstDay ] ) { // if that month and year already exists in 'generalDataModel', do not find anything
                refreshShowDaysObj();
                return;
            }
            var calendarPromise   = CalendarFactory.getCalendarById( calendarID, currentYear, currentMonth );
            var timeSheetsPromise = imputeHoursFactory.getTimesheets( currentYear, currentMonth );
            $q.all( [ calendarPromise, timeSheetsPromise ] )
                .then( function( data ) {
                    var calendar = data[0];
                    var timesheetDataModel = data[1].data.timesheetDataModel;
                    if( !generalDataModel[ currentFirstDay ] ) generalDataModel[ currentFirstDay ] = {};
                    generalDataModel[ currentFirstDay ] = {
                                                        date               : currentFirstDay,
                                                        calendar           : calendar,
                                                        timesheetDataModel : timesheetDataModel
                                                      };
                })
                .catch( function( err ) {
                })
                .finally( function() {
                    refreshShowDaysObj();
                });
        }

        $scope.projectChanged = function() {            
            refreshShowDaysObj();
        };
        $scope.imputeTypeChanged = function() {
            $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];
            refreshShowDaysObj();
        };
        $scope.imputeSubTypeChanged = function() {
            refreshShowDaysObj();
		};
        $scope.monthWeekViewSwap = function() {
            $scope.weekViewMode = !$scope.weekViewMode;
        };

        $scope.moveDate = function( moveTo ) {
            if( $scope.weekViewMode ) { // if week-mode
                $scope.showDaysObj.currentWeek += moveTo;
                if( $scope.showDaysObj.currentWeek > $scope.showDaysObj.totalMonthWeeks ) {
                    monthChange( moveTo );
                    $scope.showDaysObj.currentWeek = 0;
                }
                if( $scope.showDaysObj.currentWeek < 0 ) {
                    monthChange( moveTo );
                    $scope.showDaysObj.currentWeek = $scope.showDaysObj.totalMonthWeeks;
                }
            } else { // if month-mode
                monthChange( moveTo );
            }
            function monthChange( moveTo ) {
                currentMonth += moveTo;
                if( currentMonth > 11 ) {
                    currentMonth = 0;
                    currentYear  += moveTo;
                }
                if( currentMonth < 0 ) {
                    currentMonth = 11;
                    currentYear  += moveTo;
                }
                Init();
            }
        };

        function refreshShowDaysObj() {
            var currentType     = $scope.typesModel;
            var currentSubType  = $scope.subtypesModel;
            var currentProject  = $scope.projectModel._id; 
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;          
            var currentLastDay  = $scope.showDaysObj.currentLastDay;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;

            for( var day = 1; day < currentLastDay.getDate() + 1; day++ ) {
                var thisDate = new Date( currentYear, currentMonth, day );
// console.log('day ' + thisDate.getDate());

                // CALENDAR DAY TYPE (working, holidays, etc.)
                var dayType = '';
                if( generalDataModel[ currentFirstDay ].calendar.eventHours[0].eventDates[ thisDate ] ) {
                    dayType = generalDataModel[ currentFirstDay ].calendar.eventHours[0].eventDates[ thisDate ].type;
                };

                // TIMESHEET VALUE
                var value = 0;
                if( ts[ currentProject ] ) {
                    if( ts[ currentProject ][ thisDate ] ) {
                        if( ts[ currentProject ][ thisDate ][ currentType ] ) {
                            if( ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ] ) {
                                value = ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value;
                            }
                        }
                    }
                }
                if( $scope.showDaysObj.days[ thisDate ] ) {
                    $scope.showDaysObj.days[ thisDate ].dayType = dayType;
                    $scope.showDaysObj.days[ thisDate ].value   = value;
                }

                // INPUT TYPE
                if( currentType == 'Guardias' ) {
                    $scope.showDaysObj.days[ thisDate ].inputType = 'checkbox';
                } else {
                    $scope.showDaysObj.days[ thisDate ].inputType = 'text';
                }


            }
        }

    $scope.fn = function() {
        console.log( generalDataModel );
        // for( var day in $scope.showDaysObj.days ) {
        //     // console.log('day ' + $scope.showDaysObj.days[day].day.getDate() + ' input ' + $scope.showDaysObj.days[day].inputType + ' value ' + $scope.showDaysObj.days[day].value );
        //     $scope.showDaysObj.days[day].value = 1;
        // };
    };
    $scope.fn2 = function() {
        for( var day in $scope.showDaysObj.days ) {
            // console.log('day ' + $scope.showDaysObj.days[day].day.getDate() + ' input ' + $scope.showDaysObj.days[day].inputType + ' value ' + $scope.showDaysObj.days[day].value );
            $scope.showDaysObj.days[day].value = 0;
        };
    };

    $scope.checkedFunction = function(xx){
        if( xx ) {
            // console.log('true');
            return true;
        } else {
            // console.log('false');
            return false;
        }
    };

}

})();































// var testingObj = [
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-1',
//     type : 'Horas',
//     subType : "Hora",
//     date : '12-mar-2016',
//     value : 8,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Horas',
//     subType : "Hora",
//     date : '15-mar-2016',
//     value : 6,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-1',
//     type : 'Horas',
//     subType : "Hora",
//     date : '21-mar-2016',
//     value : 8,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Horas',
//     subType : "Hora",
//     date : '30-mar-2016',
//     value : 5,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-1',
//     type : 'Horas',
//     subType : "Hora",
//     date : '04-jun-2016',
//     value : 8,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Horas',
//     subType : "Hora",
//     date : '05-jun-2016',
//     value : 8,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Horas',
//     subType : "Hora",
//     date : '17-jun-2016',
//     value : 8,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Horas',
//     subType : "Hora",
//     date : '22-jun-2016',
//     value : 7,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// //*******
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Turnicidad",
//     date : '23-jun-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-1',
//     type : 'Guardias',
//     subType : "Turnicidad",
//     date : '24-jun-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Turnicidad",
//     date : '25-jun-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Turnicidad",
//     date : '26-jun-2016',
//     value : 0,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Guardia",
//     date : '27-jun-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Guardia",
//     date : '28-jun-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Guardia",
//     date : '29-jun-2016',
//     value : 0,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-1',
//     type : 'Guardias',
//     subType : "Turnicidad",
//     date : '30-jun-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Turnicidad",
//     date : '01-jul-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// },
// {
//     employee : '58dd07eecbcb6303e41ef404',
//     project : 'PRO-2',
//     type : 'Guardias',
//     subType : "Turnicidad",
//     date : '02-jul-2016',
//     value : 1,
//     status : 'Draft',
//     desactive : false,
//     calendarType : 'working'
// }
// ];
