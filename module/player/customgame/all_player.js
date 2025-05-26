'use strict';

angular.module('customstats').controller('customstats.all_player_controller', ['$scope', '$app', '$leagueapi', '$phpdate', '$routeParams', '$location', '$multichart', function($scope, $app, $leagueapi, $phpdate, $routeParams, $location, $multichart){

	$scope.view = {
		list 		: [],
		entry		: null,
		status		: null,
		order_by 	: 'times_played',
		filter 			: {
			string 		: '',
			quant		: null,
			playerID    : 0,
			sort_order  : 'desc',
			option	: [
		    	{key : 'Alphabetisch', value : 'ingame_name_converted'},
		    	{key : 'Anzahl Spiele', value : 'times_played'},
		    	{key : 'Siege', value : 'times_won'},
		    	{key : 'Niederlagen', value : 'times_lost'},
		    	{key : 'Playrate', value : 'playrate'},
		    	{key : 'Winrate', value : 'winrate'},
		    	{key : 'Letztes Spiel', value : 'last_game'},
		    	{key : 'Donation', value : 'donation'},
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
		priority_position : {
			'top'	: 0,
			'jungle': 1,
			'mid'	: 2,
			'adc'	: 3,
			'support': 4,
			},
		title_config	: null,
		match_history	: {
			render_limit: 20,
			},

		get_league_profile_list : function(){
			var self = this, param;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_api_get_player', param, {
				200 : function(data){

					// for each player
					_.each(data, function(e){

						// convert to lowercase without special chars and spaces
						e.ingame_name_converted = e.ingame_name.split(' ').join('').toLowerCase();

						// for each match in history
						_.each(e.match_history, function(match){

							// get relative time to now
							match.relative_time_to_now = moment(match.gameDate+' 18:00:00').fromNow(true);

							// sort team one list
							match.team_one_list = match.team_one_list.sort(function(a, b){

								// by position
								return self.priority_position[a.position] - self.priority_position[b.position];
								});

							// sort team two list
							match.team_two_list = match.team_two_list.sort(function(a, b){

								// by position
								return self.priority_position[a.position] - self.priority_position[b.position];
								});
							});
						});

					// take playerlist
					self.list = data;
					self.list_copy = data;

					// search champion by route param
					if(!_.isUndefined($routeParams.ingame_name)){

						// set entry
						self.entry = _.findWhere(data, {'ingame_name': $routeParams.ingame_name});

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
			var self = this, entry, position_rawdata = [],
				position_winrate_rawdata = [];

			// if no playerID given
			if(!playerID){

				// reset route param
				if(!_.isUndefined($routeParams.ingame_name)) $location.search('ingame_name', null);

				// reset entry and stop
				return self.entry = null;
				}

			// search player by ID
			entry = _.findWhere(self.list, {'playerID': playerID});

			// set entry
			self.entry = entry;

			// set playerID filter
			self.filter.playerID = playerID;

			// for each position
			_.each(['top', 'jungle', 'mid', 'adc', 'support'], function(position){

				// create object
				position_rawdata.push({
					'name'		: position,
					'result'	: {
						[position]	: {
							'type'	: position,
							'sum'	: (_.findWhere(entry.position_list, {'role': position})) ? _.findWhere(entry.position_list, {'role': position}).times_played : 0,
							},
						},
					});

				// create object
				position_winrate_rawdata.push({
					'name'		: position,
					'result'	: {
						[position]	: {
							'type'	: position,
							'sum'	: (_.findWhere(entry.position_list, {'role': position})) ? _.findWhere(entry.position_list, {'role': position}).winrate : 0,
							},
						},
					});
				});

			// define globally
			self.position_rawdata = position_rawdata;
			self.position_winrate_rawdata = position_winrate_rawdata;

			// render position chart
			self.render_position_chart();

			// render position winrate chart
			self.render_position_winrate_chart();

			// build players title list using leagueapi service
			self.entry.title_list = $leagueapi.get_player_title(entry, self.title_config);
			},

		get_config : function(project){
			var self = this, param;

			// define param
			param = {
				'project' 	: project,
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

		render_position_chart : function(change_config){
			var self = this,
				categories_length = 5,
				data = self.position_rawdata,
				series = null,
				new_chart = angular.merge({
					chart: {
						height: 175,
						width: 450,
					    backgroundColor : '#050d12',
					    type: 'column',
						},
					title: {
						text: 'POSITIONSVERTEILUNG',
						style: {'fontSize':'1.0rem','color':'whitesmoke', 'letter-spacing': '1px'}
						},
					xAxis: {
						categories: ['Toplane', 'Jungle', 'Midlane', 'Botlane', 'Support'],
						labels : {style : {'fontSize': '0.7rem'}},
						},
					yAxis: {
						labels 		  	: {
							enabled		: true,
							format		:'{value} x'
							},
						allowDecimals 	: false,
						},
					tooltip 	: {
						format  : ' Spiele',
						},
					series: [],
					}, change_config);

			// create series object
			series = {
				'name'	: $scope.view.entry.ingame_name,
				'color'	: '#213751',
				'data'	: Array(categories_length).fill(0),
				};

				// for each timeserie player
			_.each(data, function(entry, key){

				// skip undefined, null entries
				if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

				// push result into data array players name index
				series.data[key] = entry.result[entry.name].sum;
				});

			// push serios into chart
			new_chart.series.push(series);

			// create chart
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.position_chartdata = multichart.create_chart(new_chart);
			},

		render_position_winrate_chart : function(change_config){
			var self = this,
				categories_length = 5,
				data = self.position_winrate_rawdata,
				series = null,
				new_chart = angular.merge({
					chart: {
						height: 175,
					    backgroundColor : '#050d12',
					    type: 'bar',
						},
					title: {
						text: 'WINRATE NACH POSITION',
						style: {'fontSize':'1.0rem','color':'whitesmoke', 'letter-spacing': '1px'}
						},
					xAxis: {
						categories: ['Toplane', 'Jungle', 'Midlane', 'Botlane', 'Support'],
						labels : {style : {'fontSize': '0.5rem'}},
						},
					yAxis: {
						labels 		  	: {
							enabled		: true,
							format		:'{value} %'
							},
						allowDecimals 	: true,
						max			  	: 100,
						},
					tooltip: {
						format: ' %'
						},
					series: [],
					}, change_config);

			// create series object
			series = {
				'name'	: $scope.view.entry.ingame_name,
				'color'	: '#213751',
				'data'	: Array(categories_length).fill(0),
				};

				// for each timeserie player
			_.each(data, function(entry, key){

				// skip undefined, null entries
				if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

				// push result into data array players name index
				series.data[key] = entry.result[entry.name].sum;
				});

			// push serios into chart
			new_chart.series.push(series);

			// create chart
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.position_winrate_chartdata = multichart.create_chart(new_chart);
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
		});

	// watch on profile switch
	$scope.$watch('view.entry', function(oldval, newval){

		// if nothing changed, stop here
		if(oldval && newval && oldval.playerID == newval.playerID) return;

		// else scroll to top
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		});

	}]);
