<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:best_of']);

	// if user has right
	if($this->check_user_right('customstats:best_of')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'best_of',
			'group'		=> 'navbar:best_of',
			'route'		=> 'best_of',
			'path'		=> $moduleurl.'/best_of.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/best_of.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/best_of.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_get_config',
			'ns'		=> '\customstats\base\config::get_config',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_get_bestof_analysis',
			'param'		=> false,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_get_timeserie',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
