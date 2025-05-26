<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:analysis:evaluation']);

	// if user has right
	if($this->check_user_right('customstats:analysis:evaluation')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Analysis',
			'group'		=> 'navbar:analysis',
			'route'		=> 'evaluation',
			'path'		=> $moduleurl.'/evaluation.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/evaluation.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/evaluation.css', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_api_get_player',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_get_user',
			'ns'		=> '\customstats\base\user::get_user',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
