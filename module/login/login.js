'use strict';

angular.module('customstats').controller('customstats.login_controller', ['$scope', '$http', '$timeout', '$app', function($scope, $http, $timeout, $app){

	// DEPRECATED
	$scope.username = '';
	$scope.password = '';

	$scope.identifier = '';
	$scope.auth	= '';
	$scope.error_message = null;

	$scope.send_login_request = function(identifier, auth){

		// basic param check
		if(!identifier || !auth) return;

		// update app state
		$app.update_app_state('logging_in');

		// send request
		$http({'method':'POST', 'url': 'customstats/authenticate.json', 'data': {'identifier':identifier, 'auth': auth}}).then(
			function(response){

				// take status
				var status = response.data.status;

				// check capsuled status
				if(status != 200) $scope.error_message = 'Login fehlgeschlagen!';
				if(status == 409) $scope.error_message = 'User bereits eingeloggt!'

				// start timer, after 3 secods, hide error message
				$timeout(function(){$scope.error_message = null}, 3000);

				// on any error
				if(status != 200){

					// reset app state
					$app.update_app_state(null);

					// stop processing
					return;
					}

				// reload board after 250 ms (no cache refresh)
				$app.board_reload(250, false);
				},

			// http error
			function(response){

				// reset app state
				$app.update_app_state(null);

				// show server error
				$scope.error_message = 'Server Error - Versuche es später noch einmal';

				// start timer
				$timeout(function(){

					// after 2 secods, hide error message
					$scope.error_message = null;
					}, 2000);
				}
			);

		}

	}]);
