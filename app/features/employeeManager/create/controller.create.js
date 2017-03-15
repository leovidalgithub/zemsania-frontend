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