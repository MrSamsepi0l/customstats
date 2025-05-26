<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tabview_media']);

	// if user has right
	if($this->check_user_right('customstats:tabview_media')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Tabview Admin',
			'group'		=> 'navbar:tabview_media',
			'route'		=> 'tabview_media',
			'path'		=> $moduleurl.'/tabview_media.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		// $this->build_environment('header:css[]', $moduleurl.'/tabview.css', 50);
		// $this->build_environment('header:js[]', $moduleurl.'/tabview.js', 50);
		}

	}
