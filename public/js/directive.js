'use strict';

// Directive: custom-hover (tooltip directive for text only)
angular.module('customstats').directive('customHover', function($document, $compile, $timeout, $sce){
	return {
		restrict: 'A',
		scope	: true,
		link	: function($scope, element, attrs){

			// later used variables, tooltip classes (hidden|shown), ngStyle
			var template, compiled,	timer,
				tipClassName = 'custom-tooltip',
				tipActiveClassName = 'tooltip-show',
				ngStyle = $scope.$eval(attrs.customHoverOptions);

			// in var hover define tipClass
			$scope.tipClass = [tipClassName];

			// in var hover define text (replacing \n with line-breaks)
			$scope.text = attrs.customHover.replace(/\\n/g, '<br/>');

			//
			$scope.arrowClass = [];

			// define ng-style on main element
			$scope.ngStyle = (typeof ngStyle != 'undefined') ? ngStyle : {};

			// define template
			template = '<div ng-style="ngStyle" ng-class="tipClass">'
							+'<span ng-bind-html="text | parseHTML"></span>'
							+'<div class="tooltip-arrow" ng-class="arrowClass"></div>'
						+'</div>';

			// html code which compile into article later
			compiled = $compile(template)($scope);

			// defines tooltip position
			if(attrs.customHoverPosition){
				$scope.tipClass.push('tooltip-'+attrs.customHoverPosition);
				}
			else {
				$scope.tipClass.push('tooltip-down');
				}

			// defines tooltip class
			if(attrs.customHoverClass){
				$scope.tipClass.push(attrs.customHoverClass);
				}

			// when mouse over hover, show tooltip
			element.on('mouseenter', function(e){
				appendHover();
				timer = $timeout(function(){tooltipShow(e)}, (typeof attrs.customHoverDelay != 'undefined') ? attrs.customHoverDelay * 1000 : 500);
				});

			function appendHover(){
				var last = $document.find('article').last()
				return last.append(compiled);
				}

			function tooltipShow(e){

				compiled.addClass(tipActiveClassName);

				var pos = e.target.getBoundingClientRect(),

					// get the coordinates of the hover
					offset = compiled.offset(),
					// get the height of the border (incl.)
					hoverHeight = compiled.outerHeight(),
					hoverWidth = compiled.outerWidth(),
					elWidth = pos.width || pos.right - pos.left,
					elHeight = pos.height || pos.bottom - pos.top,
					hoverOffset = 10;

					// get body (scrolling element)
					var scrollbody = $document.find('body');

				if(compiled.hasClass('tooltip-down')){
					offset.top = pos.top + elHeight + hoverOffset + scrollbody[0].scrollTop;
					offset.left = pos.left - (hoverWidth / 2) + (elWidth / 2);
					}
				else if(compiled.hasClass('tooltip-left')){
					offset.top = pos.top - (hoverHeight / 2) + (elHeight / 2);
					offset.left = pos.left - hoverWidth - hoverOffset;
					}
				else if(compiled.hasClass('tooltip-right')){
					offset.top = pos.top - (hoverHeight / 2) + (elHeight / 2);
					offset.left = pos.right + hoverOffset;
					}
				else{
					// tooltip-top
					offset.top = pos.top - hoverHeight - hoverOffset;
					offset.left = pos.left - (hoverWidth / 2) + (elWidth / 2);
					}

				compiled.offset(offset);
				}

			element.on('mouseleave', function(){
				$timeout.cancel(timer);
				compiled.removeClass(tipActiveClassName);
				compiled.remove();
				});

			compiled.on('mouseenter', function(){
				// addClass, maybe causes a display bug
				compiled.removeClass(tipActiveClassName);
				});

			compiled.on('mouseleave', function(){
				compiled.removeClass(tipActiveClassName);
				});
			}
		};
	});

