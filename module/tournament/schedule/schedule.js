angular.module('customstats').controller('customstats.tournament_schedule_controller', ['$scope', '$app', '$leagueapi', function($scope, $app, $leagueapi){

	$scope.schedule = {
		list		: [],
		entry		: null,
		status 		: null,
		filter 		: {
			teamID  : null,
			gameDate: null,
			},

		get_schedule : function(tournamentID, tournament_type = 'regular_season'){
			var self = this, param;

			// if already loaded, return here
			if(_.size(self.list) && $scope.tournament_type == tournament_type) return;

			// set global tournament type
			$scope.tournament_type = tournament_type;

			// define param
			param = {
				'tournamentID'	: tournamentID,
				'type'			: tournament_type,
				};

			// check basically if request is okay
			if(!param.tournamentID || !param.type){

				// set error status
				self.status = 400;
				return;
				}

			// set status
			self.status = 100;

			// load
			$leagueapi.send_request('customstats_tournament_api_get_schedule', param, {
				200 : function(data){

					// for each schedule
					_.each(data, function(e){

						// convert back to date only
						e.estimatedDate_from = moment(e.estimatedDate_from).format('YYYY.MM.DD');
						e.estimatedDate_to = moment(e.estimatedDate_to).format('YYYY.MM.DD');

						// convert teamname without spaces and lowercase
						e.team_one_name_converted = e.team_one_name.split(' ').join('').toLowerCase();
						e.team_two_name_converted = e.team_two_name.split(' ').join('').toLowerCase();
						});

					// take list
					self.list = data;
					self.filtered_list = data;
					},
				'*' : function(data, status){

					// take status
					self.status = status;
					}
				});
			},

		generate_source_url : function(entry){
			var self = this;

			// set default entry
			self.entry = {
				'source_url'	: '',
				};

			// path + gamedate + _ + scheduleID
			self.entry.source_url = 'public/img/tournament/source/'+entry.gameDate+'_'+entry.scheduleID+'.png';
			},

		filter_list : function(entry){

			// if game filter for played games only, filter all games that are not played
			if($scope.schedule.filter.gameDate && $scope.schedule.filter.gameDate == 'already_played' && entry.gameDate == '9999-99-99') return false;

			// if game filter for planned games only, filter all games that are already played
			if($scope.schedule.filter.gameDate && $scope.schedule.filter.gameDate == 'open_scheduled' && entry.gameDate != '9999-99-99') return false;

			// if team ID filter is active, remove all not matching teams from list
			if($scope.schedule.filter.teamID && ($scope.schedule.filter.teamID != entry.team_oneID && $scope.schedule.filter.teamID != entry.team_twoID)) return false;

			// allow everything else
			return true;
			}

		};

	// initialize
	$scope.schedule.get_schedule($scope.view.tournament_entry.tournamentID, $scope.view.tournament_type);

	}]);