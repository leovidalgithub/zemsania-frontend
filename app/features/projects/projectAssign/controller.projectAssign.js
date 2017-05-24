;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignController', ProjectAssignController );

    ProjectAssignController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal', '$timeout' ];
    function ProjectAssignController( $scope, ProjectsFactory, $uibModal, $timeout ) {

        $scope.spinners = {
                    projects : false,
                    users    : false
        };
        $scope.currentMode = {
                    obj  : {},
                    type : 'none', // it can be: 'none', 'projects' or 'users'
        };

        ( function Init() {
            $timeout( function() { // search input set_focus
                // $scope.$broadcast( 'toSearchEvent', { searchText : '12' } );
                setMainBoxesHeight();
                document.getElementById( 'searchInput' ).focus();
            }, 400 );
        })();

        $scope.searchProject = function ( searchText ) {
            $scope.currentMode.type = 'none';
            $scope.currentMode.obj  = {};
            $scope.$broadcast( 'toSearchEvent', { searchText : searchText } );
        };

        $scope.removeThis = function( obj, event ) {
            event.preventDefault();
            event.stopPropagation(); // to avoid continue to select item
            var user    = $scope.currentMode.type == 'users' ? $scope.currentMode.obj : obj;
            var project = $scope.currentMode.type == 'projects' ? $scope.currentMode.obj : obj;

            // MODAL - WARNING BEFORE REMOVING PROJECT-USER RELATIONSHIP
            var modalPendingChangesInstance = $uibModal.open( {
            animation : true,
            templateUrl : '/features/projects/projectAssign/modals/warningRemoveModal.tpl.html',
            controller : 'ModalInfo',
            resolve : {
                data : {
                    user        : user,
                    project     : project,
                    currentMode : $scope.currentMode
                }
            },
            backdrop: 'static',
            size: 'sm',
            }).result.then( function() {}, function( res ) {} ); // to avoid: 'Possibly unhandled rejection: backdrop click'
        };

        $scope.newMarcate = function() {
            var modalPendingChangesInstance = $uibModal.open( {
            animation : true,
            templateUrl : '/features/projects/projectAssign/modals/modalMarcate.tpl.html',
            controller : 'ModalMarcate',
            resolve : {
                data : { currentMode : $scope.currentMode }
            },
            backdrop: 'static',
            size: 'md',
            }).result.then( function() {}, function( res ) {} ); // to avoid: 'Possibly unhandled rejection: backdrop click'
        };

        // MESSAGES ALERT RECEIVE EVENT
        $scope.$on( 'messageAlert', function( event, data ) {
            $scope.alerts.error   = data.error;
            $scope.alerts.message = data.message;
        });

        // please, back to me just one word (one name, one surname)
        $scope.giveMeFirstWord = function( string ) {
            return string ? string.toString().split( ' ' )[0] : '';
        };

        function setMainBoxesHeight() {
            var sectionHeight = document.getElementById( 'section' ).offsetHeight;
            $( '#projectAssign #section .mainBoxes' ).height( sectionHeight - 185 );
        }
    }

}());