// Directive: popup (popup/modal directive)
angular.module('customstats').directive('customTooltip', ['$document', '$timeout', '$compile', '$window', function($document, $timeout, $compile, $window){

	/*
	- custom tooltip directive for any html code inside a tooltip, triggered on any element

	Example HTML (no table):
	<span custom-tooltip class='float-right tc-white fas fa-cog p-1' custom-tooltip-position='down' custom-tooltip-option='{"width":"200px"}'>
		<content-template>
			<h6>Test</h6>
			</content-template>
		</span>

	Example HTML (table)
	<tr custom-tooltip custom-tooltip-option='{"width":"200px"}' custom-tooltip-in-table="true" custom-tooltip-append-id="bestof-tooltip-append" custom-tooltip-position="right" id="bestof-tooltip-append">
		<td ng-show="false">
		<content-template>
			<span>Test</span>
			</content-template></td>
		<td></td>
		<td></td>
		</tr>

	Parameters:
	- custom-tooltip
	- custom-tooltip-position="down|top|left|right"		// default top
	- custom-tooltip-option="{'width':''|'height':''|'z-index':''}"	// default: none
	- custom-tooltip-delay="int"						// default: 0.5 seconds
	- custom-tooltip-append-id="string"					// default: none
	*/

	// set unique ID for directive
	var uniqueId = 1;

	return {
		restrict: 'A',
		scope : true,
		link: function($scope, element, attrs){
			$scope.customTooltipClass = ["custom-tooltip"];
			$scope.customTooltipStyle = {};
			var x = $scope.$eval(attrs.customTooltipOption),
				timer_show = null,
				timer_hide = null,
				clicked = false,
				hover = $compile(
						'<div ng-class="customTooltipClass" ng-style="customTooltipStyle" ng-attr-id="{{::uniqueTooltipId}}">'
							+'<div class="float-right"><span class="span-button fas fa-times" ng-click="closeCustomTooltip();"></span></div>'
							+'<custom-tooltip-content></custom-tooltip-content>' /*class="p-3"*/
							+'<div class="custom-tooltip-arrow"></div>'
							+'<div class="custom-tooltip-arrow-2"></div>'
							+'</div>')($scope),
				hover_show = 'custom-tooltip-show',
				hover_hide = 'custom-tooltip-hide',
				clickable = ($scope.$eval(attrs.customTooltipClickable) == false) ? $scope.$eval(attrs.customTooltipClickable) : true;

			// set unique ID for each directive
			$scope.uniqueTooltipId = 'ct-u-'+uniqueId++;

			// function for closing tooltip
			$scope.closeCustomTooltip = function(){

				// set clicked on false
				clicked = false;

				// hide tooltip
				click_hide();
				}

			// if tooltip option width/height is set
			if(x && x.width){
				$scope.customTooltipStyle.width = x.width;
				}
			if(x && x.height){
				$scope.customTooltipStyle.height = x.height;
				}
			if(x && x.background){
				$scope.customTooltipStyle.background = x.background;
				}
			if(x && x['z-index']){
				$scope.customTooltipStyle['z-index'] = x['z-index'];
				}

			// if tooltip position is set
			if(attrs.customTooltipPosition){
				$scope.customTooltipClass.push('custom-tooltip-' + attrs.customTooltipPosition);
				}
			else {
				$scope.customTooltipClass.push('custom-tooltip-down');
				}

			// append hover on the document
			function appendHover(){

				// if element is inside a table (problems with rendering and getting child element of <tr>)
				if(attrs.customTooltipInTable) hover.children('custom-tooltip-content').append(element.children('td').children('content-template'));

				// append the "content-template" on hover
				else hover.find('custom-tooltip-content').append(element.children('content-template').children());

				// if attribute customTooltipAppendId is set, append hover on element with this ID
				if(attrs.customTooltipAppendId) angular.element(document.getElementById(attrs.customTooltipAppendId)).append(hover);

				// otherwise append hover on body class (default)
				else angular.element(document.getElementById('custom-stats')).append(hover);
				}

			function tooltip_position(e){

				// add class to show element
				hover.addClass(hover_show);

				// some default values
				var pos = e[0].getBoundingClientRect(),
					offset = hover.offset(),
					hoverHeight = hover.outerHeight(),
					hoverWidth = hover.outerWidth(),
					elWidth = pos.width || pos.right - pos.left,
					elHeight = pos.height || pos.bottom - pos.top,
					hoverOffset = 10,
					scrollOnBody = $document.find('body')[0].scrollTop;

				// console.log(pos, offset, hoverHeight, hoverWidth, elWidth, elHeight);

				// some calculation
				if(hover.hasClass('custom-tooltip-down')) {
					offset.top = pos.top + elHeight + hoverOffset + scrollOnBody;
					offset.left = pos.left - (hoverWidth / 2) + (elWidth / 2);
					}
				else if(hover.hasClass('custom-tooltip-left')) {
					offset.top = pos.top - (hoverHeight / 2) + (elHeight / 2) + scrollOnBody;
					offset.left = pos.left - hoverWidth - hoverOffset;
					}
				else if(hover.hasClass('custom-tooltip-right')) {
					offset.top = pos.top - (hoverHeight / 2) + (elHeight / 2) + scrollOnBody;
					offset.left = pos.right + hoverOffset;
					}
				else {	// tooltip-top
					offset.top = pos.top - hoverHeight - hoverOffset + scrollOnBody;
					offset.left = pos.left - (hoverWidth / 2) + (elWidth / 2);
					}

				// set offset for template
				hover.offset(offset);

				// take some params
				var hover_pos = hover[0].getBoundingClientRect(),
					window_width = $window.innerWidth,
					offset = hover.offset();

				// if hover element right position is bigger than viewport, recalculate right and left
				if(hover_pos.right > window_width){
					offset.right = hover_pos.right - window_width;
					offset.left = offset.left - offset.right;
					}
				else if(hover_pos.left < 0){
					offset.left = 0;
					offset.right = offset.right + Math.abs(hover_pos.left);
					}

				// set offset again
				hover.offset(offset);
				}

			function pre_check(){

				// cancel hide timeout
				$timeout.cancel(timer_hide);
				timer_hide = null;

				// return if already show
				if(hover[0] && hover[0].classList.contains(hover_show)) return;

				// append
				appendHover();
				}

			function mouse_enter(e){

				// pre check + appendHover
				pre_check();

				// if delay is defined
				if(attrs.customTooltipDelay) {

					// timeout for showing
					timer_show = $timeout(function(){
						tooltip_position(e);
						}, attrs.customTooltipDelay * 1000);
					}
				else {

					// timeout for showing
					timer_show = $timeout(function(){
						tooltip_position(e);
						}, 500);
					}
				}

			function mouse_leave(){

				// dont close if clicked before
				if(clicked) return;

				// cancel open timeout
				$timeout.cancel(timer_show);
				timer_show = null;

				// after 300ms, add class to animation hide
				timer_hide = $timeout(function(){

					// add class hover_hide (fade out of tooltip)
					hover.addClass(hover_hide);

					// after length of animation (75ms), remove classes and element from document
					$timeout(function() {
						hover.removeClass(hover_show);
						hover.removeClass(hover_hide);

						var node = document.getElementById($scope.uniqueTooltipId);
						if(node) node.parentNode.removeChild(node);
						}, 75);
					}, 300);
				}

			function click_show(e){

				// pre check + appendHover
				pre_check();

				// "timeout" for showing
				timer_show = $timeout(function(){
					tooltip_position(e);
					}, 0);
				}

			function click_hide(){

				// cancel timeout and reset
				$timeout.cancel(timer_show);
				timer_show = null;

				// remove class
				hover.removeClass(hover_show);
				}

			function toggle_click(e){

				// toggle click
				clicked = !clicked;

				if(!clicked) click_hide();
				else click_show(e);
				}

			// click event on icon
			element.on('click', function(e){

				// if not allowed to click
				if(!clickable) return;

				// toggle click
				toggle_click(element);
				});

			// mouseenter
			element.on('mouseenter', function(e){

				// show tooltip
				mouse_enter(element);
				});

			// mouseleave
			element.on('mouseleave', function(e){

				// call mouse leave event
				mouse_leave();
				});

			// on mouseenter event on hover template
			hover.on('mouseenter', function(e){

				// cancel hide timeout
				$timeout.cancel(timer_hide);
				timer_hide = null;
				});

			// on mouseleave event on hover template
			hover.on('mouseleave', function(e){

				// call mouse leave event
				mouse_leave();
				});

			// this happens if element is destroyed, remove everything
			$scope.$on('$destroy', function(){

				// remove everything
				clicked = false;
				mouse_leave()
				})
			}
		};
	}]);

