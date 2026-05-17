'use strict';

angular.module('customstats').controller('customstats.home_state_controller', ['$scope', '$app', '$phpdate', '$location', '$rootScope', function($scope, $app, $phpdate, $location, $rootScope){

	// define used variables
	var start_timer, reload_timer;

	// run initial status update and reload interval
	$app.board_load_status(60000);

	// set status object
	$scope.status = null;

	// (mobile only)
	$scope.open_nav_menu = false;

	// set servertime
	// $scope.servertime = $phpdate($app.time()).format('d. F, H:i');

	// define global reload function
	$scope.reload_ui = function(){

		// use app service reload
		$app.board_reload();
		};

	$scope.logout = function(){

		// update app state
		$app.update_app_state('logging_out');

		// call logout route
		window.location.href = '/logout';
		};


	// add listener for status updates and define to execute if status is already available
	$app.board_add_listener('home.status', function(board_status){

		// set status object
		$scope.status = board_status;

		// refresh servertime
		// $scope.servertime = $phpdate($xa.time() + board_status.time_diff).format('d. F, H:i');
		}, true);


	// // set timeout function for second 0 of next minute
	// start_timer = $xa.timeout(function(){

	// 	// set interval every 60 seconds
	// 	reload_timer = $xa.interval(function(){

	// 		// if status does not exist, skip
	// 		if(!$scope.status) return;

	// 		// update server time
	// 		$scope.servertime = $phpdate($xa.time() + $scope.status.time_diff).format('d. F, H:i');

	// 		// TODO: is digest needed anymore?!
	// 		}, 60000, $scope, '$digest');

	// 	}, (60 - (new Date).getSeconds()) * 1000, $scope);


	// if $scope will be destroyed
	$scope.$on('$destroy', function(){

		// remove listener for status updates
		$app.board_remove_listener('home.status');
		});

	}]);