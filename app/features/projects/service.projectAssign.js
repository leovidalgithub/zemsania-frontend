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