;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeHoursController', imputeHoursController );

    imputeHoursController.$invoke = [ '$scope', 'UserFactory' ];
    function imputeHoursController( $scope, UserFactory ) {

        $scope.imputeTypes = [ 'Horas', 'Guardias', 'Variables' ];
        $scope.imputeTypes[ 'Horas'     ]     = [ 'Hora' ];
        $scope.imputeTypes[ 'Guardias'  ]  = [ 'Turnicidad', 'Guardia', 'Varios' ];
        $scope.imputeTypes[ 'Variables' ] = [ 'Hora extra', 'Hora extra festivo', 'Horas nocturnas', 'Formación', 'Intervenciones', 'Varios' ];
        $scope.typesModel = $scope.imputeTypes[0];
        $scope.subtypes = $scope.imputeTypes[$scope.typesModel][0];
    	$scope.currentType = 'text';
    	$scope.imputeType = 'Horas';
    	$scope.days = [];

    	var possibleValues = [ 6, 6.5, 7, 7.5, 8 ];
    	for( var i = 1; i < 32; i++ ) {
    		var random = Math.floor( ( Math.random() * 5 ) + 0 );
    		$scope.days.push( { day : i, value : possibleValues[ random ] } );
    	};

    	$scope.imputeTypeChanged = function() {
	        $scope.subtypes = $scope.imputeTypes[$scope.typesModel][0];
	    	switch( $scope.typesModel ) {
			    case 'Horas':
	    			$scope.currentType = 'text';
			        break;
			    case 'Guardias':
	    			$scope.currentType = 'checkbox';
			        break;
			    case 'Variables':
	    			$scope.currentType = 'text';
			        break;
			}
		};

    	$scope.imputeSubTypeChanged = function() {
		};

}

})();
