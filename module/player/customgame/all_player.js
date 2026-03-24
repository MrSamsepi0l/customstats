'use strict';

angular.module('customstats').controller('customstats.all_player_controller', ['$scope', '$app', '$leagueapi', '$phpdate', '$routeParams', '$location', '$multichart', '$timeout', function($scope, $app, $leagueapi, $phpdate, $routeParams, $location, $multichart, $timeout){

	$scope.view = {
		list 		: [],
		entry		: null,
		status		: null,
		order_by 	: 'times_played',
		filter 			: {
			string 		: '',
			quant		: null,
			playerID    : null,
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
		win_lose_chartdata_list : {},
		playrate_chartdata_list : {},

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

						// convert some int values
						e.times_lost = parseInt(e.times_lost);
						e.times_won = parseInt(e.times_won);
						e.total_cs = parseInt(e.total_cs);
						e.total_kills = parseInt(e.total_kills);
						e.total_deaths = parseInt(e.total_deaths);
						e.total_assists = parseInt(e.total_assists);
						e.total_gold = parseInt(e.total_gold);
						e.total_games_general = parseInt(e.total_games_general);

						// convert some float values
						e.kda_number = parseFloat(e.kda_number);
						e.winrate = parseFloat(e.winrate);
						e.playrate = parseFloat(e.playrate);

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

					// render elements sequentially into list for non-blocking UI (2 = batch size)
					self.render_sequentially(data, 2);

					// copy playerlist
					self.list_copy = data;

					// search player by route param
					if(!_.isUndefined($routeParams.ingame_name) || !_.isUndefined($routeParams.playerID)){

						// define search obj
						var search_obj = !_.isUndefined($routeParams.ingame_name) ? {'ingame_name': $routeParams.ingame_name} : {'playerID': parseInt($routeParams.playerID)};

						// set entry
						self.entry = _.findWhere(data, search_obj);

						// filter select by player ID
						self.filter.playerID = self.entry.playerID;

						// load profile
						self.get_player_profile(self.entry.playerID);
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
				if(!_.isUndefined($routeParams.playerID)) $location.search('playerID', null);

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

			// render win lose chart
			self.render_win_lose_chart();

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
					tooltip: {
						pointFormat: '<span style="color: var(--light-blue-gray-1)">{point.y} Spiele</span>',
						backgroundColor: '#000',
						style: {
							color: '#fff',
							fontSize: '0.8rem',
							},
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
						pointFormat: '<span style="color: var(--light-blue-gray-1)">{point.y:.1f} % Winrate</span>',
						backgroundColor: '#000',
						style: {
							color: '#fff',
							fontSize: '0.8rem',
							},
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

		render_win_lose_chart : function(change_config){
			var self = this,
				categories_length = 5,
				data = self.position_winrate_rawdata,
				series = null,
				new_chart = angular.merge({
					chart: {
						height: 225,
						width: 300,
					    type: 'pie',
						},
					accessibility: {
						point: {
							valueSuffix: '%',
							},
						},
					title: {
						text: '<span style="color: var(--light-blue-gray-1); letter-spacing: 1px">Anzahl Spiele: <span style="color: #fff">'+self.entry.times_played+'</span></span>',
						useHTML: true,
						},
			        subtitle: {
			            text:   '<span style="font-size: 1.0rem; color: #e4f4ff; letter-spacing: 1px">'+self.entry.winrate+' %</span>'
			            		+'<br>'
			            		+'<span style="font-size: 0.8rem"> Winrate</span>',
			            floating: true,
			            useHTML: true,
			            verticalAlign: 'middle',
			            y: 28
			        	},
					tooltip: {
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
							cursor: 'pointer',
							dataLabels: [
							{
								enabled: true,
								distance: -20,
								format: '{point.y:.0f}',
								style: {
									fontSize: '0.9em'
									},
								}],
							showInLegend: true
							},
						pie: {
							size: 175,
							},
						},
					series: [],
					}, change_config);

			// create series
			series = {
				'name'	: $scope.view.entry.ingame_name,
				'colorByPoint': true,
				'innerSize': '60%',
				'colorIndex': 50,
				'data'		: [
					{name: 'WINS', y: self.entry.times_won, colorIndex: 50},
					{name: 'LOSES', y: self.entry.times_lost, colorIndex: 51},
					],
				};

			// add series to chart
			new_chart.series.push(series);

			// take series values
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.win_lose_chartdata = multichart.create_chart(new_chart);
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
		});

	// watch on profile switch
	$scope.$watch('view.entry', function(oldval, newval){

		// if nothing changed, stop here
		if(oldval && newval && oldval.playerID == newval.playerID) return;

		// else scroll to top
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		});

	}]);
