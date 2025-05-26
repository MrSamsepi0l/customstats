<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_base:leagueapi_config', 'customstats:request:base_leagueapi:get', 'customstats:request:base_leagueapi:update', 'customstats:request:base_leagueapi:create']);

	// if user has right
	if($this->check_user_right('customstats:admin_base:leagueapi_config')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin Leagueapi Config',
			'group'		=> 'navbar:admin:leagueapi',
			'route'		=> 'leagueapi_config',
			'path'		=> $moduleurl.'/leagueapi_config.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/leagueapi_config.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/leagueapi_config.js', 50);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_leagueapi:get')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_get_leagueapi',
			'ns'		=> '\customstats\base\leagueapi::get_leagueapi',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_leagueapi:create')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_create_leagueapi',
			'ns'		=> '\customstats\base\leagueapi::create_leagueapi',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	// if user has right
	if($this->check_user_right('customstats:request:base_leagueapi:update')){

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_update_leagueapi',
			'ns'		=> '\customstats\base\leagueapi::update_leagueapi',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
