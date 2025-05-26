'use strict';

angular.module('customstats').controller('customstats.login_controller', ['$scope', '$http', '$timeout', '$app', function($scope, $http, $timeout, $app){

	$scope.username = '';
	$scope.password = '';
	$scope.error_message = null;

	$scope.send_login_request = function(username, password){

		// basic param check
		if(!username || !password) return;

		// send request
		$http({'method':'POST', 'url': 'customstats/authenticate.json', 'data': {'username':username, 'password': password}}).then(
			function(response){

				// take status
				var status = response.data.status;

				// check capsuled status
				if(status != 200) $scope.error_message = 'Login fehlgeschlagen!';
				if(status == 409) $scope.error_message = 'User bereits eingeloggt!'

				// start timer, after 3 secods, hide error message
				$timeout(function(){$scope.error_message = null}, 3000);

				// logged in
				if(status == 200){

					// add panel state to local storage
					localStorage.setItem('panel_state', 'login');

					// reload
					location.reload();
					}
				},

			// http error
			function(response){

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
