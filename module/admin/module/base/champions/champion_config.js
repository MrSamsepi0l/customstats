'use strict';

angular.module('customstats').controller('customstats.admin_base:champion_config_controller', ['$scope', '$app', '$phpdate', '$leagueapi', function($scope, $app, $phpdate, $leagueapi){

	$scope.champion = {
		data		: [],
		entry		: null,
		entry_edit	: null,
		entry_new 	: null,
		status		: null,
		filter		: {
			string	: '',
			},
		gender		: [
			{'key': 'weiblich', 'value': 0},
			{'key': 'männlich', 'value': 1},
			],

		get_champion : function(){
			var self = this, param;

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_load_champion', param, {
				200 : function(data){

					// for each champ
					_.each(data, function(e){

						// convert gender to string
						e.gender_string = (e.gender == 0) ? 'weiblich' : 'männlich';
						e.champion_name_fixed = e.name.split(' ').join('');
						});

					// take data
					self.data = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		create_champion : function(entry){
			var self = this, param;

			// set param
			param = {
				'name'		: entry.name,
				'gender'	: entry.gender,
				};

			// basic param check
			if(!param.name) return;

			// init status
			self.status = 100;

			// create
			$leagueapi.send_request('customstats_create_champion', param, {
				201 : function(data){

					// reload list
					self.get_champion();
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		update_champion : function(entry){
			var self = this, param;

			// set param
			param = {
				'championID'	: entry.championID,
				'name'			: entry.name,
				'gender'		: entry.gender,
				};

			// basic param check
			if(!param.championID || !param.name) return;

			// init status
			self.status = 100;

			// update
			$leagueapi.send_request('customstats_update_champion', param, {
				204 : function(data){

					// reload list
					self.get_champion();
					},
				'*' : function(data, status){

					// set status
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

				};
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},

		};

	// init
	$scope.champion.get_champion();

	}]);
