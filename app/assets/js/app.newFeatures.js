(function() {
    'use strict';
    angular
        .module('hours.holidaySchemes', [])
        .config(HolidaySchemesConfig)
        .factory('HolidaySchemesFactory', HolidaySchemesFactory)
        .controller('holidaySchemesController', HolidaySchemesController)
        .controller('holidaySchemeViewController', HolidaySchemeViewController);

    HolidaySchemesConfig.$invoke = ['$stateProvider'];

    function HolidaySchemesConfig($stateProvider) {
        $stateProvider
            .state('holidaySchemes', {
                url: '/holiday-schemes',
                templateUrl: '/features/calendar/holidaySchemes/holidaySchemes.tpl.html',
                controller: 'holidaySchemesController',
                data: {
                    state: 'holidaySchemes',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {}
            })
            .state('holidaySchemeView', {
                url: '/holiday-schemes/:schemeId',
                templateUrl: '/features/calendar/holidaySchemes/holidaySchemeView.tpl.html',
                controller: 'holidaySchemeViewController',
                data: {
                    state: 'holidaySchemes',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {}
            })
    }

    HolidaySchemesFactory.$invoke = ['$http', '$q', '$localStorage'];

    function HolidaySchemesFactory($http, $q, $localStorage) {
        return {
            register: function(scheme) {
                return $http.post(buildURL('holidaySchemeSubmit'), scheme);
            },
            registerSchemeEntry: function(entry) {
                return $http.post(buildURL('holidaySchemeEntrySubmit'), entry);
            },
            query: function(query) {
                return $http.post(buildURL('holidaySchemeQuery'), query || {});
            },
            querySchemeEntry: function(query) {
                return $http.post(buildURL('holidaySchemeEntryQuery'), query || {});
            },
            getSchemeHolidays: function(schemeId) {
                return $http.get(buildURL('holidaySchemeHolidays') + schemeId);
            },
            get: function(schemeId) {
                return $http.get(buildURL('holidayScheme') + schemeId);
            },
            setDefault: function(schemeId) {
                return $http.put(buildURL('holidaySchemeSetDefault') + schemeId);
            },
            delete: function(schemeId) {
                return $http.delete(buildURL('holidayScheme') + schemeId);
            },
            deleteSchemeEntry: function(entryId) {
                return $http.delete(buildURL('holidaySchemeEntry') + entryId);
            }
        }
    }

    HolidaySchemesController.$invoke = HolidaySchemeViewController.$invoke = ['$scope', '$rootScope', '$state', '$http', '$sce', '$compile', '$filter', '$uibModal', '$timeout', '$localStorage', 'HolidaySchemesFactory'];

    function HolidaySchemesController($scope, $rootScope, $state, $http, $sce, $compile, $filter, $uibModal, $timeout, $localStorage, HolidaySchemesFactory) {
        var scope = $scope;

        scope.schemes = [];
        HolidaySchemesFactory.query().success(function(schemes) {
            scope.schemes = schemes || [];
        });

        scope.newScheme = { name: '', description: '' };
        scope.createScheme = function() {
            var m = scope.newScheme;
            if (!m.name || !m.description) return;

            if (scope.schemes.find(function(s) {
                    return s.name.toLowerCase() == m.name.toLowerCase()
                }))
                return scope.alert('Another with the same name already exists. Please specify unique scheme name');

            var d = { name: m.name, description: m.description, date: Date.now() };
            HolidaySchemesFactory.register(d).then(function(res) {
                scope.schemes.push(res.data);
                scope.newScheme.name = scope.newScheme.description = '';
            }, function() { scope.alert(); });
        };

        scope.configureScheme = function(scheme) {
            $state.go('holidaySchemeView', { schemeId: scheme._id });
        };

        scope.setDefaultScheme = function(scheme) {
            scope.confirm(null, "You want to make this as Default Holiday Scheme?", { confirmLabel: 'Set Default' }).then(function() {
                HolidaySchemesFactory
                    .setDefault(scheme._id)
                    .then(function() {
                        scheme.default = true;
                        angular.forEach(scope.schemes, function(_scheme) {
                            if (_scheme._id != scheme._id) delete _scheme.default;
                        });
                    }, function() { scope.alert(); });
            })
        };

        scope.deleteScheme = function(scheme) {
            if (!scheme) return;
            scope.confirm("You're about to delete " + scheme.name, null, { confirmLabel: 'delete' }).then(function() {
                HolidaySchemesFactory
                    .delete(scheme._id)
                    .then(function() {
                        var index;
                        if ((index = scope.schemes.indexOf(scheme)) > -1)
                            scope.schemes.splice(index, 1);
                    }, function() { scope.alert(); });
            });
        };

        scope.schemeActions = [
            { label: 'Members', handler: scope.deleteScheme, disabled: true },
            { label: 'Configure', handler: scope.configureScheme }, {
                label: 'Set Default',
                handler: scope.setDefaultScheme,
                hidden: function(scheme) {
                    if (scheme) return scheme.default;
                }
            },
            { label: 'Delete', handler: scope.deleteScheme }
        ];
    }

    function HolidaySchemeViewController($scope, $rootScope, $state, $http, $sce, $compile, $filter, $uibModal, $timeout, $localStorage, HolidaySchemesFactory) {
        var scope = $scope;

        scope.scheme = {};
        HolidaySchemesFactory.get($state.params.schemeId).success(function(scheme) {
            if (!(scope.scheme = scheme)) scope.alert('error occured while retrieving requested holiday scheme');
        });

        scope.setDefaultScheme = function() {
            scope.confirm(null, "You want to make this as Default Holiday Scheme?", { confirmLabel: 'Set Default' }).then(function() {
                HolidaySchemesFactory
                    .setDefault(scope.scheme._id)
                    .then(function() { scope.scheme.default = true }, function() { scope.alert(); });
            })
        };

        scope.deleteScheme = function() {
            scope.confirm("You're about to delete current scheme", null, { confirmLabel: 'delete' }).then(function() {
                HolidaySchemesFactory
                    .delete(scope.scheme._id)
                    .then(function() {
                        $state.go('holidaySchemes');
                    }, function() { scope.alert(); });
            });
        };

        scope.holidays = [];
        HolidaySchemesFactory.querySchemeEntry({ $query: { scheme: $state.params.schemeId } }).success(function(holidays) {
            scope.holidays = holidays || [];
        });

        scope.newHoliday = { name: '', description: '', duration: 1, date: null }

        scope.createHoliday = function() {
            var m = scope.newHoliday;
            if (!m.name || !m.description || !m.duration || !m.date) return;

            if (scope.holidays.find(function(h) {
                    return h.name.toLowerCase() == m.name.toLowerCase() || checkDateEquality(h.date, m.date);
                }))
                return scope.alert('Another holiday with similar attribute(s) already exists. Make sure not to duplicate values')

            var d = { scheme: scope.scheme._id, name: m.name, description: m.description, date: m.date, duration: m.duration };

            HolidaySchemesFactory.registerSchemeEntry(d).then(function(res) {
                scope.holidays.push(d);
                for (var k in m)
                    if (m.hasOwnProperty(k)) m[k] = null;
            }, function() { scope.alert(); });
        }

        scope.deleteHoliday = function(holiday) {
            if (!holiday) return;
            scope.confirm("You're about to delete holiday '" + holiday.name + "'", null, { confirmLabel: 'Delete' }).then(function() {
                HolidaySchemesFactory.deleteSchemeEntry(holiday._id).then(function() {
                    var index;
                    if ((index = scope.holidays.indexOf(holiday)) > -1)
                        scope.holidays.splice(index, 1);
                }, function() { scope.alert(); });
            })
        };

        scope.holidayActions = [
            { label: 'Delete', handler: scope.deleteHoliday }
        ];

        scope.datepickerEnabled = false;
        scope.enableDatepicker = function() {
            scope.datepickerEnabled = true;
        }
    }

}());

(function() {
    'use strict';
    angular
        .module('hours.workloadSchemes', [])
        .config(WorkloadSchemesConfig)
        .factory('WorkloadSchemesFactory', WorkloadSchemesFactory)
        .controller('WorkloadSchemesController', WorkloadSchemesController)

    WorkloadSchemesConfig.$invoke = ['$stateProvider'];

    function WorkloadSchemesConfig($stateProvider) {
        $stateProvider
            .state('workloadSchemes', {
                url: '/workload-schemes',
                templateUrl: '/features/calendar/workloadSchemes/workloadSchemes.tpl.html',
                controller: 'WorkloadSchemesController',
                data: {
                    state: 'workloadSchemes',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {}
            })
    }

    WorkloadSchemesFactory.$invoke = ['$http', '$q', '$localStorage'];

    function WorkloadSchemesFactory($http, $q, $localStorage) {
        return {
            register: function(scheme) {
                return $http.post(buildURL('workloadSchemeSubmit'), scheme);
            },
            query: function(query) {
                return $http.post(buildURL('workloadSchemeQuery'), query || {});
            },
            get: function(schemeId) {
                return $http.get(buildURL('workloadScheme') + schemeId);
            },
            update: function(schemeId, updates) {
                return $http.put(buildURL('workloadScheme') + schemeId, updates);
            },
            setDefault: function(schemeId) {
                return $http.put(buildURL('workloadSchemeSetDefault') + schemeId);
            },
            delete: function(schemeId) {
                return $http.delete(buildURL('workloadScheme') + schemeId);
            }
        }
    }

    WorkloadSchemesController.$invoke = ['$scope', '$rootScope', '$state', '$http', '$sce', '$compile', '$filter', '$uibModal', '$timeout', '$localStorage', 'WorkloadSchemesFactory'];

    ManageWorkloadSchemeController.$invoke = ['$scope', '$rootScope', '$uibModalInstance', 'WorkloadSchemesFactory'];

    function WorkloadSchemesController($scope, $rootScope, $state, $http, $sce, $compile, $filter, $uibModal, $timeout, $localStorage, WorkloadSchemesFactory) {
        var scope = $scope;

        scope.timelineOrder = [1, 2, 3, 4, 5, 6, 0];
        scope.schemes = [];

        WorkloadSchemesFactory.query().success(function(schemes) {
            scope.schemes = schemes || [];
        });

        scope.getTimelineValue = function(dayIndex, timeline) {
            if (dayIndex == undefined || !timeline) return;
            var val;
            if ((val = timeline.find(function(entry) {
                    return entry.day == dayIndex
                }))) {
                return val.value;
            }
        };

        scope.setDefault = function(scheme) {
            scope.confirm(null, "You want to make this as Default Workload Scheme?", { confirmLabel: 'Set Default' }).then(function() {
                WorkloadSchemesFactory
                    .setDefault(scheme._id)
                    .then(function() {
                        scheme.default = true;
                        angular.forEach(scope.schemes, function(_scheme) {
                            if (_scheme._id != scheme._id) delete _scheme.default;
                        });
                    });
            });
        }

        scope.deleteScheme = function(scheme) {
            if (!scheme) return;
            scope.confirm("You're about to delete " + scheme.name, null, { confirmLabel: 'delete' }).then(function() {
                WorkloadSchemesFactory
                    .delete(scheme._id)
                    .then(function() {
                        var index;
                        if ((index = scope.schemes.indexOf(scheme)) > -1)
                            scope.schemes.splice(index, 1);
                    }, function() { scope.alert(); });
            });
        };

        scope.manageScheme = function(scheme) {
            var expensePopupInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/features/calendar/workloadSchemes/modals/newSchemeModal.tpl.html',
                controller: ManageWorkloadSchemeController,
                backdrop: 'static',
                resolve: {
                    args: function() {
                        var data = {
                            timelineOrder: scope.timelineOrder,
                            schemes: scope.schemes
                        };
                        if (scheme) {
                            data.edit = true;
                            data.scheme = scheme;
                        }
                        return data;
                    }
                }
            }).result.then(function(res) {
                if (res.edited) {
                    for (var i = 0; i < scope.schemes.length; i++)
                        if (scope.schemes[i]._id == res.data._id) {
                            scope.schemes[i] = res.data;
                            break;
                        }
                    return;
                }
                scope.schemes.push(res.data);
            });
        };

        scope.schemeActions = [
            { label: 'Members', handler: scope.deleteScheme, disabled: true },
            { label: 'Edit', handler: scope.manageScheme }, {
                label: 'Set Default',
                handler: scope.setDefault,
                hidden: function(scheme) {
                    return scheme.default;
                }
            },
            { label: 'Delete', handler: scope.deleteScheme }
        ];

        $rootScope.getDay = function(index) {
            return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][index];
        }

    }

    function ManageWorkloadSchemeController($scope, $rootScope, $uibModalInstance, WorkloadSchemesFactory, args) {
        var scope = $scope;

        scope.newScheme = { name: '', description: '', timeline: [] };

        scope.timelineOrder = args.timelineOrder;
        scope.schemes = args.schemes;

        if ((scope.edit = args.edit)) {
            scope.newScheme = angular.copy(args.scheme);
        }

        scope.submit = function() {
            saveScheme(function(scheme) {
                $uibModalInstance.close({ data: scheme, edited: scope.edit });
            });
        };

        scope.cancel = function() {
            $uibModalInstance.dismiss();
        };

        function saveScheme(cb) {
            var m = scope.newScheme;
            if (!m.name || !m.description) return;

            (scope.edit ? updateScheme : createNewScheme).call(undefined, function(scheme) {
                cb(scheme);
            })

            function createNewScheme(cb) {
                if (
                    scope.schemes.find(function(s) {
                        return s.name.toLowerCase() == m.name.toLowerCase()
                    })
                )
                    return scope.alert('Another scheme with the similar name already exists. Please specify unique scheme name');

                var d = { name: m.name, description: m.description, timeline: m.timeline, date: Date.now() };
                WorkloadSchemesFactory.register(d).then(function(res) {
                    cb(res.data);
                }, function() { scope.alert(); })
            }

            function updateScheme(cb) {
                if (
                    scope.schemes.find(function(s) {
                        return s._id != m._id && s.name.toLowerCase() == m.name.toLowerCase()
                    })
                )
                    return scope.alert('Another scheme with the similar name already exists. Please specify unique scheme name');
                var d = { name: m.name, description: m.description, timeline: m.timeline }
                WorkloadSchemesFactory.update(scope.newScheme._id, { $set: d }).then(function() {
                    cb(m);
                }, function() { scope.alert(); })
            }
        }
    }

}());

