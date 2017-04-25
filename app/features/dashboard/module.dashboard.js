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
                templateUrl: '/features/dashboard/notifications/notifications.tpl.html',
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
