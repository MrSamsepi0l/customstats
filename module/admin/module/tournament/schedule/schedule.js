angular.module('customstats').controller('customstats.admin_tournament:schedule_controller', ['$scope', '$app', '$leagueapi', function($scope, $app, $leagueapi){

	$scope.tournamentID = null;

	$scope.schedule = {
		tournament  : [],
		teamlist	: [],
		data		: [],
		entry		: null,
		status		: null,
		order_by	: '-scheduleID',
		type_list	: [
			{key: 'regular_season', val: 'Reguläre Saison'},
			{key: 'knockout', 		val: 'Knockout-Spiel'}
			],


		get_schedule : function(tournamentID = null){
			var self = this, param;

			// define param
			var param = {
				'tournamentID'	: tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_schedule', param, {
				200 : function(data){

					// take data
					self.data = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		create_schedule : function(entry){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: entry.tournamentID,
				'team_oneID'	: entry.team_oneID,
				'team_twoID'	: entry.team_twoID,
				'type'			: entry.type,
				'estimatedDate_from'	: entry.estimatedDate_from,
				'estimatedDate_to'		: entry.estimatedDate_to,
				};

			// basic param check
			if(!param.tournamentID || !param.team_oneID || !param.team_twoID || !param.type || !param.estimatedDate_from) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_create_schedule', param, {
				201 : function(data){

					// reload list
					self.get_schedule(entry.tournamentID);
					self.get_team(entry.tournamentID);
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		update_schedule : function(entry){
			var self = this, param;

			// define param
			param = {
				'scheduleID'	: entry.scheduleID,
				'tournamentID'	: entry.tournamentID,
				'team_oneID'	: entry.team_oneID,
				'team_twoID'	: entry.team_twoID,
				'type'			: entry.type,
				'estimatedDate_from'	: entry.estimatedDate_from,
				'estimatedDate_to'		: entry.estimatedDate_to,
				};

			// basic param check
			if(!param.scheduleID || !param.tournamentID || !param.team_oneID || !param.team_twoID || !param.type || !param.estimatedDate_from || !param.estimatedDate_to) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_update_schedule', param, {
				204 : function(data){

					// reload list
					self.get_schedule(entry.tournamentID);
					self.get_team(entry.tournamentID);
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

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
			param = {
				'tournamentID'	: tournamentID,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament_team', param, {
				200 : function(data){

					// take data
					self.teamlist = data;
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
			self.show_new = true;

			// define new entry
			self.entry_new = {
				'scheduleID'	: 0,
				'tournamentID'	: 0,
				'team_oneID'	: 0,
				'team_twoID'	: 0,
				'type'			: 'regular_season',
				'estimatedDate_from'	: '0000-00-00',
				'estimatedDate_to'		: null,
				};
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},
		};

	// initialize
	$scope.schedule.get_tournament();
	$scope.schedule.get_schedule();
	}]);