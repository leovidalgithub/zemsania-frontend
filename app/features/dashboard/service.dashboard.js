;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .factory( 'DashboardFactory', DashboardFactory );

    DashboardFactory.$invoke = [ '$http', '$q' ];
    function DashboardFactory( $http, $q ) {
        return {
            
            getUnreadNotifications: function () {
                var dfd = $q.defer();
                $http.get( buildURL( 'unreadNotifications' ) )
                    .then( function ( response ) {
                        var notifications = response.data.notifications;
                        notifications.forEach( function( notification ) {
                            notification.senderId.fullName = notification.senderId.name + ' ' + notification.senderId.surname;
                        });
                        dfd.resolve( notifications );
                        })
                        .catch( function ( err ) {
                            dfd.reject( err );
                        });
                return dfd.promise;

                    //     if ( response.data.success ) {
                    //         var notificationTypes, notificationResponse;
                    //         var notifications = {};
                    //         response.data.notifications.forEach( function ( notification ) {
                    //             if ( angular.isUndefined( notifications[ notification.type ] )) {
                    //                 notifications[notification.type] = [];
                    //             }
                    //             notifications[ notification.type ].push( notification );
                    //         });
                    //         notificationTypes = Object.keys( notifications );
                    //         notificationResponse = { keys: notificationTypes, notifications: notifications };

                    //         dfd.resolve( notificationResponse );
                    //     } else {
                    //         dfd.reject( response );
                    //     }

            },
            // markNotificationAsRead: function ( id ) {
                // var dfd = $q.defer();
                // $http.post( buildURL( 'markReadNotifications' ), id )
                //     .then(function () {
                //         dfd.resolve( true );
                //     }, function ( err ) {
                //         dfd.resolve( err );
                //     });
                // return dfd.promise;
            // }
        };
    }
}());
