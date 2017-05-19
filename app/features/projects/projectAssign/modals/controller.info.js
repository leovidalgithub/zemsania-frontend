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
                    // we proceed to remove the item from either $scope.employess or $scope.projects
                    if( data.currentMode.type == 'users' ) {
                        $rootScope.$broadcast( 'removeProjectItem', { id : data.project._id } );
                    } else {
                        $rootScope.$broadcast( 'removeUserItem', { id : data.user._id } );
                    }
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
