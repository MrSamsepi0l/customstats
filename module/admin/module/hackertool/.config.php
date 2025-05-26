<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_hackertool']);

	// if user has right
	if($this->check_user_right('customstats:admin_hackertool')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin Base Config',
			'group'		=> 'navbar:admin',
			'route'		=> 'admin_hackertool',
			'path'		=> $moduleurl.'/admin_hackertool.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/admin_hackertool.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/admin_hackertool.css', 50);
		}

	}
