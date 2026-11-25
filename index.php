<?php
session_start(); // Starte PHP Session

// Binde Serverkonfiguration ein
include('config/server.php');

// Setze appspezifischen Controller
$_SERVER['APP_CONTROLLER'] = 'lib/customstats/controller.php';

// Setze das App Verzeichnis
$_SERVER['APP_DIRECTORY'] = $_SERVER['ROOT_DIRECTORY'].'/app/customstats';

// Binde die PSR-0 Klasse ein
include($_SERVER['ROOT_DIRECTORY'].'/lib/heart/core/psrloader.php');

// Nutze den Namespace
use \heart\core\psrloader;

// Initialisiere PHP-Bibliothek
psrloader::register($_SERVER['ROOT_DIRECTORY'].'/lib');

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
