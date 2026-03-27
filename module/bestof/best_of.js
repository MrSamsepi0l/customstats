'use strict';

angular.module('customstats').controller('customstats.league:bestof_controller', ['$scope', '$leagueapi', '$app', '$location', '$multichart', '$regression', function($scope, $leagueapi, $app, $location, $multichart, $regression){

	$scope.view = {
		list		: [],
		list_copy	: [],
		config		: null,
		status		: null,
		chartdata 	: null,
		rawdata		: null,
		instance 	: null,

		get_bestof_analysis : function(){
			var self = this, param;

			// set param
			param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_get_bestof_analysis', param, {
				200 : function(data){

					// take data
					self.list = data;
					self.list_copy = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		get_config : function(project){
			var self = this, param;

			// set param
			param = {
				'project'	: project,
				};

			// load
			$app.send_base_request('customstats_base_get_config', param, {
				200 : function(data){

					// take data
					self.config = data;

					// extract best of config if available
					if(!_.isUndefined(data.param.base_config.best_of)) self.config = _.indexBy(data.param.base_config.best_of, 'key');

					// load after config
					$scope.view.get_bestof_analysis();
					},
				'*' : function(data, status){

					// no status to avoid loading abortion
					}
				});
			},

		get_champion_name_converted : function(champion_name){

			// use service function to convert name of champion
			return $leagueapi.get_champion_name_converted(champion_name);
			},

		filter_list : function(search_key){
			var self = this, original;

			// if empty, take complete list
			if(!search_key) return self.list = self.list_copy;

			// clear list
			self.list = {};

			// take only searched result by key
			self.list[search_key] = self.list_copy[search_key];
			},

		redirect_template : function(template, param){
			var self = this;

			// redirect to champion tab
			if(template == 'champions'){

				// and search for klicked champion
				$location.url('/champions').search({champion_name: param});
				}

			// redirect to all player tab
			if(template == 'all_player'){

				// and search for profile by ingame name
				$location.url('/all_player').search({ingame_name: param});
				}
			},

		get_timeserie : function(){
			var self = this;

			// define param
			var param = {
				'type'			: 'times_played',
				'run'			: 'bestof',
				'step'			: '+1 month',
				'category'		: 'date',
				'range_num'		: 1000, // DEPRECATED, remove mandatory in get_timeserie
				};

			// load
			$leagueapi.send_request('customstats_get_timeserie', param, {
				200 : function(data){

					// take rawdata
					self.rawdata = data;

					// render timeserie
					self.render();
					},
				'*' : function(data, status){

					// no status to avoid loading abortion
					}
				});
			},

		render : function(change_config){
			var self = this,
				categories_length = this.rawdata.length,
				categories = [],
				data = self.rawdata,
				series = null,
				new_chart = angular.merge({
					chart: {
						// width: 1500,
						height: 300,
					    backgroundColor : '#0a0e13'
						},
					title: {
						text: '', // Aktivität aller Customgames seit Tracking von Beginn bis heute
						style: {'fontSize':'10px','color':'whitesmoke'}
						},
					xAxis: {
						categories: [],
						},
					plotOptions : {
						area : {
							stacking : null,
							lineWidth: 1, lineColor: "#000",
							marker: {lineWidth: 1, lineColor: "#000"}
							},
						},
					series: [],
					}, change_config);

			// create series object
			series = {
				'name'	: 'Customs gespielt',
				'color'	: '#aafff7',
				'data'	: Array(categories_length).fill(0),
				};

				// for each timeserie player
			_.each(data, function(entry, key){

				// get date
				categories.push(entry.name);

				// skip undefined, null entries
				if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

				// push result into data array players name index
				series.data[key] = _.first(entry.result).sum;
				});

						// set categories on xaxis for chart
			new_chart.xAxis.categories = categories;

			// push serios into chart
			new_chart.series.push(series);

			// create chart
			new_chart.series = _.values(new_chart.series);

			// create multichart
			var multichart = $multichart.get_new();
			self.chartdata = multichart.create_chart(new_chart);
			},

		};

	// define view
	$scope.ui_review = function(board_status){

		// init config loading
		$scope.view.get_config(board_status.project);

		// init timeseries
		$scope.view.get_timeserie();
		};

	// when app board is ready
	$app.board_status_ready(function(board_status){

		// init module
		$scope.ui_review(board_status);
		});


	}]);
