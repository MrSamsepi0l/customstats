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

	$rootScope.show_login = true;
	$rootScope.show_register = true;

	$rootScope.$on('$locationChangeStart', function(event, next, current){

		// extract sub path
		var actual_route = $location.path();

		// init navbar (with current sub path)
		$app.init_navbar(actual_route);
		});

	}]);

// .run(['$route', '$templateCache', '$http', (function ($route, $templateCache, $http){
//         var url;
//         for (var i in $route.routes) {
//             if ($route.routes[i].preload) {
//                 if (url = $route.routes[i].templateUrl) {
//                     $http.get(url, { cache: $templateCache });
//                 }
//             }
//         }
//     })
// ]);