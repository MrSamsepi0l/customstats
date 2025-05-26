<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:tabview_all_player']);

	// if user has right
	if($this->check_user_right('customstats:tabview_all_player')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Tabview All Player',
			'group'		=> 'navbar:tabview_all_player',
			'route'		=> 'tabview_all_player',
			'path'		=> $moduleurl.'/tabview_all_player.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);
		}

	}
