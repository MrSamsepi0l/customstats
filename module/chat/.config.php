<?php

// if user is logged
if($this->user_logged()){

	// activate right
	$this->activate_right(['customstats:chat', 'customstats:request:load_chatlist', 'customstats:request:send_message']);

	// if user has right
	if($this->check_user_right('customstats:chat')){

		/* Füge sämtliche Routing Objekte zum Hook hinzu */
		$this->build_environment('body:routing[]', (object)[
			'name'		=> 'Chat',
			'group'		=> 'navbar:chat',
			'route'		=> 'chat',
			'path'		=> $moduleurl.'/chat.html',
			'enabled'	=> true,
			'priority'	=> 10,
			]);

		/* JS & CSS Modul laden */
		$this->build_environment('header:css[]', $moduleurl.'/chat.css', 50);
		$this->build_environment('header:js[]', $moduleurl.'/chat.js', 50);

		// if user has right to load messages
		if($this->check_user_right('customstats:request:load_chatlist')){

			// Ausführbare Funktionen inkl. benötigtes Recht
			$this->build_environment('customstats_base_api:execute[]', (object)[
				'fn'		=> 'customstats_load_chatlist',
				'ns'		=> '\customstats\api::load_chatlist',
				'param'		=> true,
				'priority'	=> 700,
				]);
			}

		// if user has right to send message
		if($this->check_user_right('customstats:request:send_message')){

			// Ausführbare Funktionen inkl. benötigtes Recht
			$this->build_environment('customstats_base_api:execute[]', (object)[
				'fn'		=> 'customstats_send_message',
				'ns'		=> '\customstats\api::send_message',
				'param'		=> true,
				'priority'	=> 700,
				]);
			}
		}

	}
