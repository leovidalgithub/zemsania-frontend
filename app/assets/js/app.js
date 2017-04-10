/*global loadPermissions:true*/
/*global setFormlyConfig:true*/
/*global tmpData:true*/

(function() {
    'use strict';
    angular
        .module('hours', [
            'ui.router',
            'permission',
            'permission.ui',
            'angularMoment',
            // 'ngAnimate', // ng-show/ng-hide/ng-if delay issue!!!
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
            'hours.auth',
            // 'hours.projectWorkflow',
            // 'hours.errors',
            'hours.dashboard',
            'hours.components',
            'hours.employeeManager',
            'hours.calendar',
            'hours.impute'
            // 'hours.reports',
            // 'hours.projects',
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
    }

    appRun.$invoke = [ 'PermRoleStore', 'UserFactory', '$rootScope', '$http', 'formlyConfig', '$uibModal', '$localStorage','$i18next' ];
    function appRun( PermRoleStore, UserFactory, $rootScope, $http, formlyConfig, $uibModal, $localStorage, $i18next ) {

        window.i18next
            .use( window.i18nextXHRBackend );
        window.i18next.init({
            lng: 'es', // If not given, i18n will detect the browser language.
            fallbackLng: 'dev', // Default is dev
            backend: {
                loadPath: 'assets/locales/{{lng}}/{{ns}}.json'
            }
        }, function ( err, t ) {
            // console.log('resources loaded');
            $rootScope.$apply();
        });

        $rootScope.$on( '$stateChangePermissionStart', function( event, args ) {            
            var reqPerms = args.data.permissions;
            var anonymousUser = angular.isDefined(reqPerms.only) && reqPerms.only[0] === 'anonymous';
            var locale = (navigator.language || navigator.userLanguage).split('-')[0];

            $rootScope.activeState = args.data.state;
            $rootScope.layoutTemplate = '/layouts/' + args.data.template + '.html';

            // If not anonymous user put Auth header
            if (!anonymousUser) {
                $http.defaults.headers.common['x-auth-token'] = UserFactory.getUserToken();
                locale = UserFactory.getUser().locale;
            }

            $i18next.changeLanguage(locale);

            $rootScope.toggleSidebarStatus = false;
        });

        $rootScope.toggleSidebarStatus = false;
        $rootScope.toggleMobileSidebar = function() {
            $rootScope.toggleSidebarStatus = !$rootScope.toggleSidebarStatus;
        };

        loadPermissions(PermRoleStore, UserFactory);
        tmpData($rootScope);
        setFormlyConfig(formlyConfig);

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
var API_base = 'http://' + location.hostname + ':3000/';
var API_paths = {
    login: 'authn/login',
    passwordRecovery: 'authn/password/remember',
    createUser: 'authn/signup',

    verifyUniqueUserEmail : 'user/profile/',

    passwordReset: 'user/password',
    getAllUsers: 'user/all',
    saveUser: 'user/profile',
    searchUser: 'user/search',
    newSearchUser: 'user/newSearch',
    removeUser: 'user/delete',
    

    getTimesheets: 'timesheets/getTimesheets/',


    dayGet: 'dailyReport/get',
    dayGetByUser: 'dailyReport/getByUserID',
    dayImpute: 'dailyReport/impute',
    dayValidate: 'dailyReport/validateByUserID',
    dayReject: 'dailyReport/reject',
    daySend: 'dailyReport/send',
    getDailyConcepts: 'dailyReport/getDailyConcepts',

    getProjectsByUserId: 'projectUsers/getProjectsByUserID/',
    projectGetUsers: 'projectUsers/getUsersByProjectID',
    projectSearch: 'project/search',
    projectUserSave: 'projectUsers/save',
    // getUsersBySupervisor: 'projectUsers/getUsersBySupervisor',
    projectUserUpdate: 'projectUsers/update',
    projectUserDelete: 'projectUsers/delete',

    unreadNotifications: 'notifications/unreads',
    markReadNotifications: 'notifications/markRead',

    holidays: 'holidays',
    holidaysRequest: 'holidays/request',
    holidaysApprove: 'holidays/approve',
    holidaysReject: 'holidays/reject',

    // getCalendars : 'calendar/getCalendars',
    getCalendarById : 'calendar/getCalendarById/',
    getRefreshCalendarData : 'calendar/getRefreshCalendarData',
    getCalendarsNames : 'calendar/getCalendarNames/',
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
( function () {
    'use strict';
    angular
        .module( 'hours.calendar', [] )
        .config( calendarsConfig );

    calendarsConfig.$invoke = [ '$stateProvider' ];
    function calendarsConfig( $stateProvider ) {
        $stateProvider
            .state( 'calendars', { // LEO WORKING HERE
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
                    calendars : function( CalendarFactory ) {
                        return CalendarFactory.getCalendarsNames();
                    }
                }
            })

            .state( 'calendarsEdit', { // LEO WORKING HERE
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
                templateUrl: '/features/dashboard/home/home.tpl.html',
                controller: 'HomeController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    notifications: function ( DashboardFactory ) {
                        return DashboardFactory.getUnreadNotifications();
                    }
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
                    employees: function ( EmployeeManagerFactory ) {
                        return EmployeeManagerFactory.getEmployeeList();
                    }
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
                    data: function ( CalendarFactory, EmployeeManagerFactory, $stateParams, $q ) {
                        var employee    = EmployeeManagerFactory.getEmployeeFromID( $stateParams.id );
                        var enterprises = EmployeeManagerFactory.getEnterprises();
                        var supervisors = EmployeeManagerFactory.supervisorsExceptID( $stateParams.id );
                        var calendars   = CalendarFactory.getCalendarsNames();
                        return $q.all( { employee : employee, enterprises : enterprises, supervisors : supervisors, calendars : calendars } );
                    }
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
                    data: function ( EmployeeManagerFactory, $stateParams, $q ) {
                        var enterprises     = EmployeeManagerFactory.getEnterprises();
                        var supervisors     = EmployeeManagerFactory.getAllSupervisors();                        
                        var defaultPassword = EmployeeManagerFactory.getDefaultPassword();
                        return $q.all( { enterprises : enterprises, supervisors : supervisors, defaultPassword : defaultPassword } );
                    }
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
                    userProjects : function( imputeHoursFactory ){
                        return imputeHoursFactory.getProjectsByUserId();
                    }
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
            //         holidays: function (CalendarFactory) {
            //             return CalendarFactory.getUserHolidayCalendar();
            //         }
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
            getUnreadNotifications: function () {

                // var dfd = $q.defer();
                // $http.get( buildURL( 'unreadNotifications' ) )
                //     .then( function ( response ) {
                //         if ( response.data.success ) {
                //             var notificationTypes, notificationResponse;
                //             var notifications = {};
                //             response.data.notifications.forEach( function ( notification ) {
                //                 if ( angular.isUndefined( notifications[ notification.type ] )) {
                //                     notifications[notification.type] = [];
                //                 }
                //                 notifications[ notification.type ].push( notification );
                //             });
                //             notificationTypes = Object.keys( notifications );
                //             notificationResponse = { keys: notificationTypes, notifications: notifications };

                //             dfd.resolve( notificationResponse );
                //         } else {
                //             dfd.reject( response );
                //         }
                //     }, function ( err ) {
                //         dfd.reject( err );
                //     });

                // return dfd.promise;
            

            },
            markNotificationAsRead: function ( id ) {
                var dfd = $q.defer();
                $http.post( buildURL( 'markReadNotifications' ), id )
                    .then(function () {
                        dfd.resolve( true );
                    }, function ( err ) {
                        dfd.resolve( err );
                    });

                return dfd.promise;
            }
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
                                dfd.resolve( response.data.users );
                        } else {
                            dfd.reject( response );
                        }
                    }, function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            searchEmployee: function( query ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.post( buildURL( 'searchUser' ), query)
                    .then( function ( response ) {
                        if ( response.data.success ) {
                            var employees = response.data.users;
                            dfd.resolve( employees );
                        } else {
                            dfd.reject( response );
                        }
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
    }
}());

( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .factory( 'imputeHoursFactory', imputeHoursFactory );

    imputeHoursFactory.$invoke = [ '$http', '$q', 'UserFactory' ];
    function imputeHoursFactory( $http, $q, UserFactory ) {
        return {

            getProjectsByUserId: function () { // LEO WORKING HERE
                var userID = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.get( buildURL( 'getProjectsByUserId' ) + userID )
                    .then( function ( response ) {
                        dfd.resolve( response.data.projects );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },


            getTimesheets: function ( year, month ) { // LEO WORKING HERE
                var userID     = UserFactory.getUserID();
                var calendarID = UserFactory.getcalendarID();
                    
                var dfd = $q.defer();
                $http.get( buildURL( 'getTimesheets' ) + userID + '?calendarID=' + calendarID + '&year=' + year + '&month=' + month )
                    .then( function ( response ) {
                        dfd.resolve( response );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getShowDaysObj : function ( month, year, currentWeekAtFirst ) { // LEO WORKING HERE

                var months         = [ 'january' ,'february' ,'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
                var firstDay       = new Date( year, month, 1 ),
                    lastDay        = new Date( year, month + 1, 0 ),
                    totalMonthDays = lastDay.getDate(),
                    currentDay     = angular.copy( firstDay ),
                    currentMonth   = firstDay.getMonth(),
                    monthName      = months[ currentMonth ],
                    currentYear    = firstDay.getFullYear(),
                    week           = 0; // number of the week inside month

                var showDaysObj            = {};
                showDaysObj.currentWeek    = 0;
                showDaysObj.firstDay       = firstDay;
                showDaysObj.lastDay        = lastDay;
                showDaysObj.totalMonthDays = totalMonthDays;
                showDaysObj.currentMonth   = currentMonth;
                showDaysObj.currentYear    = currentYear;
                showDaysObj.monthName      = monthName;
                showDaysObj.days           = {};

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

                showDaysObj.totalMonthWeeks = week;
                // showDaysObj.currentWeek = 0;

                function addNewDay( day, week ) {
                    showDaysObj.days[ day ] = {
                                                day         : day,
                                                value       : 0,
                                                week        : week,
                                                thisMonth   : day.getMonth(),
                                                currentType : 'text' // or checkbox for 'Guardias'
                                            };
                }
                return showDaysObj;
            }
        };
    }
}());


            // getEmployeeList: function () { // LEO WAS HERE
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'getAllUsers' ) )
            //         .then( function ( response ) {
            //             if ( response.data.suweekess ) {
            //                     dfd.resolve( response.data.users );
            //             } else {
            //                 dfd.reject( response );
            //             }
            //         }, function ( err ) {
            //             dfd.reject( err );
            //         });
            //     return dfd.promise;
            // }



    // function getMonthWeeks( month, year ) {
    //     var weeks = [],
    //         firstDate = new Date( year, month, 1 ),
    //         lastDay  = new Date( year, month + 1, 0 ),
    //         totalMonthDays   = lastDay.getDate(),
    //         start     = 1,
    //         end       = 8 - firstDate.getDay();
    //    while( start <= totalMonthDays ){
    //        weeks.push( { start : start, end : end } );
    //        start = end + 1;
    //        end = end + 7;
    //        if( end > totalMonthDays ) end = totalMonthDays;
    //    }
    //     return weeks;
    // }


            // getMonthWeeksObj : function ( month, year ) { // LEO WAS HERE
            //     var months     = [ 'january' ,'february' ,'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
            //     var dataDate     =  {},
            //         firstDay     = new Date( year, month, 1 ),
            //         lastDay      = new Date( year, month + 1, 0 ),
            //         totalMonthDays      = lastDay.getDate(),
            //         currentDay   = angular.copy( firstDay ),
            //         currentMonth = firstDay.getMonth(),
            //         monthName  = months[ currentMonth ],
            //         currentYear  = firstDay.getFullYear(),
            //         week         = [];
            //         dataDate     = {
            //                 firstDay : firstDay,
            //                 currentMonth : currentMonth,
            //                 currentYear : currentYear,
            //                 monthName : monthName,
            //                 weeks : []
            //         };

            //         while( true ) {
            //             if( currentDay.getDate() == 1 && currentDay.getDay() != 1 ) { // just in case of last-month-final-days (to complete the week view)
            //                 var lastMonthFinalsDays = angular.copy( currentDay );
            //                 var tempArray = [];
            //                 while( true ) {
            //                     lastMonthFinalsDays.setDate( lastMonthFinalsDays.getDate() - 1 );
            //                     tempArray.push( new Date( lastMonthFinalsDays.getFullYear(), lastMonthFinalsDays.getMonth(), lastMonthFinalsDays.getDate() ) );
            //                     if( lastMonthFinalsDays.getDay() == 1 ) {
            //                         week = tempArray.reverse().slice();
            //                         break;
            //                     }
            //                 }
            //             }
            //             week.push( new Date( year, month, currentDay.getDate() ) );
            //             if( currentDay.getDate() == totalMonthDays ) { // when gets at last day
            //                 if( currentDay.getDay() != 0 ) { // just in case of next-month-inital-days (to complete the week view)
            //                     while( true ) {
            //                         currentDay.setDate( currentDay.getDate() + 1 );
            //                         week.push( new Date( currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() ) );
            //                         if( currentDay.getDay() == 0 ) {
            //                             break;
            //                         }
            //                     }
            //                 }
            //                 if ( week.length ) {
            //                     dataDate.weeks.push( week );
            //                 }
            //                 break;
            //             }
            //             currentDay = new Date( year, month, currentDay.getDate() + 1 );
            //             if( currentDay.getDay() == 1 ) {
            //                 dataDate.weeks.push( week );
            //                 week = [];
            //             }
            //         }
            //         return dataDate;
            // }

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
;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .controller( 'HomeController', HomeController );

    HomeController.$invoke = [ '$scope', 'UserFactory', '$state', 'notifications', 'DashboardFactory', '$i18next' ];
    function HomeController( $scope, UserFactory, $state, notifications, DashboardFactory, $i18next ) {

// $scope.fn1 = function() {
//     $i18next.changeLanguage('es');
// };
// $scope.fn2 = function() {
//     $i18next.changeLanguage('en');
// };

        // $scope.notifications = notifications;
        // $scope.user = UserFactory.getUser();

        // $scope.activeNotifications = notifications.keys[0];

        // $scope.openType = function ( type ) {
        //     $scope.activeNotifications = type;
        // };

        // $scope.isActive = function ( type ) {
        //     return $scope.activeNotifications === type && 'active';
        // };

        // $scope.openNotification = function ( notification ) {
        //     switch ( notification.type ) {
        //         case 'holiday_request' :
        //             $state.go('moderateHolidayCalendar', {
        //                 userId: notification.senderId,
        //                 filterBy: 'pending'
        //             });
        //             break;
        //         case 'hours_sent' :
        //             $state.go( 'calendarImputeHoursValidator-user', {
        //                 userId: notification.senderId,
        //                 timestamp: new Date( notification.initDate ).getTime()
        //             });
        //             break;
        //     }
        // };

        // $scope.markRead = function ( notification, type, index ) {
        //     DashboardFactory.markNotificationAsRead( { notificationId: notification._id } )
        //         .then( function () {
        //             $scope.notifications.notifications[ type ].splice( index, 1 );
        //         }, function () {

        //         });
        // };
        
    }
}());
( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'zemSidebar', zemSidebar )
        .controller( 'SidebarComponentController', SidebarComponentController );

    SidebarComponentController.$invoke = [ '$scope', 'UserFactory' ];
    function SidebarComponentController( $scope, UserFactory ) {
        $scope.username = UserFactory.getUser();
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

( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'createEmployeeController', createEmployeeController );

    createEmployeeController.$invoke = [ '$scope', '$state', 'data', '$filter', '$timeout', 'EmployeeManagerFactory' ];
    function createEmployeeController( $scope, $state, data, $filter, $timeout, EmployeeManagerFactory ) {

        $scope.companies = data.enterprises;
        $scope.supervisors = data.supervisors;

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
            $scope.employee.error = false;
            $scope.employee.alreadyExists = false;
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
            
            EmployeeManagerFactory.createEmployee( $scope.employee )
                .then( function ( data ) {
                    if( data.success ) {
                        $scope.employee.success = true;
                        $timeout( function () {
                            $state.go( 'employeeManager' );
                        }, 2500 );
                    } else {
                        $scope.employee.alreadyExists = true;
                    }
                })
                .catch( function ( err ) {
                    $scope.employee.error = true;
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
            $scope.employee.error = false;
            EmployeeManagerFactory.updateEmployee( $scope.employee )
                .then( function () {
                        $scope.employee.success = true;
                        $timeout( function () {
                            $state.go( 'employeeManager' );
                        }, 2500 );
                    })
                .catch( function () {
                        $scope.employee.error = true;
                    });
        };

    }
}());
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

( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'listEmployeeController', listEmployeeController );
        // .directive('myRole', myRole);

    listEmployeeController.$invoke = [ '$scope', 'employees', 'EmployeeManagerFactory', '$timeout', '$filter', '$window' ];
    function listEmployeeController( $scope, employees, EmployeeManagerFactory, $timeout, $filter ,$window ) {

        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage(),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'employeeManagerListPage' ) || 0
        };

        function getItemsPerPage() {
            return Math.floor( window.innerHeight / 65 ).toString();
        };

        $scope.search = {};
        $scope.employees = employees;
        $scope.var = false;
        setUsersView();

        $scope.toggleAdvancedSearch = function () {
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
            if ( !$scope.showAdvancedSearch ) {
                $scope.employees = employees;
            } else {
                $scope.avancedSearch();
            }
        };

        $scope.avancedSearch = function () {
            EmployeeManagerFactory.searchEmployee( $scope.search )
                .then( function ( foundEmployees ) {
                    $scope.employees = foundEmployees;
                });
        };

        $timeout( function () { // ???
            $( '[ng-click="stepPage(-numberOfPages)"]' ).text( $filter( 'i18next' )( 'actions.nextPage' ) );
            $( '[ng-click="stepPage(numberOfPages)"]'  ).text( $filter( 'i18next' )( 'actions.lastPage' ) );
        });

        $scope.pageGetUp = function() {
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
        };

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

        var wrapper = document.getElementById( 'section' );
        wrapper.onscroll = function ( event ) {
            // if ( wrapper.scrollTop + window.innerHeight >= wrapper.scrollHeight ) {
            if ( wrapper.scrollTop >= 400 ) {
                $( '#toUpButton' ).fadeIn( 'slow' );
            }
                if ( wrapper.scrollTop < 400 ) {
            $( '#toUpButton' ).fadeOut( 'slow' );
            }
        };

}

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
                    console.log('Great');
                    $scope.recoveryForm.success = true;
                    
                    $timeout( function ( data ) {
                        $state.go( 'login' );
                    }, 5000 );

                })
                .catch( function ( err ) {
                    console.log('Shit');
                    $scope.recoveryForm.error = err;
                });
        };
    }
}());
( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'UserProfileController', UserProfileController );

    UserProfileController.$invoke = [ '$scope', 'UserFactory', '$filter', '$timeout', '$rootScope' ];
    function UserProfileController( $scope, UserFactory, $filter, $timeout, $rootScope ) {


        var originalUsername;
        $scope.showPwdContent = false;
        $scope.changePassword = {};
        $scope.changePassword.displayMessage = 0;
        $scope.changePassword.messageToDisplay = '';

        $timeout( function () {
            $scope.user = angular.copy( UserFactory.getUser() );
            originalUsername = angular.copy( $scope.user.username );
            // On birthdate input, uib-datepicker-popup="dd/MM/yyyy" makes userProfileForm.birthdate = $invalid (I do not why)
            // so, assigning date in this way take the problem away
            $scope.user.birthdate = new Date($scope.user.birthdate);
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

        // function loadFields() {
        //     $scope.formFields = {
        //         username: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         name: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         surname: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         birthdate: {
        //             element: 'date',
        //             type: 'date'
        //         },
        //         nif: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         sex: {
        //             element: 'select',
        //             options: [
        //                 {
        //                     // label: $filter('i18next')('user.genre_male'),
        //                     label: i18next.t('user.genre_male'),
        //                     slug: 'male'
        //                 },
        //                 {
        //                     label: $filter('i18next')('user.genre_female'),
        //                     slug: 'female'
        //                 }
        //             ]
        //         },
        //         locale: {
        //             element: 'select',
        //             options: [
        //                 {
        //                     label: $filter('i18next')('locale.es'),
        //                     slug: 'es'
        //                 },
        //                 {
        //                     label: $filter('i18next')('locale.en'),
        //                     slug: 'en'
        //                 },
        //                 {
        //                     label: $filter('i18next')('locale.ca'),
        //                     slug: 'ca'
        //                 }
        //             ]
        //         }
        //     };
        // }

       // $timeout( function () {
       //      loadFields();
       //  }, 500 );

        $scope.open = function () {
            $scope.status.opened = true;
        };

        $scope.status = {
            opened: false
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            orientation: "bottom left",
            startingDay: 1,
            showWeeks: false
        };

        //$scope.$watch('user', function(value){
        //    if(value.name === redName){
        //        $i18next.options.lng = 'prt';
        //        $i18next.options.resGetPath = '/assets/locale/prt.json';
        //    }
        //}, true);

        $scope.changePassClick = function() {
            $scope.showPwdContent = !$scope.showPwdContent;
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
        };

        $scope.save = function () {
            if ( $scope.flag ) return;
            $scope.profileStatus = 0;
            UserFactory.saveProfile( $scope.user )
                .then( function ( data ) {
                    console.log( data );
                    $scope.profileStatus = 1;
                })
                .catch( function( err ) {
                    console.log( err );
                    $scope.profileStatus = 2;                    
                })
                .finally( function() {
                    $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
                });
        };

        function usernameValidation( event ) {
            if ( $scope.user.username ) { // if valid email comes here...
                var emailToVerify = $scope.user.username.trim();
                if ( emailToVerify != originalUsername ) { // if originalEmail != introducedEmail continues to API to verify that email not exists
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

        $scope.processPWDChange = function() {
            $scope.changePassword.displayMessage = 0;
            $scope.changePassword.messageToDisplay = '';

            if ( $scope.changePassword.new != $scope.changePassword.confirm ) {
                $scope.changePassword.displayMessage = -1;
                $scope.changePassword.messageToDisplay = 'newConfirmNotMatching';
            } else {
                UserFactory
                    .doChangePassword( $scope.changePassword )
                    .then( function( data ) {
                        if ( data.data.success ) {
                            $scope.changePassword.displayMessage = 1;
                            $scope.changePassword.messageToDisplay = 'success';
                            $timeout( function() {
                                $scope.showPwdContent = false;
                            }, 3500);
                        } else {
                            $scope.changePassword.displayMessage = -1;
                            switch( data.data.code ) {
                                case 101:
                                    $scope.changePassword.messageToDisplay = 'userNotFound';
                                    break;
                                case 102:
                                    $scope.changePassword.messageToDisplay = 'currentPassIncorrect';
                            }
                        };
                        // for (var p in $scope.changePassword)
                            // if ($scope.changePassword.hasOwnProperty(p)) $scope.changePassword[p] = null;
                    })
                    .catch( function( err ) {
                        $scope.changePassword.displayMessage = -1;
                        $scope.changePassword.messageToDisplay = 'error';
                    });
            };
        };


// $scope.fn = function() {
    // $timeout(function() {
       // $rootScope.userProfileForm.birthdate.$setValidity('required', true);
       // $scope.userProfileForm.birthdate.$setValidity('required', false);
       // $scope.userProfileForm.birthdate.$setValidity("birthdate", false);
    // })
// };

    }
}());
;( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'editCalendarsController', editCalendarsController );

    editCalendarsController.$invoke = [ '$scope', 'CalendarFactory', '$stateParams', 'UserFactory', '$timeout', '$state', '$http' ];
    function editCalendarsController( $scope, CalendarFactory, $stateParams, UserFactory, $timeout, $state, $http ) {

        var eventDates;
        var eventHours;
        $scope.loadingError = false;
        var currentYear     = new Date().getFullYear();
        $scope.yearShowed   = currentYear.toString();
        var locale      = UserFactory.getUser().locale;
        var monthsArray = [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
        var types       = { working : 'L-J', special : '', intensive : 'L-V', friday : 'V' };

        getCalendar( currentYear );
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
                    $scope.monthsHours.push( { month : monthsArray[ month ], hours : eventHours.totalWorkingHours[ month ].hours, minutes : eventHours.totalWorkingHours[ month ].minutes } );
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
            // showCalendars();
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

//***************************************************************************************
//******************************************** selectedDay ******************************
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
//***************************************************************************************
//***************************************************************************************

}

})();

( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'CalendarsController', CalendarsController );

    CalendarsController.$invoke = [ '$scope', '$filter', '$window', 'CalendarFactory', 'calendars' ];
    function CalendarsController( $scope, $filter, $window, CalendarFactory, calendars ) {

        $scope.calendars = calendars;
        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage(),
            maxPages: "2",
            fillLastPage: false
            // currentPage: $scope.tmpData( 'get', 'employeeManagerListPage' ) || 0
        };

        function getItemsPerPage() {
            return Math.floor( window.innerHeight / 65 ).toString();
        };

        // $scope.search = {};
        // $scope.employees = employees;
        // $scope.var = false;
        setUsersView();

        $scope.toggleAdvancedSearch = function () {
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
            // if ( !$scope.showAdvancedSearch ) {
            //     $scope.employees = employees;
            // } else {
            //     $scope.avancedSearch();
            // }
        };

        // $scope.avancedSearch = function () {
        //     EmployeeManagerFactory.searchEmployee( $scope.search )
        //         .then( function ( foundEmployees ) {
        //             $scope.employees = foundEmployees;
        //         });
        // };

        // $timeout( function () { // ???
        //     $( '[ng-click="stepPage(-numberOfPages)"]' ).text( $filter( 'i18next' )( 'actions.nextPage' ) );
        //     $( '[ng-click="stepPage(numberOfPages)"]'  ).text( $filter( 'i18next' )( 'actions.lastPage' ) );
        // });

        // $scope.pageGetUp = function() {
        //     $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
        // };

        // $scope.$on( '$destroy', function () {
        //     $scope.tmpData( 'add', 'employeeManagerListPage', $scope.tableConfig.currentPage );
        // });

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

        // var wrapper = document.getElementById( 'section' );
        // wrapper.onscroll = function ( event ) {
        //     // if ( wrapper.scrollTop + window.innerHeight >= wrapper.scrollHeight ) {
        //     if ( wrapper.scrollTop >= 400 ) {
        //         $( '#toUpButton' ).fadeIn( 'slow' );
        //     }
        //         if ( wrapper.scrollTop < 400 ) {
        //     $( '#toUpButton' ).fadeOut( 'slow' );
        //     }
        // };

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

