( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'CalendarsController', CalendarsController );

    CalendarsController.$invoke = [ '$scope', '$filter', '$window', 'CalendarFactory', 'calendars', '$timeout' ];
    function CalendarsController( $scope, $filter, $window, CalendarFactory, calendars, $timeout ) {

        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage( 65 ),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'calendarsListPage' ) || 0
        };

        $scope.calendars = calendars;
        setUsersView();

        // ADVANDED SEARCH TOGGLE BUTTON
        $scope.toggleAdvancedSearch = function () {
            takeMeUp();
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
            if ( !$scope.showAdvancedSearch ) {
                $scope.calendars = calendars;
            } else {
                $scope.avancedSearch();
                $timeout( function() { // search input set_focus
                    document.getElementById( 'searchInput' ).focus();
                });
            }
        };

        // ADVANDED SEARCH SERVICE FUNCTION
        $scope.avancedSearch = function () {
            CalendarFactory.advancedCalendarSearch( $scope.search )
                .then( function ( foundCalendars ) {
                    $scope.calendars = foundCalendars;
                });
        };

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'calendarsListPage', $scope.tableConfig.currentPage );
        });

        angular.element( $window ).bind( 'resize', function() {
            $scope.$digest();
            setUsersView();
        });

        function setUsersView() {
            if( $window.innerWidth < 930 ) {
                $scope.viewSet = false;
            } else {
                $scope.viewSet = true;            
            }
        }

        // SECTION SCROLL MOVE EVENT TO MAKE BUTTON 'toUpButton' APPEAR
        var scrollWrapper = document.getElementById( 'section' );
        scrollWrapper.onscroll = function ( event ) {
            var currentScroll = scrollWrapper.scrollTop;
            var upButton = $( '#toUpButton' );
            showUpButton( upButton, currentScroll );
        };

        // BUTTON TO TAKE SECTION SCROLL TO TOP
        $scope.pageGetUp = function() { takeMeUp() };

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'notificationsListPage', $scope.tableConfig.currentPage );
        });

}

}());
