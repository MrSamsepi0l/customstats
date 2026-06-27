'use strict';

angular.module('customstats').controller('customstats.admin_dev.phplog', ['$scope', '$http', '$app', '$phpdate', function($scope, $http, $app, $phpdate){

	$scope.view = {
		status 		: null,
		info 		: null,
		entry 		: null,
		filter_request	: [],


		data 		: null,
		active_log	: null,
		max 		: 20,
		lines		: 0,
		unfiltered	: 0,
		pos			: 0,
		prevpos 	: 0,
		nextpos 	: 0,
		endpos		: 0,
		filter		: [],
		filtered	: [],

		get_info : function(){
			var self = this, param;

			// define param
			param = {
				};

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_admin_get_info', param, {
				200 : function(data){

					// take data
					self.info = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		load_filtered : function(entry){
			var self = this;

			self.filter_request.push({'type': entry.type, 'key': entry.key});

			self.get_logfile();
			},


		load_path : function(entry){
			var self = this;

			if(!entry) return self.get_logpath(null);

			if(entry.type == 'dir') return self.get_logpath(entry.link);
			if(entry.type == 'log') return self.get_logfile(entry.link);
			},

		get_logpath : function(subpath){
			var self = this, param;

			self.active_dir = subpath || null;
			self.data = null;

			// define param
			param = {
				'subpath'	: self.active_dir,
				};

			// init status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_admin_get_phplog_path', param, {
				200 : function(data){

					// take list
					self.dir_list = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		load_pos : function(pos){
			var self = this;

			// if given position exceeds endposition
			if(self.endpos && pos > self.endpos){
				pos = self.endpos;
				self.pos = pos;
				}

			self.get_logfile(self.active_log, pos);
			},

		get_logfile : function(logfile, pos){
			var self = this, param;


			self.data = null;
			if(self.active_log != logfile){
				self.filter = [];
				self.filtered = [];
				}

			self.active_log = logfile;

			// define param
			param = {
				'logfile'	: logfile,
				'pos'		: pos || null,
				'max'		: this.max,
				'filter'	: this.filtered}

			// loading status
			self.status = 100;

			// load log file
			$app.send_base_request('customstats_admin_get_phplog_file', param, {
				200 : function(data){

					self.data = data.list;
					self.filter = data.filter_option;
					self.filtered = data.filter_request;

					self.lines = data.lines;
					self.unfiltered = data.unfiltered;
					self.pos = data.pos;
					self.prevpos = (data.pos - self.max) > 0 ? data.pos - self.max : 0;
					self.nextpos = (data.pos+self.max < data.unfiltered) ? data.pos+self.max : data.pos;
					self.endpos = data.unfiltered > self.max ? (data.unfiltered - (data.unfiltered % self.max) ? data.unfiltered - (data.unfiltered % self.max) : data.unfiltered - self.max) : 0;

					self.filtered = data.filter_request;

					var fo_list = {};

					_.each(data.filter_option, function(entry){
						if(typeof fo_list[entry.type] == 'undefined') fo_list[entry.type] = {"type":entry.type, "list":[]};
						fo_list[entry.type].list.push(entry);
						});

					_.each(fo_list, function(entry, key){
						fo_list[key].list = _.sortBy(entry.list, 'key');
						});

					self.filter = _.toArray(fo_list);
					},

				'httperror': function(status){
					$scope.httpstatus = status;
					},

				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// load info and files
		$scope.view.get_info();
		$scope.view.get_logpath();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});

	}]);
