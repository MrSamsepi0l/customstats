<?php
session_start(); // Starte PHP Session

// Setze appspezifischen Controller
$_SERVER['APP_CONTROLLER'] = 'lib/customstats/controller.php';

// für lokale Entwicklungsumgebung
if($_SERVER['SERVER_NAME'] == 'customstats.localhost'){

	// Setze Server Domain
	$_SERVER['DOMAIN'] = 'http://customstats.localhost';

	// Htdocs Pfad als neues Root Verzeichnis setzen
	$_SERVER['ROOT_DIRECTORY'] = 'Q:/xampp/htdocs';

	// Setze Entwicklungsmodus
	$_SERVER['PROJECT_MODE'] = 'dev';

	// Definiere lokalen App CDN-Pfad
	$_SERVER['APP_CDN'] = 'http://localhost/app/cdn';
	}

// Remote Produktionsumgebung
else {

	// Setze Server Domain
	$_SERVER['DOMAIN'] = 'http://custom-stats.de';

	// Htdocs Pfad als neues Root Verzeichnis setzen
	$_SERVER['ROOT_DIRECTORY'] = '/home/strato/http/power/rid/56/60/511155660/htdocs';

	// Setze Produktionsmodus
	$_SERVER['PROJECT_MODE'] = 'prod';

	// Definiere Subdomain APP CDN Pfad (Umleitung ins ROOT_DIRECTORY)
	$_SERVER['APP_CDN'] = 'http://cdn.custom-stats.de/app/cdn';
	}

// Setze das App Verzeichnis
$_SERVER['APP_DIRECTORY'] = $_SERVER['ROOT_DIRECTORY'].'/app/customstats';

// Binde die PSR-0 Klasse ein
include($_SERVER['ROOT_DIRECTORY'].'/lib/jmeyer/psrloader.php');

// Nutze den Namespace
use \jmeyer\psrloader;
// use \jmeyer\error;

// Initialisiere PHP-Bibliothek
psrloader::register($_SERVER['ROOT_DIRECTORY'].'/lib');

// Initialisiere eigenen PHP Logtrigger
// set_error_handler('jmeyer\error::trigger');

// Überprüfe, ob ein spezifischer App PHP-Controller definiert wurde
if(isset($_SERVER['APP_CONTROLLER'])){

	// Binde PHP-Controller ein
	include($_SERVER['APP_CONTROLLER']);

	// Instanziiere App-Controller
	$controller = new controller();
	}
