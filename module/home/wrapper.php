<html lang="de" ng-app="customstats">
	<head>
		<meta charset="utf-8" />
		<meta name="Jeremiah">
		<title>Customstats</title>
		<?php echo '<link rel="shortcut icon" type="image/x-icon" href="'.$this->get_environment('header:favicon')->value.'">'; ?>
		<?php foreach($this->get_environment('header:css') as $href) echo '<link rel="stylesheet" href="'.$href->value.'">'; ?>
		<?php foreach($this->get_environment('header:js') as $src) echo '<script type="text/javascript" src="'.$src->value.'"></script>'; ?>
		</head>
	<body class="customstats-scrollbar" id="custom-stats">
		<?php
			// Dynamische Routing-Konfiguration mittels AngularJS
			echo '<script> angular.module("customstats").config(function($locationProvider, $routeProvider){ $routeProvider'."\n";

			// Für jeden Tab aus der Config wird mittels HTTP Request die Seite angefordert
			foreach($this->get_environment('body:routing') as $routing) echo '.when("/'.$routing->route.'", {templateUrl:"load_template/'.$routing->route.'", preload: true})';

			// Default Template Navigation
			if(!$this->user_logged()) echo '.otherwise({templateUrl:"load_template/login",})'."\n";

			// Tag schließen
			echo '});</script>';

			// Wenn eingeloggt
			if($this->user_logged()) echo '<ng-include src="\'load_template/navigation_logged\'"></ng-include>';
			?>

		<?php

			if(!$this->user_logged()) echo '<div ng-view></div>';

			echo '<ng-include src="\'load_template/footer\'"></ng-include>';
			?>

		</body>



	</html>