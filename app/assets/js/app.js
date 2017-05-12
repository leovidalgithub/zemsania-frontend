/*global loadPermissions:true*/
/*global setFormlyConfig:true*/
/*global tmpData:true*/

;( function() {
    'use strict';
    angular
        .module( 'hours', [
            'ui.router',
            'permission',
            'permission.ui',
            'angularMoment',
            'ngStorage',
            'angular-loading-bar',
            'ngSanitize',
            'jm.i18next',
            'ui.bootstrap',
            'ui.calendar',
            'angular-table',
            'monospaced.elastic',
            'formly',
            'formlyBootstrap',
            'ngFileSaver',
            // 'ngAnimate', // this cause ng-show/ng-hide/ng-if delay issue
            'hours.auth',
            'hours.dashboard',
            'hours.components',
            'hours.employeeManager',
            'hours.calendar',
            'hours.impute',
            'hours.approvalHours',
            'hours.projects'
            // 'hours.projectWorkflow',
            // 'hours.errors',
            // 'hours.reports',
            // 'hours.excelExport'
        ])
        .config( appConfig )
        .run( appRun );

    appConfig.$invoke = [ '$locationProvider', '$i18nextProvider', 'cfpLoadingBarProvider', '$urlRouterProvider' ];
    function appConfig( $locationProvider, $i18nextProvider, cfpLoadingBarProvider, $urlRouterProvider ) {
        $urlRouterProvider.otherwise( function( $injector ) {
            var $state = $injector.get( "$state" );
            $state.transitionTo( 'login' );
        });
        cfpLoadingBarProvider.includeSpinner = false;

        $locationProvider.html5Mode( true );
        $locationProvider.hashPrefix( '!' );
    }

    appRun.$invoke = [ 'PermRoleStore', 'UserFactory', '$rootScope', '$http', 'formlyConfig', '$i18next' ];
    function appRun( PermRoleStore, UserFactory, $rootScope, $http, formlyConfig, $i18next ) {

        window.i18next
            .use( window.i18nextXHRBackend );
        window.i18next.init( {
            lng : 'es', // If not given, i18n will detect the browser language.
            fallbackLng : 'dev', // Default is dev
            backend : {
                loadPath : 'assets/locales/{{lng}}/{{ns}}.json'
            }
        }, function ( err, t ) {
            $rootScope.$apply();
        });

        $rootScope.$on( '$stateChangePermissionStart', function( event, args ) {            
            var reqPerms = args.data.permissions;
            var anonymousUser = angular.isDefined( reqPerms.only ) && reqPerms.only[0] === 'anonymous';
            var locale = ( navigator.language || navigator.userLanguage ).split( '-' )[0];

            $rootScope.activeState = args.data.state;
            $rootScope.layoutTemplate = '/layouts/' + args.data.template + '.html';

            // if not anonymous, we put token on http header for all requests. And set locale from user credentials
            if ( !anonymousUser ) {
                $http.defaults.headers.common['x-auth-token'] = UserFactory.getUserToken();
                locale = UserFactory.getUser().locale;
            }

            $i18next.changeLanguage( locale );
            $rootScope.toggleSidebarStatus = false;
        });

        $rootScope.toggleSidebarStatus     = false;
        $rootScope.toggleMobileSidebar     = function() {
            $rootScope.toggleSidebarStatus = !$rootScope.toggleSidebarStatus;
        };

        loadPermissions( PermRoleStore, UserFactory );
        tmpData( $rootScope );
        setFormlyConfig( formlyConfig );

    }
}());

function setFormlyConfig(formlyConfig){
    'use strict';
    var types = {
        datepicker : function(){
            var attributes = [
                'date-disabled',
                'custom-class',
                'show-weeks',
                'starting-day',
                'init-date',
                'min-mode',
                'max-mode',
                'format-day',
                'format-month',
                'format-year',
                'format-day-header',
                'format-day-title',
                'format-month-title',
                'year-range',
                'shortcut-propagation',
                'uib-datepicker-popup',
                'show-button-bar',
                'current-text',
                'clear-text',
                'close-text',
                'close-on-date-selection',
                'datepicker-append-to-body'
            ];

            var bindings = [
                'datepicker-mode',
                'min-date',
                'max-date'
            ];

            var ngModelAttrs = {};

            angular.forEach(attributes, function(attr) {
                ngModelAttrs[camelize(attr)] = {attribute: attr};
            });

            angular.forEach(bindings, function(binding) {
                ngModelAttrs[camelize(binding)] = {bound: binding};
            });

            formlyConfig.setType({
                name: 'datepicker',
                templateUrl:  '/features/components/formly/templates/datepicker.html',
                wrapper: ['bootstrapLabel', 'bootstrapHasError'],
                defaultOptions: {
                    ngModelAttrs: ngModelAttrs,
                    templateOptions: {
                        datepickerOptions: {
                            format: 'dd/MM/yyyy',
                            showWeeks : false,
                            showButtonBar : false,
                            startingDay : 1
                        }
                    }
                },
                controller: ['$scope', function ($scope) {
                    $scope.datepicker = {};

                    $scope.datepicker.opened = false;

                    $scope.datepicker.open = function () {
                        $scope.datepicker.opened = true;
                    };
                }]
            });

            function camelize(string) {
                string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
                    return chr ? chr.toUpperCase() : '';
                });
                // Ensure 1st char is always lowercase
                return string.replace(/^([A-Z])/, function(match, chr) {
                    return chr ? chr.toLowerCase() : '';
                });
            }
        }
    };

    types.datepicker();
}
var API_base = 'http://' + location.hostname + ':4000/';
var API_paths = {
    login: 'authn/login',
    passwordRecovery: 'authn/password/remember',
    createUser: 'authn/signup',

    verifyUniqueUserEmail : 'user/profile/',

    passwordReset: 'user/password',
    getAllUsers: 'user/getAllUsers',
    saveUser: 'user/profile',
    advancedUserSearch: 'user/advancedUserSearch',
    newSearchUser: 'user/newSearch',
    removeUser: 'user/delete',    

    getEmployeesTimesheets: 'approval/getEmployeesTimesheets/',

    getTimesheets: 'timesheets/getTimesheets/',
    setAllTimesheets: 'timesheets/setAllTimesheets/',

    dayGet: 'dailyReport/get',
    dayGetByUser: 'dailyReport/getByUserID',
    dayImpute: 'dailyReport/impute',
    dayValidate: 'dailyReport/validateByUserID',
    dayReject: 'dailyReport/reject',
    daySend: 'dailyReport/send',
    getDailyConcepts: 'dailyReport/getDailyConcepts',

    projectSearch: 'project/search',
    getProjectsByUserId: 'projectUsers/getProjectsByUserID/',
    projectGetUsers: 'projectUsers/getUsersByProjectID',
    projectUserSave: 'projectUsers/save',
    // getUsersBySupervisor: 'projectUsers/getUsersBySupervisor',
    projectUserUpdate: 'projectUsers/update',
    projectUserDelete: 'projectUsers/delete',

    getAllNotifications: 'notifications/allNotifications',
    insertNewNotification: 'notifications/insertNewNotification',
    markReadNotifications: 'notifications/markRead',
    // unreadNotifications: 'notifications/unreads',

    holidays: 'holidays',
    holidaysRequest: 'holidays/request',
    holidaysApprove: 'holidays/approve',
    holidaysReject: 'holidays/reject',

    // getCalendars : 'calendar/getCalendars',
    getCalendarById : 'calendar/getCalendarById/',
    getRefreshCalendarData : 'calendar/getRefreshCalendarData',
    getCalendarsNames : 'calendar/getCalendarNames/',
    advancedCalendarSearch: 'calendar/advancedCalendarSearch',
    // getCalendarByIdByMonth : 'calendar/getCalendarByIdByMonth/',

    getSpents: 'spents/get',
    getSpentById: 'spents/search',
    spentsImpute: 'spents/impute',
    getSpentsTypes: 'spents/types',
    spents: 'spents',
    spentsDelete: 'spents/delete',

    getAbsences: 'absences/get',
    getAbsencesById: 'absences/search',
    absencesImpute: 'absences/impute',
    getAbsencesTypes: 'absences/types',
    absences: 'absences',
    absencesDelete: 'absences/delete',

    getMasterCollection: 'mcollections/',
    getEnterprisesCollection: 'mcollections/enterprises',

    getSupervisors: 'mcollections/supervisorsExceptID/',
    getAllSupervisors: 'mcollections/allSupervisors',

    getDefaultPassword: 'mcollections/defaultPassword',

    filesUpload: 'files/upload',
    filesView: 'files/view',
    filesRemove: 'files/remove'
};

function buildURL( path ) { // ***************** LEO WAS HERE *****************
    'use strict';
    return API_base + API_paths[ path ];
}

function loadPermissions( Permission, UserFactory ) { // Permission -> PermRoleStore
    'use strict';
    Permission.defineRole( 'anonymous', function () {
        return !UserFactory.getUser();
    });

    Permission.defineRole( 'user', function () {
        var isEmployee = false;
        if (angular.isDefined( UserFactory.getUser() ) ) {
            if (UserFactory.getUser().role === 'user') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole('delivery', function () {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'delivery') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole('manager', function () {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'manager') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole('administrator', function () {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'administrator') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });
}

function tmpData($rootScope) {
    'use strict';
    var tmpDataObject = {};
    $rootScope.tmpData = function (method, key, value) {
        switch (method) {
            case 'add' :
                tmpDataObject[key] = value;
                break;
            case 'remove' :
                delete tmpDataObject[key];
                break;
            case 'get' :
                return tmpDataObject[key];
        }
    };
}

function toGMT0(date) {
    'use strict';
    var now = new Date();
    if (!angular.isDate(date)) {
        date = new Date(date);
    }
    date.setHours(1);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return new Date(date.valueOf() + now.getTimezoneOffset() * 60000);
}

// TO SHOW/HIDE 'toUpButton' BUTTON (NOTIFICATIONS AND EMPLOYEEMANAGER-LIST)
function showUpButton( upButton, currentScroll ) { // if ( scrollWrapper.scrollTop + window.innerHeight >= scrollWrapper.scrollHeight )
            if ( currentScroll >= 400 ) {
                upButton.fadeIn( 'slow' );
            }
                if ( currentScroll < 400 ) {
                upButton.fadeOut( 'slow' );
            }
}

// TO TAKE SECTION SCROLL TO TOP
function takeMeUp() {
    $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
}

// CALCULATES AND RETURNS NUMBER OF ITEMS PER PAGE FOR AT-TABLE ON NOTIFICATIONS, EMPLOYEEMANAGER-LIST AND CALENDARS-LIST
function getItemsPerPage( value ) {
    return Math.floor( window.innerHeight / value ).toString();
};

// CALCULATES DAILYWORK ACCORDING TO IMPUTETYPE (HORAS, GUARDIAS, ETC.), IMPUTED VALUE AND DAYTYPEMILLISECONDS
function calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  ) {
    var dailyWork = 0;
    if( dayTypeMilliseconds != 0 ) { // if no milliseconds (holiday or non-working), no dailyWork is computed
        if( imputeType == 'Guardias' ) {
            dailyWork = imputeValue; 
        } else {
            var imputedMilliseconds = ( imputeValue * 3600000 );
            dailyWork = ( imputedMilliseconds / dayTypeMilliseconds );
        }
    }
    return dailyWork;
}

;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours', [] )
        .config( approvalHoursConfig )

    approvalHoursConfig.$invoke = [ '$stateProvider' ];
    function approvalHoursConfig( $stateProvider ) {
        $stateProvider
            .state( 'approvalHours', {
                url: '/approvalhours',
                templateUrl: '/features/approval/approval/approvalhours.tpl.html',
                controller: 'approvalHoursController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {}
            })
    }
}());

(function () {
    'use strict';
    angular
        .module('hours.auth', [])
        .config(authConfig);

    authConfig.$invoke = ['$stateProvider'];
    function authConfig($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: '/features/auth/login/login.tpl.html',
                controller: 'LoginController',
                data: {
                    template: 'login',
                    permissions: {
                        only: ['anonymous'],
                        redirectTo: 'dashboard'
                    }
                }
            })
            .state('logout', {
                url: '/logout',
                controller: function ($state, UserFactory) {
                    UserFactory.doLogout();
                    $state.go('login');
                },
                data: {
                    template: 'empty',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'dashboard'
                    }
                }
            })
            .state('recovery', {
                url: '/recovery',
                templateUrl: '/features/auth/recovery/recovery.tpl.html',
                controller: 'RecoveryController',
                data: {
                    template: 'login',
                    permissions: {
                        only: ['anonymous'],
                        redirectTo: 'dashboard'
                    }
                }
            })
            .state('changePassword', {
                url: '/change-password',
                templateUrl: '/features/auth/changePassword/changePassword.tpl.html',
                controller: 'ChangePasswordController',
                data: {
                    template: 'login',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })
            .state('userProfile', {
                url: '/profile',
                templateUrl: '/features/auth/userProfile/userProfile.tpl.html',
                controller: 'UserProfileController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            });
    }
}());
( function () {
    'use strict';
    angular
        .module( 'hours.calendar', [] )
        .config( calendarsConfig );

    calendarsConfig.$invoke = [ '$stateProvider' ];
    function calendarsConfig( $stateProvider ) {
        $stateProvider
            .state( 'calendars', { // LEO WAS HERE
                url: '/calendars',
                templateUrl: '/features/calendar/calendars/list/calendars.list.tpl.html',
                controller: 'CalendarsController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: [ 'anonymous' ],
                        redirectTo: 'login'
                    }
                },
                resolve : {
                    calendars : [ 'CalendarFactory', function( CalendarFactory ) {
                        return CalendarFactory.getCalendarsNames();
                    }]
                }
            })

            .state( 'calendarsEdit', { // LEO WAS HERE
                url: '/calendars/edit/:id',
                templateUrl: '/features/calendar/calendars/edit/calendars.edit.tpl.html',
                controller: 'editCalendarsController',
                data: {
                    // state: 'employeeManager',
                    template: 'complex',
                    permissions: {
                        except: [ 'anonymous' ],
                        redirectTo: 'login'
                    }
                }
            })
    }
}());

