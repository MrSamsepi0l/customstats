<?php
/* Last update: 2024-06-29
	Jeremiah Meyer - mobile TREND GmbH
	*/
use \jmeyer\error as e;
use \jmeyer\helper as h;
use \jmeyer\http;

use \customstats\app\leagueapi;
use \customstats\base\user as base_user;
use \customstats\base\config as base_config;
use \customstats\base\session as base_session;
use \customstats\base\user\login as base_user_login;
use \customstats\base\user\right as base_user_right;
use \customstats\base\user\registration as base_user_registration;


class controller {
	use \jmeyer\routing_trait,
	    \customstats\extension\usersession_trait;

	public $project = 'customstats';
	public $version = '2.3.0';
	public $version_date = '2024-10-30';
	public $version_int = 2;
	public $user;
	public $session_lifetime = 28800; // 8 hours
	public $hook_routing = [];
	public $path = null;
	public $server_url;
	public $url = '/';
	private $api_key = null;

	public function __construct(){

		// define some paths
		$this->path = (object)[
			'root'		=> $_SERVER['ROOT_DIRECTORY'], // /htdocs
			'app'		=> $_SERVER['APP_DIRECTORY'], // /app/customstats
			'request'	=> $_SERVER['REQUEST_URI'],
			'app_cdn'	=> $_SERVER['APP_CDN'],
			'data'		=> $_SERVER['APP_DIRECTORY'].'/data', // /app/customstats/data
			];

		// define server domain
		$this->server_url = $_SERVER['DOMAIN'];

		// take request url
		$this->url = $this->path->request;

		// init usersession (no reinit)
		$this->us_init(false);

		// take api key from session
		$this->api_key = $this->us_get('api_key');

		// if session has an api key
		if($this->api_key){

			// load user
			$res = base_user::get_user([
				'api_key'	=> $this->api_key,
				'with_right'=> true,
				]);

			// if found
			if($res->status == 200){

				// take user data
				$this->user = $res->data;

				// if renewing user fails, logout directly
				if(!$this->renew_logged_user()) return $this->user_logout();
				}
			}

		// if building config fails
		if(!$this->get_build()) $this->url = '/error_build';

		// route check
		$this->routing_dispatch($this->url);
		}

	protected function routing_definition(){
		return [

			// GET Routes
			'GET'	=> [

				// Index page where basic html is delivered
				'wrapper'					=> '/',

				// Function to include server error page
				'error_build'				=> '/error_build',

				// Load page by route param
				'load_template'				=> '~^\/load_template\/([a-z_]{1,50})$',

				// Check if user is logged, if not abort all following routes with 403
				'ajax_secure_access'		=> '*',

				// Loads the hook data | TODO: clean this up
				'load_hook'					=> '/load/hook', // '~^\/load\/hook\/([a-zA-Z0-9\_\-]{0,32})$',

				// Get the actual user status
				'user_status'				=> ['~^\/user\/status', ['json']],

				// Logout and redirect to login page
				'user_logout'				=> '/logout',

				],

			// POST Routes
			'POST'	=> [

				// Route for account registration (no login possible)
				'customstats_registration'	=> ['~^\/customstats\/registration', ['json']],

				// Executes a leagueapi login request and sends back to client as json
				'customstats_authenticate'	=> ['~^\/customstats\/authenticate', ['json']],

				// Check if user is logged, if not abort all following routes with 403
				'ajax_secure_access'		=> '*',

				// Executes base api request (normally these are admin functions)
				'base_api_request'			=> ['~^\/customstats\/api\/base', ['json']],

				// Executes a leagueapi request and sends it back to client as json
				'leagueapi_request'			=> ['~^\/leagueapi\/v1\/request', ['json']],

				// Executes a php script on local or remote server (developer)
				'ajax_command_line'			=> ['~^\/ajax\/cmd', ['json']],

				],

			];
		}


	/* User specific */
	protected function ajax_secure_access(){

		// return nothing if user is logged or not allowed if not
		return $this->user_logged() ? null : $this->response(403);
		}

	protected function renew_logged_user(){

		// if not logged, return here
		if(!$this->user_logged()) return false;

		// if user not enabled anymore, return false (forces logout)
		if(!$this->user->enabled) return false;

		// update user activity (no error check)
		$res = base_user::update_user([
			'userID' 		=> $this->user->userID,
			'last_activity'	=> h::dtstr('now'),
			'online'		=> true,
			]);

		// return success (processes normally)
		return true;
		}

