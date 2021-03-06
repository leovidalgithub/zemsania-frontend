( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'createEmployeeController', createEmployeeController );

    createEmployeeController.$invoke = [ '$scope', '$rootScope', '$state', 'data', '$filter', '$timeout', 'EmployeeManagerFactory' ];
    function createEmployeeController( $scope, $rootScope, $state, data, $filter, $timeout, EmployeeManagerFactory ) {

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
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
            EmployeeManagerFactory.createEmployee( $scope.employee )
                .then( function ( data ) {
                    if( data.success ) {
                        $rootScope.$broadcast( 'showThisAlertPlease', { type : 'ok', msg : $filter( 'i18next' )( 'employeeManager.create.saveSuccess' ) } );
                        $timeout( function () {
                            $state.go( 'employeeManager' );
                        }, 2500 );
                    } else {
                        $rootScope.$broadcast( 'showThisAlertPlease', { type : 'warning', msg : $filter( 'i18next' )( 'employeeManager.create.userAlreadyExists' ) + $scope.employee.username } );
                    }
                })
                .catch( function ( err ) {
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'employeeManager.create.saveError' ) } );
                });
        };
    }
}());
