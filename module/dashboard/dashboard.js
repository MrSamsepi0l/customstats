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
				'from'			: '-11 months',
				'to'			: '+1 month',
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
					        align: 'left',
					        style: {'fontSize':'0.9rem','color':'whitesmoke'}
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
							styledMode: false,
							},
					    title: {
					        text: 'Banned Champions',
					        align: 'left'
					    	},
					    subtitle: {
					        text: 'The 5 most banned champions in the last 25 games',
					        align: 'left'
					    	},
						xAxis: {
							visible	: true,
							labels : {
								useHTML: true,
								formatter: function(){
									return '<div class="ta-center" style="display:flex; flex-direction: row; align-items: center">'
											+'<div class="icon-champion '+self.get_champion_name_formatted(this.value)+'" style="background-size: contain;"></div>'
											+'<span style="margin-left: 5px; color: #ff3377">' + this.value + '</span>'
											+'</div>'
									},
								},
							lineColor: '#ff3377',
							lineWidth: 1,
							},
						yAxis: {
							labels: {
								style: {
									color: '#ff3377',
 									}
								},
							},
						plotOptions: {
							column: {
								lineWidth: 1, lineColor: "#aafff7",
								marker: {lineWidth: 1, lineColor: "#aafff7"}
								},
							series: {
								pointWidth: 100
								}
							},
						seriesTitle: 'Times banned',
						seriesColor: '#ff3377',
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
					        text: 'The 5 most played champions in the last 25 games',
					        align: 'left'
					    	},
						xAxis: {
							lineColor: '#88d8b0',
							visible	: true,
							labels : {
								useHTML: true,
								formatter: function(){
									return '<div class="ta-center" style="display:flex; flex-direction: row; align-items: center">'
											+'<div class="icon-champion '+self.get_champion_name_formatted(this.value)+'" style="background-size: contain;"></div>'
											+'<span style="margin-left: 5px; color: #88d8b0">' + this.value + '</span>'
											+'</div>'
									},
								},
							},
						yAxis: {
							labels: {
								style: {
									color: '#88d8b0',
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
								pointWidth: 100
								}
							},
						seriesTitle: 'Times Played',
						seriesColor: '#88d8b0',
						color_by_point: false,
						}, 'played_champs');
					},
				'*' : function(data, status){
					}
				});
			},

		get_timeserie_game_duration : function(){
			var self = this,
				new_chart;

			// define param
			var param = {
				'type'			: 'duration',
				'run'			: 'dashboard',
				'range_num'		: 1000,
				'category'		: 'date',
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// render timeserie
					new_chart = {
				    	chart : {
				    		height: 225,
				    		},
						title: {
							text: 'Game Duration Distribution',
							align: 'left',
							style: {'fontSize':'0.9rem','color':'whitesmoke'}
							},
						subtitle: {
							text: 'of all '+_.size(data)+' custom games',
							align: 'left',
							},
						xAxis: [
							{title: {}, labels: { format: '{value:.0f} min'}},
							],
						yAxis: [
							{title: {text: 'Games'}},
							{visible: false, min: -1, max: 1}
							],
						plotOptions: {
							series : {
								pointWidth: 20,
								}
							},
						tooltip: {
							useHTML: true,
						    pointFormatter: function(){
						        const start = this.x.toFixed(1);
						        const end = this.x2.toFixed(1);
						        return `<div style="padding:4px 0;">
						        	<span style="font-weight: 200; font-size: 11px;">Duration Range</span><br/>
									<span style="font-weight: 200; color: #888">${start} – ${end} min</span><br>
									<span style="font-size: 14px">Games: <b style="font-size: 13px">${this.y}</b></span>
									</div>`;
						        },
							style: {
								color: 'var(--light-blue-gray-1)',
								fontSize: '0.8rem'
								},
							},
				        series: [
				        	{
				            	name: 'Games played',
				            	type: 'histogram',
				            	data,
				            	zIndex: 1,
				            	opacity: 0.9,
				            	},
				            {
				            	name: 'Observations',
				            	type: 'scatter',
				            	data: data.map(x => [x, 0]), // Data is one dimensional with values being displayed on the x-axis
				            	yAxis: 1,
				            	marker: {
				                	radius: 1.5
				            		},
				            	jitter: {
				                	y: 1
				            		},
				            	opacity: 0.5,
				            	enableMouseTracking: false
				        		},
				        	],
				    	};

					// create multichart
					var multichart = $multichart.get_new();
					self.chartdata['duration'] = multichart.create_chart(new_chart);
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
					tooltip: {
						style: {
							color: 'var(--light-blue-gray-1)',
							fontSize: '0.8rem'
							},
						},
					series: [],
					withTrend: false,
					}, change_config);

			// create series object
			series = {
				'name'			: new_chart.seriesTitle ?? '',
				'color'			: new_chart.seriesColor ?? '#255958',
				'data'			: Array(categories_length).fill(0),
				'colorByPoint'	: !_.isUndefined(new_chart.color_by_point) ? new_chart.color_by_point : false,
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

		/* Helper */
		get_champion_name_formatted : function(champion){
			var self = this;

			// return champion name without spaces and lowercase
			return (champion.split(' ').join('')).toLowerCase();
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
