;( function () {
    // 'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursStatsController', imputeHoursStatsController );
    imputeHoursStatsController.$invoke = [ '$scope', 'projectInfoFactory' ];
    function imputeHoursStatsController( $scope, projectInfoFactory ) {

        var generalDataModel;
        var IMPUTETYPES;
        $scope.showStatsObj = {};

        $scope.$on( 'refreshStats', function( event, data ) {
            generalDataModel = data.generalDataModel;
            IMPUTETYPES = data.IMPUTETYPES;
            buildStatsObj();
        });

        function buildStatsObj() {
            var temp            = {};
            temp.projectsInfo   = getProjectsInfo();
            temp.guardsInfo     = getguardsInfo();
            temp.calendarInfo   = getcalendarInfo();
            $scope.showStatsObj = angular.copy( temp );
        }

        function getProjectsInfo() {
            var currentFirstDay  = $scope.showDaysObj.currentFirstDay;
            var calendar         = generalDataModel[ currentFirstDay ].calendar;
            var ts               = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var projectsInfo     = projectInfoFactory.getProjectsInfo( ts, calendar, $scope.userProjects );

            // when one project has not info it does not exist so, we create it and fill with zeros (for visual purposes)
            $scope.userProjects.forEach( function( project ) {
                if( !projectsInfo.projects[ project._id ] ) {
                    projectsInfo.projects[ project._id ] = {};
                    projectsInfo.projects[ project._id ].projectId   = project._id;
                    projectsInfo.projects[ project._id ].projectName = project.nameToShow;
                    projectsInfo.projects[ project._id ].THI = 0;
                    projectsInfo.projects[ project._id ].THT = 0;
                    projectsInfo.projects[ project._id ].TJT = 0;
                    projectsInfo.projects[ project._id ].TJA = 0;
                    projectsInfo.projects[ project._id ].TJG = 0;
                    projectsInfo.projects[ project._id ].TJV = 0;
                }
            });

            return projectsInfo;
        }

        // RETURNS TOTAL OF WORKING HOURS OF CURRENT MONTH AND DAILYWORK
        function getcalendarInfo() {
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var currentMonth    = new Date( parseInt( currentFirstDay ) ).getMonth();
            var calendar        = generalDataModel[ currentFirstDay ].calendar;
            var totalTHTmonth   = 0;
            var totalTJTmonth   = 0;
            totalTHTmonth  = calendar.eventHours[0].totalWorkingHours[ currentMonth ].milliseconds;
            totalTHTmonth /= 3600000;
            totalTHTmonth  = Number( totalTHTmonth.toFixed( 1 ) );
            for( var day in calendar.eventHours[0].eventDates ) {
                var thisDayType = calendar.eventHours[0].eventDates[ day ].type;
                if( thisDayType != 'holidays' && thisDayType != 'non_working' ) {
                    totalTJTmonth++;
                }
            }
            return { 
                totalTHTmonth : totalTHTmonth,
                totalTJTmonth : totalTJTmonth
            };
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
                            if( imputeType == IMPUTETYPES.Guardias ) {
                                if( imputeSubType == '0' ) { // Guardias.Turnicidad
                                    totalTurns   += imputeValue;
                                } else if ( imputeSubType == '1' ) { // Guardias.Guardia
                                    totalGuards  += imputeValue;
                                } else if ( imputeSubType == '2' ) { // Guardias.Varios
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

        // when user click over a project at Project summary table
        $scope.goToThisProject = function( projectId ) {
            $scope.$emit( 'goToThisProject', { projectId : projectId } );
        };

}
})();