( function () {
    'use strict';
    angular
        .module( 'hours.components', [] )
        .directive( 'roleAuth', roleAuth );

    function roleAuth( UserFactory ) {
        return {
            restrict: 'A',
            scope: {
                'roleAuth': '@'
            },
            link: function compile( scope, element, attrs ) {                
                var authRoles = JSON.parse(attrs.roleAuth.replace(/'/g, '"')); // convert to JSON object
                var userRole = UserFactory.getUser().role;

                if ( angular.isDefined( authRoles.only ) && authRoles.only.indexOf( userRole ) < 0 ) {
                    element.remove();
                }
                if ( angular.isDefined( authRoles.except ) && authRoles.except.indexOf( userRole ) >= 0 ) {
                    element.remove();
                }
            }
        };
    }
}());

;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard', [] )
        .config( dashboardConfig );

    dashboardConfig.$invoke = ['$stateProvider'];
    function dashboardConfig( $stateProvider ) {
        $stateProvider
            .state( 'dashboard', {
                url: '/dashboard',
                templateUrl: '/features/dashboard/notifications/notifications.tpl.html',
                controller: 'NotificationController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    notifications: [ 'DashboardFactory', function ( DashboardFactory ) {
                        return DashboardFactory.getAllNotifications();
                    }]
                }
            });
    }
}());

( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager', [] )
        .config( emConfig );

    emConfig.$invoke = [ '$stateProvider' ];
    function emConfig( $stateProvider ) {
        $stateProvider
            .state( 'employeeManager', { // LEO WAS HERE
                url: '/employeeManager/list',
                templateUrl: '/features/employeeManager/list/list.tpl.html',
                controller: 'listEmployeeController',
                data: {
                    state: 'employeeManager',
                    template: 'complex',
                    permissions: {
                        only: ['administrator'],
                        redirectTo: 'dashboard'
                    }
                },
                resolve: {
                    employees: [ 'EmployeeManagerFactory', function ( EmployeeManagerFactory ) {
                        return EmployeeManagerFactory.getEmployeeList();
                    }]
                }
            })
            .state( 'employeeManagerEdit', { // LEO WAS HERE
                url: '/employeeManager/edit/:id',
                templateUrl: '/features/employeeManager/edit/edit.tpl.html',
                controller: 'editEmployeeController',
                data: {
                    state: 'employeeManager',
                    template: 'complex',
                    permissions: {
                        only: ['administrator'],
                        redirectTo: 'dashboard'
                    }
                },
                resolve: {
                    data: [ 'CalendarFactory', 'EmployeeManagerFactory', '$stateParams', '$q', function ( CalendarFactory, EmployeeManagerFactory, $stateParams, $q ) {
                        var employee    = EmployeeManagerFactory.getEmployeeFromID( $stateParams.id );
                        var enterprises = EmployeeManagerFactory.getEnterprises();
                        var supervisors = EmployeeManagerFactory.supervisorsExceptID( $stateParams.id );
                        var calendars   = CalendarFactory.getCalendarsNames();
                        return $q.all( { employee : employee, enterprises : enterprises, supervisors : supervisors, calendars : calendars } );
                    }]
                }
            })
            
            .state( 'employeeManagerCreate', { // LEO WAS HERE
                url: '/employeeManager/create',
                templateUrl: '/features/employeeManager/create/create.tpl.html',
                controller: 'createEmployeeController',
                data: {
                    state: 'employeeManager',
                    template: 'complex',
                    permissions: {
                        only: ['administrator'],
                        redirectTo: 'dashboard'
                    }
                },
                resolve: {
                    data: [ 'CalendarFactory', 'EmployeeManagerFactory', '$stateParams', '$q', function ( CalendarFactory, EmployeeManagerFactory, $stateParams, $q ) {
                        var enterprises     = EmployeeManagerFactory.getEnterprises();
                        var supervisors     = EmployeeManagerFactory.getAllSupervisors();                        
                        var defaultPassword = EmployeeManagerFactory.getDefaultPassword();
                        var calendars       = CalendarFactory.getCalendarsNames();
                        return $q.all( { enterprises : enterprises, supervisors : supervisors, defaultPassword : defaultPassword, calendars : calendars } );
                    }]
                }
            });
    }
}());

;( function () {
    'use strict';
    angular
        .module( 'hours.impute', [] )
        .config( imputeConfig );

    imputeConfig.$invoke = [ '$stateProvider' ];
    function imputeConfig( $stateProvider ) {
        $stateProvider
            .state( 'imputeHours', {
                url: '/impute-hours',
                templateUrl: '/features/impute/impute/imputeHours.tpl.html',
                controller: 'imputeHoursController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve : {
                    userProjects : [ 'imputeHoursFactory', function( imputeHoursFactory ){
                        return imputeHoursFactory.getProjectsByUserId();
                    }]
                }
            });

    }
}());

// ************************************************** **************************************************
            // .state('calendarImputeHoursValidator', {
            //     url: '/impute-hours-validator',
            //     templateUrl: '/features/calendar/imputeHoursValidator/imputeHoursValidator.tpl.html',
            //     controller: 'ImputHoursValidatorController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             only: ['administrator', 'manager'],
            //             redirectTo: 'login'
            //         }
            //     }
            // })
            // .state('calendarImputeHoursValidator-user', {
            //     url: '/impute-hours-validator/:userId/:timestamp',
            //     templateUrl: '/features/calendar/imputeHoursValidator/imputeHoursValidator.tpl.html',
            //     controller: 'ImputHoursValidatorController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             only: ['administrator', 'manager'],
            //             redirectTo: 'login'
            //         }
            //     }
            // })
            // .state('holidayCalendar', {
            //     url: '/holiday-calendar',
            //     templateUrl: '/features/calendar/holidayCalendar/holidayCalendar.tpl.html',
            //     controller: 'HolidayCalendarController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             except: ['anonymous'],
            //             redirectTo: 'login'
            //         }
            //     },
            //     resolve: {
            //         holidays : [ 'CalendarFactory', function ( CalendarFactory ) {
            //             return CalendarFactory.getUserHolidayCalendar();
            //         }]
            //     }
            // })
            // .state('moderateHolidayCalendar', {
            //     url: '/moderate-holiday-calendar',
            //     templateUrl: '/features/calendar/moderateHolidayCalendar/moderateHolidayCalendar.tpl.html',
            //     controller: 'ModerateHolidayCalendarController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             except: ['anonymous'],
            //             redirectTo: 'login'
            //         }
            //     },
            //     params: {
            //         userId: null,
            //         filterBy: null
            //     }
            // })
            // .state('calendarCreator', {
            //     url: '/calendar-creator',
            //     templateUrl: '/features/calendar/calendarCreator/calendarCreator.tpl.html',
            //     controller: 'CalendarCreatorController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             except: ['anonymous'],
            //             redirectTo: 'login'
            //         }
            //     }
            // });

;( function () {
    'use strict';
    angular
        .module( 'hours.projects', [] )
        .config( projectsConfig );

    projectsConfig.$invoke = [ '$stateProvider' ];
    function projectsConfig( $stateProvider ) {
        $stateProvider
            .state( 'projectAssign', {
                url: '/projects/assign',
                templateUrl: '/features/projects/projectAssign/projectAssign.tpl.html',
                controller: 'ProjectAssignController',
                data: {
                    template: 'complex',
                    permissions: {
                        only: [ 'administrator', 'manager' ],
                        redirectTo: 'dashboard'
                    }
                }
            });
    }
}());

;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .factory( 'approvalHoursFactory', approvalHoursFactory )

    approvalHoursFactory.$invoke = [ '$http', '$q', 'UserFactory' ];

    function approvalHoursFactory( $http, $q, UserFactory ) {
        var mainOBJ;
        var data;

        return {

            getEmployeesTimesheets: function ( _mainOBJ ) { // LEO WAS HERE
                mainOBJ = _mainOBJ;
                var month = mainOBJ.currentMonth;
                var year = mainOBJ.currentYear;
                var managerId = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.get( buildURL( 'getEmployeesTimesheets' ) + managerId + '?month=' + month + '&year=' + year )
                    .then( prepareData.bind( null, dfd ) )
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            }
        }

        function prepareData( dfd, _data ) {
            data = _data;
            var calendars = data.data.calendars;
            var employees = data.data.employees;
            employees.forEach( function( employee ) {
                employee.opened = false;
                var totalImputeHours = 0;
                var totalDailyWork   = 0;
                for( var projectId in employee.timesheetDataModel ) {
                    employee.timesheetDataModel[ projectId ].info.opened = false;
                    var imputeHours = 0;
                    var dailyWork   = 0;
                    for( var day in employee.timesheetDataModel[ projectId ] ) {
                        if( day == 'info' ) continue; // 'info' is where all project info is stored, so, it is necessary to skip it

                        // getting dayType
                        var dayType = getDayTypeByDay( calendars, employee.calendarID, day );

                        // getting dayType milliseconds
                        var dayTypeMilliseconds = getDayTypeMilliseconds( calendars, employee.calendarID, dayType );

                        for( var imputeType in employee.timesheetDataModel[ projectId ][ day ] ) {

                            
                            if( imputeType != 'Guardias' ) { // calculate just 'Hours'. 'Guardias' are not taken in account here.
                                for( var imputeSubType in employee.timesheetDataModel[ projectId ][ day ][ imputeType ] ) {
                                    

                                    var imputeValue = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].value;
                                    var dailyWorkValue = calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  );

                                    totalImputeHours+= imputeValue;
                                    imputeHours+= imputeValue;
                                    totalDailyWork+= dailyWorkValue;
                                    dailyWork+= dailyWorkValue;
                                }
                            }
                        }
                    }
                    employee.timesheetDataModel[ projectId ].info.imputeHours = imputeHours;
                    employee.timesheetDataModel[ projectId ].info.dailyWork   = Number( dailyWork.toFixed( 1 ) ); // round to 1 decimal
                }
                employee.totalImputeHours = totalImputeHours;
                employee.totalDailyWork   = Number( totalDailyWork.toFixed( 1 ) ); // round to 1 decimal
            });
            prepareTableDaysData( dfd );
        }

        // getting dayType acoording to day and calendarID
        function getDayTypeByDay( calendars, calendarID, day ) {
            var dayType = '';
            if( calendars[ calendarID ] ) {
                var calendar = calendars[ calendarID ];
                if( calendar.eventHours[0].eventDates[ day ] ) {
                    dayType = calendar.eventHours[0].eventDates[ day ].type;
                }
            }
            return dayType;
        }

        // getting millisecons acoording to dayType and calendarID
        function getDayTypeMilliseconds( calendars, calendarID, dayType ) {
            var milliseconds = 0;
            if( calendars[ calendarID ] ) {
                var calendar = calendars[ calendarID ];
                if( calendar.eventHours[0].totalPerType[ dayType ] ) {
                    milliseconds = calendar.eventHours[0].totalPerType[ dayType ].milliseconds;
                }
            }
            return milliseconds;
        }

        function prepareTableDaysData( dfd ) {
            var employees = data.data.employees;
            employees.forEach( function( employee ) {
                    employee.isPending = false;
                    for( var projectId in employee.timesheetDataModel ) {

                        for( var day in employee.timesheetDataModel[ projectId ] ) {
                            if( day == 'info' ) continue; // 'info' is where all project info is stored, so, it is necessary to skip it
    
                            for( var imputeType in employee.timesheetDataModel[ projectId ][ day ] ) {
                                for( var imputeSubType in employee.timesheetDataModel[ projectId ][ day ][ imputeType ] ) {

                                    var tableName = imputeType + '_' + imputeSubType;
                                    if( !employee.timesheetDataModel[ projectId ].info.tables[tableName]) {
                                        employee.timesheetDataModel[ projectId ].info.tables[tableName] = {};
                                        var newTable = employee.timesheetDataModel[ projectId ].info.tables[tableName];
                                        newTable.name = tableName;
                                        newTable.imputeType = imputeType;
                                        newTable.imputeSubType = imputeSubType;
                                        newTable.days = [];
                                        createTable( newTable );
                                    }
                                    var table     = employee.timesheetDataModel[ projectId ].info.tables[tableName];
                                    var value     = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][imputeSubType].value;
                                    var status    = employee.timesheetDataModel[ projectId ][ day ][ imputeType ][imputeSubType].status;
                                    var isEnabled = status == 'sent' ? true : false;
                                    
                                    if( !employee.isPending && isEnabled ) employee.isPending = true;

                                    var currentDay = new Date( parseInt( day,10 ) ).getDate();

                                    var dayToSet = table.days.find( function( dayObj ) {
                                        return dayObj.day == currentDay;
                                    });
                                    dayToSet.value   = value;
                                    dayToSet.enabled = isEnabled;
                                    employee.timesheetDataModel[ projectId ][ day ][ imputeType ][imputeSubType].enabled = isEnabled;
                                }
                            }
                        }
                    }
            });

            function createTable( newTable ) {
                for( var day = 1; day <= mainOBJ.totalMonthDays; day++ ) {
                    var dayTimestamp = new Date( mainOBJ.currentYear, mainOBJ.currentMonth, day ).getTime();
                    newTable.days.push( { day : day, dayTimestamp : dayTimestamp, value : 0, approved : 'NA', enabled : false } );
                }
            }
            prepareDayType( dfd );
        }

        function prepareDayType( dfd ) {
            var employees = data.data.employees;
            var calendars = data.data.calendars;
            employees.forEach( function( employee ) {
                var calendarID = employee.calendarID;
                for( var projectId in employee.timesheetDataModel ) {
                    for( var table in employee.timesheetDataModel[ projectId ].info.tables) {
                        var currentTable =  employee.timesheetDataModel[ projectId ].info.tables[ table ];
                        currentTable.days.forEach( function( day ) {
                            var currentDay = new Date( mainOBJ.currentYear, mainOBJ.currentMonth,  parseInt( day.day, 10) ).getTime();
                            var dayType = calendars[calendarID].eventHours[0].eventDates[currentDay].type;
                            day.dayType = dayType;
                        });
                    }
                }
                // statements
            });

            return dfd.resolve( data.data.employees );
        }

    }

}());

( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .factory( 'UserFactory', UserFactory );

    UserFactory.$invoke = [ '$http', '$q', '$localStorage' ];
    function UserFactory( $http, $q, $localStorage ) {
        return {
            getUser: function () {
                return $localStorage.User;
            },
            getUserID: function () {
                return $localStorage.User._id;
            },
            getUserToken: function () {
                return $localStorage.User.token;
            },
            getSuperior: function () {
                return $localStorage.User.superior;
            },
            getcalendarID: function () {
                return $localStorage.User.calendarID;
            },
            doLogout: function () {
                delete $localStorage.User;
            },
            doLogin: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();
                $http.post( buildURL( 'login' ), credentials )
                    .then( function ( response ) {
                        if ( response.data.success) {
                            var userModel = response.data.user;

                            if ( userModel.roles.indexOf( 'ROLE_USER' ) > -1) {
                                userModel.role = 'user';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_DELIVERY' ) > -1) {
                                userModel.role = 'delivery';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_MANAGER' ) > -1) {
                                userModel.role = 'manager';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_BACKOFFICE' ) > -1) {
                                userModel.role = 'administrator';
                            }

                            userModel.token    = response.data.token;
                            $localStorage.User = userModel;
                            dfd.resolve( userModel );
                        } else {
                            dfd.reject( response );
                        }
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });

                return dfd.promise;
            },
            doPasswordRecovery: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();

                $http.post( buildURL( 'passwordRecovery' ), credentials )
                    .then( function ( response ) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            doChangePassword: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd           = $q.defer();
                var passwordReset = {
                        currentPassword : credentials.current,
                        newPassword     : credentials.new
                };
                $http.post( buildURL( 'passwordReset' ), passwordReset )
                    .then( function ( data ) {
                            // delete $localStorage.User;
                        dfd.resolve( data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },            
            saveProfile: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();
                $http.put( buildURL( 'saveUser' ), credentials )
                    .then( function ( response ) {                            
                        $localStorage.User = credentials;
                        dfd.resolve( response );
                    })
                    .catch( function( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            verifyUniqueUserEmail: function ( emailToVerify ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();
                $http.get( buildURL( 'verifyUniqueUserEmail' ) + emailToVerify )
                    .then( function ( response ) {                            
                        dfd.resolve( response );
                    })
                    .catch( function( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getUsersBySupervisor: function () {
                var dfd = $q.defer();
                var email = UserFactory.getUser().username;

                $http
                    .post(buildURL('getUsersBySupervisor'), {"email": email})
                    .then(function (response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.users);
                        } else {
                            dfd.reject(response.data.errors);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .factory( 'CalendarFactory', CalendarFactory );

    CalendarFactory.$invoke = [ '$http', '$q' ];
    function CalendarFactory( $http, $q ) {
        return {

            getCalendarById: function ( calendarID, year, month ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getCalendarById' ) + calendarID + '?year=' + year + '&month=' + month )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getCalendarsNames: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getCalendarsNames' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data.calendars );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            advancedCalendarSearch: function( query ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.post( buildURL( 'advancedCalendarSearch' ), query)
                    .then( function ( response ) {
                      dfd.resolve( response.data.calendars );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            // getCalendars: function () { // LEO WAS HERE
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'getCalendars' ) )
            //         .then( function ( response ) {
            //             dfd.resolve( response.data.calendars );
            //         })
            //         .catch( function ( err ) {
            //             dfd.reject( err );
            //         });
            //     return dfd.promise;
            // },

            // getCalendarByIdByMonth: function ( calendarID, month, year ) { // LEO WAS HERE
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'getCalendarByIdByMonth' ) + calendarID + '?month=' + month + '&year=' + year )
            //         .then( function ( response ) {
            //             dfd.resolve( response.data );
            //         })
            //         .catch( function ( err ) {
            //             dfd.reject( err );
            //         });
            //     return dfd.promise;
            // },

            // getCalendarByDates: function (initDate, endDate, user) {
            //     var dfd = $q.defer();
            //     var dates = {
            //         initDate: initDate,
            //         endDate: endDate
            //     };
            //     /* global t_dates*/
            //     window.t_dates = dates;
            //     var serviceUrl = buildURL('dayGet');
            //     if (user) {
            //         dates.userId = user;
            //         serviceUrl = buildURL('dayGetByUser');
            //     }

            //     $http
            //         .post(serviceUrl, dates)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 var projects = response.data.projects;
            //                 var dailyReports = response.data.dailyReports;
            //                 var datesBlocked = response.data.datesBlocked;
            //                 var todayDate = toGMT0(t_dates.initDate);
            //                 var _end = toGMT0(angular.copy(todayDate));
            //                 var weekEnd = toGMT0(new Date(_end.setDate(_end.getDate() + 6)));
            //                 //

            //                 var blockDates = [];
            //                 var serviceResponse = {};
            //                 var customers_matrix = [];
            //                 var customers = {};
            //                 var userProjects = [];
            //                 var workingDays = {};
            //                 //

            //                 datesBlocked.forEach(function (date) {
            //                     blockDates.push(toGMT0(date).getDay());
            //                 });

            //                 projects.forEach(function (project) {
            //                     var newProject = !$filter('filter')(userProjects, {projectRef: project.projectRef}, true).length;

            //                     if (newProject && angular.isUndefined(workingDays[project.projectRef])) {
            //                         workingDays[project.projectRef] = [];
            //                     }

            //                     var projectInit = toGMT0(project.implicationInit);
            //                     var projectEnd;
            //                     if (angular.isDefined(project.implicationEnd)) {
            //                         projectEnd = toGMT0(project.implicationEnd);
            //                     } else {
            //                         var inALongTime = new Date().setFullYear(6000);
            //                         projectEnd = toGMT0(inALongTime);
            //                     }

            //                     if (projectInit < todayDate) {
            //                         projectInit = angular.copy(todayDate);
            //                     }

            //                     if (projectEnd > weekEnd) {
            //                         projectEnd = weekEnd;
            //                     }

            //                     while (projectInit <= projectEnd) {
            //                         var add = new Date(toGMT0(projectInit)).getDay();
            //                         if (workingDays[project.projectRef].indexOf(add) < 0 &&
            //                             blockDates.indexOf(add) < 0) {

            //                             workingDays[project.projectRef].push(add);
            //                         }
            //                         projectInit = toGMT0(new Date(projectInit.setDate(projectInit.getDate() + 1)));
            //                     }

            //                     if (newProject) {
            //                         project.days = workingDays[project.projectRef];
            //                         project.reports = {};

            //                         project.days.forEach(function (day) {
            //                             var t_day = day - 1;
            //                             t_day = t_day < 0 ? 6 : t_day;
            //                             var t_initDate = new Date(t_dates.initDate);
            //                             var t_date = toGMT0(new Date(t_initDate.setDate(t_initDate.getDate() + t_day)));
            //                             var reportAssociated = $filter('filter')(dailyReports, {
            //                                 projectId: project._id,
            //                                 date: $filter('date')(t_date, 'yyyy-MM-dd')
            //                             });

            //                             project.subfamilies.forEach(function (family) {
            //                                 project.reports[day + '_' + family] = {
            //                                     date: t_date,
            //                                     conceptDailyId: family,
            //                                     projectId: project._id
            //                                 };
            //                             });

            //                             if (reportAssociated.length) {
            //                                 reportAssociated.forEach(function(repo){
            //                                     project.reports[day+ '_' + repo.conceptDailyId].units = repo.units;
            //                                     project.reports[day+ '_' + repo.conceptDailyId].report = repo.report;
            //                                     project.status = reportAssociated[0].status;
            //                                 });

            //                             }
            //                         });
            //                         userProjects.push(project);

            //                         if (angular.isUndefined(customers[project.customerName])) {
            //                             customers[project.customerName] = [];
            //                         }
            //                         customers[project.customerName].push(project);
            //                     }
            //                 });

            //                 Object.keys(customers).forEach(function (customer) {
            //                     var t_customer = {
            //                         customerName: customer,
            //                         projects: customers[customer]
            //                     };
            //                     customers_matrix.push(t_customer);
            //                 });

            //                 serviceResponse.customers = customers_matrix;
            //                 serviceResponse.projects = projects;

            //                 dfd.resolve(serviceResponse);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // saveImputedHours: function (days) {
            //     var dfd = $q.defer();
            //     $http
            //         .post(buildURL('dayImpute'), {"dailyReports": days})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response.data.errors);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // getDailyConcepts: function () {
            //     var dfd = $q.defer();
            //     $http
            //         .get(buildURL('getDailyConcepts'))
            //         .then(function (response) {
            //             if (response.data) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response.data);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // getUserHolidayCalendar: function (user) {
            //     var dfd = $q.defer();
            //     var specificUser = '';

            //     if (angular.isDefined(user)) {
            //         specificUser = '/' + user;
            //     }

            //     $http
            //         .get(buildURL('holidays') + specificUser)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 var holidays = response.data.holidays;
            //                 var holidaysEvents = [];

            //                 holidays.forEach(function (entry) {
            //                     var status;
            //                     var statusIcon;
            //                     switch (entry.status) {
            //                         case 'requested':
            //                             statusIcon = 'fa-clock-o';
            //                             status = '';
            //                             break;
            //                         case 'approved':
            //                             statusIcon = 'fa-check';
            //                             status = '';
            //                             break;
            //                         case 'rejected':
            //                             statusIcon = 'fa-times';
            //                             status = '';
            //                             break;
            //                     }

            //                     holidaysEvents.push({
            //                         id: entry._id,
            //                         title: status,
            //                         status: entry.status,
            //                         icon: statusIcon,
            //                         start: new Date(entry.date),
            //                         end: new Date(entry.date),
            //                         className: 'event_' + entry.status
            //                     });
            //                 });

            //                 dfd.resolve(holidaysEvents);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // requestHoliday: function (event) {
            //     var dfd = $q.defer();

            //     $http
            //         .post(buildURL('holidaysRequest'), {days: [event.start]})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 event.id = 'new';
            //                 event.end = event.start;
            //                 event.title = '';
            //                 event.status = 'requested';
            //                 event.className = 'event_requested';
            //                 dfd.resolve(event);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // removeHoliday: function (event) {
            //     var dfd = $q.defer();

            //     $http
            //         .delete(buildURL('holidays') + '/' + event.id)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(event);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // updateHolidayStatus: function (type, event) {
            //     var dfd = $q.defer();

            //     $http
            //         .put(buildURL('holidays') + '/' + type, {holidays: [event.id]})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(event);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // moderateImputedHours: function (dateLapse, userId, reject) {
            //     var dfd = $q.defer();
            //     var dateInterval = {
            //         initDate: new Date(dateLapse[0]).toGMTString(),
            //         endDate: new Date(dateLapse[1]).toGMTString(),
            //         userId: userId
            //     };

            //     var destUrl = buildURL('dayValidate');
            //     if (angular.isDefined(reject)) {
            //         destUrl = buildURL('dayReject');
            //     }

            //     $http
            //         .post(destUrl, dateInterval)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // sendImputedHours: function (dateLapse) {
            //     var dfd = $q.defer();
            //     var dateInterval = {
            //         initDate: new Date(dateLapse[0]).toGMTString(),
            //         endDate: new Date(dateLapse[1]).toGMTString()
            //     };

            //     $http
            //         .post(buildURL('daySend'), dateInterval)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // }

        };
    }
}());
;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .factory( 'DashboardFactory', DashboardFactory );

    DashboardFactory.$invoke = [ '$http', '$q' ];
    function DashboardFactory( $http, $q ) {
        return {
            
            getAllNotifications: function () {
                var dfd = $q.defer();
                $http.get( buildURL( 'getAllNotifications' ) )
                    .then( function ( response ) {
                        var notifications = response.data.notifications;
                        notifications.forEach( function( notification ) { // create 'fullName' field before continue
                            notification.senderId.fullName = notification.senderId.name + ' ' + notification.senderId.surname;
                        });
                        dfd.resolve( notifications );
                        })
                    .catch( function ( err ) {
                        dfd.reject( err );
                        });
                return dfd.promise;
            },

            markNotificationAsRead: function ( notificationId ) {
                var dfd = $q.defer();
                $http.post( buildURL( 'markReadNotifications' ), { notificationId : notificationId } )
                    .then( function () {
                        dfd.resolve( true );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            }

            // getUnreadNotifications: function () {
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'unreadNotifications' ) )
            //         .then( function ( response ) {
            //             var notifications = response.data.notifications;
            //             notifications.forEach( function( notification ) {
            //                 notification.senderId.fullName = notification.senderId.name + ' ' + notification.senderId.surname;
            //             });
            //             dfd.resolve( notifications );
            //             })
            //             .catch( function ( err ) {
            //                 dfd.reject( err );
            //             });
            //     return dfd.promise;
            // }
        };
    }
}());

( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .factory( 'EmployeeManagerFactory', EmployeeManagerFactory );

    EmployeeManagerFactory.$invoke = [ '$http', 'UserFactory', '$q' ];
    function EmployeeManagerFactory( $http, $q, UserFactory ) {
        return {

            getEmployeeList: function () { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getAllUsers' ) )
                    .then( function ( response ) {
                        if ( response.data.success ) {
                            var employees = response.data.users;
                            createFullName( employees );
                            dfd.resolve( employees );
                        } else {
                            dfd.reject( response );
                        }
                    }, function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            advancedUserSearch: function( query ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.post( buildURL( 'advancedUserSearch' ), query)
                    .then( function ( response ) {
                        var employees = response.data.users;
                        createFullName( employees );
                        dfd.resolve( employees );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getEmployeeFromID: function ( userID ) { // LEO WAS HERE
                var dfd = $q.defer();
                if ( !userID ) {
                    dfd.reject();
                }
                $http.post( buildURL( 'newSearchUser' ), { _id: userID } )
                    .then( function ( response ) {
                        var user = response.data.user;
                        dfd.resolve( user );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;

            },
            updateEmployee: function ( credentials ) { // LEO WAS HERE
                var dfd = $q.defer();
                delete credentials.error;

                $http.put( buildURL( 'saveUser' ), credentials )
                    .then( function ( response ) {
                        if ( response.data.success ) {
                            dfd.resolve( response.data );
                        } else {
                            dfd.reject( response );
                        }
                    }, function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            createEmployee: function ( credentials ) { // LEO WAS HERE
                var dfd = $q.defer();
                delete credentials.error;

                $http.post( buildURL( 'createUser' ), credentials )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getEnterprises: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getEnterprisesCollection' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data.results );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            supervisorsExceptID: function( userID ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getSupervisors' ) + userID )
                    .then( function ( data ) {
                        dfd.resolve( data.data.results );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getAllSupervisors: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getAllSupervisors' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data.results );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getDefaultPassword: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getDefaultPassword' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data );
                    })
                return dfd.promise;
            }
        };

        function createFullName( employees ) {
            employees.forEach( function( employee ) { // create fullName field
                employee.fullName = employee.name + ' ' + employee.surname;
            });
        }
    }
}());



            // removeEmployee: function (query) {
            //     var dfd = $q.defer();
            //     $http
            //         .delete(buildURL('removeUser'), {data: query})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(true);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });
            //     return dfd.promise;
            // },

            // getUsersBySupervisor: function () {
            //     var dfd = $q.defer();
            //     var email = UserFactory.getUser().username;
            //     $http
            //         .post(buildURL('getUsersBySupervisor'), {"email": email})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data.users);
            //             } else {
            //                 dfd.reject(response.data.errors);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });
            //     return dfd.promise;
            // },

( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .factory( 'imputeHoursFactory', imputeHoursFactory );

    imputeHoursFactory.$invoke = [ '$http', '$q', 'UserFactory', '$filter' ];
    function imputeHoursFactory( $http, $q, UserFactory, $filter ) {
        return {

            getProjectsByUserId: function () { // LEO WAS HERE
                var userID = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.get( buildURL( 'getProjectsByUserId' ) + userID )
                    .then( function ( response ) {
                        var projects = response.data.projects;
                        projects.forEach( function( project ) { // we show 'code' + 'name' as nameToShow
                            project.nameToShow = project.code + ' - ' + project.name;
                        });
                        dfd.resolve( response.data.projects );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getTimesheets: function ( year, month, userProjects ) { // LEO WAS HERE
                var userID = UserFactory.getUserID();
                var dfd    = $q.defer();
                $http.get( buildURL( 'getTimesheets' ) + userID + '?year=' + year + '&month=' + month )
                    .then( prepareTimesheetsData.bind( null, userProjects, dfd ) )
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            setAllTimesheets: function( data, _userID ) { // LEO WAS HERE
                var userID = _userID || UserFactory.getUserID(); // ( _userID is used by 'approvalHours controller' )
                var dfd = $q.defer();
                $http.post( buildURL( 'setAllTimesheets' ) + userID, data )
                    .then( function ( response ) {
                        dfd.resolve( response );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            insertNewNotification: function( issueDate ) { // LEO WORKING HERE
                var data = {
                                senderId   : UserFactory.getUserID(),
                                receiverId : UserFactory.getSuperior(),
                                type       : 'hours_req',
                                text       : $filter( 'i18next' )( 'calendar.imputeHours.message.hours_req' ),
                                issueDate  : issueDate
                };
                var dfd = $q.defer();
                $http.post( buildURL( 'insertNewNotification' ), data )
                    .then( function ( response ) {
                        dfd.resolve( response  );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getShowDaysObj : function ( month, year, currentWeekAtFirst ) { // LEO WAS HERE
                var months          = [ 'january' ,'february' ,'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
                var currentFirstDay = new Date( year, month, 1 ),
                    currentLastDay  = new Date( year, month + 1, 0 ),
                    totalMonthDays  = currentLastDay.getDate(),
                    currentDay      = angular.copy( currentFirstDay ),
                    currentMonth    = currentFirstDay.getMonth(),
                    monthName       = months[ currentMonth ],
                    currentYear     = currentFirstDay.getFullYear(),
                    week            = 0; // number of the week inside month

                var showDaysObj             = {};
                showDaysObj.currentWeek     = 0;
                showDaysObj.currentFirstDay = currentFirstDay.getTime();
                showDaysObj.currentLastDay  = currentLastDay.getTime();
                showDaysObj.totalMonthDays  = totalMonthDays;
                showDaysObj.currentMonth    = currentMonth;
                showDaysObj.currentYear     = currentYear;
                showDaysObj.monthName       = monthName;
                showDaysObj.weeks           = {};

                while( true ) {
                    if( currentDay.getDate() == 1 && currentDay.getDay() != 1 ) { // just in case of last-month-final-days (to complete the week view)
                        var lastMonthFinalsDays = angular.copy( currentDay );
                        var tempArray = [];
                        while( true ) {
                            lastMonthFinalsDays.setDate( lastMonthFinalsDays.getDate() - 1 );
                            var day = new Date( lastMonthFinalsDays.getFullYear(), lastMonthFinalsDays.getMonth(), lastMonthFinalsDays.getDate() );
                            tempArray.push( day );
                            if( lastMonthFinalsDays.getDay() == 1 ) {
                                tempArray = tempArray.reverse();
                                tempArray.forEach( function( day ) {
                                    addNewDay( day, week );
                                })
                                break;
                            }
                        }
                    }
                    
                    var day = new Date( new Date( year, month, currentDay.getDate() ) );
                    addNewDay( day, week );

                    if( currentDay.getDate() == totalMonthDays ) { // when gets at last day
                        if( currentDay.getDay() != 0 ) { // just in case of next-month-inital-days (to complete the days view)
                            while( true ) {
                                currentDay.setDate( currentDay.getDate() + 1 );

                                var day = new Date( new Date( currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() ) );
                                addNewDay( day, week );

                                if( currentDay.getDay() == 0 ) {
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    
                    currentDay = new Date( year, month, currentDay.getDate() + 1 );
                    if( currentDay.getDay() == 1 ) { // when week ends and start a new one
                        week++;
                    }
                }

                showDaysObj.totalMonthWeeks = week + 1;

                function addNewDay( day, week ) {
                    var timeStamp = new Date( day ).getTime(); // stores in timestamp format
                    if ( !showDaysObj.weeks[ week ] ) showDaysObj.weeks[ week ] = {};
                    if ( !showDaysObj.weeks[ week ][ timeStamp ] ) showDaysObj.weeks[ week ][ timeStamp ] = {};
                    showDaysObj.weeks[ week ][ timeStamp ] = {
                                                day        : day,
                                                timeStamp  : timeStamp,
                                                value      : 0, // it stores 'Horas/Variables' text value
                                                week       : week,
                                                thisMonth  : day.getMonth(),
                                                inputType  : 'number', // 'number' for 'Horas' and 'Variables', and 'checkbox' for 'Guardias'
                                                checkValue : false, // it stores 'Guardias' checkbox value
                                                projectId  : '', // to know this day belongs to what project (for showStatsObj)
                                                status     : '' // (draft, sent, approved, rejected)
                                            };
                }
                return showDaysObj;
            }
        } // main return

        // INTERNAL FUNCTION ( getTimesheets() )
        // THIS FUNCTION REMOVES ALL PROJECTS INSIDE 'TIMESHEETMODEL' THAT DOES NOT EXIST IN 'USERPROJECTS'
        // USER ONLY CAN BE ABLE TO IMPUTE IN PROJECTS THAT EXISTS IN PROJECT_USERS COLLECTION (many to many relationchip between users and projects)
        function prepareTimesheetsData( userProjects, dfd, data ) {
            var timesheetDataModel = data.data.timesheetDataModel;
            for( var projectId in timesheetDataModel ) {
                var exists = userProjects.some( function( project ) {
                    return project._id == projectId;
                });
                if ( !exists ) {
                    delete timesheetDataModel[ projectId ];
                }
            }
            return dfd.resolve( timesheetDataModel );
        }

    }
}());

;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .factory( 'ProjectsFactory', ProjectsFactory );

    ProjectsFactory.$invoke = [ '$http', '$q' ];
    function ProjectsFactory( $http, $q ) {
        return {

            advancedProjectSearch : function ( searchText ) {
                var dfd = $q.defer();
                $http.post( buildURL( 'projectSearch' ), { searchText : searchText } )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });

                return dfd.promise;
            }

            // getUsersInProjectByID: function (projectID) {
            //     var dfd = $q.defer();
            //     $http
            //         .post(buildURL('projectGetUsers'), {projectId: projectID})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data.users);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // addUserInProject: function (userProject) {
            //     var dfd = $q.defer();
            //     $http
            //         .post(buildURL('projectUserSave'), userProject)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(true);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // updateUserInProject: function (userProject) {
            //     var dfd = $q.defer();
            //     $http
            //         .put(buildURL('projectUserUpdate'), userProject)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(true);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // deleteUserInProject: function (userProject) {
            //     var dfd = $q.defer();
            //     $http
            //         .delete(buildURL('projectUserDelete'), {
            //             data: userProject,
            //             headers: {
            //                 "Content-type": "application/json; charset=utf-8"
            //             }
            //         })
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(true);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // }
            
        };
    }
}());
;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .controller( 'approvalHoursController', approvalHoursController )

    approvalHoursController.$invoke = [ '$scope', '$rootScope', 'approvalHoursFactory', '$timeout', 'imputeHoursFactory', '$filter' ];
    function approvalHoursController( $scope, $rootScope, approvalHoursFactory, $timeout, imputeHoursFactory, $filter ) {

        ( function init() {
            var currentDate;
            if( $rootScope.notification ) { // if it comes from notification it takes the date from that notification
                currentDate = new Date( $rootScope.notification.issueDate.year, $rootScope.notification.issueDate.month, 1 );
            } else { // otherwise it will show the data from current month and year
                currentDate = new Date();
            }

            $scope.alerts   = {};
            $scope.mainOBJ  = {};
            $scope.mainOBJ  = {
                                currentDate          : currentDate,
                                currentDateTimestamp : currentDate.getTime(),
                                currentMonth         : currentDate.getMonth(),
                                currentYear          : currentDate.getFullYear(),
                                currentFirstDay      : new Date( currentDate.getFullYear(), currentDate.getMonth(), 1 ),
                                currentLastDay       : new Date( currentDate.getFullYear(), currentDate.getMonth() + 1, 0 ),
                                totalMonthDays       : new Date( currentDate.getFullYear(), currentDate.getMonth() + 1, 0 ).getDate(),                            
                                allEmployees         : 'true',
                                searchText           : '',
                                imputesCount         : 0
                            };
            getData();
        })();

        function getData() {
            approvalHoursFactory.getEmployeesTimesheets( $scope.mainOBJ )
                .then( function ( data ) {
                    $scope.employees = data;
                    imputesCount();
                    initialSlick();
                    if( $rootScope.notification ) showNotificationData();
                })
                .catch( function ( err ) {
                    console.log('err');
                    console.log(err);
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.errorLoading' ); // error message alert
                });
        }

        $scope.myEmployeeClick = function( employeeId ) {
            var openStatus = collapseToggle( employeeId );
            var employee = getEmployee( employeeId );
            employee.opened = ( openStatus === 'true' );
        };


        $scope.myProjectClick = function( employeeId, projectId ) {
            var openStatus = collapseToggle( projectId );
            var employee = getEmployee( employeeId );
            employee.timesheetDataModel[ projectId ].info.opened =  ( openStatus === 'true' );
        };

        // to collapse toggle of table views
        function collapseToggle( id ) {
            var element = $( '#' + id );
            element.collapse( 'toggle' );
            return element.attr( 'aria-expanded' ); // to know if it is collapsed or not
        }

        function initialSlick() {
            $timeout( function() {
                  $( '.slickTable' ).slick({
                    dots: true,
                    infinite : false,
                    slidesToShow: 5,
                    slidesToScroll: 4,
                    variableWidth : true,
                    arrows : false
                    // autoplay : true,
                    // autoplaySpeed : 600,
                    // adaptiveHeight : true,
                    // speed : 300,
                    // centerMode : true,
                  });
            }, 500 );
        }

        // WHEN USER CLICKS ON ANY APPROVAL OR REJECT BUTTON. THERE ARE 4 LEVEL OF APPROVAL/REJECT CLICKS
        // 1 EMPLOYEE LEVEL - ACTION OVER ALL EMPLOYEE DATA
        // 2 PROJECT LEVEL  - ACTION OVER CURRENT PROJECT
        // 3 TABLE LEVEL    - ACTION OVER A TABLE INSIDE A CURRENT PROJECT
        // 4 DAY LEVEL      - ACTION OVER A PARTICULAR DAY OF A TABLE INSIDE A CURRENT PROJECT
        $scope.setDays = function( approved, _employeeId, _projectId, _imputeType, _imputeSubType, _dayTimestamp, _dayApproved ) {
            var projectsObj = {}; // object to send data to backend to set timesheets 
            // when click directly on a particular day
            if( _dayTimestamp && _dayApproved ) {
                approved = _dayApproved == 'NA' ? true : !_dayApproved;
            }

            var newStatus = approved ? 'approved' : 'rejected';

            // find employee
            var employee = getEmployee( _employeeId );

            // start to find through projects
            for( var projectId in employee.timesheetDataModel ) {
                // if _projectId has value, so it will be filter to work just over that _projectId
                if( _projectId && projectId != _projectId ) continue;

                // find through days inside each project
                for( var day in employee.timesheetDataModel[ projectId ] ) {
                    
                    // if _dayTimestamp has value, so it will be filter to work just over that day
                    if( _dayTimestamp && day != _dayTimestamp ) continue;
                    if( day == 'info' ) continue; // 'info' is where all project info is stored, so, it is necessary to skip it

                        // find through imputeTypes inside each day
                        for( var imputeType in employee.timesheetDataModel[ projectId ][ day ] ) {
                            // if _imputeType has value, so it will be filter to work just over that _imputeType
                            if( _imputeType && imputeType != _imputeType ) continue;

                            // find through imputeSubTypes inside each imputeTypes
                            for( var imputeSubType in employee.timesheetDataModel[ projectId ][ day ][ imputeType ] ) {
                                // if _imputeSubType has value, so it will be filter to work just over that _imputeSubType
                                if( _imputeSubType && imputeSubType != _imputeSubType ) continue;

                                // enabled when status = 'sent'
                                if( employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].enabled ) {
                                    employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].status   = newStatus;
                                    employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].modified = true;
                                    var tableName = imputeType + '_' + imputeSubType;
                                    var infoObj = employee.timesheetDataModel[ projectId ].info;
                                    setDayTable( infoObj, tableName, day, approved );
                                }                                
                            }                            
                        }
                }
            if( !projectsObj[projectId] ) projectsObj[projectId] = {};
            projectsObj[projectId] = employee.timesheetDataModel[ projectId ];
            }

            // it finds 'day' inside 'project.info.tables.tableName.days' and sets 'approved'
            function setDayTable( infoObj, tableName, day, approved ) {
                var currentDay = new Date( parseInt( day, 10) ).getDate();
                var dayObj = infoObj.tables[ tableName ].days.find( function( day ) {
                    return day.day == currentDay;
                });
                dayObj.approved = approved;
            }

            var wrapProjectsObj = [ projectsObj ];
            imputeHoursFactory.setAllTimesheets( wrapProjectsObj, _employeeId )
                .then( function( data ) {
                    $scope.alerts.error = false; // ok code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.okSaving' ); // ok message alert
                })
                .catch( function( err ) {
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.errorSaving' ); // error message alert
                });
        };

        // FUNCTION FOR SHOW ALL EMPLOYESS OR JUST EMPLOYEES WITH PENDING APPROVALS
        $scope.showEmployee = function( isPending ) {
            if( $scope.mainOBJ.allEmployees == 'true' ) {
                return true;
            } else {
                return isPending;
            }
        };

        // IT COUNTS EVERY EMPLOYEE WITH PENDING APPROVAL IN ORDER TO SHOW ON RIGHT-SIDE HEADER
        function imputesCount() {
            $scope.mainOBJ.imputesCount = 0;
            $scope.employees.forEach( function( employee ) {
                if( employee.isPending ) $scope.mainOBJ.imputesCount++;
            });
        }

        // MOVING THROUGH MONTHS
        $scope.moveDate = function( moveTo ) {
                $scope.mainOBJ.currentMonth+= moveTo;
                if( $scope.mainOBJ.currentMonth == 12 ) {
                    $scope.mainOBJ.currentMonth = 0;
                    $scope.mainOBJ.currentYear++;
                } else if ( $scope.mainOBJ.currentMonth == -1 ) {
                    $scope.mainOBJ.currentMonth = 11;
                    $scope.mainOBJ.currentYear--;
                }
                getData();
        };

        // WHEN IT COMES FROM NOTIFICATION TO SHOW THE APPROVAL DATA ACCORDING TO THAT NOTIFICATION
        function showNotificationData() {
            var senderId = $rootScope.notification.senderId;
            var idLength = senderId.length;
            var employee = getEmployee( senderId );
            $scope.mainOBJ.searchText = senderId.substring( idLength - 12 );
            $rootScope.notification   = null;

            $timeout( function() {
                for( var project in employee.timesheetDataModel ) {
                    collapseToggle( project );
                    employee.timesheetDataModel[project].info.opened = true;
                }
                collapseToggle( senderId );
                employee.opened = true;                    
            }, 800 );
        }

        function getEmployee( id ) {
            return $scope.employees.find( function( employee ) {
                return employee.employeeId === id;
            });
        }

    }

}());

( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'ChangePasswordController', ChangePasswordController );

    ChangePasswordController.$invoke = [ '$scope', 'UserFactory', '$state', '$timeout' ];
    function ChangePasswordController( $scope, UserFactory, $state, $timeout ) {
        initialVertex();
        $scope.passwordForm = {
                current : null,
                new     : null,
                confirm : null
        };

        $scope.changePassword = function () {
            $scope.passwordForm.success = false;
            $scope.passwordForm.error = false;

            UserFactory.doChangePassword( $scope.passwordForm )
                .then( function ( data ) {
                    if ( data.data.success ) {
                        $scope.passwordForm.success = true;
                        $scope.changePassword.messageToDisplay = 'success';
                        $timeout( function () {
                            $state.go( 'login' );
                        }, 2500 );
                    } else {
                        $scope.passwordForm.error = true;
                        console.log(data.data.code);
                        switch( data.data.code ) {
                            case 101:
                                $scope.changePassword.messageToDisplay = 'userNotFound';
                                break;
                            case 102:
                                $scope.changePassword.messageToDisplay = 'currentPassIncorrect';
                        }
                    }
                })
                .catch( function ( err ) {
                        $scope.passwordForm.error = true;
                        $scope.changePassword.messageToDisplay = 'error';
                });
        };

        $scope.$on( '$destroy', function () {
            window.continueVertexPlay = false;
        });
    }
}());
( function () {
'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'LoginController', LoginController );

    LoginController.$invoke = [ '$scope', 'UserFactory', '$state' ];
    function LoginController( $scope, UserFactory, $state ) {
        initialVertex();
        $scope.loginForm = {
            username: null,
            password: null
        };

        $scope.login = function () {
            $scope.loginForm.error = false;
            $scope.loginForm.disabled = true;
            UserFactory.doLogin( $scope.loginForm )
                .then( function ( data ) {
                    console.log(data);
                    if ( data.defaultPassword ) {
                        $state.go( 'changePassword' );
                    } else {
                        $state.go( 'dashboard' );
                    }
                })
                .catch( function ( err ) {
                    $scope.loginForm.disabled = false;
                    $scope.loginForm.error = err;
                });
        };

        $scope.$on( '$destroy', function () {
            window.continueVertexPlay = false;
        });

        console.clear();

    }
}());
( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'RecoveryController', RecoveryController );

    RecoveryController.$invoke = [ '$scope', 'UserFactory', '$state', '$timeout' ];
    function RecoveryController( $scope, UserFactory, $state, $timeout ) {

        initialVertex();

        $scope.recoveryForm = {
                            email: null
                        };

        $scope.recovery = function () {
            $scope.recoveryForm.error   = false;
            $scope.recoveryForm.success = false;
  
            UserFactory.doPasswordRecovery( $scope.recoveryForm )
                .then( function( data ) {
                    $scope.recoveryForm.success = true;
                                        
                    $timeout( function ( data ) {
                        $state.go( 'login' );
                    }, 5000 );

                })
                .catch( function ( err ) {
                    $scope.recoveryForm.error = err;
                });
        };
    }
}());
;( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'UserProfileController', UserProfileController );

    UserProfileController.$invoke = [ '$scope', 'UserFactory', '$filter', '$timeout' ];
    function UserProfileController( $scope, UserFactory, $filter, $timeout ) {

        var originalUsername;
        $scope.showPwdContent = false;
        $scope.changePassword = {};
        $scope.status = {
                    opened: false
        };
        $scope.dateOptions = {
                        formatYear  : 'yy',
                        orientation : "bottom left",
                        startingDay : 1,
                        showWeeks   : false
        };

        $timeout( function () {
            $scope.user      = angular.copy( UserFactory.getUser() );
            originalUsername = angular.copy( $scope.user.username );

            $scope.user.birthdate = new Date( $scope.user.birthdate );
            $( '#surnameInput' ).bind( 'focus blur', usernameValidation ); // bind blur&focus username input field to verify email
            $scope.options = {
                genre :  [{
                                label: i18next.t( 'userProfile.user.genre_male' ),
                                slug: 'male'
                            },
                            {
                                label: $filter( 'i18next')( 'userProfile.user.genre_female'),
                                slug: 'female'
                         }],
                locale : [{
                                label: $filter( 'i18next')( 'locale.es' ),
                                slug: 'es'
                            },
                            {
                                label: $filter( 'i18next')( 'locale.en' ),
                                slug: 'en'
                            },
                            {
                                label: $filter( 'i18next')( 'locale.ca' ),
                                slug: 'ca'
                         }]
            };
        }, 800 );

        $scope.open = function () {
            $scope.status.opened = true;
        };

        // CHANGE PASSWORD BUTTON - SWAP VIEW
        $scope.changePassClick = function() {
            $scope.showPwdContent = !$scope.showPwdContent;
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
        };

        $scope.save = function () {
            if ( $scope.flag ) return;
            UserFactory.saveProfile( $scope.user )
                .then( function ( data ) {
                    $scope.alerts.error = false; // ok code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'auth.profile.saveSuccess' ); // ok message alert
                })
                .catch( function( err ) {
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'auth.profile.saveError' ); // error message alert
                })
                .finally( function() {
                    $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
                });
        };

        // VERIFIES IF GIVEN EMAIL NOT EXIST ON DB
        function usernameValidation( event ) {
            if ( $scope.user.username ) {
                var emailToVerify = $scope.user.username.trim();
                if ( emailToVerify != originalUsername ) { // originalEmail stores the user email when entry to profile page. If the given email is not the same it continues to API
                    UserFactory.verifyUniqueUserEmail( emailToVerify )
                        .then( function ( data ) {
                            $scope.flag = data.data.found;
                        });
                } else {
                    $scope.$apply( function() {
                        $scope.flag = false;
                    });
                }
            }
        };

        // PASSWORD CHANGE
        $scope.processPWDChange = function() {
            if ( $scope.changePassword.new != $scope.changePassword.confirm ) {
                $scope.alerts.error   = true; // error code alert
                $scope.alerts.message = $filter( 'i18next' )( 'auth.changePassword.newConfirmNotMatching' ); // error message alert
            } else {
                UserFactory
                    .doChangePassword( $scope.changePassword )
                    .then( function( data ) {
                        if ( data.data.success ) {
                            $scope.alerts.error   = false; // ok code alert
                            $scope.alerts.message = $filter( 'i18next' )( 'auth.changePassword.success' ); // ok message alert

                            $timeout( function() {
                                $scope.showPwdContent = false;
                            }, 3500 );
                        } else {
                                $scope.alerts.error = true; // error code alert

                            switch( data.data.code ) {
                                case 101:
                                    $scope.alerts.message = $filter( 'i18next' )( 'auth.changePassword.userNotFound' ); // error message alert
                                    break;
                                case 102:
                                    $scope.alerts.message = $filter( 'i18next' )( 'auth.changePassword.currentPassIncorrect' ); // error message alert
                            };
                        }
                    })
                    .catch( function( err ) {
                        $scope.alerts.error   = true; // error code alert
                        $scope.alerts.message = $filter( 'i18next' )( 'auth.changePassword.error' ); // error message alert
                    });
            };
        };

    }
}());

( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'alertMessage', alertMessage )
        .controller( 'alertMessageController', alertMessageController );

    alertMessageController.$invoke = [ '$scope', '$interval', '$window' ];
    function alertMessageController( $scope, $interval, $window ) {
            var $alertSome = $( '#alertMessage .msgAlert' );
            var promiseInterval;
            $scope.$watch( 'error', function( value ) {
                if ( value !== null ) {
                    $interval.cancel( promiseInterval );
                    $scope.horizontalMode = true;
                    // $scope.horizontalMode = ( $window.innerWidth >= 600 ) ? true : false;
                    $scope.alertMessage = $scope.msg;
                    $alertSome.collapse( 'show' );
                    promiseInterval = $interval( function() {
                        $scope.error = null;
                        $alertSome.collapse( 'hide' );
                    }, $scope.error ? 6000 : 2500 );
                }
            });
        }

    function alertMessage() {
        return {
            restrict: 'E',
            scope: {
                error : '=',
                msg   : '='
            },
            transclude: false,
            templateUrl: 'features/components/alertMsg/alertmsg.tpl.html',
            controller : alertMessageController,
            link : function( scope, elem, attrs ) {
                scope.error = null;
                scope.msg = '';
            }
        };
    }

}());

( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'zemSidebar', zemSidebar )
        .controller( 'SidebarComponentController', SidebarComponentController );

    SidebarComponentController.$invoke = [ '$scope', '$rootScope', 'UserFactory', '$state' ];
    function SidebarComponentController( $scope, $rootScope, UserFactory, $state ) {
        $scope.username = UserFactory.getUser();

        $scope.changeState = function( state ) {
            if( $rootScope.pendingChanges ) {
                $scope.$broadcast( 'urlChangeRequest', { msg : 'From sidebar URL change request', nextURL : state } );
            } else {
                $state.go( state );
            }
        };

    }
    function zemSidebar() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/features/components/sidebar/sidebar.tpl.html',
            controller: 'SidebarComponentController'
        };
    }
}());

;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .controller( 'NotificationController', NotificationController );

    NotificationController.$invoke = [ '$scope', '$rootScope', 'notifications', '$window', '$state', 'DashboardFactory', '$filter' ];
    function NotificationController( $scope, $rootScope, notifications, $window, $state, DashboardFactory, $filter ) {

        (function init() {
            $scope.tableConfig = {
                itemsPerPage: getItemsPerPage( 125 ),
                maxPages: "3",
                fillLastPage: false,
                currentPage: $scope.tmpData( 'get', 'notificationsListPage' ) || 0
            };

            setUsersView();
            $scope.notifications = notifications;
            $scope.options = {};
            $scope.options.justUnread = 'true';
            $scope.options.length = 0;
            getUnreadLength();
        })();

        // EVERYTIME WINDOW IS RESIZED EVENT
        angular.element( $window ).bind( 'resize', function() {
            $scope.$digest();
            setUsersView();
        });

        // IT GETS WINDOW WIDTH TO CHOOSE ONE OF THE TWO VIEWS
        function setUsersView() {
            if( $window.innerWidth < 1210 ) {
                $scope.viewSet = false;
            } else {
                $scope.viewSet = true;            
            }
        }

        // SECTION SCROLL MOVE EVENT TO MAKE BUTTON 'toUpButton' APPEAR
        var scrollWrapper = document.getElementById( 'section' );
        scrollWrapper.onscroll = function ( event ) {
            var currentScroll = scrollWrapper.scrollTop;
            var upButton = $( '#toUpButton' );
            showUpButton( upButton, currentScroll );
        };

        // UP-BUTTON CLICK TO TAKE SECTION SCROLL TO TOP
        $scope.pageGetUp = function() { takeMeUp() };

        // TO GO WHERE NOTIFICATION IS ABOUT
        $scope.goTo = function( item ) {
            var senderId       = item.senderId._id;
            var notificationId = item._id;
            var issueDate = item.issueDate;
            var type = item.type;
            $scope.markRead( notificationId ); // before go, mark this notification as read
            switch (type) {
                case 'hours_req':
                    $rootScope.notification = {};
                    $rootScope.notification.senderId  = senderId;
                    $rootScope.notification.issueDate = issueDate;
                    $state.go( 'approvalHours' );
                    break;
                default:
                    break;
            }
        };

        // SET NOTIFICATION AS READ
        $scope.markRead = function ( notificationId ) {
            DashboardFactory.markNotificationAsRead( notificationId )
                .then( function ( data ) {
                    var notification = getNotification( notificationId );
                    notification.status = 'read';
                })
                .catch( function ( err ) {
                    $scope.alerts.error   = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'notifications.errorMarkRead' );; // error message alert
                })
                .finally( function() {
                    getUnreadLength();
                });
        };

        // GET NOTIFICATION OBJECT BY ITS ID FROM '$scope.notifications'
        function getNotification( id ) {
            return $scope.notifications.find( function( notification ) {
                return notification._id === id;
            });
        }

        // GET TOTAL OF UNREAD NOTIFICATIONS
        function getUnreadLength() {
            $scope.options.length = 0;
            $scope.notifications.forEach( function( notification ) {
                if( notification.status == 'unread') $scope.options.length++;
            });
        }

        // FUNCTION FILTER TO SHOW UNREAD OR READ NOTIFICATIONS ONLY (ng-show)
        $scope.filterNotifications = function( status ) {
            var radioStatus = $scope.options.justUnread == 'true' ? 'unread' : 'read';
            return ( status == radioStatus );
        };

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'notificationsListPage', $scope.tableConfig.currentPage );
        });

        console.clear();

    }
}());
( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'createEmployeeController', createEmployeeController );

    createEmployeeController.$invoke = [ '$scope', '$state', 'data', '$filter', '$timeout', 'EmployeeManagerFactory' ];
    function createEmployeeController( $scope, $state, data, $filter, $timeout, EmployeeManagerFactory ) {

        $scope.companies = data.enterprises;
        $scope.supervisors = data.supervisors;
        $scope.calendars   = data.calendars;

        var employee = {
            roles: ['ROLE_USER'],
            enabled: true,
            password: data.defaultPassword.defaultPassword
        };

        $scope.employee = employee;
        $scope.maxDate = new Date();

        $scope.open = function () {
            $scope.status.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        $scope.status = {
            opened: false
        };

        function loadSelectsTranslate() {
            $scope.genres = [
                {
                    name: $filter( 'i18next' )( 'userProfile.user.genre_male' ),
                    slug: 'male'
                },
                {
                    name: $filter( 'i18next' )( 'userProfile.user.genre_female' ),
                    slug: 'female'
                }
            ];

            $scope.locales = [
                {
                    name: 'Español',
                    slug: 'es'
                },
                {
                    name: 'English',
                    slug: 'en'
                },
                {
                    name: 'Catalán',
                    slug: 'ca'
                }
            ];

            $scope.roles = [
                {
                    name: $filter( 'i18next' )( 'role.ROLE_BACKOFFICE' ),
                    slug: 'ROLE_BACKOFFICE'
                },
                {
                    name: $filter( 'i18next' )( 'role.ROLE_DELIVERY' ),
                    slug: 'ROLE_DELIVERY'
                },
                {
                    name: $filter( 'i18next' )( 'role.ROLE_MANAGER' ),
                    slug: 'ROLE_MANAGER'
                },
                {
                    name: $filter( 'i18next' )( 'role.ROLE_USER' ),
                    slug: 'ROLE_USER'
                }
            ];

            employee.roles.forEach( function ( role ) {
                $filter( 'filter' )( $scope.roles, { slug: role} )[0].active = true;
            });

        }

        $timeout( function () {
            loadSelectsTranslate();
        }, 100 );

        $scope.changeRole = function () {
            $scope.employee.roles = [];
            $scope.roles.forEach( function( role ) {
                if ( role.active ) {
                    $scope.employee.roles.push( role.slug );
                }
            });
        };

        $scope.signupUser = function () {
            console.log($scope.employee);
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
            EmployeeManagerFactory.createEmployee( $scope.employee )
                .then( function ( data ) {
                    if( data.success ) {
                        $scope.alerts.error = false; // ok code alert
                        $scope.alerts.message = $filter( 'i18next' )( 'employeeManager.create.saveSuccess' ); // ok message alert
                        $timeout( function () {
                            $state.go( 'employeeManager' );
                        }, 2500 );
                    } else {
                        $scope.alerts.error = true; // error code alert
                        $scope.alerts.message = $filter( 'i18next' )( 'employeeManager.create.userAlreadyExists' ); // error message alert
                    }
                })
                .catch( function ( err ) {
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'employeeManager.create.saveError' ); // error message alert
                });
        };
    }
}());

;( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'editEmployeeController', editEmployeeController );

    editEmployeeController.$invoke = [ '$scope', '$state', 'data', '$filter', '$timeout', 'EmployeeManagerFactory' ];
    function editEmployeeController( $scope, $state, data, $filter, $timeout, EmployeeManagerFactory ) {
        
        $scope.companies   = data.enterprises;
        $scope.supervisors = data.supervisors;
        $scope.calendars   = data.calendars;

        data.employee.birthdate = new Date( data.employee.birthdate );
        $scope.employee = data.employee;
        $scope.maxDate = new Date();

        $scope.open = function () {
            $scope.status.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        $scope.status = {
            opened: false
        };

        function loadSelectsTranslate() {
            $scope.genres = [
                {
                    name: $filter( 'i18next' )( 'userProfile.user.genre_male' ),
                    slug: 'male'
                },
                {
                    name: $filter( 'i18next' )( 'userProfile.user.genre_female' ),
                    slug: 'female'
                }
            ];

            $scope.locales = [
                {
                    name: 'Español',
                    slug: 'es'
                },
                {
                    name: 'English',
                    slug: 'en'
                },
                {
                    name: 'Catalán',
                    slug: 'ca'
                }
            ];

            $scope.roles = [
                {
                    name: $filter( 'i18next' )( 'role.ROLE_BACKOFFICE' ),
                    slug: 'ROLE_BACKOFFICE'
                },
                {
                    name: $filter( 'i18next' )( 'role.ROLE_DELIVERY' ),
                    slug: 'ROLE_DELIVERY'
                },
                {
                    name: $filter( 'i18next' )( 'role.ROLE_MANAGER' ),
                    slug: 'ROLE_MANAGER'
                },
                {
                    name: $filter( 'i18next' )( 'role.ROLE_USER' ),
                    slug: 'ROLE_USER'
                }
            ];

            data.employee.roles.forEach( function( role ) {
                $filter( 'filter' )( $scope.roles, { slug: role })[0].active = true;
            });

        }

        $timeout( function () {
            loadSelectsTranslate();
        }, 100 );

        $scope.changeRole = function () {
            $scope.employee.roles = [];
            $scope.roles.forEach( function( role ) {
                if ( role.active ) {
                    $scope.employee.roles.push( role.slug );
                }
            });
        };

        $scope.editUser = function () {
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
            EmployeeManagerFactory.updateEmployee( $scope.employee )
                .then( function () {
                    $scope.alerts.error = false; // ok code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'employeeManager.edit.saveSuccess' ); // ok message alert
                    $timeout( function () {
                        $state.go( 'employeeManager' );
                    }, 2500 );
                })
                .catch( function () {
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'employeeManager.edit.saveError' ); // error message alert
                    });
        };

    }
}());
( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'listEmployeeController', listEmployeeController );

    listEmployeeController.$invoke = [ '$scope', 'employees', 'EmployeeManagerFactory', '$timeout', '$filter', '$window' ];
    function listEmployeeController( $scope, employees, EmployeeManagerFactory, $timeout, $filter ,$window ) {

        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage( 65 ),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'employeeManagerListPage' ) || 0
        };

        $scope.search = {};
        $scope.employees = employees;
        $scope.var = false;
        setUsersView();

        // ADVANDED SEARCH TOGGLE BUTTON
        $scope.toggleAdvancedSearch = function () {
            takeMeUp();
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
            if ( !$scope.showAdvancedSearch ) {
                $scope.employees = employees;
            } else {
                $scope.avancedSearch();
                $timeout( function() { // search input set_focus
                    document.getElementById( 'searchInput' ).focus();
                });
            }
        };

        // ADVANDED SEARCH SERVICE FUNCTION
        $scope.avancedSearch = function () {
            EmployeeManagerFactory.advancedUserSearch( $scope.search )
                .then( function ( foundEmployees ) {
                    $scope.employees = foundEmployees;
                });
        };

        $timeout( function () { // ???
            $( '[ng-click="stepPage(-numberOfPages)"]' ).text( $filter( 'i18next' )( 'actions.nextPage' ) );
            $( '[ng-click="stepPage(numberOfPages)"]'  ).text( $filter( 'i18next' )( 'actions.lastPage' ) );
        });

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'employeeManagerListPage', $scope.tableConfig.currentPage );
        });


        angular.element( $window ).bind( 'resize', function() {
            $scope.$digest();
            setUsersView();
        });

        function setUsersView() {
            if( $window.innerWidth < 930 ) {
                $scope.viewSet = false;
            } else {
                $scope.viewSet = true;            
            }
        }

        // SECTION SCROLL MOVE EVENT TO MAKE BUTTON 'toUpButton' APPEAR
        var scrollWrapper = document.getElementById( 'section' );
        scrollWrapper.onscroll = function ( event ) {
            var currentScroll = scrollWrapper.scrollTop;
            var upButton = $( '#toUpButton' );
            showUpButton( upButton, currentScroll );
        };

        // BUTTON TO TAKE SECTION SCROLL TO TOP
        $scope.pageGetUp = function() { takeMeUp() };

}


}());


    // .directive('myRole', myRole);
    // IT WAS FOR TRYING TO REMOVE A COMPLETE ELEMENT (TD) FROM AT-TABLE BUT DID NOT WORK PROPERLY
    // function myRole(UserFactory) {
    //     return {
    //         restrict: 'A',
    //         scope: {
    //             'myRole': '@'
    //         },
    //         compile: function(element, attributes){  
    //             return {
    //                 pre: function(scope, element, attributes, controller, transcludeFn){
    //                     element.remove();
    //                 },
    //                 post: function(scope, element, attributes, controller, transcludeFn){
    //                 }
    //             }
    //         },
    //         link: function compile(scope, element, attrs) {
    //         }
    //     };
    // }

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

        // IMPUTE TYPES AND SUBTYPES INFO
        $scope.imputeTypes                = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ] = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ] = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel    = $scope.imputeTypes[0];
        $scope.subtypesModel = $scope.imputeTypes[$scope.typesModel][0];

        ( function Init() {
            // VERIFIES USER-PROJECTS LENGTH
            if( !userProjects.length ) { // no userProjects available
                // error: NO userProjects available message alert
                $timeout( function() {
                    $scope.alerts.error = true; // error code alert
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
                })
                .catch( function( err ) {
                    // error loading data message alert
                    $scope.alerts.error = true; // error code alert
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
                $( '#daysDiv' ).slideUp( 0 );
            } else {
                $( '#daysDiv' ).slideDown( 850 );
            }
        };

}

})();