// Directive: popup (popup/modal directive)
angular.module('customstats').directive('customTooltipNav', ['$document', '$timeout', '$compile', '$window', '$location', '$rootScope', function($document, $timeout, $compile, $window, $location, $rootScope){

	/*
	- custom tooltip directive for any html code inside a tooltip, triggered on any element

	Example HTML (no table):
	<span custom-tooltip class='float-right tc-white fas fa-cog p-1' custom-tooltip-position='down' custom-tooltip-option='{"width":"200px"}'>
		<content-template>
			<h6>Test</h6>
			</content-template>
		</span>

	Example HTML (table)
	<tr custom-tooltip custom-tooltip-option='{"width":"200px"}' custom-tooltip-in-table="true" custom-tooltip-append-id="bestof-tooltip-append" custom-tooltip-position="right" id="bestof-tooltip-append">
		<td ng-show="false">
		<content-template>
			<span>Test</span>
			</content-template></td>
		<td></td>
		<td></td>
		</tr>

	Parameters:
	- custom-tooltip
	- custom-tooltip-position="down|top|left|right"		// default top
	- custom-tooltip-option="{'width':''|'height':''|'z-index':''}"	// default: none
	- custom-tooltip-delay="int"						// default: 0.5 seconds
	- custom-tooltip-append-id="string"					// default: none
	*/

	// set unique ID for directive
	var uniqueId = 2;

	return {
		restrict: 'A',
		scope : true,
		link: function($scope, element, attrs){
			$scope.customTooltipClass = ["custom-tooltip-nav"];
			$scope.customTooltipStyle = {};
			var x = $scope.$eval(attrs.customTooltipOption),
				timer_show = null,
				timer_hide = null,
				is_hovering = false,
				timer_hide_inner = null,
				current_domain = $location.host(),
				clicked = false,
				hover = $compile(
						'<div ng-class="customTooltipClass" ng-style="customTooltipStyle" ng-attr-id="{{uniqueTooltipId}}">'
							+'<div class="float-right"><span class="span-button fas fa-times" ng-click="closeCustomTooltip();"></span></div>'
							+'<custom-tooltip-content></custom-tooltip-content>' /*class="p-3"*/
							+'</div>')($scope),
				hover_show = 'custom-tooltip-nav-show',
				hover_hide = 'custom-tooltip-nav-hide',
				clickable = ($scope.$eval(attrs.customTooltipClickable) == false) ? $scope.$eval(attrs.customTooltipClickable) : false;

			// set unique ID for each directive
			$scope.uniqueTooltipId = 'ct-u-'+uniqueId++;

			// function for closing tooltip
			$scope.closeCustomTooltip = function(){

				// set clicked on false
				clicked = false;

				// hide tooltip
				click_hide();
				}

			// if tooltip option width/height is set
			if(x && x.width){
				$scope.customTooltipStyle.width = x.width;
				}
			if(x && x.height){
				$scope.customTooltipStyle.height = x.height;
				}
			if(x && x.background){
				$scope.customTooltipStyle.background = x.background;
				}
			if(x && x['z-index']){
				$scope.customTooltipStyle['z-index'] = x['z-index'];
				}

			// if tooltip position is set
			if(attrs.customTooltipPosition){
				$scope.customTooltipClass.push('custom-tooltip-nav-' + attrs.customTooltipPosition);
				}
			else {
				$scope.customTooltipClass.push('custom-tooltip-nav-down');
				}

			// append hover on the document
			function appendHover(){

				// if element is inside a table (problems with rendering and getting child element of <tr>)
				if(attrs.customTooltipInTable) hover.children('custom-tooltip-content').append(element.children('td').children('content-template'));

				// append the "content-template" on hover
				else hover.find('custom-tooltip-content').append(element.children('content-template').children());

				// if attribute customTooltipAppendId is set, append hover on element with this ID
				if(attrs.customTooltipAppendId) angular.element(document.getElementById(attrs.customTooltipAppendId)).append(hover);

				// otherwise append hover on body class (default)
				else angular.element(document.getElementById('custom-stats')).append(hover);
				}

			function tooltip_position(e){

				// add class to show element
				hover.addClass(hover_show);

				// some default values
				var pos = e[0].getBoundingClientRect(),
					offset = hover.offset(),
					hoverHeight = hover.outerHeight(),
					hoverWidth = hover.outerWidth(),
					elWidth = pos.width || pos.right - pos.left,
					elHeight = pos.height || pos.bottom - pos.top,
					hoverOffset = 0,
					scrollOnBody = $document.find('body')[0].scrollTop;

				// console.log(pos, offset, hoverHeight, hoverWidth, elWidth, elHeight);

				// some calculation
				if(hover.hasClass('custom-tooltip-nav-down')) {
					offset.top = pos.top + elHeight + hoverOffset + scrollOnBody;
					offset.left = pos.left - (hoverWidth / 2) + (elWidth / 2);
					}
				else if(hover.hasClass('custom-tooltip-nav-left')) {
					offset.top = pos.top - (hoverHeight / 2) + (elHeight / 2) + scrollOnBody;
					offset.left = pos.left - hoverWidth - hoverOffset;
					}
				else if(hover.hasClass('custom-tooltip-nav-right')) {
					offset.top = pos.top - (hoverHeight / 2) + (elHeight / 2) + scrollOnBody;
					offset.left = pos.right + hoverOffset;
					}
				else {	// tooltip-top
					offset.top = pos.top - hoverHeight - hoverOffset + scrollOnBody;
					offset.left = pos.left - (hoverWidth / 2) + (elWidth / 2);
					}

				// set offset for template
				hover.offset(offset);

				// take some params
				var hover_pos = hover[0].getBoundingClientRect(),
					window_width = $window.innerWidth,
					offset = hover.offset();

				// if hover element right position is bigger than viewport, recalculate right and left
				if(hover_pos.right > window_width){
					offset.right = hover_pos.right - window_width;
					offset.left = offset.left - offset.right;
					}
				else if(hover_pos.left < 0){
					offset.left = 0;
					offset.right = offset.right + Math.abs(hover_pos.left);
					}

				// set offset again
				hover.offset(offset);
				}

			function pre_check(){

				// if locked global, abort
				if($rootScope.tooltipNavLock) return;

				// cancel hide timeout
				$timeout.cancel(timer_hide);
				timer_hide = null;

				// don't append a second copy if the tooltip node is already in the DOM
				if(document.getElementById($scope.uniqueTooltipId)) return;

				// append
				appendHover();
				}

			function mouse_enter(e){

				// if locked global, abort
				if($rootScope.tooltipNavLock) return;

				// if inner timer for hiding already started
				if(timer_hide_inner){

					// cancel and reset it
					$timeout.cancel(timer_hide_inner);
					timer_hide_inner = null;
					hover.removeClass(hover_hide);
					}

				// already open, nothing to do
				if(hover[0] && hover[0].classList.contains(hover_show)) return;

				// guard against a stray leftover node (e.g. hide animation was interrupted)
				if(document.getElementById($scope.uniqueTooltipId)) return;

				// actually append now
				appendHover();

				// define delay (delay it even if not defined minimum 50ms to update scope)
				var delay = (attrs.customTooltipDelay) ? attrs.customTooltipDelay * 1000 : 50;

				// start timer to show
				timer_show = $timeout(function(){

					// and show after given or default delay
					tooltip_position(e);
					}, delay);
				}

			function mouse_leave(){

				// don't close if clicked before
				if(clicked) return;

				// cancel and reset open timer
				$timeout.cancel(timer_show);
				timer_show = null;

				// after 100ms, add class to animation hide
				timer_hide = $timeout(function(){

					// add class hover_hide (fade out of tooltip)
					hover.addClass(hover_hide);

					// after length of animation (75ms), remove classes and element from document
					timer_hide_inner = $timeout(function(){
						hover.removeClass(hover_show);
						hover.removeClass(hover_hide);

						var node = document.getElementById($scope.uniqueTooltipId);
						if(node) node.parentNode.removeChild(node);
						}, 75);
					}, 100);
				}

			function click_show(e){

				// pre check + appendHover
				pre_check();

				// "timeout" for showing
				timer_show = $timeout(function(){
					tooltip_position(e);
					}, 0);
				}

			function click_hide(){

				// cancel timeout and reset
				$timeout.cancel(timer_show);
				timer_show = null;

				// remove class
				hover.removeClass(hover_show);
				}

			function toggle_click(e){

				// toggle click
				clicked = !clicked;

				if(!clicked) click_hide();
				else click_show(e);
				}

			// click event on icon
			element.on('click', function(e){

				// if not allowed to click
				if(!clickable) return;

				// toggle click
				toggle_click(element);
				});

			// mouseenter
			element.on('mouseenter', function(e){

				is_hovering = true;

				// a pending close from a just-finished hover shouldn't fire after we've re-entered
				$timeout.cancel(timer_hide);
				timer_hide = null;

				// cancel an in-flight removal immediately, don't wait for the 55ms delay to reach mouse_enter
				if(timer_hide_inner){
					$timeout.cancel(timer_hide_inner);
					timer_hide_inner = null;
					hover.removeClass(hover_hide);
					}

				// don't stack a second show-timer on top of one already pending
				$timeout.cancel(timer_show);

				timer_show = $timeout(function(){
					mouse_enter(element);
					}, 55);
				});

			// mouseleave
			element.on('mouseleave', function(e){

				is_hovering = false;

				// a pending open shouldn't fire after we've already left
				$timeout.cancel(timer_show);
				timer_show = null;

				// don't stack a second hide-timer on top of one already pending
				$timeout.cancel(timer_hide);

				timer_hide = $timeout(function(){
					mouse_leave();
					}, 50);
				});

			// on mouseenter event on hover template
			hover.on('mouseenter', function(e){

				// moving onto the tooltip itself should also cancel any pending close
				$timeout.cancel(timer_hide);
				timer_hide = null;
				});

			// on mouseleave event on hover template
			hover.on('mouseleave', function(e){

				$timeout.cancel(timer_show);
				timer_show = null;
				$timeout.cancel(timer_hide);

				timer_hide = $timeout(function(){
					mouse_leave();
					}, 10);
				});

			// this happens if element is destroyed, remove everything
			$scope.$on('$destroy', function(){

				// prevent a leftover show-timer from opening a tooltip on a destroyed element
				$timeout.cancel(timer_show);

				// "timeout" for showing
				timer_hide = $timeout(function(){

					// call mouse leave event
					mouse_leave();
					}, 10);
				});

			// block set the moment navigation begins — before any old elements are even torn down
			$rootScope.$on('$locationChangeStart', function(){
				$rootScope.tooltipNavLock = true;

				// kill any tooltip mid-flight right away, on whichever instance currently has one open
				$timeout.cancel(timer_show);
				$timeout.cancel(timer_hide);
				timer_show = null;
				timer_hide = null;
				timer_hide_inner = null;
				clicked = false;

				hover.removeClass(hover_show);
				hover.removeClass(hover_hide);

				var node = document.getElementById($scope.uniqueTooltipId);
				if(node) node.parentNode.removeChild(node);
				});

			// on content finished renderinng: only release the lock once the NEW view (and its new directive instances) has finished loading
			$rootScope.$on('$viewContentLoaded', function(){
				$timeout(function(){

					// unlock globally
					$rootScope.tooltipNavLock = false;

					// if the cursor never left this element while the lock was active
					if(is_hovering){

						// no mouseenter will ever fire again to open it - so open it now if still hovered
						mouse_enter(element);
						}
					});
				});

			/* on location route changes */
			$scope.$on('$locationChangeSuccess', function(){
				var new_domain = $location.host();

				// if domain changed
				if(new_domain !== current_domain){

					// update to new domain
					current_domain = new_domain;

					// execute callback
					$scope.$eval(attrs.domainWatcher);
					}
				});
			}
		};
	}]);

