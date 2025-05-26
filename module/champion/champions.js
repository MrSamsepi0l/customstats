'use strict';

angular.module('customstats').controller('customstats.league:champion_controller', ['$scope', '$leagueapi', '$routeParams', function($scope, $leagueapi, $routeParams){

	$scope.view = {
		data			: [],
		data_copy		: [],
		status			: null,
		order			: '-times_played',
		filter 			: {
			string 		: '',
			},
		filter_option	: [
	    	{key : 'Alphabetisch', value : 'name'},
	    	{key : 'Anzahl Spiele', value : '-times_played'},
	    	{key : 'Anzahl Gebannt', value : '-times_banned'},
	    	{key : 'Präsenz', value : '-present_rate'},
	    	{key : 'Siege', value : '-times_won'},
	    	{key : 'Niederlagen', value : '-times_lost'},
	    	{key : 'Winrate', value : '-winrate'},
	    	{key : 'Banrate', value : '-banrate'},
	    	],

		get_champion_list : function(){
			var self = this, param;

			// set param
			param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_get_champion_analysis', param, {
				200 : function(data){

					// for each champ
					_.each(data, function(e){

						// default expanded
						e.expanded = false;

						// define canonical string for css class
						e.champion_name_fixed = e.name.split(' ').join('');
						});

					// take data
					self.data = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		filter_champion_games : function(quantity){
			var self = this;

			// copy complete champ list if not set
			if(!_.size(self.data_copy)) self.data_copy = angular.copy(self.data);

			// filter champ list
			self.data = _.filter(angular.copy(self.data_copy), function(e){

				// by quantity of user input
				return e.times_played >= quantity;
				});
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},

		};

	$scope.renew_view = function(){

		// init
		$scope.view.get_champion_list();

		// search champion by route param
		if(!_.isUndefined($routeParams.champion_name)) $scope.view.filter.string = $routeParams.champion_name;
		}

	$scope.renew_view();

	}]);
