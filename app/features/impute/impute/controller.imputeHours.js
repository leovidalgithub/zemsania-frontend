;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'CalendarFactory', '$q', 'userProjects', '$uibModal', '$rootScope' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, CalendarFactory, $q, userProjects, $uibModal, $rootScope ) {

        // $scope.myJSON = [
        //                     {name : 'yyy',age: 1},
        //                     {name : 'xxx',age: 2},
        //                     {name : 'ddd',age: 3},
        //                     {name : 'zzz',age: 4},
        //                     {name : 'ttt',age: 5},
        //                     {name : 'uuu',age: 6}
        // ];

        var currentFirstDay  = new Date();
        var currentMonth = currentFirstDay.getMonth();
        var currentYear  = currentFirstDay.getFullYear();
        var calendarID   = UserFactory.getcalendarID();
        var generalDataModel = {};
        $scope.weekViewMode  = true;

// FALSE FALSE FALSE FALSE FALSE FALSE FALSE FALSE FALSE FALSE FALSE FALSE 
        $scope.pendingChanges = true;


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
                // CALENDAR DAYTYPE (working, holidays, etc.)
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
                    $scope.showDaysObj.days[ thisDate ].checkValue = $scope.showDaysObj.days[ thisDate ].value == 0 ? false : true;
                } else {
                    $scope.showDaysObj.days[ thisDate ].inputType = 'text';
                }
            }
        }

        $scope.inputChanged = function( value ) {
            // console.log('****************--');
            // console.log( 'd ' + value.day.getDate() + ' v ' + value.value + ' check ' + value.checkValue );
            $scope.pendingChanges = true;
            var currentType     = $scope.typesModel;
            var currentSubType  = $scope.subtypesModel;
            var currentProject  = $scope.projectModel._id; 
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;          
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var thisDate        = value.day;

            // creating associative data if it not exists
            if( !ts[ currentProject ] ) ts[ currentProject ] = {};
            if( !ts[ currentProject ][ thisDate ] ) ts[ currentProject ][ thisDate ] = {};
            if( !ts[ currentProject ][ thisDate ][ currentType ] ) ts[ currentProject ][ thisDate ][ currentType ] = {};
            if( !ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ] ) ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ] = {};

            //storing values
            if( currentType == 'Guardias' ) {
                var newValue = value.checkValue ? 1 : 0;
                ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value = newValue;    
            } else {
                ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value = value.value;    
            }
            ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].status   = 'draft';
            ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].modified = true;

            // console.log(ts[ currentProject ]);

        };

        $scope.save= function() {
            var data = []; // to send an array of just 'timesheetDataModel' objects
            for( var date in generalDataModel ) {
                data.push( generalDataModel[ date ].timesheetDataModel );
            }            
            imputeHoursFactory.setAllTimesheets( data )
                .then( function( data ) {
                    console.log('saved!');
                    console.log( data );
                })
                .catch( function( err ) {
                });
        };

        // $scope.fn = function() {
        //     $('#pepe').modal({
        //           keyboard: false
        //     });

        // $( '#quantityModal' ).modal( 'show' );
        // var currentFirstDay = $scope.showDaysObj.currentFirstDay;          
        // var ts = generalDataModel[ currentFirstDay ].timesheetDataModel;
        // for( var proId in ts ) {
        //     for ( var day in ts[ proId ] ) {
        //         for ( var type in ts[ proId ][day] ) {
        //             for ( var subType in ts[ proId ][day][type] ) {
        //                 if( ts[ proId ][day][type][subType].modified ) {
        //                     console.log( '----------------' );
        //                     console.log( proId );
        //                     console.log( day );
        //                     console.log( type );                    
        //                     console.log( subType );
        //                     console.log( 'value    = ' + ts[ proId ][day][type][subType].value);
        //                     console.log( 'status   = ' + ts[ proId ][day][type][subType].status);
        //                     // console.log( 'modified = ' + ts[ proId ][day][type][subType].modified);
        //                 }
        //             }
        //         }
        //     }
        // }

    // };

    // $scope.checkedFunction = function( value ) { // it is necessary in order to checked or unchecked inputs dynamically
    //     return value ? true : false;
    // };

        // $scope.$watch( 'generalDataModel' , function ( newVal, oldVal ) { // watch for $scope.products set and properties changes
        //     console.log('changed!');
        // }, true );
// **************************************************** *****************************************************
// **************************************************** *****************************************************

$scope.fn = function() {
    openPendingChangesModal();
};

$rootScope.$on('modalClosed', function (event, data) {
    $scope.save();
});

        function openPendingChangesModal() {
            var modalPendingChangesInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: '/features/impute/modals/pendingChangesModal.tpl.html',
            controller: function($scope, $uibModalInstance,$rootScope) {
                $scope.cancel = function() {
                    $uibModalInstance.close();
                };
                $scope.save = function() {
                    $uibModalInstance.close();
                    $rootScope.$emit( 'modalClosed', 'Modal has been closed to saved data');
                };
            },
            backdrop: 'static',
            size: 'md'
            }); //*****************
        }

// **************************************************** *****************************************************
// **************************************************** *****************************************************
}

})();






// $scope.$watch( 'products' , function ( newVal, oldVal ) { // watch for $scope.products set and properties changes
//         if ( !newVal ) return;
//         $scope.pendingChanges = $scope.products.some( function( element, index ) {
//             return ( element.action !== '' ); // ( element.action && element.action != '' )
//         });
//         $scope.productsSelected = $scope.products.filter( function ( element ) {
//             return element.selected;
//         }).length;
//     }, true );






// $scope.$watch( function( $scope ) { // just watch for $scope.products.action
//      if ( !$scope.products ) return;
//      return $scope.products.map( function( obj ) { return obj.action } );
//      }, function ( newVal, oldVal ) {
//          if ( !newVal ) return;
//          $scope.pendingChanges = $scope.products.some( function( element, index ) {
//              return ( element.action && element.action != '' );
//          });
//     }, true);