(function() {
    'use strict';
    angular
        .module('hours.employeeTimesheets', [])
        .config(EmployeeTimesheetsConfig)
        .factory('EmployeeTimesheetsFactory', EmployeeTimesheetsFactory)
        .controller('employeeTimesheetsController', EmployeeTimesheetsController)

    EmployeeTimesheetsConfig.$invoke = ['$stateProvider'];

    function EmployeeTimesheetsConfig($stateProvider) {
        $stateProvider
            .state('employeeTimesheets', {
                url: '/employee-timesheets',
                templateUrl: '/features/timesheet/employeeTimesheets/employeeTimesheets.tpl.html',
                controller: 'employeeTimesheetsController',
                data: {
                    state: 'employeeTimesheets',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {}
            })
    }

    EmployeeTimesheetsFactory.$invoke = ['$http', '$q', '$localStorage', 'UserFactory'];

    function EmployeeTimesheetsFactory($http, $q, $localStorage, UserFactory) {
        API_paths['timesheetsGetUnderSuperior'] = 'timesheets/getUnderSuperior';
        return {
            getEmployeesTimesheetRequests: function(query) {
                var superiorId = UserFactory.getUser()._id;
                // var superiorId = "56e2a2dac99a6062640faae8"
                query = query || {};
                query.superiorId = superiorId;
                var reqUrl = buildURL('timesheetsGetUnderSuperior');
                return $http({ url: reqUrl, method: 'GET', params: query });
            }
        }
    }

    EmployeeTimesheetsController.$invoke = ['$scope', '$rootScope', '$state', '$http', '$sce', '$compile', '$filter', '$uibModal', '$timeout', '$localStorage', 'EmployeeTimesheetsFactory', 'TimesheetFactory', 'UserFactory', 'WorkloadSchemesFactory'];

    function EmployeeTimesheetsController($scope, $rootScope, $state, $http, $sce, $compile, $filter, $uibModal, $timeout, $localStorage, EmployeeTimesheetsFactory, TimesheetFactory, UserFactory, WorkloadSchemesFactory) {
        var scope = $scope;

        scope.filter = {
            employee: {
                name: ''
            }
        };

        scope.requests = [];
        scope.projects = [];
        scope.currentDate = new Date();

        scope.changeMonth = function(incrementalIndex) {
            scope.currentDate.setMonth(scope.currentDate.getMonth() + incrementalIndex);
            getTimesheets();
        };

        getTimesheets();

        function getTimesheets() {
            var startDate = new Date(scope.currentDate.getFullYear(), scope.currentDate.getMonth(), 1);
            var endDate = new Date(scope.currentDate.getFullYear(), scope.currentDate.getMonth() + 1, 1)
            EmployeeTimesheetsFactory
                .getEmployeesTimesheetRequests({
                    '$query[date][$gte]': startDate,
                    '$query[date][$lt]': endDate
                })
                .success(function(requests) {
                    scope.requests = groupArray(requests, function(req) {
                        return req.employee._id;
                    });
                    // if (requests.length) {
                    //     var tmp = requests.map(function(req) {
                    //             return req.project
                    //         }),
                    //         projects = [];

                    //     angular.forEach(tmp, function(proj) {
                    //         if (!projects.find(function(p) {
                    //                 return p._id == proj._id;
                    //             })) {
                    //             projects.push(proj);
                    //         }
                    //     });
                    //     scope.projects = projects;
                    // }
                });
        }

        $scope.workloadScheme;
        (function() {
            var m, arg, workloadSchemeId;

            if ((workloadSchemeId = UserFactory.getUser().workloadScheme)) {
                m = WorkloadSchemesFactory.get;
                arg = workloadSchemeId;
            } else {
                m = WorkloadSchemesFactory.get;
                arg = {
                    $query: {
                        default: true
                    }
                };
            }

            m.call(WorkloadSchemesFactory, arg).then(function(res) {
                if (Array.isArray(res.data)) res.data = res.data.shift();
                if (!res.data) return;
                $scope.workloadScheme = res.data;
            });

        }());

        scope.getDateDefaultWorkloadHour = function(date) {
            if (date.constructor != Date) date = new Date(date);
            var dayIndex = date.getDay(),
                tmp;
            if (scope.workloadScheme && scope.workloadScheme.timeline) {
                if ((tmp = scope.workloadScheme.timeline.find(function(each) {
                        return each.day == dayIndex;
                    }))) return tmp.value;
            }
        };

        scope.requestStatusFilter = '';
        scope.filterRequests = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            var req = requests[0],
                reqStatus,
                emp_name = req.employee.name + ' ' + req.employee.surname,
                q = scope.filter.employee.name;
            if ((reqStatus = scope.getEmployeeRequestsClass(requests)) && (reqStatus == 'text-dark' || reqStatus == 'text-warning-dark'))
                reqStatus = 'pending';

            return (q ? new RegExp(q, 'gi').test(emp_name) : true) && (scope.requestStatusFilter ? reqStatus == scope.requestStatusFilter : true);
        };

        scope.getEmployeeTotalHours = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            if ((requests = requests.filter(function(req) {
                    return req.container == 'horas' // && req.status == 'approved';
                })).length) {
                if (requests.length > 1)
                    return requests.reduce(function(result, req) {
                        var val = typeof result == 'object' ? scope.getTotalHours(result) : result;
                        return val + scope.getTotalHours(req);
                    });
                else return scope.getTotalHours(requests[0]);
            }
        };

        scope.getEmployeeTimesheetsTotalDays = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            var days = scope.getEmployeeTotalHours(requests) / 8;
            if (days != Math.round(days)) days = parseFloat(days.toFixed(2));
            return days;
        };

        scope.getEmployeeRequestsClass = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return '';
            var approved = 0,
                pendings = 0,
                rejected = 0;
            angular.forEach(requests, function(request) {
                if (request.status == 'approved') approved++;
                else if (request.status == 'pending') pendings++;
                else if (request.status == 'rejected') rejected++;
            });
            var _class = '';
            if (pendings > 0) {
                if (pendings == requests.length) _class = 'text-warning-dark'
                else _class = 'text-dark'
            } else if (approved == requests.length || approved > rejected) _class = 'text-success-dark'
            else if (rejected == requests.length || rejected > approved) _class = 'text-red-dark'
            return _class;
        };

        scope.getTotalHours = function(timesheetRequest) {
            var req = timesheetRequest,
                hrs = 0;
            if (!req.timesheets || !req.timesheets.length) return hrs;
            hrs = req.timesheets.reduce(function(result, next) {
                var val = typeof result == 'object' ? result.value : result;
                var sum = val + next.value;
                return sum;
            });
            if (hrs != Math.round(hrs)) hrs = parseFloat(hrs.toFixed(2));
            return hrs;
        };

        scope.getTimesheetsTotalDays = function(timesheetRequest) {
            var days = scope.getTotalHours(timesheetRequest) / 8;
            if (days != Math.round(days)) days = parseFloat(days.toFixed(2));
            return days;
        };

        scope.getTotalChecks = function(timesheetRequest) {
            var req = timesheetRequest,
                formatted = 'n/a';
            if (!req.timesheets || !req.timesheets.length) return formatted;
            formatted = req.timesheets.filter(function(t) {
                return t.value === true;
            }).length;
            return formatted;
        };

        scope.getEmployeeTotalDays = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            return requests.reduce(function(result, req) {
                var val = typeof result == 'object' ? scope.getTotalDays(result.startDate, result.endDate) : result;
                return val + scope.getTotalDays(req.startDate, req.endDate);
            });
        };

        scope.getTotalDays = function(startDate, endDate) {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            return Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 3600000));
        };

        scope.getEmployeePendingRequests = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            return requests.filter(function(req) {
                return req.status == 'pending'
            }).length
        };

        scope.isWeekEndDay = function(date) {
            if (!date) return
            date = new Date(date);
            var day = date.getDay()
            return day == 0 || day == 6
        };

        scope.processEmployeeRequests = function(requests, action) {
            if (!requests || !requests.length || !action) return;
            var msg = "You're about to change status to \'" + action.toUpperCase() + '\" for timesheet requests?';

            var _popup = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/features/timesheet/employeeTimesheets/modals/commentModal.tpl.html',
                controller: function($scope, $uibModalInstance) {
                    $scope.title = msg;
                    $scope.action = action;
                    $scope.comment;

                    $scope.save = function() {
                        $uibModalInstance.close($scope.comment);
                    }
                    $scope.close = function() {
                        $uibModalInstance.dismiss()
                    }
                },
                backdrop: 'static',
                size: 'md'
            });

            _popup.result.then(function(comment) {

                var query = { _id: { $in: [] } };
                angular.forEach(requests, function(req) {
                    query._id.$in = query._id.$in.concat(req.timesheets.map(function(t) { return t._id; }));
                });
                var updates = { $set: { status: action, processingDate: Date.now(), verifierReason: comment || null } };
                console.log(updates)
                TimesheetFactory.updateBulk(query, updates).then(function(res) {
                    angular.forEach(requests, function(req) {
                        req.status = action;
                    });
                }, function(err) {
                    scope.alert('System was unable to process your request');
                    console.log(err);
                })

            });
        };

        scope.processTimesheetRequest = function(timesheetsRequest, action) {
            if (!timesheetsRequest) return;
            if (!action) action = 'approved';
            var msg = "You're about to change status to \'" + action.toUpperCase() + '\" for the timesheet request?'

            var _popup = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/features/timesheet/employeeTimesheets/modals/commentModal.tpl.html',
                controller: function($scope, $uibModalInstance) {
                    $scope.title = msg;
                    $scope.action = action;
                    $scope.comment;

                    $scope.save = function() {
                        $uibModalInstance.close($scope.comment);
                    }
                    $scope.close = function() {
                        $uibModalInstance.dismiss()
                    }
                },
                backdrop: 'static',
                size: 'md'
            });

            _popup.result.then(function(comment) {

                var query = {
                        _id: {
                            $in: timesheetsRequest.timesheets.map(function(t) {
                                return t._id;
                            })
                        }
                    },
                    updates = { $set: { status: action, processingDate: Date.now(), verifierReason: comment || null } };

                TimesheetFactory.updateBulk(query, updates).then(function(res) {
                    timesheetsRequest.status = action;
                }, function(err) {
                    scope.alert('System was unable to process your request');
                    console.log(err);
                })

            });

        }
    }

}());


