<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_base','customstats:request:base_user:get','customstats:request:base_user:create','customstats:request:base_user:update','customstats:request:base_user:create_user_right','customstats:request:base_user:delete_user_right']);

	// if user has right
	if($this->check_user_right('customstats:admin_base')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin Base Config',
			'group'		=> 'navbar:admin',
			'route'		=> 'admin_base',
			'path'		=> $moduleurl.'/admin_base.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/admin_base.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/admin_base.css', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_leagueapi:execute[]', (object)[
			'fn'		=> 'customstats_api_get_player',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_user:get')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_get_user',
			'ns'		=> '\customstats\base\user::get_user',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_user:create')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_create_user',
			'ns'		=> '\customstats\base\user::create_user',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_user:update')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_update_user',
			'ns'		=> '\customstats\base\user::update_user',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_user:create_user_right')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_create_user_right',
			'ns'		=> '\customstats\base\user\right::create_user_right',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_user:delete_user_right')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_delete_user_right',
			'ns'		=> '\customstats\base\user\right::delete_user_right',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
