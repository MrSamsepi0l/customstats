'use strict';

angular.module('customstats').controller('customstats.dashboard_controller', ['$scope', '$app', '$phpdate', '$multichart', '$regression', '$leagueapi', function($scope, $app, $phpdate, $multichart, $regression, $leagueapi){

	$scope.view = {
		data			: [],
		game_analysis   : null,
		chartdata		: {},

		get_game_analysis : function(){
			var self = this, param;

			// set param
			param = {};

			// load
			$leagueapi.send_request('customstats_get_dashboard_information', param, {
				200 : function(data){

					// take data
					self.game_analysis = data;
					},
				'*' : function(data, status){

					}
				});
			},

		get_timeserie_games_played : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'times_played',
				'run'			: 'bestof',
				'step'			: '+1 month',
				'category'		: 'date',
				'from'			: '-12 months',
				'range_num'		: 1000,
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data;

					// render timeserie
					self.render({
						chart : {
							type: 'line',
							},
					    title: {
					        text: 'Total Games Played',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'in the last 12 months',
					        align: 'left'
					    	},
						xAxis: {
							visible: true
							},
						yAxis: {
							min: 0
							},
						withTrend: true,
						trendColor: '#8fffdd',
						seriesTitle: 'Games Played this month',
						}, 'games_played');
					},
				'*' : function(data, status){

					}
				});
			},

		get_timeserie_kills : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'kills',
				'run'			: 'dashboard',
				'range_num'		: 25,
				'category'		: 'date',
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data.reverse();

					// render timeserie
					self.render({
						chart : {
							type: 'area',
							},
					    title: {
					        text: 'Average Kills/Deaths per Game',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'last 25 games all players combined',
					        align: 'left'
					    	},
						xAxis: {
							visible: false
							},
						yAxis: {
							labels: {
								style: {
									color: '#103f7a',
									},
								},
							},
						plotOptions : {
							area : {
								stacking : null,
								lineWidth: 1, lineColor: "#103f7a",
								marker: {
									enabled: false
									},
								},
							},
						withTrend: true,
						trendColor: '#8fbcf2',
						seriesColor: '#071c38',
						seriesTitle: 'Average Kills',
						}, 'kills');
					},
				'*' : function(data, status){

					}
				});
			},

		get_timeserie_assists : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'assists',
				'run'			: 'dashboard',
				'range_num'		: 25,
				'category'		: 'date',
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data.reverse();

					// render timeserie
					self.render({
						chart : {
							type: 'area',
							},
					    title: {
					        text: 'Average Assists per Game',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'last 25 games all players combined',
					        align: 'left'
					    	},
						xAxis: {
							visible: false
							},
						plotOptions : {
							area : {
								stacking : null,
								lineWidth: 1, lineColor: "#276362",
								marker: {
									enabled: false
									},
								},
							},
						withTrend: true,
						trendColor: '#8fbcf2',
						seriesColor: '#173635',
						seriesTitle: 'Average Assists',
						}, 'assists');
					},
				'*' : function(data, status){

					}
				});
			},

		get_timeserie_creep_score : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'cs',
				'run'			: 'dashboard',
				'range_num'		: 25,
				'category'		: 'date',
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data.reverse();

					// render timeserie
					self.render({
						chart : {
							type: 'spline',
							},
					    title: {
					        text: 'Average Creep Score per Game',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'last 25 games all players combined (excluding supporters)',
					        align: 'left'
					    	},
						xAxis: {
							visible: false
							},
						withTrend: true,
						trendColor: '#8fbcf2',
						seriesTitle: 'Average Creep Score',
						}, 'cs');
					},
				'*' : function(data, status){

					// reset status
					self.status = status;
					}
				});
			},

		get_timeserie_banned_champs : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'times_banned',
				'run'			: 'dashboard',
				'range_num'		: 25,
				'category'		: 'date',
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data;

					// render timeserie
					self.render({
						chart : {
							type: 'column',
							},
					    title: {
					        text: 'Banned Champions',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'The 10 most banned champions in the last 25 games',
					        align: 'left'
					    	},
						xAxis: {
							visible	: true
							},
						yAxis: {
							labels: {
								style: {
									color: '#82b0bd',
 									}
								},
							},
						plotOptions: {
							column: {
								lineWidth: 1, lineColor: "#aafff7",
								marker: {lineWidth: 1, lineColor: "#aafff7"}
								},
							series: {
								pointWidth: 50
								}
							},
						seriesTitle: 'Times banned',
						seriesColor: '#82b0bd',
						}, 'banned_champs');
					},
				'*' : function(data, status){
					}
				});
			},

		get_timeserie_played_champs : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'times_played',
				'run'			: 'dashboard',
				'range_num'		: 25,
				'category'		: 'date',
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data;

					// render timeserie
					self.render({
						chart : {
							type: 'column',
							 // marginRight: 120
							},
					    // tooltip: {
					    //     pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
					    // },
						// legend: {
					    //     align: 'right',
					    //     verticalAlign: 'top',
					    //     layout: 'vertical',
					    //     enabled: true,
					    //     backgroundColor: '#FFFFFF',
						// 	},
					    title: {
					        text: 'Played Champions',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'The 10 most played champions in the last 25 games',
					        align: 'left'
					    	},
						xAxis: {
							visible	: true
							},
						yAxis: {
							labels: {
								style: {
									color: '#788ca1',
 									}
								},
							},
						plotOptions: {
							column: {
								lineWidth: 1, lineColor: "#788ca1",
								marker: {lineWidth: 1, lineColor: "#788ca1"}
								},
					        // pie: {
					        //     allowPointSelect: true,
					        //     cursor: 'pointer',
					        //     dataLabels: {
					        //         enabled: false
					        //     },
					        //     showInLegend: true
					        // 	},
							series: {
								pointWidth: 50
								}
							},
						seriesTitle: 'Times Played',
						seriesColor: '#6b7b8c',
						}, 'played_champs');
					},
				'*' : function(data, status){
					}
				});
			},

		get_timeserie_game_duration : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'duration',
				'run'			: 'dashboard',
				'category'		: 'date',
				'range_num'		: 50,
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data.reverse();

					// render timeserie
					self.render({
						chart : {
							type: 'area',
							},
					    title: {
					        text: 'Game Duration Trend',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'in the last 50 games',
					        align: 'left'
					    	},
						xAxis: {
							visible: false
							},
						yAxis: {
							min: 10,
							labels: {
								format: '{value} min',
					        	style : {
					        		color: '#522150',
					        		},
								},
							},
						plotOptions: {
							area: {
								lineWidth: 1, lineColor: "#522150",
								marker: {
									enabled: false
									},
								}
							},
						withTrend: true,
						trendColor: '#d6a5d5',
						seriesColor: '#1c0c1c',
						seriesTitle: 'Game duration',
						seriesKey: 'duration',
						}, 'duration');
					},
				'*' : function(data, status){

					}
				});
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
						text: 'Custom Games AVG Kills (last 25 Games)',
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
				'color'	: new_chart.seriesColor ?? '#255958',
				'data'	: Array(categories_length).fill(0),
				};

				// for each timeserie player
			_.each(data, function(entry, key){

				// get date
				categories.push(entry.name);

				// skip undefined, null entries
				if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

				// push result into data array players name index
				series.data[key] = _.first(entry.result).sum;
				});

			// set categories on xaxis for chart
			new_chart.xAxis.categories = categories;

			// push serios into chart
			new_chart.series.push(series);

			// if trend line wanted
			if(new_chart.withTrend){

				// fill default
				var data_tmp = Array(categories_length).fill(0);

				// for each series and its data
				_.each(new_chart.series, function(serie){
					_.each(serie.data, function(e, i){

						// skip (current day, hour or 10 min and future)
						if(typeof data_tmp[i] == 'undefined') return;

						// sum value
						data_tmp[i] += e;
						});
					});

				// default
				var fill_until = null;

				// calculating regression for new data (total of all series)
				var result = $regression.linear(data_tmp, fill_until);

				// set name
				result.name = 'Trend (Gesamt)';

				// set trend series
				new_chart.series['Trend'] = {
					"name"		: result.name,
					"color"		: new_chart.trendColor ?? '#a96be3',
					"data"		: result.series_data,
					"stacking"	: undefined,
					"type"		: 'spline',
					"marker"	: {enabled: false},
					"enableMouseTracking" : false,
					};
				}

			// create chart
			new_chart.series = _.values(new_chart.series);

			// create multichart
			var multichart = $multichart.get_new();
			self.chartdata[data_key] = multichart.create_chart(new_chart);
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init timeseries
		$scope.view.get_game_analysis();
		$scope.view.get_timeserie_kills();
		$scope.view.get_timeserie_assists();
		$scope.view.get_timeserie_games_played();
		$scope.view.get_timeserie_creep_score();
		$scope.view.get_timeserie_banned_champs();
		$scope.view.get_timeserie_played_champs();
		$scope.view.get_timeserie_game_duration();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});

	}]);
