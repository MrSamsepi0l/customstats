'use strict';

/* Erstelle AngularJS Modul inkl. Abhängigkeiten */
angular.module('customstats', ['ngRoute'])

// and config this module
.config(['$locationProvider', function($locationProvider){

	// define empty hashPrefix
	$locationProvider.hashPrefix('');
	}])

// and run this module
.run(['$rootScope', '$route', '$routeParams', '$location', '$app', function($rootScope, $route, $routeParams, $location, $app){

	// make angular route accessable
	$rootScope.$route = $route
	$rootScope.$routeParams = $routeParams;
	$rootScope.$location = $location;

	// make date accessable
	$rootScope.Date = Date;

	// even listener for URL change
	$rootScope.$on('$locationChangeStart', function(event, next, current){

		// extract sub path
		var actual_route = $location.path();

		// init navbar (with current sub path)
		$app.init_navbar(actual_route);
		});

	// Possible template loading animation
	// $rootScope.$on('$routeChangeStart', function () {
	// 	$rootScope.loading_template = true;
	// 	});

	// $rootScope.$on('$routeChangeSuccess', function () {
	// 	$rootScope.loading_template = false;
	// 	});

	// $rootScope.$on('$routeChangeError', function () {
	// 	$rootScope.loading_template = false;
	// 	});

	}]);
