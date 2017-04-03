;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory ) {

        // var months         = [ 'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic' ];
        var currentDate;
        $scope.monthView   = false; // week view mode 
        $scope.imputeTypes = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel = $scope.imputeTypes[0];
        $scope.subtypes = $scope.imputeTypes[$scope.typesModel][0];
    	$scope.currentType = 'text';
    	$scope.imputeType = 'Horas';
    	$scope.days = [];
        $scope.puntero = 0;

        var possibleValues = [ 6, 6.5, 7, 7.5, 8 ];
        for( var i = 1; i < 31; i++ ) {
            var random = Math.floor( ( Math.random() * 5 ) + 0 );
            // var random2 = Math.floor( ( Math.random() * 2 ) + 0 );
            // var showMe = ( random2 == 0 ) ? false : true;
            // $scope.days.push( { day : i, value : possibleValues[ random ], showMe : showMe } );
            $scope.days.push( { day : new Date( 2017, 3, i ), value : possibleValues[ random ], showMe : false } );
            Init();
        };

        function Init( currentMonth, currentYear ) {
            // var currentMonth;
            // var currentYear;
            if( !currentYear ) {
                var currentDate = new Date();
                currentMonth = currentDate.getMonth();
                currentYear  = currentDate.getFullYear();
            }
            $scope.dataDate = imputeHoursFactory.getMonthWeeksObj( currentMonth, currentYear );
            // console.log( $scope.dataDate );
            // refreshDays();
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
            $scope.monthView = !$scope.monthView;
        };
    	$scope.imputeSubTypeChanged = function() {
		};

        $scope.moveDate = function( moveTo ) {
            if( moveTo > 0 ) {
                $scope.puntero++;
                if( $scope.puntero == $scope.dataDate.weeks.length  ) {
                    var currentMonth = $scope.dataDate.currentMonth;
                    var currentYear  = $scope.dataDate.currentYear;
                    currentMonth++;
                    Init( currentMonth, currentYear );
                    $scope.puntero = 0;
                }
            } else {
                $scope.puntero--;
                if( $scope.puntero < 0 ) {
                    var currentMonth = $scope.dataDate.currentMonth;
                    var currentYear  = $scope.dataDate.currentYear;
                    currentMonth--;
                    Init( currentMonth, currentYear );
                    $scope.puntero = $scope.dataDate.weeks.length - 1;
                }
            }
            refreshDays();
            // if( $scope.monthView ) {
            //     selectMonth( moveTo );
            // }
        };

        function refreshDays() {
            $scope.days.forEach( function( day ) {
                day.showMe = false;
            });

            $scope.dataDate.weeks[ $scope.puntero ].forEach( function( e ) {
                var ee = new Date( e );
                $scope.days.forEach( function( day ) {
                    // day.showMe = false;
                    var dd = new Date( day.day );
                    if( ee.getTime() == dd.getTime() ) {
                        day.showMe = true;
                    }
                });
            });
        }

        // function selectMonth( moveTo ) {
        //     if( currentDate ) {
        //         currentDate.setMonth( currentDate.getMonth() + moveTo ); 
        //     } else {
        //         currentDate = new Date();
        //         currentDate = new Date( currentDate.getFullYear(), currentDate.getMonth(), 1 );
        //     }
        //     $scope.currentMonth = currentDate.getMonth();
        //     $scope.currentYear  = currentDate.getFullYear();
        //     // var weeks = getMonthWeeks( $scope.currentMonth, $scope.currentYear );
        //     // console.log( weeks );
        //     // console.log( obj );
        // }
        // selectMonth();

    $scope.fn = function() {
        // console.log( $scope.days );
        refreshDays();
    }

}

})();

    // function getMonthWeeks( month, year ) {
    //     var weeks = [],
    //         firstDate = new Date( year, month, 1 ),
    //         lastDay  = new Date( year, month + 1, 0 ),
    //         numDays   = lastDay.getDate(),
    //         start     = 1,
    //         end       = 8 - firstDate.getDay();
    //    while( start <= numDays ){
    //        weeks.push( { start : start, end : end } );
    //        start = end + 1;
    //        end = end + 7;
    //        if( end > numDays ) end = numDays;
    //    }
    //     return weeks;
    // }































var obj = [
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Horas',
    subType : "Hora",
    date : '12-mar-2016',
    value : 8,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '15-mar-2016',
    value : 6,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Horas',
    subType : "Hora",
    date : '21-mar-2016',
    value : 8,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '30-mar-2016',
    value : 5,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Horas',
    subType : "Hora",
    date : '04-jun-2016',
    value : 8,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '05-jun-2016',
    value : 8,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '17-jun-2016',
    value : 8,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Horas',
    subType : "Hora",
    date : '22-jun-2016',
    value : 7,
    status : 'Draft'
},
//*******
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '23-jun-2016',
    value : 1,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '24-jun-2016',
    value : 1,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '25-jun-2016',
    value : 1,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '26-jun-2016',
    value : 0,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Guardia",
    date : '27-jun-2016',
    value : 1,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Guardia",
    date : '28-jun-2016',
    value : 1,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Guardia",
    date : '29-jun-2016',
    value : 0,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-1',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '30-jun-2016',
    value : 1,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '01-jul-2016',
    value : 1,
    status : 'Draft'
},
{
    employee : '58dd07eecbcb6303e41ef404',
    project : 'PRO-2',
    type : 'Guardias',
    subType : "Turnicidad",
    date : '02-jul-2016',
    value : 1,
    status : 'Draft'
}
];