	protected function user_logged(){

		// return false if user is not logged
		return !empty($this->user->api_key);
		}

	protected function user_status(){

		// check if user is logged and session is not expired by lifetime
		if($this->us_expired($this->session_lifetime, 'api_key')){

			// logout user
			return $this->user_logout();
			}

		// take user data
		$user = $this->user;

		// define status object
		$status = (object)[

			// app / project specific
			'project'		=> $this->project,
			'version'		=> $this->version,
			'version_int'	=> $this->version_int,
			'version_date'	=> $this->version_date,
			'request_time'	=> $_SERVER['REQUEST_TIME'],

			// user specific stats
			'user'			=> (object)[
				'username'	=> $user->username,
				'email'		=> $user->email,
				'enabled'	=> $user->enabled,
				'donation'	=> $user->donation,
				'api_key'	=> $user->api_key,
				'real_name'	=> $user->real_name,
				'createTime'=> $user->createTime,
				'playerID'	=> $user->playerID,
				'data'		=> $user->data,
				'right'		=> $user->right ?? [],
				],

			// session lifetime stats
			'session_data'	=> [
				'active_seconds'	=> $this->us_lifetime()->seconds,
				'active_minutes'	=> $this->us_lifetime()->minutes,
				'active_hours'		=> $this->us_lifetime()->hours,
				],

			// server info
			'server_info'	=> [
				'is_production'	=> $_SERVER['PROJECT_MODE'] == 'prod',
				'server_url'	=> $_SERVER['DOMAIN'],
				],

			// hook
			// 'hook_list'		=> $this->get_environment('body:routing'),
			];

		// return capsuled status result object
		return $this->response(200, (object)['status' => 200, 'data' => $status]);
		}

	protected function user_logout(){

		// update user activity (no error check)
		$res = base_user::update_user([
			'userID' 	=> $this->user->userID,
			'online'	=> false,
			]);

		// destroy session
		$this->us_destroy();

		// redirect to login page
		return $this->response(301, '/');
		}

	protected function check_user_right($right){

		// take user right list
		$user_right = $this->user->right ?? [];

		// check if user has right
		return in_array($right, $user_right);
		}

	protected function user_has_one_of_right($right_check = []){

		// take user right list
		$user_right = $this->user->right ?? [];

		// for each right to check
		foreach($right_check as $right){

			// if user has at least one right, return instantly
			if(in_array($right, $user_right)) return true;
			}

		// user has not one of given rights
		return false;
		}

	protected function activate_right($right){

		// convert to array if string
		if(is_string($right)) $right = [$right];

		// if not array, return error
		if(!is_array($right)) return;

		// load right list
		$right_list = $this->get_environment('customstats:base_user:right');
		$right_list_values = array_column($right_list, 'value');

		// for each right
		foreach($right as $entry){

			// if already added, skip
			if(in_array($entry, $right_list_values)) continue;

			// add to environment
			$this->build_environment('customstats:base_user:right[]', $entry);
			}
		}

	protected function get_registered_right(){

		// load right list
		$list = $this->get_environment('customstats:base_user:right');

		// only values
		$list = array_column($list, 'value');

		// sort
		sort($list);

		// and return
		return $list;
		}


	/* App Environment */
	protected function get_build(){

		// create build
		$build = (object)[
			'version'	=> $this->version_int,
			'buildtime'	=> h::dtstr('now', 'U'),
			'module'	=> [],
			];

		// prescan loadable modules
		if(!$this->scan_build('module', true, $build)){

			// log error and abort
			e::logtrigger('Module prescan failed');
			return false;
			}

		// prescan loadable modules
		if(!$this->scan_build('public', true, $build)){

			// log error and abort
			e::logtrigger('Public prescan failed');
			return false;
			}

		// for each prescanned module config
		foreach($build->module as $modulefile => $moduleurl){

			// load module config
			$this->load_module($modulefile, $moduleurl);
			}

		// set build version
		$build->version = $this->version_int;

		// return build
		return $build;
		}

