<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin_base:base_config']);

	// if user has right
	if($this->check_user_right('customstats:admin_base:base_config')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Admin Base Config',
			'group'		=> 'navbar:admin:base',
			'route'		=> 'base_config',
			'path'		=> $moduleurl.'/base_config.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/base_config.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/base_config.js', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_get_config',
			'ns'		=> '\customstats\base\config::get_config',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_create_config',
			'ns'		=> '\customstats\base\config::create_config',
			'param'		=> true,
			'priority'	=> 700,
			]);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_base_update_config',
			'ns'		=> '\customstats\base\config::update_config',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
