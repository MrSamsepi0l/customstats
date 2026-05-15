angular.module('customstats').controller('customstats.tournament_dashboard', ['$scope', '$filter', '$q', '$app', '$leagueapi', '$location', function($scope, $filter, $q, $app, $leagueapi, $location){

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
		filter 			: {
			match_history 	: {
				expand_all 	: false,
				team_list 	: [],
				team		: null,
				player_list : [],
				playerID	: null,
				}
			},

		load_tournament : function(){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: self.tournamentID,
				};

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take data
					self.tournament = data;
					},
				'*' : function(data, status){

					}
				});
			},

		load_schedule: function(){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: self.tournamentID,
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

		load_standings : function(){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: self.tournamentID,
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
						e.match_history_expanded = _.contains([0,1,2], idx);

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

					// take data
					self.match_history = data;
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