<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:highlights']);

	// if user has right
	if($this->check_user_right('customstats:highlights')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Highlights',
			'group'		=> 'navbar:highlights',
			'route'		=> 'highlights',
			'path'		=> $moduleurl.'/highlights.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_get_replay',
			'param'		=> true,
			'priority'	=> 700,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/highlights.js', 50, 'defer');
		$this->build_environment('header:css[]', $moduleurl.'/highlights.css', 50);
		}

	}