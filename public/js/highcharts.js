'use strict';

// Directive: Highchart
angular.module('customstats').directive('highchart', function (){
    return {
	    restrict: 'E',
	    template: '<div></div>',
	    scope: {
	        title: '@',
	        data: '=chartdata',
	        categories : '=',
	        type : '=',
	        serieslabel : '=',
            },
    link : function(scope, element){
    	var config = {
            chart : {
                type : scope.type ? scope.type : 'area',
                height : 500,
                width : 1400,
                'min-width' : 1200
            	},
           	xAxis : {
           		// 'type'		: 'datetime',
           		labels : {
                	// enabled: true,
                	// format: '{value:%Y, %b}',
            		},
            	categories : scope.categories
            	// categories : ['2019-01', '2019-02', '2019-03', '2019-04', '2019-05', '2019-06', '2019-07', '2019-08', '2019-09', '2019-10', '2019-11', '2019-12', '2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06', '2020-07', '2020-08', '2020-09', '2020-10', '2020-11', '2020-12', '2021-01'],
           			},
           	yAxis : scope.serieslabel,
            title : {
                text: scope.title
            	},
            credits : {
                enabled: false
           		},
            plotOptions : {
                area : {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                    	// enabled: true,
                        // format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    	}
                	}
            	},
            series : scope.data,
			tooltip : {
				formatter : function(){
					var format = ' %';
					var s = '<small style="color: '+this.series.color+';">' + this.series.name + '</small><table class="font-xs ta-right-td3"><br />';
						s += '<tr><td style="background-color:'+this.series.color+';">&nbsp; &nbsp;</td><td>'+this.x+':&nbsp;</td><td><b>'+this.y+format+'</b></td></tr>';
					s += '</table>';
					return s;
					},
				},
    		};

		scope.$watch('data', function(newVal) {
		if (newVal) {
		Highcharts.chart(element[0], config);
		}
		}, true);

        Highcharts.chart(element[0], config);
        }
    };
   });

// Factory: Multichart
angular.module('customstats').factory('$multichart', [function(){

	var skelett = {
		status	: 0,
		mode	: 'chart',
		nav		: {
			param 	: {},
			option	: [],
			},
		config : {
				chart : {
					type: "area"
					},
				plotOptions : {
					line	: {stacking: null},
					column	: {stacking: null},
					bar		: {stacking: null},
					area	: {stacking: 'normal'}
					},
				legend : {
					enabled: false
					},
				tooltip : {
					shared 		: true,
					crosshairs	: [true, false],
					useHTML		: true
					},
				xAxis : {
					tickmarkPlacement : "on",
					},
				yAxis : {
					labels : {

						},
					}
				},
		config_edit : null,
		optionselect : {
			type: [
				{name:"Area Chart", val:"area"}
				],
			stacking: [
				{name:"Kein Stacking", val:null},
				{name:"Normales Stacking", val:"normal"},
				{name:"Prozentuales Stacking", val:"percent"}
				]
			},
		data	: null,
		rawdata : null,
		instance: null,

		load	: function(){},

		set_data: function(){},

		create_chart : function(new_chart, formatter){

			// add defaults
			new_chart = angular.merge({}, this.config, new_chart);

			// // define formater
			// new_chart.tooltip.formatter = (typeof formatter != 'undefined') ? formatter : function(){
			// 	var s = '<small>' + this.x + '</small><table class="font-xs" style="width: 150px !important">';

			// 	$.each(this.points, function(i,c){
			// 		var format = new_chart.tooltip.format;

			// 		if((!format && this.y != 0) || this.y == -1) format = '';
			// 		if(_.isUndefined(format)) format = '';
			// 		s += '<tr><td style="font-size: 4px; width: 10px; height: 10px !important; background-color:'+this.series.color+';">&nbsp; &nbsp;</td><td style="font-size: 10px; color: black;">'+this.series.name+':&nbsp;</td><td><b style="font-size: 10px; color: black;">'+this.y+format+'</b></td></tr>';
			// 		});
			// 	s += '</table>';
			// 	return s;
			// 	};

			// check if we have an empty chart
			if(new_chart.series.length == 0){
				new_chart.series.push({"name":"Leeres Ergebnis", "data":Array(new_chart.xAxis.categories.length).fill(0)});
				}

			// return chart
			return new_chart;
			},

		set_mode : function(mode){
			if(mode == 'config'){
				this.config_edit = angular.toJson(this.config, 4);
				}
			if(mode == 'chart'){
				if(this.mode == 'config') this.render();
				}
			this.mode = mode;
			},

		unset	: function(){
			this.status = 0;
			this.data = null;
			this.rawdata = null;
			}

		};

	return {
		get_new : function(extend){
			return angular.merge({}, skelett, extend);
			}
		};
	}]);


angular.module('customstats').factory('$regression', [function(){

	var regression = {

		linear : function(data, fill_until_length){
			var sum = [0, 0, 0, 0, 0],
				len = 0,
				options = {
					order: 2,
					precision: 2,
					period: null};

			for (let n = 0; n < data.length; n++) {
				if (data[n][1] !== null) {
					len++;
					sum[0] += n;
					sum[1] += data[n];
					sum[2] += n * n;
					sum[3] += n * data[n];
					sum[4] += data[n] * data[n];
					}
				}

			var run = ((len * sum[2]) - (sum[0] * sum[0]));
			var rise = ((len * sum[3]) - (sum[0] * sum[1]));
			var gradient = run === 0 ? 0 : this._round(rise / run, options.precision);
			var intercept = this._round((sum[1] / len) - ((gradient * sum[0]) / len), options.precision);

			var predict = x => ([
				this._round(x, options.precision),
				this._round((gradient * x) + intercept, options.precision)]
				);

			var series_data = Array(len).fill(0);

			data.forEach((d, i) => {
				series_data[i] = this._round((gradient * i) + intercept, options.precision);
				});

			if(fill_until_length){

				for(var i = series_data.length; i < fill_until_length; i++){
					series_data[i] = this._round((gradient * i) + intercept, options.precision);
					}
				}

			return {
				predict,
				equation: [gradient, intercept],
				string: intercept === 0 ? `y = ${gradient}x` : `y = ${gradient}x + ${intercept}`,
				series_data : series_data,
				};

			},

		_round : function(number, precision) {
			var factor = 10 ** precision;
			return Math.round(number * factor) / factor;
			},

		};

	return regression;
	}]);


// Directive: league-highchart
angular.module('customstats').directive('leagueHighchart', [function(){
	return {
		restrict: 'A',
		scope: {
			chartdata: '=leagueHighchart',
			instance: '=leagueInstance',
			},
		link	: function($scope, elem, attr){

			var default_config = {
				chart: {
					backgroundColor: "#ffffff",
                    height : 500,
					},
				plotOptions: {
					area: {
						stacking: 'normal',
						lineWidth: 1, lineColor: "#666666",
						marker: {lineWidth: 1, lineColor: "#666666"}
						},
					bar : {},
					},
				credits: {
					enabled: false
					},
				title: {
					text: null
					},
				xAxis: {title: {text: null}},
				yAxis: {title: {text: null}},
				};

			$scope.$watch('chartdata', function(new_chart){

				// destroy old chart
				if($scope.instance){
					$scope.instance.destroy();
					$scope.instance = null;
					}

				// check if we have a new chart
				if(!new_chart) return;

				// extend with default config
				new_chart = angular.merge({}, default_config, new_chart);

				// set element to attach
				new_chart.chart.renderTo = elem[0];

				// and start rendering
				$scope.instance = new Highcharts.Chart(new_chart);
				});
			}
		}
	}]);