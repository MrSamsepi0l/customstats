<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_tournament:player']);

	// if user has right
	if($this->check_user_right('customstats:admin_tournament:player')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Turnierspieler',
			'group'		=> 'navbar:admin',
			'route'		=> 'tournament_player',
			'path'		=> $moduleurl.'/tournament_player.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/player.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/player.css', 50);
		}

	}
