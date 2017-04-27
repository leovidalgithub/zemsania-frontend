;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .controller( 'NotificationController', NotificationController );

    NotificationController.$invoke = [ '$scope', 'notifications', '$window' ];
    function NotificationController( $scope, notifications, $window ) {

        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage( 125 ),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'notificationsListPage' ) || 0
        };

        setUsersView();
        $scope.notifications = notifications;

// *********************************************** JUST FOR TESTING PURPOSES ***********************************************
        // for( var i = 1; i < 20; i++ ) {
        //     var aa = angular.copy( notifications[0] );
        //     aa._id = '32r32r324r433_' + ( i + 34573 );
        //     notifications.push( aa );
        // }
        // var typesArray = ['holiday_req','hours_req','hours_validated','hours_rejected','hours_pending_req'];
        // $scope.notifications.forEach( function( el ) {
        //     var random = Math.floor( Math.random() * 5 );
        //     el.type = typesArray[random];
        // });
// *************************************************************************************************************************

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

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'notificationsListPage', $scope.tableConfig.currentPage );
        });


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