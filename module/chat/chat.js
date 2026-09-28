'use strict';

angular.module('customstats').controller('customstats.chat_controller', ['$scope', '$app', '$phpdate', '$interval', '$location', function($scope, $app, $phpdate, $interval, $location){

	$scope.view = {
		data			: [],
		entry 			: null,
		chat_message	: '',
		status			: null,
		init			: true,
		date 			: null,
		time 			: {},
		calender_week	: null,
		clock_interval	: null,

		// default config
		config			: {
			message 	: {
				'min_seconds_between_message': 5,
				'info_message'				 : 'Holaaaaa!',
				},
			},

		// chat block
		chatblock 		: {
			show 		: false,
			timer 		: null,
			},
		filter 			: {
			string 		: '',
			},
		scroll_trigger 	: 0,

		load_chat : function(init = false){
			var self = this, param;

			// set init global
			self.init = init;

			// set param
			param = {
				'project'	: true,
				'api_key'	: true,
				};

			// set only one init mode (hides loading div)
			if(init) self.status = 100;

			// load user list
			$app.send_base_request('customstats_load_chatlist', param, {
				200 : function(data){

					// take chatlist
					self.data = data;

					// define todays date once
					var today_date = $phpdate('now').format('Y-m-d');

					// added header list
					var added_dayheaders = [];

					// for each message in list
					_.each(data[0].chat_message_list, function(message){

						// message date
						var message_date = $phpdate(message.sentTime).format('Y-m-d');

						// define current day header
						var dayheader = (message_date == today_date) ? 'TODAY' : message_date;

						// if dayheader already added, skip
						if(_.contains(added_dayheaders, dayheader)) return;

						// add to message
						message._dayheader = dayheader;

						// add to list
						added_dayheaders.push(dayheader);
						});

					// take group chat
					self.entry = data[0];

					// scroll down
					if(init) self.trigger_scroll_down();
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		send_message : function(entry, message){
			var self = this, param, last_message_sent;

			// if user already sent message in the last seconds
			last_message_sent = $app.board_get_value('last_message_sent');

			// if already sent a message in the past and not enough time (defined by config) passed, stop here
			if(last_message_sent && ($phpdate('now').format('Uu') - last_message_sent < self.config.message.min_seconds_between_message * 1000)) return;

			// define param
			param = {
				'project'	: true,
				'api_key'	: true,
				'chat_hash'	: entry.chat_hash,
				'message'	: message,
				};

			// basic param check
			if(!param.message || _.size(param.message) > 500) return;

			// trim message
			param.message = param.message.trim();

			// set status
			self.status = 100;

			// load user list
			$app.send_base_request('customstats_send_message', param, {
				201 : function(data){

					// add last message sent
					$app.board_set_value('last_message_sent', $phpdate('now').format('Uu'));

					// load chat
					self.load_chat(true);

					// block chat
					self.init_chatblock(self.config.message.min_seconds_between_message);

					// reset input
					self.chat_message = '';
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		init_chatblock : function(seconds_blocked){
			var self = this;

			// show timer
			self.chatblock.show = true;

			// define chat block timer
			self.chatblock.timer = seconds_blocked;

			// define interval function
			var interval = $interval(function(){

				// decrement chat block timer
				self.chatblock.timer--;

				// if it is equal 0
				if(self.chatblock.timer == 0){

					// cancel interval fn
					$interval.cancel(interval);

					// hide timer
					self.chatblock.show = false;
					}
				}, 1000, 0); // every second
			},

		is_online : function(username){
			var self = this;

			// search for user by name
			var user = _.findWhere(self.entry.user_profile_list, {'username': username});

			// check if online
			return (user && user.is_online);
			},

		trigger_scroll_down : function(){
			var self = this;

			// increment scroll counter (triggering directive update)
			self.scroll_trigger++;
			},

		get_config : function(project){
			var self = this, param;

			// set param
			param = {
				'project'	: project,
				};

			// load
			$app.send_base_request('customstats_base_get_config', param, {
				200 : function(data){

					// extract chat config if available
					if(!_.isUndefined(data.param.base_config.message)) self.config = data.param.base_config;
					},
				});
			},

		redirect_template : function(ingame_name){
			var self = this;

			// if username empty, stop here
			if(!ingame_name) return;

			// and search for klicked champion
			$location.url('/all_player').search({ingame_name: ingame_name});
			},

		realtime_clock : function(init = false){
			var self = this;

			// define original date
			self.date_org = $phpdate('now');

			// define chat block timer
			self.date = $phpdate('now').format('d.m.Y');
			self.time = $phpdate('now').format('H:i:s');
			self.calender_week = moment($phpdate('now')).week();

			// if no interval started
			if(!self.clock_interval){

				// define interval function
				self.clock_interval = $interval(function(){

					self.realtime_clock(false);

					}, 500, 0); // update clock every 500 ms
				}


			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init time
		// $scope.view.date = $phpdate('now').format('Y-m-d');

		$scope.view.realtime_clock(true);

		// init config and load chat
		$scope.view.get_config(board_status.project);
		$scope.view.load_chat(true);

		// initialize chat reload if not already done
		if(!$app.board_get_value('chat_interval_started')) $scope.interval = $interval(function(){

			// load chat
			$scope.view.load_chat(false);

 			// add board value
 			$app.board_set_value('chat_interval_started', true);
			}, 10 * 1000); // every 10 seconds
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});

	// if scope destroyed
	$scope.$on('$destroy', function(){

		// reset board value
		$app.board_set_value('chat_interval_started', null);

		// stop interval loading
		$interval.cancel($scope.interval);
		});

	}]);
