'use strict';

angular.module('customstats').controller('customstats.admin_hackertool.commandline', ['$scope', '$http', '$app', function($scope, $http, $app){

	$scope.cmd = {
		result		: '',
		command		: '',
		info		: '',
		httpstatus	: 0,
		libstatus	: 0,
		bench		: {
			'diffTime' : 0,
			},
		format		: 'text',
		loading 	: false,
		server		: null,
		code 		: '',
		email		: '',
		template_list		: [],
		show_create_error	: false,
		selected_template 	: null,
		new_entry			: {
			name	: '',
			},
		selected_templateID : 0,

		send	: function(cmd){
			var self = this,
				startTime = (new Date).getTime(),
				request;

			// set sending status
			self.status = 0;
			self.info = 'Sending command...';
			self.loading = true;
			self.result = '';
			self.format = 'text';

			// define request param
			request = {
				'method'	: 'POST',
				'url'		: '/ajax/cmd.json',
				'data'		: {
					'remote'		: self.server,
					'php_script'	: cmd.replace(/\\/g, '\\\\'),
					}
				};

			// send request
			$http(request).then(

				// on http success
				function(response){

					// define diffTime
					var diffTime = (new Date).getTime() - startTime;

					// check for known answer type
					if(typeof response.data == 'object' && typeof response.data.status != 'undefined'){

						// if bench object is given
						if(typeof response.data.benchmark == 'object'){

							// add diff time
							response.data.benchmark.diffTime = diffTime;

							// take bench data
							self.benchmark = response.data.benchmark;
							}

						// else
						else{

							// define bench data
							self.benchmark = {
								'diffTime' : diffTime
								};
							}

						//self.result = $sce.trustAsHtml(response.data);
						self.result = (typeof response.data.data != 'undefined') ? response.data.data : '';
						}

					// else for any other type
					else{

						// define bench data
						self.benchmark = {
							'diffTime' : diffTime
							};

						// if response is an nonempty string
						if(typeof response.data == 'string' && response.data){

							// set format to html and take response
							self.format = 'html';
							self.result = response.data;
							}
						}

					// unset info and take status
					self.info = '';
					self.libstatus = (typeof response.data.status != 'undefined') ? response.data.status : null;
					self.httpstatus = response.status;
					},

				// on http error
				function(response){

					// define diffTime
					var diffTime = (new Date).getTime() - startTime;

					// define bench data
					self.benchmark = {
						'diffTime' : diffTime
						};

					// if response is an nonempty string
					if(typeof response.data == 'string' && response.data){

						// set format to html and take response
						self.format = 'html';
						self.result = response.data;
						}

					// unset info and take status
					self.info = '';
					self.libstatus = null;
					self.httpstatus = response.status;
					}
				);
			},

		get_serverlist : function(){
			var self = this;

            self.serverlist = [
                {serverID: 1, server_name: 'Local Dev', remote_fqdn: null},
                {serverID: 2, server_name: 'Live System', remote_fqdn: 'custom-stats.de'},
                ];
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// load serverlist
		$scope.cmd.get_serverlist();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});

	}]);
