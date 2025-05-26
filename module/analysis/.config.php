<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tabview_analysis']);

	// if user has right
	if($this->check_user_right('customstats:tabview_analysis')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Tabview Admin',
			'group'		=> 'navbar:tabview_analysis',
			'route'		=> 'tabview_analysis',
			'path'		=> $moduleurl.'/tabview_analysis.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		// $this->build_environment('header:css[]', $moduleurl.'/tabview.css', 50);
		// $this->build_environment('header:js[]', $moduleurl.'/tabview.js', 50);
		}

	}
