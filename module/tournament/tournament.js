angular.module('customstats').controller('customstats.tournament_controller', ['$scope', '$app', '$leagueapi', function($scope, $app, $leagueapi){

	$scope.tab = 'overview';

	$scope.view = {

		// tournament
		tournament_list		: [],
		tournament_entry	: null,
		tournament_type		: 'regular_season',

		// tournament team
		team_list			: [],
		team_entry			: null,

		// tournament player
		player_entry		: null,

		// basic
		status 				: null,
		role_translation 	: {
			'top'	 : 'Toplane',
			'jungle' : 'Jungle',
			'mid'	 : 'Midlane',
			'adc'	 : 'Botlane',
			'support': 'Support',
			},

		get_tournament : function(){
			var self = this, param;

			// define param
			param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take data
					self.tournament_list = data;
					},
				'*': function(data, status){
					self.status = status;
					}
				});
			},

		get_tournament_team : function(tournamentID){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				'with_player'	: true,
				};

			// set status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament_team', param, {
				200 : function(data){

					// for each team
					_.each(data, function(e){

						// convert teamname without spaces and lowercase
						e.name_converted = e.name.split(' ').join('').toLowerCase().replace(/'/g, "");
						});

					// take team
					self.team_list = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		get_tournament_team_entry : function(teamID){
			var self = this;

			// find and set team
			var team_entry = _.findWhere(self.team_list, {'teamID' : teamID});

			// for each player in team list
			_.each(team_entry.playerlist, function(e){

				// set tags
				e.departed = _.indexOf(e.tag, 'departed') !== -1;
				e.substitute = _.indexOf(e.tag, 'substitute') !== -1;
				});

			// set global
			self.team_entry = team_entry;
			},

		get_team_player : function(entry){
			var self = this, param;

			// set param
			param = {
				'tournamentID'	: entry.tournamentID,
				'playerID'		: entry.playerID,
				};

			// check basically if request is okay
			if(!param.tournamentID || !param.playerID){

				// set error status
				self.status = 400;
				return;
				}

			// load
			$leagueapi.send_request('customstats_tournament_api_get_player_analysis', param, {
				200 : function(data){

					// reset list (for ng-repeat we need an array)
					self.team_entry.player_analysis = [];

					// append data to player object
					self.team_entry.player_analysis.push(data);

					// take player
					self.player_entry = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});

			},

		change_tournament_type : function(type){
			var self = this;

			// change to given type
			self.tournament_type = type;
			},

		change_tab : function(tab){
			var self = this;

			// change tab
			$scope.tab = tab;
			},

		};

	// initialize
	$scope.view.get_tournament();

	}]);