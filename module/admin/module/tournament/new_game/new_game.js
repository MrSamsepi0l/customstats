'use strict';

angular.module('customstats').controller('customstats.tournament_new_game_controller', ['$scope', '$app', '$leagueapi', '$timeout', function($scope, $app, $leagueapi, $timeout){

	$scope.newgame = {

		// tournament
		tournament_list		: [],
		tournament_entry	: null,
		type_list			: [
			{'key': 'Reguläre Saison', 'val': 'regular_season'},
			{'key': 'Knockout-Phase', 'val': 'knockout'},
			],

		// tournament team
		team_list			: [],

		// tournament player
		player_list			: [],

		// schedule
		schedule_list		: [],

		// champions
		champion_list		: [],

		// basic
		status 				: null,
		position_list	 	: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'],
		level_list 			: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
		summoner_list		: ['Flash', 'Ignite', 'Exhaust', 'Heal', 'Ghost', 'Teleport', 'Cleanse', 'Barrier', 'Smite'],

		// newgame
		newgame : {
			'tournamentID'		: 0,
			'team_oneID'		: 0,
			'team_twoID'		: 0,
			'winner_teamID'		: 0,
			'scheduleID'		: 0,
			'team_one_won'		: false,
			'team_two_won'		: false,
			'playerlist_t1'		: [],
			'playerlist_t2' 	: [],
			'type'				: '',
			'gameDate'			: null,
			'duration'			: null,
			'data'				: {
				'game_player'	: [
					{'playerID' : '', 'team' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 1, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					{'playerID' : '', 'team' : 2, 'championID' : '', 'champion' : '', 'summoner_one' : '', 'summoner_two' : '', 'level' : '', 'kills' : '', 'deaths' : '', 'assists' : '', 'creep_score' : '', 'gold' : '', 'position' : '', 'won' : null},
					],
				'game_ban'		: [],
				'game_ban_t1'	: [],
				'game_ban_t2'	: [],
				},
			'complete'			: null,
			},

		// error
		error_message		: null,

		// show
		show 				: {
			image_uploaded 	: false,
			},

		get_tournament : function(){
			var self = this, param;

			// define param
			param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament', param, {
				200 : function(data){

					// take data
					self.tournament_list = data;
					},
				'*': function(data, status){
					self.status = status;
					}
				});
			},

		get_tournament_team : function(tournamentID){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				'with_player'	: true,
				};

			// set status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_tournament_team', param, {
				200 : function(data){

					// take team
					self.team_list = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		get_schedule : function(tournamentID, tournament_type = 'regular_season'){
			var self = this, param;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				'type'			: tournament_type,
				};

			// check basically if request is okay
			if(!param.tournamentID || !param.type){

				// set error status
				self.status = 400;
				return;
				}

			// set status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_schedule', param, {
				200 : function(data){

					// filter
					data = _.filter(data, function(e){

						// all games which were already played
						return !e.winner_teamID;
						});

					// sort list by scheduleID
					data = _.sortBy(data, 'scheduleID');

					// take list
					self.schedule_list = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		get_champion : function(){
			var self = this, param;

			// set status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_load_champion', param, {
				200 : function(data){

					// take champion list
					self.champion_list = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		create_new_game : function(entry){
			var self = this, param;

			// define param
			param = {
				'tournamentID'		: entry.tournamentID,
				'team_oneID'		: entry.team_oneID,
				'team_twoID'		: entry.team_twoID,
				'winner_teamID'		: entry.winner_teamID,
				'scheduleID'		: entry.scheduleID,
				'type'				: entry.type,
				'gameDate'			: entry.gameDate,
				'duration'			: entry.duration,
				'data'				: entry.data,
				};

			// check basically if request is okay
			if(!param.tournamentID || !param.team_oneID || !param.team_twoID || !param.winner_teamID || !param.type || !param.gameDate || !param.duration || !param.data){

				// set error and return here
				self.status = 400;
				return;
				}

			// set status
			self.status = 100;

			// create game
			$leagueapi.send_request('customstats_tournament_api_create_tournament_game', param, {
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
				'tournamentID'		: self.tournament_entry.tournamentID,
				'scheduleID'		: self.newgame.scheduleID ? self.newgame.scheduleID : 0,
				'gameDate'			: self.newgame.gameDate,
				'base64_image' 		: '',
				'extension'			: file.type,
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

		upload_image : function(entry){
			var self = this, param;

			// define param
			param = {
				'type'				: 'tournament_game_source',
				'base64_image'		: entry.base64_image,
				'extension'			: entry.extension,
				'size'				: entry.size,
				'param'				: {
					'tournamentID'	: entry.tournamentID,
					'scheduleID'	: entry.scheduleID,
					'gameDate'		: entry.gameDate,
					},
				};

			// check basically if request is okay
			if(!param.type || !param.param.tournamentID || !param.param.scheduleID || !param.param.gameDate || !param.base64_image || !param.extension || !param.size){

				// set error status
				self.status = 400;
				return;
				}

			// define status
			self.status = 100;

			// upload
			$leagueapi.send_request('customstats_tournament_api_upload_tournament_image', param, {
				201 : function(data){

					// set image uploaded
					self.show.image_uploaded = true;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		precheck_new_game : function(entry){
			var self = this, ban_list = [],
				error_delay = 5, success_delay = 5; // sec

			// set tournamentID
			entry.tournamentID = self.tournament_entry.tournamentID;

			// set type
			entry.type = self.tournament_type;

			// take checkbox winner and define winner teamID
			entry.winner_teamID = (entry.team_one_won) ? entry.team_oneID : entry.team_twoID;

			// for each ban object (team 1)
			_.each(entry.data.game_ban_t1, function(e){

				// if not set, skip
				if(_.isUndefined(e) || !e.championID) return;

				// set team
				e.team = 1;

				// get champion name by ID
				e.champion = _.findWhere(self.champion_list, {'championID' : e.championID}).name;

				// add to list
				ban_list.push(e);
				});

			// for each ban object (team 2)
			_.each(entry.data.game_ban_t2, function(e){

				// if not set, skip
				if(_.isUndefined(e) || !e.championID) return;

				// set team
				e.team = 2;

				// get champion name by ID
				e.champion = _.findWhere(self.champion_list, {'championID' : e.championID}).name;

				// add to list
				ban_list.push(e);
				});

			// take combined ban list
			entry.data.game_ban = ban_list;


			// final basic param check
			var param = angular.copy(entry);

			// 1) game params
			if(!param.winner_teamID || !param.gameDate || !param.duration){

				// set and return error
				return self.set_error_message('Fehler... Überprüfe Teams|Gewinner|Typ|Datum|Spiellänge.', error_delay);
				}

			// 2) game player params
			_.each(param.data.game_player, function(e){

				// set won true, if team won this game
				if(e.team == 1) e.won = (param.team_one_won) ? true : false;
				if(e.team == 2) e.won = (param.team_two_won) ? true : false;

				// get champion name
				if(e.championID) e.champion = _.findWhere(self.champion_list, {'championID' : e.championID}).name;

				// default deeper error
				var deeper_error = false;

				// for these special possible 0 values, set default (avoid 0 in html for better usage)
				_.each(['kills', 'deaths', 'assists', 'creep_score'], function(key){

					// if not set, set it 0
					if(e[key] === '' && !deeper_error) return deeper_error = true;
					});

				// on error
				if(deeper_error){

					// show error
					return self.set_error_message('Fehler... Überprüfe Kills|Deaths|Assists|Creep Score', error_delay);
					}

				// on error
				if(!e.playerID || !e.team || !e.championID || !e.champion || !e.summoner_one || !e.summoner_two || !e.level || !e.gold || !e.position || typeof e.won !== 'boolean'){

					// show error
					return self.set_error_message('Fehler... Überprüfe Spieler|Champion|Summoners|Level|Position|Gold', error_delay);
					}

				// convert summoners to lowecase
				e.summoner_one = e.summoner_one.toLowerCase();
				e.summoner_two = e.summoner_two.toLowerCase();
				e.position = e.position.toLowerCase();
				});

			// 3) check game winner (need one, don't allow none or two)
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

		check_schedule : function(team_oneID, team_twoID){
			var self = this, schedule_list, schedule;

			// if not defined, return
			if(!team_oneID || !team_twoID) return;

			// take schedule
			schedule_list = _.sortBy(angular.copy(self.schedule_list), 'scheduleID');

			// search for schedule game (take first found)
			schedule = _.findWhere(schedule_list, {'team_oneID': team_oneID, 'team_twoID': team_twoID});

			// if nothing found, return
			if(_.isUndefined(schedule)) self.newgame.scheduleID = 0;

			// take scheduleID globally
			self.newgame.scheduleID = schedule.scheduleID;
			},

		set_error_message : function(message, delay){
			var self = this;

			// set message
			self.error_message = message;

			// delay reset
			return $timeout(function(){ self.error_message = '' }, delay * 1000);
			},

		set_success_message(success_type, delay){
			var self = this;

			// show success
			self[success_type] = true;

			// delay reset
			return $timeout(function(){ self[success_type] = false }, delay * 1000);
			},

		reduce_team_playerlist : function(teamID, team){
			var self = this, selected_team;

			// find team by teamID
			selected_team = _.findWhere(self.team_list, {'teamID' : teamID});

			// set playerlist
			if(team == 1) self.newgame.playerlist_t1 = selected_team.playerlist;
			if(team == 2) self.newgame.playerlist_t2 = selected_team.playerlist;
			},

		};

	// initialize
	$scope.newgame.get_tournament();
	$scope.newgame.get_champion();

	}]);