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

	// Definiere den Log Path für Fehlermeldungen und Debugging
	$_SERVER['LOG_PATH'] = 'C:/xampp/htdocs/phplog/log';

	// Logge Errors (detaillierte Errors?)
	$_SERVER['PRINT_ERROR'] = true;

	// Erlaubt PHP Fehlerausgabe (u. a. im Browser etc.)
	ini_set('display_errors', 1);
	}

// Remote Produktionsumgebung
else {

	// Setze Server Domain
	$_SERVER['DOMAIN'] = 'https://custom-stats.de';

	// Htdocs Pfad als neues Root Verzeichnis setzen
	$_SERVER['ROOT_DIRECTORY'] = '/home/strato/http/power/rid/56/60/511155660/htdocs';

	// Setze Produktionsmodus
	$_SERVER['PROJECT_MODE'] = 'prod';

	// Definiere Subdomain APP CDN Pfad (Umleitung ins ROOT_DIRECTORY)
	$_SERVER['APP_CDN'] = 'http://cdn.custom-stats.de/app/cdn';

	// Definiere den Log Path für Fehlermeldungen und Debugging
	$_SERVER['LOG_PATH'] = '/home/strato/http/power/rid/56/60/511155660/htdocs/phplog/log';

	// Logge nicht detaillierte Errors (detaillierte Errors?)
	$_SERVER['PRINT_ERROR'] = false;

	// Verhindert PHP Fehlerausgabe (u. a. im Browser etc.)
	ini_set('display_errors', 0);
	}

// Setze das App Verzeichnis
$_SERVER['APP_DIRECTORY'] = $_SERVER['ROOT_DIRECTORY'].'/app/customstats';


// Binde die PSR-0 Klasse ein
include($_SERVER['ROOT_DIRECTORY'].'/lib/jmeyer/psrloader.php');

// Nutze den Namespace
use \jmeyer\psrloader;

// Initialisiere PHP-Bibliothek
psrloader::register($_SERVER['ROOT_DIRECTORY'].'/lib');

// Wenn Log Pfad definiert
if(!empty($_SERVER['LOG_PATH'])){

	// Baue Error-Config mit Logfunktion, Log-Pfad und Format
	$error_handler_config = ['log' => \jmeyer\error::log_fn($_SERVER['LOG_PATH'], '{req_Y}-{req_m}', '{req_d}.log')];

	// Wenn Errors ausgegeben werden sollen, füge Wert und Funktion zur Error-Config hinzu
	if(!empty($_SERVER['PRINT_ERROR']))	$error_handler_config['print'] = \jmeyer\error::print_fn(true);

	// Registriere eigene Error-Funktion mittels Config für den Root-Pfad
	\jmeyer\error::register($error_handler_config, $_SERVER['ROOT_DIRECTORY']);

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