	protected function build_environment($env_type, $hook, $priority = 10000){

		// if no object, but string
		if(!is_object($hook) and is_string($hook)){

			// convert to object
			$hook = (object)[
				'value' 	=> $hook,
				'priority' 	=> $priority,
				];
			}

		// if not already defined in hook on index, define it here as empty list
		if(!isset($this->hook_routing[$env_type])) $this->hook_routing[$env_type] = [];

		// if value should be added to a list
		if(substr($env_type, -2, 2) == '[]'){

			// remove the '[]' part of string
			$env_type = substr($env_type, 0, -2);

			// add to list
			$this->hook_routing[$env_type][] = $hook;
			}

		// no list
		else {

			// add hook directly on index
			$this->hook_routing[$env_type] = $hook;
			}
		}

	protected function get_environment($env_type){

		// wenn Umgebungstyp nicht verfügbar
		if(!isset($this->hook_routing[$env_type])){

			// default leere Liste für Typ
			$this->hook_routing[$env_type] = [];

			// gib die Liste zurück
			return $this->hook_routing[$env_type];
			}

		// für alle anderen Hooks als Objekt
		if(is_array($this->hook_routing[$env_type])) usort($this->hook_routing[$env_type], function($a, $b){

			// nach Priorität sortieren
			return $a->priority > $b->priority ? 1 : -1;
			});

		// gib die Hook bzw. leere Liste zurück
		return $this->hook_routing[$env_type] ?? [];
		}

	protected function load_module($modulefile, $moduleurl){

		// include config file (moduleurl uses in config)
		include($modulefile);
		}

	protected function scan_build($dir, $prescan, &$build){

		// check if valid directory for scanning
		if(!is_dir($this->path->app.'/'.$dir)) return false;

		// run through each directory and file
		foreach(scandir($this->path->app.'/'.$dir) as $link){

			// if prescan and config file
			if($prescan and $link === '.config.php'){

				// save file path for later usage and skip further processing
				$build->module[$this->path->app.'/'.$dir.'/'.$link] = '/'.$dir;
				continue;
				}

			// skip every other hidden or php file
			if($link[0] === '.' or substr($link, -4) === '.php') continue;

			// if we are in a directory
			if(is_dir($this->path->app.'/'.$dir.'/'.$link)){

				// recursive recall this function with this directory and skip processing link
				$this->scan_build($dir.'/'.$link, $prescan, $build);
				continue;
				}

			// if it's prescan, skip further processing
			if($prescan) continue;
			}

		// return success
		return true;
		}

	protected function error_build(){

		// get error page
		$file = $this->path->app.'/module/home/error500.php';

		// if file doesn't exist, return not found
		if(!file_exists($file)) return $this->response(500);

		// return 200 OK
		return $this->response_ob(200, function() use ($file){

			// include file
			include($file);
			});
		}


	/* Templating */
	protected function wrapper(){

		// get wrapper file
		$file = $this->get_environment('body:wrapper')->value ?? null;

		// on error
		if(!file_exists($file) or substr($file, -11) !== 'wrapper.php') return $this->response(404);

		// return and include file
		return $this->response_ob(200, function() use ($file){

			// include file
			include($file);
			});
		}

	protected function load_template($page){

		// load environment
		$hook_list = $this->get_environment('body:routing');

		// if empty or not array, return not found
		if(empty($hook_list) or !is_array($hook_list)) return $this->response(404);

		// default hook
		$template_url = null;

		// for each hook
		foreach($hook_list as $hook){

			// if page doesn't match route, skip
			if($page !== $hook->route) continue;

			// if disabled, skip
			if(!$hook->enabled) continue;

			// take hook url and leave
			$template_url = $hook->path;
			break;
			}

		// if no template defined, return not found
		if(!$template_url) return $this->response(404);

		// define complete path to template
		$file = $this->path->app.$template_url;

		// if file doesn't exist, return not found
		if(!file_exists($file)) return $this->response(404);

		// return 200 OK
		return $this->response_ob(200, function() use ($file){

			// include file
			include($file);
			});
		}

	protected function load_hook(){

		// if user has right to load all activated rights
		$is_admin = $this->check_user_right('customstats:tabview_admin');

		// define package
		$package = (object)[
			'status'	=> 200,
			'data'		=> [
				'registered_right'	=> ($is_admin) ? $this->get_registered_right() : [],
				],
			];

		// return result
		return $this->response(200, $package);
		}


