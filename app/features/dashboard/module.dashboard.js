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
                controller: 'NotificationController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {
                    notifications: [ 'DashboardFactory', function ( DashboardFactory ) {
                        return DashboardFactory.getAllNotifications();
                    }]
                }
            });
    }
}());
