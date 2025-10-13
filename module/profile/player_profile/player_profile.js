'use strict';

angular.module('customstats').controller('customstats.league_profile_controller', ['$scope', '$app', '$leagueapi', '$phpdate', '$location', '$multichart', function($scope, $app, $leagueapi, $phpdate, $location, $multichart){

	$scope.league_profile = {
		list 		: [],
		entry		: null,
		status		: null,
		translate_position : {
			'top'		: 'Toplane',
			'jungle'	: 'Jungler',
			'mid'		: 'Midlane',
			'adc'		: 'Botlane',
			'support'	: 'Support',
			},
		priority_position : {
			'top'		: 0,
			'jungle'	: 1,
			'mid'		: 2,
			'adc'		: 3,
			'support'	: 4,
			},
		title_config	: {
			},
		match_history	: {
			render_limit: 20,
			},
		filter: {
		    match_history : {
		    	champion 	: null,
		    	position 	: [],
		    	},
			},

		get_league_profile : function(playerID){
			var self = this, param;

			// define param
			param = {
				'playerID'	: playerID,
				};

			// check basically if request is okay
			if(!param.playerID) return self.status = 400;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_api_get_player', param, {
				200 : function(data){

					// for each game in history
					_.each(data.match_history, function(match){

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

					// take profile
					self.entry = data;

					// if given convert last game date
					if(self.entry) self.entry.last_game_converted = $phpdate(self.entry.last_game).format('d-m-Y');

					// default list
					var position_rawdata = [], position_winrate_rawdata = [];

					// for each position
					_.each(['top', 'jungle', 'mid', 'adc', 'support'], function(position){

						// create object
						position_rawdata.push({
							'name'		: position,
							'result'	: {
								[position]	: {
									'type'	: position,
									'sum'	: (_.findWhere(data.position_list, {'role': position})) ? _.findWhere(data.position_list, {'role': position}).times_played : 0,
									},
								},
							});

						// create object
						position_winrate_rawdata.push({
							'name'		: position,
							'result'	: {
								[position]	: {
									'type'	: position,
									'sum'	: (_.findWhere(data.position_list, {'role': position})) ? _.findWhere(data.position_list, {'role': position}).winrate : 0,
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

					// build players title list
					self.entry.title_list = $leagueapi.get_player_title(data, self.title_config);
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		get_config : function(project){
			var self = this, param;

			// define param
			param = {
				'project' 	: project,
				};

			// basically check if request is okay
			if(!param.project) return self.status = 400;

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_base_get_config', param, {
				200 : function(data){

					// take data
					self.title_config = data.param.base_config.player_profile;

					// check if we have a playerID
					var playerID = $app.board_get_value('playerID');

					// load profile
					if(playerID) self.get_league_profile(playerID);
					},
				'*' : function(data, status){
					}
				});
			},

		redirect_template : function(param){
			var self = this;

			// and search for profile by ingame name
			$location.url('/all_player').search({ingame_name: param});
			},

		increase_render_limit : function(render_limit){
			var self = this;

			// increse limit to render limit
			self.match_history.render_limit += render_limit;
			},

		filter_match_history_list : function(entry){

			// define self
			var self = $scope.league_profile;

			// if position filter defined: remove all games not played in this position
			if(!_.isEmpty(self.filter.match_history.position) && !_.contains(self.filter.match_history.position, entry.position)) return false;

			// if champion filter defined: remove all games not played with this champ
			if(self.filter.match_history.champion !== null && self.filter.match_history.champion != entry.champion) return false;

			// allow everything else
			return true;
			},

		match_history_position_filter(position){
			var self = this;

			// if position already in filter list
			if(_.contains(self.filter.match_history.position, position)){

				// filter match history position list
				return self.filter.match_history.position = _.reject(self.filter.match_history.position, function(e){

					// remove it
					return e == position;
					});
				}

			// add position to filter
			self.filter.match_history.position.push(position);
			},

		match_history_position_filter_is_selected(position){
			var self = this;

			// check if position filter is currently active
			return _.contains(self.filter.match_history.position, position);
			},

		render_position_chart : function(change_config){
			var self = this,
				categories_length = 5,
				data = self.position_rawdata,
				series = null,
				new_chart = angular.merge({
					chart: {
						height: 175,
						width: 500,
					    backgroundColor : '#050d12',
					    type: 'column',
						},
					title: {
						text: 'POSITIONSVERTEILUNG',
						style: {'fontSize':'1.0rem','color':'whitesmoke', 'letter-spacing': '1px'}
						},
					xAxis: {
						lineColor: '#213751',
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
					plotOptions: {
						series: {
							pointWidth: 50
							},
						},
					tooltip 	: {
						format  : ' Spiele',
						},
					series: [],
					}, change_config);

			// create series
			series = {
				'name'	: $scope.league_profile.entry.ingame_name,
				'color'	: '#213751',
				'data'	: Array(categories_length).fill(0),
				};

			// for each players timeserie
			_.each(data, function(entry, key){

				// skip undefined, null entries
				if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

				// push result into data array players name index
				series.data[key] = entry.result[entry.name].sum;
				});

			// add to chart series
			new_chart.series.push(series);

			// take series values
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
					    type: 'spline',
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

			// create series
			series = {
				'name'	: $scope.league_profile.entry.ingame_name,
				'color'	: '#213751',
				'data'	: Array(categories_length).fill(0),
				};

			// for each players timeserie
			_.each(data, function(entry, key){

				// skip undefined, null entries
				if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

				// push result into data array players name index
				series.data[key] = entry.result[entry.name].sum;
				});

			// add series to chart
			new_chart.series.push(series);

			// take series values
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.position_winrate_chartdata = multichart.create_chart(new_chart);
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init config loading
		$scope.league_profile.get_config(board_status.project);
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);

		// and append it to this even too
		// $scope.$on('$locationChangeSuccess', $scope.ui_review);
		});

	// watch on profile switch
	$scope.$watch('league_profile.entry', function(oldval, newval){

		// if nothing changed, stop here
		if(oldval && newval && oldval.playerID == newval.playerID) return;

		// else scroll to top
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		});

	}]);
