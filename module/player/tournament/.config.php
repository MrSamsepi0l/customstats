<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tournament:all_profile']);

	// if user has right
	if($this->check_user_right('customstats:tournament:all_profile')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Champions',
			'group'		=> 'navbar:all_profile',
			'route'		=> 'tournament_all_profile',
			'path'		=> $moduleurl.'/all_profile.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		// $this->build_environment('header:css[]', $moduleurl.'/all_profile.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/all_profile.js', 50);

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

	}
