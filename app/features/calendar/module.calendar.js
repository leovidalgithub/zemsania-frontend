( function () {
    'use strict';
    angular
        .module( 'hours.calendar', [] )
        .config( calendarsConfig );

    calendarsConfig.$invoke = [ '$stateProvider' ];
    function calendarsConfig( $stateProvider ) {
        $stateProvider
            .state( 'calendars', { // LEO WAS HERE
                url: '/calendars',
                templateUrl: '/features/calendar/calendars/list/calendars.list.tpl.html',
                controller: 'CalendarsController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: [ 'anonymous' ],
                        redirectTo: 'login'
                    }
                },
                resolve : {
                    calendars : [ 'CalendarFactory', function( CalendarFactory ) {
                        return CalendarFactory.getCalendarsNames();
                    }]
                }
            })

            .state( 'calendarsEdit', { // LEO WAS HERE
                url: '/calendars/edit/:id',
                templateUrl: '/features/calendar/calendars/edit/calendars.edit.tpl.html',
                controller: 'editCalendarsController',
                data: {
                    // state: 'employeeManager',
                    template: 'complex',
                    permissions: {
                        except: [ 'anonymous' ],
                        redirectTo: 'login'
                    }
                }
            })
    }
}());