;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursStatsController', imputeHoursStatsController );
    imputeHoursStatsController.$invoke = [ '$scope' ];
    function imputeHoursStatsController( $scope ) {

        var generalDataModel;
        var millisecondsByDayType;
        $scope.showStatsObj = {};

        $scope.$on( 'refreshStats', function( event, data ) {
            generalDataModel = data.generalDataModel;
            if( !millisecondsByDayType ) getMillisecondsByDayType();
            buildStatsObj();
        });

        function buildStatsObj() {
            var temp            = {};
            temp.projectsInfo   = getProjectsInfo();
            temp.guardsInfo     = getguardsInfo();
            temp.summary        = getsummary( temp.projectsInfo );
            temp.calendarInfo   = getcalendarInfo();
            $scope.showStatsObj = angular.copy( temp );
        }

        function getProjectsInfo() {
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var projectsInfoTemp = {};

            // getting total of hours and guards in the current month by project
            for( var projectId in ts ) {
                var projectName = '';
                var totalGuards = 0;
                var totalHours  = 0;
                var dailyWork   = 0;
                if( !projectsInfoTemp[ projectId ] ) projectsInfoTemp[ projectId ] = {};
                for( var day in ts[ projectId ] ) {
                    for( var imputeType in ts[ projectId ][ day ] ) {
                        for( var imputeSubType in ts[ projectId ][ day ][ imputeType ] ) {
                            // accumulating totalGuards, totalHours and dailyWork
                            var imputeValue = ts[ projectId ][ day ][ imputeType ][ imputeSubType ].value; // getting value
                            dailyWork += dailyWorkCalculate( day, imputeType, imputeValue ); // calculating dailyWork
                            if( imputeType == 'Guardias' ) {
                                totalGuards += imputeValue;
                            } else {
                                totalHours  += imputeValue;
                            }
                        }
                    }
                }
                // getting project name
                projectName = getProjectName( projectId );
                dailyWork = Number( dailyWork.toFixed( 1 ) ); // round 'dailyWork' to one decimal
                // stores values into 'projectsInfoTemp'
                projectsInfoTemp[ projectId ].totalGuards = totalGuards;
                projectsInfoTemp[ projectId ].totalHours  = totalHours;
                projectsInfoTemp[ projectId ].dailyWork   = dailyWork;
                projectsInfoTemp[ projectId ].projectName = projectName;
            }

            function getProjectName( projectId ) {
                return $scope.userProjects.find( function( project ) {
                    return project._id == projectId;
                }).nameToShow;
            }

            // calculates dailyWork according to dayType milliseconds and imputed-hours
            function dailyWorkCalculate( day, imputeType, imputeValue ) {
                var currentFirstDay = $scope.showDaysObj.currentFirstDay;
                var calendar        = generalDataModel[ currentFirstDay ].calendar;
                // var dailyWork = 0;
                var dayType = '';
                var dayTypeMilliseconds = 0;
                // getting dayType acoording to day            
                if( calendar.eventHours[0].eventDates[ day ] ) {
                    dayType = calendar.eventHours[0].eventDates[ day ].type;
                }
                // getting dayType milliseconds
                if( millisecondsByDayType[ dayType ] ) dayTypeMilliseconds = millisecondsByDayType[ dayType ].milliseconds;
                // // calculating dailyWork
                return calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  );
            }

            // when one project has not info it does not exist so we create it and fill with zeros (for visual purposes)
            $scope.userProjects.forEach( function( project ) {
                if( !projectsInfoTemp[ project._id ] ) {
                    projectsInfoTemp[ project._id ] = {};
                    projectsInfoTemp[ project._id ].dailyWork   = 0;
                    projectsInfoTemp[ project._id ].totalGuards = 0;
                    projectsInfoTemp[ project._id ].totalHours  = 0;
                    projectsInfoTemp[ project._id ].projectName = project.nameToShow;
                }
            });
            return projectsInfoTemp;
        }

        // RETURNS SUMMARY INFO. TOTAL IMPUTED HOURS, GUARDS AND DAILYWORK
        function getsummary( projectsInfo ) {
            var totalImputeHours  = 0;
            var totalImputeGuards = 0;
            var totalDailyWork    = 0;
            for( var project in projectsInfo ) {
                totalImputeHours  += projectsInfo[project].totalHours;
                totalImputeGuards += projectsInfo[project].totalGuards;
                totalDailyWork    += projectsInfo[project].dailyWork;
            }
            return {
                totalImputeHours  : totalImputeHours,
                totalImputeGuards : totalImputeGuards,
                totalDailyWork    : Number( totalDailyWork.toFixed( 1 ) )
            };
        }

        // RETURNS TOTAL OF HOURS OF CURRENT MONTH
        function getcalendarInfo() {
            var currentFirstDay   = $scope.showDaysObj.currentFirstDay;
            var currentMonth      = new Date( parseInt( currentFirstDay ) ).getMonth();
            var calendar          = generalDataModel[ currentFirstDay ].calendar;
            var totalHoursByMonth = 0;
            totalHoursByMonth     = calendar.eventHours[0].totalWorkingHours[ currentMonth ].milliseconds;
            totalHoursByMonth    /= 3600000;
            totalHoursByMonth     = Number( totalHoursByMonth.toFixed( 1 ) );
            return { totalHoursByMonth : totalHoursByMonth };
        }

        // RETURNS TOTAL OF GUARDS ACCORDING TO EACH TYPE
        function getguardsInfo() {
            var currentFirstDay = $scope.showDaysObj.currentFirstDay;
            var ts              = generalDataModel[ currentFirstDay ].timesheetDataModel;
            var totalTurns   = 0;
            var totalGuards  = 0;
            var totalVarious = 0;
            // getting total of guards accoding of its subType by project
            for( var projectId in ts ) {
                for( var day in ts[ projectId ] ) {
                    for( var imputeType in ts[ projectId ][ day ] ) {
                        for( var imputeSubType in ts[ projectId ][ day ][ imputeType ] ) {
                            var imputeValue = ts[ projectId ][ day ][ imputeType ][ imputeSubType ].value; // getting value
                            if( imputeType == 'Guardias' ) {
                                if( imputeSubType == 'Turnicidad' ) {
                                    totalTurns   += imputeValue;
                                } else if ( imputeSubType == 'Guardia' ) {
                                    totalGuards  += imputeValue;
                                } else if ( imputeSubType == 'Varios' ) {
                                    totalVarious += imputeValue;
                                }
                            }
                        }
                    }
                }
            }
            return {
                    totalTurns   : totalTurns,
                    totalGuards  : totalGuards,
                    totalVarious : totalVarious
            };

        }

        // stores dailywork dayType milliseconds
        function getMillisecondsByDayType() {
            var currentFirstDay    = $scope.showDaysObj.currentFirstDay;
            var calendar           = generalDataModel[ currentFirstDay ].calendar;
            millisecondsByDayType  = calendar.eventHours[0].totalPerType;
        }

}
})();

