;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .factory( 'DashboardFactory', DashboardFactory );

    DashboardFactory.$invoke = [ '$http', '$q' ];
    function DashboardFactory( $http, $q ) {
        return {
            
            getAllNotifications: function () {
                var dfd = $q.defer();
                $http.get( buildURL( 'getAllNotifications' ) )
                    .then( function ( response ) {
                        var notifications = response.data.notifications;
                        notifications.forEach( function( notification ) { // create 'fullName' field before continue
                            notification.senderId.fullName = notification.senderId.name + ' ' + notification.senderId.surname;
                        });
                        dfd.resolve( notifications );
                        })
                    .catch( function ( err ) {
                        dfd.reject( err );
                        });
                return dfd.promise;
            },

            markNotificationAsRead: function ( notificationId ) {
                var dfd = $q.defer();
                $http.post( buildURL( 'markReadNotifications' ), { notificationId : notificationId } )
                    .then( function () {
                        dfd.resolve( true );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            insertNewNotification: function( data ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.post( buildURL( 'insertNewNotification' ), data )
                    .then( function ( response ) {
                        dfd.resolve( response  );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },


            // getUnreadNotifications: function () {
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'unreadNotifications' ) )
            //         .then( function ( response ) {
            //             var notifications = response.data.notifications;
            //             notifications.forEach( function( notification ) {
            //                 notification.senderId.fullName = notification.senderId.name + ' ' + notification.senderId.surname;
            //             });
            //             dfd.resolve( notifications );
            //             })
            //             .catch( function ( err ) {
            //                 dfd.reject( err );
            //             });
            //     return dfd.promise;
            // }
        };
    }
}());
