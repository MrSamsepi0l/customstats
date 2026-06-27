<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:admin:phplog']);

	// if user has right
	if($this->check_user_right('customstats:admin:phplog')){

		// /* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'PHP-Log',
			'group'		=> 'navbar:admin',
			'route'		=> 'phplog',
			'path'		=> $moduleurl.'/phplog.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:js[]', $moduleurl.'/phplog.js', 50);
		$this->build_environment('header:css[]', $moduleurl.'/phplog.css', 50);

		// Ausführbare Funktionen inkl. benötigtes Recht
		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_admin_get_info',
			'ns'		=> '\customstats\phplog::get_info',
			'param'		=> true,
			'priority'	=> 700,
			]);

		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_admin_get_phplog_file',
			'ns'		=> '\heart\app\logtree::get_logfile',
			'param'		=> true,
			'priority'	=> 700,
			]);

		$this->build_environment('customstats_base_api:execute[]', (object)[
			'fn'		=> 'customstats_admin_get_phplog_path',
			'ns'		=> '\heart\app\logtree::get_logpath',
			'param'		=> true,
			'priority'	=> 700,
			]);
		}

	}
