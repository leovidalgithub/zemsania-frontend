(function () {
    'use strict';
    angular
        .module('hours.employeeManager')
        .controller('createEmployeeController', createEmployeeController);

    createEmployeeController.$invoke = ['$scope', '$state', '$filter', '$timeout', 'EmployeeManagerFactory'];
    function createEmployeeController($scope, $state, $filter, $timeout, EmployeeManagerFactory) {
        var employee = {
            roles: ['ROLE_USER'],
            enabled: true,
            password: 'zemsania$15'
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
                    name: $filter('i18next')('user.genre_male'),
                    slug: 'male'
                },
                {
                    name: $filter('i18next')('user.genre_female'),
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
                }
            ];

            $scope.roles = [
                {
                    name: $filter('i18next')('role.ROLE_BACKOFFICE'),
                    slug: 'ROLE_BACKOFFICE'
                },
                {
                    name: $filter('i18next')('role.ROLE_DELIVERY'),
                    slug: 'ROLE_DELIVERY'
                },
                {
                    name: $filter('i18next')('role.ROLE_MANAGER'),
                    slug: 'ROLE_MANAGER'
                },
                {
                    name: $filter('i18next')('role.ROLE_USER'),
                    slug: 'ROLE_USER'
                }
            ];

            employee.roles.forEach(function (role) {
                $filter('filter')($scope.roles, {slug: role})[0].active = true;
            });

        }

        $timeout(function () {
            loadSelectsTranslate();
        }, 100);

        $scope.changeRole = function (role) {
            var allow = [];
            switch (role) {
                case 'ROLE_BACKOFFICE' :
                    allow = ['ROLE_DELIVERY', 'ROLE_MANAGER', 'ROLE_USER'];
                    break;
                case 'ROLE_DELIVERY' :
                    allow = ['ROLE_MANAGER', 'ROLE_USER'];
                    break;
                case 'ROLE_MANAGER' :
                    allow = ['ROLE_USER'];
                    break;
                default :
                    allow = ['ROLE_USER'];
                    break;
            }

            $scope.roles.forEach(function (role) {
                if (allow.indexOf(role.slug) > -1) {
                    role.active = true;
                }
            });

            employee.roles = allow;
        };

        $scope.signupUser = function () {
            $scope.employee.error = false;
            EmployeeManagerFactory.createEmployee($scope.employee)
                .then(function () {
                        $scope.employee.success = true;
                        $timeout(function () {
                            $state.go('employeeManager');
                        }, 1500);
                    },
                    function () {
                        $scope.employee.error = true;
                    });
        };

    }
}());