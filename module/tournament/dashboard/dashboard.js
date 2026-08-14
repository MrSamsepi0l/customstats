angular.module('customstats').controller('customstats.tournament_dashboard', ['$scope', '$filter', '$q', '$app', '$leagueapi', '$location', '$multichart', function($scope, $filter, $q, $app, $leagueapi, $location, $multichart){

	$scope.view = {
		list			: [],
		status 			: null,
		avg_duration	: 0.0,
		tournamentID	: null,
		match_history 	: [],
		standings		: [],
		schedule 		: [],
		image_base_url  : 'public/img/tournament/team_logo',
		filter 			: {
			match_history 	: {
				expand_all 	: false,
				team_list 	: [],
				team		: null,
				player_list : [],
				playerID	: null,
				},
			selected 		: {
				tournamentID: null,
				},
			},
		translate: {
			tournament_status: {
				scheduled: 'Scheduled',
				finished: 'Completed',
				regular_season: 'Regular Season',
				knockout: 'Knockout Phase',
				},
			},
		team_win_progression_chart : {},
		team_win_progression_chart_available: false,
		side_win_lose_chart: {},
		champion_presence_chart : {},
		knockout_bracket_collapsed: false,

		load_tournament : function(tournamentID){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				};

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take data
					self.tournament = data;

					// select tournament
					self.filter.selected.tournamentID = data.tournamentID;
					},
				'*' : function(data, status){

					}
				});
			},

		load_tournament_list : function(){
			var self = this, param;

			// define param
			param = {};

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take data
					self.tournament_list = data;
					},
				'*' : function(data, status){

					}
				});
			},

		load_schedule: function(tournamentID){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				};

			// load
			$leagueapi.send_request('customstats_tournament_api_get_schedule', param, {
				200 : function(data){

					// for each team
					_.each(data, function(e){

						// relative date start
						e.start_date = moment(e.estimatedDate_from).format('dddd, DD.MM.YYYY');
						e.start_time = moment(e.estimatedDate_from).format('HH:mm');
						e.start_date_relative = moment(e.estimatedDate_from).fromNow();

						// remove whitespace and lowercase
						e.team_one_name_converted = e.team_one_name.split(' ').join('').toLowerCase().replace(/'/g, "");
						e.team_two_name_converted = e.team_two_name.split(' ').join('').toLowerCase().replace(/'/g, "");

						// define full image url
						e.image_url_team_one = self.image_base_url + '/' + e.team_one_name_converted + '.png';
						e.image_url_team_two = self.image_base_url + '/' + e.team_two_name_converted + '.png';

						// check if image exists
						$app.does_image_exist(e.image_url_team_one).then(function(exists){

							// define if image exists
							e.image_exists_team_one = exists;
							});

						// check if image exists
						$app.does_image_exist(e.image_url_team_two).then(function(exists){

							// define if image exists
							e.image_exists_team_two = exists;
							});

						// if match in future - add to list
						if(new Date() <= new Date(e.estimatedDate_from)) self.schedule.push(e);
						});
					},
				'*' : function(data, status){

					}
				});
			},

		load_standings : function(tournamentID){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				};

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament_team', param, {
				200 : function(data){

					// for each team
					_.each(data, function(e){

						// convert to int
						e.times_played = parseInt(e.times_played);

						// remove whitespace and lowercase
						e.name_converted = e.name.split(' ').join('').toLowerCase().replace(/'/g, "");

						// define full image url
						e.image_url = self.image_base_url + '/' + e.name_converted + '.png';

						// check if image exists
						$app.does_image_exist(e.image_url).then(function(exists){

							// define if image exists
							e.image_exists = exists;
							});
						});

					// sort by times_won DESC, times_played DESC
					var sorted = $filter('orderBy')(data, ['-times_won', '-times_played']);

					// for each sorted
					_.each(sorted, function(e, idx){

						// default, rank to index + 1
						e.rank = idx + 1;

						// if not first entry and this team has won as many games as the team before - equal the rank
						if(idx > 0 && e.times_won == sorted[idx - 1].times_won) e.rank = sorted[idx - 1].rank;
						});

					// take data
					self.standings = sorted;
					},
				'*' : function(data, status){

					}
				});
			},

		load_match_history : function(tournamentID){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_match_history', param, {
				200 : function(data){

					// newest first
					data = data.reverse();

					// default
					var total_duration = 0.0;

					// for each match in history
					_.each(data, function(e, idx){

						// increment
						total_duration += parseFloat(e.duration);

						// default - collapse
						e.match_history_expanded = _.contains([0], idx);

						// if team not already added, add to unique list
						if(!_.contains(self.filter.match_history.team_list, e.team_one.name)) self.filter.match_history.team_list.push(e.team_one.name);
						if(!_.contains(self.filter.match_history.team_list, e.team_two.name)) self.filter.match_history.team_list.push(e.team_two.name);

						// for each player in first team
						_.each(e.team_one.stat_player_list, function(sp){

							// build data
							var p_data = {'playerID': sp.playerID, 'ingame_name': sp.ingame_name, 'team_name': e.team_one.name};

							// if not already added
							if(!_.find(self.filter.match_history.player_list, {'playerID': sp.playerID})) self.filter.match_history.player_list.push(p_data);
							});

						// for each player of second team
						_.each(e.team_two.stat_player_list, function(sp){

							// build data
							var p_data = {'playerID': sp.playerID, 'ingame_name': sp.ingame_name, 'team_name': e.team_two.name};

							// if not already added
							if(!_.find(self.filter.match_history.player_list, {'playerID': sp.playerID})) self.filter.match_history.player_list.push(p_data);
							});

						// remove whitespace and lowercase
						e.team_one.name_converted = e.team_one.name.split(' ').join('').toLowerCase().replace(/'/g, "");
						e.team_two.name_converted = e.team_two.name.split(' ').join('').toLowerCase().replace(/'/g, "");

						// define full image url
						e.team_one.image_url = self.image_base_url + '/' + e.team_one.name_converted + '.png';
						e.team_two.image_url = self.image_base_url + '/' + e.team_two.name_converted + '.png';

						// check if image exists
						$app.does_image_exist(e.team_one.image_url).then(function(exists){

							// define if image exists
							e.team_one.image_exists = exists;
							});

						// check if image exists
						$app.does_image_exist(e.team_two.image_url).then(function(exists){

							// define if image exists
							e.team_two.image_exists = exists;
							});
						});

					// calculate avg game duration
					self.avg_duration = total_duration / _.size(data);

					// take data
					self.match_history = data;

					// render chart
					self.render_team_win_progression_chart();
					self.render_win_lose_chart();
					self.render_champion_presence_chart();
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		build_dashboard : function(tournamentID){
			var self = this;

			// load tournament dashboard data
			$scope.view.load_tournament(tournamentID);
			$scope.view.load_schedule(tournamentID);
			$scope.view.load_standings(tournamentID);
			$scope.view.load_match_history(tournamentID);
			},

		get_config : function(project){
			var self = this, param;

			// set param
			param = {
				'project'	: project,
				};

			// load
			$app.send_base_request('customstats_base_get_config', param, {
				200 : function(data){

					// take data
					self.config = data;

					// if tournament config defined
					if(!_.isUndefined(data.param.base_config.tournament)){

						// take data from config
						self.current_tournamentID = data.param.base_config.tournament.current_tournamentID;

						// if tournament found
						if(self.current_tournamentID){

							// load tournament dashboard data
							self.build_dashboard(self.current_tournamentID);
							}
						}
					},
				'*' : function(data, status){

					// no status to avoid loading abortion
					}
				});
			},

		filter_match_history : function(entry, idx, list){
			var self = $scope.view;

			// filter by team
			if(self.filter.match_history.team !== null && (self.filter.match_history.team != entry.team_one.name && self.filter.match_history.team != entry.team_two.name)) return false;

			// filter by player
			if(self.filter.match_history.playerID !== null && (!_.contains(entry.team_one.playerID_list, self.filter.match_history.playerID) && !_.contains(entry.team_two.playerID_list, self.filter.match_history.playerID))) return false;

			// render everything by default
			return true;
			},

		match_history_toggle_expand : function(expand){
			var self = this;

			// for each match in history
			_.each(self.match_history, function(e){

				// expand/collapse all matches
				e.match_history_expanded = expand;
				});
			},

		redirect_template : function(template, param){
			var self = this;

			// redirect to all tournament players tab
			if(template == 'tournament_all_profile'){

				// and search for profile by ingame name
				$location.url('/tournament_all_profile').search({ingame_name: param});
				}
			},

		render_team_win_progression_chart : function(change_config){
			var self = this,
				series = null,
				new_chart = angular.merge({
					chart: {
						height: 300,
						width: 850,
					    type: 'line',
						},
				    title: {
				        text: 'Team performance over played games',
				        align: 'left',
						style: {
							fontSize: '0.75rem',
							color: '#666666',
							},
						y: 5,
				    	},
					xAxis: {
						minTickInterval: 1,
						tickLength: 0,
						title: {
							text: 'Games played',
							style: {
								fontStyle: 'italic',
								},
							},
						},
				    yAxis: {
				        title: {
				        	text: 'WINS',
				        	}
				    	},
					tooltip: {
						shared: true,
						headerFormat: '<b style="color:#8fa3b0">{point.key} Games</b><br/>',
						pointFormat: '<span style="color:{series.color}">●  {series.name}:</span> <b style="color:#8fa3b0"> {point.y}</b><br/>'
						},
				    legend: {
						enabled: true,
						align: 'right',
						verticalAlign: 'middle',
						layout: 'vertical',
						itemStyle: {
							fontSize: '12px',
							color: '#9d9d9d',
							},
						margin: 30,
						},
					plotOptions: {
						series: {
							pointStart: 0,
							cursor: 'pointer',
							marker: {
								enabled: false,
								states: {
									hover: {
										enabled: true
										}
									}
								},
							label: {
								color: '#fff',
								enabled: true,
								connectorAllowed: false // Optional: removes connector line
								},
							showInLegend: true,
							states : {
								hover : {
									enabled: false,
									}
								},
							line: {
								dashstyle: 'Solid',
								linecap: 'square',
								},
							},
						},
					series: [],
					}, change_config);

			// default
			render_data = {};

			// get match history (back in correct order from beginning first)
			var rawdata = angular.copy(self.match_history).reverse();

			// dash style list / color style list
			const dash_list = ["Solid", "ShortDash", "ShortDot", "ShortDashDot", "ShortDashDotDot", "Dot", "Dash", "LongDash"];
			const color_list = ["#14B8A6", "#06B6D4", "#3B82F6", "#8B5CF6", "#A855F7", "#D946EF", "#64748B"];

			// for each game
			_.each(rawdata, function(match){

				// set default
				if(!render_data[match.team_one.name]){

					// take random dash/color index
					var rand_dash_idx = Math.floor(Math.random() * dash_list.length);
					var rand_color_idx = Math.floor(Math.random() * color_list.length);

					// add
					render_data[match.team_one.name] = {
						times_won: 0,
						data: [0],
						color: color_list.splice(rand_color_idx, 1)[0],
						dashstyle: dash_list.splice(rand_dash_idx, 1)[0],
						};
					}

				// set default
				if(!render_data[match.team_two.name]){

					var rand_dash_idx = Math.floor(Math.random() * dash_list.length);
					var rand_color_idx = Math.floor(Math.random() * color_list.length);

					render_data[match.team_two.name] = {
						times_won: 0,
						data: [0],
						color: color_list.splice(rand_color_idx, 1)[0],
						dashstyle: dash_list.splice(rand_dash_idx, 1)[0],
						};
					}

				//
				if(match.winner_teamID == 1) render_data[match.team_one.name].times_won++;
				render_data[match.team_one.name].data.push(render_data[match.team_one.name].times_won);


				if(match.winner_teamID == 2) render_data[match.team_two.name].times_won++;
				render_data[match.team_two.name].data.push(render_data[match.team_two.name].times_won);
				});

			// if standings loaded already
			if(self.standings){

				// loop through each team
				_.each(self.standings, function(standing){

					// take random dash/color index
					var rand_dash_idx = Math.floor(Math.random() * dash_list.length);
					var rand_color_idx = Math.floor(Math.random() * color_list.length);

					// if team has no games in match history
					if(!standing.times_played) render_data[standing.name] = {
						times_won: 0,
						data: [0],
						color: color_list.splice(rand_color_idx, 1)[0],
						dashstyle: dash_list.splice(rand_dash_idx, 1)[0],
						};
					});
				}

			// if no data available
			if(_.isEmpty(render_data)) return;

			// there is a chart to be rendered
			self.team_win_progression_chart_available = true;

			_.each(render_data, function(e, name){

				series = {
					name: name,
					data: e.data,
					color: e.color,
					dashStyle: e.dashstyle,
					dataLabels: {
					    enabled: true,
					    useHTML: true,
					    allowOverlap: true,
					    crop: false,

					    formatter: function () {
					        if (this.point.index === this.series.data.length - 1) {
					            return `<span style="color:${this.series.color}">
					                        ${this.series.name}
					                    </span>`;
					        }
					        return null;
					    },

					    align: 'left',
					    x: 10
					}
					};

				new_chart.series.push(series);
				});

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.team_win_progression_chart = multichart.create_chart(new_chart);
			},

		render_win_lose_chart : function(change_config){
			var self = this,
				times_played = self.match_history.length;

			// if no games played, return here
			if(!times_played) return;

			// default
			var chartdata = {
				'blue_side'	: {
					'times_won'	: 0,
					'winrate'	: 0,
					},
				'red_side'	: {
					'times_won'	: 0,
					'winrate'	: 0,
					},
				};

			_.each(self.match_history, function(e){

				// increment by won side
				if(e.winner_teamID == 1) chartdata.blue_side.times_won++;
				if(e.winner_teamID == 2) chartdata.red_side.times_won++;
				});

			// calculate winrates
			chartdata.blue_side.winrate = (chartdata.blue_side.times_won / times_played * 100).toFixed(1);
			chartdata.red_side.winrate = (chartdata.red_side.times_won / times_played * 100).toFixed(1);

			var	series = null,
				new_chart = angular.merge({
					chart: {
						height: 300,
						width: 300,
					    type: 'pie',
						},
					accessibility: {
						point: {
							valueSuffix: '%',
							},
						},
					title: {
						text: '<span style="color: #666666; font-size: 0.75rem; letter-spacing: 1px">Matches Played <br/><span style="color: #fff; font-size: 1.6rem">'+times_played+'</span></span>',
						useHTML: true,
						y: 10,
						},
			        subtitle: {
			            text:   '<span style="font-size: 1.3rem; color: #0498cb; letter-spacing: 1px">'+chartdata.blue_side.winrate+' %</span>'
			            		+'<hr style="width: 100%; margin-top: 0.2rem; margin-bottom: 0.2rem; margin-right: 0; background-color: #2f2f5d" />'
			            		+'<span style="font-size: 1.0rem; color: #6b2c3c; letter-spacing: 1px">'+chartdata.red_side.winrate+' %</span>'
			            		+'<br>'
			            		+'<span style="font-size: 0.8rem"> Winrate</span>',
			            floating: true,
			            useHTML: true,
			            verticalAlign: 'middle',
			            y: 40
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
									distance: 20,
									format: '{point.name}',
					                style: {
					                    fontSize: '0.7em',
					                    color: '#9d9d9d',
					                	}
									},
								{
								enabled: true,
								distance: -11,
								format: '{point.y:.0f}',
								style: {
									fontSize: '0.8em'
									},
								}],
							showInLegend: true
							},
						pie: {
							size: 175,
							borderRadius: 0,
							},
						},
					series: [],
					}, change_config);

			// create series
			series = {
				'name': 'Games played',
				'colorByPoint': true,
				'innerSize': '75%',
				'colorIndex': 50,
				'data'		: [
					{name: 'Blue side', y: chartdata.blue_side.times_won, colorIndex: 53},
					{name: 'Red side', y: chartdata.red_side.times_won, colorIndex: 54},
					],
				};

			// add series to chart
			new_chart.series.push(series);

			// take series values
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.side_win_lose_chart = multichart.create_chart(new_chart);
			},

		render_champion_presence_chart : function(change_config){
			var self = this, champs_played = 0, champs_banned = 0, total_games = self.match_history.length;

			// if no games played, stop
			if(!total_games) return;

			// default
			var chartdata = {};

			// for each match in history
			_.each(self.match_history, function(match){

				// merge ban lists of both teams
				var ban_list = match.team_one.ban_list.concat(match.team_two.ban_list);

				// for all bans of both teams
				_.each(ban_list, function(ban){

					// if not set already
					if(!chartdata[ban.championID]){

						// init data here
						chartdata[ban.championID] = {
							'name'			: ban.champion,
							'converted'		: ban.champion_converted,
							'times_won'		: 0,
							'times_picked'	: 0,
							'times_banned'	: 0,
							'total_presence': 0,
							};

						// unique champs banned
						champs_banned++;
						}

					// increment stats
					chartdata[ban.championID].times_banned++;
					chartdata[ban.championID].total_presence++;
					});

				// convert objects to array
				match.team_one.stat_player_list = _.toArray(match.team_one.stat_player_list);
				match.team_two.stat_player_list = _.toArray(match.team_two.stat_player_list);

				// merge player stat list of both teams
				var stat_list = match.team_one.stat_player_list.concat(match.team_two.stat_player_list);

				// for each players stat of both teams
				_.each(stat_list, function(stat){

					// if not set already
					if(!chartdata[stat.championID]){

						// init data here
						chartdata[stat.championID] = {
							'name'			: stat.champion_name,
							'converted'		: stat.name_converted,
							'times_won'		: 0,
							'times_picked'	: 0,
							'times_banned'	: 0,
							'total_presence': 0,
							};

						// unique champs played
						champs_played++;
						}

					// increment stats
					chartdata[stat.championID].times_picked++;
					chartdata[stat.championID].total_presence++;

					// if won, increment aswell
					if(stat.has_won) chartdata[stat.championID].times_won++;
					});
				});

			// take top 10 most present champions
			chartdata = _.sortBy(chartdata, 'total_presence').reverse();

			// take top 10
			chartdata = _.first(chartdata, 10);

			var	series = null,
				new_chart = angular.merge({
					chart: {
						height: 300,
						width: 400,
					    type: 'pie',
						},
					accessibility: {
						point: {
							valueSuffix: '%',
							},
						},
					title: {
						text: '<span style="color: #666666; font-size: 0.75rem; letter-spacing: 1px">Champion Presence - Top 10</span>',
						useHTML: true,
						y: 10,
						},
			        subtitle: {
			            text:   '<span style="font-size: 0.7rem; letter-spacing: 1px">Total unique</span><br/>'
			            		+'<span style="font-size: 1.0rem; color: #fff; letter-spacing: 1px">'+champs_played+' played</span>'
			            		+'<hr style="width: 100%; margin-top: 0.2rem; margin-bottom: 0.2rem; margin-right: 0; background-color: #2f2f5d" />'
			            		+'<span style="font-size: 0.9rem; color: #6b2c3c; letter-spacing: 1px">'+champs_banned+' banned</span>'
			            		+'<br>',
			            floating: true,
			            useHTML: true,
			            verticalAlign: 'middle',
			            y: 30
			        	},
					tooltip: {
						headerFormat: '<b style="color:#8fa3b0">{point.name}</b><br/>',
						pointFormat: '<span style="color:{series.color}">●  Total presence:</span> <b style="color:#8fa3b0"> {point.total_presence} / '+total_games+' Games</b><br/>'
									+'<span style="color:#14b8a6">●  Games picked:</span> <b style="color:#14b8a6"> {point.times_picked} x</b><br/>'
									+'<span style="color:#ffafba">●  Games banned:</span> <b style="color:#ffafba"> {point.times_banned} x</b><br/>'
									+'<span style="color:#2caffe">●  Winrate:</span> <b style="color:#2caffe"> {point.total_winrate} %</b><br/>',
					   	// backgroundColor: 'rgba(255,255,255,1)', // must be 1.0
						style: {
							color: '#fff',
							fontSize: '0.7rem',
							opacity: 1.0,
							},
					},
					legend: {
						enabled: false
						},
					plotOptions: {
						series: {
							allowPointSelect: false,
							cursor: 'pointer',
							showInLegend: false
							},
						pie: {
							size: 150,
							borderWidth: 2,
							borderRadius: 0,
				            dataLabels: {
				                enabled: true,
				                distance: 35,
				                connectorWidth: 1,
				                connectorColor: '#596180',
				                softConnector: false,

				                useHTML: true,
				                crop: false,
				                overflow: 'allow',

				                formatter: function () {
				                    return `
				                        <div class="pie-label">
				                            <div class="pie-percent">
				                    			${Highcharts.numberFormat(this.point.total_presence_rate, 1)} %
				                            </div>

				                            <div class="pie-name">
				                                ${this.point.name}
				                            </div>
				                        </div>
				                    `;
				                }
				            },
							},
						},
					series: [],
					}, change_config);

			// create series
			series = {
				'name': 'Games played',
				'colorByPoint': true,
				'innerSize': '80%',
				'data'		: [],
				};

			// for each champion
			_.each(chartdata, function(e, idx){

				// calculate total presence rate (against all games)
				e.total_presence_rate = e.total_presence / total_games * 100;

				// calculate total winrate (against all games)
				e.total_winrate = (e.times_picked > 0) ? (e.times_won / e.times_picked * 100) : "No games";

				var data = {
					'name'			: e.name,
					'y'				: e.total_presence,
					'converted'		: e.name_converted,
					'times_picked'	: e.times_picked,
					'times_banned'	: e.times_banned,
					'total_presence': e.total_presence,
					'total_presence_rate': e.total_presence_rate,
					'total_winrate'	: e.total_winrate.toFixed(1),
					'colorIndex'	: 70 + idx, // starts from 70 (purple palette)
					};

				// add to data
				series.data.push(data);
				});

			// add series to chart
			new_chart.series.push(series);

			// take series values
			new_chart.series = _.values(new_chart.series);

			// create single multichart
			var multichart = $multichart.get_new();

			// define global chartdata
			self.champion_presence_chart = multichart.create_chart(new_chart);
			},

		};

	// initialize
	$scope.ui_review = function(board_status){

		// init config loading
		$scope.view.get_config(board_status.project);

		// load list of ALL tournaments
		$scope.view.load_tournament_list();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});
	}]);