;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ModalMarcate', ModalMarcate );

    ModalMarcate.$invoke = [ '$scope', '$rootScope', '$uibModalInstance', 'data', 'ProjectsFactory', 'EmployeeManagerFactory', '$filter' ];
    function ModalMarcate( $scope, $rootScope, $uibModalInstance, data, ProjectsFactory, EmployeeManagerFactory, $filter ) {

        $scope.data = {
                spinners    : false,
                maxHours    : 0,
                searchText  : '',
                currentMode : data.currentMode
        };

        $scope.search = function( searchText ) {
            $scope.data.spinners = true;
            var thisPromise      = [];
            if( $scope.data.currentMode.type == 'users' ) {
                thisPromise.push( ProjectsFactory.advancedProjectSearch( searchText ) );
            } else {
                thisPromise.push( EmployeeManagerFactory.advancedUserSearch( { textToFind : searchText } ) );                
            }
            Promise.all( thisPromise )
                .then( function ( data ) {
                    if( $scope.data.currentMode.type == 'users' ) {
                        $scope.data.items = data[0].projects;
                    } else {
                        $scope.data.items = data[0];
                    }
                })
                .catch( function ( err ) {
                   $rootScope.$broadcast( 'messageAlert', {
                                        error : true,
                                        message : $filter( 'i18next' )( 'projects.projectAssign.errorData' ) } );
                })
                .then( function() { // functionallity as finally
                    $scope.data.spinners = false;
                });
        };

        $scope.marcateThis = function( item ) {
            var userId    = '';
            var projectId = '';
            if( $scope.data.currentMode.type == 'users' ) {
                userId    = $scope.data.currentMode.obj._id;
                projectId = item._id;
            } else {
                projectId = $scope.data.currentMode.obj._id;
                userId    = item._id;
            }
            var data = {
                projectId : projectId,
                userId    : userId,
                maxHours  : $scope.data.maxHours
            };
            ProjectsFactory.marcateUserProject( data )
                .then( function ( result ) {
                    // once the new ProjectUser document was inserted, we proceed to delete that item from list
                    ProjectsFactory.removeItemFromArray( $scope.data.items, item._id );
                })
                .catch( function ( err ) {
                    $uibModalInstance.dismiss( 'cancel' );
                    $rootScope.$broadcast( 'messageAlert', { 
                                        error : true,
                                        message : $filter( 'i18next' )( 'projects.projectAssign.errorMarcate' ) } );
                });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss( 'cancel' );
            // at modal exit, we proceed to refresh the projects or users list view calling to ActiveThisUser or ActiveThisProject
            if( $scope.data.currentMode.type == 'users' ) {
                $scope.$emit( 'refreshactiveThisUser', { data : null } );
            } else {
                $scope.$emit( 'refreshactiveThisProject', { data : null } ); 
            }
        };

    }

}());