;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignController', ProjectAssignController );
        // .controller( 'ModalProjectInfo',        ModalProjectInfo )
        // .controller( 'ModalAddUserToProject',   ModalAddUserToProject )
        // .controller( 'ModalUserInfo',           ModalUserInfo );

    ProjectAssignController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal', '$timeout' ];
    function ProjectAssignController( $scope, ProjectsFactory, $uibModal, $timeout ) {

        // (function Init( search ) {
        //     $scope.searchProject( search );
        // })('1');

        // $scope.openProject = null;
        // $scope.advancedSearchVisible = false;
        // $scope.loadingProjectUsers = null;
        $scope.spinners = {
            projects : false,
            users    : false
        };

        $scope.searchProject = function ( searchText ) {
            $scope.spinners.projects = true;
            ProjectsFactory.advancedProjectSearch( searchText )
                .then( function ( data ) {
                    $scope.projects = data.projects;
                })
                .catch( function ( err ) {

                })
                .finally( function() {
                    $scope.spinners.projects = false;
                });
        };

        $scope.openInfo = function ( project ) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalProjectInfo.tpl.html',
                controller: 'ModalProjectInfo',
                resolve: {
                    project: project
                }
            });
        };

        $timeout( function() { // search input set_focus
            document.getElementById( 'searchInput' ).focus();
        }, 800 );
    
