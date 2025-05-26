<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin:new_game', 'customstats:request:leagueapi_player:get', 'customstats:request:leagueapi_champions:get', 'customstats:request:leagueapi_customgame:create']);

	// if user has right
	if($this->check_user_right('customstats:admin:new_game')){

		// /* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin New Game',
			'group'		=> 'navbar:admin',
			'route'		=> 'new_game',
			'path'		=> $moduleurl.'/new_game.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/new_game.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/new_game.css', 50);
		}

	// if user has right
	if($this->check_user_right('customstats:request:leagueapi_champions:get')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_load_champion',
			'param'		=> false,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:leagueapi_player:get')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_load_player',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:leagueapi_customgame:create')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_api_create_custom_game',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_api_upload_customgame_source',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
