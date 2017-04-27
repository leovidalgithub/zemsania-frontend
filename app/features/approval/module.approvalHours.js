;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours', [] )
        .config( approvalHoursConfig )

    approvalHoursConfig.$invoke = [ '$stateProvider' ];
    function approvalHoursConfig( $stateProvider ) {
        $stateProvider
            .state( 'approvalHours', {
                url: '/approvalhours',
                templateUrl: '/features/approval/approval/approvalhours.tpl.html',
                controller: 'approvalHoursController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                },
                resolve: {}
            })
    }
}());
