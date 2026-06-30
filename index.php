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

	// Webspace path
	$_SERVER['WEBSPACE_PATH'] = 'Q:\xampp\htdocs';

	// Setze Entwicklungsmodus
	$_SERVER['PROJECT_MODE'] = 'dev';

	// Definiere lokalen App CDN-Pfad
	$_SERVER['APP_CDN'] = 'http://localhost/app/cdn';

	// Definiere Log-Path für PHP
	$_SERVER['LOG_PATH'] = 'Q:/xampp/htdocs/log';

	// Alles loggen im Dev-Mode
	$_SERVER['PRINT_ERROR'] = true;

	// Define log path
	ini_set('error_log', $_SERVER['LOG_PATH'].'/php/php_error.log');
	}

// Remote Produktionsumgebung
else {

	// Setze Server Domain
	$_SERVER['DOMAIN'] = 'http://custom-stats.de';

	// Htdocs Pfad als neues Root Verzeichnis setzen
	$_SERVER['ROOT_DIRECTORY'] = '/home/strato/http/power/rid/56/60/511155660/htdocs';

	// Webspace path
	$_SERVER['WEBSPACE_PATH'] = '/mnt/web517/a0/60/511155660/htdocs';

	// Setze Produktionsmodus
	$_SERVER['PROJECT_MODE'] = 'prod';

	// Definiere Subdomain APP CDN Pfad (Umleitung ins ROOT_DIRECTORY)
	$_SERVER['APP_CDN'] = 'http://cdn.custom-stats.de/app/cdn';

	// Definiere Log-Path für PHP
	$_SERVER['LOG_PATH'] = $_SERVER['ROOT_DIRECTORY'] . '/log';

	// Kein Logging im Production-Mode
	$_SERVER['PRINT_ERROR'] = false;

	// Define log path
	ini_set('error_log', $_SERVER['LOG_PATH'].'/php/php_error.log');
	}

// Setze das App Verzeichnis
$_SERVER['APP_DIRECTORY'] = $_SERVER['ROOT_DIRECTORY'].'/app/customstats';

// Binde die PSR-0 Klasse ein
include($_SERVER['ROOT_DIRECTORY'].'/lib/heart/core/psrloader.php');

// Nutze den Namespace
use \heart\core\psrloader;
// use \jmeyer\error;

// Initialisiere PHP-Bibliothek
psrloader::register($_SERVER['ROOT_DIRECTORY'].'/lib');

// Initialisiere eigenen PHP Logtrigger
// set_error_handler('jmeyer\error::trigger');

// Wenn Log Pfad definiert
if(!empty($_SERVER['LOG_PATH'])){

	// Baue Error-Config mit Logfunktion, Log-Pfad und Format
	$error_handler_config = ['log' => \heart\core\error::log_fn($_SERVER['LOG_PATH'].'/php', '{req_Y}-{req_m}', '{req_d}.log')];

	// Wenn Errors ausgegeben werden sollen, füge Wert und Funktion zur Error-Config hinzu
	if(!empty($_SERVER['PRINT_ERROR']))	$error_handler_config['print'] = \heart\core\error::print_fn(true);

	// Registriere eigene Error-Funktion mittels Config für den Root-Pfad
	\heart\core\error::register_error_handler($error_handler_config, $_SERVER['WEBSPACE_PATH']);

	// Lösche Error-Config
	unset($error_handler_config);
	}

// Überprüfe, ob ein spezifischer App PHP-Controller definiert wurde
if(isset($_SERVER['APP_CONTROLLER'])){

	// Binde PHP-Controller ein
	include($_SERVER['APP_CONTROLLER']);

	// Instanziiere App-Controller
	$controller = new controller();
	}
