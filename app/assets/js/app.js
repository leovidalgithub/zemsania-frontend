function setFormlyConfig(formlyConfig) {
    'use strict';
    var types = {
        datepicker: function() {
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
                ngModelAttrs[camelize(attr)] = { attribute: attr };
            });

            angular.forEach(bindings, function(binding) {
                ngModelAttrs[camelize(binding)] = { bound: binding };
            });

            formlyConfig.setType({
                name: 'datepicker',
                templateUrl: '/features/components/formly/templates/datepicker.html',
                wrapper: ['bootstrapLabel', 'bootstrapHasError'],
                defaultOptions: {
                    ngModelAttrs: ngModelAttrs,
                    templateOptions: {
                        datepickerOptions: {
                            format: 'dd/MM/yyyy',
                            showWeeks: false,
                            showButtonBar: false,
                            startingDay: 1
                        }
                    }
                },
                controller: ['$scope', function($scope) {
                    $scope.datepicker = {};

                    $scope.datepicker.opened = false;

                    $scope.datepicker.open = function() {
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

    passwordReset: 'user/password',
    getAllUsers: 'user/all',
    saveUser: 'user/profile',
    searchUser: 'user/search',
    removeUser: 'user/delete',

    dayGet: 'dailyReport/get',
    dayGetByUser: 'dailyReport/getByUserID',
    dayImpute: 'dailyReport/impute',
    dayValidate: 'dailyReport/validateByUserID',
    dayReject: 'dailyReport/reject',
    daySend: 'dailyReport/send',
    getDailyConcepts: 'dailyReport/getDailyConcepts',

    projectSearch: 'project/search',
    projectGet: 'project/get',

    getUserProjects: 'projectUsers/getProjectsByUserID',
    projectGetUsers: 'projectUsers/getUsersByProjectID',
    projectUserSave: 'projectUsers/save',
    getUsersBySupervisor: 'projectUsers/getUsersBySupervisor',
    projectUserUpdate: 'projectUsers/update',
    projectUserDelete: 'projectUsers/delete',

    timesheetSubmit: 'timesheets',
    timesheetSubmitBulk: 'timesheets/saveBulk',
    timesheetUpdateBulk: 'timesheets/updateBulk',
    timesheetGet: 'timesheets',
    timesheetQuery: 'timesheets/query',
    timesheetAggregate: 'timesheets/aggregate',
    timesheetExport: 'timesheets/exportUserTimesheets',
    timesheetExportDownload: 'files/downloadExportedTimesheetReport',

    holidayScheme: 'holidaySchemes/',
    holidaySchemeSubmit: 'holidaySchemes',
    holidaySchemeQuery: 'holidaySchemes/query',
    holidaySchemeSetDefault: 'holidaySchemes/setDefault/',
    holidaySchemeHolidays: 'holidaySchemes/getSchemeHolidays/',

    holidaySchemeEntrySubmit: 'holidaySchemes/schemeEntry',
    holidaySchemeEntryQuery: 'holidaySchemes/schemeEntry/query',
    holidaySchemeEntry: 'holidaySchemes/schemeEntry/',

    workloadScheme: 'workloadSchemes/',
    workloadSchemeSubmit: 'workloadSchemes',
    workloadSchemeQuery: 'workloadSchemes/query',
    workloadSchemeSetDefault: 'workloadSchemes/setDefault/',

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

    filesUpload: 'files/upload',
    filesView: 'files/view',
    filesRemove: 'files/remove'

};

//var redName = 'red beard';

function buildURL(path) {
    'use strict';
    return API_base + API_paths[path];
}

function buildQuery(data, isAppended) {
    var querydata = !isAppended ? "?" : "";
    for (var key in data)
        if (data.hasOwnProperty(key)) {
            if (data[key] && data[key].constructor == Object) {
                querydata += buildQuery(data[key], true);
            } else querydata += key + "=" + data[key] + "&";
        }
    return (querydata = querydata.substr(0, querydata.length - 1));
}

function serialize(obj, prefix) {
    var str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

function loadPermissions(Permission, UserFactory) {
    'use strict';
    Permission.defineRole('anonymous', function() {
        return !UserFactory.getUser();
    });

    Permission.defineRole('employee', function() {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'employee') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole('manager', function() {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'manager') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole('administrator', function() {
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
    $rootScope.tmpData = function(method, key, value) {
        switch (method) {
            case 'add':
                tmpDataObject[key] = value;
                break;
            case 'remove':
                delete tmpDataObject[key];
                break;
            case 'get':
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
/*global loadPermissions:true*/
/*global setFormlyConfig:true*/
/*global tmpData:true*/

(function() {
    'use strict';
    angular
        .module('hours', [
            'ui.router',
            'ngAnimate',
            'ngStorage',
            'permission',
            'angular-loading-bar',
            'ngSanitize',
            'jm.i18next',
            'ui.bootstrap',
            'ui.calendar',
            'angular-table',
            'tmh.dynamicLocale',
            'monospaced.elastic',
            'formly',
            'formlyBootstrap',
            'ngFileSaver',

            'hours.auth',
            'hours.timesheet',
            'hours.projectWorkflow',
            'hours.errors',
            'hours.dashboard',
            'hours.components',
            'hours.employeeManager',
            'hours.calendar',
            'hours.holidaySchemes',
            'hours.workloadSchemes',
            'hours.employeeTimesheets',
            'hours.projectTimesheets',
            'hours.reports',
            'hours.projects',
            'hours.excelExport',
            'toggle-switch'
        ])
        .config(appConfig)
        .run(appRun)

    // app filters
    .filter('range', function() {
        return function(input, total) {
            total = parseInt(total);

            for (var i = 0; i < total; i++) {
                input.push(i);
            }

            return input;
        };
    })

    appConfig.$invoke = ['$locationProvider', '$i18nextProvider', 'cfpLoadingBarProvider', '$urlRouterProvider', 'tmhDynamicLocaleProvider'];

    function appConfig($locationProvider, $i18nextProvider, cfpLoadingBarProvider, $urlRouterProvider, tmhDynamicLocaleProvider) {
        $urlRouterProvider.otherwise(function($injector) {
            var $state = $injector.get("$state");
            $state.transitionTo('login');
        });

        // $locationProvider.html5Mode({
        //     enabled: true,
        //     requireBase: false
        // });

        $i18nextProvider.options = {
            lng: 'es',
            useCookie: false,
            useLocalStorage: false,
            fallbackLng: 'es',
            resGetPath: '/assets/locale/__lng__.json',
            defaultLoadingValue: 'loading'
        };

        cfpLoadingBarProvider.includeSpinner = false;

        tmhDynamicLocaleProvider.localeLocationPattern('/angular/i18n/angular-locale_{{locale}}.js');

    }

    appRun.$invoke = ['permission', 'UserFactory', '$rootScope', '$http', 'tmhDynamicLocale', 'formlyConfig', '$uibModal'];

    function appRun(Permission, UserFactory, $rootScope, $http, tmhDynamicLocale, formlyConfig, $uibModal) {
        $rootScope.$on('$stateChangePermissionStart', function(event, args) {
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

            tmhDynamicLocale.set(locale);

            $rootScope.toggleSidebarStatus = false;
        });

        $rootScope.toggleSidebarStatus = false;
        $rootScope.toggleMobileSidebar = function() {
            $rootScope.toggleSidebarStatus = !$rootScope.toggleSidebarStatus;
        };

        loadPermissions(Permission, UserFactory);
        tmpData($rootScope);
        setFormlyConfig(formlyConfig);

        $rootScope.confirm = function(title, message, opt) {
            if (!opt) opt = {};
            var _popup = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/features/components/prompts/confirm.tpl.html',
                controller: function($scope, $uibModalInstance) {
                    $scope.title = title || 'Confirm';
                    $scope.message = message || 'Are you sure you want to continue ?';

                    $scope.confirmLabel = opt.confirmLabel || 'Guardar';

                    $scope.save = function() {
                        $uibModalInstance.close();
                    }
                    $scope.close = function() {
                        $uibModalInstance.dismiss()
                    }
                },
                backdrop: 'static',
                size: 'md'
            });

            return _popup.result;
        }

        $rootScope.alert = function(message) {
            var _popup = $uibModal.open({
                animation: true,
                ariaDescribedBy: 'modal-body',
                templateUrl: '/features/components/prompts/alert.tpl.html',
                controller: function($scope, $uibModalInstance) {
                    $scope.message = message || '';
                    $scope.close = function() {
                        $uibModalInstance.dismiss()
                    }
                },
                size: 'md'
            });
        }
    }
}());
(function() {
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
                controller: function($state, UserFactory) {
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
(function() {
    'use strict';
    angular
        .module('hours.calendar', [])
        .config(calendarConfig);

    calendarConfig.$invoke = ['$stateProvider'];

    function calendarConfig($stateProvider) {
        $stateProvider
            .state('calendarImputeHours', {
                url: '/impute-hours',
                templateUrl: '/features/calendar/imputHours/imputeHours.tpl.html',
                controller: 'CalendarImputHoursController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    dailyConcepts: function(CalendarFactory) {
                        return CalendarFactory.getDailyConcepts();
                    }
                }
            })
            .state('calendarImputeHoursValidator', {
                url: '/impute-hours-validator',
                templateUrl: '/features/calendar/imputeHoursValidator/imputeHoursValidator.tpl.html',
                controller: 'ImputHoursValidatorController',
                data: {
                    template: 'complex',
                    permissions: {
                        only: ['administrator', 'manager'],
                        redirectTo: 'login'
                    }
                }
            })
            .state('calendarImputeHoursValidator-user', {
                url: '/impute-hours-validator/:userId/:timestamp',
                templateUrl: '/features/calendar/imputeHoursValidator/imputeHoursValidator.tpl.html',
                controller: 'ImputHoursValidatorController',
                data: {
                    template: 'complex',
                    permissions: {
                        only: ['administrator', 'manager'],
                        redirectTo: 'login'
                    }
                }
            })
            .state('holidayCalendar', {
                url: '/holiday-calendar',
                templateUrl: '/features/calendar/holidayCalendar/holidayCalendar.tpl.html',
                controller: 'HolidayCalendarController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    holidays: function(CalendarFactory) {
                        return CalendarFactory.getUserHolidayCalendar();
                    }
                }
            })
            .state('moderateHolidayCalendar', {
                url: '/moderate-holiday-calendar',
                templateUrl: '/features/calendar/moderateHolidayCalendar/moderateHolidayCalendar.tpl.html',
                controller: 'ModerateHolidayCalendarController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                params: {
                    userId: null,
                    filterBy: null
                }
            })
            .state('calendarCreator', {
                url: '/calendar-creator',
                templateUrl: '/features/calendar/calendarCreator/calendarCreator.tpl.html',
                controller: 'CalendarCreatorController',
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

(function() {
    'use strict';
    angular
        .module('hours.components', [])
        .directive('roleAuth', roleAuth);

    function roleAuth(UserFactory) {
        return {
            restrict: 'A',
            scope: {
                'roleAuth': '@'
            },
            link: function compile(scope, element, attrs) {
                var authRoles = JSON.parse(attrs.roleAuth.replace(/'/g, '"'));
                var userRole = UserFactory.getUser().role;

                if (angular.isDefined(authRoles.only) && authRoles.only.indexOf(userRole) < 0) {
                    element.remove();
                }
                if (angular.isDefined(authRoles.except) && authRoles.except.indexOf(userRole) >= 0) {
                    element.remove();
                }
            }
        };
    }
}());
(function() {
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
                    notifications: function(DashboardFactory) {
                        return DashboardFactory.getUnreadNotifications();
                    }
                }
            });
    }
}());

(function() {
    'use strict';
    angular
        .module('hours.employeeManager', [])
        .config(emConfig);

    emConfig.$invoke = ['$stateProvider'];

    function emConfig($stateProvider) {
        $stateProvider
            .state('employeeManager', {
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
                    employees: function(EmployeeManagerFactory) {
                        return EmployeeManagerFactory.getEmployeeList();
                    }
                }
            })

        .state('employeeManagerEdit', {
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
                    employee: function(EmployeeManagerFactory, $stateParams) {
                        return EmployeeManagerFactory.getEmployeeFromID($stateParams.id);
                    }
                }
            })
            .state('employeeManagerCreate', {
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
                }
            });
    }
}());

(function() {
    'use strict';
    angular
        .module('hours.errors', [])
        .config(errorsConfig)
        .run(runConfig);

    errorsConfig.$invoke = ['$stateProvider'];

    function errorsConfig($stateProvider) {
        $stateProvider
            .state('errorNotFound', {
                url: '/error404',
                templateUrl: '/features/errors/404/404.tpl.html',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })
            .state('errorResolve', {
                url: '/error500',
                templateUrl: '/features/errors/500/500.tpl.html',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            });
    }

    function runConfig($rootScope, $state) {
        $rootScope.$on('$stateChangeError', function() {
            $state.go('errorResolve');
        });
    }

}());

(function() {
    'use strict';
    angular
        .module('hours.excelExport', [])
        .config(excelExportConfig);

    excelExportConfig.$invoke = ['$stateProvider'];

    function excelExportConfig($stateProvider) {
        $stateProvider
            .state('comboSelectorExport', {
                url: '/export',
                controller: 'ComboSelectorController',
                templateUrl: '/features/excelExport/comboSelector/comboSelector.tpl.html',
                data: {
                    template: 'complex',
                    permissions: {
                        only: ['administrator', 'manager'],
                        redirectTo: 'dashboard'
                    }
                }
            });
    }
}());

(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow', [])
        .config(projectWorkflowConfig);

    projectWorkflowConfig.$invoke = ['$stateProvider'];

    function projectWorkflowConfig($stateProvider) {
        $stateProvider
            .state('offers', {
                url: '/workflow/offers',
                templateUrl: '/features/projectWorkflow/offers/list/offers.tpl.html',
                controller: 'WfOffersController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    enterprises: function(WorkFlowFactory) {
                        return WorkFlowFactory.getMasterCollection('enterprises');
                    }
                }
            })
            .state('offersEditor', {
                url: '/workflow/offers/:id',
                templateUrl: '/features/projectWorkflow/offers/editor/offersEditor.tpl.html',
                controller: 'WfOffersEditorController',
                params: {
                    readonly: false
                },
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })

        .state('project', {
                url: '/workflow/project',
                templateUrl: '/features/projectWorkflow/project/list/project.tpl.html',
                controller: 'WfProjectController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })
            .state('projectEditor', {
                url: '/workflow/project/:id',
                templateUrl: '/features/projectWorkflow/project/editor/projectEditor.tpl.html',
                controller: 'WfProjectEditorController',
                params: {
                    readonly: false
                },
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })

        .state('prospect', {
                url: '/workflow/prospect',
                templateUrl: '/features/projectWorkflow/prospect/list/prospect.tpl.html',
                controller: 'WfProspectController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })
            .state('prospectEditor', {
                url: '/workflow/prospect/:id',
                templateUrl: '/features/projectWorkflow/prospect/editor/prospectEditor.tpl.html',
                controller: 'WfProspectEditorController',
                params: {
                    readonly: false
                },
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })

        .state('training', {
                url: '/workflow/training',
                templateUrl: '/features/projectWorkflow/training/list/training.tpl.html',
                controller: 'WfTrainingController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
            })
            .state('trainingEditor', {
                url: '/workflow/training/:id',
                templateUrl: '/features/projectWorkflow/training/editor/trainingEditor.tpl.html',
                controller: 'WfTrainingEditorController',
                params: {
                    readonly: false
                },
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

(function() {
    'use strict';
    angular
        .module('hours.projects', [])
        .config(projectsConfig);

    projectsConfig.$invoke = ['$stateProvider'];

    function projectsConfig($stateProvider) {
        $stateProvider
            .state('projectAssign', {
                url: '/projects/assign',
                templateUrl: '/features/projects/projectAssign/projectAssign.tpl.html',
                controller: 'ProjectAssignController',
                data: {
                    template: 'complex',
                    permissions: {
                        only: ['administrator', 'manager'],
                        redirectTo: 'dashboard'
                    }
                }
            });
    }
}());

(function() {
    'use strict';
    angular
        .module('hours.reports', [])
        .config(reportsConfig);

    reportsConfig.$invoke = ['$stateProvider'];

    function reportsConfig($stateProvider) {
        $stateProvider
            .state('userSpents', {
                url: '/spents',
                templateUrl: '/features/reports/spents/list/spents.tpl.html',
                controller: 'SpentsController',
                data: {
                    state: 'userSpents',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    userSpents: function(ReportsFactory) {
                        return ReportsFactory.getUserSpents();
                    },
                    spentsTypes: function(ReportsFactory) {
                        return ReportsFactory.getSpentsTypes();
                    }
                }
            })
            .state('userSpentsByID', {
                url: '/moderate-spents',
                templateUrl: '/features/reports/spents/moderator/moderator.tpl.html',
                controller: 'ModeratorSpentsController',
                data: {
                    state: 'userSpentsByID',
                    template: 'complex',
                    permissions: {
                        only: ['administrator', 'manager'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    spentsTypes: function(ReportsFactory) {
                        return ReportsFactory.getSpentsTypes();
                    },
                    users: function(EmployeeManagerFactory) {
                        return EmployeeManagerFactory.getUsersBySupervisor();
                    }
                }
            })
            .state('userSpentsEdit', {
                url: '/spents/:spentId',
                templateUrl: '/features/reports/spents/editor/spentsEditor.tpl.html',
                controller: 'SpentsEditorController',
                data: {
                    state: 'userSpents',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    spentsTypes: function(ReportsFactory) {
                        return ReportsFactory.getSpentsTypes();
                    },
                    spent: function(ReportsFactory, $stateParams) {
                        return ReportsFactory.getSpent($stateParams.spentId);
                    }
                }
            })

        .state('userAbsences', {
                url: '/absences',
                templateUrl: '/features/reports/absences/list/absences.tpl.html',
                controller: 'AbsencesController',
                data: {
                    state: 'userAbsences',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    userAbsences: function(ReportsFactory) {
                        return ReportsFactory.getUserAbsences();
                    },
                    absencesTypes: function(ReportsFactory) {
                        return ReportsFactory.getAbsencesTypes();
                    }
                }
            })
            .state('userAbsencesByID', {
                url: '/moderate-absences',
                templateUrl: '/features/reports/absences/moderator/moderator.tpl.html',
                controller: 'ModeratorAbsencesController',
                data: {
                    state: 'userAbsencesByID',
                    template: 'complex',
                    permissions: {
                        only: ['administrator', 'manager'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    absencesTypes: function(ReportsFactory) {
                        return ReportsFactory.getAbsencesTypes();
                    },
                    users: function(EmployeeManagerFactory) {
                        return EmployeeManagerFactory.getUsersBySupervisor();
                    }
                }
            })
            .state('userAbsenceEdit', {
                url: '/absences/:absencesId',
                templateUrl: '/features/reports/absences/editor/absencesEditor.tpl.html',
                controller: 'AbsencesEditorController',
                data: {
                    state: 'userAbsences',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    absencesTypes: function(ReportsFactory) {
                        return ReportsFactory.getAbsencesTypes();
                    },
                    absences: function(ReportsFactory, $stateParams) {
                        /**
                         * @param {string} $stateParams.absencesId
                         */
                        return ReportsFactory.getAbsences($stateParams.absencesId);
                    }
                }
            });
    }
}());

(function() {
    'use strict';
    angular
        .module('hours.auth')
        .factory('UserFactory', UserFactory);

    UserFactory.$invoke = ['$http', '$q', '$localStorage'];

    function UserFactory($http, $q, $localStorage) {
        return {
            getUser: function() {
                return $localStorage.User;
            },
            getUserID: function() {
                return $localStorage.User._id;
            },
            getUserToken: function() {
                return $localStorage.User.token;
            },
            doLogout: function() {
                delete $localStorage.User;
            },
            doLogin: function(credentials) {
                var dfd = $q.defer();

                $http
                    .post(buildURL('login'), credentials)
                    .then(function(response) {
                        if (response.data.success) {
                            var userModel = response.data.user;

                            if (userModel.roles.indexOf('ROLE_USER') > -1) {
                                userModel.role = 'user';
                            }

                            if (userModel.roles.indexOf('ROLE_MANAGER') > -1) {
                                userModel.role = 'manager';
                            }

                            if (userModel.roles.indexOf('ROLE_DELIVERY') > -1) {
                                userModel.role = 'delivery';
                            }

                            if (userModel.roles.indexOf('ROLE_BACKOFFICE') > -1) {
                                userModel.role = 'administrator';
                            }

                            userModel.token = response.data.token;
                            $localStorage.User = userModel;

                            dfd.resolve(userModel);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            doPasswordRecovery: function(credentials) {
                var dfd = $q.defer();

                $http
                    .post(buildURL('passwordRecovery'), credentials)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            doChangePassword: function(credentials, preventSessionRemove) {
                var dfd = $q.defer();
                var passwordReset = {
                    oldPassword: credentials.oldPassword,
                    newPassword: credentials.password
                };

                $http
                    .post(buildURL('passwordReset'), passwordReset)
                    .then(function(response) {
                        if (response.data.success) {
                            if (!preventSessionRemove) delete $localStorage.User;
                            dfd.resolve();
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            saveProfile: function(credentials) {
                var dfd = $q.defer();

                $http
                    .put(buildURL('saveUser'), credentials)
                    .then(function(response) {
                        if (response.data.success) {
                            $localStorage.User = credentials;
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getUsersBySupervisor: function() {
                var dfd = $q.defer();
                var email = UserFactory.getUser().username;

                $http
                    .post(buildURL('getUsersBySupervisor'), { "email": email })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.users);
                        } else {
                            dfd.reject(response.data.errors);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.timesheet', [])
        .factory('TimesheetFactory', TimesheetFactory);

    TimesheetFactory.$invoke = ['$http', '$localStorage'];

    function TimesheetFactory($http, $localStorage) {
        return {
            query: function(query) {
                return $http.post(buildURL('timesheetQuery'), { $query: query });
            },
            saveBulk: function(timesheets) {
                return $http.post(buildURL('timesheetSubmitBulk'), timesheets);
            },
            updateBulk: function(query, updates) {
                var data = { query: query, updates: updates };
                return $http.put(buildURL('timesheetUpdateBulk'), data);
            },
            exportToEmail: function(query) {
                return $http.get(buildURL('timesheetExport') + buildQuery(query));
            },
            downloadExportedReport: function(exportId) {
                if (!exportId) return;
                var downloadUri = buildURL('timesheetExportDownload') + buildQuery({ exportId: exportId });
                window.open(downloadUri, "_blank");
            },
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.calendar')
        .factory('CalendarFactory', CalendarFactory);

    CalendarFactory.$invoke = ['$http', '$q', '$filter', '$localStorage'];

    function CalendarFactory($http, $q, $filter, $localStorage) {
        return {
            getInputViewTemplate: function() {
                return '/features/calendar/imputHours/partials/' + this.getInputViewState() + '.tpl.html'
            },
            getInputViewState: function() {
                return $localStorage['imputHoursViewState'] || 'semana'
            },
            setInputViewState: function(state) {
                $localStorage['imputHoursViewState'] = state
            },
            getCalendarByDates: function(initDate, endDate, user) {
                var dfd = $q.defer();
                var dates = {
                    initDate: initDate,
                    endDate: endDate
                };
                /* global t_dates*/
                window.t_dates = dates;
                var serviceUrl = buildURL('dayGet');
                if (user) {
                    dates.userId = user;
                    serviceUrl = buildURL('dayGetByUser');
                }

                $http
                    .post(serviceUrl, dates)
                    .then(function(response) {
                        if (response.data.success) {
                            var projects = response.data.projects;
                            var dailyReports = response.data.dailyReports;
                            var datesBlocked = response.data.datesBlocked;
                            var todayDate = toGMT0(t_dates.initDate);
                            var _end = toGMT0(angular.copy(todayDate));
                            var weekEnd = toGMT0(new Date(_end.setDate(_end.getDate() + 6)));
                            //

                            var blockDates = [];
                            var serviceResponse = {};
                            var customers_matrix = [];
                            var customers = {};
                            var userProjects = [];
                            var workingDays = {};
                            //

                            datesBlocked.forEach(function(date) {
                                blockDates.push(toGMT0(date).getDay());
                            });

                            projects.forEach(function(project) {
                                var newProject = !$filter('filter')(userProjects, { projectRef: project.projectRef }, true).length;

                                if (newProject && angular.isUndefined(workingDays[project.projectRef])) {
                                    workingDays[project.projectRef] = [];
                                }

                                var projectInit = toGMT0(project.implicationInit);
                                var projectEnd;
                                if (angular.isDefined(project.implicationEnd)) {
                                    projectEnd = toGMT0(project.implicationEnd);
                                } else {
                                    var inALongTime = new Date().setFullYear(6000);
                                    projectEnd = toGMT0(inALongTime);
                                }

                                if (projectInit < todayDate) {
                                    projectInit = angular.copy(todayDate);
                                }

                                if (projectEnd > weekEnd) {
                                    projectEnd = weekEnd;
                                }

                                while (projectInit <= projectEnd) {
                                    var add = new Date(toGMT0(projectInit)).getDay();
                                    if (workingDays[project.projectRef].indexOf(add) < 0 &&
                                        blockDates.indexOf(add) < 0) {

                                        workingDays[project.projectRef].push(add);
                                    }
                                    projectInit = toGMT0(new Date(projectInit.setDate(projectInit.getDate() + 1)));
                                }

                                if (newProject) {
                                    project.days = workingDays[project.projectRef];
                                    project.reports = {};

                                    project.days.forEach(function(day) {
                                        var t_day = day - 1;
                                        t_day = t_day < 0 ? 6 : t_day;
                                        var t_initDate = new Date(t_dates.initDate);
                                        var t_date = toGMT0(new Date(t_initDate.setDate(t_initDate.getDate() + t_day)));
                                        var reportAssociated = $filter('filter')(dailyReports, {
                                            projectId: project._id,
                                            date: $filter('date')(t_date, 'yyyy-MM-dd')
                                        });

                                        project.subfamilies.forEach(function(family) {
                                            project.reports[day + '_' + family] = {
                                                date: t_date,
                                                conceptDailyId: family,
                                                projectId: project._id
                                            };
                                        });

                                        if (reportAssociated.length) {
                                            reportAssociated.forEach(function(repo) {
                                                project.reports[day + '_' + repo.conceptDailyId].units = repo.units;
                                                project.reports[day + '_' + repo.conceptDailyId].report = repo.report;
                                                project.status = reportAssociated[0].status;
                                            });

                                        }
                                    });
                                    userProjects.push(project);

                                    if (angular.isUndefined(customers[project.customerName])) {
                                        customers[project.customerName] = [];
                                    }
                                    customers[project.customerName].push(project);
                                }
                            });

                            Object.keys(customers).forEach(function(customer) {
                                var t_customer = {
                                    customerName: customer,
                                    projects: customers[customer]
                                };
                                customers_matrix.push(t_customer);
                            });

                            serviceResponse.customers = customers_matrix;
                            serviceResponse.projects = projects;

                            dfd.resolve(serviceResponse);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            saveImputedHours: function(days) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('dayImpute'), { "dailyReports": days })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data);
                        } else {
                            dfd.reject(response.data.errors);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getDailyConcepts: function() {
                var dfd = $q.defer();
                $http
                    .get(buildURL('getDailyConcepts'))
                    .then(function(response) {
                        if (response.data) {
                            dfd.resolve(response.data);
                        } else {
                            dfd.reject(response.data);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getUserHolidayCalendar: function(user) {
                var dfd = $q.defer();
                var specificUser = '';

                if (angular.isDefined(user)) {
                    specificUser = '/' + user;
                }

                $http
                    .get(buildURL('holidays') + specificUser)
                    .then(function(response) {
                        if (response.data.success) {
                            var holidays = response.data.holidays;
                            var holidaysEvents = [];

                            holidays.forEach(function(entry) {
                                var status;
                                var statusIcon;
                                switch (entry.status) {
                                    case 'requested':
                                        statusIcon = 'fa-clock-o';
                                        status = '';
                                        break;
                                    case 'approved':
                                        statusIcon = 'fa-check';
                                        status = '';
                                        break;
                                    case 'rejected':
                                        statusIcon = 'fa-times';
                                        status = '';
                                        break;
                                }

                                holidaysEvents.push({
                                    id: entry._id,
                                    title: status,
                                    status: entry.status,
                                    icon: statusIcon,
                                    start: new Date(entry.date),
                                    end: new Date(entry.date),
                                    className: 'event_' + entry.status
                                });
                            });

                            dfd.resolve(holidaysEvents);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            requestHoliday: function(event) {
                var dfd = $q.defer();

                $http
                    .post(buildURL('holidaysRequest'), { days: [event.start] })
                    .then(function(response) {
                        if (response.data.success) {
                            event.id = 'new';
                            event.end = event.start;
                            event.title = '';
                            event.status = 'requested';
                            event.className = 'event_requested';
                            dfd.resolve(event);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            removeHoliday: function(event) {
                var dfd = $q.defer();

                $http
                    .delete(buildURL('holidays') + '/' + event.id)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(event);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            updateHolidayStatus: function(type, event) {
                var dfd = $q.defer();

                $http
                    .put(buildURL('holidays') + '/' + type, { holidays: [event.id] })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(event);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            moderateImputedHours: function(dateLapse, userId, reject) {
                var dfd = $q.defer();
                var dateInterval = {
                    initDate: new Date(dateLapse[0]).toGMTString(),
                    endDate: new Date(dateLapse[1]).toGMTString(),
                    userId: userId
                };

                var destUrl = buildURL('dayValidate');
                if (angular.isDefined(reject)) {
                    destUrl = buildURL('dayReject');
                }

                $http
                    .post(destUrl, dateInterval)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            sendImputedHours: function(dateLapse) {
                var dfd = $q.defer();
                var dateInterval = {
                    initDate: new Date(dateLapse[0]).toGMTString(),
                    endDate: new Date(dateLapse[1]).toGMTString()
                };

                $http
                    .post(buildURL('daySend'), dateInterval)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.dashboard')
        .factory('DashboardFactory', DashboardFactory);

    DashboardFactory.$invoke = ['$http', '$q'];

    function DashboardFactory($http, $q) {
        return {
            getUnreadNotifications: function() {
                var dfd = $q.defer();
                $http
                    .get(buildURL('unreadNotifications'))
                    .then(function(response) {
                        if (response.data.success) {
                            var notificationTypes, notificationResponse;
                            var notifications = {};
                            response.data.notifications.forEach(function(notification) {
                                if (angular.isUndefined(notifications[notification.type])) {
                                    notifications[notification.type] = [];
                                }

                                notifications[notification.type].push(notification);
                            });
                            notificationTypes = Object.keys(notifications);
                            notificationResponse = { keys: notificationTypes, notifications: notifications };

                            dfd.resolve(notificationResponse);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            markNotificationAsRead: function(id) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('markReadNotifications'), id)
                    .then(function() {
                        dfd.resolve(true);
                    }, function(err) {
                        dfd.resolve(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.employeeManager')
        .factory('EmployeeManagerFactory', EmployeeManagerFactory);

    EmployeeManagerFactory.$invoke = ['$http', 'UserFactory', '$q'];

    function EmployeeManagerFactory($http, $q, UserFactory) {
        return {
            getEmployeeList: function() {
                var dfd = $q.defer();
                $http
                    .get(buildURL('getAllUsers'))
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.users);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            searchEmployee: function(query) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('searchUser'), query)
                    .then(function(response) {
                        if (response.data.success) {
                            var employees = response.data.users;
                            dfd.resolve(employees);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            removeEmployee: function(query) {
                var dfd = $q.defer();
                $http
                    .delete(buildURL('removeUser'), { data: query })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getEmployeeFromID: function(userID) {
                var dfd = $q.defer();
                if (!userID) {
                    dfd.reject();
                }
                $http
                    .post(buildURL('searchUser'), { _id: userID })
                    .then(function(response) {
                        if (response.data.success) {
                            var user = response.data.users[0];
                            dfd.resolve(user);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            updateEmployee: function(credentials) {
                var dfd = $q.defer();
                delete credentials.error;

                $http
                    .put(buildURL('saveUser') + '/' + credentials._id, credentials)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });


                return dfd.promise;
            },
            createEmployee: function(credentials) {
                var dfd = $q.defer();
                delete credentials.error;

                $http
                    .post(buildURL('createUser'), credentials)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });


                return dfd.promise;
            },
            getUsersBySupervisor: function() {
                var dfd = $q.defer();
                var email = UserFactory.getUser().username;

                $http
                    .post(buildURL('getUsersBySupervisor'), { "email": email })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.users);
                        } else {
                            dfd.reject(response.data.errors);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .factory('WorkFlowFactory', WorkFlowFactory);

    WorkFlowFactory.$invoke = ['$http', '$q', '$filter'];

    function WorkFlowFactory($http, $q, $filter) {
        return {
            getMasterCollection: function(collection) {
                var dfd = $q.defer();
                $http
                    .get(buildURL('getMasterCollection') + collection)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.collection);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projects')
        .factory('ProjectsFactory', ProjectsFactory);

    ProjectsFactory.$invoke = ['$http', '$q'];

    function ProjectsFactory($http, $q) {
        return {
            getProject: function(projectId) {
                var dfd = $q.defer();
                $http
                    .get(buildURL('projectGet') + '/' + projectId)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.project);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getUserProjects: function() {
                var dfd = $q.defer();
                $http
                    .get(buildURL('getUserProjects'))
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.projects);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            searchProjectByName: function(project) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('projectSearch'), { projectName: project })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.projects);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getUsersInProjectByID: function(projectID) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('projectGetUsers'), { projectId: projectID })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.users);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            addUserInProject: function(userProject) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('projectUserSave'), userProject)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            updateUserInProject: function(userProject) {
                var dfd = $q.defer();
                $http
                    .put(buildURL('projectUserUpdate'), userProject)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            deleteUserInProject: function(userProject) {
                var dfd = $q.defer();
                $http
                    .delete(buildURL('projectUserDelete'), {
                        data: userProject,
                        headers: {
                            "Content-type": "application/json; charset=utf-8"
                        }
                    })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.reports')
        .factory('ReportsFactory', ReportsFactory);

    ReportsFactory.$invoke = ['$http', '$q', '$filter', 'EmployeeManagerFactory'];

    function ReportsFactory($http, $q, $filter, EmployeeManagerFactory) {
        return {
            getUserSpents: function(userId) {
                var dfd = $q.defer();

                var userSpents = buildURL('getSpents');
                if (userId) {
                    userSpents = buildURL('getSpents') + '/' + userId;
                }

                $http.get(userSpents)
                    .then(function(response) {
                        if (response.data.success) {
                            response.data.spents.forEach(function(spent) {
                                if (spent.comment) {
                                    var ellipsis = spent.comment.length > 50 ? ' ...' : '';
                                    spent.comment = spent.comment.substring(0, 50) + ellipsis;
                                }
                            });
                            dfd.resolve(response.data.spents);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getSpent: function(spentId) {
                var dfd = $q.defer();

                if (spentId !== 'add') {
                    $http
                        .post(buildURL('getSpentById'), { _id: spentId })
                        .then(function(response) {
                            if (response.data.success) {
                                dfd.resolve(response.data.spents[0]);
                            } else {
                                dfd.reject(response);
                            }
                        }, function(err) {
                            dfd.reject(err);
                        });
                } else {
                    dfd.resolve({ newSpent: true });
                }

                return dfd.promise;
            },
            searchSpent: function(query) {
                var dfd = $q.defer();

                EmployeeManagerFactory.searchEmployee({ username: query.name })
                    .then(function(response) {
                        if (response.length) {
                            searchSpent(response[0]._id);
                        } else {
                            query.name = $filter('i18next')('user.userNotFound');
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                function searchSpent(userId) {
                    //delete query.name;
                    query.userId = userId;
                    $http
                        .post(buildURL('getSpentById'), query)
                        .then(function(response) {
                            if (response.data.success) {
                                dfd.resolve(response.data.spents);
                            } else {
                                dfd.reject(response);
                            }
                        }, function(err) {
                            dfd.reject(err);
                        });
                }

                return dfd.promise;
            },

            searchAbsences: function(query) {
                var dfd = $q.defer();

                EmployeeManagerFactory.searchEmployee({ username: query.name })
                    .then(function(response) {
                        if (response.length) {
                            searchAbsence(response[0]._id);
                        } else {
                            query.name = $filter('i18next')('user.userNotFound');
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                function searchAbsence(userId) {
                    //delete query.name;
                    query.userId = userId;
                    $http
                        .post(buildURL('getAbsencesById'), query)
                        .then(function(response) {
                            if (response.data.success) {
                                dfd.resolve(response.data.absences);
                            } else {
                                dfd.reject(response);
                            }
                        }, function(err) {
                            dfd.reject(err);
                        });
                }

                return dfd.promise;
            },
            saveSpent: function(spent) {
                var dfd = $q.defer();

                $http
                    .post(buildURL('spentsImpute'), spent)
                    .then(function(response) {
                        if (response.data.success) {
                            if (response.data.success) {
                                dfd.resolve(response.data.spent);
                            } else {
                                dfd.reject(response);
                            }
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });


                return dfd.promise;
            },
            getSpentsTypes: function() {
                var dfd = $q.defer();

                $http
                    .get(buildURL('getSpentsTypes'))
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.spentsTypes);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            updateSpent: function(method, spent) {
                var dfd = $q.defer();

                $http
                    .put(buildURL('spents') + '/' + method, { spentId: spent._id })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },

            getUserAbsences: function(userId) {
                var dfd = $q.defer();

                var userAbsences = buildURL('getAbsences');
                if (userId) {
                    userAbsences = buildURL('getAbsences') + '/' + userId;
                }

                $http.get(userAbsences)
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.absences);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getAbsences: function(absenceId) {
                var dfd = $q.defer();

                if (absenceId !== 'add') {
                    $http
                        .post(buildURL('getAbsencesById'), { _id: absenceId })
                        .then(function(response) {
                            if (response.data.success) {
                                dfd.resolve(response.data.absences[0]);
                            } else {
                                dfd.reject(response);
                            }
                        }, function(err) {
                            dfd.reject(err);
                        });
                } else {
                    dfd.resolve({ newAbsence: true });
                }

                return dfd.promise;
            },
            saveAbsences: function(absence) {
                var dfd = $q.defer();

                $http
                    .post(buildURL('absencesImpute'), absence)
                    .then(function(response) {
                        if (response.data.success) {
                            if (response.data.success) {
                                dfd.resolve(response.data.absence);
                            } else {
                                dfd.reject(response);
                            }
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });


                return dfd.promise;
            },
            getAbsencesTypes: function() {
                var dfd = $q.defer();

                $http
                    .get(buildURL('getAbsencesTypes'))
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.absences);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            updateAbsences: function(method, absence) {
                var dfd = $q.defer();

                $http
                    .put(buildURL('absences') + '/' + method, { absenceId: absence._id })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            removeSpent: function(spentId) {
                var dfd = $q.defer();
                $http
                    .delete(buildURL('spentsDelete'), { absenceId: spentId })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            removeAbsence: function(absenceId) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('absencesDelete'), { absenceId: absenceId })
                    .then(function(response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            uploadImage: function(image) {
                var dfd = $q.defer();

                var formData = new FormData();
                formData.append("file", image);

                $http({
                        url: buildURL('filesUpload'),
                        method: 'POST',
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        },
                        data: formData
                    })
                    .then(function(response) {
                        dfd.resolve(response.data.id);
                    }, function(err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.auth')
        .controller('ChangePasswordController', ChangePasswordController);

    ChangePasswordController.$invoke = ['$scope', 'UserFactory', '$state', '$timeout'];

    function ChangePasswordController($scope, UserFactory, $state, $timeout) {
        initialVertex();
        $scope.passwordForm = {
            oldPassword: null,
            password: null,
            password2: null
        };

        $scope.changePassword = function() {
            $scope.passwordForm.error = false;

            UserFactory.doChangePassword($scope.passwordForm)
                .then(function() {
                    $scope.passwordForm.success = true;

                    $timeout(function() {
                        $state.go('login');
                    }, 1500);
                }, function(err) {
                    $scope.passwordForm.error = err;
                });
        };

        $scope.$on('$destroy', function() {
            window.continueVertexPlay = false;
        });
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.auth')
        .controller('LoginController', LoginController);

    LoginController.$invoke = ['$scope', 'UserFactory', '$state', '$localStorage'];

    function LoginController($scope, UserFactory, $state, $localStorage) {
        initialVertex();
        $scope.loginForm = {
            username: null,
            password: null
        };

        $scope.loginCategory = $localStorage.loginCategory || 'standard';
        $scope.switchLoginCategory = function(cat) { $localStorage.loginCategory = $scope.loginCategory = cat; }
        $scope.isCategoryActive = function(cat) {
            return $scope.loginCategory == cat;
        }

        $scope.login = function() {
            $scope.loginForm.ldap = $scope.loginCategory === 'ldap';
            $scope.loginForm.error = false;
            $scope.loginForm.disabled = true;
            UserFactory.doLogin($scope.loginForm)
                .then(function(user) {
                    if (user.defaultPassword) {
                        $state.go('changePassword');
                    } else {
                        $state.go('dashboard');
                    }
                }, function(err) {
                    $scope.loginForm.disabled = false;
                    $scope.loginForm.error = err;
                });
        };

        $scope.$on('$destroy', function() {
            window.continueVertexPlay = false;
        });
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.auth')
        .controller('RecoveryController', RecoveryController);

    RecoveryController.$invoke = ['$scope', 'UserFactory', '$state', '$timeout'];

    function RecoveryController($scope, UserFactory, $state, $timeout) {
        initialVertex();
        $scope.recoveryForm = {
            email: null
        };

        $scope.recovery = function() {
            $scope.recoveryForm.error = false;
            $scope.recoveryForm.success = false;
            UserFactory.doPasswordRecovery($scope.recoveryForm)
                .then(function() {
                    $scope.recoveryForm.success = true;
                    $timeout(function() {
                        $state.go('login');
                    }, 1500);
                }, function(err) {
                    $scope.recoveryForm.error = err;
                });
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.auth')
        .controller('UserProfileController', UserProfileController);

    UserProfileController.$invoke = ['$scope', 'UserFactory', '$filter', '$timeout'];

    function UserProfileController($scope, UserFactory, $filter, $timeout) {
        $scope.user = angular.copy(UserFactory.getUser());

        function loadFields() {
            $scope.formFields = {
                username: {
                    element: 'input',
                    type: 'text'
                },
                name: {
                    element: 'input',
                    type: 'text'
                },
                surname: {
                    element: 'input',
                    type: 'text'
                },
                birthdate: {
                    element: 'date',
                    type: 'date'
                },
                nif: {
                    element: 'input',
                    type: 'text'
                },
                sex: {
                    element: 'select',
                    options: [{
                        label: $filter('i18next')('user.genre_male'),
                        slug: 'male'
                    }, {
                        label: $filter('i18next')('user.genre_female'),
                        slug: 'female'
                    }]
                },
                locale: {
                    element: 'select',
                    options: [{
                        label: $filter('i18next')('locale.es'),
                        slug: 'es'
                    }, {
                        label: $filter('i18next')('locale.en'),
                        slug: 'en'
                    }]
                }
            };
        }

        loadFields();

        $timeout(function() {
            loadFields();
        }, 500);

        $scope.open = function() {
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

        $scope.newPassword = {
            current: '',
            new: '',
            confirm: '',
            currentInvalid: false,
            confirmInvalid: false
        };
        $scope.processPWDChange = function(argument) {
            if (($scope.newPassword.confirmInvalid = $scope.newPassword.new != $scope.newPassword.confirm)) return;
            $scope.newPassword.currentInvalid = false;
            UserFactory
                .doChangePassword({ oldPassword: $scope.newPassword.current, password: $scope.newPassword.new }, true)
                .then(function() {
                    for (var p in $scope.newPassword)
                        if ($scope.newPassword.hasOwnProperty(p)) $scope.newPassword[p] = null;
                }, function(err) {
                    $scope.newPassword.currentInvalid = true;
                });
        };

        //$scope.$watch('user', function(value){
        //    if(value.name === redName){
        //        $i18next.options.lng = 'prt';
        //        $i18next.options.resGetPath = '/assets/locale/prt.json';
        //    }
        //}, true);

        $scope.save = function() {
            $scope.profileStatus = 0;
            UserFactory.saveProfile($scope.user)
                .then(function() {
                    $scope.profileStatus = 1;
                }, function() {
                    $scope.profileStatus = 2;
                });
        };

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.calendar')
        .controller('CalendarCreatorController', CalendarCreatorController)
        .controller('ModalCalendarCreatorController', ModalCalendarCreatorController);

    CalendarCreatorController.$invoke = ['$scope', '$uibModal', '$interval', 'uiCalendarConfig'];

    function CalendarCreatorController($scope, $uibModal, $interval, uiCalendarConfig) {
        $scope.optionsCalendar = {
            visible: false,
            weekends: falseno
        };
        $scope.holidays = [];
        var scope = $scope

        $scope.eventClick = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/calendar/holidayCalendar/modals/modalCalendarHolidayType.tpl.html',
                controller: 'ModalCalendarHolidayTypeController',
                resolve: {
                    event: function() {
                        return true;
                    }
                }
            });

            modalInstance.result.then(function(callback) {

            });
        };

        $scope.$watch('options', function(value, old) {
            if (value !== old) {
                if (value.weekends) {
                    var t_weekdays = [];
                    var endDate = new Date('01/01/2015 01:00');
                    var nowDate = new Date('01/01/2014 01:00');

                    while (nowDate < endDate) {
                        if (nowDate.getDay() === 0 || nowDate.getDay() === 6) {
                            t_weekdays.push({
                                "start": new Date(nowDate),
                                "type": "request",
                                "end": new Date(nowDate),
                                "title": "",
                                "status": "requested",
                                "className": "event_requested"
                            });
                        }
                        nowDate.setDate(nowDate.getDate() + 1);
                    }

                    $scope.holidays = $scope.holidays.concat(t_weekdays);
                }
            }
        }, true);

        var loadDate = $interval(function() {
            if (angular.isDefined(uiCalendarConfig.calendars.zemCalendar)) {
                $scope.optionsCalendar.visible = true;
                uiCalendarConfig.calendars.zemCalendar.fullCalendar('gotoDate', new Date('01/01/2014'));
                $interval.cancel(loadDate);
            }
        }, 16);

        $scope.uiConfig = {
            calendar: {
                firstDay: 1,
                lazyFetching: false,
                editable: false,
                events: $scope.holidays,
                header: {
                    left: '',
                    center: 'title',
                    right: 'prev,next'
                },
                eventClick: $scope.eventClick,
                dayClick: $scope.eventClick
            }
        };

        $scope.eventSources = [];
    }

    ModalCalendarCreatorController.$invoke = ['$scope', '$uibModalInstance', 'event'];

    function ModalCalendarCreatorController($scope, $uibModalInstance, event) {
        $scope.event = event;

        $scope.ok = function(type) {
            event.type = type;
            $uibModalInstance.close(event);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }

}());
(function() {
    'use strict';
    angular
        .module('hours.calendar')
        .controller('HolidayCalendarController', HolidayCalendarController)
        .controller('ModalCalendarHolidayTypeController', ModalCalendarHolidayTypeController);

    HolidayCalendarController.$invoke = ['$scope', '$compile', '$sce', '$uibModal', '$filter', 'holidays', 'CalendarFactory', 'uiCalendarConfig'];

    function HolidayCalendarController($scope, $compile, $sce, $uibModal, $filter, holidays, CalendarFactory, uiCalendarConfig) {

        var scope = $scope
            // $scope.holidays = holidays
        $scope.newRequest = []

        scope.holidays = {
            vacations: {
                year: new Date().getFullYear(),
                entries: []
            },
            absences: {
                year: new Date().getFullYear(),
                entries: []
            }
        }

        scope.summary = {
            vacations: {
                total: { current: 0, previous: 0 },
                consumed: { current: 0, previous: 0 },
                slopes: { current: 0, previous: 0 }
            }
        }

        scope.absenceTypes = ["BM- Baja Medica", "BT- Baja Mater", "EF- Enfermedad", "EX- Examen", "FF- Facell. Fam.", "MA- Matrimonio", "MU- Mudanza", "NH- Nac.Hijos"]

        scope.changeYear = function(navigation, container_type) {
            if (!(container_type in scope.holidays)) return
            scope.holidays[container_type].year += navigation
        }

        scope.insertEntry = function(container_type) {
            if (!(container_type in scope.holidays)) return
            var entry = {
                _id: (Math.random() * (Math.random() * 1000)).toString().replace(/\D/g, ''),
                date: new Date(),
                since: new Date(),
                until: new Date(),
                comments: null,
                status: 'uncreated',
                editable: true
            }
            if (container_type == 'absences') entry.type = scope.absenceTypes[0]
            scope.holidays[container_type].entries.push(entry)
            return entry
        }

        scope.saveEntry = function(entry) {
            entry.editable = false
            entry.status = 'pending'
        }

        scope.editEntry = function(entry) {
            entry.editable = true
        }

        scope.removeEntry = function(index_id, container_type) {
            if (!(container_type in scope.holidays)) return
            for (var i = 0; i < scope.holidays[container_type].entries.length; i++)
                if (scope.holidays[container_type].entries[i]._id == index_id)
                    return scope.holidays[container_type].entries.splice(i, 1)
        }

        scope.computeDaysDifference = function(since, until) {
            if (!since || !until) return
            var _date = new Date(),
                daysCount = 0
            _date.setTime(since.getTime())
            while (_date.getTime() < until.getTime())
                (function() {
                    daysCount++
                    _date.setDate(_date.getDate() + 1)
                }())
            return daysCount
        }

        scope.getHolidays = function(container_type) {
            if (!(container_type in scope.holidays)) return
            var currentYear = scope.holidays[container_type].holidays
                // to do here
        }

        // init view
        (function() {

            // add vacations
            var e1 = scope.insertEntry('vacations')
            e1.comments = 'asdjk jhaskjdh lahsd hlakshdkj lakjshd'
            scope.saveEntry(e1)
            e1.status = 'approved'

            var e2 = scope.insertEntry('vacations')
            e2.comments = e1.comments
            scope.saveEntry(e2)

            var e3 = scope.insertEntry('vacations')

            // add absences
            var e4 = scope.insertEntry('absences')
            e4.comments = e1.comments
            scope.saveEntry(e4)
            e4.status = 'approved'

            var e5 = scope.insertEntry('absences')
            e5.comments = e1.comments
            scope.saveEntry(e5)

            var e6 = scope.insertEntry('absences')

        }());

        $scope.addComment = function(entry) {
            if (!entry) return

            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: '/features/calendar/holidayCalendar/modals/addComment.tpl.html',
                controller: function($scope, $uibModalInstance, callback, comment) {
                    $scope.comment = comment
                    $scope.save = function() {
                        if (callback) callback($scope.comment)
                        $scope.close()
                    };
                    $scope.close = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    callback: function() {
                        return function(comment) {
                            entry.comments = comment
                        }
                    },
                    comment: function() {
                        return entry.comments
                    }
                }
            });

        }
    }

    ModalCalendarHolidayTypeController.$invoke = ['$scope', '$uibModalInstance', 'event'];

    function ModalCalendarHolidayTypeController($scope, $uibModalInstance, event) {
        $scope.event = event;

        $scope.ok = function(type) {
            event.type = type;
            $uibModalInstance.close(event);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }

}());

(function() {
    'use strict';
    angular
        .module('hours.calendar')
        .controller('CalendarImputHoursController', CalendarImputHoursController)
        .controller('ModalImputHoursReportController', ModalImputHoursReportController);

    CalendarImputHoursController.$invoke = ['$scope', '$rootScope', '$http', '$sce', '$compile', 'ProjectsFactory', 'TimesheetFactory', 'CalendarFactory', '$filter', '$uibModal', '$timeout', 'dailyConcepts', '$localStorage', 'UserFactory', 'HolidaySchemesFactory', 'WorkloadSchemesFactory'];

    function CalendarImputHoursController($scope, $rootScope, $http, $sce, $compile, ProjectsFactory, TimesheetFactory, CalendarFactory, $filter, $uibModal, $timeout, dailyConcepts, $localStorage, UserFactory, HolidaySchemesFactory, WorkloadSchemesFactory) {

        var l_initDate;
        var alertTimeout;
        $scope.calendarDate = new Date();
        $scope.projects = [];
        $scope.calendarStatus = 0;
        $scope.weekDays = [];
        $scope.dateLapse = [];
        $scope.totalInDay = [];
        $scope.customError = [];

        $scope.monthDays = []

        $scope.currentView = CalendarFactory.getInputViewState()

        $scope.getViewTemplate = function() {
            return CalendarFactory.getInputViewTemplate()
        }

        $scope.timeline = {
            horas: [],
            guardias: [],
            variables: []
        }

        $scope.timesheet = {
            horas: {
                date: getInitialWeekDay(),
                timeline: [],
                slots: []
            },
            guardias: {
                date: getInitialWeekDay(),
                timeline: [],
                slots: []
            },
            variables: {
                date: getInitialWeekDay(),
                timeline: [],
                slots: []
            }
        }

        $scope.tipos = {
            // 'horas': ['hora', 'hora extra', 'hora extra festivo', 'hora nocturnas', 'Formación', 'varios', 'intervenciones'],
            'horas': ['hora'],
            'guardias': ['tipo de guardia', 'turnicidad', 'guardia', 'varios'],
            'variables': ['hora extra', 'hora extra festivo', 'hora nocturnas', 'Formación', 'varios', 'intervenciones'],
        };

        $scope.predefinedHolidays = [];
        $scope.predefinedHolidaysLoaded = false;
        $scope.workloadScheme;
        var workloadSchemeId;
        if ((workloadSchemeId = UserFactory.getUser().workloadScheme)) {
            WorkloadSchemesFactory.get(workloadSchemeId).then(function(res) {
                if (!res.data) return;
                $scope.workloadScheme = res.data;
            });
        }

        $scope.dayWorkloadExceeded = function(date, container) {
            var exceeded = false;
            if (date && container) {
                var totalHours = $scope.getTimelineDateTotalValue(date, container);
            }
            return exceeded;
        };

        $scope.getDayWorkloadHours = function(date) {
            var hrs = 8;
            if ($scope.workloadScheme && (date = new Date(date)) && !isNaN(date.getTime())) {
                var tmp = $scope.workloadScheme.timeline.find(function(each) {
                    return each.day == date.getDay();
                });
                if (tmp) hrs = tmp.value;
            }
            return hrs;
        };

        $scope.projects = []
        ProjectsFactory.getUserProjects($scope.username).then(function(projects) {
            $scope.projects = projects;
        }, function() {
            console.log('error while getting user projects');
        });
        $scope.getSelectableProjects = function(container, slot_index) {
            var allocatedSlots = [];
            if (container in $scope.timesheet) {
                angular.forEach($scope.timesheet[container].slots, function(slot, index) {
                    if (index == slot_index || !slot.project || !slot.type) return;
                    var s = { project: slot.project, type: slot.type };
                    if (!allocatedSlots.find(function(as) {
                            return as.project == s.project && as.type == s.type;
                        })) {
                        allocatedSlots.push(s);
                    }
                });
                var curSlot = $scope.timesheet[container].slots[slot_index];
                // return $scope.projects.filter(function(p) {
                //     return !allocatedSlots.find(function(s) {
                //         return s.project == p._id && curSlot.type == s.type
                //     });
                // });
                return $scope.projects.filter(function(p) {
                    return !allocatedSlots.find(function(s) {
                        return s.project == p._id
                    });
                });
            }
        };

        $scope.getSelectableTypes = function(container, slot_index) {
            var allocatedSlots = [];
            if (container in $scope.timesheet) {
                angular.forEach($scope.timesheet[container].slots, function(slot, index) {
                    if (index == slot_index || !slot.project || !slot.type) return;
                    var s = { project: slot.project, type: slot.type };
                    if (!allocatedSlots.find(function(as) {
                            return as.project == s.project && as.type == s.type;
                        })) {
                        allocatedSlots.push(s);
                    }
                });
                var curSlot = $scope.timesheet[container].slots[slot_index];
                return $scope.tipos[container].filter(function(t) {
                    return !allocatedSlots.find(function(s) {
                        return curSlot.project == s.project && s.type == t
                    });
                });
            }
        };

        $scope.addTimesheetSlot = function(container_type, extras) {
            if (!extras) extras = {};
            if (!(container_type in $scope.timesheet)) return
            var slot = {
                    project: null,
                    type: $scope.tipos[container_type][0]
                }
                // if ($scope.projects && $scope.projects.length)
                //     slot.project = $scope.projects[0]._id
            slot.type = slot.project = '';

            var status = null
            if (extras.status) status = extras.status;
            if (extras.project) slot.project = extras.project;

            if (extras.type) slot.type = extras.type;
            else slot.type = $scope.tipos[container_type][0];

            if (extras.static) slot.static = true;

            $scope.adjustSlotTimeline(slot, container_type, status)
            $scope.timesheet[container_type].slots.push(slot)
        }

        $scope.adjustSlotTimeline = function(slot, container_type, status) {
            if (!slot || !(container_type in $scope.timesheet)) return
            var t
            if ((t = $scope.timesheet[container_type].timeline).length) {
                slot.timeline = []
                angular.forEach(t, function(timelineEntry) {
                    var cell = {
                        date: timelineEntry.date,
                        value: 0
                    }
                    cell.value = $scope.isWeekEndDay(cell.date) ? 0 : 8
                    if (container_type == 'guardias') cell.value = false
                    cell.status = status;
                    slot.timeline.push(cell);
                })
            }
            // 

        }

        $scope.adjustSlotsTimeline = function(container_type) {
            if (!(container_type in $scope.timesheet)) return
            var slots
            if ((slots = $scope.timesheet[container_type].slots).length) {
                angular.forEach(slots, function(slot, index) {
                    $scope.adjustSlotTimeline(slot, container_type, slot.status)
                })
            }
        }

        $scope.discardTimesheetSlot = function(slot_id, container_type) {
            if (slot_id == undefined || !(container_type in $scope.timesheet)) return

            $scope.timesheet[container_type].slots.splice(slot_id, 1)
        }

        $scope.getTimelineDateTotalValue = function(date, container_type) {
            if (!date || !(container_type in $scope.timesheet)) return 0

            var total_value = 0,
                slots
            if ((slots = $scope.timesheet[container_type].slots).length) {
                angular.forEach(slots, function(slot) {
                    if (slot.timeline && slot.timeline.length) {
                        for (var i = 0; i < slot.timeline.length; i++) {
                            var each = slot.timeline[i]
                            if (each.date == date) {
                                total_value += parseFloat(each.value) || 0
                                break
                            }
                        }
                    }
                })
            }

            return total_value
        }

        $scope.currentMonth = new Date().getMonth()
        $scope.currentDate = new Date()

        $scope.changeTimesheetSlot = function(slot, container) {
            $scope.adjustSlotTimeline(slot, container);
            initTimesheetsMapping();
        }

        $scope.changeMonth = function(month, container_type, incremental_value) {
            if (month == undefined) return
            if (!container_type || !(container_type in $scope.timesheet)) container_type = 'horas'
            if (incremental_value) {
                var dt = $scope.timesheet[container_type].date;
                dt.setDate(1);
                month = dt.getMonth() + month;
                // month = $scope.timesheet[container_type].date.getMonth() + month
            }
            dt.setMonth(month)
            calculateMonthDays(container_type)

            $scope.adjustSlotsTimeline(container_type)

            getTimesheets()
        }

        $scope.changeWeek = function(week_increment, container_type) {
            if (week_increment == undefined) return
            if (!container_type || !(container_type in $scope.timesheet)) container_type = 'horas'
            var d = $scope.timesheet[container_type].date;
            d.setDate(
                d.getDate() + (7 * week_increment)
            )
            calculateWeeklyDays(container_type)

            $scope.adjustSlotsTimeline(container_type)

            getTimesheets()
        }

        function getInitialWeekDay(curDate) {
            if (!curDate) curDate = new Date()
            if (curDate.getDay() == 1) return curDate
            while (curDate.getDay() != 1) curDate.setDate(curDate.getDate() - 1)
            return curDate
        }

        function calculateWeeklyDays(container_type) {
            if (!container_type || !(container_type in $scope.timeline)) container_type = 'horas'
            var currentDate = new Date(),
                sessionDate = $scope.timesheet[container_type].date

            currentDate.setTime(sessionDate.getTime())

            var nextWeekDate = new Date()
            nextWeekDate.setTime(sessionDate.getTime())
            nextWeekDate.setDate(nextWeekDate.getDate() + 7)

            var daysCount = (nextWeekDate.getTime() - currentDate.getTime()) / (3600000 * 24)
            var days = []
            for (var d = 0; d < daysCount; d++) {
                (function(d) {
                    var date = new Date()
                    date.setTime(currentDate.getTime());
                    date.setDate(currentDate.getDate() + d)
                    days.push({
                        date: date,
                        hours: 0,
                        comment: 0,
                        expense: 0,
                        isHoliday: $scope.predefinedHolidays.find(function(dt) {
                            return checkDateEquality(dt, date)
                        }) instanceof Date
                    })
                }(d))
            }
            $scope.timesheet[container_type].timeline = days
        }

        function calculateMonthDays(container_type) {
            if (!container_type || !(container_type in $scope.timeline)) container_type = 'horas'
            var currentDate = new Date()
            currentDate.setHours(0)
            currentDate.setDate(1)
            currentDate.setMonth($scope.timesheet[container_type].date.getMonth())
            currentDate.setFullYear($scope.timesheet[container_type].date.getFullYear())
            var nextMonthDate = new Date()
            nextMonthDate.setHours(0)
            nextMonthDate.setDate(1)
            nextMonthDate.setFullYear($scope.timesheet[container_type].date.getFullYear())
            nextMonthDate.setMonth($scope.timesheet[container_type].date.getMonth() + 1)

            var daysCount = (nextMonthDate.getTime() - currentDate.getTime()) / (3600000 * 24)
            var days = []
            for (var d = 1; d <= daysCount; d++) {
                (function(d) {
                    var date = new Date()
                    date.setDate(d)
                    date.setMonth(currentDate.getMonth())
                    days.push({
                        date: date,
                        hours: 0,
                        comment: 0,
                        expense: 0,
                        isHoliday: $scope.predefinedHolidays.find(function(dt) {
                            return checkDateEquality(dt, date)
                        })
                    })
                }(d))
            }
            $scope.timesheet[container_type].timeline = days;
        }

        $scope.isWeekEndDay = function(date) {
            if (!date) return
            var day = date.getDay()
            return day == 0 || day == 6
        }

        $scope.calculateViewCellWidth = function(container_type) {
            if (!container_type || !(container_type in $scope.timesheet)) container_type = 'horas'
            return 100 / $scope.timesheet[container_type].timeline.length
        }

        $scope.changeView = function() {
            var view_name = $scope.currentView == 'semana' ? 'mes' : 'semana'
            $scope.currentView = view_name
            CalendarFactory.setInputViewState(view_name)

            var viewContainer = angular.element(document.getElementById('timesheet-view'))
            $http.get('/features/calendar/imputHours/partials/' + view_name + '.tpl.html').success(function(data) {
                $scope.initView()

                viewContainer.html($sce.trustAsHtml(data))
                $compile(viewContainer.contents())($scope)

                $scope.adjustSlotsTimeline('horas')
                $scope.adjustSlotsTimeline('guardias')
                $scope.adjustSlotsTimeline('variables')
            })
        }

        $scope.initView = function(callback) {
            var views = { WEEKLY: 'semana', MONHTLY: 'mes' };
            var m = $scope.currentView == views.WEEKLY ? calculateWeeklyDays : calculateMonthDays;

            if (!$scope.predefinedHolidaysLoaded) {
                var holidaySchemeId = UserFactory.getUser().holidayScheme;
                if (!holidaySchemeId) return timesheetView();
                HolidaySchemesFactory.getSchemeHolidays(holidaySchemeId).then(function(res) {
                    angular.forEach((res.data || []), function(each) {
                        each = new Date(each);
                        if (!isNaN(each.valueOf())) $scope.predefinedHolidays.push(each);
                    });
                    timesheetView();
                }, timesheetView);
                $scope.predefinedHolidaysLoaded = true;
            } else timesheetView();

            function timesheetView() {
                angular.forEach(['horas', 'guardias', 'variables'], function(container) {
                    m.call(undefined, container);
                });
                // $timeout(function() {
                getTimesheets();
                // }, 1000);
            }

            if (callback) callback();
        }

        var __timesheets = [];

        function getTimesheets() {
            var required_dates = [];
            for (var prop in $scope.timesheet) {
                if ($scope.timesheet.hasOwnProperty(prop)) {
                    var dt = $scope.timesheet[prop].date,
                        startDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()),
                        endDate = new Date(startDate.getTime());
                    endDate.setDate(endDate.getDate() + 7);
                    if ($scope.currentView == 'mes') {
                        startDate.setDate(1);
                        endDate.setDate(1);
                        endDate.setMonth(startDate.getMonth() + 1);
                    }
                    required_dates.push({
                        date: {
                            $gte: startDate,
                            $lt: endDate
                        }
                    });
                }
            }
            TimesheetFactory.query({
                employee: $scope.username._id,
                $or: required_dates
            }).then(function(data) {
                var timesheets = (__timesheets = data.data || []);
                if (timesheets.length)
                    for (var i = 0; i < timesheets.length; i++) {
                        var t = timesheets[i];
                        if (!(t.container in $scope.timesheet)) continue;
                        if (!$scope.timesheet[t.container].slots.find(s => s.project == t.project && s.type == t.type)) {
                            var s = { project: t.project, type: t.type, static: true };
                            $scope.addTimesheetSlot(t.container, s);
                        }
                    } else {
                        for (var container in $scope.timesheet) {
                            // if ($scope.timesheet.hasOwnProperty(container) && !$scope.timesheet[container].slots.length && container == 'horas')
                            if ($scope.timesheet.hasOwnProperty(container) && !$scope.timesheet[container].slots.length) {
                                // if ($scope.projects.length) 
                                //     $scope.addTimesheetSlot(container, { project: $scope.projects[0]._id, type: $scope.tipos[container][0] });
                            }
                        }
                    }
                initTimesheetsMapping();
            }, function(err) {
                alert('error occured while requesting timesheet data. please try again at a later time');
            });
        }

        function initTimesheetsMapping() {
            var timesheets = __timesheets;
            for (var i = 0; i < timesheets.length; i++) {
                var container = timesheets[i].container,
                    timesheet = timesheets[i];
                if (container in $scope.timesheet) {
                    var slots = $scope.timesheet[container].slots.filter(s => s.project == timesheet.project && s.type == timesheet.type);
                    if (!slots.length) continue;
                    for (var _s = 0; _s < slots.length; _s++) {
                        var slot = slots[_s];
                        for (var j = 0; j < slot.timeline.length; j++) {
                            var entry = slot.timeline[j];
                            if (checkDateEquality(entry.date, timesheet.date)) {
                                entry.status = timesheet.status;
                                entry.value = eval(timesheet.value);
                                entry.comment = timesheet.comment;
                                break;
                            }
                        }
                    }
                }
            }
        }

        $scope.draftTimesheets = function() {
            $scope.saveTimesheets(true);
        }

        $scope.saveTimesheets = function(saveAsDraft) {
            var timesheets = [];
            for (var container in $scope.timesheet) {
                if ($scope.timesheet.hasOwnProperty(container)) {
                    var slots = $scope.timesheet[container].slots;
                    for (var i = 0; i < slots.length; i++) {
                        for (var j = 0; j < slots[i].timeline.length; j++) {
                            var e = slots[i].timeline[j];
                            if (!slots[i].project || !slots[i].type || (e.status && e.status != 'draft') || e.value == null) continue;
                            timesheets.push({
                                employee: $scope.username._id,
                                container: container,
                                type: slots[i].type,
                                project: slots[i].project,
                                date: e.date,
                                comment: e.comment,
                                value: eval(e.value),
                                status: saveAsDraft ? 'draft' : 'pending'
                            });
                        }
                    }
                }
            }
            if (timesheets.length) {
                var promptArgs = [undefined, 'Estás a punto de enviar hoja (s) de tiempo. Confirma amablemente', { confirmLabel: 'enviar' }]
                if (saveAsDraft) {
                    promptArgs[1] = 'Estás a punto de guardar hoja de tiempo (s). Confirma amablemente';
                    promptArgs[2].confirmLabel = 'guardar'
                }
                var modal = $scope.confirm.apply(this, promptArgs);
                modal.then(function() {
                    TimesheetFactory.saveBulk(timesheets).then(function(data) {
                        var entries = data.data
                        __timesheets = __timesheets.concat(entries);
                        if (entries && entries.length) {
                            for (var i = 0; i < entries.length; i++) {
                                if (entries[i].container in $scope.timesheet) {
                                    var slotEntry = $scope.timesheet[entries[i].container].slots.find(s => s.project == entries[i].project && s.type == entries[i].type);
                                    if (!slotEntry) continue;
                                    for (var j = 0; j < slotEntry.timeline.length; j++) {
                                        if (checkDateEquality(slotEntry.timeline[j].date, entries[i].date)) {
                                            slotEntry.timeline[j]._id = entries[i]._id;
                                            slotEntry.timeline[j].status = entries[i].status;
                                            slotEntry.static = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        $scope.calendarStatus = 3;
                    }, function() {
                        $scope.calendarStatus = 4;
                        // alert('oops, something went wrong while processing your request. please try again at a later time');
                    })
                })
            } else $scope.alert('everything already up to date');
        };

        // init timesheet view
        $scope.initView()

        $scope.openExpensePopup = function(date, slot_index, container_type) {
            if (!container_type || !(container_type in $scope.timesheet)) return

            var project = $scope.timesheet[container_type].slots[slot_index].project
            project = $scope.getProject(project)

            var expensePopupInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/features/calendar/imputHours/modals/expenseModal.tpl.html',
                controller: function($scope, $uibModalInstance, args, $timeout) {
                    $scope.user = args.user
                    $scope.date = args.date
                    $scope.project = args.project

                    $scope.spent = {}
                    angular.forEach($scope.spentTypes, function(type) {
                        $scope.spent.spendings[type] = null
                    })

                    $scope.spentTypes = [
                        'kilometros', 'imp. kms', 'coche alquiler', 'combustible', 'peajes', 'taxis',
                        'aparcamiento', 'hotel', 'dietas', 'otros'
                    ]

                    $scope.save = function() {
                        $uibModalInstance.close()
                    }

                    $scope.cancel = function() {
                        $uibModalInstance.dismiss()
                    }

                    // init
                    var scope = $scope;
                    scope.attachedFiles = [];
                    (function() {
                        $timeout(function() {
                            var uploadField = document.querySelector('[data-spent-editor-file-input]')
                            if (uploadField) {
                                uploadField.addEventListener('change', function() {
                                    if (uploadField.files.length) {
                                        scope.$apply(function() {
                                            Array.prototype.forEach.call(uploadField.files, function(file) {
                                                for (var i = 0; i < scope.attachedFiles.length; i++) {
                                                    if (
                                                        scope.attachedFiles[i].name == file.name &&
                                                        scope.attachedFiles[i].size == file.size &&
                                                        scope.attachedFiles[i].lastModified == file.lastModified
                                                    ) return
                                                }
                                                scope.attachedFiles.push(file)
                                            })
                                        })
                                        updateAttachmentsView()
                                    }
                                    this.value = null
                                })
                            }
                        }, 500)
                    }())

                    function updateAttachmentsView() {
                        angular.forEach(
                            document.querySelectorAll('[data-attachment]'),
                            function(element) {
                                if (!element) return
                                element.onclick = function() {
                                    var index_id = parseFloat(element.getAttribute("data-attachment"))
                                    if (isNaN(index_id)) return
                                    scope.$apply(function() {
                                        scope.attachedFiles.splice(index_id, 1)
                                    })
                                }
                            }
                        )
                    }


                },
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    args: function() {
                        return {
                            date: date,
                            user: slot_index,
                            project: project
                        }
                    }
                }
            });
        }

        $scope.openCommentPopup = function(slot) {
            var commentPopupInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/features/calendar/imputHours/modals/commentModal.tpl.html',
                controller: function($scope, $uibModalInstance, args) {
                    $scope.date = args.date
                    $scope.comment = args.comment
                    $scope.save = function() {
                        $uibModalInstance.close($scope.comment);
                    }

                    $scope.close = function() {
                        $uibModalInstance.dismiss()
                    }
                },
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    args: function() {
                        return {
                            date: slot.date,
                            comment: slot.comment
                        }
                    }
                }
            });

            commentPopupInstance.result.then(function(comment) {
                slot.comment = comment;
            });
        }

        $scope.getTimelineCellStatusClass = function(status) {
            if (!status) return;
            var _class = null
            if (status == 'pending') _class = 'bg-ash'
            else if (status == 'approved') _class = 'bg-success'
            else if (status == 'rejected') _class = 'bg-danger'
            return _class

        }

        $scope.getProject = function(project_id) {
            if (!project_id) return
            for (var i = 0; i < $scope.projects.length; i++)
                if ($scope.projects[i]._id == project_id) return $scope.projects[i]
        }

        if (angular.isDefined($scope.validatorMode)) {
            $scope.calendarDate = $scope.validatorMode.calendarDate;
        }

        /* calendarStatus ref:

         -1 - Hidden message
         0  - Loading calendar
         1  - Error while loading calendar
         2  - Saving calendar
         3  - Saving calendar success
         4  - Saving calendar error
         5  - Approve hours success
         6  - Approve hours error
         7  - Reject hours success
         8  - Reject hours error

         */

        $scope.open = function() {
            $scope.status.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            orientation: "bottom left",
            startingDay: 1,
            showWeeks: false
        };

        $scope.status = {
            opened: false
        };

        $scope.toggleCustomer = function(customer) {
            customer.close = !customer.close;
        };

        $scope.addNote = function(day) {
            $uibModal.open({
                animation: true,
                templateUrl: '/features/calendar/imputHours/modals/modalImputHoursReport.tpl.html',
                controller: 'ModalImputHoursReportController',
                resolve: {
                    day: day
                }
            });
        };

        $scope.getConcept = function(conceptId) {
            var thisConcept = $filter('filter')(dailyConcepts, { idRef: conceptId }, true)[0];
            return $filter('i18next')('calendar.dailyConcepts.' + thisConcept.tag);
        };

        $scope.$watch('calendarDate', function(date) {
            calculateCalendar(date);
        });

        $scope.$on('renderCalendar', function() {
            calculateCalendar(l_initDate);
        });

        $scope.checkDay = function(num, validDays) {
            return validDays.indexOf(num) >= 0;
        };

        $scope.moveCalendar = function(direction) {
            var date = $scope.calendarDate;
            var addDays = direction === 'back' ? -7 : 7;
            date.setDate(date.getDate() + addDays);

            calculateCalendar(date);
        };

        function calculateCalendar(initDate) {
            initDate.setDate(initDate.getDate() + 1 - (initDate.getDay() || 7));
            initDate.setHours(1);
            initDate.setMinutes(0);
            initDate.setSeconds(0);
            initDate.setMilliseconds(0);
            $scope.weekName = $filter('date')(initDate, 'dd/MM/yyyy');
            initDate.toGMTString();

            var endDate = new Date(initDate);
            endDate.setDate(endDate.getDate() + 6);
            $scope.weekName += $filter('date')(endDate, ' - dd/MM/yyyy');

            $scope.dateLapse = [initDate, endDate];
            requestCalendar(initDate, endDate);
        }

        function calculateWeekDays(initDate) {
            initDate = new Date(initDate);
            var weekDays = [];
            for (var i = 0; i < 7; i++) {
                initDate.setDate(initDate.getDate() + (i === 0 ? 0 : 1));
                weekDays.push(initDate.getTime());
            }

            $scope.weekDays = weekDays;
        }

        function requestCalendar(initDate, endDate) {
            var userId = null;
            $scope.calendarStatus = 0;

            if (angular.isDefined($scope.validatorMode)) {
                userId = $scope.validatorMode.userId;
            }

            CalendarFactory.getCalendarByDates(initDate, endDate, userId)
                .then(function(calendar) {
                    $scope.calendarStatus = -1;
                    $scope.customers = calendar.customers;
                    $scope.projectsCustomers = calendar.projects;

                    calculateWeekDays(initDate);
                }, function() {
                    $scope.calendarStatus = 1;
                });

            l_initDate = angular.copy(initDate);
        }

        $scope.validateHours = function() {
            CalendarFactory.sendImputedHours($scope.dateLapse)
                .then(function() {
                    $scope.calendarStatus = 3;
                }, function() {
                    $scope.calendarStatus = 4;
                });
        };

        $scope.updateDate = function(day) {
            day.dirty = true;
        };

        $scope.getDate = function(date) {
            return $filter('date')(new Date(date), 'dd/MM/yyyy');
        };

        $scope.searchProjectName = function(projectId) {
            return $filter('filter')($scope.projectsCustomers, { _id: projectId })[0].projectName;
        };

        //$scope.sumHours = function (day, project, customer) {
        //    var dayNum = new Date(day.date).getDay();
        //
        //    if (angular.isUndefined($scope.totalInDay[dayNum])) {
        //        $scope.totalInDay[dayNum] = {
        //            all: {},
        //            total: 0
        //        };
        //    }
        //    var daySection = $scope.totalInDay[dayNum].all;
        //    daySection[project + '_' + customer] = day.hours;
        //    var total = 0;
        //    angular.forEach(daySection, function (hour) {
        //        if (hour) {
        //            total += hour;
        //        }
        //    });
        //
        //    $scope.totalInDay[dayNum].total = parseInt(total * 100) / 100;
        //    $scope.totalInDay[dayNum].disabled = day.disabled;
        //};

        $scope.saveImputedHours = function() {
            var updateElements = [];

            $scope.customers.forEach(function(customer) {
                customer.projects.forEach(function(project) {
                    angular.forEach(project.reports, function(report) {
                        if (report.dirty) {
                            if (!angular.isDate(report.date)) {
                                report.date = new Date(report.date);
                            }
                            report.date = new Date(report.date.setHours(1)).toGMTString();
                            updateElements.push(report);
                        }
                    });
                });
            });

            return $scope.calendarStatus = 4;
            if (updateElements.length) {
                $scope.customError = [];
                CalendarFactory.saveImputedHours(updateElements)
                    .then(function() {
                        $scope.calendarStatus = 4;
                        $scope.customError = ['bad'];
                    }, function(err) {
                        $scope.calendarStatus = 4;
                        $scope.customError = err;
                    });
            } else {
                $scope.calendarStatus = 3;
            }

        };

        $scope.$watch('calendarStatus', function() {
            if (alertTimeout) {
                $timeout.cancel(alertTimeout);
            }
            alertTimeout = $timeout(function() {
                $scope.calendarStatus = -1;
            }, 3000 * ($scope.customError.length + 1));
        });

        $scope.$on('calendarStatus', function(event, status) {
            $scope.calendarStatus = status;
        });
    }

    ModalImputHoursReportController.$invoke = ['$scope', '$uibModalInstance', 'day'];

    function ModalImputHoursReportController($scope, $uibModalInstance, day) {
        $scope.report = day;

        $scope.ok = function() {
            day.dirty = true;
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function() {
            day.report = null;
            day.dirty = false;
            $uibModalInstance.dismiss('cancel');
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.calendar')
        .controller('ImputHoursValidatorController', ImputHoursValidatorController);

    ImputHoursValidatorController.$invoke = ['$scope', 'EmployeeManagerFactory', 'CalendarFactory', '$stateParams', '$rootScope'];

    function ImputHoursValidatorController($scope, EmployeeManagerFactory, CalendarFactory, $stateParams, $rootScope) {
        $scope.userNotFound = false;
        $scope.validatorMode = {};
        $scope.hideEmployees = angular.isDefined($stateParams.timestamp);
        EmployeeManagerFactory.getUsersBySupervisor()
            .then(function(users) {
                $scope.users = users;
            }, function() {

            });

        $scope.openCustomUser = function(user) {
            $scope.validatorMode.calendarDate = new Date();
            $scope.activeUser = user;
            $scope.validatorMode.userId = $scope.activeUser._id;
            $scope.$broadcast('renderCalendar', {});
        };

        $scope.searchUsers = function(username, userId) {
            $scope.validatorMode.calendarDate = new Date();
            if ($stateParams.timestamp) {
                $scope.validatorMode.calendarDate = new Date(parseInt($stateParams.timestamp));
            }

            $scope.userNotFound = false;

            var searchEmployee;
            if (userId) {
                searchEmployee = EmployeeManagerFactory.searchEmployee({ _id: username });
            } else {
                searchEmployee = EmployeeManagerFactory.searchEmployee({ username: username });
            }

            searchEmployee
                .then(function(users) {
                    if (users.length) {
                        $scope.activeUser = users[0];
                        $scope.validatorMode.userId = $scope.activeUser._id;
                        $scope.$broadcast('renderCalendar', {});
                    } else {
                        $scope.userNotFound = true;
                    }

                }, function() {

                });
        };

        if (angular.isDefined($stateParams.userId)) {
            $scope.hideSearch = true;
            $scope.searchUsers($stateParams.userId, true);
        }

        $scope.validateHours = function(dateLapse) {
            CalendarFactory.moderateImputedHours(dateLapse, $scope.activeUser._id)
                .then(function() {
                    $rootScope.$broadcast('calendarStatus', 5);
                }, function() {
                    $rootScope.$broadcast('calendarStatus', 6);
                });
        };

        $scope.rejectHours = function(dateLapse) {
            CalendarFactory.moderateImputedHours(dateLapse, $scope.activeUser._id, true)
                .then(function() {
                    $rootScope.$broadcast('calendarStatus', 7);
                }, function() {
                    $rootScope.$broadcast('calendarStatus', 8);
                });
        };


    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projects')
        .controller('ModerateHolidayCalendarController', ModerateHolidayCalendarController)
        .controller('ModalEditHolidayStatus', ModalEditHolidayStatus);

    ModerateHolidayCalendarController.$invoke = ['$scope', 'CalendarFactory', '$uibModal', 'EmployeeManagerFactory', '$filter', '$timeout', '$stateParams'];

    function ModerateHolidayCalendarController($scope, CalendarFactory, $uibModal, EmployeeManagerFactory, $filter, $timeout, $stateParams) {
        $scope.openUser = null;
        $scope.loadingUserHolidays = null;
        $scope.holidaysOrder = {};
        var state = null;

        $scope.searchUsers = function(searchUser, searchKey) {
            var searchParams = {};
            searchKey = searchKey ? searchKey : 'username';
            searchParams[searchKey] = searchUser;

            EmployeeManagerFactory.searchEmployee(searchParams)
                .then(function(users) {
                    $scope.usersResult = users;
                }, function(err) {

                });
        };

        $scope.openThisUser = function(user) {
            $scope.openUser = user;
            $scope.loadingUserHolidays = true;

            CalendarFactory.getUserHolidayCalendar(user._id)
                .then(function(holidays) {
                    $scope.loadingUserHolidays = null;
                    $scope.userHolidays = holidays;
                }, function(err) {

                });
        };

        $scope.openModalHoliday = function(holiday) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/calendar/moderateHolidayCalendar/modals/modalUserInfo.tpl.html',
                controller: 'ModalEditHolidayStatus',
                resolve: {
                    holiday: holiday
                }
            });

            modalInstance.result.then(function(response) {
                CalendarFactory.updateHolidayStatus(response[0], response[1])
                    .then(function() {
                        $scope.openThisUser($scope.openUser);
                    }, function(err) {

                    });

            });
        };

        function loadFilter(state) {
            $scope.filterOptions = [{
                label: $filter('i18next')('calendar.moderateHolidayCalendar.filterByAllAsc'),
                slug: { status: '', order: 'start' }
            }, {
                label: $filter('i18next')('calendar.moderateHolidayCalendar.filterByAllDesc'),
                slug: { status: '', order: '-start' }
            }, {
                label: $filter('i18next')('calendar.moderateHolidayCalendar.filterByPending'),
                slug: { status: 'requested', order: 'start' }
            }, {
                label: $filter('i18next')('calendar.moderateHolidayCalendar.filterByApproved'),
                slug: { status: 'approved', order: 'start' }
            }, {
                label: $filter('i18next')('calendar.moderateHolidayCalendar.filterByRejected'),
                slug: { status: 'rejected', order: 'start' }
            }];

            $scope.holidaysOrder = $scope.filterOptions[state || 0].slug;
        }

        loadFilter();

        if ($stateParams.userId) {
            $scope.searchUsers($stateParams.userId, '_id');
            state = 2;

            $scope.$watch('usersResult', function() {
                if (angular.isDefined($scope.usersResult)) {
                    $scope.openThisUser($scope.usersResult[0]);
                }
            });
        }

        $timeout(function() {
            loadFilter(state);
        }, 500);

    }


    ModalEditHolidayStatus.$invoke = ['$scope', '$uibModalInstance', 'holiday'];

    function ModalEditHolidayStatus($scope, $uibModalInstance, holiday) {

        $scope.event = holiday;

        $scope.save = function(status) {
            $uibModalInstance.close([status, holiday]);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.components')
        .directive('zemSidebar', zemSidebar)
        .controller('SidebarComponentController', SidebarComponentController);

    SidebarComponentController.$invoke = ['$scope', 'UserFactory'];

    function SidebarComponentController($scope, UserFactory) {
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

(function() {
    'use strict';
    angular
        .module('hours.dashboard')
        .controller('HomeController', HomeController);

    HomeController.$invoke = ['$scope', 'UserFactory', '$state', 'notifications', 'DashboardFactory'];

    function HomeController($scope, UserFactory, $state, notifications, DashboardFactory) {
        $scope.notifications = notifications;
        $scope.user = UserFactory.getUser();

        $scope.activeNotifications = notifications.keys[0];

        $scope.openType = function(type) {
            $scope.activeNotifications = type;
        };

        $scope.isActive = function(type) {
            return $scope.activeNotifications === type && 'active';
        };

        $scope.openNotification = function(notification) {
            switch (notification.type) {
                case 'holiday_request':
                    $state.go('moderateHolidayCalendar', {
                        userId: notification.senderId,
                        filterBy: 'pending'
                    });
                    break;
                case 'hours_sent':
                    $state.go('calendarImputeHoursValidator-user', {
                        userId: notification.senderId,
                        timestamp: new Date(notification.initDate).getTime()
                    });
                    break;
            }
        };

        $scope.markRead = function(notification, type, index) {
            DashboardFactory.markNotificationAsRead({ notificationId: notification._id })
                .then(function() {
                    $scope.notifications.notifications[type].splice(index, 1);
                }, function() {

                });
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.employeeManager')
        .controller('createEmployeeController', createEmployeeController);

    createEmployeeController.$invoke = ['$scope', '$state', '$filter', '$timeout', 'EmployeeManagerFactory', 'HolidaySchemesFactory', 'WorkloadSchemesFactory'];

    function createEmployeeController($scope, $state, $filter, $timeout, EmployeeManagerFactory, HolidaySchemesFactory, WorkloadSchemesFactory) {
        var employee = {
            roles: ['ROLE_USER'],
            enabled: true,
            password: 'zemsania$15'
        };

        $scope.employee = employee;

        $scope.maxDate = new Date();

        $scope.open = function() {
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
            $scope.genres = [{
                name: $filter('i18next')('user.genre_male'),
                slug: 'male'
            }, {
                name: $filter('i18next')('user.genre_female'),
                slug: 'female'
            }];

            $scope.locales = [{
                name: 'Español',
                slug: 'es'
            }, {
                name: 'English',
                slug: 'en'
            }];

            $scope.roles = [{
                name: $filter('i18next')('role.ROLE_BACKOFFICE'),
                slug: 'ROLE_BACKOFFICE'
            }, {
                name: $filter('i18next')('role.ROLE_DELIVERY'),
                slug: 'ROLE_DELIVERY'
            }, {
                name: $filter('i18next')('role.ROLE_MANAGER'),
                slug: 'ROLE_MANAGER'
            }, {
                name: $filter('i18next')('role.ROLE_USER'),
                slug: 'ROLE_USER'
            }];

            employee.roles.forEach(function(role) {
                $filter('filter')($scope.roles, { slug: role })[0].active = true;
            });

        }

        $timeout(function() {
            loadSelectsTranslate();
        }, 100);

        $scope.changeRole = function(roles) {
            var allow = $scope.roles.filter(function(role) {
                return role.active == true;
            }).map(function(role) { return role.slug });

            employee.roles = allow;
        };

        $scope.signupUser = function() {
            $scope.employee.error = false;
            EmployeeManagerFactory.createEmployee($scope.employee)
                .then(function() {
                        $scope.employee.success = true;
                        $timeout(function() {
                            $state.go('employeeManager');
                        }, 1500);
                    },
                    function() {
                        $scope.employee.error = true;
                    });
        };

        $scope.holidaySchemes = [];
        HolidaySchemesFactory.query().success(function(schemes) {
            $scope.holidaySchemes = schemes || [];
            if (($scope.holidaySchemes = schemes || []).length)
                if (!$scope.employee.holidayScheme) $scope.holidaySchemes.push({ name: 'Select' })
        });

        $scope.workloadSchemes = [];
        WorkloadSchemesFactory.query().success(function(schemes) {
            if (($scope.workloadSchemes = schemes || []).length)
                if (!$scope.employee.workloadScheme) $scope.workloadSchemes.push({ name: 'Select' })
        });

        $scope.employees = [];
        EmployeeManagerFactory.getEmployeeList().then(function(employees) {
            $scope.employees = employees.filter(function(emp) {
                return emp._id != $state.params.id
            });
            if (!$scope.employee.superior) $scope.employees.push({ name: 'Select' });
        });

        $scope.companies = [
            { _id: 'sunqu', name: 'sunqu' },
            { _id: 'oasis', name: 'oasis' },
            { _id: 'zemsania', name: 'zemsania' },
            { name: 'select' }
        ];


        $scope.$watchGroup(['employee.holidayScheme', 'employee.workloadScheme', 'employee.superior', 'employee.company'], function(changes) {
            var schemetypes = ['holidaySchemes', 'workloadSchemes', 'employees', 'companies'];
            for (var i = 0; i < schemetypes.length; i++) {
                (function(i) {
                    if (changes[i]) {
                        $scope[schemetypes[i]] = $scope[schemetypes[i]].filter(function(each) {
                            return '_id' in each;
                        });
                    }
                }(i));
            };
        });

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.employeeManager')
        .controller('editEmployeeController', editEmployeeController);

    editEmployeeController.$invoke = ['$scope', '$state', 'employee', '$filter', '$timeout', 'EmployeeManagerFactory', 'HolidaySchemesFactory', 'WorkloadSchemesFactory'];

    function editEmployeeController($scope, $state, employee, $filter, $timeout, EmployeeManagerFactory, HolidaySchemesFactory, WorkloadSchemesFactory) {

        employee.birthdate = new Date(employee.birthdate);
        $scope.employee = employee;
        $scope.maxDate = new Date();

        $scope.open = function() {
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
            $scope.genres = [{
                name: $filter('i18next')('user.genre_male'),
                slug: 'male'
            }, {
                name: $filter('i18next')('user.genre_female'),
                slug: 'female'
            }];

            $scope.locales = [{
                name: 'Español',
                slug: 'es'
            }, {
                name: 'English',
                slug: 'en'
            }];

            $scope.roles = [{
                name: $filter('i18next')('role.ROLE_BACKOFFICE'),
                slug: 'ROLE_BACKOFFICE'
            }, {
                name: $filter('i18next')('role.ROLE_DELIVERY'),
                slug: 'ROLE_DELIVERY'
            }, {
                name: $filter('i18next')('role.ROLE_MANAGER'),
                slug: 'ROLE_MANAGER'
            }, {
                name: $filter('i18next')('role.ROLE_USER'),
                slug: 'ROLE_USER'
            }];

            employee.roles.forEach(function(role) {
                $filter('filter')($scope.roles, { slug: role })[0].active = true;
            });
        }

        $timeout(function() {
            loadSelectsTranslate();
        }, 100);

        $scope.changeRole = function(roles) {
            var allow = $scope.roles.filter(function(role) {
                return role.active == true;
            }).map(function(role) { return role.slug });

            employee.roles = allow;
        };

        $scope.editUser = function() {
            $scope.employee.error = false;
            EmployeeManagerFactory.updateEmployee($scope.employee)
                .then(function() {
                        $scope.employee.success = true;
                        $timeout(function() {
                            $state.go('employeeManager');
                        }, 1500);
                    },
                    function() {
                        $scope.employee.error = true;
                    });
        };

        $scope.holidaySchemes = [];
        HolidaySchemesFactory.query().success(function(schemes) {
            $scope.holidaySchemes = schemes || [];
            if (($scope.holidaySchemes = schemes || []).length)
                if (!$scope.employee.holidayScheme) $scope.holidaySchemes.push({ name: 'Select' })
        });

        $scope.workloadSchemes = [];
        WorkloadSchemesFactory.query().success(function(schemes) {
            if (($scope.workloadSchemes = schemes || []).length)
                if (!$scope.employee.workloadScheme) $scope.workloadSchemes.push({ name: 'Select' })
        });

        $scope.employees = [];
        EmployeeManagerFactory.getEmployeeList().then(function(employees) {
            $scope.employees = employees.filter(function(emp) {
                return emp._id != $state.params.id
            });
            if (!$scope.employee.superior) $scope.employees.push({ name: 'Select' });
        });

        $scope.companies = [
            { _id: 'sunqu', name: 'sunqu' },
            { _id: 'oasis', name: 'oasis' },
            { _id: 'zemsania', name: 'zemsania' }
        ];
        if (!$scope.employee.company) $scope.companies.push({ name: 'select' });

        $scope.$watchGroup(['employee.holidayScheme', 'employee.workloadScheme', 'employee.superior', 'employee.company'], function(changes) {
            var schemetypes = ['holidaySchemes', 'workloadSchemes', 'employees', 'companies'];
            for (var i = 0; i < schemetypes.length; i++) {
                (function(i) {
                    if (changes[i]) {
                        $scope[schemetypes[i]] = $scope[schemetypes[i]].filter(function(each) {
                            return '_id' in each;
                        });
                    }
                }(i));
            };
        });

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.employeeManager')
        .controller('listEmployeeController', listEmployeeController);

    listEmployeeController.$invoke = ['$scope', 'employees', 'EmployeeManagerFactory', '$timeout', '$filter'];

    function listEmployeeController($scope, employees, EmployeeManagerFactory, $timeout, $filter) {
        $scope.tableConfig = {
            itemsPerPage: "30",
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData('get', 'employeeManagerListPage') || 0
        };
        $scope.search = {};
        $scope.employees = employees;

        $scope.toggleAdvancedSearch = function() {
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
        };

        $scope.avancedSearch = function() {
            EmployeeManagerFactory.searchEmployee($scope.search)
                .then(function(employees) {
                    $scope.employees = employees;
                }, function() {

                });
        };

        $timeout(function() {
            $('[ng-click="stepPage(-numberOfPages)"]').text($filter('i18next')('actions.nextPage'));
            $('[ng-click="stepPage(numberOfPages)"]').text($filter('i18next')('actions.lastPage'));
        });

        $scope.$on('$destroy', function() {
            $scope.tmpData('add', 'employeeManagerListPage', $scope.tableConfig.currentPage);
        });

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.excelExport')
        .controller('ExportAbsencesController', ExportAbsencesController);

    ExportAbsencesController.$invoke = ['$scope', '$interval', '$filter', 'ReportsFactory', '$timeout'];

    function ExportAbsencesController($scope, $interval, $filter, ReportsFactory, $timeout) {
        var AbsencesTypes;
        ReportsFactory.getAbsencesTypes()
            .then(function(response) {
                AbsencesTypes = response;
                loadView(response);
            }, function() {

            });

        $scope.conceptName = function(absencesId) {
            return $filter('filter')(AbsencesTypes, { _id: absencesId })[0].nameRef;
        };

        $scope.onSubmit = function() {
            ReportsFactory.searchAbsences($scope.searchModel)
                .then(function(response) {
                    $scope.tableData = response;
                    $timeout(function() {
                        download('export');
                    }, 1000);
                });
        };

        function download(element) {
            // TODO: sync with excel.maqueta.zemsania.com
        }

        function loadView(absencesTypes) {
            $scope.spentFields = [{
                key: 'name',
                type: 'input',
                className: 'col-md-4',
                templateOptions: {
                    label: 'excelExport.labels.name',
                    type: 'email',
                    required: true
                }
            }, {
                key: 'spentType',
                type: 'select',
                className: 'col-md-4',
                templateOptions: {
                    label: 'excelExport.labels.absencesType',
                    labelProp: 'enterpriseName',
                    valueProp: '_id',
                    lang: 'reports.concepts.',
                    options: absencesTypes
                }
            }, {
                key: 'attachment',
                type: 'select',
                className: 'col-md-4',
                templateOptions: {
                    label: 'excelExport.labels.attachment',
                    labelProp: 'nameRef',
                    valueProp: '_id',
                    lang: 'excelExport.labels.',
                    options: [{
                        _id: true,
                        nameRef: 'attachment_yes'
                    }, {
                        _id: false,
                        nameRef: 'attachment_no'
                    }]
                }
            }, {
                key: 'timeStart',
                type: 'input',
                className: 'col-md-2',
                templateOptions: {
                    label: 'excelExport.labels.timeStart',
                    type: 'number',
                    placeholder: 'h',
                    required: true
                }
            }, {
                key: 'timeEnd',
                type: 'input',
                className: 'col-md-2',
                templateOptions: {
                    label: 'excelExport.labels.timeEnd',
                    type: 'number',
                    placeholder: 'h',
                    required: true
                }
            }, {
                key: 'startDate',
                type: 'datepicker',
                className: 'col-md-3 col-md-offset-2',
                templateOptions: {
                    label: 'excelExport.labels.startDate',
                    type: 'text',
                    datepickerPopup: 'dd-MMMM-yyyy',
                    required: true
                }
            }, {
                key: 'endDate',
                type: 'datepicker',
                className: 'col-md-3',
                templateOptions: {
                    label: 'excelExport.labels.endDate',
                    type: 'text',
                    datepickerPopup: 'dd-MMMM-yyyy',
                    required: true
                }
            }];

            var loadLang = $interval(function() {
                if ($filter('i18next')('loaded') === 'true') {
                    $interval.cancel(loadLang);
                    $scope.spentFields.forEach(function(field) {
                        field.templateOptions.label = $filter('i18next')(field.templateOptions.label);
                        if (angular.isDefined(field.templateOptions.options)) {
                            var propLang;
                            field.templateOptions.options.forEach(function(option, i) {
                                propLang = $filter('i18next')(field.templateOptions.lang + option.nameRef);
                                field.templateOptions.options[i][field.templateOptions.labelProp] = propLang;
                            });
                        }
                    });
                    $scope.visible = true;
                }
            }, 200);
        }
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.excelExport')
        .controller('ComboSelectorController', ComboSelectorController);

    ComboSelectorController.$invoke = ['$scope'];

    function ComboSelectorController($scope) {
        $scope.generator = null;
        $scope.showGenerator = function(type) {
            $scope.active = type;
            $scope.generator = '/features/excelExport/' + type + '/' + type + '.tpl.html';
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.excelExport')
        .controller('ExportHolidaysController', ExportHolidaysController);

    ExportHolidaysController.$invoke = ['$scope', '$interval', '$filter'];

    function ExportHolidaysController($scope, $interval, $filter) {

        $scope.spentFields = [{
            key: 'name',
            type: 'input',
            className: 'col-md-4',
            templateOptions: {
                label: 'excelExport.labels.name',
                type: 'email',
                required: true
            }
        }, {
            key: 'attachment',
            type: 'select',
            className: 'col-md-2',
            templateOptions: {
                label: 'excelExport.labels.holiday_types',
                labelProp: 'nameRef',
                valueProp: '_id',
                lang: 'excelExport.labels.',
                options: [{
                    _id: 'approved',
                    nameRef: 'holiday_approved'
                }, {
                    _id: 'pending',
                    nameRef: 'holiday_pending'
                }, {
                    _id: 'rejected',
                    nameRef: 'holiday_rejected'
                }]
            }
        }, {
            key: 'startDate',
            type: 'datepicker',
            className: 'col-md-3',
            templateOptions: {
                label: 'excelExport.labels.startDate',
                type: 'text',
                datepickerPopup: 'dd-MMMM-yyyy',
                required: true
            }
        }, {
            key: 'endDate',
            type: 'datepicker',
            className: 'col-md-3',
            templateOptions: {
                label: 'excelExport.labels.endDate',
                type: 'text',
                datepickerPopup: 'dd-MMMM-yyyy',
                required: true
            }
        }];


        var loadLang = $interval(function() {
            if ($filter('i18next')('loaded') === 'true') {
                $interval.cancel(loadLang);
                $scope.spentFields.forEach(function(field) {
                    field.templateOptions.label = $filter('i18next')(field.templateOptions.label);
                    if (angular.isDefined(field.templateOptions.options)) {
                        var propLang;
                        field.templateOptions.options.forEach(function(option, i) {
                            propLang = $filter('i18next')(field.templateOptions.lang + option.nameRef);
                            field.templateOptions.options[i][field.templateOptions.labelProp] = propLang;
                        });
                    }
                });
                $scope.visible = true;
            }
        }, 200);

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.excelExport')
        .controller('ExportImputeController', ExportImputeController);

    ExportImputeController.$invoke = ['$scope', '$interval', '$timeout', '$filter', 'ReportsFactory'];

    function ExportImputeController($scope, $interval, $timeout, $filter, ReportsFactory, TimesheetFactory) {
        $scope.searchModel = {};
        ReportsFactory.getAbsencesTypes()
            .then(function(response) {
                loadView(response);
            }, function() {

            });

        $scope.exportAsEmailFlag = false;
        $scope.exportEmail;

        $scope.response = { message: null, type: null };
        $scope.onSubmit = function() {
            var d = $scope.searchModel;
            $scope.response.message = null;
            var query = { 
                userEmail: d.email, 
                startDate: new Date(d.startDate).getTime(), 
                endDate: new Date(d.endDate).getTime(), 
                exportAs: 'download'
            };

            if ($scope.exportAsEmailFlag) {
                if (!$scope.exportEmail) return $scope.alert('Recipient email must be provided');
                query.exportAs = 'email';
                query.recipient = $scope.exportEmail;
            }

            TimesheetFactory
                .exportToEmail(query)
                .then(function(res) {
                    var exportCount = res.data.timesheetCount;
                    if (exportCount == 0) {
                        $scope.response.type = 'warning';
                        $scope.response.message = 'Ninguna hoja de horas aprobada encontrada en un período especificado';
                    } else {
                        $scope.response.type = 'success';
                        $scope.response.message = 'Correo electrónico enviado correctamente. ' + exportCount + ' Registros exportados';
                        TimesheetFactory.downloadExportedReport(res.data.response)
                    }
                }, function(res) {
                    $scope.response.type = 'danger';
                    $scope.response.message = 'Error al exportar las hojas de horas.' + (res.data.message || '');
                })
                .finally(function() {
                    $timeout(function() {
                        $scope.response.message = null;
                    }, 5000)
                })
        };

        function loadView() {
            $scope.spentFields = [{
                key: 'email',
                type: 'input',
                className: 'col-md-6',
                templateOptions: {
                    label: 'excelExport.labels.name',
                    type: 'email',
                    required: true
                }
            }, {
                key: 'startDate',
                type: 'datepicker',
                className: 'col-md-3',
                templateOptions: {
                    label: 'excelExport.labels.startDate',
                    type: 'text',
                    datepickerPopup: 'dd-MMMM-yyyy',
                    required: true
                }
            }, {
                key: 'endDate',
                type: 'datepicker',
                className: 'col-md-3',
                templateOptions: {
                    label: 'excelExport.labels.endDate',
                    type: 'text',
                    datepickerPopup: 'dd-MMMM-yyyy',
                    required: true
                }
            }];

            var loadLang = $interval(function() {
                if ($filter('i18next')('loaded') === 'true') {
                    $interval.cancel(loadLang);
                    $scope.spentFields.forEach(function(field) {
                        field.templateOptions.label = $filter('i18next')(field.templateOptions.label);
                        if (angular.isDefined(field.templateOptions.options)) {
                            var propLang;
                            field.templateOptions.options.forEach(function(option, i) {
                                propLang = $filter('i18next')(field.templateOptions.lang + option.nameRef);
                                field.templateOptions.options[i][field.templateOptions.labelProp] = propLang;
                            });
                        }
                    });
                    $scope.visible = true;
                }
            }, 200);
        }
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.excelExport')
        .controller('ExportSpentsController', ExportSpentsController);

    ExportSpentsController.$invoke = ['$scope', '$interval', '$timeout', '$filter', 'ReportsFactory'];

    function ExportSpentsController($scope, $interval, $timeout, $filter, ReportsFactory) {
        $scope.searchModel = {};
        var spentsTypes;
        ReportsFactory.getSpentsTypes()
            .then(function(response) {
                spentsTypes = response;
                loadView(response);
            }, function() {

            });

        function conceptName(spentId) {
            return $filter('filter')(spentsTypes, { _id: spentId })[0].nameRef;
        }

        function convertStatus(status) {
            switch (status) {
                case 'approved':
                    return 1;
                case 'rejected':
                    return 2;
                case 'spent_sent':
                    return 3;
            }
        }

        $scope.onSubmit = function() {
            ReportsFactory.searchSpent($scope.searchModel)
                .then(function(response) {
                    $scope.tableData = response;
                    var exportExcel = [];
                    response.forEach(function(item) {
                        exportExcel.push({
                            date: $filter('date')(item.date, 'dd/MM/yyyy'),
                            price: item.price,
                            concept: $filter('i18next')(conceptName(item.conceptSpentId)),
                            status: convertStatus(item.status),
                            comment: item.comment,
                            attachment: angular.isDefined(item.imageId)

                        });
                    });
                    $scope.formData = exportExcel;
                    $('form').submit();
                });
        };

        function loadView(spentsTypes) {
            $scope.spentFields = [{
                key: 'name',
                type: 'input',
                className: 'col-md-4',
                templateOptions: {
                    label: 'excelExport.labels.name',
                    type: 'email',
                    required: true
                }
            }, {
                key: 'conceptSpentId',
                type: 'select',
                className: 'col-md-4',
                templateOptions: {
                    label: 'excelExport.labels.spentType',
                    labelProp: 'enterpriseName',
                    valueProp: '_id',
                    lang: 'reports.concepts.',
                    options: spentsTypes
                }
            }, {
                key: 'attachment',
                type: 'select',
                className: 'col-md-2',
                templateOptions: {
                    label: 'excelExport.labels.attachment',
                    labelProp: 'nameRef',
                    valueProp: '_id',
                    lang: 'excelExport.labels.',
                    options: [{
                        _id: true,
                        nameRef: 'attachment_yes'
                    }, {
                        _id: false,
                        nameRef: 'attachment_no'
                    }]
                }
            }, {
                key: 'status',
                type: 'select',
                className: 'col-md-2',
                templateOptions: {
                    label: 'excelExport.labels.spent_status',
                    labelProp: 'nameRef',
                    valueProp: '_id',
                    lang: 'excelExport.labels.',
                    options: [{
                        _id: 'approved',
                        nameRef: 'spent_approved'
                    }, {
                        _id: 'pending',
                        nameRef: 'spent_pending'
                    }, {
                        _id: 'rejected',
                        nameRef: 'spent_rejected'
                    }]
                }
            }, {
                key: 'initPrice',
                type: 'input',
                className: 'col-md-2',
                templateOptions: {
                    label: 'excelExport.labels.startAmount',
                    type: 'number',
                    placeholder: '€',
                    required: true
                }
            }, {
                key: 'endPrice',
                type: 'input',
                className: 'col-md-2',
                templateOptions: {
                    label: 'excelExport.labels.endAmount',
                    type: 'number',
                    placeholder: '€',
                    required: true
                }
            }, {
                key: 'initDate',
                type: 'datepicker',
                className: 'col-md-3 col-md-offset-2',
                templateOptions: {
                    label: 'excelExport.labels.startDate',
                    type: 'text',
                    datepickerPopup: 'dd-MMMM-yyyy',
                    required: true
                }
            }, {
                key: 'endDate',
                type: 'datepicker',
                className: 'col-md-3',
                templateOptions: {
                    label: 'excelExport.labels.endDate',
                    type: 'text',
                    datepickerPopup: 'dd-MMMM-yyyy',
                    required: true
                }
            }];

            var loadLang = $interval(function() {
                if ($filter('i18next')('loaded') === 'true') {
                    $interval.cancel(loadLang);
                    $scope.spentFields.forEach(function(field) {
                        field.templateOptions.label = $filter('i18next')(field.templateOptions.label);
                        if (angular.isDefined(field.templateOptions.options)) {
                            var propLang;
                            field.templateOptions.options.forEach(function(option, i) {
                                propLang = $filter('i18next')(field.templateOptions.lang + option.nameRef);
                                field.templateOptions.options[i][field.templateOptions.labelProp] = propLang;
                            });
                        }
                    });
                    $scope.visible = true;
                }
            }, 200);
        }
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projects')
        .controller('ProjectAssignController', ProjectAssignController)
        .controller('ModalProjectInfo', ModalProjectInfo)
        .controller('ModalAddUserToProject', ModalAddUserToProject)
        .controller('ModalUserInfo', ModalUserInfo);

    ProjectAssignController.$invoke = ['$scope', 'ProjectsFactory', '$uibModal', 'EmployeeManagerFactory'];

    function ProjectAssignController($scope, ProjectsFactory, $uibModal, EmployeeManagerFactory) {
        $scope.openProject = null;
        $scope.advancedSearchVisible = false;
        $scope.loadingProjectUsers = null;

        $scope.searchProject = function(searchProjectName) {
            ProjectsFactory.searchProjectByName(searchProjectName)
                .then(function(projects) {
                    $scope.projects = projects;
                }, function(err) {

                });
        };

        $scope.toggleAdvancedSearch = function() {
            $scope.advancedSearchVisible = !$scope.advancedSearchVisible;
        };

        $scope.openThisProject = function(project) {
            $scope.openProject = project;
            $scope.loadingProjectUsers = true;
            ProjectsFactory.getUsersInProjectByID(project._id)
                .then(function(users) {
                    $scope.loadingProjectUsers = null;
                    $scope.usersInProject = users;
                }, function(err) {

                });
        };

        $scope.searchUsers = function(searchUsername) {
            EmployeeManagerFactory.searchEmployee({ username: searchUsername })
                .then(function(user) {
                    $scope.usersInSearch = user;
                }, function() {

                });
        };

        $scope.openInfo = function(project) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalProjectInfo.tpl.html',
                controller: 'ModalProjectInfo',
                resolve: {
                    project: project
                }
            });
        };

        $scope.openUserOptions = function(user) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalUserInfo.tpl.html',
                controller: 'ModalUserInfo',
                resolve: {
                    user: user
                }
            });

            modalInstance.result.then(function(response) {
                var callback = response[1];
                if (response[0] === 'update') {
                    var userProject = {
                        _id: callback.implicationId,
                        initDate: toGMT0(callback.implicationInit),
                        maxHours: callback.maxHours,
                        endDate: toGMT0(callback.implicationEnd)
                    };

                    ProjectsFactory.updateUserInProject(userProject)
                        .then(function() {
                            $scope.openThisProject($scope.openProject);
                        }, function(err) {

                        });
                } else {

                    ProjectsFactory.deleteUserInProject({ _id: callback.implicationId })
                        .then(function() {
                            $scope.openThisProject($scope.openProject);
                        }, function(err) {

                        });
                }
            });
        };

        $scope.addUserToProject = function(user) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalAddUserToProject.tpl.html',
                controller: 'ModalAddUserToProject',
                resolve: {
                    user: user,
                    project: $scope.openProject
                }
            });

            modalInstance.result.then(function(callback) {
                var userProject = {
                    projectId: $scope.openProject._id,
                    userId: callback._id,
                    maxHours: callback.maxHours,
                    initDate: callback.implicationInit,
                    endDate: callback.implicationEnd
                };

                ProjectsFactory.addUserInProject(userProject)
                    .then(function() {
                        $scope.openThisProject($scope.openProject);
                    }, function(err) {

                    });

            });
        };
    }

    ModalProjectInfo.$invoke = ['$scope', '$uibModalInstance', 'project'];

    function ModalProjectInfo($scope, $uibModalInstance, project) {
        $scope.project = project;
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }

    ModalUserInfo.$invoke = ['$scope', '$uibModalInstance', 'user'];

    function ModalUserInfo($scope, $uibModalInstance, user) {
        $scope.user = user;

        $scope.open = function(type) {
            $scope.status.opened[type] = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            orientation: "bottom left",
            startingDay: 1,
            showWeeks: false
        };

        $scope.status = {
            opened: []
        };

        $scope.save = function() {
            $uibModalInstance.close(['update', $scope.user]);
        };

        $scope.delete = function() {
            $uibModalInstance.close(['delete', $scope.user]);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }

    ModalAddUserToProject.$invoke = ['$scope', '$uibModalInstance', 'user', 'project'];

    function ModalAddUserToProject($scope, $uibModalInstance, user, project) {
        user.implicationInit = new Date();
        user.implicationEnd = new Date(project.endDate);
        $scope.user = user;

        $scope.open = function(type) {
            $scope.status.opened[type] = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            orientation: "bottom left",
            startingDay: 1,
            showWeeks: false
        };

        $scope.status = {
            opened: []
        };

        $scope.save = function() {
            $uibModalInstance.close($scope.user);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfOffersEditorController', WfOffersEditorController);

    WfOffersEditorController.$invoke = ['$scope', 'WorkFlowFactory'];

    function WfOffersEditorController($scope, WorkFlowFactory) {

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfOffersController', WfOffersController);

    WfOffersController.$invoke = ['$scope', 'enterprises'];

    function WfOffersController($scope, enterprises) {
        $scope.model = {
            text: 'Example'
        };

        $scope.fields = [{
            key: 'text',
            className: 'col-md-3',
            type: 'input',
            templateOptions: {
                label: 'Text',
                placeholder: 'Placeholder'
            }
        }, {
            key: 'selector',
            type: 'select',
            className: 'col-md-4',
            templateOptions: {
                label: 'Text',
                labelProp: "enterpriseName",
                valueProp: "_id",
                options: enterprises
            }
        }];

        $scope.onSubmit = function() {
            //alert(JSON.stringify($scope.model), null, 2);
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfProjectEditorController', WfProjectEditorController);

    WfProjectEditorController.$invoke = ['$scope', 'WorkFlowFactory'];

    function WfProjectEditorController($scope, WorkFlowFactory) {

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfProjectController', WfProjectController);

    WfProjectController.$invoke = ['$scope', 'WorkFlowFactory'];

    function WfProjectController($scope, WorkFlowFactory) {

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfProspectEditorController', WfProspectEditorController);

    WfProspectEditorController.$invoke = ['$scope', 'WorkFlowFactory'];

    function WfProspectEditorController($scope, WorkFlowFactory) {

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfProspectController', WfProspectController);

    WfProspectController.$invoke = ['$scope', 'WorkFlowFactory'];

    function WfProspectController($scope, WorkFlowFactory) {

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfTrainingEditorController', WfTrainingEditorController);

    WfTrainingEditorController.$invoke = ['$scope', 'WorkFlowFactory'];

    function WfTrainingEditorController($scope, WorkFlowFactory) {

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projectWorkflow')
        .controller('WfTrainingController', WfTrainingController);

    WfTrainingController.$invoke = ['$scope', 'WorkFlowFactory'];

    function WfTrainingController($scope, WorkFlowFactory) {

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.reports')
        .controller('AbsencesEditorController', AbsencesEditorController);

    AbsencesEditorController.$invoke = ['$scope', 'absences', 'absencesTypes', '$filter', '$interval', 'ReportsFactory', '$uibModal', '$uibModalStack', '$timeout', '$state'];

    function AbsencesEditorController($scope, absences, absencesTypes, $filter, $interval, ReportsFactory, $uibModal, $uibModalStack, $timeout, $state) {
        absences.file_image = null;
        absences.date = angular.isUndefined(absences.date) ? new Date() : new Date(absences.date);
        absences.status = angular.isUndefined(absences.status) ? 'absence_sent' : absences.status;
        $scope.absences = absences;
        $scope.absencesStatus = -1;
        var modalInstance;
        var alertTimeout;

        $scope.fields = [{
            key: 'conceptAbsenceId',
            type: 'select',
            className: 'col-md-4',
            templateOptions: {
                label: 'reports.labels.concept',
                labelProp: "enterpriseName",
                valueProp: "_id",
                options: absencesTypes,
                required: true
            }
        }, {
            key: 'date',
            type: 'datepicker',
            className: 'col-md-4',
            templateOptions: {
                label: 'reports.labels.date',
                type: 'text',
                datepickerPopup: 'dd-MMMM-yyyy',
                required: true
            }
        }, {
            key: 'hours',
            type: 'input',
            className: 'col-md-4',
            templateOptions: {
                label: 'reports.labels.hours',
                type: 'number',
                placeholder: '0h',
                required: true
            }
        }, {
            key: 'comment',
            type: 'textarea',
            className: 'col-md-12',
            templateOptions: {
                label: 'reports.spents.comment',
                type: 'text',
                class: 'msd-elastic'
            },
            ngModelElAttrs: {
                class: 'form-control msd-elastic'
            }
        }, {
            key: 'file_image',
            type: 'input',
            className: 'col-md-12 fileUpload',
            templateOptions: {
                label: 'reports.spents.attachment',
                type: 'file'
            }
        }];

        $scope.attachmentUrl = buildURL('filesView');

        $(document).on('change', '.fileUpload input', function() {
            modalInstance = $uibModal.open({
                animation: true,
                size: 'sm',
                backdrop: 'static',
                templateUrl: '/features/components/loading/simple.html'
            });
            ReportsFactory.uploadImage($('.fileUpload input').prop('files')[0])
                .then(function(response) {
                    $timeout(function() {
                        $scope.absences.imageId = response;
                        $uibModalStack.dismissAll('close');
                    }, 300);
                }, function() {

                });
        });


        var loadLang = $interval(function() {
            if ($filter('i18next')('loaded') === 'true') {
                $interval.cancel(loadLang);
                $scope.fields.forEach(function(field) {
                    field.templateOptions.label = $filter('i18next')(field.templateOptions.label);
                    if (angular.isDefined(field.templateOptions.options)) {
                        field.templateOptions.options.forEach(function(option, i) {
                            field.templateOptions.options[i] = {
                                enterpriseName: $filter('i18next')('reports.concepts.' + option.nameRef),
                                _id: option._id
                            };
                        });
                    }
                });
            }
        }, 200);

        $scope.$watch('absencesStatus', function() {
            if (alertTimeout) {
                $timeout.cancel(alertTimeout);
            }
            alertTimeout = $timeout(function() {
                $scope.absencesStatus = -1;
            }, 3000);
        });

        $scope.onSubmit = function() {
            $scope.absencesStatus = -1;
            ReportsFactory.saveAbsences($scope.absences)
                .then(function() {
                    if (absences.newSpent) {
                        $state.go('userAbsences');
                    }
                    $scope.absencesStatus = 1;
                }, function() {
                    $scope.absencesStatus = 0;
                });
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.reports')
        .controller('AbsencesController', AbsencesController)
        .controller('ModalListController', ModalListController);

    AbsencesController.$invoke = ['$scope', 'userAbsences', 'absencesTypes', '$filter', '$uibModal', 'ReportsFactory'];

    function AbsencesController($scope, userAbsences, absencesTypes, $filter, $uibModal, ReportsFactory) {
        $scope.tableConfig = {
            itemsPerPage: "30",
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData('get', 'absencesListPage') || 0
        };
        $scope.userAbsences = userAbsences;

        $scope.conceptName = function(spentId) {
            return $filter('filter')(absencesTypes, { _id: spentId })[0].nameRef;
        };

        $scope.removeElement = function(item) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/reports/absences/list/modals/modalAbsenceRemove.tpl.html',
                controller: 'ModalListController',
                resolve: {
                    absence: function() {
                        return item;
                    }
                }
            });

            modalInstance.result.then(function(absence) {
                ReportsFactory.removeAbsence(absence._id)
                    .then(function() {
                        absence.deleted = true;
                    }, function() {
                        //$scope.moderatorStatus = 1;
                    });
            });
        };

        $scope.$on('$destroy', function() {
            $scope.tmpData('add', 'absencesListPage', $scope.tableConfig.currentPage);
        });
    }

    ModalListController.$invoke = ['$scope', '$uibModalInstance', 'absence'];

    function ModalListController($scope, $uibModalInstance, absence) {
        $scope.absence = absence;

        $scope.ok = function() {
            $uibModalInstance.close(absence);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.reports')
        .controller('ModeratorAbsencesController', ModeratorAbsencesController);

    ModeratorAbsencesController.$invoke = ['$scope', 'EmployeeManagerFactory', 'ReportsFactory', '$filter', 'absencesTypes', '$uibModal', '$timeout', '$stateParams', 'users'];

    function ModeratorAbsencesController($scope, EmployeeManagerFactory, ReportsFactory, $filter, absencesTypes, $uibModal, $timeout, $stateParams, users) {
        $scope.username = null;
        var moderatorStatus;
        $scope.moderatorStatus = -1;
        $scope.users = users;
        $scope.userNotFound = !users.length;

        if ($scope.tmpData('get', 'employeeManagerListPage')) {
            $scope.searchUser($scope.username);
        }

        $scope.openCustomUser = function(user) {
            $scope.activeUser = user;
            $scope.searchUser(user._id, true);
        };

        $scope.searchUser = function(username, userId) {
            $scope.userNotFound = false;

            var searchEmployee;
            if (userId) {
                searchEmployee = EmployeeManagerFactory.searchEmployee({ _id: username });
            } else {
                searchEmployee = EmployeeManagerFactory.searchEmployee({ username: username });
            }

            searchEmployee
                .then(function(response) {
                    if (response.length) {
                        ReportsFactory.getUserAbsences(response[0]._id)
                            .then(function(absences) {
                                loadAbsences(absences);
                            }, function() {

                            });
                    } else {
                        $scope.userNotFound = true;
                    }
                }, function() {
                    $scope.userNotFound = true;
                });
        };

        if (angular.isDefined($stateParams.userId)) {
            $scope.hideSearch = true;
            $scope.searchUsers($stateParams.userId, true);
        }

        function loadAbsences(absences) {
            $scope.tableConfig = {
                itemsPerPage: "30",
                maxPages: "3",
                fillLastPage: false,
                currentPage: 0
            };
            $scope.userAbsences = absences;
        }

        $scope.conceptName = function(absenceId) {
            return $filter('filter')(absencesTypes, { _id: absenceId })[0].nameRef;
        };

        $scope.$watch('moderatorStatus', function() {
            if (moderatorStatus) {
                $timeout.cancel(moderatorStatus);
            }
            moderatorStatus = $timeout(function() {
                $scope.moderatorStatus = -1;
            }, 3000);
        });

        $scope.openAbsence = function(thisAbsence) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/reports/absences/moderator/modals/modalModerateAbsence.tpl.html',
                controller: 'ModalModeratorAbsences',
                resolve: {
                    absence: function() {
                        return thisAbsence;
                    },
                    absencesTypes: function() {
                        return absencesTypes;
                    }
                }
            });

            modalInstance.result.then(function(absence) {
                $scope.moderatorStatus = -1;
                var updateMethod = 'approve';
                if (absence.status === 'rejected') {
                    updateMethod = 'reject';
                }

                ReportsFactory.updateAbsences(updateMethod, absence)
                    .then(function() {
                        $scope.moderatorStatus = 0;
                    }, function() {
                        $scope.moderatorStatus = 1;
                    });
            });
        };
    }


}());
(function() {
    'use strict';
    angular
        .module('hours.projects')
        .controller('SpentsEditorController', SpentsEditorController);

    SpentsEditorController.$invoke = ['$scope', 'spent', 'spentsTypes', '$filter', '$interval', 'ReportsFactory', '$uibModal', '$uibModalStack', '$timeout', '$state'];

    function SpentsEditorController($scope, spent, spentsTypes, $filter, $interval, ReportsFactory, $uibModal, $uibModalStack, $timeout, $state) {
        spent.file_image = null;
        spent.date = angular.isUndefined(spent.date) ? new Date() : new Date(spent.date);
        spent.status = angular.isUndefined(spent.status) ? 'spent_sent' : spent.status;
        $scope.spent = spent;
        $scope.spentStatus = -1;
        var modalInstance;
        var alertTimeout;

        $scope.fields = [{
            key: 'conceptSpentId',
            type: 'select',
            className: 'col-md-4',
            templateOptions: {
                label: 'reports.labels.concept',
                labelProp: "enterpriseName",
                valueProp: "_id",
                options: spentsTypes,
                required: true
            }
        }, {
            key: 'date',
            type: 'datepicker',
            className: 'col-md-4',
            templateOptions: {
                label: 'reports.labels.date',
                type: 'text',
                datepickerPopup: 'dd-MMMM-yyyy',
                required: true
            }
        }, {
            key: 'price',
            type: 'input',
            className: 'col-md-4',
            templateOptions: {
                label: 'reports.labels.price',
                type: 'number',
                placeholder: '0€',
                required: true
            }
        }, {
            key: 'comment',
            type: 'textarea',
            className: 'col-md-12',
            templateOptions: {
                label: 'reports.spents.comment',
                type: 'text',
                class: 'msd-elastic'
            },
            ngModelElAttrs: {
                class: 'form-control msd-elastic'
            }
        }, {
            key: 'file_image',
            type: 'input',
            className: 'col-md-12 fileUpload',
            templateOptions: {
                label: 'reports.spents.attachment',
                type: 'file'
            }
        }];

        $scope.attachmentUrl = buildURL('filesView');

        $(document).on('change', '.fileUpload input', function() {
            modalInstance = $uibModal.open({
                animation: true,
                size: 'sm',
                backdrop: 'static',
                templateUrl: '/features/components/loading/simple.html'
            });
            ReportsFactory.uploadImage($('.fileUpload input').prop('files')[0])
                .then(function(response) {
                    $timeout(function() {
                        $scope.spent.imageId = response;
                        $uibModalStack.dismissAll('close');
                    }, 300);
                }, function() {

                });
        });


        var loadLang = $interval(function() {
            if ($filter('i18next')('loaded') === 'true') {
                $interval.cancel(loadLang);
                $scope.fields.forEach(function(field) {
                    field.templateOptions.label = $filter('i18next')(field.templateOptions.label);
                    if (angular.isDefined(field.templateOptions.options)) {
                        field.templateOptions.options.forEach(function(option, i) {
                            field.templateOptions.options[i] = {
                                enterpriseName: $filter('i18next')('reports.concepts.' + option.nameRef),
                                _id: option._id
                            };
                        });
                    }
                });
            }
        }, 200);

        $scope.$watch('spentStatus', function() {
            if (alertTimeout) {
                $timeout.cancel(alertTimeout);
            }
            alertTimeout = $timeout(function() {
                $scope.spentStatus = -1;
            }, 3000);
        });

        $scope.onSubmit = function() {
            $scope.spentStatus = -1;
            ReportsFactory.saveSpent($scope.spent)
                .then(function() {
                    if (spent.newSpent) {
                        $state.go('userSpents');
                    }
                    $scope.spentStatus = 1;
                }, function() {
                    $scope.spentStatus = 0;
                });
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.reports')
        .controller('SpentsController', SpentsController);

    SpentsController.$invoke = ['$scope', 'userSpents', 'spentsTypes', '$filter', '$uibModal', 'ReportsFactory', '$http'];

    function SpentsController($scope, userSpents, spentsTypes, $filter, $uibModal, ReportsFactory, $http) {

        var scope = $scope
        scope.spents = undefined

        // fetch dummy spents data
        $http.get('/dummy_data/spents.json').success(function(spents) {
            angular.forEach(spents, function(spent) {
                spent.date = new Date(spent.date)
            })
            scope.spents = spents || []
        })

        scope.spentTypes = [
            'kilometros', 'imp. kms', 'coche alquiler', 'combustible', 'peajes', 'taxis',
            'aparcamiento', 'hotel', 'dietas', 'otros'
        ]

        scope.projects = [
            { _id: '57d01589c3e3a2bc45f82009', projectName: 'PROJ_16SQ0178ZEMCOM - Comercial Sunqu 2016' },
            { _id: '57d015c5c3e3a2bc45f8200a', projectName: '16ZE0154MINIDI - Analitics' },
            { _id: '57d015dbc3e3a2bc45f8200b', projectName: '15DB0244VODMVP - Vodafone Proyecto XXX' }
        ]

        scope.addEntry = function() {
            var entryViewInstance = $uibModal.open({
                animation: true,
                size: 'lg',
                templateUrl: '/features/reports/spents/editor/spentsEditor.tpl.html',
                backdrop: 'static',
                controller: ['$scope', '$uibModalInstance', 'projects', 'spentTypes', 'getSpentsByParams', '$timeout', function(scope, uibModalInstance, projects, spentTypes, getSpentsByParams, timeout) {

                    scope.spent
                    scope.projects = projects
                    scope.spentTypes = spentTypes
                    scope.attachedFiles = []
                    scope.invalidSpendingsFlag = false

                    scope.spent = {
                        _id: (Math.random() * (Math.random() * 1000)).toString().replace(/\./gi, ''),
                        date: new Date(),
                        // type: scope.spentTypes[0],
                        spendings: {},
                        project: scope.projects[0]._id,
                        amount: null,
                        billable: false,
                        comment: null,
                        attachments: [],
                        status: "pending"
                    }
                    angular.forEach(scope.spentTypes, function(type) {
                        scope.spent.spendings[type] = null
                    })

                    scope.occupiedSpents = getSpentsByParams(scope.spent.date, scope.spent.project)
                    scope.isSpentOccupied = function(spentType) {
                        if (!scope.occupiedSpents.length) return
                        for (var i = 0; i < scope.occupiedSpents.length; i++) {
                            if (scope.occupiedSpents[i].type == spentType) return scope.occupiedSpents[i]
                        }
                    }

                    scope.onSubmit = function() {
                        var validSpendings = []
                        for (var type in scope.spent.spendings)
                            if (type in scope.spent.spendings && !isNaN(parseInt(scope.spent.spendings[type])))
                                validSpendings.push({
                                    type: type,
                                    value: parseFloat(scope.spent.spendings[type])
                                })

                        if ((scope.invalidSpendingsFlag = !validSpendings.length))
                            return timeout(function() { scope.invalidSpendingsFlag = false }, 5000)

                        var entries = []
                        angular.forEach(validSpendings, function(spending) {
                            var _spent = angular.copy(scope.spent)
                            _spent.type = spending.type
                            _spent.amount = spending.value

                            // explicitly copy attachment to current entry
                            _spent.attachments = []
                            angular.forEach(scope.attachedFiles, function(attachedFile) {
                                _spent.attachments.push({
                                    name: attachedFile.name,
                                    lastModified: attachedFile.lastModified,
                                    size: attachedFile.size
                                })
                            })

                            delete _spent.spendings
                            entries.push(_spent)
                        })
                        uibModalInstance.close(entries)
                    }
                    scope.cancel = function() {
                        uibModalInstance.dismiss()
                    }

                    scope.removeAttachment = function(attachedFile) {
                        var index
                        if ((index = scope.attachedFiles.indexOf(attachedFile)) > -1) {
                            scope.attachedFiles.splice(index, 1)
                        }
                    }

                    // init attachments functionality
                    (function() {
                        timeout(function() {
                            var uploadField = document.querySelector('[data-spent-editor-file-input]')
                            if (uploadField) {
                                uploadField.addEventListener('change', function() {
                                    if (uploadField.files.length) {
                                        scope.$apply(function() {
                                            Array.prototype.forEach.call(uploadField.files, function(file) {
                                                for (var i = 0; i < scope.attachedFiles.length; i++) {
                                                    if (
                                                        scope.attachedFiles[i].name == file.name &&
                                                        scope.attachedFiles[i].size == file.size &&
                                                        scope.attachedFiles[i].lastModified == file.lastModified
                                                    ) return
                                                }
                                                scope.attachedFiles.push(file)
                                            })
                                        })
                                        updateAttachmentsView()
                                    }
                                    this.value = null
                                })
                            }
                        }, 500)
                    }())

                    function updateAttachmentsView() {
                        angular.forEach(
                            document.querySelectorAll('[data-attachment]'),
                            function(element) {
                                if (!element) return
                                element.onclick = function() {
                                    var index_id = parseFloat(element.getAttribute("data-attachment"))
                                    if (isNaN(index_id)) return
                                    scope.$apply(function() {
                                        scope.attachedFiles.splice(index_id, 1)
                                    })
                                }
                            }
                        )
                    }

                    scope.$watchGroup(['spent.date', 'spent.project'], function() {
                        scope.occupiedSpents = getSpentsByParams(scope.spent.date, scope.spent.project)
                    })

                }],
                resolve: {
                    projects: function() {
                        return scope.projects
                    },
                    spentTypes: function() {
                        return scope.spentTypes
                    },
                    getSpentsByParams: function() {
                        return scope.getSpentsByParams
                    }
                }
            })

            entryViewInstance.result.then(function(entries) {
                scope.spents = scope.spents.concat(entries)
            })
        }

        scope.editEntry = function(entry) {
            if (!entry) return
            var entryViewInstance = $uibModal.open({
                animation: true,
                size: 'lg',
                templateUrl: '/features/reports/spents/editor/spentsEditorSingle.tpl.html',
                backdrop: 'static',
                controller: ['$scope', '$uibModalInstance', 'spentEntry', 'getProject', '$timeout', function(scope, uibModalInstance, spentEntry, getProject, timeout) {

                    scope.getProject = getProject
                    scope.spent = spentEntry
                    scope.attachedFiles = spentEntry.attachments || []

                    timeout(function() {
                        updateAttachmentsView()
                    }, 500)

                    scope.onSubmit = function() {
                        scope.spent.attachments = scope.attachedFiles
                        uibModalInstance.close(scope.spent)
                    }
                    scope.cancel = function() {
                        uibModalInstance.dismiss()
                    }

                    scope.removeAttachment = function(attachedFile) {
                        var index
                        if ((index = scope.attachedFiles.indexOf(attachedFile)) > -1) {
                            scope.attachedFiles.splice(index, 1)
                        }
                    }

                    // init attachment functionality
                    (function() {
                        timeout(function() {
                            var uploadField = document.querySelector('[data-spent-editor-file-input]')
                            if (uploadField) {
                                uploadField.addEventListener('change', function() {
                                    if (uploadField.files.length) {
                                        scope.$apply(function() {
                                            Array.prototype.forEach.call(uploadField.files, function(file) {
                                                for (var i = 0; i < scope.attachedFiles.length; i++) {
                                                    if (
                                                        scope.attachedFiles[i].name == file.name &&
                                                        scope.attachedFiles[i].size == file.size &&
                                                        scope.attachedFiles[i].lastModified == file.lastModified
                                                    ) return
                                                }
                                                scope.attachedFiles.push(file)
                                            })
                                        })
                                        updateAttachmentsView()
                                    }
                                    this.value = null
                                })
                            }
                        }, 500)
                    }())

                    function updateAttachmentsView() {
                        angular.forEach(
                            document.querySelectorAll('[data-attachment]'),
                            function(element) {
                                if (!element) return
                                element.onclick = function() {
                                    var index_id = parseFloat(element.getAttribute("data-attachment"))
                                    if (isNaN(index_id)) return
                                    scope.$apply(function() {
                                        scope.attachedFiles.splice(index_id, 1)
                                    })
                                }
                            }
                        )
                    }

                }],
                resolve: {
                    spentEntry: function() {
                        return entry
                    },
                    getProject: function() {
                        return scope.getProject
                    }
                }
            })

            entryViewInstance.result.then(function(spentEntry) {
                // update existing dataset
            })
        }

        scope.removeEntry = function(entry) {
            var _id = entry._id,
                index
            if ((index = scope.spents.indexOf(entry)) > -1)
                scope.spents.splice(index, 1)
        }

        scope.getProject = function(project_id) {
            if (!project_id) return
            for (var i = 0; i < scope.projects.length; i++)
                if (scope.projects[i]._id == project_id) return scope.projects[i]
        }

        scope.getSpentsByParams = function(date, project_id) {
            if (!date || !project_id || !scope.spents.length) return []
            var spents = []
            for (var i = 0; i < scope.spents.length; i++)
                if (scope.spents[i].date.toLocaleDateString() == date.toLocaleDateString() && scope.spents[i].project == project_id)
                    spents.push(scope.spents[i])
            return spents
        }

        scope.getSpent = function(spent_id) {
            if (!spent_id) return
            for (var i = 0; i < scope.spents.length; i++)
                if (scope.spents[i]._id == spent_id) return scope.spents[i]
        }

    }
}());
(function() {
    'use strict';
    angular
        .module('hours.reports')
        .controller('ModeratorSpentsController', SpentsController);

    SpentsController.$invoke = ['$scope', 'EmployeeManagerFactory', 'ReportsFactory', '$filter', 'spentsTypes', '$uibModal', '$timeout', 'users'];

    function SpentsController($scope, EmployeeManagerFactory, ReportsFactory, $filter, spentsTypes, $uibModal, $timeout, users) {
        $scope.username = null;
        var moderatorStatus;
        $scope.moderatorStatus = -1;
        $scope.users = users;
        $scope.userNotFound = !users.length;

        if ($scope.tmpData('get', 'employeeManagerListPage')) {
            $scope.searchUser($scope.username);
        }

        $scope.openCustomUser = function(user) {
            $scope.activeUser = user;
            $scope.searchUser(user._id, true);
        };

        $scope.searchUser = function(username, userId) {
            $scope.userNotFound = false;

            var searchEmployee;
            if (userId) {
                searchEmployee = EmployeeManagerFactory.searchEmployee({ _id: username });
            } else {
                searchEmployee = EmployeeManagerFactory.searchEmployee({ username: username });
            }

            searchEmployee
                .then(function(response) {
                    if (response.length) {
                        ReportsFactory.getUserSpents(response[0]._id)
                            .then(function(spents) {
                                loadSpents(spents);
                            }, function() {

                            });
                    } else {
                        $scope.userNotFound = true;
                    }
                }, function() {
                    $scope.userNotFound = true;
                });
        };

        function loadSpents(spents) {
            $scope.tableConfig = {
                itemsPerPage: "30",
                maxPages: "3",
                fillLastPage: false,
                currentPage: 0
            };
            $scope.userSpents = spents;
        }

        $scope.conceptName = function(spentId) {
            return $filter('filter')(spentsTypes, { _id: spentId })[0].nameRef;
        };

        $scope.$watch('moderatorStatus', function() {
            if (moderatorStatus) {
                $timeout.cancel(moderatorStatus);
            }
            moderatorStatus = $timeout(function() {
                $scope.moderatorStatus = -1;
            }, 3000);
        });

        $scope.openSpent = function(thisSpent) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/reports/spents/moderator/modals/modalModerateSpents.tpl.html',
                controller: 'ModalModeratorSpents',
                resolve: {
                    spent: function() {
                        return thisSpent;
                    },
                    spentsTypes: function() {
                        return spentsTypes;
                    }
                }
            });

            modalInstance.result.then(function(spent) {
                $scope.moderatorStatus = -1;
                var updateMethod = 'approve';
                if (spent.status === 'rejected') {
                    updateMethod = 'reject';
                }

                ReportsFactory.updateSpent(updateMethod, spent)
                    .then(function() {
                        $scope.moderatorStatus = 0;
                    }, function() {
                        $scope.moderatorStatus = 1;
                    });
            });
        };
    }


}());
(function() {
    'use strict';
    angular
        .module('hours.reports')
        .controller('ModalModeratorAbsences', ModalModeratorAbsences);

    ModalModeratorAbsences.$invoke = ['$scope', '$uibModalInstance', '$filter', 'absence', 'absencesTypes'];

    function ModalModeratorAbsences($scope, $uibModalInstance, $filter, absence, absencesTypes) {
        $scope.absence = absence;

        $scope.conceptName = function(absenceId) {
            return $filter('filter')(absencesTypes, { _id: absenceId })[0].nameRef;
        };

        $scope.absenceStatus = [{
            label: $filter('i18next')('reports.labels.statusApproved'),
            slug: 'approved'
        }, {
            label: $filter('i18next')('reports.labels.statusRejected'),
            slug: 'rejected'
        }, {
            label: $filter('i18next')('reports.labels.statusPending'),
            slug: 'absence_sent'
        }];

        $scope.ok = function() {
            $uibModalInstance.close(absence);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
}());
(function() {
    'use strict';
    angular
        .module('hours.projects')
        .controller('ModalModeratorSpents', ModalModeratorSpents);

    ModalModeratorSpents.$invoke = ['$scope', '$uibModalInstance', '$filter', 'spent', 'spentsTypes'];

    function ModalModeratorSpents($scope, $uibModalInstance, $filter, spent, spentsTypes) {
        $scope.spent = spent;

        $scope.conceptName = function(spentId) {
            return $filter('filter')(spentsTypes, { _id: spentId })[0].nameRef;
        };

        $scope.spentStatus = [{
            label: $filter('i18next')('reports.labels.statusApproved'),
            slug: 'approved'
        }, {
            label: $filter('i18next')('reports.labels.statusRejected'),
            slug: 'rejected'
        }, {
            label: $filter('i18next')('reports.labels.statusPending'),
            slug: 'spent_sent'
        }];

        $scope.ok = function() {
            $uibModalInstance.close(spent);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
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
    if ((canvas = document.querySelector("canvas"))) {
        canvas.width = $(window).width() || window.innerWidth;
        canvas.height = $(window).height() || window.innerHeight;
        ctx = canvas.getContext("2d");

        for (var i = 0; i < canvas.width * canvas.height / (95 * 65); i++) {
            balls.push(new Ball(Math.random() * canvas.width, Math.random() * canvas.height));
        }

        loop();
    }
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
    this.update = function(canvas) {
        if (this.x > canvas.width + 50 || this.x < -50) {
            this.vel.x = -this.vel.x;
        }
        if (this.y > canvas.height + 50 || this.y < -50) {
            this.vel.y = -this.vel.y;
        }
        this.x += this.vel.x;
        this.y += this.vel.y;
    };
    this.draw = function(ctx) {
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

function checkDateEquality(date1, date2) {
    if (!(date1 instanceof Date)) date1 = new Date(date1);
    if (!(date2 instanceof Date)) date2 = new Date(date2);
    return (date1.getDate() == date2.getDate()) && (date1.getMonth() == date2.getMonth()) && (date1.getFullYear() == date2.getFullYear());
}