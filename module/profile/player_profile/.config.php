<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:league_profile']);

	// if user has right
	if($this->check_user_right('customstats:league_profile')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'League Profil',
			'group'		=> 'navbar:profile',
			'route'		=> 'player_profile',
			'path'		=> $moduleurl.'/player_profile.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/player_profile.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_api_get_player',
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
	if($this->check_user_right('customstats:all_player') or $this->check_user_right('customstats:league_profile')){

		// CSS Modul laden
		$this->build_environment('header:css[]', $moduleurl.'/player_profile.css', 50);
		}
	}
