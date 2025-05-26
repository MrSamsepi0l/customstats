<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:dashboard']);

	// if user has right
	if($this->check_user_right('customstats:dashboard')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Dashboard',
			'group'		=> 'navbar:dashboard',
			'route'		=> 'dashboard',
			'path'		=> $moduleurl.'/dashboard.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/dashboard.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/dashboard.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_get_dashboard_information',
			'param'		=> false,
			'priority'	=> 700,
			]);

		}

	}
