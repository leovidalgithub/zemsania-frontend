(function () {
    'use strict';
    angular
        .module('hours.components')
        .directive('zemSidebar', zemSidebar)
        .controller('SidebarComponentController', SidebarComponentController);

    SidebarComponentController.$invoke = ['$scope', 'UserFactory'];
    function SidebarComponentController($scope, UserFactory) {
        $scope.username = UserFactory.getUser();
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
