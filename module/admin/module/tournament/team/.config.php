<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_tournament:team']);

	// if user has right
	if($this->check_user_right('customstats:admin_tournament:team')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Turnier-Team Konfiguration',
			'group'		=> 'navbar:admin',
			'route'		=> 'tournament_team',
			'path'		=> $moduleurl.'/tournament_team.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/team.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/team.css', 50);
		}

	}