// Directive: league-popup (popup/modal directive)
angular.module('customstats').directive('leaguePopup', function($document){
	return {
		restrict	: 'E',
		scope		: {
			ngIf	: '='
			},
		transclude	: {
			'body'	: 'bodyPart',
			},
		replace		: true,
		template	: '<div>'
						+'<div class="modal-overlay" ng-click="overlayClose()"></div>'
						+'<div class="absboxorg custom-modal-dialog" ng-style="ngStyle">'
							+'<div class="absboxorg body" style="width: 100%; height: 100%">'
								+'<div ng-transclude="body"></div>'
							+'</div>'
						+'</div>'
					 +'</div>',
		link : function($scope, element, attrs, template){

			// take style options defined in scope
			var ngStyle = $scope.$eval(attrs.xaPopupOptions);

			// for style
			$scope.ngStyle = (typeof ngStyle != 'undefined') ? ngStyle : {};

			// overlay close
			$scope.overlayClose = function(){

				// if activated
				if(ngStyle.overlayClose == true){

					// close modal on scope
					$scope.ngIf = false;

					// remove hidden overflow class if popup gets closed
					angular.element('#custom-stats').removeClass('modal-open');
					}
				}

			// add hidden overflow class for body if modal gets opened
			angular.element('#custom-stats').addClass('modal-open');
			}
		};
	});