(function() {
    'use strict';
    angular
        .module('hours.projectTimesheets', [])
        .config(ProjectTimesheetsConfig)
        .factory('ProjectTimesheetsFactory', ProjectTimesheetsFactory)
        .controller('projectTimesheetsController', ProjectTimesheetsController)

    ProjectTimesheetsConfig.$invoke = ['$stateProvider'];

    function ProjectTimesheetsConfig($stateProvider) {
        $stateProvider
            .state('projectTimesheets', {
                url: '/projectTimesheets',
                templateUrl: '/features/timesheet/projectTimesheets/projects.tpl.html',
                controller: 'projectTimesheetsController',
                data: {
                    state: 'projectTimesheets',
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {}
            })
    }

    ProjectTimesheetsFactory.$invoke = ['$http', '$q', '$localStorage', 'UserFactory'];

    function ProjectTimesheetsFactory($http, $q, $localStorage, UserFactory) {
        API_paths['projectsGetByManager'] = 'project/getProjectsUnderManager';
        API_paths['timesheetsGetByProject'] = 'timesheets/getProjectTimesheets';

        return {
            getManagerProjects: function() {
                var managerId = UserFactory.getUser()._id;
                var reqUrl = buildURL('projectsGetByManager') + buildQuery({ managerId: managerId });
                return $http.get(reqUrl);
            },
            getProjectTimesheets: function(projectId) {
                var reqUrl = buildURL('timesheetsGetByProject') + buildQuery({ projectId: projectId });
                return $http.get(reqUrl);
            }
        }
    }

    ProjectTimesheetsController.$invoke = ['$scope', '$rootScope', '$state', '$http', '$sce', '$compile', '$filter', '$uibModal', '$timeout', '$localStorage', 'ProjectTimesheetsFactory', 'EmployeeTimesheetsFactory', 'TimesheetFactory', 'WorkloadSchemesFactory', 'UserFactory'];

    function ProjectTimesheetsController($scope, $rootScope, $state, $http, $sce, $compile, $filter, $uibModal, $timeout, $localStorage, ProjectTimesheetsFactory, EmployeeTimesheetsFactory, TimesheetFactory, WorkloadSchemesFactory, UserFactory) {
        var scope = $scope;

        scope.filter = {
            name: ''
        };

        scope.projects = [];

        ProjectTimesheetsFactory.getManagerProjects().success(function(projects) {
            scope.projects = projects || [];
            if (scope.projects.length)
                angular.forEach(scope.projects, function(project) {
                    ProjectTimesheetsFactory.getProjectTimesheets(project._id).success(function(requests) {
                        project.requests = groupArray(requests, function(each) { return each.employee._id; });
                    });
                })

        });

        scope.timesheetRequests = [];
        EmployeeTimesheetsFactory.getEmployeesTimesheetRequests().success(function(requests) {
            scope.timesheetRequests = requests;
        });

        scope.getApprovedHours = function(projectId) {
            var reqs = scope.timesheetRequests,
                total = 0;
            if (!projectId || !reqs.length || !(reqs = reqs.filter(function(req) {
                    return req.project._id == projectId && req.status == 'approved';
                })).length) return total;

            angular.forEach(reqs, function(req) {
                if (req.timesheets.length > 1)
                    total += req.timesheets.reduce(function(result, next) {
                        var val = typeof result == 'object' ? result.value : result;
                        var sum = val + next.value;
                        return sum;
                    });
                else if (req.timesheets.length == 1) {
                    total += req.timesheets[0].value;
                }
            });
            return total;
        };

        scope.getPendingRequests = function(projectId) {
            var reqs = scope.timesheetRequests;
            if (!projectId || !reqs.length) return 0;

            return reqs = reqs.filter(function(req) {
                return req.project._id == projectId && req.status == 'pending';
            }).length;
        };

        $scope.workloadScheme;
        (function() {
            var m, arg, workloadSchemeId;

            if ((workloadSchemeId = UserFactory.getUser().workloadScheme)) {
                m = WorkloadSchemesFactory.get;
                arg = workloadSchemeId;
            } else {
                m = WorkloadSchemesFactory.get;
                arg = {
                    $query: {
                        default: true
                    }
                };
            }

            m.call(WorkloadSchemesFactory, arg).then(function(res) {
                if (Array.isArray(res.data)) res.data = res.data.shift();
                if (!res.data) return;
                $scope.workloadScheme = res.data;
            });

        }());

        scope.getDateDefaultWorkloadHour = function(date) {
            if (date.constructor != Date) date = new Date(date);
            var dayIndex = date.getDay(),
                tmp;
            if (scope.workloadScheme && scope.workloadScheme.timeline) {
                if ((tmp = scope.workloadScheme.timeline.find(function(each) {
                        return each.day == dayIndex;
                    }))) return tmp.value;
            }
        };

        scope.getEmployeeTotalHours = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            if ((requests = requests.filter(function(req) {
                    return req.container == 'horas';
                })).length) {
                if (requests.length > 1)
                    return requests.reduce(function(result, req) {
                        var val = typeof result == 'object' ? scope.getTotalHours(result) : result;
                        return val + scope.getTotalHours(req);
                    });
                else return scope.getTotalHours(requests[0]);
            }
        }

        scope.getTotalHours = function(timesheetRequest) {
            var req = timesheetRequest,
                formatted = 'n/a';
            if (!req.timesheets || !req.timesheets.length) return formatted;
            if (req.timesheets > 1)
                formatted = req.timesheets.reduce(function(result, next) {
                    var val = typeof result == 'object' ? result.value : result;
                    var sum = val + next.value;
                    return sum;
                });
            else formatted = req.timesheets[0].value
            return formatted;
        };

        scope.getTotalChecks = function(timesheetRequest) {
            var req = timesheetRequest,
                formatted = 'n/a';
            if (!req.timesheets || !req.timesheets.length) return formatted;
            formatted = req.timesheets.filter(function(t) {
                return t.value === true;
            }).length;
            return formatted;
        };

        scope.getEmployeeTotalDays = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            return requests.reduce(function(result, req) {
                var val = typeof result == 'object' ? scope.getTotalDays(result.startDate, result.endDate) : result;
                return val + scope.getTotalDays(req.startDate, req.endDate);
            });
        };

        scope.getTotalDays = function(startDate, endDate) {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            return Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 3600000));
        };

        scope.getEmployeePendingRequests = function(requests) {
            if (!requests || !Array.isArray(requests) || !requests.length) return 0;
            return requests.filter(function(req) {
                return req.status == 'pending'
            }).length
        };

        scope.processTimesheetRequest = function(timesheetsRequest, action) {
            if (!timesheetsRequest) return;
            if (!action) action = 'approved';
            var msg = "You're about to change status to \'" + action.toUpperCase() + '\" for a timesheet request?'
            scope.confirm(msg).then(function() {
                var query = {
                        _id: {
                            $in: timesheetsRequest.timesheets.map(function(t) {
                                return t._id;
                            })
                        }
                    },
                    updates = { $set: { status: action, processingDate: Date.now(), verifierReason: null } };

                TimesheetFactory.updateBulk(query, updates).then(function(res) {
                    timesheetsRequest.status = action;
                }, function(err) {
                    scope.alert('System was unable to process your request');
                    console.log(err);
                })
            })
        }

    }


}());

function groupArray(array, groupFunc) {
    if (!array || !(groupFunc instanceof Function) || !Array.isArray(array)) return array;
    if (array.length < 2) return [array];

    var arr = [],
        groupIds = [];
    angular.forEach(array, function(item) {
        var value = groupFunc(item);
        var ts = item.timesheets;
        // sort timesheets regarding date
        for (var i = 0; i < ts.length; i++) {
            for (var j = 0; j < ts.length - 1; j++) {
                var cur = ts[j],
                    next = ts[j + 1],
                    tmp;
                if (new Date(cur.date).getTime() > new Date(next.date).getTime()) {
                    tmp = ts[j];
                    ts[j] = ts[j + 1];
                    ts[j + 1] = tmp;
                }
            }
        }
        if (!value) return;
        var index = groupIds.indexOf(value);
        if (index == -1) {
            var arrIndex = groupIds.push(value) - 1;
            (arr[arrIndex] = arr[arrIndex] || []).push(item);
        } else arr[index].push(item);
    });
    return arr;
}