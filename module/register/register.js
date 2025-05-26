'use strict';

angular.module('customstats').controller('customstats.register_controller', ['$scope', '$http', '$timeout', '$location', function($scope, $http, $timeout, $location){

	$scope.account = {
		username 		: '',
		email			: '',
		password		: '',
		password_check 	: '',
		real_name 		: '',
		};
	$scope.error_message = null;

	$scope.send_register_request = function(account){

		// define param
		var param = {
			'username'		: account.username,
			'email'			: account.email,
			'auth'			: account.auth,
			'auth_check'	: account.auth_check,
			'real_name'		: account.real_name,
			};

		// basic param check
		if(!param.username || !param.email || !param.auth || !param.auth_check || !param.real_name){

			// set error
			$scope.error_message = 'Überprüfe Eingabefelder!';
			return $scope.hide_error_after(7);
			}

		// check length
		if(param.auth.length < 6){

			// set error
			$scope.error_message = 'Passwort braucht mind. 6 Zeichen!';
			return $scope.hide_error_after(7);
			}

		// check matching auth
		if(param.auth != param.auth_check){

			// set error
			$scope.error_message = 'Passwörter überprüfen!';
			return $scope.hide_error_after(7);
			}

		// delete check
		delete(param.auth_check);

		// init status
		$scope.status = 100;

		// send request
		$http({'method':'POST', 'url': 'customstats/registration.json', 'data': param}).then(
			function(response){

				// take status
				var status = response.data.status;
				$scope.status = status;

				// email/username conflict
				if(status == 409) $scope.error_message = 'Username/Email bereits vergeben!';
				if(status == 400) $scope.error_message = 'Eingabefelder überprüfen!';

				// on error
				if(status != 201) return $scope.hide_error_after(8);

				// show success and redirection
				$scope.error_message = 'Registrierung erfolgreich! Weiterleitung erfolgt...';

				// redirect to login after 5 seconds
				$timeout(function(){$location.url('/login')}, 5000);
				},
			function(response){

				// take status
				$scope.status = response.status;

				// show server error
				$scope.error_message = 'Server Error - Versuche es später noch einmal';

				// start timer, after 2 secods, hide error message
				return $scope.hide_error_after(5);
				}
			);

		}

	// helper
	$scope.hide_error_after = function(seconds){
		return $timeout(function(){
			$scope.error_message = null;
			}, seconds * 1000);
		}

	}]);