;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'CalendarFactory', '$q', 'userProjects' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, CalendarFactory, $q, userProjects ) {


// show user projects
$scope.userProjects = angular.copy( userProjects );
$scope.projectModel = $scope.userProjects[0];

        var currentDate  = new Date();
        var currentMonth = currentDate.getMonth();
        var currentYear  = currentDate.getFullYear();
        $scope.imputeTypes  = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel    = $scope.imputeTypes[0];
        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];
        $scope.weekViewMode  = true;

        // $scope.imputeType = 'Horas'; // ???????????????????????

        var calendarID = UserFactory.getcalendarID();
        var calendarScheme;

        Init();
        // getTimesheets();

        // function completeDayWeeks() { // add days from previous and next month to complete a 7-days-week view
        //     var currentMonth = $scope.currentMonthData.currentMonth;
        //     var tempArray = [];
        //     $scope.currentMonthData.weeks[0].forEach( function( day ) { // days belong to previous month
        //         day = new Date( day );
        //         if( day.getMonth() != currentMonth ) {
        //             var newDay = {
        //                     desactive : true,
        //                     day       : new Date( day ),
        //                     showMe    : false,
        //                     value     : 0
        //             };
        //             tempArray.push( newDay );
        //         }
        //     });
        //     $scope.days = tempArray.concat( $scope.days );
        //     $scope.currentMonthData.weeks[$scope.currentMonthData.weeks.length - 1].forEach( function( day ) {  // days belong to next month
        //         day = new Date( day );
        //         if( day.getMonth() != currentMonth ) {
        //             var newDay = {
        //                     desactive : true,
        //                     day    : new Date( day ),
        //                     showMe : false,
        //                     value  : 0
        //             };
        //             $scope.days.push( newDay );
        //         }
        //     });
        // }

        function getTimesheets() {
            // var projectId = $scope.projectModel._id;
            imputeHoursFactory.getTimesheets( currentYear, currentMonth )
                .then( function( data ) {
                    console.log( data.data );
                    // calendarScheme = data[0];
                    // completeDayWeeks();
                    // refreshShowDaysObj();

                })
                .catch( function( err ) {
                });
        }

        function Init() {
            getShowDaysObj();
            getTimesheets();

            // var p1 = CalendarFactory.getCalendarById( calendarID, currentYear, currentMonth );
            // var p2 = CalendarFactory.getCalendarById( calendarID, 2016 );
            // $q.all( [ p1, p2 ] )
            //     .then( function( data ) {
            //         // calendarScheme = data[0];
            //         // completeDayWeeks();
            //         // refreshShowDaysObj();

            //     })
            //     .catch( function( err ) {
            //     });
        }

        function getShowDaysObj() {
            $scope.showDaysObj = imputeHoursFactory.getShowDaysObj( currentMonth, currentYear );
            // console.log( $scope.showDaysObj );
        }

        $scope.projectChanged = function() {            
            getTimesheets();
        };
    	$scope.imputeTypeChanged = function() {
	        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];
	  //   	switch( $scope.typesModel ) {
			//     case 'Horas':
	  //   			$scope.currentType = 'text';
			//         break;
			//     case 'Guardias':
	  //   			$scope.currentType = 'checkbox';
			//         break;
			//     case 'Variables':
	  //   			$scope.currentType = 'text';
			//         break;
			// }
		};
        $scope.monthWeekViewSwap = function() {
            $scope.weekViewMode = !$scope.weekViewMode;
        };
    	$scope.imputeSubTypeChanged = function() {
		};

        $scope.moveDate = function( moveTo ) {
            // var currentWeekAtFirst;
            if( $scope.weekViewMode ) { // if week-mode
                if( moveTo > 0 ) {
                    $scope.showDaysObj.currentWeek++;
                    if( $scope.showDaysObj.currentWeek > $scope.showDaysObj.totalMonthWeeks ) {
                        monthChange( +1 );
                        $scope.showDaysObj.currentWeek = 0;
                    }
                } else {
                    $scope.showDaysObj.currentWeek--;
                    if( $scope.showDaysObj.currentWeek < 0 ) {
                        monthChange( -1 );
                        $scope.showDaysObj.currentWeek = $scope.showDaysObj.totalMonthWeeks;
                    }
                }
            } else { // if month-mode
                monthChange( moveTo );
            }

            // refreshShowDaysObj();
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
                refreshShowDaysObj();
            }


        };

        function refreshShowDaysObj() {
            // console.log( '*********** refreshShowDaysObj ***********' );
            // console.log( 'typesModel ' + $scope.typesModel );
            // console.log( 'subtypesModel ' + $scope.subtypesModel );
            // console.log( 'projectModel ' + $scope.projectModel._id );



            // $scope.days.forEach( function( day ) {
            //     day.showMe = false;
            // });
            // if( $scope.weekViewMode ) { // if week-mode
            //     $scope.currentMonthData.weeks[ $scope.currentWeek ].forEach( function( dayToShow ) {
            //         dayToShow = new Date( dayToShow ).getTime();
            //         activeDayToShow( dayToShow );
            //     });            
            // } else { // if month-mode
            //     $scope.currentMonthData.weeks.forEach( function( week ) {
            //         week.forEach( function( dayToShow ) {
            //             dayToShow = new Date( dayToShow ).getTime();
            //             activeDayToShow( dayToShow );
            //         });
            //     });
            // }
            // function activeDayToShow( dayToShow ) {
            //     $scope.days.forEach( function( dayObj ) {
            //         var day = new Date( dayObj.day ).getTime();
            //         if( dayToShow == day ) {
            //             dayObj.showMe = true;
            //         }
            //     });   
            // }
        } // refreshShowDaysObj()


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
