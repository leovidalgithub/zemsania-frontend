( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'alertMessage', alertMessage )
        .controller( 'alertMessageController', alertMessageController );

    alertMessageController.$invoke = [ '$scope', '$timeout' ];
    function alertMessageController( $scope, $timeout ) {

        var thisIsBusy = false;
        var thisArray  = [];

        $scope.$on( 'showThisAlertPlease',function( event, data ) {
            var alreadyExists = thisArray.some( function( el ) {
                return el.type == data.type;
            });
            if( !alreadyExists ) thisArray.push( { type : data.type, msg : data.msg } );
            if( thisIsBusy == false ) doIt();
        });

        function doIt() {
            if( thisArray.length ) { // there is some alert to show
                thisIsBusy    = true;
                var nextAlert = thisArray.shift();
                showingThis( nextAlert.type, nextAlert.msg );
            } else { // no more alerts inside array to show
                thisIsBusy    = false;
            }
        }

        function showingThis( _type, _msg ) {
            $scope.type         = _type;
            $scope.alertMessage = _msg;
            moveThis( 40, .95 );
            $timeout( function() {
                moveThis( -390, 0 );
            }, $scope.type == 'ok' ? 2500 : 6500 );
        }

        function moveThis( RP, OP, callback ) {
            $( '#alertMessage' ).animate({
                opacity : OP,
                right   : RP + 'px'
            }, 850, function() {
                if( RP < 0) { // when exit
                    $timeout( function() {
                        doIt();
                    });
                }
            })
        }
    }

    function alertMessage() {
        return {
            restrict : 'E',
            scope : true,
            transclude  : false,
            templateUrl : 'features/components/alertMsg/alertmsg.tpl.html',
            controller  : alertMessageController,
            link : function( scope, elem, attrs ) {
            }
        }
    }
}());

// $window.innerWidth >= 600