	/* Account Routes */
	protected function customstats_authenticate($req = []){

		// if user is already logged, return conflict
		if($this->user_logged()) return $this->response(200, (object)['status' => 409]);

		// mandatory
		$mand = h::eX($req, [
			'username'		=> '~1,255/s',
			'password'		=> '~/s',
			], $error);

		// on error
		if($error){

			// log error
			e::logtrigger('Invalid param for customstats_authenticate() request: '.h::encode_php($error));

			// return unallowed
			return $this->response(200, (object)['status' => 403]);
			}

		// process login
		$res = base_user_login::authenticate([
			'username'		=> trim($mand['username']),
			'password'		=> $mand['password'],
			]);

		// on success
		if($res->status == 200){

			// take user data
			$base_user = $res->data;

			// create usersession param
			$this->us_set('api_key', $base_user->api_key);
			$this->us_set('username', $base_user->username);
			$this->us_set('last_activity', $base_user->last_activity);

			// get sessionID
			$sessionID = h::gsID();

			// if given
			if($sessionID){

				// capture session
				$ins = base_session::create_session([
					'identifier'	=> $base_user->api_key,
					'hash'			=> sha1(h::dtstr('now').':'.$sessionID),
					'createTime'	=> h::dtstr('now'),
					]);

				// on error, return server error
				if($ins->status != 201) return $this->response(200, (object)['status' => 500]);
				}
			}

		// and return capsuled result
		return $this->response(200, $res);
		}

	protected function customstats_registration($req = []){

		// TEMP: disable public registration via API
		return $this->response(501);

		// if user is logged, return error
		if($this->user_logged()) return $this->response(403);

		// mandatory
		$mand = h::eX($req, [
			'username'	=> '~1,40/s',
			'email'		=> '~1,255/s',
			'real_name'	=> '~1,40/s',
			'auth'		=> '~6,255/s',
			], $error);

		// on error
		if($error) return $this->response(200, (object)['status' => 400, 'data' => $error]);


		// process registration
		$registration = base_user_registration::register([
			'username'	=> trim($mand['username']),
			'email'		=> trim($mand['email']),
			'real_name'	=> trim($mand['real_name']),
			'password'	=> $mand['auth'],
			]);

		// user successfully registered
		if($registration->status == 201){

			// take result
			$reg_data = $registration->data;

			// default right list (empty)
			$basic_right_list = [];

			// load (project) config
			$res = base_config::get_config([
				'project'	=> $this->project,
				]);

			// on error
			if($res->status == 200){

				// take config
				$config = $res->data;

				// if config package available
				if(h::cX($config, 'param:base_config:registration:basic_right_list', '~!empty/a')){

					// take list from config overwriting default
					$basic_right_list = h::gX($config, 'param:base_config:registration:basic_right_list') ?? [];
					}
				}

			// for each basic right
			foreach($basic_right_list as $basic_right){

				// create user right (no error check)
				base_user_right::create_user_right([
					'userID'	=> $reg_data->userID,
					'right'		=> $basic_right,
					]);
				}

			// cleanup and remove user ID
			unset($config);
			unset($reg_data);
			unset($registration->data);
			}

		// return capsuled result
		return $this->response(200, $registration);
		}


	/* Leagueapi Routes */
	protected function leagueapi_request($req = []){

		// mandatory
		$mand = h::eX($req, [
			'fn'        => '~^[a-z0-9_\.]{1,64}$',
			], $error);

	    // optional
	    $opt = h::eX($req, [
	        'param'     => '~/l',
	        ], $error, true);

	    // on error
	    if($error){

	        // log it
	        e::logtrigger('Invalid param for leagueapi_request: '.h::encode_php($error));

	        // and return parameter error
	        return $this->response(400);
	        }

	    // load base api config list
	    $config_list = $this->get_environment('customstats_leagueapi:execute');

	    // if config is empty or no array, return error
	    if(empty($config_list) or !is_array($config_list)) return $this->response(403);


	    // default param
	    $has_right = false;

	    // for each registered config
	    foreach($config_list as $config){

	    	// if function does not match, skip
	    	if($config->fn !== $mand['fn']) continue;

	    	// take config
	    	$has_right = true;
	    	}

	    // if user doesn't have right
	    if(!$has_right) return $this->response(403);

	    // fill request param
	    $filled_request = $this->fill_leagueapi_param($opt);

	    // if something went wrong, return error
	    if($filled_request === false) return $this->response(403);

	    // process leagueapi method
	    $leagueapi_request = leagueapi::process_leagueapi_method($mand + $filled_request);

	    // and return it's result
	    return $this->response(200, $leagueapi_request);
		}

