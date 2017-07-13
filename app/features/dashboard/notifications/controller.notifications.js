;( function () {
    'use strict';
    angular
        .module( 'hours.dashboard' )
        .controller( 'NotificationController', NotificationController );

    NotificationController.$invoke = [ '$scope', '$rootScope', 'notifications', '$window', '$state', 'DashboardFactory', '$filter' ];
    function NotificationController( $scope, $rootScope, notifications, $window, $state, DashboardFactory, $filter ) {

        ( function init() {
            $scope.tableConfig = {
                itemsPerPage: getItemsPerPage( 125 ),
                maxPages: "3",
                fillLastPage: false,
                currentPage: $scope.tmpData( 'get', 'notificationsListPage' ) || 0
            };

            setUsersView();
            $scope.notifications = notifications;
            $scope.options = {};
            $scope.options.justUnread = 'true';
            $scope.options.length = 0;
            getUnreadLength();
        })();

        // EVERYTIME WINDOW IS RESIZED EVENT
        angular.element( $window ).bind( 'resize', function() {
            $scope.$digest();
            setUsersView();
        });

        // IT GETS WINDOW WIDTH TO CHOOSE ONE OF THE TWO VIEWS
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

        // UP-BUTTON CLICK TO TAKE SECTION SCROLL TO TOP
        $scope.pageGetUp = function() { takeMeUp() };

        // TO GO WHERE NOTIFICATION IS ABOUT
        $scope.goTo = function( item ) {
            var type           = item.type;
            var senderId       = item.senderId._id;
            var issueDate      = item.issueDate;
            var notificationId = item._id;
            $scope.markRead( notificationId ); // before go, mark this notification as read
            $rootScope.notification = {}; // Initializing
            $rootScope.notification.issueDate = issueDate;
            switch ( type ) {
                case 'hours_req':
                    $rootScope.notification.senderId  = senderId;
                    $state.go( 'approvalHours' );
                    break;
                case 'hours_reviewed':
                    $state.go( 'imputeHours' );
                    break;
                default:
                    break;
            }
        };

        // SET NOTIFICATION AS READ
        $scope.markRead = function ( notificationId ) {
            DashboardFactory.markNotificationAsRead( notificationId )
                .then( function ( data ) {
                    var notification = getNotification( notificationId );
                    notification.status = 'read';
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'ok', msg : $filter( 'i18next' )( 'notifications.okMarkRead' ) } );
                })
                .catch( function ( err ) {
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'notifications.errorMarkRead' ) } );
                })
                .finally( function() {
                    getUnreadLength();
                });
        };

        // GET NOTIFICATION OBJECT BY ITS ID FROM '$scope.notifications'
        function getNotification( id ) {
            return $scope.notifications.find( function( notification ) {
                return notification._id === id;
            });
        }

        // GET TOTAL OF UNREAD NOTIFICATIONS
        function getUnreadLength() {
            $scope.options.length = 0;
            $scope.notifications.forEach( function( notification ) {
                if( notification.status == 'unread') $scope.options.length++;
            });
        }

        // FUNCTION FILTER TO SHOW UNREAD OR READ NOTIFICATIONS ONLY (ng-show)
        $scope.filterNotifications = function( status ) {
            var radioStatus = $scope.options.justUnread == 'true' ? 'unread' : 'read';
            return ( status == radioStatus );
        };

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'notificationsListPage', $scope.tableConfig.currentPage );
        });

        console.clear();

     }
}());
