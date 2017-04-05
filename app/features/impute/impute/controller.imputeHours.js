;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'CalendarFactory', '$q' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, CalendarFactory, $q ) {

        // var months         = [ 'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic' ];
        var currentDate;
        $scope.weekViewMode = true; // week view mode 
        $scope.imputeTypes  = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel = $scope.imputeTypes[0];
        $scope.subtypes = $scope.imputeTypes[$scope.typesModel][0];
    	$scope.currentType = 'text';
    	$scope.imputeType = 'Horas';
    	$scope.days = [];
        $scope.currentWeek = 0;
        var calendarID = UserFactory.getcalendarID();
        var calendarScheme;

        var possibleValues = [ 6, 6.5, 7, 7.5, 8 ];
        for( var i = 1; i < 31; i++ ) {
            var random = Math.floor( ( Math.random() * 5 ) + 0 );
            // var random2 = Math.floor( ( Math.random() * 2 ) + 0 );
            // var showMe = ( random2 == 0 ) ? false : true;
            $scope.days.push( { day : new Date( 2017, 3, i ), value : possibleValues[ random ], showMe : false , desactive : false, calendarType : 'working' } );
        };
        Init();

        function completeDayWeeks() { // add days from previous and next month to view a complete 7-days-week
            var currentMonth = $scope.currentMonthData.currentMonth;
            var tempArray = [];
            $scope.currentMonthData.weeks[0].forEach( function( day ) { // days belong to previous month
                day = new Date( day );
                if( day.getMonth() != currentMonth ) {
                    var newDay = {
                            desactive : true,
                            day       : new Date( day ),
                            showMe    : false,
                            value     : 0
                    };
                    tempArray.push( newDay );
                }
            });
            $scope.days = tempArray.concat( $scope.days );
            $scope.currentMonthData.weeks[$scope.currentMonthData.weeks.length - 1].forEach( function( day ) {  // days belong to next month
                day = new Date( day );
                if( day.getMonth() != currentMonth ) {
                    var newDay = {
                            desactive : true,
                            day    : new Date( day ),
                            showMe : false,
                            value  : 0
                    };
                    $scope.days.push( newDay );
                }
            });
        }

        function Init( currentMonth, currentYear ) {
            if( !currentYear ) {
                var currentDate  = new Date();
                    currentMonth = currentDate.getMonth();
                    currentYear  = currentDate.getFullYear();
            }
            $scope.currentMonthData = imputeHoursFactory.getMonthWeeksObj( currentMonth, currentYear );

            var p1 = CalendarFactory.getCalendarByIdByMonth( calendarID, currentMonth, currentYear );
            // var p2 = CalendarFactory.getCalendarByIdByMonth( calendarID, 0, 2017 );

            $q.all( [ p1 ] )
                .then( function( data ) {
                    calendarScheme = data[0];
                    console.log( calendarScheme );
                    console.log( $scope.days );
                    completeDayWeeks();
                    refreshDays();

                })
                .catch( function( err ) {
                });

            // console.log( $scope.currentMonthData );
        }

    	$scope.imputeTypeChanged = function() {
	        $scope.subtypes = $scope.imputeTypes[$scope.typesModel][0];
	    	switch( $scope.typesModel ) {
			    case 'Horas':
	    			$scope.currentType = 'text';
			        break;
			    case 'Guardias':
	    			$scope.currentType = 'checkbox';
			        break;
			    case 'Variables':
	    			$scope.currentType = 'text';
			        break;
			}
		};
        $scope.monthWeekSwap = function() {
            $scope.weekViewMode = !$scope.weekViewMode;
        };
    	$scope.imputeSubTypeChanged = function() {
		};

        $scope.moveDate = function( moveTo ) {
            if( $scope.weekViewMode ) { // if week-mode
                if( moveTo > 0 ) {
                    $scope.currentWeek++;
                    if( $scope.currentWeek == $scope.currentMonthData.weeks.length  ) {
                        monthChange( +1 );
                        $scope.currentWeek = 0;
                    }
                } else {
                    $scope.currentWeek--;
                    if( $scope.currentWeek < 0 ) {
                        monthChange( -1 );
                        $scope.currentWeek = $scope.currentMonthData.weeks.length - 1;
                    }
                }
            } else { // if month-mode
                monthChange( moveTo );
            }            
            refreshDays();
            function monthChange( moveTo ) {
                var currentMonth = $scope.currentMonthData.currentMonth;
                var currentYear  = $scope.currentMonthData.currentYear;
                currentMonth += moveTo;
                Init( currentMonth, currentYear );
            }
        };

        function refreshDays() {
            $scope.days.forEach( function( day ) {
                day.showMe = false;
            });
            if( $scope.weekViewMode ) { // if week-mode
                $scope.currentMonthData.weeks[ $scope.currentWeek ].forEach( function( dayToShow ) {
                    dayToShow = new Date( dayToShow ).getTime();
                    activeDayToShow( dayToShow );
                });            
            } else { // if month-mode
                $scope.currentMonthData.weeks.forEach( function( week ) {
                    week.forEach( function( dayToShow ) {
                        dayToShow = new Date( dayToShow ).getTime();
                        activeDayToShow( dayToShow );
                    });
                });
            }
            function activeDayToShow( dayToShow ) {
                $scope.days.forEach( function( dayObj ) {
                    var day = new Date( dayObj.day ).getTime();
                    if( dayToShow == day ) {
                        dayObj.showMe = true;
                    }
                });   
            }
        }

    $scope.fn = function() {
        console.log( $scope.days );
        // refreshDays();
    }

}

})();































var obj = [
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Horas',
    subType : "Hora",
    date : '12-mar-2016',
    value : 8,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '15-mar-2016',
    value : 6,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Horas',
    subType : "Hora",
    date : '21-mar-2016',
    value : 8,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '30-mar-2016',
    value : 5,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Horas',
    subType : "Hora",
    date : '04-jun-2016',
    value : 8,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '05-jun-2016',
    value : 8,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '17-jun-2016',
    value : 8,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '22-jun-2016',
    value : 7,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
//*******
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '23-jun-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '24-jun-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '25-jun-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '26-jun-2016',
    value : 0,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Guardia",
    date : '27-jun-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Guardia",
    date : '28-jun-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Guardia",
    date : '29-jun-2016',
    value : 0,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '30-jun-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '01-jul-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '02-jul-2016',
    value : 1,
    status : 'Draft',
    desactive : false,
    calendarType : 'working'
}
];
