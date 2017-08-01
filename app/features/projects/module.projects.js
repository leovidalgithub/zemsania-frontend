;( function () {
    'use strict';
    angular
        .module( 'hours.projects', [] )
        .config( projectsConfig );

    projectsConfig.$invoke = [ '$stateProvider' ];
    function projectsConfig( $stateProvider ) {
        $stateProvider
            .state( 'projectAssign', {
                url: '/projects/assign',
                templateUrl: '/features/projects/projectAssign/projectAssign.tpl.html',
                controller: 'ProjectAssignController',
                data: {
                    template: 'complex',
                    permissions: {
                        only: [ 'administrator', 'manager' ],
                        redirectTo: 'dashboard'
                    }
                }
            });
    }
}());
