;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursStatsController', imputeHoursStatsController );
    imputeHoursStatsController.$invoke = [ '$scope' ];
    function imputeHoursStatsController( $scope ) {

        var generalDataModel;
        var millisecondsByType;
        $scope.showStatsObj = {};

        $scope.$on( 'refreshStats', function( event, data ) {
            generalDataModel = data.generalDataModel;
            if( !millisecondsByType ) getMillisecondsByType();
            buildStatsObj();
        });

        function buildStatsObj() {
            var temp            = {};
            temp.projectsInfo   = getProjectsInfo();
            temp.guardsInfo     = getguardsInfo();
            temp.summary        = getsummary( temp.projectsInfo );
            temp.calendarInfo   = getcalendarInfo();
            $scope.showStatsObj = angular.copy( temp );
        }

        function getProjectsInfo() {
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var projectsInfoTemp = {};

            // getting total of hours and guards in the current month by project
            for( var projectId in ts ) {
                var projectName = '';
                var totalGuards = 0;
                var totalHours  = 0;
                var dailyWork   = 0;
                if( !projectsInfoTemp[ projectId ] ) projectsInfoTemp[ projectId ] = {};
                for( var day in ts[ projectId ] ) {
                    for( var imputeType in ts[ projectId ][ day ] ) {
                        for( var imputeSubType in ts[ projectId ][ day ][ imputeType ] ) {
                            // accumulating totalGuards, totalHours and dailyWork
                            var imputeValue = ts[ projectId ][ day ][ imputeType ][ imputeSubType ].value; // getting value
                            dailyWork += dailyWorkCalculate( day, imputeType, imputeValue ); // calculating dailyWork
                            if( imputeType == 'Guardias' ) {
                                totalGuards += imputeValue;
                            } else {
                                totalHours  += imputeValue;
                            }
                        }
                    }
                }
                // getting project name
                projectName = getProjectName( projectId );
                dailyWork = Number( dailyWork.toFixed( 1 ) ); // round 'dailyWork' to one decimal
                // stores values into 'projectsInfoTemp'
                projectsInfoTemp[ projectId ].totalGuards = totalGuards;
                projectsInfoTemp[ projectId ].totalHours  = totalHours;
                projectsInfoTemp[ projectId ].dailyWork   = dailyWork;
                projectsInfoTemp[ projectId ].projectName = projectName;
            }

            function getProjectName( projectId ) {
                return $scope.userProjects.find( function( project ) {
                    return project._id == projectId;
                }).name;
            }

            // calculates dailyWork according to dayType milliseconds and imputed-hours
            function dailyWorkCalculate( day, imputeType, imputeValue ) {
                var currentFirstDay = $scope.showDaysObj.currentFirstDay;
                var calendar        = generalDataModel[ currentFirstDay ].calendar;
                var dailyWork = 0;
                var dayType = '';
                var dayTypeMilliseconds = 0;
                // getting dayType acoording to day            
                if( calendar.eventHours[0].eventDates[ day ] ) {
                    dayType = calendar.eventHours[0].eventDates[ day ].type;
                }
                // getting dayType milliseconds
                if( millisecondsByType[ dayType ] ) dayTypeMilliseconds = millisecondsByType[ dayType ].milliseconds;
                // calculating dailyWork
                if( dayTypeMilliseconds != 0 ) { // if no milliseconds (holiday or non-working), no dailyWork is computed
                    if( imputeType == 'Guardias' ) {
                        dailyWork = imputeValue; 
                    } else {
                        var imputedMilliseconds = ( imputeValue * 3600000 );
                        dailyWork = ( imputedMilliseconds / dayTypeMilliseconds );
                    }
                }
                return dailyWork;
            }
            // when one project has not info it does not exist so we create it and fill with zeros (for visual purposes)
            $scope.userProjects.forEach( function( project ) {
                if( !projectsInfoTemp[ project._id ] ) {
                    projectsInfoTemp[ project._id ] = {};
                    projectsInfoTemp[ project._id ].dailyWork   = 0;
                    projectsInfoTemp[ project._id ].totalGuards = 0;
                    projectsInfoTemp[ project._id ].totalHours  = 0;
                    projectsInfoTemp[ project._id ].projectName = project.name;
                }
            });
            return projectsInfoTemp;
        }

        // RETURNS SUMMARY INFO. TOTAL IMPUTED HOURS, GUARDS AND DAILYWORK
        function getsummary( projectsInfo ) {
            var totalImputeHours  = 0;
            var totalImputeGuards = 0;
            var totalDailyWork    = 0;
            for( var project in projectsInfo ) {
                totalImputeHours  += projectsInfo[project].totalHours;
                totalImputeGuards += projectsInfo[project].totalGuards;
                totalDailyWork    += projectsInfo[project].dailyWork;
            }
            return {
                totalImputeHours  : totalImputeHours,
                totalImputeGuards : totalImputeGuards,
                totalDailyWork    : Number( totalDailyWork.toFixed( 1 ) )
            };
        }

        // RETURNS TOTAL OF HOURS OF CURRENT MONTH
        function getcalendarInfo() {
            var currentFirstDay   = $scope.showDaysObj.currentFirstDay;
            var currentMonth      = new Date( parseInt( currentFirstDay ) ).getMonth();
            var calendar          = generalDataModel[ currentFirstDay ].calendar;
            var totalHoursByMonth = 0;
            totalHoursByMonth     = calendar.eventHours[0].totalWorkingHours[ currentMonth ].milliseconds;
            totalHoursByMonth    /= 3600000;
            totalHoursByMonth     = Number( totalHoursByMonth.toFixed( 1 ) );
            return { totalHoursByMonth : totalHoursByMonth };
        }

        // RETURNS TOTAL OF GUARDS ACCORDING TO EACH TYPE
        function getguardsInfo() {
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var totalTurns   = 0;
            var totalGuards  = 0;
            var totalVarious = 0;
            // getting total of guards accoding of its subType by project
            for( var projectId in ts ) {
                for( var day in ts[ projectId ] ) {
                    for( var imputeType in ts[ projectId ][ day ] ) {
                        for( var imputeSubType in ts[ projectId ][ day ][ imputeType ] ) {
                            var imputeValue = ts[ projectId ][ day ][ imputeType ][ imputeSubType ].value; // getting value
                            if( imputeType == 'Guardias' ) {
                                if( imputeSubType == 'Turnicidad' ) {
                                    totalTurns   += imputeValue;
                                } else if ( imputeSubType == 'Guardia' ) {
                                    totalGuards  += imputeValue;
                                } else if ( imputeSubType == 'Varios' ) {
                                    totalVarious += imputeValue;
                                }
                            }
                        }
                    }
                }
            }
            return {
                    totalTurns   : totalTurns,
                    totalGuards  : totalGuards,
                    totalVarious : totalVarious
            };

        }

        // stores dailywork dayType milliseconds
        function getMillisecondsByType() {
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var calendar        = generalDataModel[ currentFirstDay ].calendar;
            millisecondsByType  = calendar.eventHours[0].totalPerType;
        }

}
})();
