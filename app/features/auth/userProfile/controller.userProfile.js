;( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'UserProfileController', UserProfileController );

    UserProfileController.$invoke = [ '$scope', '$rootScope', 'UserFactory', '$filter', '$timeout' ];
    function UserProfileController( $scope, $rootScope, UserFactory, $filter, $timeout ) {

        var originalUsername;
        $scope.showPwdContent = false;
        $scope.changePassword = {};
        $scope.status = {
                    opened: false
        };
        $scope.dateOptions = {
                        formatYear  : 'yy',
                        orientation : "bottom left",
                        startingDay : 1,
                        showWeeks   : false
        };

        $timeout( function () {
            $scope.user      = angular.copy( UserFactory.getUser() );
            originalUsername = angular.copy( $scope.user.username );

            $scope.user.birthdate = new Date( $scope.user.birthdate );
            $( '#surnameInput' ).bind( 'focus blur', usernameValidation ); // bind blur&focus username input field to verify email
            $scope.options = {
                genre :  [{
                                label: i18next.t( 'userProfile.user.genre_male' ),
                                slug: 'male'
                            },
                            {
                                label: $filter( 'i18next')( 'userProfile.user.genre_female'),
                                slug: 'female'
                         }],
                locale : [{
                                label: $filter( 'i18next')( 'locale.es' ),
                                slug: 'es'
                            },
                            {
                                label: $filter( 'i18next')( 'locale.en' ),
                                slug: 'en'
                            },
                            {
                                label: $filter( 'i18next')( 'locale.ca' ),
                                slug: 'ca'
                         }]
            };
        }, 800 );

        $scope.open = function () {
            $scope.status.opened = true;
        };

        // CHANGE PASSWORD BUTTON - SWAP VIEW
        $scope.changePassClick = function() {
            $scope.showPwdContent = !$scope.showPwdContent;
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
        };

        $scope.save = function () {
            if ( $scope.flag ) return;
            UserFactory.saveProfile( $scope.user )
                .then( function ( data ) {
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'ok', msg : $filter( 'i18next' )( 'auth.profile.saveSuccess' ) } );
                })
                .catch( function( err ) {
                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'auth.profile.saveError' ) } );
                })
                .finally( function() {
                    $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
                });
        };

        // VERIFIES IF GIVEN EMAIL NOT EXIST ON DB
        function usernameValidation( event ) {
            if ( $scope.user.username ) {
                var emailToVerify = $scope.user.username.trim();
                if ( emailToVerify != originalUsername ) { // originalEmail stores the user email when entry to profile page. If the given email is not the same it continues to API
                    UserFactory.verifyUniqueUserEmail( emailToVerify )
                        .then( function ( data ) {
                            $scope.flag = data.data.found;
                        });
                } else {
                    $scope.$apply( function() {
                        $scope.flag = false;
                    });
                }
            }
        };

        // PASSWORD CHANGE
        $scope.processPWDChange = function() {
            if ( $scope.changePassword.new != $scope.changePassword.confirm ) {
                $rootScope.$broadcast( 'showThisAlertPlease', { type : 'warning', msg : $filter( 'i18next' )( 'auth.changePassword.newConfirmNotMatching' ) } );
            } else {
                UserFactory
                    .doChangePassword( $scope.changePassword )
                    .then( function( data ) {
                        if ( data.data.success ) {
                            $rootScope.$broadcast( 'showThisAlertPlease', { type : 'ok', msg : $filter( 'i18next' )( 'auth.changePassword.success' ) } );
                            $timeout( function() {
                                $scope.showPwdContent = false;
                            }, 3500 );
                        } else {
                            switch( data.data.code ) {
                                case 101:
                                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'auth.changePassword.userNotFound' ) } );
                                    break;
                                case 102:
                                    $rootScope.$broadcast( 'showThisAlertPlease', { type : 'warning', msg : $filter( 'i18next' )( 'auth.changePassword.currentPassIncorrect' ) } );
                            };
                        }
                    })
                    .catch( function( err ) {
                        $rootScope.$broadcast( 'showThisAlertPlease', { type : 'error', msg : $filter( 'i18next' )( 'auth.changePassword.error' ) } );
                    });
            };
        };

    }
}());
