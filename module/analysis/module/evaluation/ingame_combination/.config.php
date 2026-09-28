<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:analysis:evaluation:ingame_combination']);

	// if user has right
	if($this->check_user_right('customstats:analysis:evaluation:ingame_combination')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin Base Config',
			'group'		=> 'navbar:analysis:evaluation',
			'route'		=> 'ingame_combination',
			'path'		=> $moduleurl.'/ingame_combination.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/ingame_combination.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/ingame_combination.js', 50, 'defer');

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_load_champion',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_api_get_game_player',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_api_get_player',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
