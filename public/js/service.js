'use strict';

// Service: $app
angular.module('customstats').factory('$app', ['$rootScope', '$http', '$interval', '$location', '$timeout', function($rootScope, $http, $interval, $location, $timeout){

    // define service stash, used variables only by app service
    var $stash = {

        // define board state
        board_status    : {
            project     : null,
            version     : null,
            version_int : 0,
            version_date: null,
            request_time: 0,
            force_reload: null,
            logged_in   : false,

            // user specific data
            user        : {
                username    : null,
                email       : null,
                enabled     : null,
                donation    : 0,
                api_key     : null,
                real_name   : null,
                createTime  : null,
                total_logins: 0,
                playerID    : 0,
                t_playerID  : 0,
                data        : [],
                right       : [],
                },

            // session specific data
            session_data: {
                active_seconds  : 0,
                active_minutes  : 0,
                active_hours    : 0,
                },

            // server info
            server_info : {
                is_production  : null,
                server_url     : null,
                },
            },

        // service specific data
        board_ready             : false,
        board_listener          : [],
        board_reload_interval   : null,

        };

    // define $app service
    var $app = {
        data       : {},
        hook       : {},
        user_panel : {},
        current_route : null,


        // load board user state
        board_load_status : function(reload_interval){

            // define self
            var self = this;

            // load board status
            this.get('user/status.json', {

                // on success
                200 : function(data){

                    // if server forces reload, do it here
                    if(data.force_reload){

                        // reload instant with cache reset
                        this.board_reload(0, true);
                        }

                    // if reload interval defined infinite and no interval has started
                    if(_.isFinite(reload_interval) && !$stash.board_reload_interval){

                        // define update interval here
                        $stash.board_reload_interval = $interval(function(){

                            // start recursive interval loading
                            self.board_load_status();
                            }, reload_interval);
                        }

                    // mark user as logged in
                    data.logged_in = true;

                    // first, define data also globally
                    self.data = data;

                    // if board status defined and nothing changed since last state, return here
                    if(!_.isUndefined($stash.board_status) && _.isEqual($stash.board_status, data)) return;

                    // replace complete board status
                    $stash.board_status = data;

                    // also set users tournament playerID if possible
                    if(!_.isUndefined(data.user) && !_.isUndefined(data.user.data) && !_.isUndefined(data.user.data.league) && !_.isUndefined(data.user.data.league.tournament.playerID)){

                        // add tournament playerID to board user
                        $stash.board_status.user.t_playerID = data.user.data.league.tournament.playerID;
                        }

                    // if board is already ready
                    if($stash.board_ready){

                        // remove all listeners for board status ready
                        self.board_remove_listener('__board_status_ready');
                        }

                    // define board state as ready
                    $stash.board_ready = true;

                    // run listener
                    _.each($stash.board_listener, function(listener){

                        // run cached callback
                        listener.callback(_.clone($stash.board_status));
                        });
                    },

                // on error
                '*' : function(status){

                    // reload if request failed
                    if(_.isUndefined(status)) self.board_reload(0, true);
                    }
                });
            },

        board_add_listener : function(identifier, callback, execute_if_ready){

            // add callback function to listener
            $stash.board_listener.push({
                'identifier'    : identifier,
                'callback'      : callback,
                });

            // if callback should be executed directly and board is ready
            if(execute_if_ready && $stash.board_ready){

                // execute callback with board data
                callback(_.clone($stash.board_status));
                }

            // return success
            return true;
            },

        board_remove_listener : function(identifier){

            // if no listener set, abort with success
            if(!_.size($stash.board_listener)) return true;

            // run through all listeners in list
            $stash.board_listener = _.reject($stash.board_listener, function(listener){

                // remove all matching listeners (true removes)
                return (listener.identifier === identifier);
                });

            // return success
            return true;
            },

        board_status_ready : function(callback){

            // if callback should executed if is data already set
            if($stash.board_ready){

                // run callback with actual data
                callback(_.clone($stash.board_status));

                // return success
                return true;
                }

            // add callback to listener
            $stash.board_listener.push({
                "identifier": '__board_status_ready',
                "callback"  : callback
                });

            // return success
            return true;
            },

        board_reload : function(reload_delay, reload_cache){

            // define defaults or take given
            var reload_delay = reload_delay || 0,
                reload_cache = reload_cache || true;

            // if there is no reload delay, instant reload and return
            if(!reload_delay) return window.location.reload(reload_cache);

            // start delayed
            return $timeout(function(){

                // location reload
                window.location.reload(reload_cache);
                }, reload_delay);
            },

        board_get_value(key){
            var self = this;

            // if not available
            if(_.isUndefined($stash.board_status.user)) return null;

            // return value
            return $stash.board_status.user[key];
            },

        board_set_value : function(key, val){
            var self = this;

            // set user value
            $stash.board_status.user[key] = val;
            },

        board_get_server_info : function(){

            // return value
            return $stash.board_status.server_info;
            },

        get_hook : function(key){
            var self = this;

            // if reload wanted, do it
            if(!_.isUndefined(self.hook[key])) return self.hook[key];

            // else, return null
            return null;
            },

        user_has_right(right){
            var self = this;

            // get user right list
            var user_right = self.board_get_value('right');

            return _.contains(user_right, right);
            },

        init_navbar(current_route){
            var self = this;

            // take it
            self.current_route = current_route;
            },

        // request functions
        ajax : function(sendobj, title, qfn){
            var self = this;

            // send request
            return $http(sendobj).then(
                function(response){

                    // run each matching response function
                    _.each(qfn, function(fn, i){
                        _.each(i.split('|'), function(status){
                            if(status == response.data.status || status == '*'){
                                fn(response.data.data, response.data.status);
                                }
                            });
                        });
                    },
                function(response){

                    // run each matching response function
                    _.each(qfn, function(fn, status){
                        if(status == 'httperror'){
                            fn(response.httpcode);
                            }
                        });
                    }
                );
            },

        // get
        get : function(url, qfn){

            // executes and return ajax status request
            return this.ajax({"method": "GET", "url": url}, 'League API Request: ajax_status', qfn);
            },

        // executes api request for user status
        send_status_request : function(qfn){

            // send logged request with changed url for user status
            return this.get('user/status.json', qfn);
            },

        // executes logout request
        send_logout_request : function(qfn){

            // send logged request with changed url for user status
            return this.get('/logout', qfn);
            },

        // executes customstats base request
        send_base_request(fn, params, qfn, url){
            var url = url || 'customstats/api/base.json';

            // define postdata object
            var postdata = {'fn': fn};

            // if data, add to object
            if(params) postdata.param = params;

            // execute and return ajax leagueapi request
            return this.ajax({"method": "POST", "url": url, "data": postdata}, 'Base API Request: '+postdata.fn, qfn);
            },

        // connect to chat socket
        connect_chat_socket : function(param, qfn){

            // check for timeout of set default
            var timeout = (param && !_.isUndefined(param.timeout)) ? param.timeout : 35000; // ms = 35 seconds

            // execute request and run callback function
            return this.ajax({'method': 'GET', 'url': 'chat/socket/connect.json', 'timeout': timeout}, 'Connect Chat Socket', qfn);
            },

        send_api_ocr_space_request(url, apikey, param, qfn){

            // API request url
            url = url || 'https://api.ocr.space/parse/image';
            apikey = apikey || 'e2049dfc6788957';

            // define form data
            const form_data = new FormData();

            // for each given param
            _.each(param, function(e, key){

                // add param to request
                form_data.append(key, e);
                });

            // send request to API
            fetch(url, {method: 'POST', headers: {"apikey": apikey}, body: form_data}).then(function(response){

                // decode response, wait for result
                response.json().then(function(decoded_response){

                    // run each matching response function
                    _.each(qfn, function(fn, i){
                        _.each(i.split('|'), function(status){
                            if(status == response.status || status == '*'){
                                fn(decoded_response, response.status);
                                }
                            });
                        });
                    });
                });
            },
        };

    // global sichtbar machen
    $rootScope.app = $app;

    // return app service
    return $app;

    }]);

