;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'CalendarFactory', '$q', 'userProjects', '$uibModal', '$rootScope', '$state' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, CalendarFactory, $q, userProjects, $uibModal, $rootScope, $state ) {

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
        var goToState = null;
        var generalDataModel = {};
        $scope.changes = {};
        $scope.changes.pendingChanges = false;
        $scope.changes.originalGeneralDataModel = {}; // to get back pending changes
        $scope.weekViewMode  = true;

        // IMPUTE TYPES AND SUBTYPES
        $scope.imputeTypes                = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel    = $scope.imputeTypes[0];
        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];
        // USER PROJECTS
        $scope.userProjects = userProjects;
        $scope.projectModel = $scope.userProjects[0];

        Init();

        function Init() {
            $scope.showDaysObj  = imputeHoursFactory.getShowDaysObj( currentMonth, currentYear );
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            if( generalDataModel[ currentFirstDay ] ) { // if that month and year already exists in 'generalDataModel', do not find anything
                refreshShowDaysObj();
                return;
            }
            var getCalendarPromise   = CalendarFactory.getCalendarById( calendarID, currentYear, currentMonth );
            var getTimeSheetsPromise = imputeHoursFactory.getTimesheets( currentYear, currentMonth );
            $q.all( [ getCalendarPromise, getTimeSheetsPromise ] )
                .then( function( data ) {
                    var calendar = data[0];
                    var timesheetDataModel = data[1].data.timesheetDataModel;
                    if( !generalDataModel[ currentFirstDay ] ) generalDataModel[ currentFirstDay ] = {};
                    if( !$scope.changes.originalGeneralDataModel[ currentFirstDay ] ) $scope.changes.originalGeneralDataModel[ currentFirstDay ] = {};
                    var obj = {
                                date               : currentFirstDay,
                                calendar           : calendar,
                                timesheetDataModel : timesheetDataModel
                              };
                    generalDataModel[ currentFirstDay ] = angular.copy( obj );
                    $scope.changes.originalGeneralDataModel[ currentFirstDay ] = angular.copy( obj );
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
                // STORES VALUES INSIDE 'showDaysObj'
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
            $scope.changes.pendingChanges = true;

            $rootScope.pendingChanges = true;


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

            // stores values
            if( currentType == 'Guardias' ) {
                var newValue = value.checkValue ? 1 : 0;
                ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value = newValue;    
            } else {
                ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value = value.value;    
            }
            ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].status   = 'draft';
            ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].modified = true;
        };

        $scope.save = function() {
            var data = []; // to send an array of just 'timesheetDataModel' objects
            for( var date in generalDataModel ) {
                data.push( generalDataModel[ date ].timesheetDataModel );
            }            
            imputeHoursFactory.setAllTimesheets( data )
                .then( function( data ) {
                    $scope.changes.pendingChanges = false;
                    $rootScope.pendingChanges = false;
                })
                .catch( function( err ) {
                })
                .finally( function() {
                    if( goToState ) {
                        $state.go( goToState );
                        goToState = null;
                    }
                });

        };
        $scope.notSave = function() {
            generalDataModel = angular.copy( $scope.changes.originalGeneralDataModel );
            $scope.changes.pendingChanges = false;
            refreshShowDaysObj();
            if( goToState ) {
                $state.go( goToState );
                goToState = null;
            }
        };

        // MODAL - WARNING PENDING CHANGES MODAL
        $scope.openPendingChangesModal = function() {
            var modalPendingChangesInstance = $uibModal.open({
            animation : true,
            ariaLabelledBy : 'modal-title',
            ariaDescribedBy : 'modal-body',
            templateUrl : '/features/impute/modals/pendingChangesModal.tpl.html',
            controller : function( $scope, $uibModalInstance, $rootScope ) {
                $scope.cancel = function() {
                    $uibModalInstance.close();
                };
                $scope.save = function() {
                    $uibModalInstance.close();
                    $rootScope.$emit( 'modalToSave', 'Modal has been closed to save data');
                };
                $scope.notSave = function() {
                    $uibModalInstance.close();
                    $rootScope.$emit( 'modalNotToSave', 'Modal has been closed to NOT save data');
                };
            },
            backdrop: 'static',
            size: 'md'
            });
        }
        $rootScope.$on( 'modalToSave', function ( event, data ) { $scope.save() } );
        $rootScope.$on( 'modalNotToSave', function ( event, data ) { $scope.notSave() } );

        // when pendingChanges this comes from 'sidebar' to prevent URL change without save changes 
        $scope.$on( 'urlChangeRequest', function ( event, data ) {
            event.preventDefault();
            $scope.openPendingChangesModal();
            goToState = data.nextURL;
        });
}

})();
