<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:champions']);

	// if user has right
	if($this->check_user_right('customstats:champions')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Champions',
			'group'		=> 'navbar:champions',
			'route'		=> 'champions',
			'path'		=> $moduleurl.'/champions.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/champions.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/champions.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_get_champion_analysis',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
