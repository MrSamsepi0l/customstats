'use strict';

angular.module('customstats').controller('customstats.admin_base:base_config_controller', ['$scope', '$app', '$phpdate', '$leagueapi', function($scope, $app, $phpdate, $leagueapi){

	$scope.base_config = {
		data		: [],
		entry		: null,
		entry_edit	: null,
		status		: null,
		show		: {
			specific: false,
			new 	: false,
			edit	: true,
			},
		filter 		: {
			string	: '',
			},
		order_by	: null,
		translate	: {
			champion_specific : {
				'expert'	: 'Champion-Experte',
				'legendary'	: 'Legendärer-Champ',
				'newbie'	: 'Lernt gerade Champ',
				'team_diff'	: 'Champion-Team-Diff',
				'scarry'	: 'Gefürchteter Champ',
				'main'		: 'Champion-Main',
				'effective'	: 'Champion-Schwäche',
				},
			player_specific : {
				high_avg_kills 		: 'Kopfgeldjäger',
				high_avg_deaths 	: 'Dinosaurier',
				high_avg_assists	: 'Happy Helper',
				low_avg_kills		: 'Pazifist',
				low_avg_deaths		: 'Zohan',
				low_avg_assists		: 'Einzelkämpfer',
				high_kda_numb		: 'KDA-Spieler',
				low_kda_numb		: 'ALL IN',
				high_cs_per_min		: 'Landwirt',
				low_cs_per_min		: 'Vollzeit-Supp',
				},
			position	: [
				{'key': 'times_played', 'name': 'meiste Spiele'},
				{'key': 'winrate', 'name': 'höchste Winrate'},
				],
			},

		get_config : function(){
			var self = this, param;

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_base_get_config', param, {
				200 : function(data){

					// for each entry
					_.each(data, function(e){

						// take also json converted param
						e.param_converted = angular.toJson(e.param, 4);
						})

					// take data
					self.data = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		update_config : function(entry, converted = false){
			var self = this, param;

			// define param
			param = {
				'configID'		: entry.configID,
				'project'		: entry.project,
				'enabled'		: entry.enabled,
				'param'			: (!converted) ? angular.fromJson(entry.param_converted, 4) : entry.param,
				};

			// basic param check
			if(!param.configID || !param.project) return;

			// init status
			self.status = 100;

			// update
			$app.send_base_request('customstats_base_update_config', param, {
				204 : function(data){

					// reload list
					self.get_config();

					// set entry edit
					self.entry = _.findWhere(self.data, {'configID' : param.configID});
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		create_config : function(entry){
			var self = this, param;

			// define param
			param = {
				'project'	: entry.project,
				'enabled'	: entry.enabled,
				'param'		: entry.param,
				};

			// basic param check
			if(!param.project) return;

			// init status
			self.status = 100;

			// execute service function
			$app.send_base_request('customstats_base_create_config', {
				201 : function(data){

					// set (just created) entry
					self.entry = _.findWhere(self.data, {'configID' : data.configID});
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		set_new : function(){
			var self = this;

			// hide/show edit entry
			self.show.edit = false;
			self.show.specific = false;
			self.show.new = true;

			// define new entry
			self.entry_new = {
				'project'		: '',
				'enabled'		: false,
				'param'			: '{}',
				};
			},

		edit : function(entry){
			var self = this;

			// copy entry for editing
			self.entry_edit = angular.copy(entry);
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},
		};

	// init
	$scope.base_config.get_config();

	}]);
