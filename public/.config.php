<?php

/* Favicon laden */
$this->build_environment('header:favicon', $moduleurl.'/img/favicon/league.ico', 15);

/* CSS Sheets laden */
$this->build_environment('header:css[]', $moduleurl.'/cdn/css/bootstrap/bootstrap.min.css', 15);

/* Angular/Jquery/Bootstrap Module laden */
$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/jquery/jquery.min.js', 20);
$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/bootstrap/bootstrap.min.js', 21);
$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/angular/angular.min.js', 22);
$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/angular/angular-route.js', 23);

$this->build_environment('header:js[]', $moduleurl.'/js/initialize.js', 24);
$this->build_environment('header:js[]', $moduleurl.'/js/service.js', 25);

/* Weitere JS Module laden */
$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/underscore/underscore-min.js', 25);


// Wenn eingeloggt
if($this->user_logged()){

	/* CSS Sheets laden */
	$this->build_environment('header:css[]', $moduleurl.'/cdn/css/highcharts/highcharts_v12.css', 14);
	$this->build_environment('header:css[]', $moduleurl.'/cdn/css/highcharts/highcharts_customized.css', 15);
	$this->build_environment('header:css[]', $moduleurl.'/cdn/css/customized/colors.css', 15);

	/* Weitere JS Module laden */
	$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/date.js', 25);
	$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/moment.js', 25);
	$this->build_environment('header:js[]', $moduleurl.'/js/hook/hook.js', 30);
	$this->build_environment('header:js[]', $moduleurl.'/js/directive.js', 30);
	$this->build_environment('header:js[]', $moduleurl.'/js/filter.js', 31);

	/* Highcharts JS einbinden */
	$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/highcharts/highcharts_v12.js', 40);
	// $this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/highcharts/highcharts-more.js', 41);
	$this->build_environment('header:js[]', $moduleurl.'/cdn/javascript/highcharts/highcharts_histogram.js', 42);
	$this->build_environment('header:js[]', $moduleurl.'/js/highcharts.js', 43);
	}
