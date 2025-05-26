<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_base:user_config']);

	// if user has right
	if($this->check_user_right('customstats:admin_base:user_config')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin Base Config',
			'group'		=> 'navbar:admin:base',
			'route'		=> 'user_config',
			'path'		=> $moduleurl.'/user_config.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/user_config.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/user_config.js', 50);
		}

	}
