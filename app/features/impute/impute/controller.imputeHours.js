;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'CalendarFactory', '$q', 'userProjects', '$uibModal', '$rootScope', '$state', '$timeout', '$filter' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, CalendarFactory, $q, userProjects, $uibModal, $rootScope, $state, $timeout, $filter ) {

        var currentFirstDay  = new Date();
        var currentMonth     = currentFirstDay.getMonth();
        var currentYear      = currentFirstDay.getFullYear();
        var calendarID       = UserFactory.getcalendarID();
        var goToState        = null; // when sidebar option is required by user and there are pending-changes
        var generalDataModel = {}; // object with all calendars and timesheet classified by month
        $scope.changes = {};
        $scope.changes.pendingChanges = false;
        $scope.changes.originalGeneralDataModel = {}; // to get back pending changes
        $rootScope.pendingChanges = false; // pending-changes for sidebar options
        $scope.weekViewMode       = true; // week/month view switch flag
        // ALERT MESSAGES
        $scope.alerts = {};
        // IMPUTE TYPES AND SUBTYPES INFO
        $scope.imputeTypes                = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel    = $scope.imputeTypes[0];
        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];

        (function Init() {
            // USER PROJECTS
            if( !userProjects.length ) { // no userProjects available
                // error NO userProjects available message alert    
                $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.errorNoProjects' );
                alertMsgOpen( false );
            } else {
                $scope.userProjects = userProjects;
                $scope.projectModel = $scope.userProjects[0];
                getData();
            }
        })();

        function getData() {
            slideContent( true );
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
                    // error loading data message alert
                    $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.errorLoading' );
                    alertMsgOpen( false );
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
                if( $scope.showDaysObj.currentWeek > ( $scope.showDaysObj.totalMonthWeeks - 1 ) ) {
                    monthChange( moveTo );
                    $scope.showDaysObj.currentWeek = 0;
                }
                if( $scope.showDaysObj.currentWeek < 0 ) {
                    monthChange( moveTo );
                    $scope.showDaysObj.currentWeek = ( $scope.showDaysObj.totalMonthWeeks - 1 );
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
                getData();
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
                // GET CALENDAR DAYTYPE (working, holidays, etc.)
                var dayType = '';
                if( generalDataModel[ currentFirstDay ].calendar.eventHours[0].eventDates[ thisDate ] ) {
                    dayType = generalDataModel[ currentFirstDay ].calendar.eventHours[0].eventDates[ thisDate ].type;
                };
                // GET TIMESHEET VALUE
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
                // STORES DAYTYPE, VALUE, INPUTTYPE AND CHECKVALUE INSIDE 'showDaysObj'
                for( var week in $scope.showDaysObj.weeks ) {                     
                    if( $scope.showDaysObj.weeks[ week ][ thisDate ] ) {
                        // VALUE AND DAYTYPE
                        $scope.showDaysObj.weeks[ week ][ thisDate ].dayType = dayType;
                        $scope.showDaysObj.weeks[ week ][ thisDate ].value   = value;
                        // INPUTTYPE AND CHECKVALUE
                        if( currentType == 'Guardias' ) {
                            $scope.showDaysObj.weeks[ week ][ thisDate ].inputType = 'checkbox';
                            $scope.showDaysObj.weeks[ week ][ thisDate ].checkValue = $scope.showDaysObj.weeks[ week ][ thisDate ].value == 0 ? false : true;
                        } else {
                            $scope.showDaysObj.weeks[ week ][ thisDate ].inputType = 'text';
                        }
                    }
                }
            }
            slideContent( false );
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
                    // success saving message alert
                    $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.savingSuccess' );
                    alertMsgOpen( true );
                })
                .catch( function( err ) {
                    // error saving message alert
                    $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.errorSaving' );
                    alertMsgOpen( false );
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
                    goToState = null;
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

        function slideContent( up ) {
            if( up ) {
                $( '#daysDiv' ).slideUp( 0 );
            } else {
                $( '#daysDiv' ).slideDown( 850 );
            }
        };

        function alertMsgOpen( success ) {
            $( '#imputeHours #section' ).animate( { scrollTop: 0 }, 'slow' );
            var $alertWall = $( '#imputeHours #alertMessage .msgAlert' );
            $scope.alerts.success = success;
            $alertWall.collapse( 'show' );
            if( success ) {
                $timeout( function() {
                    $alertWall.collapse( 'hide' );
                }, 3500 );
            }
        }
}

})();
