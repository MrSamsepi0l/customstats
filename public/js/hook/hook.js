'use strict';

// Service: $hook_view
angular.module('customstats').run(function($http, $rootScope, $app, $location){

    // define hook
    var $hook_view = {
    	status     : 0,
        interval   : 60,

    	init_view : function(init){

            // get current app state
            var app_state = $app.get_app_state();

            // if login state
            if(app_state == 'logging_in'){

                // redirect to dashboard (if user has not the right, no route will be selected)
                $location.url('/tournament_dashboard');

                // update app state
                $app.update_app_state('logged_in');
                }
    		},

    	load_hook : function(hook_key){

    		// set status
    		this.status = 100;

    		// load data
    		$app.get('load/hook', {
    			200 : function(data){

                    // save hook data in app value
                    $app.hook = data;
    				},
    			});
    		},

        };

    // init view
    $hook_view.init_view(true);

    // get hook data
    $hook_view.load_hook();

    // make app service global accessible
    $rootScope.app_service = $app;

    // return service
    return $hook_view;
    });