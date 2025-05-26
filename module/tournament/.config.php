<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tournament']);

	// if user has right
	if($this->check_user_right('customstats:tournament')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Tournament',
			'group'		=> 'navbar:tournament',
			'route'		=> 'tournament',
			'path'		=> $moduleurl.'/tournament.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/tournament.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/tournament.css', 50);
		}

	// if user has right
	if($this->check_user_right('customstats:tournament')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_get_tournament',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_get_tournament_team',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_get_player_analysis',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_get_schedule',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
