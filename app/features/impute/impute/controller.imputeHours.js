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

        const IMPUTETYPES = { // it contains the index posisition inside imputeTypes array ## DO NOT CHANGE THE ARRAY ELEMENTS ORDER ##
                    Horas      : 0,
                    Guardias   : 1,
                    Variables  : 2,
                    Vacaciones : 3,
                    Ausencias  : 4
                };
        Object.freeze( IMPUTETYPES );
        // IMPUTE TYPES AND SUBTYPES INFO ## DO NOT CHANGE THE ARRAY ELEMENTS ORDER ##
        var imputeTypesAbbreviation        = [ 'Hor', 'Gua', 'Var', 'Vac', 'Aus' ]; // abbreviations are stored with the same order
        $scope.imputeTypes                 = [ 'Horas', 'Guardias', 'Variables', 'Vacaciones', 'Ausencias' ];
        $scope.imputeTypes[ 'Horas'      ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'   ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables'  ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.imputeTypes[ 'Vacaciones' ] = [ 'Vacaciones' ];
        $scope.imputeTypes[ 'Ausencias'  ] = [ 'BM-Baja-Médica', 'BT-Baja-Maternidad', 'EF-Enfermedad', 'EX-Examen', 'FF-Fallecimiento-Familiar',
                                               'MA-Matrimonio', 'MU-Mudanza', 'NH-Nacimiento-Hijos', 'OF-Operación-Familiar', 'OT-Otros',
                                               'VM-Visita-Médica', 'LB-Libranza' ];
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
                        // ********************************** if( currentType  'Guardias' || currentType == 'Vacaciones' ) {
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
                    // imputeTypesSummary[ type ] = 0;
                    imputeTypesSummary[ index ] = 0;
                });
                imputeTypesSummary.totalHours = 0; // great hours total
                return imputeTypesSummary;
            }

            function getImputeTypesSummaryDay( thisDate ) {
                var totalHours = 0;
                for( var imputeType in imputeTypesSummary ) {
                    if( ts[ currentProject ][ thisDate ][ imputeType ] ) {
                        for( var imputeSubType in ts[ currentProject ][ thisDate ][ imputeType ] ) {
                            var value = parseFloat( ts[ currentProject ][ thisDate ][ imputeType ][imputeSubType].value );
                            imputeTypesSummary[ imputeType ] += value;
                            if( imputeType == IMPUTETYPES.Ausencias || imputeType == IMPUTETYPES.Horas || imputeType == IMPUTETYPES.Variables ) {
                                totalHours += value;
                            }
                        }
                    }
                }
                imputeTypesSummary.totalHours = totalHours;
            }

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
            backdrop: 'static',
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
            return imputeTypesAbbreviation[ imputeType ] ? imputeTypesAbbreviation[ imputeType ] : 'TH';
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
            $scope.gotFocus( myDayId ); // timeStamp day
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
                modal.style.left   = rect.left + 'px';
                modal.style.top    = rect.top + 'px';
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

}

})();
