'use strict';

// Filter: $phpdate
angular.module('customstats').filter('phpdate', ['$phpdate', function($phpdate){
	// Nutzung von PHPs date() zum Formatieren, und Moment.js zum parsen
	return function(value, format){
		return $phpdate(value).format(format);
		};
	}]);

// Filter: groupBy
angular.module('customstats').filter('groupBy', ['$parse', function($parse) {
        return _.memoize(function(items, field) {
            var getter = $parse(field);
            return _.groupBy(items, function(item) {
                return getter(item);
            });
        }, function(items) {
            return JSON.stringify(items);
        });
    }]);

// Filter: parseHtml
angular.module('customstats').filter('parseHTML', function($sce){

	return function(text){
		return $sce.trustAsHtml(text);
		}
	});

angular.module('customstats').filter('customOrderBy', function() {
  return function(items, field, reverse) {

	items.sort(function (a, b) {
		return (a[field] > b[field] ? 1 : -1);
		});

	if(reverse == 'desc') items.reverse();
    return items;
  };
});

angular.module('customstats').filter('ie', function(){
	return function(v, yes, no){
		return v ? yes : no;
		};
	});

angular.module('customstats').filter('ieie', function(){
	return function(v, y1, ei, y2, no){
		return v ? y1 : (ei ? y2 : no);
		};
	});

angular.module('customstats').filter('append', function(){
	return function(v, n){
		return (v || typeof v == 'number') ? v+n : v;
		};
	});

angular.module('customstats').filter('prepend', function(){
	return function(v, n){
		return (v || typeof v == 'number') ? n+v : v;
		};
	});