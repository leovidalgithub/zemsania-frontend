;( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'editCalendarsController', editCalendarsController );

    editCalendarsController.$invoke = [ '$scope', 'CalendarFactory', '$stateParams', 'UserFactory', '$timeout', '$state' ];
    function editCalendarsController( $scope, CalendarFactory, $stateParams, UserFactory, $timeout, $state ) {

        var eventDates;
        var eventHours;
        var currentYear     = new Date().getFullYear();

        $scope.loadingError = false;
        $scope.yearShowed   = currentYear.toString();
        var locale      = UserFactory.getUser().locale;
        var types       = { working : 'L-J', special : '', intensive : 'L-V', friday : 'V' };

        (function Init() {
            getCalendar( currentYear );
        })();

        function getCalendar( year ) {
                CalendarFactory.getCalendarById( $stateParams.id, year )
                    .then( function( data ) {
                        $scope.loadingError = false;
                        $scope.calendar = data.calendar;
                        eventHours = data.eventHours[0];
                        eventDates = data.eventHours[0].eventDates;                      
                        $timeout( () => {
                            showCalendars();
                        }, 300 );
                    })
                    .catch( function( err ) {
                        $scope.loadingError = true;
                        $timeout( function () {
                            $state.go( 'calendars' );
                        }, 2500 );
                    });
        }

        function showCalendars() {
            $.datepicker.setDefaults( // Initializing calendar language
                $.extend( $.datepicker.regional[ locale ] )
            );
            displayMonthsHours();
            displayRangeHours();
            createCalendarsHTML();
            var monthArray = [];
            monthArray = getMonthArrayByYear( $scope.yearShowed );
            var calendarNumber = 1;
            for ( var i = 0; i < monthArray.length; i++ ) {
                var calendar = '#calendar-' + calendarNumber++;
                showCalendar( calendar , monthArray[ i ] );
                // $( calendar + ' p' ).text( 'Total horas: xyz' );
            };
            resetCellsTitles();
        }

        function displayMonthsHours() {
            $scope.monthsHours = [];
            for ( var month in eventHours.totalWorkingHours ) {
                if( month != 'year' ) {
                    $scope.monthsHours.push( { month : month, hours : eventHours.totalWorkingHours[ month ].hours, minutes : eventHours.totalWorkingHours[ month ].minutes } );
                } else {
                    $scope.monthsHours.push( { month : 'year', hours : eventHours.totalWorkingHours[ month ].hours, minutes : eventHours.totalWorkingHours[ month ].minutes } );
                }                
            }
        }

        function displayRangeHours() {
            for ( var type in types ) {
                if( eventHours.types[ type ] ) { // when no data comes (not year available)
                    var text = types[ type ] + ' ';                
                    eventHours.types[ type ].forEach( function( element ) {
                        text += element.initialHour + '-' + element.endHour + ' ';
                    });
                    $( '#' + type + 'Range' ).html( '<code>' + text + '</code>' );
                }
            }
        }

         function showCalendar( calendar, month ) {
            jQuery( calendar ).datepicker( {
                // showButtonPanel: true,                
                dateFormat: 'mm-dd-yy',
                firstDay: 1,
                changeMonth: false,
                changeYear: false,
                stepMonths: 0,
                defaultDate: new Date( month ), // ( 2014, 2, 1 )
                // onSelect: selectedDay,
                beforeShowDay: function( date ) {
                    
                    date = new Date( date ).getTime(); // from date to timestamp
                    var highlight = eventDates[ date ];
                    if ( highlight ) {
                        if ( highlight.type == 'working' ) {
                            return [ true, "showWorking", highlight ];
                        } else if ( highlight.type == 'holidays' ) {
                            return [ true, 'showHolidays', highlight ];
                        } else if ( highlight.type == 'friday' ) {
                            return [ true, 'showFriday', highlight ];
                        } else if ( highlight.type == 'intensive' ) {
                            return [ true, 'showIntensive', highlight ];
                        } else if ( highlight.type == 'special' ) {
                            return [ true, 'showSpecial', highlight ];
                        } else if ( highlight.type == 'non_working' ) {
                            return [ true, 'showNon_working', highlight ];
                        }
                    } else {
                        return [ true, 'showDefault', highlight ];
                    }
                 } // beforeShowDay
            });
        }

        $scope.yearChanged = function() {
            getCalendar( $scope.yearShowed );
        };

        function createCalendarsHTML() {
            $( '#months div' ).remove();
            for ( var i = 1; i < 13; i++ ) {
                $( '<div/>', {
                    id: 'calendar-' + i,
                    class: 'calendar'
                }).appendTo( '#months' );
            }
            // $( '<p/>', {} ).appendTo( '#months div' );
        }

        function getMonthArrayByYear( year ) {
            var monthArray = [];
            for ( var i = 1; i < 13; i++ ) {
                monthArray.push( i + '/01/' + year );
            }
            return monthArray;
        }

        function resetCellsTitles() {
            $timeout( function () {
                $( '.ui-datepicker td > *' ).each( function ( index, elem ) {
                    $( this ).attr( 'title', 'Zemsania' );
                });
            }, 100 );
        }

// ********************************************** **********************************************
// *****************************************selectedDay ****************************************
        // function selectedDay( date, inst ) {
        //     // inst.dpDiv.find('.ui-state-default').css('background-color', 'red');
        //     // eventDates[ new Date( date ) ] = { date : new Date( date ), type : $scope.dayTypes };
        //     var destinyType = 'working';
        //     var selectedDay = new Date( date );
        //     $scope.calendar.groupDays.forEach( function( groupDay ) {
        //         if ( groupDay.type == destinyType ) { // find day in the same type in order to push it (if does'not exist)
        //             var index = getDayIndex( groupDay.days.days );
        //             if ( index == -1 ) { // if not exists to add
        //                 groupDay.days.days.push( selectedDay );
        //             }
        //         } else { // find day in others types in order to remove it (if exists)
        //             var index = getDayIndex( groupDay.days.days );
        //             if ( index != -1 ) { // if exists to remove
        //                 groupDay.days.days.splice( index, 1 );
        //             }                    
        //         }
        //     });
        //     function getDayIndex( array ) {
        //         return array.findIndex( function( day ) {
        //             return new Date( day ).getTime() == selectedDay.getTime();
        //         });                    
        //     }
        //     // send calendar to backend to refresh object data
        //     $http.post( buildURL( 'getRefreshCalendarData' ), $scope.calendar )
        //         .then( function ( response ) {
        //             var data = response.data;
        //             $scope.calendar = data.calendar;
        //             eventHours = data.eventHours;
        //             eventDates = data.eventHours.eventDates;
        //             $timeout( function () {
        //                 showCalendars();
        //             }, 300 );
        //         });
        // }
// ********************************************** **********************************************
// ********************************************** **********************************************

}

})();
