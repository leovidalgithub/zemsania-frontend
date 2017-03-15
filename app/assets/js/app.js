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
            'ngAnimate',
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
            // 'hours.calendar',
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

    dayGet: 'dailyReport/get',
    dayGetByUser: 'dailyReport/getByUserID',
    dayImpute: 'dailyReport/impute',
    dayValidate: 'dailyReport/validateByUserID',
    dayReject: 'dailyReport/reject',
    daySend: 'dailyReport/send',
    getDailyConcepts: 'dailyReport/getDailyConcepts',

    projectSearch: 'project/search',
    projectGetUsers: 'projectUsers/getUsersByProjectID',
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

function loadPermissions(Permission, UserFactory) { // Permission -> PermRoleStore
    'use strict';
    Permission.defineRole('anonymous', function () {
        return !UserFactory.getUser();
    });

    Permission.defineRole('employee', function () {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'employee') {
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
                    data: function ( EmployeeManagerFactory, $stateParams, $q ) {
                        var employee    = EmployeeManagerFactory.getEmployeeFromID( $stateParams.id );
                        var enterprises = EmployeeManagerFactory.getEnterprises();
                        var supervisors = EmployeeManagerFactory.supervisorsExceptID( $stateParams.id );
                        return $q.all( { employee : employee, enterprises : enterprises, supervisors : supervisors } );
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

(function () {
    'use strict';
    angular
        .module('hours.dashboard', [])
        .config(dashboardConfig);

    dashboardConfig.$invoke = ['$stateProvider'];
    function dashboardConfig($stateProvider) {
        $stateProvider
            .state('dashboard', {
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
                    notifications: function (DashboardFactory) {
                        return DashboardFactory.getUnreadNotifications();
                    }
                }
            });
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
            doLogout: function () {
                delete $localStorage.User;
            },
            doLogin: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();
                $http
                    .post( buildURL( 'login' ), credentials )
                    .then( function ( response ) {
                        if ( response.data.success) {
                            var userModel = response.data.user;

                            if ( userModel.roles.indexOf( 'ROLE_USER' ) > -1) {
                                userModel.role = 'user';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_MANAGER' ) > -1) {
                                userModel.role = 'manager';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_DELIVERY' ) > -1) {
                                userModel.role = 'delivery';
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

(function () {
    'use strict';
    angular
        .module('hours.dashboard')
        .factory('DashboardFactory', DashboardFactory);

    DashboardFactory.$invoke = ['$http', '$q'];
    function DashboardFactory($http, $q) {
        return {
            getUnreadNotifications: function () {
                var dfd = $q.defer();
                $http
                    .get(buildURL('unreadNotifications'))
                    .then(function (response) {
                        if (response.data.success) {
                            var notificationTypes, notificationResponse;
                            var notifications = {};
                            response.data.notifications.forEach(function (notification) {
                                if (angular.isUndefined(notifications[notification.type])) {
                                    notifications[notification.type] = [];
                                }

                                notifications[notification.type].push(notification);
                            });
                            notificationTypes = Object.keys(notifications);
                            notificationResponse = {keys: notificationTypes, notifications: notifications};

                            dfd.resolve(notificationResponse);
                        } else {
                            dfd.reject(response);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            markNotificationAsRead: function (id) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('markReadNotifications'), id)
                    .then(function () {
                        dfd.resolve(true);
                    }, function (err) {
                        dfd.resolve(err);
                    });

                return dfd.promise;
            }
        };
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
( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'editEmployeeController', editEmployeeController );

    editEmployeeController.$invoke = [ '$scope', '$state', 'data', '$filter', '$timeout', 'EmployeeManagerFactory' ];
    function editEmployeeController( $scope, $state, data, $filter, $timeout, EmployeeManagerFactory ) {
        
        $scope.companies = data.enterprises;
        $scope.supervisors = data.supervisors;

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
            return Math.floor( window.innerHeight / 60 ).toString();
        };

        $scope.search = {};
        $scope.employees = employees;
        $scope.var = false;
        setUsersView();

        $scope.toggleAdvancedSearch = function () {
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

(function () {
    'use strict';
    angular
        .module('hours.dashboard')
        .controller('HomeController', HomeController);

    HomeController.$invoke = ['$scope', 'UserFactory', '$state', 'notifications', 'DashboardFactory', '$i18next'];
    function HomeController($scope, UserFactory, $state, notifications, DashboardFactory, $i18next) {

// $scope.fn1 = function() {
//     $i18next.changeLanguage('es');
// };
// $scope.fn2 = function() {
//     $i18next.changeLanguage('en');
// };

        $scope.notifications = notifications;
        $scope.user = UserFactory.getUser();

        $scope.activeNotifications = notifications.keys[0];

        $scope.openType = function (type) {
            $scope.activeNotifications = type;
        };

        $scope.isActive = function (type) {
            return $scope.activeNotifications === type && 'active';
        };

        $scope.openNotification = function (notification) {
            switch (notification.type) {
                case 'holiday_request' :
                    $state.go('moderateHolidayCalendar', {
                        userId: notification.senderId,
                        filterBy: 'pending'
                    });
                    break;
                case 'hours_sent' :
                    $state.go('calendarImputeHoursValidator-user', {
                        userId: notification.senderId,
                        timestamp: new Date(notification.initDate).getTime()
                    });
                    break;
            }
        };

        $scope.markRead = function (notification, type, index) {
            DashboardFactory.markNotificationAsRead({notificationId: notification._id})
                .then(function () {
                    $scope.notifications.notifications[type].splice(index, 1);
                }, function () {

                });
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

