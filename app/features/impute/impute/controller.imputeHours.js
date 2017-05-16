;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'userProjects', 'CalendarFactory', '$q', '$uibModal', '$rootScope', '$state', '$timeout', '$filter' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, userProjects, CalendarFactory, $q, $uibModal, $rootScope, $state, $timeout, $filter ) {

        var currentDate      = new Date();
        var currentMonth     = currentDate.getMonth();
        var currentYear      = currentDate.getFullYear();
        var calendarID       = UserFactory.getcalendarID(); // get user calendar
        var goToState        = null; // when sidebar option is required by user and there are pending-changes
        var generalDataModel = {}; // object with all calendars and timesheet classified by month
        $scope.changes = {};
        $scope.changes.pendingChanges = false;
        $scope.changes.originalGeneralDataModel = {}; // to get back pending changes
        $rootScope.pendingChanges = false; // pending-changes for sidebar options
        $scope.weekViewMode       = true; // week/month view switch flag
        // ALERT MESSAGES
        $scope.alerts = {};
        $scope.alerts.permanentError = true;

        // IMPUTE TYPES AND SUBTYPES INFO
        $scope.imputeTypes                = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel    = $scope.imputeTypes[0];
        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];

        ( function Init() {
            // VERIFIES USER PROJECTS LENGTH
            if( !userProjects.length ) { // no user Projects available
                // error: NO userProjects available message alert
                $timeout( function() {
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.permanentError = true;
                    $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.errorNoProjects' ); // error message alert
                }, 1000 );
            } else { // userProjects OK cotinues to getData()
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
            var getTimeSheetsPromise = imputeHoursFactory.getTimesheets( currentYear, currentMonth, $scope.userProjects );
            $q.all( [ getCalendarPromise, getTimeSheetsPromise ] )
                .then( function( data ) {
                    var calendar = data[0];
                    var timesheetDataModel = data[1];

                    if ( calendar.success == false ) { // error: calendar not found
                        $scope.alerts.error = true; // error code alert
                        $scope.alerts.permanentError = true;
                        $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.errorNoCalendar' ); // error message alert
                        return;
                    }
                    if( !generalDataModel[ currentFirstDay ] ) generalDataModel[ currentFirstDay ] = {};
                    if( !$scope.changes.originalGeneralDataModel[ currentFirstDay ] ) $scope.changes.originalGeneralDataModel[ currentFirstDay ] = {};
                    var obj = {
                                timeStamp          : currentFirstDay,
                                date               : new Date( currentFirstDay ),
                                calendar           : calendar,
                                timesheetDataModel : timesheetDataModel
                              };

                    generalDataModel[ currentFirstDay ] = angular.copy( obj );
                    $scope.changes.originalGeneralDataModel[ currentFirstDay ] = angular.copy( obj );
                    refreshShowDaysObj();
                    $scope.alerts.permanentError = false;
                })
                .catch( function( err ) {
                    // error loading data message alert
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.permanentError = true;
                    $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.errorLoading' ); // error message alert
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
            // var currentLastDay  = $scope.showDaysObj.currentLastDay;
            var totalMonthDays  = $scope.showDaysObj.totalMonthDays;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;

            for( var day = 1; day < totalMonthDays + 1; day++ ) {
                var thisDate = new Date( currentYear, currentMonth, day, 0, 0, 0, 0 ).getTime(); // to timestamp format

                // GET CALENDAR DAYTYPE (working, holidays, etc.)
                var dayType = '';
                if( generalDataModel[ currentFirstDay ].calendar.eventHours[0].eventDates[ thisDate ] ) {
                    dayType = generalDataModel[ currentFirstDay ].calendar.eventHours[0].eventDates[ thisDate ].type;
                }
                // GET TIMESHEET VALUE
                var value = 0;
                var status = '';
                if( ts[ currentProject ] ) {
                    if( ts[ currentProject ][ thisDate ] ) {
                        if( ts[ currentProject ][ thisDate ][ currentType ] ) {
                            if( ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ] ) {
                                value = parseFloat( ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value );
                                status = ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].status;
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
                        $scope.showDaysObj.weeks[ week ][ thisDate ].status  = status;
                        // INPUTTYPE AND CHECKVALUE
                        if( currentType == 'Guardias' ) {
                            $scope.showDaysObj.weeks[ week ][ thisDate ].inputType = 'checkbox';
                            $scope.showDaysObj.weeks[ week ][ thisDate ].checkValue = $scope.showDaysObj.weeks[ week ][ thisDate ].value == 0 ? false : true;
                        } else {
                            $scope.showDaysObj.weeks[ week ][ thisDate ].inputType = 'number';
                        }
                    }
                }
            }
            slideContent( false );
            $scope.$broadcast( 'refreshStats', { generalDataModel : generalDataModel } );
            $scope.pendingDrafts = findDrafts( false ); // there is some pending draft? (for 'SEND' button)
        }

        $scope.inputChanged = function( value ) {
            // verifies if entered value is null or NaN
            if( value.value === null || isNaN( value.value ) ) { // (NaN is a number)
                value.value = 0;
            } else {
                value.value = parseFloat( value.value );             
            }

            $scope.changes.pendingChanges = true;
            $rootScope.pendingChanges     = true;

            var currentType     = $scope.typesModel;
            var currentSubType  = $scope.subtypesModel;
            var currentProject  = $scope.projectModel._id; 
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;          
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var thisDate        = value.day.getTime();

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
            
            $scope.$broadcast( 'refreshStats', { generalDataModel : generalDataModel } );
            refreshShowDaysObj();
        };

        function findDrafts( toSend, issueDate ) {
            for( var date in generalDataModel ) {
                for( var projectId in generalDataModel[date].timesheetDataModel ) {
                    for( var day in generalDataModel[date].timesheetDataModel[projectId] ) {
                        for( var type in generalDataModel[date].timesheetDataModel[projectId][day] ) {
                            for( var subType in generalDataModel[date].timesheetDataModel[projectId][day][type] ) {
                                if( generalDataModel[date].timesheetDataModel[projectId][day][type][subType].status == 'draft' ) {
                                    if( !toSend ) { // just to know if there is some 'draft'
                                        return true;
                                    }
                                    generalDataModel[date].timesheetDataModel[projectId][day][type][subType].status = 'sent';
                                    generalDataModel[date].timesheetDataModel[projectId][day][type][subType].modified = true;

                                    // before send to manager, it stores all month/year related. This is for 'issueDate' field
                                    var thisDay = new Date( parseInt( day, 10 ) );
                                    var obj = { month : thisDay.getMonth(), year : thisDay.getFullYear() };
                                    var isRepited = issueDate.some( function( date ) {
                                        return date.month == obj.month && date.year == obj.year;
                                    });
                                    if( !isRepited ) issueDate.push( obj );
                                }
                            }
                        }
                    }
                }
            }
            return false; // not 'draft' found
        }

        $scope.save = function( send ) {
            // if send: all 'draft' gonna be change to 'sent' and 'modified' to true ( findDrafts() )
            var issueDate = [];
            if( send ) {
                findDrafts( true, issueDate );
                refreshShowDaysObj();
            }

            var myPromises = [];
            var data       = []; // to send an array of just 'timesheetDataModel' objects
            for( var date in generalDataModel ) {
                data.push( generalDataModel[ date ].timesheetDataModel );
            }

            myPromises.push( imputeHoursFactory.setAllTimesheets( data ) );
            if( send ) myPromises.push( imputeHoursFactory.insertNewNotification( issueDate ) );

            Promise.all( myPromises )
                .then( function( data ) {
                    $scope.changes.pendingChanges = false;
                    $rootScope.pendingChanges = false;
                    // success saving (and send) message alert
                    if( send ) {
                        $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.sendingSuccess' ); // ok message alert
                    } else {
                        $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.savingSuccess' ); // ok message alert
                    }
                    $scope.alerts.error = false; // ok code alert
                })
                .catch( function( err ) {
                    // error saving message alert
                    $scope.alerts.message = $filter( 'i18next' )( 'calendar.imputeHours.errorSaving' ); // error message alert
                    $scope.alerts.error = true; // error code alert
                })
                .then( function() { //(.then is .finally for Promise.all)
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
                $( '#daysDiv' ).slideUp( 500 );
            } else {
                $( '#daysDiv' ).slideDown( 850 );
            }
        };

}

})();
