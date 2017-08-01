;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory', 'imputeHoursFactory', 'DashboardFactory', 'userProjects', 'CalendarFactory', '$q', '$uibModal', '$rootScope', '$state', '$timeout', '$filter' ];
    function imputeHoursController( $scope, UserFactory, imputeHoursFactory, DashboardFactory, userProjects, CalendarFactory, $q, $uibModal, $rootScope, $state, $timeout, $filter ) {

        var currentDate;
        if( $rootScope.notification ) { // if it comes from notification it takes the date from that notification
            currentDate = new Date( $rootScope.notification.issueDate.year, $rootScope.notification.issueDate.month, 1 );
            $rootScope.notification = null;
        } else { // otherwise it will show the data from current month and year
            currentDate = new Date();
        }
        var currentMonth     = currentDate.getMonth();
        var currentYear      = currentDate.getFullYear();
        var calendarID       = UserFactory.getcalendarID(); // get user calendar
        var goToState        = null; // when sidebar option is clicked by user and there are pending-changes to save
        var generalDataModel = {}; // object with all calendars and timesheets classified by month/year
        $scope.changes = {};
        $scope.changes.pendingChanges = false;
        $scope.changes.originalGeneralDataModel = {}; // to get back pending changes
        $rootScope.pendingChanges = false; // pending-changes for sidebar options
        $scope.weekViewMode       = true; // week/month view switch flag / it starts on week mode
        // ALERT MESSAGES
        $scope.alerts = {};
        $scope.alerts.permanentError = true;

        const IMPUTETYPES = imputeHoursFactory.getImputeTypesIndexConst();
        Object.freeze( IMPUTETYPES );
        $scope.imputeTypes   = imputeHoursFactory.getImputeTypes();
        $scope.typesModel    = $scope.imputeTypes[0];
        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];

        ( function Init() {
            // VERIFIES USER PROJECTS LENGTH
            if( !userProjects.length ) { // no user Projects available
                // error: NO userProjects available message alert
                $timeout( function() {
                    $scope.alerts.permanentError = true;
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'calendar.imputeHours.errorNoProjects' ) } );
                }, 1000 );
            } else { // userProjects OK cotinues to getData()
                $scope.userProjects = userProjects;
                $scope.projectModel = $scope.userProjects[0];
                //once we have all user projects we proceed to get calendar info and timesheets
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
                        $scope.alerts.permanentError = true;
                        $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'calendar.imputeHours.errorNoCalendar' ) } );
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
                    $scope.alerts.permanentError = true;
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'calendar.imputeHours.errorLoading' ) } );
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
            var currentType     = $scope.imputeTypes.indexOf( $scope.typesModel );
            var currentSubType  = $scope.imputeTypes[ $scope.typesModel ].indexOf( $scope.subtypesModel );
            var currentProject  = $scope.projectModel._id;
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            // var currentLastDay  = $scope.showDaysObj.currentLastDay;
            var totalMonthDays  = $scope.showDaysObj.totalMonthDays;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;

            for( var day = 1; day < totalMonthDays + 1; day++ ) {
                var imputeTypesSummary = initializeImputeTypesSummary(); // initialize 'imputeTypesSummary' on each day
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

                        getImputeTypesSummaryDay( thisDate );

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
                        $scope.showDaysObj.weeks[ week ][ thisDate ].imputeTypesSummary  = imputeTypesSummary;

                        // INPUTTYPE AND CHECKVALUE
                        if( currentType == IMPUTETYPES.Guardias || currentType == IMPUTETYPES.Vacaciones ) {
                            $scope.showDaysObj.weeks[ week ][ thisDate ].inputType = 'checkbox';
                            $scope.showDaysObj.weeks[ week ][ thisDate ].checkValue = $scope.showDaysObj.weeks[ week ][ thisDate ].value == 0 ? false : true;
                        } else {
                            $scope.showDaysObj.weeks[ week ][ thisDate ].inputType = 'number';
                        }
                    }
                }
            }

            // 'imputeTypesSummary' stores a summary of each imputeType (hours or checks)
            // inside of every day in 'showDaysObj'
            function initializeImputeTypesSummary() {
                var imputeTypesSummary = {};
                $scope.imputeTypes.forEach( function( type, index ) {
                    imputeTypesSummary[ index ] = { value : 0, status : ''};
                });
                imputeTypesSummary.totalHours = {};
                imputeTypesSummary.totalHours.value = 0; // total day hours
                return imputeTypesSummary;
            }

            function getImputeTypesSummaryDay( thisDate ) {
                var totalHours = 0;
                for( var imputeType in imputeTypesSummary ) {
                    if( ts[ currentProject ][ thisDate ][ imputeType ] ) {
                        for( var imputeSubType in ts[ currentProject ][ thisDate ][ imputeType ] ) {
                            var value = parseFloat( ts[ currentProject ][ thisDate ][ imputeType ][ imputeSubType ].value );
                            var status = ts[ currentProject ][ thisDate ][ imputeType ][ imputeSubType ].status;
                            imputeTypesSummary[ imputeType ].value += value;
                            imputeTypesSummary[ imputeType ].status = status;
                            if( imputeType == IMPUTETYPES.Ausencias || imputeType == IMPUTETYPES.Horas || imputeType == IMPUTETYPES.Variables ) {
                                totalHours += value;
                            }
                        }
                    }
                }
                imputeTypesSummary.totalHours.value = totalHours;
            }

            // getting totalGlobalHours
            // here, we proceed to add all imputaHours from the same day in all projects in order to show 'totalGlobalHours'
            var totalGlobalHoursObj = {};
            for( var project in ts ) {
                for( var day in ts[ project ] ) {
                    for( var imputeType in ts[ project ][ day ] ) {
                        for( var imputeSubType in ts[ project ][ day ][ imputeType ] ) {
                            if( imputeType == IMPUTETYPES.Ausencias || imputeType == IMPUTETYPES.Horas || imputeType == IMPUTETYPES.Variables ) {
                                var value = parseFloat( ts[ project ][ day ][ imputeType ][ imputeSubType ].value );
                                if( !totalGlobalHoursObj[ day ] ) {
                                    totalGlobalHoursObj[ day ] = {};
                                    totalGlobalHoursObj[ day ].totalGlobalHours = 0;
                                }
                                totalGlobalHoursObj[ day ].totalGlobalHours += value;
                            }
                        }
                    }
                }
            }
            //store 'totalGlobalHours' value inside 'showDaysObj'
            for( var week in $scope.showDaysObj.weeks ) {
                for( var day in $scope.showDaysObj.weeks[ week ] ) {
                    if( $scope.showDaysObj.weeks[ week ][ day ].imputeTypesSummary ) {
                        $scope.showDaysObj.weeks[ week ][ day ].imputeTypesSummary.totalGlobalHours = {}; // initializating 'totalGlobalHours'
                        $scope.showDaysObj.weeks[ week ][ day ].imputeTypesSummary.totalGlobalHours.value = 0; // initializating 'totalGlobalHours'
                        if( totalGlobalHoursObj[ day ] ) {
                            $scope.showDaysObj.weeks[ week ][ day ].imputeTypesSummary.totalGlobalHours.value = totalGlobalHoursObj[ day ].totalGlobalHours;
                        }
                    }
                }
            };

            slideContent( false );
            $scope.$broadcast( 'refreshStats', { generalDataModel : generalDataModel, IMPUTETYPES : IMPUTETYPES } );
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

            var currentType     = $scope.imputeTypes.indexOf( $scope.typesModel );
            var currentSubType  = $scope.imputeTypes[ $scope.typesModel ].indexOf( $scope.subtypesModel );
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
            if( currentType == IMPUTETYPES.Guardias || currentType == IMPUTETYPES.Vacaciones ) {
                var newValue = value.checkValue ? 1 : 0;
                ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value = newValue;
            } else {
                ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].value = value.value;
            }
            ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].status   = 'draft';
            ts[ currentProject ][ thisDate ][ currentType ][ currentSubType ].modified = true;

            $scope.$broadcast( 'refreshStats', { generalDataModel : generalDataModel, IMPUTETYPES : IMPUTETYPES } );
            refreshShowDaysObj();
        };

        // When toSend, it sets status to 'sent' and modified to 'true' to all items with status on 'draft' and
        // to set 'issueDate' notification field
        // When !toSend it's just to know if there is some item on 'draft'
        function findDrafts( toSend, issueDate ) {
            for( var date in generalDataModel ) {
                for( var projectId in generalDataModel[date].timesheetDataModel ) {
                    for( var day in generalDataModel[date].timesheetDataModel[projectId] ) {
                        for( var type in generalDataModel[date].timesheetDataModel[projectId][day] ) {
                            for( var subType in generalDataModel[date].timesheetDataModel[projectId][day][type] ) {
                                if( generalDataModel[date].timesheetDataModel[projectId][day][type][subType].status == 'draft' ) {
                                    if( !toSend ) { // just to know if there is some 'draft'
                                        return true; // at least one 'draft' found
                                    }
                                    generalDataModel[date].timesheetDataModel[projectId][day][type][subType].status = 'sent';
                                    generalDataModel[date].timesheetDataModel[projectId][day][type][subType].modified = true;

                                    // it stores all month/year related. This is for 'issueDate' notification field
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
            var myPromises = [];

            var ts_data = []; // to send an array of just 'timesheetDataModel' objects
            for( var date in generalDataModel ) {
                ts_data.push( generalDataModel[ date ].timesheetDataModel );
            }
            myPromises.push( imputeHoursFactory.setAllTimesheets( ts_data ) );

            // if send: all 'draft' gonna be change to 'sent' and 'modified' to true ( findDrafts() )
            // and sets issueDate for notification
            if( send ) {
                var issueDate = [];
                findDrafts( true, issueDate );
                refreshShowDaysObj();
                var notification_data = {
                                    senderId   : UserFactory.getUserID(),
                                    receiverId : UserFactory.getSuperior(),
                                    type       : 'hours_req',
                                    text       : $filter( 'i18next' )( 'calendar.imputeHours.message.hours_req' ),
                                    issueDate  : issueDate
                };
                myPromises.push( DashboardFactory.insertNewNotification( notification_data ) );
            }

            Promise.all( myPromises )
                .then( function( data ) {
                    $scope.changes.pendingChanges = false;
                    $rootScope.pendingChanges = false;
                    if( send ) {
                        $rootScope.$broadcast( 'showThisAlertPlease', { type : 'ok', msg : $filter( 'i18next' )( 'calendar.imputeHours.sendingSuccess' ) } );
                    } else {
                        $rootScope.$broadcast( 'showThisAlertPlease', { type : 'ok', msg : $filter( 'i18next' )( 'calendar.imputeHours.savingSuccess' ) } );
                    }
                })
                .catch( function( err ) {
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'calendar.imputeHours.errorSaving' ) } );
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
            var modalPendingChangesInstance = $uibModal.open( {
            animation : true,
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
            backdrop: true,
            size: 'md'
            }).result.then( function() {}, function( res ) {} );
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

        // to display the imputeType abbreviation
        $scope.giveMeAbbreviation = function( imputeType ) {
            switch ( imputeType ) {
                case 'totalHours':
                    return 'TH';
                    break;
                case 'totalGlobalHours':
                    return 'GT';
                    break;
                default:
                    return $scope.imputeTypes.abbreviation[ imputeType ];
            }
        };

        // when a input day get focus
        $scope.gotFocus = function( myDayId ) {
            $( '#daysDiv .myWeek .myDay' ).each(function( index ) {
                $( this ).removeClass( 'gotFocus' );
            });
            $( '#' + myDayId ).addClass( 'gotFocus' );
        };

        // modal: imputeType Summary info
        $scope.openImputeTypeSummaryModal = function( myDayId, day, imputeTypesSummary ) {
            $scope.gotFocus( myDayId ); // set focus on clicked day
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var currentProject  = $scope.projectModel._id;
            var timesheets;
            try {
                timesheets = generalDataModel[ currentFirstDay ].timesheetDataModel[currentProject][day.timeStamp];
            } catch(e) {
                return;
            }

            var modalPendingChangesInstance = $uibModal.open( {
                animation : true,
                templateUrl : '/features/impute/modals/imputeTypeSummaryModal.tpl.html',
                controller : 'imputeTypeSummaryController',
                backdrop: 'false',
                size: 'sm',
                resolve: {
                    data : {
                        day                : day,
                        timesheets         : timesheets,
                        imputeTypes        : $scope.imputeTypes,
                        imputeTypesSummary : imputeTypesSummary
                    }
                },
            }).rendered.then( function ( modal ) {
                var element = document.getElementById( myDayId ),
                    rect = element.getBoundingClientRect(),
                    modal = document.querySelector( '.modal-dialog' );
                modal.style.margin = 0;
                modal.style.left   = ( rect.left - 80  ) + 'px';
                modal.style.top    = ( rect.top  - 120 ) + 'px';
            });
        };

        // when user clicks over a type and subtype item on imputeTypeSummary Modal
        // to set imputeType and impuiteSubtype select options
        $rootScope.$on( 'goToThisImputeType', function ( event, data ) {
            var imputeTypeIndex    = $scope.imputeTypes.indexOf( data.imputeType );
            var imputeSubTypeIndex = $scope.imputeTypes[ data.imputeType ].indexOf( data.imputeSubType );
            $scope.typesModel      = $scope.imputeTypes[ imputeTypeIndex ];
            $scope.subtypesModel   = $scope.imputeTypes[ data.imputeType ][ imputeSubTypeIndex ];
            refreshShowDaysObj();
            // after all, focus and select all at input element day
            $timeout( function() { // search input set_focus
                var thisDayInput = document.getElementById( 'input'+ data.dayTimestamp )
                thisDayInput.focus();
                thisDayInput.select();
            });
        });

        // when user click on a project at Project summary table
        $scope.$on( 'goToThisProject', function( event, data ) {
            var project = $scope.userProjects.find( function( project ) {
                return project._id == data.projectId;
            });
            $scope.projectModel = project;
            refreshShowDaysObj();
        });

        // it returns the actual imputeType index for activeType ng-class
        $scope.giveMeImputeTypeIndex = function() {
            return $scope.imputeTypes.indexOf( $scope.typesModel );
        };

}

})();
