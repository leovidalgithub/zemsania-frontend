( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'editCalendarsController', editCalendarsController );

    editCalendarsController.$invoke = [ '$scope', '$filter', '$window', 'CalendarFactory', '$stateParams' ];
    function editCalendarsController( $scope, $filter, $window, CalendarFactory, $stateParams ) {

        var currentYear = new Date().getFullYear();
        $scope.yearShowed = currentYear.toString();
        var eventDates = {};
        // var eventHours = {};
        // eventHours[ 'holidays'    ] = [];
        // eventHours[ 'working'     ] = [];
        // eventHours[ 'friday'      ] = [];
        // eventHours[ 'non_working' ] = [];
        // eventHours[ 'intensive'   ] = [];
        // eventHours[ 'special'     ] = [];

        $scope.yearChanged = function() {
            showCalendars();     
        };

        function createCalendarsHTML() {
            $( '#months div' ).remove();
            for ( var i = 1; i < 13; i++ ) {
                $('<div/>', {
                    id: 'calendar-' + i,
                    class: 'calendar'
                }).appendTo( '#months' ); 
            }
            $('<p/>', {}).appendTo( '#months div' ); 
        };

        CalendarFactory.getCalendarById( $stateParams.id )
            .then( function( data ) {
                var calendar = data;
                // console.log(calendar);
                $scope.calendar = calendar;
                calendar.groupDays.forEach( function( element ) {
                    element.days.days.forEach( function( day ) {
                        eventDates[ new Date( day ) ] = { date : new Date( day ), type : element.type };
                    });
                    // element.days.hours.forEach( function( hours ) {
                    //     eventHours[ element.type ].push( { initialHour : hours.initialHour, endHour : hours.endHour } );
                    // });
                });
                showCalendars();
                // showHours();
            })
            .catch( function( err ) {

            });

        function showCalendars() {
            createCalendarsHTML();
            var monthArray = [];
            monthArray = getMonthArrayByYear( $scope.yearShowed );
            var calendarNumber = 1;
            for ( var i = 0; i < monthArray.length; i++ ) {
                var calendar = '#calendar-' + calendarNumber++;
                showCalendar( calendar , monthArray[ i ] );
                // $( calendar + ' p' ).text( 'Total horas: xyz' );
            };
        }

        function getMonthArrayByYear( year ) {
            var monthArray = [];
            for ( var i = 1; i < 13; i++ ) {
                monthArray.push( i + '/01/' + year );
            }
            return monthArray;
        }

         function showCalendar( calendar, month ) {
            jQuery( calendar ).datepicker( {
                // showButtonPanel: true,
                dateFormat: 'mm-dd-yy',
                defaultDate: new Date( month ), // ( 2014, 2, 1 )
                // onSelect: daySelected,
                beforeShowDay: function( date ) {
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

}

}());
