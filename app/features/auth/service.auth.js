(function () {
    'use strict';
    angular
        .module('hours.auth')
        .factory('UserFactory', UserFactory);

    UserFactory.$invoke = ['$http', '$q', '$localStorage'];
    function UserFactory($http, $q, $localStorage) {
        return {
            getUser: function () {
                return $localStorage.User;
            },
            getUserID: function () {
                return $localStorage.User._id;
            },
            getUserToken: function () {
                return $localStorage.User.token;
            },
            doLogout: function () {
                delete $localStorage.User;
            },
            doLogin: function (credentials) {
                var dfd = $q.defer();

                $http
                    .post(buildURL('login'), credentials)
                    .then(function (response) {
                        if (response.data.success) {
                            var userModel = response.data.user;

                            if (userModel.roles.indexOf('ROLE_USER') > -1) {
                                userModel.role = 'user';
                            }

                            if (userModel.roles.indexOf('ROLE_MANAGER') > -1) {
                                userModel.role = 'manager';
                            }

                            if (userModel.roles.indexOf('ROLE_DELIVERY') > -1) {
                                userModel.role = 'delivery';
                            }

                            if (userModel.roles.indexOf('ROLE_BACKOFFICE') > -1) {
                                userModel.role = 'administrator';
                            }

                            userModel.token = response.data.token;
                            $localStorage.User = userModel;

                            dfd.resolve(userModel);
                        } else {
                            dfd.reject(response);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            doPasswordRecovery: function (credentials) {
                var dfd = $q.defer();

                $http
                    .post(buildURL('passwordRecovery'), credentials)
                    .then(function (response) {
                        if (response.data.success) {
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            doChangePassword: function (credentials) {
                var dfd = $q.defer();
                var passwordReset = {
                    oldPassword: credentials.oldPassword,
                    newPassword: credentials.password
                };

                $http
                    .post(buildURL('passwordReset'), passwordReset)
                    .then(function (response) {
                        if (response.data.success) {
                            delete $localStorage.User;
                            dfd.resolve();
                        } else {
                            dfd.reject(response);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            saveProfile: function (credentials) {
                var dfd = $q.defer();

                $http
                    .put(buildURL('saveUser'), credentials)
                    .then(function (response) {
                        if (response.data.success) {
                            $localStorage.User = credentials;
                            dfd.resolve(true);
                        } else {
                            dfd.reject(response);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            },
            getUsersBySupervisor: function () {
                var dfd = $q.defer();
                var email = UserFactory.getUser().username;

                $http
                    .post(buildURL('getUsersBySupervisor'), {"email": email})
                    .then(function (response) {
                        if (response.data.success) {
                            dfd.resolve(response.data.users);
                        } else {
                            dfd.reject(response.data.errors);
                        }
                    }, function (err) {
                        dfd.reject(err);
                    });

                return dfd.promise;
            }
        };
    }
}());