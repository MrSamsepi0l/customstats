<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin:commandline']);

	// if user has right
	if($this->check_user_right('customstats:admin:commandline')){

		// /* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Command Line (CMD)',
			'group'		=> 'navbar:admin',
			'route'		=> 'commandline',
			'path'		=> $moduleurl.'/commandline.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/commandline.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/commandline.css', 50);
		}

	}
