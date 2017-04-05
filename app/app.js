/*global loadPermissions:true*/
/*global setFormlyConfig:true*/
/*global tmpData:true*/

(function() {
    'use strict';
    angular
        .module('hours', [
            'ui.router',
            'permission',
            'permission.ui',
            'angularMoment',
            // 'ngAnimate', // ng-show/ng-hide/ng-if delay issue!!!
            'ngStorage',
            'angular-loading-bar',
            'ngSanitize',
            'jm.i18next',
            'ui.bootstrap',
            'ui.calendar',
            'angular-table',
            'monospaced.elastic',
            'formly',
            'formlyBootstrap',
            'ngFileSaver',
            'hours.auth',
            // 'hours.projectWorkflow',
            // 'hours.errors',
            'hours.dashboard',
            'hours.components',
            'hours.employeeManager',
            'hours.calendar',
            'hours.impute'
            // 'hours.reports',
            // 'hours.projects',
            // 'hours.excelExport'
        ])
        .config( appConfig )
        .run( appRun );

    appConfig.$invoke = [ '$locationProvider', '$i18nextProvider', 'cfpLoadingBarProvider', '$urlRouterProvider' ];
    function appConfig( $locationProvider, $i18nextProvider, cfpLoadingBarProvider, $urlRouterProvider ) {
        $urlRouterProvider.otherwise( function( $injector ) {
            var $state = $injector.get( "$state" );
            $state.transitionTo( 'login' );
        });
        cfpLoadingBarProvider.includeSpinner = false;
    }

    appRun.$invoke = [ 'PermRoleStore', 'UserFactory', '$rootScope', '$http', 'formlyConfig', '$uibModal', '$localStorage','$i18next' ];
    function appRun( PermRoleStore, UserFactory, $rootScope, $http, formlyConfig, $uibModal, $localStorage, $i18next ) {

        window.i18next
            .use( window.i18nextXHRBackend );
        window.i18next.init({
            lng: 'es', // If not given, i18n will detect the browser language.
            fallbackLng: 'dev', // Default is dev
            backend: {
                loadPath: 'assets/locales/{{lng}}/{{ns}}.json'
            }
        }, function ( err, t ) {
            // console.log('resources loaded');
            $rootScope.$apply();
        });

        $rootScope.$on( '$stateChangePermissionStart', function( event, args ) {            
            var reqPerms = args.data.permissions;
            var anonymousUser = angular.isDefined(reqPerms.only) && reqPerms.only[0] === 'anonymous';
            var locale = (navigator.language || navigator.userLanguage).split('-')[0];

            $rootScope.activeState = args.data.state;
            $rootScope.layoutTemplate = '/layouts/' + args.data.template + '.html';

            // If not anonymous user put Auth header
            if (!anonymousUser) {
                $http.defaults.headers.common['x-auth-token'] = UserFactory.getUserToken();
                locale = UserFactory.getUser().locale;
            }

            $i18next.changeLanguage(locale);

            $rootScope.toggleSidebarStatus = false;
        });

        $rootScope.toggleSidebarStatus = false;
        $rootScope.toggleMobileSidebar = function() {
            $rootScope.toggleSidebarStatus = !$rootScope.toggleSidebarStatus;
        };

        loadPermissions(PermRoleStore, UserFactory);
        tmpData($rootScope);
        setFormlyConfig(formlyConfig);

    }
}());
