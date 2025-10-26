'use strict';

angular.module('customstats').controller('customstats.tournament_all_profile_controller', ['$scope', '$app', '$leagueapi', '$phpdate', '$routeParams', '$location', function($scope, $app, $leagueapi, $phpdate, $routeParams, $location){

	$scope.view = {
		list 		: [],
		entry		: null,
		status		: null,
		order_by 	: 'times_played',
		filter 			: {
			string 		: '',
			quant		: null,
			playerID    : null,
			tournamentID: null,
			sort_order  : 'desc',
			option	: [
		    	{key : 'Alphabetisch', value : 'ingame_name_canonical'},
		    	{key : 'Anzahl Spiele', value : 'times_played'},
		    	{key : 'Siege', value : 'times_won'},
		    	{key : 'Niederlagen', value : 'times_lost'},
		    	{key : 'Playrate', value : 'playrate'},
		    	{key : 'Winrate', value : 'winrate'},
		    	{key : 'Letztes Spiel', value : 'last_game'},
		    	{key : 'KDA', value : 'kda_number'},
		    	],
			},
		translate_position : {
			'top'		: 'Toplane',
			'jungle'	: 'Jungler',
			'mid'		: 'Midlane',
			'adc'		: 'Botlane',
			'support'	: 'Support',
			},
		title_config	: {
			},
		match_history	: {
			render_limit: 20,
			},

		get_league_profile_list : function(tournamentID){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				};

			// if no tournamentID given, remove
			if(!param.tournamentID) delete(param.tournamentID);

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_profile', param, {
				200 : function(data){

					// for each player
					_.each(data, function(e){

						// convert
						e.ingame_name_canonical = e.ingame_name.split(' ').join('').toLowerCase();

						_.each(e.team_list, function(f){

							// extend entry
							f = _.extend(f, {
								substitute 	: _.contains(f.tag, 'substitute'),
								substitute_i: _.contains(f.tag, 'substitute') ? 1 : 0,
								departed	: _.contains(f.tag, 'departed'),
								});
							})
						});

					// take playerlist
					self.list = data;
					self.list_copy = data;

					self.entry = _.findWhere(data, {'playerID': self.filter.playerID});

					// search champion by route param
					if(!_.isUndefined($routeParams.ingame_name) || !_.isEmpty($routeParams.playerID)){

						// define search obj
						var search_obj = !_.isUndefined($routeParams.ingame_name) ? {'ingame_name': $routeParams.ingame_name} : {'playerID': parseInt($routeParams.playerID)};

						// set entry
						self.entry = _.findWhere(data, search_obj);

						// filter select by player ID
						self.filter.playerID = self.entry.playerID;

						// load profile
						self.get_player_profile(self.entry.playerID);
						}
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		get_player_profile : function(playerID){
			var self = this, entry;

			// if no playerID given, set entry null and return
			if(!playerID){

				// reset route param
				if(!_.isUndefined($routeParams.playerID)) $location.search('playerID', null);
				if(!_.isUndefined($routeParams.ingame_name)) $location.search('ingame_name', null);

				// reset entry
				return self.entry = null;
				}

			// search player by ID
			entry = _.findWhere(self.list, {'playerID': playerID});

			// set entry
			self.entry = entry;

			// set playerID filter
			self.filter.playerID = playerID;
			},

		get_config : function(project = null){
			var self = this, param;

			// define param
			param = {
				'project' 	: project ? project : $app.data.project,
				};

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_base_get_config', param, {
				200 : function(data){

					// take data
					self.title_config = data.param.base_config.player_profile;

					// load profile
					self.get_league_profile_list();
					},
				'*' : function(data, status){
					}
				});
			},

		filter_player_games : function(quantity){
			var self = this;

			// copy complete champ list if not set
			if(!_.size(self.list_copy)) self.list_copy = angular.copy(self.list);

			// filter champ list
			self.list = _.filter(angular.copy(self.list_copy), function(e){

				// by quantity of user input
				return e.times_played >= quantity;
				});
			},

		order_list : function(sort_order){
			var self = this;

			// set sort order
			self.filter.sort_order = (sort_order == 'desc') ? 'asc' : 'desc';
			},

		increase_render_limit : function(render_limit){
			var self = this;

			// increse limit to render limit
			self.match_history.render_limit += render_limit;
			},

		reset_render_limit : function(){
			var self = this;

			// reset to 20
			self.match_history.render_limit = 20;
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init config loading
		$scope.view.get_config(board_status.project);
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);

		// and append it to this even too
		// $scope.$on('$locationChangeSuccess', $scope.ui_review);
		});

	// watch on profile switch
	$scope.$watch('view.entry', function(oldval, newval){

		// if nothing changed, stop here
		if(oldval && newval && oldval.playerID == newval.playerID) return;

		// else scroll to top
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		});

	}]);
