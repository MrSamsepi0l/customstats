angular.module('customstats').controller('customstats.tournament_dashboard', ['$scope', '$filter', '$q', '$app', '$leagueapi', function($scope, $filter, $q, $app, $leagueapi){

	$scope.view = {
		list			: [],
		entry			: null,
		status 			: null,
		current_phase 	: null,
		tournamentID	: null,
		match_history 	: [],
		standings		: [],
		schedule 		: [],
		image_base_url  : 'public/img/tournament/team_logo',

		load_tournament : function(){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: self.tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take data
					self.tournament = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		load_schedule: function(){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: self.tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_schedule', param, {
				200 : function(data){

					// for each team
					_.each(data, function(e){

						// define full image url
						e.image_url = self.image_base_url + '/' + e.name_converted + '.png';

						// check if image exists
						$app.does_image_exist(e.image_url).then(function(exists){

							// define if image exists
							e.image_exists = exists;
							});

						// remove whitespace and lowercase
						e.team_one_name_converted = e.team_one_name.split(' ').join('').toLowerCase();
						e.team_two_name_converted = e.team_two_name.split(' ').join('').toLowerCase();

						// if match in future - add to list
						if(new Date() <= new Date(e.estimatedDate_from)) self.schedule.push(e);
						});
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		load_standings : function(){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: self.tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament_team', param, {
				200 : function(data){

					// for each team
					_.each(data, function(e){

						// convert to int
						e.times_played = parseInt(e.times_played);

						// remove whitespace and lowercase
						e.name_converted = e.name.split(' ').join('').toLowerCase();

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
					self.status = status;
					}
				});
			},

		load_match_history : function(){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: self.tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_match_history', param, {
				200 : function(data){

					// newest first
					data = data.reverse();

					// for each match in history
					_.each(data, function(e, idx){

						// default - collapse
						e.match_history_expanded = (idx === 0);
						});

					// take data
					self.match_history = data;

					console.log(data);
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
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
						self.tournamentID = data.param.base_config.tournament.current_tournamentID;
						self.current_phase = data.param.base_config.tournament.current_phase;

						// if tournament found
						if(self.tournamentID){

							// load tournament dashboard data
							$scope.view.load_tournament();
							$scope.view.load_schedule();
							$scope.view.load_standings();
							$scope.view.load_match_history();
							}
						}
					},
				'*' : function(data, status){

					// no status to avoid loading abortion
					}
				});
			},
		};

	// initialize
	$scope.ui_review = function(board_status){

		// init config loading
		$scope.view.get_config(board_status.project);
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});
	}]);