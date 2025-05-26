angular.module('customstats').controller('customstats.admin_tournament:tournament_controller', ['$scope', '$app', '$leagueapi', function($scope, $app, $leagueapi){

	$scope.tournament = {
		data		: [],
		entry		: null,
		status		: null,

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
					self.data = data;
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		create_tournament : function(entry){
			var self = this, param;

			// define param
			param = {
				'name'		: entry.name,
				'startDate'	: entry.startDate,
				'endDate'	: entry.endDate,
				};

			// basic param check
			if(!param.name || !param.startDate) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_create_tournament', param, {
				201 : function(data){

					// reload list
					self.get_tournament();
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		update_tournament : function(entry){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: entry.tournamentID,
				'name'			: entry.name,
				'startDate'		: entry.startDate,
				'endDate'		: entry.endDate,
				};

			// basic param check
			if(!param.tournamentID || !param.name) return;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_update_tournament', param, {
				204 : function(data){

					// reload list
					self.get_tournament();
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
				'name'		: '',
				'startDate'	: '0000-00-00',
				'endDate'	: null,
				};
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},
		};

	// initialize
	$scope.tournament.get_tournament();
	}]);