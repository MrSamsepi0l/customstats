<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tournament']);

	// if user has right
	if($this->check_user_right('customstats:tournament')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Tournament Overview',
			'group'		=> 'navbar:tournament',
			'route'		=> 'tournament_dashboard',
			'path'		=> $moduleurl.'/dashboard.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/dashboard.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/dashboard.css', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_get_match_history',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
