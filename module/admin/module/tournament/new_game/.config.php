<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_tournament:new_game']);

	// if user has right
	if($this->check_user_right('customstats:admin_tournament:new_game')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Neues Turnier Spiel',
			'group'		=> 'navbar:admin',
			'route'		=> 'tournament_new_game',
			'path'		=> $moduleurl.'/tournament_new_game.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/new_game.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/new_game.css', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_create_tournament_game',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_upload_tournament_image',
			'param'		=> true,
			'priority'	=> 700,
			]);


		}

	}
