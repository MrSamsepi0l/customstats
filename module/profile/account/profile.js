'use strict';

angular.module('customstats').controller('customstats.profile_controller', ['$scope', '$app', '$timeout', function($scope, $app, $timeout){

	$scope.view = {
		status			: null,
		entry 			: {},
		error_message	: null,
		success_message	: null,

		update_password : function(entry){
			var self = this, param;

			// define param
			param = {
				'api_key'			: $app.board_get_value('api_key'),
				'old_password'		: entry.old_password,
				'new_password'		: entry.new_password,
				'password_check'	: entry.password_check,
				};

			// if params not filled at all
			if(!param.old_password || !param.new_password || !param.password_check){

				// define error and reset after given time
				self.error_message = 'Passwörter müssen gesetzt sein!';
				$timeout(function(){
					self.error_message = null;
					}, 3000);
				return;
				}

			// if new passwords do not match
			if(param.new_password !== param.password_check){

				// define error and reset after given time
				self.error_message = 'Neues Passwort stimmt nicht überein!';
				$timeout(function(){
					self.error_message = null;
					}, 3000);
				return;
				}

			// if new password is too short
			if(param.new_password.length < 6){

				// define error and reset after given time
				self.error_message = 'Neues Passwort muss mindestens 6 Zeichen lang sein!';
				$timeout(function(){
					self.error_message = null;
					}, 3000);
				return;
				}

			// init loading status
			self.status = 100;

			// update user password
			$app.send_base_request('customstats_update_user_password', param, {
				204 : function(){

					// define error and reset after given time
					self.success_message = 'Passwort erfolgreich aktualisiert!';
					$timeout(function(){
						self.success_message = null;
						self.entry = {};
						}, 5000);
					return;
					},

				400 : function(data){

					// define error and reset after given time
					self.error_message = 'Eingabe überprüfen!';
					$timeout(function(){
						self.error_message = null;
						}, 3000);
					return;
					},

				425 : function(data){

					// define error and reset after given time
					self.error_message = 'Passwort darf nur alle 48 h aktualisiert werden!';
					$timeout(function(){
						self.error_message = null;
						}, 3000);
					return;
					},

				'403|500' : function(data){

					// define error and reset after given time
					self.error_message = 'Aktualisierung fehlgeschlagen!';
					$timeout(function(){
						self.error_message = null;
						}, 3000);
					return;
					},

				'*' : function(data, status){
					self.status = status;
					}
				});

			},
		};

	}]);
