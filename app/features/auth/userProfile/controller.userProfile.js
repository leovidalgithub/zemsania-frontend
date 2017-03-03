(function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'UserProfileController', UserProfileController );

    UserProfileController.$invoke = [ '$scope', 'UserFactory', '$filter', '$timeout', '$rootScope' ];
    function UserProfileController( $scope, UserFactory, $filter, $timeout, $rootScope ) {

        var originalUsername;
        $scope.showPwdContent = false;

        $timeout( function () {
            $scope.user = angular.copy( UserFactory.getUser() );
            originalUsername = angular.copy( $scope.user.username );
            // On birthdate input, uib-datepicker-popup="dd/MM/yyyy" makes userProfileForm.birthdate = $invalid (I do not why)
            // so, assigning date in this way take the problem away
            $scope.user.birthdate = new Date($scope.user.birthdate);
            $( '#surnameInput' ).bind( 'focus blur', usernameValidation ); // bind blur&focus username input field to verify email
            $scope.options = {
                genre :  [{
                                label: i18next.t('userProfile.user.genre_male'),
                                slug: 'male'
                            },
                            {
                                label: $filter('i18next')('userProfile.user.genre_female'),
                                slug: 'female'
                         }],
                locale : [{
                                label: $filter('i18next')('locale.es'),
                                slug: 'es'
                            },
                            {
                                label: $filter('i18next')('locale.en'),
                                slug: 'en'
                            },
                            {
                                label: $filter('i18next')('locale.ca'),
                                slug: 'ca'
                         }]
            };
        }, 800 );

        // function loadFields() {
        //     $scope.formFields = {
        //         username: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         name: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         surname: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         birthdate: {
        //             element: 'date',
        //             type: 'date'
        //         },
        //         nif: {
        //             element: 'input',
        //             type: 'text'
        //         },
        //         sex: {
        //             element: 'select',
        //             options: [
        //                 {
        //                     // label: $filter('i18next')('user.genre_male'),
        //                     label: i18next.t('user.genre_male'),
        //                     slug: 'male'
        //                 },
        //                 {
        //                     label: $filter('i18next')('user.genre_female'),
        //                     slug: 'female'
        //                 }
        //             ]
        //         },
        //         locale: {
        //             element: 'select',
        //             options: [
        //                 {
        //                     label: $filter('i18next')('locale.es'),
        //                     slug: 'es'
        //                 },
        //                 {
        //                     label: $filter('i18next')('locale.en'),
        //                     slug: 'en'
        //                 },
        //                 {
        //                     label: $filter('i18next')('locale.ca'),
        //                     slug: 'ca'
        //                 }
        //             ]
        //         }
        //     };
        // }

       // $timeout( function () {
       //      loadFields();
       //  }, 500 );

        $scope.open = function () {
            $scope.status.opened = true;
        };

        $scope.status = {
            opened: false
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            orientation: "bottom left",
            startingDay: 1,
            showWeeks: false
        };

        //$scope.$watch('user', function(value){
        //    if(value.name === redName){
        //        $i18next.options.lng = 'prt';
        //        $i18next.options.resGetPath = '/assets/locale/prt.json';
        //    }
        //}, true);

        $scope.changePassClick = function() {
            $scope.showPwdContent = !$scope.showPwdContent;
            $( '#page-content-wrapper' ).animate( { scrollTop: 0 }, 'slow' );
        };

        $scope.save = function () {
            if ( $scope.flag ) return;
            $scope.profileStatus = 0;
            UserFactory.saveProfile( $scope.user )
                .then( function ( data ) {
                    console.log( data );
                    $scope.profileStatus = 1;
                })
                .catch( function( err ) {
                    console.log( err );
                    $scope.profileStatus = 2;                    
                })
                .finally( function() {
                    $( '#page-content-wrapper' ).animate( { scrollTop: 0 }, 'slow' );
                });
        };

        function usernameValidation( event ) {
            if ( $scope.user.username ) { // if valid email comes here...
                var emailToVerify = $scope.user.username.trim();
                if ( emailToVerify != originalUsername ) { // if originalEmail != introducedEmail continues to API to verify that email not exists
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

        $scope.processPWDChange = function() {

// console.log('$scope.newPassword');
// console.log($scope.newPassword);

            if (($scope.newPassword.confirmInvalid = $scope.newPassword.new != $scope.newPassword.confirm)) return;
            
            $scope.newPassword.currentInvalid = false;


            return;
            
            UserFactory
                .doChangePassword({ oldPassword: $scope.newPassword.current, password: $scope.newPassword.new }, true)
                .then(function() {
                    for (var p in $scope.newPassword)
                        if ($scope.newPassword.hasOwnProperty(p)) $scope.newPassword[p] = null;
                }, function(err) {
                    $scope.newPassword.currentInvalid = true;
                });
        };


// $scope.fn = function() {
    // $timeout(function() {
       // $rootScope.userProfileForm.birthdate.$setValidity('required', true);
       // $scope.userProfileForm.birthdate.$setValidity('required', false);
       // $scope.userProfileForm.birthdate.$setValidity("birthdate", false);
    // })
// };

    }
}());