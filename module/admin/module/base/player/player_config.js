'use strict';

angular.module('customstats').controller('customstats.admin_base:player_config_controller', ['$scope', '$app', '$phpdate', '$leagueapi', function($scope, $app, $phpdate, $leagueapi){

	$scope.player = {
		data		: [],
		entry		: null,
		entry_edit	: null,
		entry_new 	: null,
		status		: null,
		filter		: {
			string	: '',
			},

		get_player : function(){
			var self = this, param;

			// set param
			param = {
				'with_analyze'	: false,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_api_get_player', param, {
				200 : function(data){

					// for each player
					_.each(data, function(e){

						// if custom title not already set
						if(!e.tag.custom_title){

							// default
							e.tag.custom_title = {};

							// add default empty list
							e.tag.custom_title.list = [];
							}
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

		create_player : function(entry){
			var self = this, param;

			// set param
			param = {
				'ingame_name'	: entry.ingame_name,
				'real_name'		: entry.real_name,
				'enabled'		: entry.enabled,
				'tag'			: entry.tag
				};

			// basic param check
			if(!param.ingame_name || !param.real_name) return;

			// init status
			self.status = 100;

			// create
			$leagueapi.send_request('customstats_create_player', param, {
				201 : function(data){

					// reload list
					self.get_player();
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		update_player : function(entry){
			var self = this, param;

			// set param
			param = {
				'playerID'		: entry.playerID,
				'ingame_name'	: entry.ingame_name,
				'real_name'		: entry.real_name,
				'enabled'		: entry.enabled,
				'tag'			: entry.tag,
				};

			// basic param check
			if(!param.playerID || !param.ingame_name || !param.real_name) return;

			// init status
			self.status = 100;

			// update
			$leagueapi.send_request('customstats_update_player', param, {
				204 : function(data){

					// reload list
					self.get_player();
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		edit : function(entry){
			var self = this;

			// set default tag if not defined
			if(!entry.tag.custom_title){

				// default
				entry.tag.custom_title = {};

				// add default empty list
				entry.tag.custom_title.list = [];
				}

			// default custom title color
			entry.new_title = {};
			entry.new_title.color = '#e6f50b';

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
				tag 		: {
					custom_title : {
						list 	 : [],
						},
					},
				new_title 	: {
					color 	: '#e6f50b',
					},
				};
			},

		add_custom_title : function(entry, key, desc, color){
			var self = this;

			// if no key or description, return here
			if(!key || !desc) return;

			// add title and description in obj to list
			entry.tag.custom_title.list.push({
				'key'		: key,
				'desc'		: desc,
				'color'		: color,
				});

			// reset inputs
			entry.new_title.key = '';
			entry.new_title.desc = '';
			},

		remove_custom_title : function(entry){
			var self = this;

			// filter list
			self.entry_edit.tag.custom_title.list = _.filter(self.entry_edit.tag.custom_title.list, function(e){

				// by title key and description
				return e.key != entry.key && entry.desc != e.desc;
				});
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},

		};

	// init
	$scope.player.get_player();

	}]);
