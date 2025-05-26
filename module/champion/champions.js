'use strict';

angular.module('customstats').controller('customstats.league:champion_controller', ['$scope', '$leagueapi', '$routeParams', function($scope, $leagueapi, $routeParams){

	$scope.view = {
		data			: [],
		data_copy		: [],
		status			: null,
		order			: '-times_played',
		filter 			: {
			string 		: '',
			},
		filter_option	: [
	    	{key : 'Alphabetisch', value : 'name'},
	    	{key : 'Anzahl Spiele', value : '-times_played'},
	    	{key : 'Anzahl Gebannt', value : '-times_banned'},
	    	{key : 'Präsenz', value : '-present_rate'},
	    	{key : 'Siege', value : '-times_won'},
	    	{key : 'Niederlagen', value : '-times_lost'},
	    	{key : 'Winrate', value : '-winrate'},
	    	{key : 'Banrate', value : '-banrate'},
	    	],

		get_champion_list : function(){
			var self = this, param;

			// set param
			param = {};

			// init status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_get_champion_analysis', param, {
				200 : function(data){

					// for each champ
					_.each(data, function(e){

						// default expanded
						e.expanded = false;

						// define canonical string for css class
						e.champion_name_fixed = e.name.split(' ').join('');
						});

					// take data
					self.data = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		destroy_chart : function(){

			if(this.instance){

				this.instance.destroy();
				this.instance = null;
				}
			},

		get_timeserie : function(champion_name, param){
			var self = this,
			    param = param || null;

			// if already loaded return here
			if(champion_name == self.timeserie.name){

				// destroy chart
				self.destroy_chart();

				// render chart
				self.render();
				return;
				}

			// get playerlist with needed params
			var playerlist = self.get_filtered_playerlist(angular.copy(self.data));

			// if no param given, create
			if(!param){

				// define param
				param = {
					'type'			: 'winrate',
					'run'			: 'champion',
					'category'		: 'champion_only_with_date',
					'playerlist'	: playerlist,
					'champion'		: champion_name,
					'mode'			: 'all',
					'range_num'		: 1000,
					'step'			: '+1 month'
					};
				}

			// load
			$leagueapi.fire_request('customstats_get_timeserie', param, {
				200 : function(data){

					// cache champion name globally
					self.timeserie.name = champion_name;

					// take rawdata & timeserie data
					self.rawdata = data;
					self.timeserie.data = data;

					// render
					self.render();
					},
				'*' : function(data, status){
					self.status = status;
					}
				});
			},

		render : function(change_config){
			var self = this,
				categories_length = this.rawdata.length,
				playernames = [self.timeserie.name],
				categories = [],
				categories_name = {},
				date_only = true,
				data = self.timeserie.data,
				series = null,
				final_data = [],
				new_chart = angular.merge({
					chart: {
						width: 400,
						height: 200,
					    zIndex : 20000,
					    backgroundColor: '#0a0a0a',
						},
				title: {
					text: 'Entwicklung Winrate - ' + self.entry.hovered.name
					},
					xAxis: {
						categories: [], // categories array, eg. ["12-04","12-05","12-06","12-07"]
						labels: {
							},
						plotBands: [{
							color: '#FCFFC5',
							from: null,
							to: null,
							}],
						},
					yAxis : {
						max : 100,
						},
					plotOptions : {
						area : {
							stacking : null,
							lineWidth: 1, lineColor: "#666666",
							marker: {lineWidth: 1, lineColor: "#666666"}
							}
						},
					series: [], // series array, eg. [{"name":"PlayerName", "data":[0,0,0,20,40,60,0]}, {"name":"ChampionName", "data":[0,0,0,20,40,60,0]}]
					}, change_config);

			// for each data
			_.each(data, function(e){

				// get date
				categories.push(e.name);
				});

			// for each player
			_.each(playernames, function(e, playerkey){

				// create series object
				series = {
					'name'		: e,
					'color'		: '#0B7189',
					'data'		: Array(categories_length).fill(0),
					'combined'	: Array(categories_length).fill(0),
					};

				// for each timeserie player
				_.each(data, function(entry, key){

					// skip undefined, null entries
					if(_.isUndefined(entry) || _.isUndefined(entry.result)) return;

					// push result into data array players name index
					series.data[key] = entry.result[e].sum;

					// take player ingame name
					series.combined[key] = {'name' : entry.ingame_name};
					});

				// push serios into chart
				new_chart.series.push(series);
				});

			// fill default
			var data_tmp = Array(categories_length).fill(0);

				// for each series and its data
				_.each(new_chart.series, function(serie){
					_.each(serie.data, function(e, i){

						// skip (current day, hour or 10 min and future)
						if(typeof data_tmp[i] == 'undefined') return;

						// sum value
						data_tmp[i] += e;
						});
					});

				// default
				var fill_until = null;

				// calculating regression for new data (total of all series)
				var result = $regression.linear(data_tmp, fill_until);

				// set name
				result.name = 'Trend (Gesamt)';

				// set trend series
				new_chart.series['Trend'] = {
					"name"		: result.name,
					"color"		: '#B21051',
					"data"		: result.series_data,
					"stacking"	: undefined,
					"type"		: 'spline',
					"marker"	: {enabled: false},
					"enableMouseTracking" : false,
					};

			// create chart
			new_chart.series = _.values(new_chart.series);

			// change stacking option
			new_chart.plotOptions.area.stacking = self.stacking_option;

			// change y axis format for values
			new_chart.yAxis = {
				labels : {
					enabled: true,
					format: '{value}.00 %',
					},
				max : 100,
				min : 0,
				};

			// and change tooltip for percentage symbol
			new_chart.tooltip = {
				format : '&nbsp;%'
				};

			// create multichart
			var multiplechart = $multiplechart.get_new();

			// set categories on xaxis for chart
			new_chart.xAxis.categories = categories;

			// create highchart
			self.highchartdata = multiplechart.create_chart(new_chart);
			},

		filter_champion_games : function(quantity){
			var self = this;

			// copy complete champ list if not set
			if(!_.size(self.data_copy)) self.data_copy = angular.copy(self.data);

			// filter champ list
			self.data = _.filter(angular.copy(self.data_copy), function(e){

				// by quantity of user input
				return e.times_played >= quantity;
				});
			},

		order_list : function(column){
			var self = this;

			// order ascending or descending by given column name
			self.order_by = (self.order_by == column) ? '-' + column : column;
			},

		};

	$scope.renew_view = function(){

		// init
		$scope.view.get_champion_list();

		// search champion by route param
		if(!_.isUndefined($routeParams.champion_name)) $scope.view.filter.string = $routeParams.champion_name;
		}

	$scope.renew_view();

	}]);