	protected function fill_leagueapi_param($req = []){

		// if nothing given, error
		if(!isset($req)) return false;

		// optional
		$opt = h::eX($req, [
			'param'		=> '~/l',
			], $error, true);

		// on error
		if($error) return $this->response(400);

		// default opt
		$opt += [
			'param'		=> [],
			];

		// if no array or object, error
		if(!is_array($opt['param']) and !is_object($opt['param'])) return false;

		// if object, convert to array
		if(is_object($opt['param'])) $opt['param'] = (array) $opt['param'];

		// add project and api key for every request
		$opt['param'] = [
			'project'		=> $this->project,
			'api_key'		=> $this->api_key,
			] + $opt['param'];

		// return success
		return $opt;
		}


	/* Customstats API Routes */
	protected function base_api_request($req = []){

		// basic check if user is logged
		if(!$this->user_logged()) return $this->response(403);

		// add necessary params
		$def = [
			'api_key'	=> $this->user->api_key ?? null,
			'enabled'	=> $this->user->enabled ?? false,
			];

		// if no api key or user not enabled, return error
		if(!$def['api_key'] or !$def['enabled']) return $this->response(403);


		// mandatory
		$mand = h::eX($req, [
			'fn'        => '~^[a-z0-9_\.]{1,64}$',
			], $error);

	    // optional
	    $opt = h::eX($req, [
	        'param'		=> '~/l',
	        ], $error, true);

	    // on error
	    if($error){

	        // log it
	        e::logtrigger('Invalid param for customstats_request: '.h::encode_php($error));

	        // and return not allowed
	        return $this->response(403);
	        }

	    // if optional params set
	    if(isset($opt['param'])){

	    	// if object, overwrite api key in param, if sent for some reason
	    	if(is_object($opt['param'])){

	    		if(!empty($opt['param']->project)) $opt['param']->project = $this->project;
	    		if(!empty($opt['param']->api_key)) $opt['param']->api_key = $this->api_key;
	    		}

	    	// overwrite api key in param, if sent for some reason
	    	if(is_array($opt['param'])){

	    		if(!empty($opt['param']['project'])) $opt['param']['project'] = $this->project;
	    		if(!empty($opt['param']['api_key'])) $opt['param']['api_key'] = $this->api_key;
	    		}
	    	}


	    // load base api config list
	    $config_list = $this->get_environment('customstats_base_api:execute');

	    // if config is empty or no array, return error
	    if(empty($config_list) or !is_array($config_list)) return $this->response(403);


	    // default param
	    $NsFunction = null;
	    $with_param = false;

	    // for each registered config
	    foreach($config_list as $config){

	    	// if function does not match, skip
	    	if($config->fn !== $mand['fn']) continue;

	    	// take config
	    	$NsFunction = $config->ns;
	    	$with_param = $config->param;
	    	}

	    // no function found, return error
	    if(!$NsFunction) return $this->response(403);

	    // if function not callable, return server error
	    if(!is_callable($NsFunction)) return $this->response(500);

	    // call associated function
	    $base_api_request = (isset($opt['param']) and $with_param) ? call_user_func($NsFunction, $opt['param']) : call_user_func($NsFunction);

	    // return capsuled result
	    return $this->response(200, $base_api_request);
		}


