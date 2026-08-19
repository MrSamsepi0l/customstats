angular.module('customstats').controller('customstats.tournament_team', ['$scope', '$filter', '$q', '$app', '$leagueapi', '$location', '$multichart', function($scope, $filter, $q, $app, $leagueapi, $location, $multichart){

	$scope.view = {
		team_list 		: [],
		tournament_list	: [],
		image_base_url  : 'public/img/tournament/team_logo',
		filter 			: {
			tournamentID: null,
			},
		translate_status: {
			'scheduled'	: 'Scheduled',
			'finished'	: 'Completed',
			'regular_season': 'Regular Season',
			'knockout'	: 'knockout',
			},

		load_tournament_list : function(){
			var self = this, param;

			// define param
			param = {};

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take data
					self.tournament_list = data.reverse();

					// group by tournamentID
					self.tournament_list_tID = _.indexBy(self.tournament_list, 'tournamentID');
					},
				'*' : function(data, status){

					}
				});
			},

		load_team_list : function(){
			var self = this, param;

			// define param
			param = {};

			// load
			$leagueapi.send_request('customstats_tournament_api_get_team_metric', param, {
				200 : function(data){

					// convert to indexed list
					const metric = _.indexBy(data.metric, 'teamID');

					_.each(data.team_list, function(e){

						_.each(e.playerlist, function(p){

							p.departed = _.contains(p.tag, 'departed');
							p.substitute = _.contains(p.tag, 'substitute');
							});

						// define full image url
						e.image_url = self.image_base_url + '/' + metric[e.teamID].team_name_converted + '.png';

						// check if image exists
						$app.does_image_exist(e.image_url).then(function(exists){

							// define if image exists
							e.image_exists = exists;
							});

						// extend by metric
						_.extend(e, metric[e.teamID]);
						});

					// take data
					self.team_list = data.team_list;

					self.team_list_groups = $filter('groupBy')(self.team_list, 'tournamentID');
					self.tournamentID_list = _.sortBy(Object.keys(self.team_list_groups), id => -id);
					},
				'*' : function(data, status){

					}
				});
			},

		filter_list : function(tournamentID){

			// define self
			var self = $scope.view;

			// filter by tournament
			if(self.filter.tournamentID !== null && self.filter.tournamentID != tournamentID) return false;

			// allow everything else
			return true;
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

		// load lists
		$scope.view.load_tournament_list();
		$scope.view.load_team_list();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});
	}]);