( function () {
    'use strict';
    angular
        .module( 'hours.calendar', [] )
        .config( calendarsConfig );

    calendarsConfig.$invoke = [ '$stateProvider' ];
    function calendarsConfig( $stateProvider ) {
        $stateProvider
            .state( 'calendars', {
                url: '/calendars',
                templateUrl: '/features/calendar/calendars/calendars.list.tpl.html',
                controller: 'CalendarsController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: [ 'anonymous' ],
                        redirectTo: 'login'
                    }
                },
                resolve : {
                    // dailyConcepts : function(CalendarFactory){
                    //     return CalendarFactory.getDailyConcepts();
                    // }
                }
            });
    }
}());
