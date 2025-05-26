<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_tournament:schedule']);

	// if user has right
	if($this->check_user_right('customstats:admin_tournament:schedule')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Turnier Spielplan',
			'group'		=> 'navbar:admin',
			'route'		=> 'tournament_schedule',
			'path'		=> $moduleurl.'/tournament_schedule.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/schedule.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/schedule.css', 50);
		}

	}
