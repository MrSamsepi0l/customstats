<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_tournament:tournament']);

	// if user has right
	if($this->check_user_right('customstats:admin_tournament:tournament')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Turnierkonfiguration',
			'group'		=> 'navbar:admin',
			'route'		=> 'tournament_config',
			'path'		=> $moduleurl.'/tournament_config.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/tournament.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/tournament.css', 50);
		}

	}
