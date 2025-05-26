<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_game']);

	// if user has right
	if($this->check_user_right('customstats:admin_game')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin Base Config',
			'group'		=> 'navbar:admin',
			'route'		=> 'admin_game',
			'path'		=> $moduleurl.'/admin_game.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/admin_game.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/admin_game.css', 50);
		}

	}
