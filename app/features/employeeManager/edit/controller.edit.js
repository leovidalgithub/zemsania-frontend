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