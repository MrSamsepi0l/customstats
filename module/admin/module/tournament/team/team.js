angular.module('customstats').controller('customstats.admin_tournament:team_controller', ['$scope', '$app', '$leagueapi', function($scope, $app, $leagueapi){

	$scope.team = {
		tournament 	: [],
		player_data : [],
		team_player	: [],
		data		: [],
		entry		: null,
		status		: null,
		show_info	: true,
		show_player : false,

		get_tournament : function(){
			var self = this, param;

			// define param
			var param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take tournament data
					self.tournament = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		get_team : function(tournamentID = null){
			var self = this, param;

			// define param
			var param = {
				'tournamentID'	: tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament_team', param, {
				200 : function(data){

					// take data
					self.data = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		get_team_player : function(teamID){
			var self = this, param;

			// define param
			var param = {
				'teamID'	: teamID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament_team', param, {
				200 : function(data){

					// for each player
					_.each(data, function(e){

						// default
						e.substitute = false;
						e.departed = false;

						// extract tag param
						if(_.contains(e.tag, 'substitute')) e.substitute = true;
						if(_.contains(e.tag, 'departed')) e.departed = true;
						});

					// take data
					self.entry_edit.team_player = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		get_player : function(){
			var self = this, param;

			// define param
			var param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_player', param, {
				200 : function(data){

					// take data
					self.player_data = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		create_team : function(entry){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: entry.tournamentID,
				'name'			: entry.name,
				};

			// basic param check
			if(!param.tournamentID || !param.name) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_create_team', param, {
				201 : function(data){

					// reload list
					self.get_team();
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		update_team : function(entry){
			var self = this, param;

			// define param
			param = {
				'teamID'		: entry.teamID,
				'tournamentID'	: entry.tournamentID,
				'name'			: entry.name,
				};

			// basic param check
			if(!param.tournamentID || !param.name) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_update_team', param, {
				204 : function(data){

					// reload list
					self.get_team();
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		edit : function(entry){
			var self = this;

			// copy entry for editing
			self.entry_edit = angular.copy(entry);
			},

		set_new : function(){
			var self = this;

			// hide/show edit entry
			self.show_edit = false;
			self.show_player = false;
			self.show_new = true;

			// define new entry
			self.entry_new = {
				'tournamentID'	: 2,
				'name'			: '',
				};
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},

		update_team_player : function(list){
			var self = this;

			// for each player in team
			_.each(list, function(e){

				// define update param
				var param = {
					'teamID'	: self.entry_edit.teamID,
					'playerID'	: e.playerID,
					'leader'	: e.leader,
					'role'		: e.role,
					'tag'		: [],
					};

				// add tag params
				if(e.substitute && !_.contains(param.tag, 'substitute')) param.tag.push('substitute');
				if(e.departed && !_.contains(param.tag, 'departed')) param.tag.push('departed');

				// init status
				self.status = 100;

				// update
				$leagueapi.send_request('customstats_tournament_api_update_team_player', param, {
					204 : function(data){

						},
					'*' : function(data, status){
						self.status = status;
						}
					});
				});
			},

		add_player : function(entry){
			var self = this;

			// define complete entry
			var param = {
				'teamID'		: self.entry_edit.teamID,
				'playerID'		: entry.playerID,
				'ingame_name'	: entry.ingame_name,
				'tournamentID'	: self.entry_edit.tournamentID,
				'leader'		: false,
				'role'			: 'top',
				'tag'			: [],
				};

			// basic param check
			if(!param.teamID || !param.playerID || !param.role) return;

			// init status
			self.status = 100;

			// create
			$leagueapi.send_request('customstats_tournament_api_create_team_player', param, {
				201 : function(data){

					// reload list
					self.get_team_player(param.teamID);
					},
				'*' : function(data, status){
					self.status = status;
					}
				});

			// add to list
			self.entry_edit.team_player.push(param);
			},

		remove_player : function(entry){
			var self = this;

			// define param
			param = {
				'teamID'	: entry.teamID,
				'playerID'	: entry.playerID,
				};

			// basic param check
			if(!param.teamID || !param.playerID) return;

			// init status
			self.status = 100;

			// delete
			$leagueapi.send_request('customstats_tournament_api_delete_team_player', param, {
				204 : function(data){

					// reject from team player list
					self.entry_edit.team_player = _.reject(self.entry_edit.team_player, function(e){

						// remove by playerID
						return e.playerID == entry.playerID;
						});
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},
		};

	// initialize
	$scope.team.get_tournament();
	$scope.team.get_team();
	$scope.team.get_player();
	}]);