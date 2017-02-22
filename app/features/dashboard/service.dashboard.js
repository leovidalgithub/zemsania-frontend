(function () {
    'use strict';
    angular
        .module('hours.dashboard')
        .factory('DashboardFactory', DashboardFactory);

    DashboardFactory.$invoke = ['$http', '$q'];
    function DashboardFactory($http, $q) {
        return {
            getUnreadNotifications: function () {
                var dfd = $q.defer();
                $http
                    .get(buildURL('unreadNotifications'))
                    .then(function (response) {
                        if (response.data.success) {
                            var notificationTypes, notificationResponse;
                            var notifications = {};
                            response.data.notifications.forEach(function (notification) {
                                if (angular.isUndefined(notifications[notification.type])) {
                                    notifications[notification.type] = [];
                                }

                                notifications[notification.type].push(notification);
                            });
                            notificationTypes = Object.keys(notifications);
                            notificationResponse = {keys: notificationTypes, notifications: notifications};

                            dfd.resolve(notificationResponse);
                        } else {
                            dfd.reject(response);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            markNotificationAsRead: function (id) {
                var dfd = $q.defer();
                $http
                    .post(buildURL('markReadNotifications'), id)
                    .then(function () {
                        dfd.resolve(true);
                    }, function (err) {
                        dfd.resolve(err);
                    });

                return dfd.promise;
            }
        };
    }
}());
