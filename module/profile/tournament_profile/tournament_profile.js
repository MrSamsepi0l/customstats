'use strict';

angular.module('customstats').controller('customstats.tournament_profile_controller', ['$scope', '$app', '$leagueapi', '$phpdate', '$location', function($scope, $app, $leagueapi, $phpdate, $location){

	$scope.tournament_profile = {
		list 		: [],
		entry		: null,
		status		: null,
		translate_position : {
			'top'		: 'Toplaner',
			'jungle'	: 'Jungler',
			'mid'		: 'Midlaner',
			'adc'		: 'ADC',
			'support'	: 'Supporter',
			},
		title_config	: {
			},

		get_tournament_profile : function(playerID, tournamentID){
			var self = this, param;

			// define param
			param = {
				'playerID'		: playerID,
				'tournamentID'	: tournamentID,
				'with_analyze'	: true
				};

			// if playerID not given, return here
			if(!param.playerID) return self.status = 400;

			// if no tournamentID given, remove
			if(!param.tournamentID) delete(param.tournamentID);

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_profile', param, {
				200 : function(data){

					// for each team
					_.each(data.team_list, function(e){

						// extend entry
						e = _.extend(e, {
							substitute 	: _.contains(e.tag, 'substitute'),
							departed	: _.contains(e.tag, 'departed'),
							});
						});

					// set profile entry
					self.entry = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		get_config : function(project){
			var self = this, param, profile_data;

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

					// extract profile data
					profile_data = $app.board_get_value('data');

					// check for tournament playerID
					if(!_.isUndefined(profile_data.league) && !_.isUndefined(profile_data.league.tournament) && !_.isUndefined(profile_data.league.tournament.playerID)){

						// load profile
						self.get_tournament_profile(profile_data.league.tournament.playerID, 0); // no tournamentID
						}
					},
				'*' : function(data, status){
					}
				});
			},

		redirect_template : function(param){
			var self = this;

			// and search for profile by ingame name
			$location.url('/tournament_all_profile').search({ingame_name: param});
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init config loading
		$scope.tournament_profile.get_config(board_status.project);
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);

		// and append it to this even too
		// $scope.$on('$locationChangeSuccess', $scope.ui_review);
		});

	// watch on profile switch
	$scope.$watch('tournament_profile.entry', function(oldval, newval){

		// if nothing changed, stop here
		if(oldval && newval && oldval.playerID == newval.playerID) return;

		// else scroll to top
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		});

	}]);
