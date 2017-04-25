;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .controller( 'HomeController', HomeController );

    HomeController.$invoke = [ '$scope', 'notifications', '$window' ];
    function HomeController( $scope, notifications, $window ) {

        setUsersView();
        $scope.notifications = notifications;

        for( var i = 1; i < 20; i++ ) {
            var aa = angular.copy( notifications[0] );
            aa._id = '32r32r324r433_' + ( i + 34573 );
            notifications.push( aa );
        }

        angular.element( $window ).bind( 'resize', function() {
            $scope.$digest();
            setUsersView();
        });

        function setUsersView() {
            if( $window.innerWidth < 1210 ) {
                $scope.viewSet = false;
            } else {
                $scope.viewSet = true;            
            }
        }

        // SECTION SCROLL MOVE EVENT TO MAKE BUTTON 'toUpButton' APPEAR
        var scrollWrapper = document.getElementById( 'section' );
        scrollWrapper.onscroll = function ( event ) {
            var currentScroll = scrollWrapper.scrollTop;
            var upButton = $( '#toUpButton' );
            showUpButton( upButton, currentScroll );
        };

        // BUTTON TO TAKE SECTION SCROLL TO TOP
        $scope.pageGetUp = function() { takeMeUp() };

// ******************************************************* *******************************************************
        // $scope.notifications = notifications;
        // $scope.user = UserFactory.getUser();

        // $scope.activeNotifications = notifications.keys[0];

        // $scope.openType = function ( type ) {
        //     $scope.activeNotifications = type;
        // };

        // $scope.isActive = function ( type ) {
        //     return $scope.activeNotifications === type && 'active';
        // };

        // $scope.openNotification = function ( notification ) {
        //     switch ( notification.type ) {
        //         case 'holiday_request' :
        //             $state.go('moderateHolidayCalendar', {
        //                 userId: notification.senderId,
        //                 filterBy: 'pending'
        //             });
        //             break;
        //         case 'hours_sent' :
        //             $state.go( 'calendarImputeHoursValidator-user', {
        //                 userId: notification.senderId,
        //                 timestamp: new Date( notification.initDate ).getTime()
        //             });
        //             break;
        //     }
        // };

        // $scope.markRead = function ( notification, type, index ) {
        //     DashboardFactory.markNotificationAsRead( { notificationId: notification._id } )
        //         .then( function () {
        //             $scope.notifications.notifications[ type ].splice( index, 1 );
        //         }, function () {

        //         });
        // };
        
    }
}());