// Directive: scroll-if
angular.module('customstats').directive('scrollIf', function(){
	var getScrollingParent = function(element) {
		element = element.parentElement;
		while (element) {
			if (element.scrollHeight !== element.clientHeight) {
				return element;
			}
			element = element.parentElement;
		}
		return null;
	};
	return function (scope, element, attrs) {
		scope.$watch(attrs.scrollIf, function(value) {
			if (value) {
				var sp = getScrollingParent(element[0]);
				var topMargin = parseInt(attrs.scrollMarginTop) || 0;
				var bottomMargin = parseInt(attrs.scrollMarginBottom) || 0;
				var elemOffset = element[0].offsetTop -200;
				var elemHeight = element[0].clientHeight;

				if (elemOffset - topMargin < sp.scrollTop) {
					sp.scrollTop = elemOffset - topMargin;
				} else if (elemOffset + elemHeight + bottomMargin > sp.scrollTop + sp.clientHeight) {
					sp.scrollTop = elemOffset + elemHeight + bottomMargin - sp.clientHeight;
				}
			}
		});
	}
	});

// Directive: scroll-to-bottom
angular.module('customstats').directive('scrollToBottom', ['$timeout', function($timeout){
	return {
		scope: {
			scrollToBottom: "=",
			scrollToTop: "="
			},
		restrict: 'A',
		link: function(scope, element, attr){
			scope.$watchCollection('scrollToBottom', function(newVal){
				if(newVal){
					$timeout(function() {
						element[0].scrollTop = element[0].scrollHeight;

						// if scroll to top is true, scroll to top instead of scroll to bottom
						if(scope.scrollToTop) element[0].scrollTop = 0;
						}, 50);
					}
				});
			}
		};
	}]);

