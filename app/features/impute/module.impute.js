;( function () {
    'use strict';
    angular
        .module( 'hours.impute', [] )
        .config( imputeConfig );

    imputeConfig.$invoke = [ '$stateProvider' ];
    function imputeConfig( $stateProvider ) {
        $stateProvider
            .state( 'imputeHours', {
                url: '/impute-hours',
                templateUrl: '/features/impute/impute/imputeHours.tpl.html',
                controller: 'imputeHoursController',
                data: {
                    template: 'complex',
                    permissions: {
                        except: ['anonymous'],
                        redirectTo: 'login'
                    }
                }
                // resolve : {
                //     dailyConcepts : function(CalendarFactory){
                //         return CalendarFactory.getDailyConcepts();
                //     }
                // }
            });
            // .state('calendarImputeHoursValidator', {
            //     url: '/impute-hours-validator',
            //     templateUrl: '/features/calendar/imputeHoursValidator/imputeHoursValidator.tpl.html',
            //     controller: 'ImputHoursValidatorController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             only: ['administrator', 'manager'],
            //             redirectTo: 'login'
            //         }
            //     }
            // })
            // .state('calendarImputeHoursValidator-user', {
            //     url: '/impute-hours-validator/:userId/:timestamp',
            //     templateUrl: '/features/calendar/imputeHoursValidator/imputeHoursValidator.tpl.html',
            //     controller: 'ImputHoursValidatorController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             only: ['administrator', 'manager'],
            //             redirectTo: 'login'
            //         }
            //     }
            // })
            // .state('holidayCalendar', {
            //     url: '/holiday-calendar',
            //     templateUrl: '/features/calendar/holidayCalendar/holidayCalendar.tpl.html',
            //     controller: 'HolidayCalendarController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             except: ['anonymous'],
            //             redirectTo: 'login'
            //         }
            //     },
            //     resolve: {
            //         holidays: function (CalendarFactory) {
            //             return CalendarFactory.getUserHolidayCalendar();
            //         }
            //     }
            // })
            // .state('moderateHolidayCalendar', {
            //     url: '/moderate-holiday-calendar',
            //     templateUrl: '/features/calendar/moderateHolidayCalendar/moderateHolidayCalendar.tpl.html',
            //     controller: 'ModerateHolidayCalendarController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             except: ['anonymous'],
            //             redirectTo: 'login'
            //         }
            //     },
            //     params: {
            //         userId: null,
            //         filterBy: null
            //     }
            // })
            // .state('calendarCreator', {
            //     url: '/calendar-creator',
            //     templateUrl: '/features/calendar/calendarCreator/calendarCreator.tpl.html',
            //     controller: 'CalendarCreatorController',
            //     data: {
            //         template: 'complex',
            //         permissions: {
            //             except: ['anonymous'],
            //             redirectTo: 'login'
            //         }
            //     }
            // });
    }
}());
