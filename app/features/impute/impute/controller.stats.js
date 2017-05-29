;( function () {
    // 'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursStatsController', imputeHoursStatsController );
    imputeHoursStatsController.$invoke = [ '$scope', 'projectInfoFactory' ];
    function imputeHoursStatsController( $scope, projectInfoFactory ) {

        var generalDataModel;
        // var millisecondsByDayType;
        var IMPUTETYPES;
        $scope.showStatsObj = {};

        $scope.$on( 'refreshStats', function( event, data ) {
            generalDataModel = data.generalDataModel;
            IMPUTETYPES = data.IMPUTETYPES;
            // if( !millisecondsByDayType ) getMillisecondsByDayType();
            buildStatsObj();
        });

        function buildStatsObj() {
            var temp            = {};
            temp.projectsInfo   = getProjectsInfo();
            temp.guardsInfo     = getguardsInfo();
            // temp.summary        = getsummary( temp.projectsInfo );
            temp.calendarInfo   = getcalendarInfo();
            $scope.showStatsObj = angular.copy( temp );
        }

        function getProjectsInfo() {
            var currentFirstDay  = $scope.showDaysObj.currentFirstDay;
            var calendar         = generalDataModel[ currentFirstDay ].calendar;
            var ts               = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var projectsInfoTemp = {};
            projectsInfoTemp = projectInfoFactory.getProjectsInfo2( ts, IMPUTETYPES, calendar, $scope.userProjects );

            // getting total of hours, guards and holidays in the current month by project
            // for( var projectId in ts ) {
            //     var projectName = '';
            //     var THI = 0;
            //     var THT = 0;
            //     var TJT = 0;
            //     var TJA = 0;
            //     var TJV = 0;
            //     var TJG = 0;

            //     if( !projectsInfoTemp[ projectId ] ) projectsInfoTemp[ projectId ] = {}; // creates projectId object
            //     for( var day in ts[ projectId ] ) { // throughting by each day of project
            //         for( var imputeType in ts[ projectId ][ day ] ) { // throughting by each imputeType of day
            //             for( var imputeSubType in ts[ projectId ][ day ][ imputeType ] ) { // throughting by each imputeSubType of imputeType
            //                 var imputeValue = ts[ projectId ][ day ][ imputeType ][ imputeSubType ].value; // getting value
            //                 if( imputeType == IMPUTETYPES.Horas || imputeType == IMPUTETYPES.Variables || imputeType == IMPUTETYPES.Ausencias ) {
            //                     THI += imputeValue;
            //                     if( imputeType == IMPUTETYPES.Ausencias ) {
            //                         TJA += dailyWorkCalculate( calendar, day, imputeType, imputeValue );
            //                     } else {
            //                         THT += imputeValue;
            //                         TJT += dailyWorkCalculate( calendar, day, imputeType, imputeValue );                                    
            //                     }
            //                 } else if ( imputeType == IMPUTETYPES.Guardias ) {
            //                         TJG += imputeValue;
            //                 } else if ( imputeType == IMPUTETYPES.Vacaciones ) {
            //                         TJV += imputeValue;
            //                 }
            //             }
            //         }
            //     }

            //     projectName = getProjectName( projectId ); // getting project name
            //     TJT = Number( TJT.toFixed( 1 ) ); // round to one decimal
            //     TJA = Number( TJA.toFixed( 1 ) ); // round to one decimal
            //     projectsInfoTemp[ projectId ].projectId   = projectId;
            //     projectsInfoTemp[ projectId ].projectName = projectName;
            //     projectsInfoTemp[ projectId ].THI = THI;
            //     projectsInfoTemp[ projectId ].THT = THT;
            //     projectsInfoTemp[ projectId ].TJT = TJT;
            //     projectsInfoTemp[ projectId ].TJA = TJA;
            //     projectsInfoTemp[ projectId ].TJG = TJG;
            //     projectsInfoTemp[ projectId ].TJV = TJV;
            // }//*****

            // function getProjectName( projectId ) {
            //     return $scope.userProjects.find( function( project ) {
            //         return project._id == projectId;
            //     }).nameToShow;
            // }

            // // calculates dailyWork according to dayType milliseconds and imputed-hours
            // function dailyWorkCalculate( calendar, day, imputeType, imputeValue ) {
            //     var dayType = '';
            //     var dayTypeMilliseconds = 0;
            //     // getting dayType acoording to day
            //     if( calendar.eventHours[0].eventDates[ day ] ) {
            //         dayType = calendar.eventHours[0].eventDates[ day ].type;
            //     }
            //     // getting dayType milliseconds
            //     if( millisecondsByDayType[ dayType ] ) dayTypeMilliseconds = millisecondsByDayType[ dayType ].milliseconds;
            //     // calculating dailyWork
            //     return calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  );
            // }

            // when one project has not info it does not exist so we create it and fill with zeros (for visual purposes)
            $scope.userProjects.forEach( function( project ) {
                if( !projectsInfoTemp[ project._id ] ) {
                    projectsInfoTemp[ project._id ] = {};
                    projectsInfoTemp[ project._id ].projectId   = project._id;
                    projectsInfoTemp[ project._id ].projectName = project.nameToShow;
                    projectsInfoTemp[ project._id ].THI = 0;
                    projectsInfoTemp[ project._id ].THT = 0;
                    projectsInfoTemp[ project._id ].TJT = 0;
                    projectsInfoTemp[ project._id ].TJA = 0;
                    projectsInfoTemp[ project._id ].TJG = 0;
                    projectsInfoTemp[ project._id ].TJV = 0;
                }
            });
            return projectsInfoTemp;
        }

        // RETURNS SUMMARY INFO. TOTAL IMPUTED HOURS, GUARDS AND DAILYWORK
        // function getsummary( projectsInfo ) {
        //     var totalTHI  = 0;
        //     var totalTHT  = 0;
        //     var totalTJT  = 0;
        //     var totalTJA  = 0;
        //     var totalTJV  = 0;
        //     var totalTJG  = 0;
        //     for( var project in projectsInfo ) {
        //         totalTHI  += projectsInfo[ project ].THI;
        //         totalTHT  += projectsInfo[ project ].THT;
        //         totalTJT  += projectsInfo[ project ].TJT;
        //         totalTJA  += projectsInfo[ project ].TJA;
        //         totalTJV  += projectsInfo[ project ].TJV;
        //         totalTJG  += projectsInfo[ project ].TJG;
        //     }
        //     return {
        //         totalTHI : totalTHI,
        //         totalTHT : totalTHT,
        //         totalTJT : totalTJT,
        //         totalTJA : totalTJA,
        //         totalTJV : totalTJV,
        //         totalTJG : totalTJG
        //     };
        // }

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
                                if( imputeSubType == '0' ) { // Turnicidad
                                    totalTurns   += imputeValue;
                                } else if ( imputeSubType == '1' ) { // Guardia
                                    totalGuards  += imputeValue;
                                } else if ( imputeSubType == '2' ) { // Varios
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
        // function getMillisecondsByDayType() {
        //     var currentFirstDay   = $scope.showDaysObj.currentFirstDay;
        //     var calendar          = generalDataModel[ currentFirstDay ].calendar;
        //     millisecondsByDayType = calendar.eventHours[0].totalPerType;
        // }

        // when user click on a project at Project summary table
        $scope.goToThisProject = function( projectId ) {
            $scope.$emit( 'goToThisProject', { projectId : projectId } );
        };

}
})();