// Directive: when-scrolled
angular.module('customstats').directive('whenScrolled', ['$timeout', function($timeout){
	return {
		restrict: 'A',
		link: function(scope, elem, attrs){

			// set timeout to avoid minor lag if nothing can be rendered
			$timeout(function(){

				// list of elements of size 1 and take first
				var raw = elem[0];

				// load more elements when scrolled past a limit
				elem.bind('scroll', function(){

					// if scrolled to bottom
					if((raw.scrollTop + raw.offsetHeight) >= (raw.scrollHeight - 1)){

						// any function which loads more elements into the list
						scope.$apply(attrs.whenScrolled);
						}
					});

				}, 10);

			}
		}
	}]);

// Directive: league-profile-level-progression
angular.module('customstats').directive('leagueProfileLevelProgression', ['$interval', function($interval){

	return {
		restrict	: 'E',
		scope		: {
			ngIf	: '=',
			entry	: '=progressionEntry',
			instance: '=progressionInstance',
			},
		replace		: false,
		template	: '<div class="level-progress-header ta-center">'
						+'<div class="level-progress-name">{{progression_result.name}}</div>'
						+'<div class="level-progress-level">Level {{progression_result.level}} ({{progress}} %)</div>'
						+'</div>'
					  +'<div class="level-progress-body">'
						+'<div class="middle-circle" id="middle-circle" ng-style="{\'background-image\' : \'url(\' + progression_result.icon_url + \'), linear-gradient(to right, rgb(25, 22, 26), rgb(9 22 20))\'}"></div>'
						+'<div class="progress-spinner"></div>'
						+'</div>'
					  +'<div class="level-progress-footer" ng-if="progression_result.level < 21"><nobr>Nächster Rang: {{progression_result.next_rank}} ({{progression_result.necessary_games}} {{progression_result.necessary_games > 1 ? \'Customs\' : \'Custom\'}})</nobr></div>'
					  +'<div class="level-progress-footer" ng-if="progression_result.level >= 26"><nobr>Höchster Rang erreicht</nobr></div>',

		link : function($scope, element, attrs){

			// define render function
			$scope.render = function(){

				// define some variables
				var level_list, progression_result,
					times_played, progress = 0,
					middle_circle, progress_spinner;

				// take options for progression defined in scope
				times_played = $scope.$eval(attrs.timesPlayed);

				// define level list
				level_list = [
					{'level' : 1, 'roman' : 'I', 'icon' : 'bishop.png', 'start' : 0, 'end' : 9, 'name' : 'Frischfleisch'},
					{'level' : 2, 'roman' : 'II', 'icon' : 'bishop.png', 'start' : 10, 'end' : 19, 'name' : 'Neuling'},
					{'level' : 3, 'roman' : 'III', 'icon' : 'bishop.png', 'start' : 20, 'end' : 29, 'name' : 'Akzeptierter'},
					{'level' : 4, 'roman' : 'IV', 'icon' : 'bishop.png', 'start' : 30, 'end' : 39, 'name' : 'Kurier'},
					{'level' : 5, 'roman' : 'V', 'icon' : 'bishop.png', 'start' : 40, 'end' : 49, 'name' : 'Rüpel'},
					{'level' : 6, 'roman' : 'VI', 'icon' : 'pawn.png', 'start' : 50, 'end' : 59, 'name' : 'Mitglied'},
					{'level' : 7, 'roman' : 'VII', 'icon' : 'pawn.png', 'start' : 60, 'end' : 69, 'name' : 'Novize'},
					{'level' : 8, 'roman' : 'VIII', 'icon' : 'pawn.png', 'start' : 70, 'end' : 79, 'name' : 'Sturmtruppe'},
					{'level' : 9, 'roman' : 'IX', 'icon' : 'pawn.png', 'start' : 80, 'end' : 89, 'name' : 'Jäger'},
					{'level' : 10, 'roman' : 'X', 'icon' : 'pawn.png', 'start' : 90, 'end' : 99, 'name' : 'Kultist'},
					{'level' : 11, 'roman' : 'XI', 'icon' : 'knight.png', 'start' : 100, 'end' : 119, 'name' : 'Wächter'},
					{'level' : 12, 'roman' : 'XII', 'icon' : 'knight.png', 'start' : 120, 'end' : 139, 'name' : 'Ritter'},
					{'level' : 13, 'roman' : 'XIII', 'icon' : 'knight.png', 'start' : 140, 'end' : 159, 'name' : 'Auserwählter'},
					{'level' : 14, 'roman' : 'XIV', 'icon' : 'knight.png', 'start' : 160, 'end' : 179, 'name' : 'Survivor'},
					{'level' : 15, 'roman' : 'XV', 'icon' : 'knight.png', 'start' : 180, 'end' : 199, 'name' : 'Gladiator'},
					{'level' : 16, 'roman' : 'XVI', 'icon' : 'rook.png', 'start' : 200, 'end' : 219, 'name' : 'Entertainer'},
					{'level' : 17, 'roman' : 'XVII',  'icon' : 'rook.png', 'start' : 220, 'end' : 239, 'name' : 'Crowd Pleaser'},
					{'level' : 18, 'roman' : 'XVIII', 'icon' : 'rook.png', 'start' : 240, 'end' : 259, 'name' : 'Superstar'},
					{'level' : 19, 'roman' : 'XIX', 'icon' : 'rook.png', 'start' : 260, 'end' : 279, 'name' : 'Arena-Gott'},
					{'level' : 20, 'roman' : 'XX', 'icon' : 'rook.png', 'start' : 280, 'end' : 299, 'name' : 'Legende'},
					{'level' : 21, 'roman' : 'XXI', 'icon' : 'queen.png', 'start' : 300, 'end' : 319, 'name' : 'Titan'},
					{'level' : 22, 'roman' : 'XXII', 'icon' : 'queen.png', 'start' : 320, 'end' : 339, 'name' : 'Titan'},
					{'level' : 23, 'roman' : 'XXIII', 'icon' : 'queen.png', 'start' : 340, 'end' : 359, 'name' : 'Titan'},
					{'level' : 24, 'roman' : 'XXIV', 'icon' : 'queen.png', 'start' : 360, 'end' : 379, 'name' : 'Titan'},
					{'level' : 25, 'roman' : 'XXV', 'icon' : 'queen.png', 'start' : 380, 'end' : 399, 'name' : 'Titan'},
					{'level' : 26, 'roman' : 'XXVI', 'icon' : 'king.png', 'start' : 400, 'end' : 419, 'name' : 'Gesandter'},
					{'level' : 27, 'roman' : 'XXVII', 'icon' : 'king.png', 'start' : 420, 'end' : 439, 'name' : 'Gesandter'},
					{'level' : 28, 'roman' : 'XXVIII', 'icon' : 'king.png', 'start' : 440, 'end' : 459, 'name' : 'Gesandter'},
					{'level' : 29, 'roman' : 'XXIX', 'icon' : 'king.png', 'start' : 460, 'end' : 479, 'name' : 'Gesandter'},
					{'level' : 30, 'roman' : 'XXX', 'icon' : 'king.png', 'start' : 480, 'end' : 499, 'name' : 'Gesandter'},
					];

				// define in scope if options defined or take default
				$scope.times_played = (typeof times_played != 'undefined') ? parseInt(times_played) : 0;

				// define progress manually
				$scope.progress = 0;

				// define/reset interval promise
				$scope.interval = null;

				// default progression result
				progression_result = {
					level		: 0,
					name		: '',
					roman		: '',
					icon		: 'bishop.png',
					icon_url	: 'public/img/chess_level/',
					next_rank 	: '',
					};

				// for each level in list
				_.each(level_list, function(e, index, list){

					// define base_factor (if level in list equals or below 10, take 10 else take 5)
					var base_factor = e.level <= 10 ? 10 : 5;

					// if times played by player matches given level range (start -> end)
					if(times_played >= e.start && times_played <= e.end){

						// for these keys
						_.each(['level', 'roman', 'name', 'icon'], function(key){

							// simply update in progression result
							progression_result[key] = e[key];
							});

						// update progress (global)
						progress = (times_played - e.start) * base_factor;

						// update next rank
						progression_result.next_rank = list[index + 1].name;

						// update necessary games
						progression_result.necessary_games = list[index + 1].start - times_played;
						}
					});

				// append icon to given base url
				progression_result.icon_url += progression_result.icon;

				// get middle circle
				middle_circle = document.getElementsByClassName('middle-circle')[0];

				// get progress spinner
				progress_spinner = document.getElementsByClassName('progress-spinner')[0];

				// if we have progress
				if(progress > 0){

					// start interval
					$scope.interval = $interval(function(){

						// increment progress
						$scope.progress++;

						// increment background circle
						progress_spinner.style.background = "conic-gradient(rgb(15 55 64)" + $scope.progress + "%,rgb(255, 255, 255)" + $scope.progress + "%)";

						// add roman string to html middle circle
						middle_circle.innerHtml = progression_result.roman.toString();

						// if end of progress reached
						if($scope.progress == progress){

							// stop running interval
							$interval.cancel($scope.interval);
							}
						}, 50, 0); // interval increment all 50 ms
					}

				// if no progress (just leveled up)
				else if(progress == 0){

					// add background to progress spinner
					progress_spinner.style.background = "conic-gradient(rgb(15 55 64)" + progress + "%,rgb(255, 255, 255) " + progress + "%)";

					// add roman string to html middle circle
					middle_circle.innerHtml = progression_result.roman.toString();
					}

				// add globally
				$scope.progression_result = progression_result;

				};

			// render level progression
			$scope.render();

			// if entry changes (other player selected)
			$scope.$watch('entry', function(old_progression, new_progression){

				// if we have an interval started, cancel it
				if($scope.interval) $interval.cancel($scope.interval);

				// check if something changed
				if(!new_progression) return;

				// re-render level progression
				$scope.render();
				});
			}
		};

	}]);

angular.module('customstats').directive('fileChange', function() {
    return function(scope, element, attrs) {
        element.on('change', function() {
            scope.$apply(function() {
                scope.$eval(attrs.fileChange, {
                    files: element[0].files
                });
            });
        });
    };
});
