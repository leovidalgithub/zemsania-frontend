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
            'ngAnimate',
            'ngStorage',
            'angular-loading-bar',
            'ngSanitize',
            'jm.i18next',
            'ui.bootstrap',
            'ui.calendar',
            'angular-table',
            'tmh.dynamicLocale',
            'monospaced.elastic',
            'formly',
            'formlyBootstrap',
            'ngFileSaver',

            'hours.auth',
            // 'hours.projectWorkflow',
            // 'hours.errors',
            'hours.dashboard',
            'hours.components',
            // 'hours.employeeManager',
            // 'hours.calendar',
            // 'hours.reports',
            // 'hours.projects',
            // 'hours.excelExport'
        ])
        .config(appConfig)
        .run(appRun);

    appConfig.$invoke = ['$locationProvider', '$i18nextProvider', 'cfpLoadingBarProvider', '$urlRouterProvider', 'tmhDynamicLocaleProvider'];

    function appConfig($locationProvider, $i18nextProvider, cfpLoadingBarProvider, $urlRouterProvider, tmhDynamicLocaleProvider) {
        $urlRouterProvider.otherwise(function($injector) {
            var $state = $injector.get("$state");
            $state.transitionTo('login');
        });

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });

        $i18nextProvider.options = {
            lng: 'es',
            useCookie: false,
            useLocalStorage: false,
            fallbackLng: 'es',
            resGetPath: '/assets/locale/__lng__.json',
            defaultLoadingValue: 'loading'
        };

        cfpLoadingBarProvider.includeSpinner = false;

        tmhDynamicLocaleProvider.localeLocationPattern('/angular/i18n/angular-locale_{{locale}}.js');
    }

    appRun.$invoke = [ 'PermRoleStore', 'UserFactory', '$rootScope', '$http', 'tmhDynamicLocale', 'formlyConfig', '$uibModal', '$localStorage' ];

    function appRun(PermRoleStore, UserFactory, $rootScope, $http, tmhDynamicLocale, formlyConfig, $uibModal, $localStorage) {
        $rootScope.$on('$stateChangePermissionStart', function(event, args) {
            

            var reqPerms = args.data.permissions;


            var anonymousUser = angular.isDefined(reqPerms.only) && reqPerms.only[0] === 'anonymous';
            var locale = (navigator.language || navigator.userLanguage).split('-')[0];

            $rootScope.activeState = args.data.state;
            $rootScope.layoutTemplate = '/layouts/' + args.data.template + '.html';

console.log(args);

            // If not anonymous user put Auth header
            if (!anonymousUser) {
                $http.defaults.headers.common['x-auth-token'] = UserFactory.getUserToken();
                locale = UserFactory.getUser().locale;
            }

            tmhDynamicLocale.set(locale);

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
