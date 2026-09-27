'use strict';

angular.module('customstats').controller('customstats.admin_base:leagueapi_config_controller', ['$scope', '$app', '$phpdate', function($scope, $app, $phpdate){

	$scope.leagueapi = {
		data		: [],
		entry		: null,
		entry_edit	: null,
		entry_new 	: null,
		status		: null,
		filter		: {
			string	: '',
			},
		delete 		: {
			show_modal 	: false,
			},

		get_leagueapi_list : function(){
			var self = this, param;

			// set param
			param = {};

			// init status
			self.status = 100;

			// load
			$app.send_base_request('customstats_base_get_leagueapi', param, {
				200 : function(data){

					// take data
					self.data = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		create_leagueapi : function(entry){
			var self = this, param;

			// set param
			param = {
				'name'		: entry.name,
				'fn'		: entry.fn,
				'enabled'	: entry.enabled,
				'right'		: parseInt(entry.right),
				};

			// basic param check
			if(!param.name || !param.fn || !_.contains([0,1,2], param.right)) return;

			// init status
			self.status = 100;

			// update
			$app.send_base_request('customstats_base_create_leagueapi', param, {
				201 : function(data){

					// reload list
					self.get_leagueapi_list();
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		update_leagueapi : function(entry){
			var self = this, param;

			// set param
			param = {
				'name'		: entry.name,
				'fn'		: entry.fn,
				'enabled'	: entry.enabled,
				'right'		: parseInt(entry.right),
				};

			// basic param check
			if(!param.name || !param.fn || !_.contains([0,1,2], param.right)) return;

			// init status
			self.status = 100;

			// update
			$app.send_base_request('customstats_base_update_leagueapi', param, {
				'*' : function(data, status){

					// set status
					self.status = status;

					// reload
					self.get_leagueapi_list();
					}
				});
			},

		delete_leagueapi : function(entry){
			var self = this, param;

			// set param
			param = {
				'name'		: entry.name,
				};

			// basic param check
			if(!param.name) return;

			// init status
			self.status = 100;

			// update
			$app.send_base_request('customstats_base_delete_leagueapi', param, {
				'*' : function(data, status){

					// close modal
					self.delete.show_modal = false;

					// set status
					self.status = status;

					// reload
					self.get_leagueapi_list();
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
				'name'		: 'customstats',
				'fn'		: '\\customstats\\',
				'enabled'	: false,
				'right'		: 1,
				};
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},

		};

	// init
	$scope.leagueapi.get_leagueapi_list();

	}]);
