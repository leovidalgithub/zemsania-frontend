( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'zemSidebar', zemSidebar )
        .controller( 'SidebarComponentController', SidebarComponentController );

    SidebarComponentController.$invoke = [ '$scope', '$rootScope', 'UserFactory', '$state' ];
    function SidebarComponentController( $scope, $rootScope, UserFactory, $state ) {
        $scope.username = UserFactory.getUser();

        $scope.myFunction = function( state ) {
            if( $rootScope.pendingChanges ) {
                $scope.$broadcast( 'urlChangeRequest', { msg : 'From sidebar URL change request', nextURL : state } );
            } else {
                $state.go( state );
            }
        };

    }
    function zemSidebar() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/features/components/sidebar/sidebar.tpl.html',
            controller: 'SidebarComponentController'
        };
    }
}());
