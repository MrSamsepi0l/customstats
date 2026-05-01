'use strict';

angular.module('customstats').controller('customstats.tournament_all_profile_controller', ['$scope', '$app', '$leagueapi', '$phpdate', '$timeout', '$routeParams', '$location', '$multichart', function($scope, $app, $leagueapi, $phpdate, $timeout, $routeParams, $location, $multichart){

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
		    match_history : {
		    	champion 	: null,
		    	position 	: [],
		    	},
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
		win_lose_chartdata_list : {},
		playrate_chartdata_list : {},
		image_base_url  		: 'public/img/tournament/team_logo',

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

						// convert some int values
						e.times_lost = parseInt(e.times_lost);
						e.times_won = parseInt(e.times_won);
						e.total_cs = parseInt(e.total_cs);
						e.total_kills = parseInt(e.total_kills);
						e.total_deaths = parseInt(e.total_deaths);
						e.total_assists = parseInt(e.total_assists);
						e.total_gold = parseInt(e.total_gold);
						e.total_games_general = parseInt(e.total_games_general);

						_.each(e.team_list, function(f){

							// remove special charts, lowercase, whitespace
							f.team_name_converted = f.name.split(' ').join('').toLowerCase().replace(/'/g, "");

							// define full team url
							f.image_url = self.image_base_url + '/' + f.team_name_converted + '.png';

							// extend entry
							f = _.extend(f, {
								substitute 	: _.contains(f.tag, 'substitute'),
								substitute_i: _.contains(f.tag, 'substitute') ? 1 : 0,
								departed	: _.contains(f.tag, 'departed'),
								});
							})
						});

					// copy playerlist
					self.list_copy = data;

					// search champion by route param
					if(!_.isUndefined($routeParams.ingame_name) || !_.isEmpty($routeParams.playerID)){

						// define search obj
						var search_obj = !_.isUndefined($routeParams.ingame_name) ? {'ingame_name': $routeParams.ingame_name} : {'playerID': parseInt($routeParams.playerID)};

						// set entry
						self.entry = _.findWhere(data, search_obj);

						// filter select by player ID
						self.filter.playerID = self.entry.playerID;
						}

					// otherwise
					else {

						// for each player
						_.each(data, function(e){

							// render charts
							self.render_win_lose_chart_list({}, e);
							self.render_playrate_chart_list({}, e);
							});
						}

					// render elements sequentially into list for non-blocking UI (2 = batch size)
					// self.render_sequentially(data, 1);
					self.list = data;
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

		render_win_lose_chart_list : function(change_config, player){
			var self = this,
				series = null,
				new_chart = angular.merge({
					chart: {
						height: 75,
						width: 200,
						spacing: [0,0,0,0],
					    type: 'bar',
						},
					xAxis: {
						lineWidth: 0,
						minorGridLineWidth: 0,
						labels: {
							enabled: false
							},
						minorTickLength: 0,
						tickLength: 0
						},
				    yAxis: {
				        gridLineWidth: 0,
				        labels: {
				            enabled: false,
				        },
				        title: {
				        	useHTML: true,
				        	text: '<span style="color: #fff; font-size: 0.6rem; letter-spacing: .1rem; font-weight: bold; textTransform: uppercase">'+player.winrate+' %<span style="color: var(--light-blue-gray-1)"> Winrate</span></span>',
				            y: -10,
				        	}
				    	},
					tooltip: {
						enabled: false,
						pointFormat: '',
						backgroundColor: '#000',
						style: {
							color: '#fff',
							fontSize: '1rem',
							},
						},
					legend: {
						enabled: false
						},
					plotOptions: {
						series: {
							allowPointSelect: false,
							enableMouseTracking: false,
							cursor: 'pointer',
							dataLabels: [
							{
								enabled: true,
								format: '{point.y:.0f} {point.name}',
								style: {
									fontSize: '0.7em',
									color: '#000',
									fontWeight: 'normal',
									},
								}],
							showInLegend: false,
							states : {
								hover : {
									enabled: false,
									}
								}
							},
						bar: {
							stacking: 'percent',
							},
						},
					series: [],
					}, change_config);

			// define lose series for stacked bar chart
			series = {
				'name'		: 'LOSES',
				'colorIndex': 51,
				'data'		: [
					{'name'	: 'L', 'y': player.times_lost},
					],
				};

			// add series to chart
			new_chart.series.push(series);

			// define win series for stacked bar chart
			series = {
				'name'		: 'WINS',
				'colorIndex': 50,
				'data'		: [
					{'name'	: 'W', 'y': player.times_won},
					],
				};

			// add series to chart
			new_chart.series.push(series);

			// take series values
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.win_lose_chartdata_list[player.playerID] = multichart.create_chart(new_chart);
			},

		render_playrate_chart_list : function(change_config, player){
			var self = this,
				series = null,
				new_chart = angular.merge({
					chart: {
						height: 75,
						width: 200,
						spacing: [0,0,0,0],
					    type: 'bar',
						},
					xAxis: {
						lineWidth: 0,
						minorGridLineWidth: 0,
						labels: {
							enabled: false
							},
						minorTickLength: 0,
						tickLength: 0
						},
				    yAxis: {
				        gridLineWidth: 0,
				        labels: {
				            enabled: false,
				        },
				        title: {
				        	useHTML: true,
				        	text: '<span style="color: #fff; font-size: 0.6rem; letter-spacing: .1rem; font-weight: bold; textTransform: uppercase">'+player.playrate+' %<span style="color: var(--light-blue-gray-1)"> Playrate</span></span>',
				            y: -10,
				        	}
				    	},
					tooltip: {
						enabled: false,
						pointFormat: '',
						backgroundColor: '#000',
						style: {
							color: '#fff',
							fontSize: '1rem',
							},
						},
					legend: {
						enabled: false
						},
					plotOptions: {
						series: {
							allowPointSelect: false,
							enableMouseTracking: false,
							cursor: 'pointer',
							dataLabels: [
							{
								enabled: true,
								inside: true,
								align: 'center',
								verticalAlign: 'middle',
								allowOverlap: true,
								format: '{point.y:.0f} / '+player.total_games_general,
								borderWidth: 0,
								style: {
									fontSize: '0.7em',
									color: '#000',
									fontWeight: 'normal',
									},
								}],
							showInLegend: false,
							states : {
								hover : {
									enabled: false,
									}
								}
							},
						bar: {
							stacking: 'percent',
							},
						},
					series: [],
					}, change_config);

			// add total games general series for stacked bar chart
			series = {
				'colorIndex': 52,
				'data'		: [
					{'name'	: 'total_games_general', 'y': player.total_games_general - player.times_played},
					],
				'dataLabels': [{enabled: false, crop: false, allowOverlap: true}],
				};

			// add series to chart
			new_chart.series.push(series);

			// add times played of player series for stacked bar chart
			series = {
				'colorIndex': 50,
				'data'		: [
					{'name'	: 'times_played', 'y': player.times_played},
					],
				};

			// add series to chart
			new_chart.series.push(series);

			// take series values
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.playrate_chartdata_list[player.playerID] = multichart.create_chart(new_chart);
			},

		filter_match_history_list : function(entry){

			// define self
			var self = $scope.view;

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

		// sequential rendering function
		render_sequentially : function(list, items_per_batch){
			var self = this, idx = 0;
			var batch_size = items_per_batch || 50;

			// copy list
			list = angular.copy(list);

			// inner function
			function render_batch(){

				// if end reached, stop
				if(idx >= list.length) return;

				// compute end
				const end = Math.min(idx + batch_size, list.length);

				// run loop
				for(let i = idx; i < end; i++){

					// push entries sequentially into list
					self.list.push(list[i]);
					}

				// update index
				idx = end;

				// if end reached, stop execution
				if(idx < list.length) $timeout(render_batch, 0);
				}

			// init
			render_batch();
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