// };


    }

    // ModalProjectInfo.$invoke = ['$scope', '$uibModalInstance', 'project'];
    // function ModalProjectInfo($scope, $uibModalInstance, project) {
    // }

    // ModalUserInfo.$invoke = ['$scope', '$uibModalInstance', 'user'];
    // function ModalUserInfo($scope, $uibModalInstance, user) {
    // }

    // ModalAddUserToProject.$invoke = ['$scope', '$uibModalInstance', 'user', 'project'];
    // function ModalAddUserToProject($scope, $uibModalInstance, user, project) {
    // }

}());
;( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'editCalendarsController', editCalendarsController );

    editCalendarsController.$invoke = [ '$scope', 'CalendarFactory', '$stateParams', 'UserFactory', '$timeout', '$state' ];
    function editCalendarsController( $scope, CalendarFactory, $stateParams, UserFactory, $timeout, $state ) {

        var eventDates;
        var eventHours;
        var currentYear     = new Date().getFullYear();
        $scope.loadingError = false;
        $scope.yearShowed   = currentYear.toString();
        var locale      = UserFactory.getUser().locale;
        var types       = { working : 'L-J', special : '', intensive : 'L-V', friday : 'V' };

        (function Init() {
            getCalendar( currentYear );
        })();

        function getCalendar( year ) {
                CalendarFactory.getCalendarById( $stateParams.id, year )
                    .then( function( data ) {
                        $scope.loadingError = false;
                        $scope.calendar = data.calendar;
                        eventHours = data.eventHours[0];
                        eventDates = data.eventHours[0].eventDates;
                        $timeout( function () {
                            showCalendars();
                        }, 300 );
                    })
                    .catch( function( err ) {
                        $scope.loadingError = true;
                        $timeout( function () {
                            $state.go( 'calendars' );
                        }, 2500 );
                    });
        }

        function showCalendars() {
            $.datepicker.setDefaults( // Initializing calendar language
                $.extend( $.datepicker.regional[ locale ] )
            );
            displayMonthsHours();
            displayRangeHours();
            createCalendarsHTML();
            var monthArray = [];
            monthArray = getMonthArrayByYear( $scope.yearShowed );
            var calendarNumber = 1;
            for ( var i = 0; i < monthArray.length; i++ ) {
                var calendar = '#calendar-' + calendarNumber++;
                showCalendar( calendar , monthArray[ i ] );
                // $( calendar + ' p' ).text( 'Total horas: xyz' );
            };
            resetCellsTitles();
        }

        function displayMonthsHours() {
            $scope.monthsHours = [];
            for ( var month in eventHours.totalWorkingHours ) {
                if( month != 'year' ) {
                    $scope.monthsHours.push( { month : month, hours : eventHours.totalWorkingHours[ month ].hours, minutes : eventHours.totalWorkingHours[ month ].minutes } );
                } else {
                    $scope.monthsHours.push( { month : 'year', hours : eventHours.totalWorkingHours[ month ].hours, minutes : eventHours.totalWorkingHours[ month ].minutes } );
                }                
            }
        }

        function displayRangeHours() {
            for ( var type in types ) {
                if( eventHours.types[ type ] ) { // when no data comes (not year available)
                    var text = types[ type ] + ' ';                
                    eventHours.types[ type ].forEach( function( element ) {
                        text += element.initialHour + '-' + element.endHour + ' ';
                    });
                    $( '#' + type + 'Range' ).html( '<code>' + text + '</code>' );
                }
            }
        }

         function showCalendar( calendar, month ) {
            jQuery( calendar ).datepicker( {
                // showButtonPanel: true,                
                dateFormat: 'mm-dd-yy',
                firstDay: 1,
                changeMonth: false,
                changeYear: false,
                stepMonths: 0,
                defaultDate: new Date( month ), // ( 2014, 2, 1 )
                // onSelect: selectedDay,
                beforeShowDay: function( date ) {
                    date = new Date( date ).getTime(); // from date to timestamp
                    var highlight = eventDates[ date ];
                    if ( highlight ) {
                        if ( highlight.type == 'working' ) {
                            return [ true, "showWorking", highlight ];
                        } else if ( highlight.type == 'holidays' ) {
                            return [ true, 'showHolidays', highlight ];
                        } else if ( highlight.type == 'friday' ) {
                            return [ true, 'showFriday', highlight ];
                        } else if ( highlight.type == 'intensive' ) {
                            return [ true, 'showIntensive', highlight ];
                        } else if ( highlight.type == 'special' ) {
                            return [ true, 'showSpecial', highlight ];
                        } else if ( highlight.type == 'non_working' ) {
                            return [ true, 'showNon_working', highlight ];
                        }
                    } else {
                        return [ true, 'showDefault', highlight ];
                    }
                 } // beforeShowDay
            });
        }

        $scope.yearChanged = function() {
            getCalendar( $scope.yearShowed );
        };

        function createCalendarsHTML() {
            $( '#months div' ).remove();
            for ( var i = 1; i < 13; i++ ) {
                $( '<div/>', {
                    id: 'calendar-' + i,
                    class: 'calendar'
                }).appendTo( '#months' );
            }
            // $( '<p/>', {} ).appendTo( '#months div' );
        }

        function getMonthArrayByYear( year ) {
            var monthArray = [];
            for ( var i = 1; i < 13; i++ ) {
                monthArray.push( i + '/01/' + year );
            }
            return monthArray;
        }

        function resetCellsTitles() {
            $timeout( function () {
                $( '.ui-datepicker td > *' ).each( function ( index, elem ) {
                    $( this ).attr( 'title', 'Zemsania' );
                });
            }, 100 );
        }

// ********************************************** **********************************************
// *****************************************selectedDay ****************************************
        // function selectedDay( date, inst ) {
        //     // inst.dpDiv.find('.ui-state-default').css('background-color', 'red');
        //     // eventDates[ new Date( date ) ] = { date : new Date( date ), type : $scope.dayTypes };
        //     var destinyType = 'working';
        //     var selectedDay = new Date( date );
        //     $scope.calendar.groupDays.forEach( function( groupDay ) {
        //         if ( groupDay.type == destinyType ) { // find day in the same type in order to push it (if does'not exist)
        //             var index = getDayIndex( groupDay.days.days );
        //             if ( index == -1 ) { // if not exists to add
        //                 groupDay.days.days.push( selectedDay );
        //             }
        //         } else { // find day in others types in order to remove it (if exists)
        //             var index = getDayIndex( groupDay.days.days );
        //             if ( index != -1 ) { // if exists to remove
        //                 groupDay.days.days.splice( index, 1 );
        //             }                    
        //         }
        //     });
        //     function getDayIndex( array ) {
        //         return array.findIndex( function( day ) {
        //             return new Date( day ).getTime() == selectedDay.getTime();
        //         });                    
        //     }
        //     // send calendar to backend to refresh object data
        //     $http.post( buildURL( 'getRefreshCalendarData' ), $scope.calendar )
        //         .then( function ( response ) {
        //             var data = response.data;
        //             $scope.calendar = data.calendar;
        //             eventHours = data.eventHours;
        //             eventDates = data.eventHours.eventDates;
        //             $timeout( function () {
        //                 showCalendars();
        //             }, 300 );
        //         });
        // }
// ********************************************** **********************************************
// ********************************************** **********************************************

}

})();

( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'CalendarsController', CalendarsController );

    CalendarsController.$invoke = [ '$scope', '$filter', '$window', 'CalendarFactory', 'calendars', '$timeout' ];
    function CalendarsController( $scope, $filter, $window, CalendarFactory, calendars, $timeout ) {

        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage( 65 ),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'calendarsListPage' ) || 0
        };

        $scope.calendars = calendars;
        setUsersView();

        // ADVANDED SEARCH TOGGLE BUTTON
        $scope.toggleAdvancedSearch = function () {
            takeMeUp();
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
            if ( !$scope.showAdvancedSearch ) {
                $scope.calendars = calendars;
            } else {
                $scope.avancedSearch();
                $timeout( function() { // search input set_focus
                    document.getElementById( 'searchInput' ).focus();
                });
            }
        };

        // ADVANDED SEARCH SERVICE FUNCTION
        $scope.avancedSearch = function () {
            CalendarFactory.advancedCalendarSearch( $scope.search )
                .then( function ( foundCalendars ) {
                    $scope.calendars = foundCalendars;
                });
        };

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'calendarsListPage', $scope.tableConfig.currentPage );
        });

        angular.element( $window ).bind( 'resize', function() {
            $scope.$digest();
            setUsersView();
        });

        function setUsersView() {
            if( $window.innerWidth < 930 ) {
                $scope.viewSet = false;
            } else {
                $scope.viewSet = true;            
            }
        }

        // SECTION SCROLL MOVE EVENT TO MAKE BUTTON 'toUpButton' APPEAR
        var scrollWrapper = document.getElementById( 'section' );
        scrollWrapper.onscroll = function ( event ) {
            var currentScroll = scrollWrapper.scrollTop;
            var upButton = $( '#toUpButton' );
            showUpButton( upButton, currentScroll );
        };

        // BUTTON TO TAKE SECTION SCROLL TO TOP
        $scope.pageGetUp = function() { takeMeUp() };

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'notificationsListPage', $scope.tableConfig.currentPage );
        });

}

}());

;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ModalProjectInfo', ModalProjectInfo );

    ModalProjectInfo.$invoke = [ '$scope', '$uibModalInstance', 'project' ];
    function ModalProjectInfo( $scope, $uibModalInstance, project ) {

        $scope.project = project;

        $scope.cancel = function () {
            $uibModalInstance.dismiss( 'cancel' );
        };

    }


}());
var TAU = 2 * Math.PI;
var canvas;
var ctx;
var times;
var lastTime;
var balls;

function initialVertex() {
    'use strict';
    window.continueVertexPlay = true;
    balls = [];
    times = [];
    lastTime = Date.now();
    canvas = document.querySelector("canvas");
    canvas.width = $(window).width() || window.innerWidth;
    canvas.height = $(window).height() || window.innerHeight;
    ctx = canvas.getContext("2d");

    for (var i = 0; i < canvas.width * canvas.height / (95 * 65); i++) {
        balls.push(new Ball(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    loop();
}

function loop() {
    'use strict';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    draw();
    if (window.continueVertexPlay) {
        requestAnimationFrame(loop);
    }
}

function Ball(startX, startY, startVelX, startVelY) {
    'use strict';
    this.x = startX || Math.random() * canvas.width;
    this.y = startY || Math.random() * canvas.height;
    this.vel = {
        x: startVelX || Math.random() * 2 - 1,
        y: startVelY || Math.random() * 2 - 1
    };
    this.update = function (canvas) {
        if (this.x > canvas.width + 50 || this.x < -50) {
            this.vel.x = -this.vel.x;
        }
        if (this.y > canvas.height + 50 || this.y < -50) {
            this.vel.y = -this.vel.y;
        }
        this.x += this.vel.x;
        this.y += this.vel.y;
    };
    this.draw = function (ctx) {
        ctx.beginPath();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'orange';
        ctx.arc((0.5 + this.x) || 0, (0.5 + this.y) || 0, 1, 0, TAU, false);
        ctx.fill();
    };
}

function update() {
    'use strict';
    var diff = Date.now() - lastTime;
    for (var frame = 0; frame * 15 < diff; frame++) {
        for (var index = 0; index < balls.length; index++) {
            balls[index].update(canvas);
        }
    }
    lastTime = Date.now();
}

function draw() {
    'use strict';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var index = 0; index < balls.length; index++) {
        var ball = balls[index];
        ball.draw(ctx, canvas);
        ctx.beginPath();
        for (var index2 = balls.length - 1; index2 > index; index2 += -1) {
            var ball2 = balls[index2];
            /**
             * @param {function} Math.hypot
             */
            var dist = Math.hypot(ball.x - ball2.x, ball.y - ball2.y);
            if (dist < 100) {
                ctx.strokeStyle = "#FFAA44";
                ctx.globalAlpha = 1 - (dist > 50 ? 0.8 : dist / 50);
                ctx.lineWidth = "2px";
                ctx.moveTo((0.5 + ball.x) || 0, (0.5 + ball.y) || 0);
                ctx.lineTo((0.5 + ball2.x) || 0, (0.5 + ball2.y) || 0);
            }
        }
        ctx.stroke();
    }
}

