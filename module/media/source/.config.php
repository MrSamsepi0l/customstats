<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:sources']);

	// if user has right
	if($this->check_user_right('customstats:sources')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Champions',
			'group'		=> 'navbar:source',
			'route'		=> 'sources',
			'path'		=> $moduleurl.'/source.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/source.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/source.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_load_source_url',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
