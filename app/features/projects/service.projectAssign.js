;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .factory( 'ProjectsFactory', ProjectsFactory );

    ProjectsFactory.$invoke = [ '$http', '$q', 'UserFactory' ];
    function ProjectsFactory( $http, $q, UserFactory ) {
        return {

            advancedProjectSearch : function ( searchText ) {
                var dfd = $q.defer();
                $http.post( buildURL( 'projectSearch' ), { searchText : searchText } )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getProjectsByUserId: function ( userID ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getProjectsByUserId' ) + userID )
                    .then( function ( response ) {
                        var projects = response.data.projects;
                        projects.forEach( function( project ) { // compound name for impute-hours view
                            project.nameToShow = project.code + ' - ' + project.name;
                        });
                        dfd.resolve( response.data.projects );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getUsersByProjectId: function ( projectId ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getUsersByProjectId' ) + projectId )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            demarcateUserProject: function ( data ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.post( buildURL( 'demarcateUserProject' ), data )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            marcateUserProject: function ( data ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.post( buildURL( 'marcateUserProject' ), data )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            // GET AND SET THE NUMBER OF OCURRENCES OF PROJECT OR USER IN PROJECTUSERS ENTITY
            setItemsOcurrences: function ( array ) { // LEO WAS HERE
                var idObj = {};
                array.forEach( function( item ) {
                    idObj[ item._id ] = {};
                });
                $http.post( buildURL( 'countOcurrences' ), idObj )
                    .then( function ( data ) {
                        var data_IdObj = data.data.idObj;
                        array.forEach( function( item ) {
                            item.ocurrences = data_IdObj[ item._id ].ocurrences;
                        });
                    })
                    .catch( function ( err ) {
                    });
            },

            // it adds an 'active' field to both employess and projects objects
            // when users select an employee or project it is activated to true
            toAddActiveField: function ( array ) {
                array.forEach( function( element ) {
                    element.active = false;
                });
            },

            // it sets 'active = true' for the element id inside the array
            setActiveItem: function ( array, id ) {
                array.forEach( function( element ) {
                    element.active = element._id == id ? true : false;
                });
            },

            removeItemFromArray: function( array, id ) {
                var index = array.findIndex( function( element ) {
                    return element._id == id;
                });
                array.splice( index, 1 );
            },

            // getUsersInProjectByID: function (projectId) {
            //     var dfd = $q.defer();
            //     $http
            //         .post(buildURL('projectGetUsers'), {projectId: projectId})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data.users);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // addUserInProject: function (userProject) {
            //     var dfd = $q.defer();
            //     $http
            //         .post(buildURL('projectUserSave'), userProject)
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
            // updateUserInProject: function (userProject) {
            //     var dfd = $q.defer();
            //     $http
            //         .put(buildURL('projectUserUpdate'), userProject)
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
            // deleteUserInProject: function (userProject) {
            //     var dfd = $q.defer();
            //     $http
            //         .delete(buildURL('projectUserDelete'), {
            //             data: userProject,
            //             headers: {
            //                 "Content-type": "application/json; charset=utf-8"
            //             }
            //         })
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
            // }

        };
    }
}());
