<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:matchhistory']);

	// if user has right
	if($this->check_user_right('customstats:matchhistory')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Global Match History',
			'group'		=> 'navbar:matchhistory',
			'route'		=> 'matchhistory',
			'path'		=> $moduleurl.'/matchhistory.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/matchhistory.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/matchhistory.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_get_global_match_history',
			'param'		=> true,
			'priority'	=> 700,
			]);

		}

	}
