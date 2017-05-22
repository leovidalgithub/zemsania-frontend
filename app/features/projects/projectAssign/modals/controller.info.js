;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ModalInfo', ModalInfo );

    ModalInfo.$invoke = [ '$scope', '$uibModalInstance', 'data', 'ProjectsFactory', '$rootScope', '$filter' ];
    function ModalInfo( $scope, $uibModalInstance, data, ProjectsFactory, $rootScope, $filter ) {

        $scope.data = data;

        $scope.demarcate = function () {
            $uibModalInstance.dismiss( 'cancel' );
            ProjectsFactory.demarcateUserProject( data )
                .then( function ( result ) {
                    // once relationship was erased from ProjectUsers entity
                    // we proceed to refresh the projects or users list view calling to ActiveThisUser or ActiveThisProject
                    if( $scope.data.currentMode.type == 'users' ) {
                        $rootScope.$broadcast( 'refreshactiveThisUser', { data : null } );
                    } else {
                        $rootScope.$broadcast( 'refreshactiveThisProject', { data : null } ); 
                    };
                })
                .catch( function ( err ) {
                    $rootScope.$broadcast( 'messageAlert', { 
                                        error : true,
                                        message : $filter( 'i18next' )( 'projects.projectAssign.errorDemarcate' ) } );
                });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss( 'cancel' );
        };

    }

}());
