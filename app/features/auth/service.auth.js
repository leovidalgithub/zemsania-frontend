( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .factory( 'UserFactory', UserFactory );

    UserFactory.$invoke = [ '$http', '$q', '$localStorage' ];
    function UserFactory( $http, $q, $localStorage ) {
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
            getcalendarID: function () {
                return $localStorage.User.calendarID;
            },
            doLogout: function () {
                delete $localStorage.User;
            },
            doLogin: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();
                $http.post( buildURL( 'login' ), credentials )
                    .then( function ( response ) {
                        if ( response.data.success) {
                            var userModel = response.data.user;

                            if ( userModel.roles.indexOf( 'ROLE_USER' ) > -1) {
                                userModel.role = 'user';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_DELIVERY' ) > -1) {
                                userModel.role = 'delivery';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_MANAGER' ) > -1) {
                                userModel.role = 'manager';
                            }
                            if ( userModel.roles.indexOf( 'ROLE_BACKOFFICE' ) > -1) {
                                userModel.role = 'administrator';
                            }

                            userModel.token    = response.data.token;
                            $localStorage.User = userModel;
                            dfd.resolve( userModel );
                        } else {
                            dfd.reject( response );
                        }
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });

                return dfd.promise;
            },
            doPasswordRecovery: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();

                $http.post( buildURL( 'passwordRecovery' ), credentials )
                    .then( function ( response ) {
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
            doChangePassword: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd           = $q.defer();
                var passwordReset = {
                        currentPassword : credentials.current,
                        newPassword     : credentials.new
                };
                $http.post( buildURL( 'passwordReset' ), passwordReset )
                    .then( function ( data ) {
                            // delete $localStorage.User;
                        dfd.resolve( data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },            
            saveProfile: function ( credentials ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();
                $http.put( buildURL( 'saveUser' ), credentials )
                    .then( function ( response ) {                            
                        $localStorage.User = credentials;
                        dfd.resolve( response );
                    })
                    .catch( function( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            verifyUniqueUserEmail: function ( emailToVerify ) { // ***************** LEO WAS HERE *****************
                var dfd = $q.defer();
                $http.get( buildURL( 'verifyUniqueUserEmail' ) + emailToVerify )
                    .then( function ( response ) {                            
                        dfd.resolve( response );
                    })
                    .catch( function( err ) {
                        dfd.reject( err );
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