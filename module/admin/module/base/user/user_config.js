'use strict';

angular.module('customstats').controller('customstats.admin_base:user_config_controller', ['$scope', '$app', '$phpdate', '$leagueapi', function($scope, $app, $phpdate, $leagueapi){

	$scope.user_config = {
		data		: [],
		entry		: null,
		entry_edit	: null,
		status		: null,
		show_info 	: true,
		show_right	: false,
		right_list	: [],
		player_list	: [],
		filter 		: {
			string	: '',
			},
		order_by	: 'userID',

		get_user : function(){
			var self = this, param;

			// define param
			param = {
				with_right : true,
				};

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_base_get_user', param, {
				200 : function(data){

					// for each entry
					_.each(data, function(e){

						// take also json converted param
						e.param_converted = angular.toJson(e.data, 4);
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

		update_user : function(entry){
			var self = this, param;

			// define param
			param = {
				'userID'		: entry.userID,
				'email'			: entry.email,
				'username'		: entry.username,
				'real_name'		: entry.real_name,
				'donation'		: entry.donation ? entry.donation : 0,
				'playerID'		: entry.playerID,
				'online'		: entry.online,
				'enabled'		: entry.enabled,
				'data'			: angular.fromJson(entry.param_converted, 4),
				'reset_filecache': true,
				};

			// init status
			self.status = 100;

			// update
			$app.send_base_request('customstats_base_update_user', param, {
				204 : function(data){

					// reload list
					self.get_user();

					// set entry edit
					self.entry = _.findWhere(self.data, {'userID' : entry.userID});
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		get_registered_right : function(){
			var self = this;

			// take right list from app data
			self.right_list = $app.hook.registered_right;
			},

		get_user_specific_right : function(entry){
			var self = this, user_right_config = [];

			// reset list
			self.entry_edit.user_right_config = [];

			// for each registered right
			_.each(self.right_list, function(right){

				// define user object
				var user_right = {
					'right'		: right,
					'has_right'	: _.contains(entry.right, right),
					};

				// add to list
				user_right_config.push(user_right);
				});

			self.entry_edit.user_right_config = user_right_config;
			},

		save_user_right : function(entry){
			var self = this;

			// for each user right config
			_.each(entry.user_right_config, function(e){

				// if right activated and user didn't have it already (create new one)
				if(e.has_right && !_.contains(self.entry.right, e.right)) self.create_user_right({'userID': entry.userID, 'right': e.right});

				// if right deactivated and user actually had this right (delete it)
				if(!e.has_right && _.contains(self.entry.right, e.right)) self.delete_user_right({'userID': entry.userID, 'right': e.right});
				});
			},

		cleanup_right : function(entry){
			var self = this;

			// get difference
			_.each(entry.right, function(user_right){

				// if complete right list doesn't contain this right anymore, add to list
				if(!_.contains(self.right_list, user_right)) self.delete_user_right({'userID': entry.userID, 'right':user_right});
				});
			},

		create_user_right : function(entry){
			var self = this, param;

			// define param
			param = {
				'userID'	: entry.userID,
				'right'		: entry.right,
				};

			// basic param check
			if(!param.userID || !param.right) return;

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_base_create_user_right', param, {
				201 : function(data){

					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		delete_user_right : function(entry){
			var self = this, param;

			// define param
			param = {
				'userID'	: entry.userID,
				'right'		: entry.right,
				};

			// basic param check
			if(!param.userID || !param.right) return;

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_base_delete_user_right', param, {
				204 : function(){

					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});

			},

		get_player : function(){
			var self = this, param;

			// define param
			param = {
				'with_analyze'	: false,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_api_get_player', param, {
				200 : function(data){

					// take player list
					self.player_list = data;
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

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},
		};

	// init
	$scope.user_config.get_user();
	$scope.user_config.get_registered_right();

	$scope.user_config.get_player();

	}]);
