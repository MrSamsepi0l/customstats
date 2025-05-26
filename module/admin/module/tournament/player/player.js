angular.module('customstats').controller('customstats.admin_tournament:player_controller', ['$scope', '$app', '$leagueapi', function($scope, $app, $leagueapi){

	$scope.player = {
		data		: [],
		entry		: null,
		status		: null,

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
					self.data = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		create_player : function(entry){
			var self = this, param;

			// define param
			param = {
				'ingame_name'	: entry.ingame_name,
				'real_name'		: entry.real_name,
				'enabled'		: entry.enabled,
				};

			// basic param check
			if(!param.ingame_name || !param.real_name) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_create_player', param, {
				201 : function(data){

					// reload list
					self.get_player();
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		update_player : function(entry){
			var self = this, param;

			// define param
			param = {
				'playerID'		: entry.playerID,
				'ingame_name'	: entry.ingame_name,
				'real_name'		: entry.real_name,
				'enabled'		: entry.enabled,
				};

			// basic param check
			if(!param.playerID || !param.ingame_name || !param.real_name) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_update_player', param, {
				204 : function(data){

					// reload list
					self.get_player();
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
				'ingame_name'	: '',
				'real_name'		: '',
				'enabled'		: false,
				};
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},
		};

	// initialize
	$scope.player.get_player();
	}]);