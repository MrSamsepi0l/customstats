'use_strict';

/* Source URL Controller */
angular.module('customstats').controller('customstats.league_source_controller', ['$scope', '$leagueapi', '$app', function($scope, $leagueapi, $app){

	$scope.view = {
		list 			: [],
		filter 			: {
			date_list	: ['2019', '2020', '2021', '2022', '2023', '2024'],
			gameDate	: '',
			string		: '',
			},

		get_source_url : function(){
			var self = this, param;

			// set status
			self.status = 100;

			// default param
			param = {
				'gameYear' : self.filter.gameDate ? self.filter.gameDate : null,
				};

			// load
			$leagueapi.send_request('customstats_load_source_url', param, {
				200 : function(data){

					// get data
					self.list = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		create_source_url : function(image_url, gameDate){
			var self = this;

			// set status
			self.status = 100;

			// define param
			var param = {
				'image_url'		: image_url,
				'gameDate'		: gameDate,
				'api_key'		: $app.board_get_value('api_key'),
				};

			// check if request is basically okay
			if(!param.image_url || !param.gameDate || !param.api_key) return;

			// create
			$leagueapi.send_request('customstats_create_source_url', param, {
				201 : function(data){

					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},
		};

	// define view
	$scope.ui_review = function(board_status){

		// initialize
		$scope.view.get_source_url();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});


	}]);