	/* Admin Routes / Tool */
	protected function ajax_command_line($req = []){

		// check if user has right to execute console scripts

		// load (project) config
		$res = base_config::get_config([
			'project'	=> $this->project,
			]);

		// on error, return not allowed
		if($res->status != 200) return $this->response(403);

		// take config
		$config = $res->data;

		// if config package available
		if(h::cX($config, 'param:base_config:leagueapi:admin_list', '~!empty/a')){

			// if user not allowed
			$is_allowed = in_array($this->api_key, h::gX($config, 'param:base_config:leagueapi:admin_list'));
			}

		// if not allowed, return not allowed
		if(empty($is_allowed)) return $this->response(403);

		// mandatory
		$mand = h::eX($req, [
			'php_script'	=> '~/s',
			], $error);

		// optional
		$opt = h::eX($req, [
			'remote'		=> '~^[a-zA-Z0-9\-\.]{1,64}$',
			], $error, true);

		// on error
		if($error){

			// log it
			e::logtrigger('Invalid param for ajax_console: '.h::encode_php($error));

			// return 400 'Bad Request'
			return $this->response(400);
			}

		// on remote call
		if(!empty($opt['remote'])){

			// send request to remote server
			$curl_obj = http::curl_obj([
				'url'		=> 'https://'.$opt['remote'].'/ajax/cmd.json',
				'ipv4only'	=> true,
				'method'	=> 'POST',
				'jsonencode'=> true,
				'sslVerify'	=> 2,
				'post'		=> [
					'user'		=> sha1($this->user->email), // TODO: CHECK THIS
					'php_script'=> $mand['php_script'],
					],
				]);

			// if request is basically okay
			if($curl_obj->httpcode == 200){

				// and content is json
				if(strpos($curl_obj->contenttype, '/json') !== false){

					// convert json and return success
					return $this->response(200, json_decode($curl_obj->content));
					}

				// otherwise log error
				e::logtrigger('Can not use response of type: '.h::encode_php($curl_obj->contenttype));

				// return 500 'Server Error'
				return $this->response(500);
				}

			// otherwise just return http response code
			return $this->response($curl_obj->httpcode);
			}


		// define complete path for saving and exeuting PHP script
		$path = $this->path->data.'/developer_php_cmd';

		// if directory not already created, do it
		if(!is_dir($path)) mkdir($path, 0777, true);

		// add user email to path
		$path .= '/'.$this->user->email;

		// if dir not already created, do it
		if(!is_dir($path)) mkdir($path, 0777, true);

		// list of scripts, without dirs (. && ..)
		$scriptlist = array_reverse(array_slice(scandir($path), 2));

		// if more than 10 scripts
		if(count($scriptlist) >= 10){

			// // do
			// do {

			// remove all scripts until there are only 10 or less
			// 	} while($scriptlist >= 10);

			// take oldest script from list
			$deletescript = array_pop($scriptlist);

			// if we are on a windows OS
			if(in_array(strtoupper(PHP_OS), ['WIN32', 'WIN', 'WINNT', 'Windows'])){

				// open windows cmd and delete file
				$cmd = exec('cd '.$path.' && del '.$deletescript);
				}

			// otherwise (linux system)
			else {

				// use linux remove cmd and delete file
				$cmd = exec('cd '.$path.' && rm '.$deletescript);
				}
			}

		// define complete filename of PHP script
		$file = $path.'/'.h::dtstr('now', 'Y_m_d_H_i_s.u').'.php';

		// cleanup slashes in script
		$mand['php_script'] = stripslashes($mand['php_script']);

		// remove PHP opening tag at start of script if defined
		if(substr($mand['php_script'], 0, 5) == '<?php') $mand['php_script'] = substr($mand['php_script'], 5);
		elseif(substr($mand['php_script'], 0, 2) == '<?') $mand['php_script'] = substr($mand['php_script'], 2);

		// remove whitespace or other characters from start of script
		ltrim($mand['php_script']);

		// now we append some PHP code at start and end
		$mand['php_script'] = '<?php'.PHP_EOL.'use \\jmeyer\\helper as h;'.PHP_EOL.$mand['php_script'].PHP_EOL.'return null;'.PHP_EOL;

		// finally write PHP script file
		if(file_put_contents($file, $mand['php_script'])){

			// start benchmark
			$memory_start = memory_get_peak_usage();
			$time_start = microtime(true);

			// start output buffering
			ob_start();

			// run script
			$x = include($file);

			// if script didn't return null (so in case there was an fatal-error or something, print this into the script)
			if($x !== null) echo h::encode_php($x);

			// get buffering content and stop it
			$script_result = ob_get_clean();

			// end benchmark
			$time_end = microtime(true);
			$memory_end = memory_get_peak_usage();
			}

		// return result
		return $this->response(200, (object)[
			'status'	=> ($script_result === null ? 204 : 200),
			'data'		=> $script_result,
			'benchmark'	=> [

				// script-only run time
				'runtime_ms'	=> round(($time_end - $time_start) * 100000) / 100,

				// complete execution time since request started
				'complete_ms'	=> round((microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']) * 100000) / 100,

				// script-only memory usage
				'script_memory'	=> h::bytesize_format(memory_get_peak_usage()),

				// complete memory usage of request
				'complete_mem'	=> h::bytesize_format($memory_end - $memory_start),
				],
			]);
		}

	}