// Service: $leagueapi
angular.module('customstats').factory('$leagueapi', ['$http', '$app', '$phpdate', '$rootScope', function($http, $app, $phpdate, $rootScope){

    // define obj
    var $leagueapi = {

        // executes api request by name
        send_request : function(fn, params, qfn, url){
            var url = url || 'leagueapi/v1/request.json';

            // define postdata object
            var postdata = {'fn': fn};

            // if data, add to object
            if(params) postdata.param = params;

            // execute and return ajax leagueapi request
            return $app.ajax({"method": "POST", "url": url, "data": postdata}, 'League API Request: '+postdata.fn, qfn);
            },

        get_random_playerlist : function(){

            // return list of random player names directly
            return [
                'A friendly Bot', 'balance pls', 'AirDnB', 'dogger57', 'Hot female IRL',
                'Hans der Schreck', 'ZorkzZZ', 'PaulDieNummer9', 'ReginaRudolf', 'Cestrion', 'Dash Nightfall',
                'AufDiePlötze', 'Bruno Bacardi', 'Adrenalinshadow', 'Horny Luigi', 'Bxsse', 'Boosting Hahn',
                'ZUiUKY', 'ReLeAsEtHeKrAkEn', 'dreyooo', 'Xenoblade Shulk', 'KnolliTheSmain', 'DP Ebony n Ivory', 'zezinho 23',
                'Kornliebhaber23', 'KrakenGod', 'Happy Blueberry', 'Downlaoder', 'Waterwalker', 'V12Motor',
                'Kill That Feets', 'BalSagoth', 'SheSaidShesLvl18', 'fiTheXisTeD', 'Nelanix', 'Pensi', 'Happy Blueberry', 'prasilda66',
                'Pogotronic', 'Stormdom', 'Torte57', 'burn in fires', 'NJ VENOM', 'Too Much Sauce 1', 'Quinntuple',
                'Dr Holiday', 'BIG AND HAIRY', 'MostDoomedAcc', 'ChimpinhÀ', 'Sinfect', 'INT el LEE gent', '1547849', 'ContainerClaus',
                'Thalset', 'Academia Hammer', 'janpulle', 'KloßmitSoß', 'SHaccoTacco',
                ];
            },

        get_champion_name_converted : function(champion_name = null){

            // if no champion name given, return null
            if(_.isEmpty(champion_name)) return champion_name;

            // lowercase champion name without letter spaces
            champion_name = (champion_name.split(' ').join('')).toLowerCase();

            // return converted champion name
            return champion_name;
            },

        get_player_title : function(profile, title_config){
            var self = this, list = [], player;

            // if config or player not defined, stop here
            if(!profile || !title_config) return;

            // copy player entry
            player = profile;

            // for each title
            _.each(title_config, function(config, name, title_config){

                // summoners
                if(name == 'summoners'){

                    // define variables
                    var summoner_list, most_picked_summoner, pendant_config, title;

                    // sort list by total value
                    summoner_list = _.sortBy(player.summoner_list, 'total').reverse();

                    // take most taken summoner object
                    most_picked_summoner = summoner_list[0].summoner == 'Flash' ? summoner_list[1] : summoner_list[0];

                    // get pendant config object
                    pendant_config = _.findWhere(config, {'pair': most_picked_summoner.summoner});

                    // if player hasn't enough games, leave here
                    if(player.times_played < config.min_games) return;

                    // define object
                    title = {
                        'key'   : pendant_config.key,
                        'desc'  : player.ingame_name+' hat in '+Math.round(most_picked_summoner.per_game)+' % seiner Games '+most_picked_summoner.summoner+' dabei.',
                        'color' : pendant_config.color,
                        };

                    // add to result
                    list.push(title);
                    }

                // streak
                if(name == 'streak'){

                    // for each streak config
                    _.each(config, function(e){

                        // if win streak
                        if(e.pair == 'actual_win_streak' && player.player_streak.actual_win_streak >= e.min_wins){

                            // define object
                            title = {
                                'key'   : player.player_streak.actual_win_streak + 'er winning streak',
                                'desc'  : player.ingame_name + ' hat die letzten '+ player.player_streak.actual_win_streak + ' Spiele in Folge gewonnen.',
                                'color' : e.color,
                                };

                            // add to result
                            list.push(title);
                            }

                        // if lose streak
                        if(e.pair == 'actual_lose_streak' && player.player_streak.actual_lose_streak >= e.min_loses){

                            // define object
                            title = {
                                'key'   : player.player_streak.actual_lose_streak + 'er losing streak',
                                'desc'  : player.ingame_name + ' hat die letzten '+ player.player_streak.actual_lose_streak + ' Spiele in Folge verloren.',
                                'color' : e.color,
                                };

                            // add to result
                            list.push(title);
                            }

                        });
                    }

                // champion specfic
                if(name == 'champion_specific'){

                    // for each champion played against this player
                    _.each(player.champion_vs_player, function(champion){

                        // if enough games were played
                        if(champion.times_played_against >= config.effective.min_games && champion.winrate_vs_player >= config.effective.min_winrate){

                            // define object
                            title = {
                                'key'   : champion.champion + '-Schwäche',
                                'desc'  : champion.champion + ' ist sehr effektiv. ' + champion.champion + ' hat in ' + champion.times_played_against + ' Spielen gegen ' + player.ingame_name + ',' + ' eine Winrate von ' + champion.winrate_vs_player + ' %.',
                                'color' : config.effective.color,
                                };

                            // add to result
                            list.push(title);
                            }
                        });

                    // check each champion
                    _.each(player.champion_with_player, function(champion){

                        // define blocker
                        var already_legendary = false;
                        var already_team_diff = false;

                        /* team diff */
                        if(champion.times_played >= config.team_diff.min_games && champion.winrate <= config.team_diff.max_winrate){

                            // define object
                            title = {
                                'key'   : champion.champion + '-Teamdiff',
                                'desc'  : player.ingame_name + ' hat in '+ champion.times_played + ' Spielen eine ' + champion.winrate + ' % Winrate mit ' + champion.champion + '.',
                                'color' : config.expert.color,
                                };

                            // add to result
                            list.push(title);

                            // set true
                            already_team_diff = true;
                            }

                        /* newbie */
                        if(!already_team_diff && champion.times_played >= config.newbie.min_games && champion.winrate <= config.newbie.max_winrate){

                            // define object
                            title = {
                                'key'   : 'Lernt gerade ' + champion.champion,
                                'desc'  : player.ingame_name + ' hat in '+ champion.times_played + ' Spielen eine ' + champion.winrate + ' % Winrate mit ' + champion.champion + '.',
                                'color' : config.newbie.color,
                                };

                            // add to result
                            list.push(title);
                            }

                        /* legendary */
                        if(champion.times_played >= config.legendary.min_games && champion.winrate >= config.legendary.min_winrate){

                            // define object
                            title = {
                                'key'   : ((champion.gender == 1) ? 'Legendärer ' : 'Legendäre ') + champion.champion,
                                'desc'  : player.ingame_name + ' hat in '+ champion.times_played + ' Spielen eine ' + champion.winrate + ' % Winrate mit ' + champion.champion + '.',
                                'color' : config.legendary.color,
                                };

                            // add to result
                            list.push(title);

                            // set true
                            already_legendary = true;
                            }

                        /* expert */
                        if(!already_legendary && champion.times_played >= config.expert.min_games && champion.winrate >= config.expert.min_winrate){

                            // define object
                            title = {
                                'key'   : champion.champion + '-Experte',
                                'desc'  : player.ingame_name + ' hat mit '+ champion.champion + ' eine Winrate von ' + champion.winrate + ' % in ' + champion.times_played + ' Spielen.',
                                'color' : config.expert.color,
                                };

                            // add to result
                            list.push(title);
                            }

                        /* scarry */
                        if(champion.times_played >= config.scarry.min_games && champion.banrate_general >= config.scarry.min_banrate_general && champion.deviation_general_specific < config.scarry.max_deviation_banrate_general_specifc_percent){

                            // define object
                            title = {
                                'key'   : ((champion.gender == 1) ? 'Gefürchteter ' : 'Gefürchtete ') + champion.champion,
                                'desc'  : player.ingame_name + ' hat ' + champion.champion + ' ' + champion.times_played + ' Mal gespielt, ' + champion.champion + ' hat eine allgemeine Banrate von ' + champion.banrate_general + ' % und eine Banrate von ' + champion.banrate_vs_player + ' % gegen diesen Spieler.',
                                'color' : config.scarry.color,
                                };

                            // add to result
                            list.push(title);
                            }

                        /* main */
                        if(champion.times_played >= config.main.min_games && champion.pickrate_player >= config.main.min_pickrate){

                            // if first or second matches
                            if((champion.pickable_rate <= config.main.max_pickable_rate_first && champion.deviation_pickable_rate_pickrate <= config.main.max_deviation_first) || (champion.pickable_rate >= config.main.min_pickable_rate && champion.deviation_pickable_rate_pickrate <= config.main.max_deviation_second)){

                                // define object
                                title = {
                                    'key'   : champion.champion + '-Main',
                                    'desc'  : player.ingame_name + ' hat in ' + player.times_played + ' Spielen bei einer Banrate von ' + champion.banrate_vs_player + ' % gegen ihn, ' + champion.champion + ' ' + champion.times_played + ' Mal von möglichen ' + champion.times_champ_was_pickable + ' Malen gepickt.',
                                    'color' : config.main.color,
                                    };

                                // add to result
                                list.push(title);
                                }
                            }

                        });
                    }

                // position
                if(name == 'position'){

                    // variables for usage
                    var position_list, main_position, translation;

                    // sort by config option
                    position_list = _.sortBy(player.position_list, config.option.key).reverse();

                    // take position
                    main_position = _.first(position_list);

                    // translation
                    translation = {'top':'Toplaner','jungle':'Jungler','mid':'Midlaner','adc':'Botlaner','support':'Supporter'};

                    // define object
                    title = {
                        'key'   : translation[main_position.role],
                        'desc'  : player.ingame_name + ' hat '+ main_position.times_played + ' Spiele als ' + translation[main_position.role] + ' absolviert - mit einer Winrate von ' + main_position.winrate + ' %.',
                        'color' : config.color,
                        };

                    // add to result
                    list.push(title);
                    }

                // player specific
                if(name == 'player_specific'){

                    // variables for usage
                    var sorted_playerlist, matched_player, sort_options, description;

                    // for each possible title
                    _.each(config, function(e, key){

                        // remove players not matching
                        sorted_playerlist = _.reject(player.stat_playerlist, function(reject){

                            // remove all players having not enough games
                            return reject.times_played < e.min_games;
                            });


                        // remove players with last game longer ago than one year; TODO: take 'retired' stat and do dynamically from config value
                        sorted_playerlist = _.reject(sorted_playerlist, function(player_reject){

                            // define some variables
                            var now, last_game_player, last_game_general, difference_player_and_now, difference_general_and_now;

                            // unixtime now
                            now = $phpdate('now').format('U');
                            last_game_player = $phpdate(player_reject.last_game).format('U');
                            last_game_general = $phpdate(player_reject.last_game_date_general).format('U');

                            // difference now and players last game
                            difference_player_and_now = (now - last_game_player) / 3600 / 24;
                            difference_general_and_now = (now - last_game_general) / 3600 / 24;

                            return (difference_player_and_now >= 365 && difference_general_and_now < 365);
                            });



                        // split sort string
                        sort_options = e.sort.split('|');

                        // sort playerlist by config option
                        sorted_playerlist = _.sortBy(sorted_playerlist, sort_options[0]);

                        // reverse if sort option is descending
                        if(sort_options[1] == 'desc') sorted_playerlist = sorted_playerlist.reverse();

                        // take player
                        matched_player = _.first(sorted_playerlist);

                        // if player does not match, skip
                        if(matched_player.playerID != player.playerID) return;

                        // define descriptions
                        description = {
                            'high_avg_kills'    :   player.ingame_name + ' hat mit ' + player.avg_kills + ' Kills / Game die höchste Durchschnittskillrate.',
                            'low_avg_kills'     :   player.ingame_name + ' hat mit ' + player.avg_kills + ' die Kills / Game niedrigste Durchschnittskillrate.',
                            'high_avg_deaths'   :   player.ingame_name + ' hat mit ' + player.avg_deaths + ' Toden / Game die höchste Durchschnittstodesrate.',
                            'low_avg_deaths'    :   player.ingame_name + ' hat mit ' + player.avg_deaths + ' Toden / Game die niedrigste Durchschnittstodesrate.',
                            'high_avg_assists'  :   player.ingame_name + ' hat mit ' + player.avg_assists + ' Assists / Game die höchste Durchschnittsassistrate.',
                            'low_avg_assists'   :   player.ingame_name + ' hat mit ' + player.avg_assists + ' Assists / Game die niedrigste Durchschnittsassistrate.',
                            'high_kda_numb'     :   player.ingame_name + ' hat mit ' + player.kda_number + ' die höchste K / D / A.',
                            'low_kda_numb'      :   player.ingame_name + ' hat mit ' + player.kda_number + ' die niedrigste K / D / A.',
                            'high_cs_per_min'   :   player.ingame_name + ' hat mit ' + player.cs_per_minute + ' CS / Minute den höchsten Farm pro Minute.',
                            'low_cs_per_min'    :   player.ingame_name + ' hat mit ' + player.cs_per_minute + ' CS / Minute den niedrigsten Farm pro Minute.',
                            };

                        // define object
                        title = {
                            'key'   : e.name,
                            'desc'  : description[key],
                            'color' : e.color,
                            };

                        // add to result
                        list.push(title);
                        });
                    }

                // player destroyer
                if(name == 'destroyer'){

                    // for each player good against this player
                    _.each(player.good_against_player, function(p){

                        // calculate winrate vs other player (if p1 or p2 combined)
                        p.winrate_this_player = (p.player_oneID == player.playerID) ? p.winrate_p1_vs_p2 : 100 - p.winrate_p1_vs_p2;

                        // check against config values, skip if invalid
                        if(p.winrate_this_player < config.min_winrate_against_player || p.times_played_against < config.min_games) return;

                        // take other player
                        var other_player_name = (p.player_oneID == player.playerID) ? p.player_two_name : p.player_one_name;

                        // define object
                        title = {
                            'key'   : other_player_name + '-Zerstörer',
                            'desc'  : player.ingame_name + ' hat in ' + p.times_played_against + ' Spielen gegen ' + other_player_name + ' eine Winrate von ' + p.winrate_this_player + ' %.',
                            'color' : config.color,
                            };

                        // add to result
                        list.push(title);
                        })
                    }

                // player retired
                if(name == 'retired'){

                    // if even enough games played
                    if(player.times_played >= config.min_games){

                        // define some variables
                        var now, last_game_player, last_game_general, difference_player_and_now, difference_general_and_now;

                        // unixtime now
                        now = $phpdate('now').format('U');
                        last_game_player = $phpdate(player.last_game).format('U');
                        last_game_general = $phpdate(player.last_game_date_general).format('U');

                        // difference now and players last game
                        difference_player_and_now = (now - last_game_player) / 3600 / 24;
                        difference_general_and_now = (now - last_game_general) / 3600 / 24;

                        // if difference between now and players last game is greater than config time (e.g. a year) and the difference between now and last game general is smaller than config min days
                        if(difference_player_and_now >= config.min_days_past && difference_general_and_now < config.min_days_past){

                            // define object
                            title = {
                                'key'   : config.name,
                                'desc'  : player.ingame_name + 's letztes Spiel ist ' + parseInt(difference_player_and_now) + ' Tage her. Das letzte Spiel generell war am ' + $phpdate(player.last_game_date_general).format('d-m-Y') + '.',
                                'color' : config.color,
                                };

                            // add to result
                            list.push(title);
                            }
                        }
                    }

                });

            // sort list by color (before adding custom titles)
            list = _.sortBy(list, 'color').reverse();

            // if custom title list given
            if(!_.isUndefined(player.tag.custom_title)){

                // for each custom title from player tag
                _.each(player.tag.custom_title.list, function(e){

                    // simply add to list
                    list.unshift(e);
                    });
                }

            // return list
            return list;
            },

        };

    // make service globally available
    $rootScope.leagueapi = $leagueapi;

    // return $leagueapi service
    return $leagueapi;
    }]);


// Service: $phpdate
angular.module('customstats').factory('$phpdate', [function(){
    return function(value){
        var m;
        if(value == 'now') m = moment();
        else if(value == 'today') m = moment({"hour":0,"minute":0,"second":0});
        else m = moment(typeof value == 'string' && value.match(/^[0-9]*(?:\.[0-9]*|)$/) ? parseFloat(value) : value);
        if(!m) window.console.log("Invalid value for moment(): "+value);
        m.format = function(str){
            if(!m){ return '';}
            var t = m.valueOf();
            if(t > 2000000000) t = t/1000;
            return date(str ? str : 'Y-m-d H:i:s', t);
            };
        return m;
        }
    }]);
