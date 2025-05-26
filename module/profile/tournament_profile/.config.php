<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tournament_profile']);

	// if user has right
	if($this->check_user_right('customstats:tournament_profile')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Turnier Profil',
			'group'		=> 'navbar:profile',
			'route'		=> 'tournament_profile',
			'path'		=> $moduleurl.'/tournament_profile.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/tournament_profile.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_tournament_api_get_profile',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_get_config',
			'ns'		=> '\customstats\base\config::get_config',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// special right to get css classes
	if($this->user_has_one_of_right(['customstats:all_player', 'customstats:league_profile', 'customstats:tournament_profile'])){

		// CSS Modul laden
		$this->build_environment('header:css[]', $moduleurl.'/tournament_profile.css', 50);
		}
	}
