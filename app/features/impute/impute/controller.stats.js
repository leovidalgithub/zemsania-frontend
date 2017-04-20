;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursStatsController', imputeHoursStatsController );
    imputeHoursStatsController.$invoke = [ '$scope' ];
    function imputeHoursStatsController( $scope ) {

        var generalDataModel;
        $scope.$on( 'refreshStats', function( event, data ) {
            generalDataModel = data.generalDataModel;
            // $( '#imputeHours #section' ).animate( { scrollTop: 300 }, 'slow' );
            buildStatsObj();
            // console.log(generalDataModel);
            // console.log($scope.showStatsObj);
        });

        function buildStatsObj() {
            $scope.showStatsObj = {};
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;
            // getting total of hours and guards in the current month by project
            var jornadas = 0;
            for( var projectId in ts ) {
                var totalGuards = 0;
                var totalHours  = 0;
                if( !$scope.showStatsObj[projectId] ) $scope.showStatsObj[projectId] = {};
                for( var day in ts[projectId] ) {

                    var dailyWorkHours = getDailyWorkHours( day ); // in milliseconds


                    for( var type in ts[projectId][day] ) {
                        for( var subType in ts[projectId][day][type] ) {
                            var value = ts[projectId][day][type][subType].value;

                            if( type == 'Guardias' ) {
                                totalGuards += value;
                                jornadas += dailyWorkCalculate( dailyWorkHours, value );
                            } else {
                                totalHours  += value;
                                jornadas += dailyWorkCalculate( dailyWorkHours, value );
                            }

                        }
                    }                
                }
                $scope.showStatsObj[projectId].totalGuards = totalGuards;
                $scope.showStatsObj[projectId].totalHours  = totalHours;
            }
            // getting project name
            $scope.userProjects.forEach( function( project ) {
                if( $scope.showStatsObj[project._id] ) {
                    $scope.showStatsObj[project._id].name  = project.name;
                }
            });
            // console.log($scope.showStatsObj);
            // getDailyWorkHours( new Date(2017,3,5,0,0,0,0).getTime() );

        }

        function getDailyWorkHours( day ) { // returns daily work hours (in milliseconds) by day received
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var calendar        = generalDataModel[ currentFirstDay ].calendar;
            var dayType = '';
            var milliseconds = 0;
            if( calendar.eventHours[0].eventDates[ day ] ) {
                dayType = calendar.eventHours[0].eventDates[ day ].type;
                if( calendar.eventHours[0].totalPerType[ dayType ] ) {
                    milliseconds = calendar.eventHours[0].totalPerType[ dayType ].milliseconds;
                }
            }
            return milliseconds;
        }


        function dailyWorkCalculate( dailyWorkHours, value ) {
            // console.log(dailyWorkHours + ' ' + value);
        }

}
})();
