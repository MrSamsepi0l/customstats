<?php

$this->build_environment('header:css[]', $moduleurl.'/app.css', 10);

// Wenn eingeloggt
if($this->user_logged()){

	$this->build_environment('header:css[]', $moduleurl.'/keyframe.css', 15);
	$this->build_environment('header:css[]', $moduleurl.'/tooltip.css', 15);
	$this->build_environment('header:css[]', $moduleurl.'/modal.css', 15);
	$this->build_environment('header:css[]', $moduleurl.'/general_icons.css', 15);

	/* League specific content */
	$this->build_environment('header:css[]', $moduleurl.'/league/champs.css', 16);
	$this->build_environment('header:css[]', $moduleurl.'/league/summoners.css', 16);
	}
