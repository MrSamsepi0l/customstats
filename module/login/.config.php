<?php

// if user is not logged
if(!$this->user_logged()){

	/* Füge sämtliche Routing Objekte zum Hook hinzu */
	$this->build_environment('body:routing[]', (object)[
		'name'		=> 'Login',
		'group'		=> 'navbar:login',
		'route'		=> 'login',
		'path'		=> $moduleurl.'/login.html',
		'enabled'	=> true,
		'priority'	=> 10,
		]);

	/* JS & CSS Modul laden */
	$this->build_environment('header:js[]', $moduleurl.'/login.js', 50);
	$this->build_environment('header:css[]', $moduleurl.'/login.css', 50);
	}
