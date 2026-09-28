<?php

// Wrapper zur Umgebung hinzufügen
$this->build_environment('body:wrapper', $this->path->app.$moduleurl.'/wrapper.php');

if($this->user_logged()){

	/* Füge sämtliche Routing Objekte zum Hook hinzu */
	$this->build_environment('body:routing[]', (object)[
		'name'		=> 'Navigation Logged',
		'group'		=> 'navigation:logged',
		'route'		=> 'navigation_logged',
		'path'		=> $moduleurl.'/navigation_logged.html',
		'enabled'	=> true,
		'priority'	=> 10,
		]);

	$this->build_environment('header:js[]', $moduleurl.'/home.js', 50, 'defer');
	}

/* Füge sämtliche Routing Objekte zum Hook hinzu */
$this->build_environment('body:routing[]', (object)[
	'name'		=> 'Impressum',
	'group'		=> 'impressum',
	'route'		=> 'impressum',
	'path'		=> $moduleurl.'/impressum.html',
	'enabled'	=> true,
	'priority'	=> 10,
	]);

$this->build_environment('body:routing[]', (object)[
	'name'		=> 'Navigation Footer',
	'group'		=> 'navigation:unlogged',
	'route'		=> 'footer',
	'path'		=> $moduleurl.'/footer.html',
	'enabled'	=> true,
	'priority'	=> 10,
	]);

$this->build_environment('header:css[]', $moduleurl.'/navigation.css', 50);
