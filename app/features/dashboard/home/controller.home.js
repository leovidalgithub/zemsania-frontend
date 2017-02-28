(function () {
    'use strict';
    angular
        .module('hours.dashboard')
        .controller('HomeController', HomeController);

    HomeController.$invoke = ['$scope', 'UserFactory', '$state', 'notifications', 'DashboardFactory', '$i18next'];
    function HomeController($scope, UserFactory, $state, notifications, DashboardFactory, $i18next) {

// $scope.fn1 = function() {
//     $i18next.changeLanguage('es');
// };
// $scope.fn2 = function() {
//     $i18next.changeLanguage('en');
// };

        $scope.notifications = notifications;
        $scope.user = UserFactory.getUser();

        $scope.activeNotifications = notifications.keys[0];

        $scope.openType = function (type) {
            $scope.activeNotifications = type;
        };

        $scope.isActive = function (type) {
            return $scope.activeNotifications === type && 'active';
        };

        $scope.openNotification = function (notification) {
            switch (notification.type) {
                case 'holiday_request' :
                    $state.go('moderateHolidayCalendar', {
                        userId: notification.senderId,
                        filterBy: 'pending'
                    });
                    break;
                case 'hours_sent' :
                    $state.go('calendarImputeHoursValidator-user', {
                        userId: notification.senderId,
                        timestamp: new Date(notification.initDate).getTime()
                    });
                    break;
            }
        };

        $scope.markRead = function (notification, type, index) {
            DashboardFactory.markNotificationAsRead({notificationId: notification._id})
                .then(function () {
                    $scope.notifications.notifications[type].splice(index, 1);
                }, function () {

                });
        };
    }
}());