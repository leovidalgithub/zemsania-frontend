( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .factory( 'EmployeeManagerFactory', EmployeeManagerFactory );

    EmployeeManagerFactory.$invoke = [ '$http', 'UserFactory', '$q' ];
    function EmployeeManagerFactory( $http, $q, UserFactory ) {
        return {

            getEmployeeList: function () { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getAllUsers' ) )
                    .then( function ( response ) {
                        if ( response.data.success ) {
                            var employees = response.data.users;
                            prepareData( employees );
                            dfd.resolve( employees );
                        } else {
                            dfd.reject( response );
                        }
                    }, function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            advancedUserSearch: function( query ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.post( buildURL( 'advancedUserSearch' ), query)
                    .then( function ( response ) {
                        var employees = response.data.users;
                        prepareData( employees );
                        dfd.resolve( employees );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getEmployeeFromID: function ( userID ) { // LEO WAS HERE
                var dfd = $q.defer();
                if ( !userID ) {
                    dfd.reject();
                }
                $http.post( buildURL( 'newSearchUser' ), { _id: userID } )
                    .then( function ( response ) {
                        var user = response.data.user;
                        dfd.resolve( user );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;

            },
            updateEmployee: function ( credentials ) { // LEO WAS HERE
                var dfd = $q.defer();
                delete credentials.error;

                $http.put( buildURL( 'saveUser' ), credentials )
                    .then( function ( response ) {
                        if ( response.data.success ) {
                            dfd.resolve( response.data );
                        } else {
                            dfd.reject( response );
                        }
                    }, function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            createEmployee: function ( credentials ) { // LEO WAS HERE
                var dfd = $q.defer();
                delete credentials.error;

                $http.post( buildURL( 'createUser' ), credentials )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getEnterprises: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getEnterprisesCollection' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data.results );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            supervisorsExceptID: function( userID ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getSupervisors' ) + userID )
                    .then( function ( data ) {
                        dfd.resolve( data.data.results );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getAllSupervisors: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getAllSupervisors' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data.results );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getDefaultPassword: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getDefaultPassword' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data );
                    })
                return dfd.promise;
            }
        };

        function prepareData( employees ) {
            employees.forEach( function( employee ) {
                // create fullName field
                employee.fullName = employee.name + ' ' + employee.surname;
                // create isManager field
                var isManager = employee.roles.some( function( role ) {
                    return role == 'ROLE_MANAGER';
                });
                employee.isManager = isManager;
            });
        }
    }
}());



            // removeEmployee: function (query) {
            //     var dfd = $q.defer();
            //     $http
            //         .delete(buildURL('removeUser'), {data: query})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(true);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });
            //     return dfd.promise;
            // },

            // getUsersBySupervisor: function () {
            //     var dfd = $q.defer();
            //     var email = UserFactory.getUser().username;
            //     $http
            //         .post(buildURL('getUsersBySupervisor'), {"email": email})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data.users);
            //             } else {
            //                 dfd.reject(response.data.errors);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });
            //     return dfd.promise;
            // },
