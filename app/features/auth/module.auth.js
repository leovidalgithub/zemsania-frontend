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