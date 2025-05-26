'use strict';

angular.module('customstats').controller('customstats.analysis:evaluation:stat_tool_controller', ['$scope', '$app', '$phpdate', '$leagueapi', function($scope, $app, $phpdate, $leagueapi){

	$scope.stat_tool = {

		// basics
		data			: [],
		entry_left		: null,
		entry_right 	: null,
		data_left		: [],
		data_right		: [],
		status			: null,
		list_copy_left 	: [],
		list_copy_right	: [],
		mode			: 'champ_and_champ',
		scroll_elem		: {
			list_left 	: 0,
			list_right	: 0,
			},

		// filter and ordering
		filter 			: {
			champion_left 	: '',
			champion_right  : '',
			},
		order_by		: null,

		get_champion : function(){
			var self = this, param;

			// init status
			self.status = 100;

			// load user list
			$leagueapi.send_request('customstats_load_champion', param, {
				200 : function(data){

					// take data
					self.data = data;

					self.data_left = data;
					self.data_right = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		get_game : function(){
			var self = this, param;

			// init status
			self.status = 100;

			// load user list
			$leagueapi.send_request('customstats_api_get_game_player', param, {
				200 : function(data){

					// take data
					self.customgame_list = data;
					},
				'*' : function(data, status){

					// set status
					self.status = status;
					}
				});
			},

		filter_list : function(input, list_side = 'left'){
			var self = this, copy_left, copy_right, search_champ;

			// copy complete champ list if not set
			if(!_.size(self.list_copy_left)) self.list_copy_left = angular.copy(self.data_left);
			if(!_.size(self.list_copy_right)) self.list_copy_right = angular.copy(self.data_right);

			// on left side
			if(list_side == 'left'){

				// default false
				self.comparison_left = false;

				// define list left
				copy_left = angular.copy(self.list_copy_left);

				// filter champ list
				self.data_left = _.filter(copy_left, function(e){

					// search directly by name and set champion if found
					if(e.name == input || e.champion_converted) search_champ = e;

					// by quantity of user input
					return e.name.includes(input) || e.name_converted.includes(input);
					});

				// define champ found
				search_champ = (search_champ) ? search_champ : (_.size(self.data_left) == 1) ? self.data_left[0] : false;

				// if one specific champ found, take it
				if(search_champ){

					// reduce list
					self.data_left = [search_champ];

					// show comparison left
					self.comparison_left = true;

					// set entry globally
					self.entry_left = search_champ;

					// if right side has more than one champion in list, reduce right list
					if(!self.comparison_right) self.precheck_list(search_champ, 'left');
					}

				// if both sides have only one champion selected, comparison matches so calculate stats
				if(self.comparison_left && self.comparison_right) self.calculate_stats(self.entry_left, self.entry_right);
				}

			// on right side
			if(list_side == 'right'){

				// default false
				self.comparison_right = false;

				// define list right
				copy_right = angular.copy(self.list_copy_right);

				// filter champ list
				self.data_right = _.filter(copy_right, function(e){

					// search directly by name and set champion if found
					if(e.name == input || e.champion_converted) search_champ = e;

					// by quantity of user input
					return e.name.includes(input) || e.name_converted.includes(input);
					});

				// define champ found
				search_champ = (search_champ) ? search_champ : (_.size(self.data_right) == 1) ? self.data_right[0] : false;

				// if one specific champ found, take it
				if(search_champ){

					// reduce list to entry
					self.data_right = [search_champ];

					// show comparison right
					self.comparison_right = true;

					// set entry globally
					self.entry_right = search_champ;

					// if left side has more than one champion in list, reduce left list
					if(!self.comparison_left) self.precheck_list(search_champ, 'right');
					}

				// if both sides have only one champion selected, comparison matches so calculate stats
				if(self.comparison_right && self.comparison_left) self.calculate_stats(self.entry_left, self.entry_right);
				}
			},

		precheck_list : function(champion, side = 'left'){
			var self = this, gamelist,
				group_by_gameID, result_list = [];

			// take games
			gamelist = angular.copy(self.customgame_list);

			// group game_player list by game ID
			group_by_gameID = _.groupBy(gamelist, 'gameID');

			//  for each game_player list and it's game ID
			_.each(group_by_gameID, function(game_list, gameID){

				// // get all champion ID as array
				var championID_list = _.allKeys(_.indexBy(game_list, 'championID'));

				// // list doesn't contain the inputs champion ID, skip
				if(!_.contains(championID_list, champion.championID.toString())) return;

				// for every game played
				_.each(game_list, function(game){

					// if equal champion, skip
					if(game.championID == champion.championID) return;

					// if already added to result list, skip
					if(_.findWhere(result_list, {'championID': game.championID})) return;

					// add champion to result list
					result_list.push(_.findWhere(self.data, {'championID': game.championID}));
					});
				});

			// on mode left: set reduced filtered list for RIGHT side
			if(side == 'left') self.data_right = result_list;

			// on mode right: set reduced filtered list for LEFT side
			if(side == 'right') self.data_left = result_list;
			},

		calculate_stats(first, second){
			var self = this, gamelist,
				times_played_together = 0,
				times_won_together = 0,
				times_played_against = 0,
				times_won_first = 0,
				times_won_second = 0;

			// take games
			gamelist = angular.copy(self.customgame_list);

			// group by game ID
			gamelist = _.groupBy(gamelist, 'gameID');

			// for each game list and it's game ID
			_.each(gamelist, function(list, gameID){

				// default, false means not found and team ID second
				var first_found  = {'teamID': 0, 'won': false},
					second_found = {'teamID': 0, 'won': false};

				// for each game_player (10 for each player and his champion)
				_.each(list, function(game){

					// if first champion matches
					if(game.championID == first.championID){

						// set team ID
						first_found.teamID = game.teamID;

						// define if player won this game
						first_found.won = (game.won) ? true : false;
						}

					// if second champion matches
					if(game.championID == second.championID){

						// set team ID
						second_found.teamID = game.teamID;

						// define if player won this game
						second_found.won = (game.won) ? true : false;
						}
					});

				// if both found and they were in the same team
				if(first_found.teamID && second_found.teamID && first_found.teamID == second_found.teamID){

					// increment times played together
					times_played_together++;

					// if they won this game, increment
					if(first_found.won && second_found.won) times_won_together++;
					}

				// if both found and they were not in the same team
				if(first_found.teamID && second_found.teamID && first_found.teamID != second_found.teamID){

					// increment times played against
					times_played_against++;

					// if first player won this game, increment
					if(first_found.won) times_won_first++;

					// if second player won this game, increment
					if(second_found.won) times_won_second++;
					}
				});

			// default winrate to 0
			var winrate_together = 0, winrate_first_vs_second = 0, winrate_second_vs_first;

			// if they played at least one game together in team, calculate winrate together
			if(times_played_together) winrate_together = times_won_together / times_played_together * 100;

			// if they played at least one game against each other
			if(times_played_against){

				// calculate winrate against each other
				winrate_first_vs_second = times_won_first / times_played_against * 100;
				winrate_second_vs_first = times_won_second / times_played_against * 100;
				}

			// set all stats globally
			self.stat_two_champs = {
				show 					: true,
				times_played_together	: times_played_together,
				times_won_together		: times_won_together,
				winrate_together 		: winrate_together,
				times_played_against	: times_played_against,
				winrate_first_vs_second : winrate_first_vs_second,
				winrate_second_vs_first : winrate_second_vs_first,
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

	// initialize
	$scope.stat_tool.get_champion();
	$scope.stat_tool.get_game();

	}]);
