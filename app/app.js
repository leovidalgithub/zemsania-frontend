/*global loadPermissions:true*/
/*global setFormlyConfig:true*/
/*global tmpData:true*/

;( function() {
    'use strict';
    angular
        .module( 'hours', [
            'ngIdle',
            'ui.router',
            'permission',
            'permission.ui',
            'angularMoment',
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
            // 'ngAnimate', // this cause ng-show/ng-hide/ng-if delay issue
            'hours.auth',
            'hours.timeout',
            'hours.dashboard',
            'hours.components',
            'hours.employeeManager',
            'hours.calendar',
            'hours.impute',
            'hours.approvalHours',
            'hours.projects'
            // 'hours.projectWorkflow',
            // 'hours.errors',
            // 'hours.reports',
            // 'hours.excelExport'
        ])
        .config( appConfig )
        .run( appRun );

    appConfig.$invoke = [ '$locationProvider', '$i18nextProvider', 'cfpLoadingBarProvider', '$urlRouterProvider', '$qProvider', 'KeepaliveProvider', 'IdleProvider' ];
    function appConfig( $locationProvider, $i18nextProvider, cfpLoadingBarProvider, $urlRouterProvider, $qProvider, KeepaliveProvider, IdleProvider ) {

        // IDLE USER ACTIVITY DETECT ************************
        IdleProvider.idle(80); // 80 seconds to get warning
        IdleProvider.timeout(125); // 25 seconds to user do something to avoid logout
        KeepaliveProvider.interval(10);

        $urlRouterProvider.otherwise( function( $injector ) {
            var $state = $injector.get( "$state" );
            $state.transitionTo( 'login' );
        });
        cfpLoadingBarProvider.includeSpinner = false;

        $locationProvider.html5Mode( true );
        $locationProvider.hashPrefix( '!' );

        // this is for '$uibModalInstance' modal unhandled error when close modal: 'possibly unhandled rejection cancel modal'
        $qProvider.errorOnUnhandledRejections(false);
    }

    appRun.$invoke = [ 'PermRoleStore', 'UserFactory', '$rootScope', '$http', 'formlyConfig', '$i18next', 'Idle' ];
    function appRun( PermRoleStore, UserFactory, $rootScope, $http, formlyConfig, $i18next, Idle ) {

        window.i18next
            .use( window.i18nextXHRBackend );
        window.i18next.init( {
            lng : 'es', // If not given, i18n will detect the browser language.
            fallbackLng : 'dev', // Default is dev
            backend : {
                loadPath : 'assets/locales/{{lng}}/{{ns}}.json'
            }
        }, function ( err, t ) {
            $rootScope.$apply();
        });

        $rootScope.$on( '$stateChangePermissionStart', function( event, args ) {
            var reqPerms = args.data.permissions;
            var anonymousUser = angular.isDefined( reqPerms.only ) && reqPerms.only[0] === 'anonymous';
            var locale = ( navigator.language || navigator.userLanguage ).split( '-' )[0];

            $rootScope.activeState = args.data.state;
            $rootScope.layoutTemplate = '/layouts/' + args.data.template + '.html';

            // if not anonymous (some user corretly logged), we put token on http header for all requests. And set locale from user credentials
            locale = UserFactory.getUser().locale;
            if ( !anonymousUser ) {
                $http.defaults.headers.common['x-auth-token'] = UserFactory.getUserToken();
            }

            $i18next.changeLanguage( locale );
            $rootScope.toggleSidebarStatus = false;
        });

        $rootScope.toggleSidebarStatus     = false;
        $rootScope.toggleMobileSidebar     = function() {
            $rootScope.toggleSidebarStatus = !$rootScope.toggleSidebarStatus;
        };

        loadPermissions( PermRoleStore, UserFactory );
        tmpData( $rootScope );
        setFormlyConfig( formlyConfig );

        // IDLE USER ACTIVITY DETECT STARTING ************************
        Idle.watch();

    }
}());
