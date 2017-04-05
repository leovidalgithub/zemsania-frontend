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
