<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_base:leagueapi_config']);

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

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_get_leagueapi',
			'ns'		=> '\customstats\api::get_leagueapi',
			'param'		=> true,
			'priority'	=> 700,
			]);

		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_create_leagueapi',
			'ns'		=> '\customstats\base\leagueapi::create_leagueapi',
			'param'		=> true,
			'priority'	=> 700,
			]);

		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_update_leagueapi',
			'ns'		=> '\customstats\base\leagueapi::update_leagueapi',
			'param'		=> true,
			'priority'	=> 700,
			]);

		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_delete_leagueapi',
			'ns'		=> '\customstats\api::delete_leagueapi',
			'param'		=> true,
			'priority'	=> 700,
			]);

		}

	}
