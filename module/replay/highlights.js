'use_strict';

angular.module('customstats').controller('customstats.replay_controller', ['$scope', '$http', '$timeout', '$app', '$leagueapi', '$rootScope', '$sce', function($scope, $http, $timeout, $app, $leagueapi, $rootScope, $sce){

	$scope.view = {
		data		: [],
		edit		: false,
		entry		: null,
		status  	: null,
		playerlist 	: [],

		load_list : function(reload = false){
			var self = this, param;

			// set status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_get_replay', param, {
				200 : function(data){

					console.log(data);

					// if not reloaded
					if(!reload){

						// for each replay
						_.each(data, function(e){

							// default edit
							e.edit = false;
							});
						}

					// take data
					self.data = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		load_player : function(){
			var self = this, param;

			// set status
			self.status = 100;

			// define param
			param = {
				'list_only'		: true,
				};

			// load
			$leagueapi.send_request('customstats_load_player', param, {
				200 : function(data){

					// for each replay
					_.each(data, function(e){

						// default edit
						e.edit_player = false;
						});

					// set entry
					self.playerlist = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		// initialize_replay_player_update : function(replayID){
		// 	var self = this;

		// 	// get replay by replayID
		// 	var replay = _.findWhere(self.data, {'replayID' : replayID});

		// 	// default
		// 	self.added_player = [];

		// 	self.added_player = angular.copy(replay.involved_player);

		// 	console.log(self.added_player);
		// 	},

		// add_player_to_list : function(replayID, playerID){
		// 	var self = this;

		// 	// default
		// 	self.added_player = [];

		// 	// add object to list
		// 	self.added_player.push({
		// 		'replayID'		: replayID,
		// 		'playerID'		: playerID,
		// 		});
		// 	},

		// remove_player_from_list : function(playerID){
		// 	var self = this;

		// 	var remove = _.findWhere(self.added_player, {'playerID' : playerID});

		// 	self.added_player = _.reject(self.added_player, function(e){

		// 		return e.playerID == playerID;
		// 		});

		// 	console.log(self.added_player);
		// 	},

		// execute_create_replay_player : function(){
		// 	var self = this;

		// 	// for each added player
		// 	_.each(self.added_player, function(e){

		// 		// create entries
		// 		self.create_replay_player(e.replayID, e.playerID);
		// 		});
		// 	},

		create_replay_player : function(replayID, playerID){
			var self = this;

			// define param
			var param = {
				'replayID'		: replayID,
				'playerID'		: playerID,
				};

			// check if request is basically okay
			if(!param.replayID || !param.playerID){

				// set status and return
				return self.status = 400;
				}

			// create
			$leagueapi.send_request('customstats_create_replay_player', param, {
				201 : function(data){

					// reload list
					self.load_list(true);

					// reset
					self.edit = false;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		delete_replay_player(replayID, playerID){
			var self = this;

			// define param
			var param = {
				'replayID'		: replayID,
				'playerID'		: playerID,
				};

			// check if request is basically okay
			if(!param.replayID || !param.playerID){

				// set status and return
				return self.status = 400;
				}

			// create
			$leagueapi.send_request('customstats_delete_replay_player', param, {
				204 : function(data){

					// reload list
					self.load_list(true);

					// reset
					self.edit = false;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		update : function(entry){
			var self = this, param;

			// define param
			param = {
				'replayID'	: entry.replayID,
				'name'		: entry.name,
				};

			// check basically if request is okay
			if(!param.replayID || !param.name){

				// set status and return
				self.status = 400;
				return;
				}

			// load
			$leagueapi.send_request('customstats_update_replay', param, {
				204 : function(data){

					// reset
					self.edit = false;

					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		upload_replay : function(){
			var self = this;

			// new formData instance
			var param = new FormData();

			// take dropped file
			var files = document.getElementById('file').files[0];

			// append it to param with filename
			param.append('file', files);

			// // define data object
			// var data = {
			// 	'gameDate'	: '2022-01-01',
			// 	};

			// // append data
			// param.data = data;

			// define ajax object
			var ajax = {
				'method'	: 'POST',
				'url'		: $scope.tabscreen.server + 'lib/ajax_upload.php',
				'data'		: param,
				'headers'	: {'Content-Type': undefined},
				};

			// set status
			self.status = 100;

			// ajax request
			$app.ajax(ajax, 'ajax_file_upload', {
				200 : function(data){

					// reload list
					self.load_list();

					// unset file input
					$('#file').val('');
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					},
				});
			},

      trust_src : function(src){
			return $sce.trustAsResourceUrl(src);
			},

		};

	// initialize
	$scope.view.load_list();
	$scope.view.load_player();


	}]);

// Url filter for HTML5 Video tag
angular.module('customstats').filter('trustUrl', ['$sce', function ($sce){
	return function (recordingUrl){
		return $sce.trustAsResourceUrl(recordingUrl);
		};
    }]);

/* ngFile directive for uploading */
angular.module('customstats').directive('ngFile', ['$parse', function ($parse) {

	return {
		restrict: 'A',
		link : function(scope, element, attrs){
			element.bind('change', function(){

				// parse file
				$parse(attrs.ngFile).assign(scope,element[0].files)

				// apply to scope
				scope.$apply();
				});
			}
		};
	}]);