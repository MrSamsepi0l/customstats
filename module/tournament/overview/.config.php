<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tournament']);

	// if user has right
	if($this->check_user_right('customstats:tournament')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Tournament Overview',
			'group'		=> 'navbar:tournament',
			'route'		=> 'overview_tournament',
			'path'		=> $moduleurl.'/overview.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/overview.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/overview.css', 50);
		}

	}
