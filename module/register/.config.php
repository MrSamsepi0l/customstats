<?php

// if user is not logged
if(!$this->user_logged()){

	// /* Füge sämtliche Routing Objekte zum Hook hinzu */
	// $this->build_environment('body:routing[]', (object)[
	// 	'name'		=> 'Registrierung',
	// 	'group'		=> 'navbar:register',
	// 	'route'		=> 'register',
	// 	'path'		=> $moduleurl.'/register.html',
	// 	'enabled'	=> true,
	// 	'priority'	=> 10,
	// 	]);

	// /* JS & CSS Modul laden */
	// $this->build_environment('header:css[]', $moduleurl.'/register.css', 50);
	// $this->build_environment('header:js[]', $moduleurl.'/register.js', 50);
	}
