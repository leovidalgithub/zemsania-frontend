( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .factory( 'imputeHoursFactory', imputeHoursFactory );

    imputeHoursFactory.$invoke = [ '$http', '$q', 'UserFactory' ];
    function imputeHoursFactory( $http, $q, UserFactory ) {
        return {

            getProjectsByUserId: function () { // LEO WORKING HERE
                var userID = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.get( buildURL( 'getProjectsByUserId' ) + userID )
                    .then( function ( response ) {
                        dfd.resolve( response.data.projects );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },


            getTimesheets: function ( year, month ) { // LEO WORKING HERE
                var userID     = UserFactory.getUserID();
                var calendarID = UserFactory.getcalendarID();
                    
                var dfd = $q.defer();
                $http.get( buildURL( 'getTimesheets' ) + userID + '?calendarID=' + calendarID + '&year=' + year + '&month=' + month )
                    .then( function ( response ) {
                        dfd.resolve( response );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getShowDaysObj : function ( month, year, currentWeekAtFirst ) { // LEO WORKING HERE

                var months         = [ 'january' ,'february' ,'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
                var firstDay       = new Date( year, month, 1 ),
                    lastDay        = new Date( year, month + 1, 0 ),
                    totalMonthDays = lastDay.getDate(),
                    currentDay     = angular.copy( firstDay ),
                    currentMonth   = firstDay.getMonth(),
                    monthName      = months[ currentMonth ],
                    currentYear    = firstDay.getFullYear(),
                    week           = 0; // number of the week inside month

                var showDaysObj            = {};
                showDaysObj.currentWeek    = 0;
                showDaysObj.firstDay       = firstDay;
                showDaysObj.lastDay        = lastDay;
                showDaysObj.totalMonthDays = totalMonthDays;
                showDaysObj.currentMonth   = currentMonth;
                showDaysObj.currentYear    = currentYear;
                showDaysObj.monthName      = monthName;
                showDaysObj.days           = {};

                while( true ) {
                    if( currentDay.getDate() == 1 && currentDay.getDay() != 1 ) { // just in case of last-month-final-days (to complete the week view)
                        var lastMonthFinalsDays = angular.copy( currentDay );
                        var tempArray = [];
                        while( true ) {
                            lastMonthFinalsDays.setDate( lastMonthFinalsDays.getDate() - 1 );
                            var day = new Date( lastMonthFinalsDays.getFullYear(), lastMonthFinalsDays.getMonth(), lastMonthFinalsDays.getDate() );
                            tempArray.push( day );
                            if( lastMonthFinalsDays.getDay() == 1 ) {
                                tempArray = tempArray.reverse();
                                tempArray.forEach( function( day ) {
                                    addNewDay( day, week );
                                })
                                break;
                            }
                        }
                    }
                    
                    var day = new Date( new Date( year, month, currentDay.getDate() ) );
                    addNewDay( day, week );

                    if( currentDay.getDate() == totalMonthDays ) { // when gets at last day
                        if( currentDay.getDay() != 0 ) { // just in case of next-month-inital-days (to complete the days view)
                            while( true ) {
                                currentDay.setDate( currentDay.getDate() + 1 );

                                var day = new Date( new Date( currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() ) );
                                addNewDay( day, week );

                                if( currentDay.getDay() == 0 ) {
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    
                    currentDay = new Date( year, month, currentDay.getDate() + 1 );
                    if( currentDay.getDay() == 1 ) { // when week ends and start a new one
                        week++;
                    }
                }

                showDaysObj.totalMonthWeeks = week;
                // showDaysObj.currentWeek = 0;

                function addNewDay( day, week ) {
                    showDaysObj.days[ day ] = {
                                                day         : day,
                                                value       : 0,
                                                week        : week,
                                                thisMonth   : day.getMonth(),
                                                currentType : 'text' // or checkbox for 'Guardias'
                                            };
                }
                return showDaysObj;
            }
        };
    }
}());


            // getEmployeeList: function () { // LEO WAS HERE
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'getAllUsers' ) )
            //         .then( function ( response ) {
            //             if ( response.data.suweekess ) {
            //                     dfd.resolve( response.data.users );
            //             } else {
            //                 dfd.reject( response );
            //             }
            //         }, function ( err ) {
            //             dfd.reject( err );
            //         });
            //     return dfd.promise;
            // }



    // function getMonthWeeks( month, year ) {
    //     var weeks = [],
    //         firstDate = new Date( year, month, 1 ),
    //         lastDay  = new Date( year, month + 1, 0 ),
    //         totalMonthDays   = lastDay.getDate(),
    //         start     = 1,
    //         end       = 8 - firstDate.getDay();
    //    while( start <= totalMonthDays ){
    //        weeks.push( { start : start, end : end } );
    //        start = end + 1;
    //        end = end + 7;
    //        if( end > totalMonthDays ) end = totalMonthDays;
    //    }
    //     return weeks;
    // }


            // getMonthWeeksObj : function ( month, year ) { // LEO WAS HERE
            //     var months     = [ 'january' ,'february' ,'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
            //     var dataDate     =  {},
            //         firstDay     = new Date( year, month, 1 ),
            //         lastDay      = new Date( year, month + 1, 0 ),
            //         totalMonthDays      = lastDay.getDate(),
            //         currentDay   = angular.copy( firstDay ),
            //         currentMonth = firstDay.getMonth(),
            //         monthName  = months[ currentMonth ],
            //         currentYear  = firstDay.getFullYear(),
            //         week         = [];
            //         dataDate     = {
            //                 firstDay : firstDay,
            //                 currentMonth : currentMonth,
            //                 currentYear : currentYear,
            //                 monthName : monthName,
            //                 weeks : []
            //         };

            //         while( true ) {
            //             if( currentDay.getDate() == 1 && currentDay.getDay() != 1 ) { // just in case of last-month-final-days (to complete the week view)
            //                 var lastMonthFinalsDays = angular.copy( currentDay );
            //                 var tempArray = [];
            //                 while( true ) {
            //                     lastMonthFinalsDays.setDate( lastMonthFinalsDays.getDate() - 1 );
            //                     tempArray.push( new Date( lastMonthFinalsDays.getFullYear(), lastMonthFinalsDays.getMonth(), lastMonthFinalsDays.getDate() ) );
            //                     if( lastMonthFinalsDays.getDay() == 1 ) {
            //                         week = tempArray.reverse().slice();
            //                         break;
            //                     }
            //                 }
            //             }
            //             week.push( new Date( year, month, currentDay.getDate() ) );
            //             if( currentDay.getDate() == totalMonthDays ) { // when gets at last day
            //                 if( currentDay.getDay() != 0 ) { // just in case of next-month-inital-days (to complete the week view)
            //                     while( true ) {
            //                         currentDay.setDate( currentDay.getDate() + 1 );
            //                         week.push( new Date( currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() ) );
            //                         if( currentDay.getDay() == 0 ) {
            //                             break;
            //                         }
            //                     }
            //                 }
            //                 if ( week.length ) {
            //                     dataDate.weeks.push( week );
            //                 }
            //                 break;
            //             }
            //             currentDay = new Date( year, month, currentDay.getDate() + 1 );
            //             if( currentDay.getDay() == 1 ) {
            //                 dataDate.weeks.push( week );
            //                 week = [];
            //             }
            //         }
            //         return dataDate;
            // }
