'use strict';

angular.module('customstats').controller('customstats.admin_game.new_game_controller', ['$scope', '$app', '$leagueapi', '$timeout', function($scope, $app, $leagueapi, $timeout){

	$scope.view = {
		config : null,
		summoner_list 	: [
			{key: 'flash', val: 'Flash'},
			{key: 'ignite', val: 'Ignite'},
			{key: 'teleport', val: 'Teleport'},
			{key: 'heal', val: 'Heal'},
			{key: 'ghost', val: 'Ghost'},
			{key: 'barrier', val: 'Barrier'},
			{key: 'exhaust', val: 'Exhaust'},
			{key: 'smite', val: 'Smite'},
			{key: 'cleanse', val: 'Cleanse'},
			],
		level_list 	  	: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
		position_list	: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'],
		champion_list 	: [],
		error_message	: '',
		precheck_success: false,
		newgame 		: {
			gameDate		: '',
			duration		: '',
			team_one_won	: false,
			team_two_won 	: false,
			sourceID		: 0,
			data			: {
				game_player	: [
					{'playerID' : '', 'teamID' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'teamID' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					],
				game_ban_t1	: [],
				game_ban_t2	: [],
				game_ban	: [],
				},
			complete		: null,
			},
		show 	: {
			image_uploaded	: false,
			},
		uploaded_url_complete : null, // 'https://custom-stats.de/public/img/customgame/source/fTnydj1VIdUBVRHX97oD_2025_03_15.png'

		get_config : function(project){
			var self = this, param;

			// set param
			param = {
				'project'	: project,
				};

			// load
			$app.send_base_request('customstats_base_get_config', param, {
				200 : function(data){

					// take data
					self.config = data;
					},
				'*' : function(data, status){

					// no status to avoid loading abortion
					}
				});
			},

		get_champion_list : function(){
			var self = this, param;

			// set param
			param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_load_champion', param, {
				200 : function(data){

					// take data
					self.champion_list = _.sortBy(data, 'name');
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		get_player_list : function(){
			var self = this, param;

			// set param
			param = {
				'with_analyze'	: false,
				};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_load_player', param, {
				200 : function(data){

					// for each player
					_.each(data, function(e){

						// add lowercase name without whitespace
						e.lc_ingame_name = e.ingame_name.toLowerCase().trim().replace(/\s+/g, '');
						});

					// take data
					self.player_list = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		create_custom_game : function(entry){
			var self = this, param;

			// define param
			param = {
				'gameDate'	: entry.gameDate,
				'duration'	: entry.duration,
				'sourceID'	: entry.sourceID,
				'canceled'	: false,
				'data'		: entry.data,
				};

			// init status
			self.status = 100;

			// create
			$leagueapi.send_request('customstats_api_create_custom_game', param, {
				201 : function(data){

					// set success
					self.set_success_message('new_game_created', 5);

					// after 4 seconds
					$timeout(function(){

						// reset
						self.newgame.complete = null;
						}, 4000);
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		validate_param : function(entry){
			var self = this, error_delay = 5,
				success_delay = 5, ban_list = [];

			// take checkbox value and set winner team (1 or 2) or null if no winner set
			entry.winner_teamID = (entry.team_one_won) ? 1 : (entry.team_two_won) ? 2 : null;

			// for each ban object (team 1)
			_.each(entry.data.game_ban_t1, function(e){

				// if not set, skip
				if(_.isUndefined(e) || !e.championID) return;

				// set teamID
				e.teamID = 1;

				// get champion name by ID
				e.champion = _.findWhere(self.champion_list, {'championID' : e.championID}).name;

				// add to list
				ban_list.push(e);
				});

			// for each ban object (team 2)
			_.each(entry.data.game_ban_t2, function(e){

				// if not set, skip
				if(_.isUndefined(e) || !e.championID) return;

				// set teamID
				e.teamID = 2;

				// get champion name by ID
				e.champion = _.findWhere(self.champion_list, {'championID' : e.championID}).name;

				// add to list
				ban_list.push(e);
				});

			// take combined ban list
			entry.data.game_ban = ban_list;


			// take param copy
			var param = angular.copy(entry);

			// 1) source
			if(!param.sourceID){

				// set error
				return self.set_error_message('Quelle bitte zuerst hochladen.', error_delay);
				}

			// 2) winner, gameDate, duration
			if(!param.winner_teamID || !param.gameDate || !param.duration){

				// set error
				return self.set_error_message('Fehler... Überprüfe Gewinner|Datum|Spiellänge.', error_delay);
				}

			// 3) game player params
			_.each(param.data.game_player, function(e){

				// set won true, if team won this game
				if(e.teamID == 1) e.won = (param.team_one_won) ? true : false;
				if(e.teamID == 2) e.won = (param.team_two_won) ? true : false;

				// get champion name
				if(e.championID) e.champion = _.findWhere(self.champion_list, {'championID' : e.championID}).name;

				// default deeper error
				var deeper_error = false;

				// for these special possible 0 values, set default (avoid 0 in html for better usage)
				_.each(['kills', 'deaths', 'assists', 'creep_score'], function(key){

					// if not set and already error triggered, error
					if(e[key] === '' && !deeper_error) return deeper_error = true;
					});

				// on error
				if(deeper_error){

					// show error
					return self.set_error_message('Fehler... Überprüfe Kills|Deaths|Assists|Creep Score', error_delay);
					}

				// on error
				if(!e.playerID || !e.teamID || !e.championID || !e.champion || !e.summoner_one || !e.summoner_two || !e.level || !e.gold || !e.position || typeof e.won !== 'boolean'){

					// show error
					return self.set_error_message('Fehler... Überprüfe Spieler|Champion|Summoners|Level|Position|Gold', error_delay);
					}

				// convert position to lowercase
				e.position = e.position.toLowerCase();
				});

			// 4) check game winner (need one, don't allow none or two)
			if((!param.team_one_won && !param.team_two_won) || param.team_one_won && param.team_two_won){

				// show error
				return self.set_error_message('Fehler... Überprüfe die Gewinner/Verlierer', error_delay);
				}

			// if error message exists, return
			if(self.error_message) return;

			// set success
			self.set_success_message('precheck_success', success_delay);

			// set new global game param
			self.newgame.complete = param;
			},

		set_error_message : function(message, delay){
			var self = this;

			// set message
			self.error_message = message;

			// delay reset
			return $timeout(function(){ self.error_message = '' }, delay * 1000);
			},

		set_success_message : function(success_type, delay){
			var self = this;

			// show success
			self[success_type] = true;

			// delay reset
			return $timeout(function(){ self[success_type] = false }, delay * 1000);
			},

		prepare_image_upload : function(){
			var self = this, file_list, file,
				param, file_reader, src_data;

			// take dropped file array
			file_list = document.getElementById('file').files;

			// if no file, return here
			if(!_.size(file_list)) return;

	    	// take the file
			file = _.first(file_list);

			// define param
			param = {
				'gameDate'			: self.newgame.gameDate,
				'base64_image' 		: '',
				'mime_type'			: file.type,
				'size'				: file.size,
				};

			// instance file reader
			file_reader = new FileReader();

			// file reader
			file_reader.onload = function(file_loaded_event){

				// base64 image data
				src_data = file_loaded_event.target.result;

				// add to param
				param.base64_image = src_data;

				// upload image
				self.upload_image(param);
				}

			// read file
			file_reader.readAsDataURL(file);
			},

		interpret_image_by_ai : function(uploaded_url_complete){
			var self = this;

			// define OCR req param
			var param = {
				'url'		: uploaded_url_complete,
				'OCREngine'	: 2,
				'scale'		: true,
				'isOverlayRequired' : true,
				};

			// take ocr api config
			const ocr_config = self.config.param.base_config.ocr_api;

			// init loading status
			self.status = 100;

			// send request to AI
			$app.send_api_ocr_space_request(ocr_config.url, ocr_config.apikey, param, {
				200 : function(data, status){

					// take only parsedResults
					data = data.ParsedResults[0];

					// take textoverlay lines
					var data_lines = data.TextOverlay.Lines;
					var winnerID = 0;

					// helper function
					function clean_name(ingame_name){

						// lowercase, remove all whitespaces
						return name.toLowerCase().trim().replace(/\s+/g, '');
						}

					// check for winner
					if(_.first(data_lines) == 'VICTORY') winnerID = 1;
					if(_.first(data_lines) == 'DEFEAT') winnerID = 2;

					// build structure for each player
					var struc_data = Array(10).fill(null).map(() => ({
						ingame_name 	: '',
						level			: 0,
						kills			: null,
						deaths			: null,
						assists			: null,
						gold			: 0,
						cs 				: null,
						}));

					for(let i = 0; i < data_lines.length; i++){

						const line = data_lines[i];

						if(line.LineText == 'TEAM 1'){

							// after "TEAM 1" - team ones levels are coming; we are at first level index now!
							i++;

							for(let run = 0; run < 5; run++){

								struc_data[run].level = parseInt(data_lines[i + run].LineText);
								}
							}

						//
						if(line.LineText == 'TEAM 2'){

							i++;

							for(let run = 0; run < 5; run++){

								struc_data[run + 5].level = parseInt(data_lines[i + run].LineText);
								if(run == 4) i += run + 1;
								}

							if(data_lines[i].LineText == 'OVERVIEW') i++;

							/* TEAM 1 players */
							if(data_lines[i].Words.length == 5){

								i++;

								for(let run = 0; run < 5; run++){

									struc_data[run].ingame_name = clean_name(data_lines[i + run].LineText);

									if(run == 4) i += run + 1;
									}
								}

							else if(data_lines[i].Words.length == 1 && data_lines[i + 1].Words.length == 4){

								i += 2;

								for(let run = 0; run < 5; run++){

									struc_data[run].ingame_name = clean_name(data_lines[i + run].LineText);

									if(run == 4) i += run + 1;
									}
								}

							/* TEAM 2 players */
							if(data_lines[i].Words.length == 5){

								i++;

								for(let run = 0; run < 5; run++){

									struc_data[run + 5].ingame_name = clean_name(data_lines[i + run].LineText);

									if(run == 4) i += run + 1;
									}
								}

							else if(data_lines[i].Words.length == 4 && data_lines[i + 1].Words.length == 1){

								i += 2;

								for(let run = 0; run < 5; run++){

									struc_data[run + 5].ingame_name = clean_name(data_lines[i + run].LineText);
									}
								}
							}
						}

					// default and reversed list copy
					var obj_index = null;
					var data_reverse = angular.copy(data_lines).reverse();

					// run complete reversed list
					for(var i = 0; i < data_reverse.length; i++){

						// if we found the correct index, stop processing
						if(obj_index !== null && obj_index != 'FIRST_RUN') break;

						// check for beginning string, skip first run and take index of second value if found
						if(data_reverse[i].LineText.includes('OBJECTIVES') || data_reverse[i].LineText.includes('OBIECTIVES')) obj_index = (obj_index == 'FIRST_RUN') ? i : 'FIRST_RUN';
						}


					/* GOLD */
					var reduced_list = _.last(data_reverse, data_reverse.length - obj_index - 1);
					const gold_list = _.first(reduced_list, 10).reverse();

					// run gold list
					for(var i = 0; i < gold_list.length; i++){

						// update gold value
						struc_data[i].gold = parseInt(gold_list[i].LineText.replace(/,/g, ''));
						}

					/* CS */
					reduced_list = _.last(reduced_list, reduced_list.length - 10);
					const cs_list = _.first(reduced_list, 10).reverse(); // PROBLEM: more than 10 possible cause of failures of AI putting symbols between gold

					// define offset
					var offset = false;

					// run cs list
					for(var i = 0; i < cs_list.length; i++){

						// // if we are finished, stop processing
						if(struc_data[9].cs !== null) break;

						// if not a number (sometimes AI fails and puts a symbol or letter between CS numbers)
						if(isNaN(cs_list[i]).LineText){

							// increment and skip
							offset = i;
							continue;
							}

						// if index from last loop defined, take it
						var p_index = (offset) ? offset : i;

						// update CS value
						struc_data[p_index].cs = parseInt(cs_list[i].LineText);

						// reset
						offset = false;
						}

					// update UI and prepare new game
					self.update_ui(struc_data, winnerID);
					},
				});
			},

		update_ui : function(struc_data, winnerID){
			var self = this;

			// reminder: using $timeout here (even without defining time) forces AngularJS to update the scope
			$timeout(function(){

				// set winner
				self.newgame[(winnerID == 1 ? 'team_one_won' : 'team_two_won')] = true;

				// check each value in collected stats from AI
				_.each(struc_data, function(e, idx) {
					self.newgame.data.game_player[idx].gold = e.gold;
					self.newgame.data.game_player[idx].creep_score = e.cs;
					self.newgame.data.game_player[idx].level = e.level;

					// search for player by converted ingame name
					const player = _.findWhere(self.player_list, {'lc_ingame_name': e.ingame_name});

					// if not found, stop here
					if(_.isUndefined(player)) return;

					// take ID
					self.newgame.data.game_player[idx].playerID = player.playerID;
					});
				});

			// update status
			self.status = 200;
			},

		upload_image : function(entry){
			var self = this, param;

			// define param
			param = {
				'type'				: 'customgame_source',
				'base64_image'		: entry.base64_image,
				'mime_type'			: entry.mime_type,
				'size'				: entry.size,
				'param'				: {
					'gameDate'		: entry.gameDate,
					},
				};

			// check basically if request is okay
			if(!param.type || !param.param || !param.param.gameDate || !param.base64_image || !param.mime_type || !param.size){

				// set error status
				self.status = 400;
				return;
				}

			// define status
			self.status = 100;

			// upload
			$leagueapi.send_request('customstats_api_upload_customgame_source', param, {
				201 : function(data){

					// set image uploaded
					self.show.image_uploaded = true;

					// add sourceID to newgame
					self.newgame.sourceID = data.sourceID;
					self.uploaded_url_complete = $app.board_get_server_info().server_url + '/public/img/customgame/source/' + data.filename;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init config loading
		$scope.view.get_config(board_status.project);

		// load champion list
		$scope.view.get_champion_list();

		// load player list
		$scope.view.get_player_list();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});

	}]);
