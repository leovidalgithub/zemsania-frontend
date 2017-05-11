;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .factory( 'ProjectsFactory', ProjectsFactory );

    ProjectsFactory.$invoke = [ '$http', '$q' ];
    function ProjectsFactory( $http, $q ) {
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
            }

            // getUsersInProjectByID: function (projectID) {
            //     var dfd = $q.defer();
            //     $http
            //         .post(buildURL('projectGetUsers'), {projectId: projectID})
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