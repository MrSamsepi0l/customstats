<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:profile']);

	// if user has right
	if($this->check_user_right('customstats:profile')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Profil',
			'group'		=> 'navbar:profile',
			'route'		=> 'profile',
			'path'		=> $moduleurl.'/profile.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/profile.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/profile.js', 50);
		}
	}
