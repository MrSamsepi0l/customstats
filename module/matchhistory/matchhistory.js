'use strict';

angular.module('customstats').controller('customstats.global_match_history_controller', ['$scope', '$app', '$phpdate', '$multichart', '$regression', '$leagueapi', '$location', function($scope, $app, $phpdate, $multichart, $regression, $leagueapi, $location){

	$scope.view = {
		status 		: null,
		data   		: null,
		data_raw   	: null,
		filter 		: {
			player 		: null,
			date 		: 'all',
			sort_order	: 'newest_first',
			sort_current: 'newest_first',
			unfold 		: false,
			unfold_button : 'Alle ausklappen',
			render_limit: 10,
			},
		popup : {
			source 	: {
				show 	: false,
				url		: null,
				},
			},
		playerlist	: [],
		championlist: [],
		chartdata 	: {},

		get_match_history : function(){
			var self = this;

			// define param
			var param = {
				};

			// load
			$leagueapi.send_request('customstats_get_global_match_history', param, {
				200 : function(data){

					// reverse data
					data = data.reverse();

					// for each match in history
					_.each(data, function(e, index){

						// expand first match
						e.match_history_expanded = (index == 0);
						});

					// take rawdata
					self.data = data;

					// take rawdata
					self.data_raw = data;
					},
				'*' : function(data, status){

					}
				});
			},

		filter_match_history : function(){
			var self = this, rawdata, filtered_data = [], player;

			// copy rawlist
			rawdata = angular.copy(self.data_raw);

			// take championID from filter if defined
			var playerID = (self.filter.player_full) ? self.filter.player_full.playerID : null;
			var championID = (self.filter.champion_full) ? self.filter.champion_full.championID : null;

			// if filtered by champ
			if(championID){

				// default / reset
				self.filter.champion_full.times_won = 0;
				}

			// if filtered by player
			if(playerID){

				// default / reset
				self.filter.player_full.times_won = 0;
				}


			// for each match in history
			_.each(rawdata, function(match, index){

				// skip match default true
				var skip_match = false;
				var winner_teamID = (match.team_one.stat_complete.has_won) ? 1 : 2;

				// if player filter active
				if(self.filter.player_full && !_.contains(match.team_one.playerID_list, self.filter.player_full.playerID) && !_.contains(match.team_two.playerID_list, self.filter.player_full.playerID)){

					// skip match
					skip_match = true;
					}

				// if champion filter active
				if(self.filter.champion_full && !_.contains(match.team_one.championID_list, self.filter.champion_full.championID) && !_.contains(match.team_two.championID_list, self.filter.champion_full.championID)){

					// skip match
					skip_match = true;
					}

				// if date filter active
				if(self.filter.date){

					// 1: since_last_year
					if(self.filter.date == 'since_last_year'){

						// calculate last year
						var last_year = moment().subtract(1, 'year').unix();

						// if game is older than last year, skip match
						if(moment(match.gameDate).unix() < last_year) skip_match = true;
						}

					// 2: last 100 games (requires sorted list by date DESC!)
					if(self.filter.date == 'last_100'){

						// sort list by

						// if index larger or equal 100, skip match
						if(index >= 100) skip_match = true;
						}
					}


				//
				if(!skip_match){

					// calculate
					if(championID){

						// if champ was team one and has won, increment
						if(winner_teamID == 1 && _.contains(match.team_one.championID_list, championID)) self.filter.champion_full.times_won++;
						if(winner_teamID == 2 && _.contains(match.team_two.championID_list, championID)) self.filter.champion_full.times_won++;
						}

					// if player
					if(playerID){

						// if player was team one and has won, increment
						if(winner_teamID == 1 && _.contains(match.team_one.playerID_list, playerID)) self.filter.player_full.times_won++;
						if(winner_teamID == 2 && _.contains(match.team_two.playerID_list, playerID)) self.filter.player_full.times_won++;
						}

					// add match to filtered list
					filtered_data.push(match);
					}

				// expand first element in list
				if(!_.isEmpty(filtered_data)) filtered_data[0].match_history_expanded = true;

				// //
				// if(self.filter.player && self.filter.player.playerID != match.filter.player.playerID){

				// 	console.log(true);
				// 	}
				});

			// safe previous filtering
			self.filter.previous = angular.copy(self.filter);

			// redefine match history
			self.data = filtered_data;

			// reload charts
			self.get_timeserie_side_winrate();

			// load champion winrate timeserie
			if(championID) self.get_timeserie_champion_winrate();
			},

		load_playerlist : function(){
			var self = this, param;

			// set param
			param = {
				'with_analyze'	: false,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_api_get_player', param, {
				200 : function(data){

					// take data
					self.playerlist = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		load_championlist : function(){
			var self = this, param;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_load_champion', param, {
				200 : function(data){

					// for each champ
					_.each(data, function(e){

						// convert gender to string
						e.gender_string = (e.gender == 0) ? 'weiblich' : 'männlich';
						e.name_converted = e.name.split(' ').join('');
						});

					// take data
					self.championlist = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		get_timeserie_side_winrate : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'side_winrate',
				'run'			: 'match_history_global',
				'step'			: '+1 month',
				'category'		: 'date',
				'range_num'		: 1000,
				};

			// check filter
			if(self.filter.date && self.filter.date == 'last_100') param.range_num = 100;

			// add playerID to param if filter defined and player found
			if(self.filter.player && self.filter.player_full) param.playerID = self.filter.player_full.playerID;

			// add championID to param if filter defined and champ found
			if(self.filter.champion && self.filter.champion_full) param.championID = self.filter.champion_full.championID;

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data;

					// render timeserie
					self.render({
						chart : {
							type: 'pie',
							width: 200,
							},
						// subtitle: {
						// 	text: 'Winrate Side',
						// 	verticalAlign: 'right',
						// 	x: 80
						// 	},
					    tooltip: {
					        pointFormat: '{series.name} ({point.f} Games): <b>{point.percentage:.1f} %</b>'
					    	},
					    accessibility: {
					        point: {
					            valueSuffix: '%'
					        	}
					    	},
						// legend: {
						//     align: 'right',
						//     layout: 'vertical',
						//     verticalAlign: 'middle',
						//     labelFormat: '{name} ({f} Games)',
						//     enabled: true,
						//     itemStyle: {
						//     	color: 'white',
						//     	fontWeight: 'normal'
						//     	},
						//    	x: -40,
						// 	},
					    plotOptions: {
					        pie: {
					            allowPointSelect: true,
					            showInLegend: true,
					            cursor: 'pointer',
					            colors : [
					            	'#0c173b',
					            	'#410914',
					            	],
					            borderRadius: 5,
					            dataLabels: {
					                enabled: true,
					                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
					                distance: -50,
					                filter: {
					                    property: 'percentage',
					                    operator: '>',
					                    value: 4
					                	}
					            	}
					        	}
					    	},
						seriesTitle: 'Winrate',
						}, 'side_winrate');
					},
				'*' : function(data, status){

					}
				});
			},

		get_timeserie_champion_winrate : function(){
			var self = this;

			// // if already loaded return here
			// if(champion_name == self.timeserie.champion_name){

			// 	// destroy chart
			// 	self.destroy_chart();

			// 	// render chart
			// 	self.render();
			// 	return;
			// 	}

			console.log(self.data);

			// define param
			var param = {
				'type'			: 'winrate',
				'run'			: 'champion',
				'category'		: 'champion_only_with_date',
				'champion'		: self.filter.champion_full.name,
				'mode'			: 'all',
				'range_num'		: 1000,
				'step'			: '+1 month'
				};

			var championID = self.filter.champion_full.championID;

			// copy data
			var data = angular.copy(self.data);

			var times_played = 0;
			var times_won = 0;

			//
			var timeserie = [];

			_.each(data, function(e){

				// increment times played
				times_played++;

				// if champ was team one and has won, increment
				if(e.winner_teamID == 1 && _.contains(e.team_one.championID_list, championID)) times_won++;
				if(e.winner_teamID == 2 && _.contains(e.team_two.championID_list, championID)) times_won++;

				// calculate winrate at this point
				var winrate = times_won / times_played * 100;

				// define step
				var step = {
					'name'	: e.gameDate,
					'result': [],
					};

				var timeline_obj = {
					'type'	: self.filter.champion_full.name,
					'sum'	: Math.round(winrate),
					};

				step.result[self.filter.champion_full.name] = timeline_obj;

				// take step
				timeserie.push(step);
				});

			console.log(timeserie);

			self.rawdata = timeserie;

			self.render_chart({
			    tooltip: {
			    	headerFormat: '<div>{series.name} nach {point.key} Games:<div>',
			        pointFormat: '<span style="display: flex; justify-content: center"><b>{point.y} {point.percentage:.1f} %</b></span>',
			        valueDecimals: 2,
			    	},
				plotOptions: {
					area: {
						lineWidth: 1, lineColor: "rgb(254, 163, 88)",
						marker: {
							enabled: false
							},
		                color: {
		                    linearGradient: {
		                        x1: 0,
		                        y1: 0,
		                        x2: 0,
		                        y2: 1
		                    	},
		                    stops: [
		                        [0, 'rgb(192, 113, 48)'],
		                        [1, 'rgb(24, 27, 37)']
		                    	]
		                	},
						}
					},
				xAxis: {
					visible: false,
					},
				withTrend: false,
				trendColor: '#d6a5d5',
				seriesTitle: 'Winrate',
				seriesColor: '#1c0c1c',
				}, 'champion_winrate');

			// // load
			// $leagueapi.send_request('customstats_get_timeserie', param, {
			// 	200 : function(data){

			// 		// take rawdata & timeserie data
			// 		self.rawdata = data;

			// 		// render
			// 		self.render(null, 'champion_winrate');
			// 		},
			// 	'*' : function(data, status){
			// 		self.status = status;
			// 		}
			// 	});
			},

		render_chart : function(change_config){
			var self = this,
				categories_length = this.rawdata.length,
				playernames = [self.filter.champion_full.name],
				categories = [],
				categories_name = {},
				date_only = true,
				data = self.rawdata,
				series = null,
				final_data = [],
				new_chart = angular.merge({
					chart: {
						width: 400,
						height: 100,
					    // backgroundColor: '#0a0a0a',
						},
				// title: {
				// 	text: 'Entwicklung Winrate - ' + self.entry.hovered.champion_name
				// 	},
					xAxis: {
						categories: [], // categories array, eg. ["12-04","12-05","12-06","12-07"]
						labels: {
							enabled: false,
							},
						plotBands: [{
							// color: '#FCFFC5',
							from: null,
							to: null,
							}],
						},
					// yAxis : {
					// 	max : 100,
					// 	},
					plotOptions : {
						area : {
							stacking : null,
							lineWidth: 1, lineColor: "#666666",
							marker: {lineWidth: 1, lineColor: "#666666"}
							},
						},
					series: [], // series array, eg. [{"name":"PlayerName", "data":[0,0,0,20,40,60,0]}, {"name":"ChampionName", "data":[0,0,0,20,40,60,0]}]
					}, change_config);

			// for each data
			_.each(data, function(e, index){

				console.log(e);

				// get date
				categories.push(e.name);

				new_chart.xAxis.categories.push(index + 1);
				});

			// for each player
			_.each(playernames, function(e, playerkey){

				// create series object
				series = {
					'name'		: new_chart.seriesTitle ?? '',
					// 'color'		: new_chart.seriesColor ?? '#255958',
					'data'		: Array(categories_length).fill(0),
					};

				// for each timeserie player
				_.each(data, function(entry, key){

					// skip undefined, null entries
					if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

					// push result into data array players name index
					series.data[key] = entry.result[e].sum;
					});

				// push serios into chart
				new_chart.series.push(series);
				});

			// // fill default
			// var data_tmp = Array(categories_length).fill(0);

			// 	// for each series and its data
			// 	_.each(new_chart.series, function(serie){
			// 		_.each(serie.data, function(e, i){

			// 			// skip (current day, hour or 10 min and future)
			// 			if(typeof data_tmp[i] == 'undefined') return;

			// 			// sum value
			// 			data_tmp[i] += e;
			// 			});
			// 		});

			// 	// default
			// 	var fill_until = null;

			// 	// calculating regression for new data (total of all series)
			// 	var result = $regression.linear(data_tmp, fill_until);

			// 	// set name
			// 	result.name = 'Trend (Gesamt)';

			// 	// set trend series
			// 	new_chart.series['Trend'] = {
			// 		"name"		: result.name,
			// 		"color"		: new_chart.trendColor ?? '#a96be3',
			// 		"data"		: result.series_data,
			// 		"stacking"	: undefined,
			// 		"type"		: 'spline',
			// 		"marker"	: {enabled: false},
			// 		"enableMouseTracking" : false,
			// 		};

			// // create chart
			// new_chart.series = _.values(new_chart.series);

			// change stacking option
			new_chart.plotOptions.area.stacking = self.stacking_option;

			// change y axis format for values
			new_chart.yAxis = {
				labels : {
					enabled: true,
					format: '{value}.00 %',
					},
				max : 100,
				min : 0,
				};

			// // and change tooltip for percentage symbol
			// new_chart.tooltip = {
			// 	format : '&nbsp;%'
			// 	};

			// create multichart
			var multichart = $multichart.get_new();

			// create highchart
			self.chartdata.champion_winrate = multichart.create_chart(new_chart);
			},

		render : function(change_config, data_key = null){
			var self = this,
				categories_length = this.rawdata.length,
				categories = [],
				data = self.rawdata,
				series = null,
				new_chart = angular.merge({
					chart: {
						// width: 1500,
						height: 225,
					    backgroundColor : '#0a0e13',
					    type: 'area',
						},
					title: {
						text: '',
						style: {'fontSize':'10px','color':'whitesmoke'}
						},
					xAxis: {
						categories: [],
						gridLineColor: '#0f1519',
						visible: false
						},
					yAxis: {
						gridLineColor: '#0f1519',
				        gridLineInterpolation: 'polygon',
				        lineWidth: 0,
				        labels : {
				        	style : {
				        		color: '#255958',
				        		},
				        	},
						},
					plotOptions : {
						area : {
							stacking : null,
							lineWidth: 1, lineColor: "#aafff7",
							marker: {lineWidth: 1, lineColor: "#aafff7"}
							},
						},
					series: [],
					withTrend: false,
					}, change_config);

			// create series object
			series = {
				'name'	: new_chart.seriesTitle ?? '',
				// 'color'	: new_chart.seriesColor ?? '#255958',
				// 'data'	: Array(categories_length).fill(0),
				'data'	: [],
				};

				// for each timeserie player
			_.each(data, function(entry, key){

				// get date
				// categories.push(entry.name);

				// skip undefined, null entries
				if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

				// define object
				var obj = {
					'name'		: entry.name,
					'y'			: entry.result.sum,
					'f'			: entry.result.games,
					'sliced'	: false,
					// 'color'		: (entry.name == 'Blue Side') ? '#0C173b' : '#410914',
					colorIndex  : (entry.name == 'Blue Side') ? 1 : 5,
					};

				//
				series.data.push(obj);

				// push result into data array players name index
				// series.data[key] = _.first(entry.result).sum;
				});

			// set categories on xaxis for chart
			// new_chart.xAxis.categories = categories;

			// push serios into chart
			new_chart.series.push(series);

			// create chart
			new_chart.series = _.values(new_chart.series);

			// create multichart
			var multichart = $multichart.get_new();
			self.chartdata[data_key] = multichart.create_chart(new_chart);
			},


		/* Helper */
		// is_any_filter_active : function(){
		// 	var self = this, is_active = false;

		// 	_.each(self.filter, function(f){

		// 		// if active, stop here
		// 		if(is_active || self.filter[f]) is_active = true;
		// 		});

		// 	// return status
		// 	return is_active;
		// 	},

		switch_list_sort : function(sort_order){
			var self = this;

			// if nothing changed, stop processing
			if(sort_order == self.filter.sort_current) return;

			// safe actual sort order
			self.filter.sort_current = self.filter.sort_order;

			self.data.reverse();

			// also expand first entry
			self.data[0].match_history_expanded = true;
			},

		switch_history_fold : function(unfold){
			var self = this;

			// define button text
			self.filter.unfold_button = (unfold) ? 'Alle einklappen' : 'Alle ausklappen';

			// set filter
			self.filter.unfold = unfold;

			// for each match in history
			_.each(self.data, function(e, index){

				// fold or unfold by filter
				e.match_history_expanded = unfold;
				});
			},

		change_filter : function(){
			var self = this;

			// check filter
			self.filter.player_full = (self.filter.player) ? _.findWhere(self.playerlist, {'ingame_name': self.filter.player}) : null;

			// check champion filter
			self.filter.champion_full = (self.filter.champion) ? _.findWhere(self.championlist, {'name': self.filter.champion}) : null;

			console.log(self.filter.champion_full);

			//
			if(!self.filter.champion_full){

				// destroy chart
				self.destroy_chart(2);
				}
			},

		reset_filter(filter, reload = false){
			var self = this;

			// if 'all' filters should be resetted
			if(filter == 'all'){

				// reset filters
				self.filter.player = null;
				self.filter.champion = null;
				self.filter.player_full = null;
				self.filter.champion_full = null;
				self.filter.date = null;

				// reset render limit
				self.filter.render_limit = 10;
				}

			// destroy (champion chart)
			self.destroy_chart(2);

			// if reload wanted
			if(reload) self.filter_match_history();
			},

		increase_render_limit : function(render_limit){
			var self = this;

			// increse limit to render limit
			self.filter.render_limit += render_limit;
			},

		destroy_chart : function(instance_int){
			var self = this, key;

			// define instance key
			key = 'instance_' + instance_int;

			// if available
			if(self[key]){

				// destroy chart and reset
				self[key].destroy();
				self[key] = null;
				}
			},

		redirect_template : function(param){
			var self = this;

			// and search for profile by ingame name
			$location.url('/all_player').search({ingame_name: param});
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init timeseries
		$scope.view.get_match_history();

		// load players and champs
		$scope.view.load_playerlist();
		$scope.view.load_championlist();

		// load charts
		$scope.view.get_timeserie_side_winrate();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});

	// watch on profile switch
	$scope.$watch('view.filter', function(oldval, newval){

		if(oldval.player_full && newval.player_full){

			console.log(oldval.player_full);
			console.log(newval.player_full);
			}

		// if nothing changed, stop here
		// if(oldval && newval && oldval.playerID == newval.playerID) return;

/*		if($scope.view.chartdata && $scope.view.chartdata.side_winrate) $scope.view.chartdata.side_winrate.unset();



		$scope.view.get_timeserie_side_winrate();*/
		});

	}]);
