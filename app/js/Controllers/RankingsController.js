angular.module('travelersControllers').controller('RankingsCtrl', ['$scope', '$http', 'localStorageService',
	'srvCities', 'srvVotes', 'srvNews', 'srvUser', 'srvDiacritics', 'socket', 'srvAlerts',
	function ($scope, $http, localStorageService, srvCities, srvVotes, srvNews, srvUser, srvDiacritics, socket, srvAlerts) {
		
		$scope.ownId = localStorageService.get('fbId');

		$scope.own_img = "http://graph.facebook.com/" + $scope.ownId + "/picture";

		$scope.showCityPanel = false;


		//Error message handling
		$scope.alerts = srvAlerts.get();
		$scope.closeAlert = function(index) {
    		$scope.alerts.splice(index, 1);
	  	};


		//Initial values for the map properties, will be overwritten later with the user's home location
		$scope.map = {
			center: {
				latitude: 30,
				longitude: 0
			},
			zoom: 4
		};

		$scope.coords = {};

		socket.on('send:rankings', function (data) {
			loadRankings();
		});

		socket.on('send:vote', function (data) {
			if (data.vote.city_name == $scope.city_name) {
				("first if passed")
				$scope.city_votes = data.vote.city_votes;
				$scope.city_mark = data.vote.city_mark;
			}
		});

		loadRankings();


		$scope.selected = undefined;
		// Any function returning a promise object can be used to load values asynchronously
		$scope.getLocation = function(val) {
			return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
				params: {
					address: val,
					language: "en",
					sensor: false
				}
			}).then(function(res){
				var addresses = [];
				angular.forEach(res.data.results, function(item){
					addresses.push({"formatted_name": item.formatted_address, "info" : item});
				});
				return addresses;
			});
		};

		$scope.showCity = function(city) {

			$scope.showCityPanel = true;
			$scope.userHasVoted = false;
			$scope.isReadonly = false;

			var city_formatted = srvDiacritics.removeDiacritics(city.info.address_components[0].long_name)

			$http.get('https://www.googleapis.com/freebase/v1/topic/en/' + city_formatted.toLowerCase().split(' ').join('_') 
				+ "?filter=/common/topic/description&key=AIzaSyBjhGn5F7_mGO2p5n7LAsJV5d2RY17UNCY")
			.then(function (response) {
				if(response.data.property != null) {
					$scope.city_text = response.data.property['/common/topic/description'].values[0].text;
				} else {
					$scope.city_text = "Sorry, but our database does not have information for this city";
				}
			}, function (error) {
				$scope.city_text = "Sorry, but our database does not have information for this city";
			})

			$http.get('https://www.googleapis.com/freebase/v1/topic/en/' + city_formatted.toLowerCase().split(' ').join('_') 
				+ "?filter=/common/topic/image&limit=1&key=AIzaSyBjhGn5F7_mGO2p5n7LAsJV5d2RY17UNCY")
			.then(function (response) {

				if (response.data.property != null) {
					$scope.city_image = "https://www.googleapis.com/freebase/v1/image/" +
					response.data.property['/common/topic/image'].values[0].id +
					"?maxwidth=960&key=AIzaSyBjhGn5F7_mGO2p5n7LAsJV5d2RY17UNCY";
				} else {
					$scope.city_image = null;
				}
			}, function (error) {
				$scope.city_image = null;
			})


			srvCities.get({name: city.info.address_components[0].long_name}, function (data) {
				if(data.null) {

  					//some cities in the google maps api have the country info in different places
  					if (city.info.address_components[city.info.address_components.length-1].short_name.length == 2) {
  						var country = city.info.address_components[city.info.address_components.length-1].long_name;
  						var countryshort = city.info.address_components[city.info.address_components.length-1].short_name.toLowerCase();
  					} else if (city.info.address_components[city.info.address_components.length-2].short_name.length == 2) {
  						var country = city.info.address_components[city.info.address_components.length-2].long_name;
  						var countryshort = city.info.address_components[city.info.address_components.length-2].short_name.toLowerCase();
  					} else {
  						var country = city.info.address_components[city.info.address_components.length-3].long_name;
  						var countryshort = city.info.address_components[city.info.address_components.length-3].short_name.toLowerCase();
  					}

  					var city_params =
  					{
  						name: city.info.address_components[0].long_name,
  						country: country,
  						mark: 0,
  						votes: 0
  					}
  					srvCities.save(city_params);
					$scope.city_name = city.info.address_components[0].long_name;
					
					$scope.city_country = country
					$scope.city_countryshort = countryshort

					$scope.city_mark = (0).toFixed(1);
					$scope.city_votes = 0;
					$scope.coords = {
						latitude: city.info.geometry.location.lat,
						longitude: city.info.geometry.location.lng
					};
					$scope.country_flag = "http://www.geonames.org/flags/x/" + $scope.city_countryshort +".gif"
					$scope.map.center = {
						latitude: city.info.geometry.location.lat,
						longitude: city.info.geometry.location.lng
					}
					$scope.map.zoom = 4;

  				} else {
  					$scope.city_name = data.name;
  					$scope.city_country = data.country;
  					if (city.info.address_components[city.info.address_components.length-1].short_name.length == 2) {
  						$scope.city_countryshort = city.info.address_components[city.info.address_components.length-1].short_name.toLowerCase();
  					} else if (city.info.address_components[city.info.address_components.length-2].short_name.length == 2) {
  						$scope.city_countryshort = city.info.address_components[city.info.address_components.length-2].short_name.toLowerCase();
  					} else {
  						$scope.city_countryshort = city.info.address_components[city.info.address_components.length-3].short_name.toLowerCase();
  					}
  					$scope.city_mark = data.mark.toFixed(1);
  					$scope.city_votes = data.votes;
  					$scope.coords = {
  						latitude: city.info.geometry.location.lat,
  						longitude: city.info.geometry.location.lng
  					};
  					$scope.country_flag = "http://www.geonames.org/flags/x/" + $scope.city_countryshort +".gif"
  					$scope.map.center = {
  						latitude: city.info.geometry.location.lat,
  						longitude: city.info.geometry.location.lng
  					}
  					$scope.map.zoom = 4;

  				}
  			});


			srvVotes.get({userId: localStorageService.get('fbId')}, function (data) {
				var keepgoing=true;
				angular.forEach(data, function(item) {
					if(!keepgoing) {
						if(city.info.address_components[0].long_name == item.name) {
							$scope.isReadonly = true;
							$scope.userHasVoted = true;
							$scope.rate = item.vote;
							$scope.user_vote = item.vote;
							var keepgoing=false;
						}
					}	
				});
			});
		};

		$scope.max = 10;
		$scope.rate = 7;

		$scope.hoveringOver = function(value) {
			$scope.overStar = value;
			$scope.percent = value;
		};

		$scope.ratingStates = [{stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'}];

		$scope.setRating = function(){

			if($scope.userHasVoted) {
				//User has voted, do nothing
				$scope.isReadonly = true;
			} else {



				$scope.isReadonly = true;
				
				var vote_params = {
					userId: localStorageService.get('fbId'),
					name: $scope.city_name,
					vote: $scope.rate,
					coords: $scope.coords
				}

				srvVotes.save(vote_params);
				srvUser.get({userId: localStorageService.get('fbId')}, function (data) {
					var news = {
						news_id: Math.random().toString(36).substring(2),
						userId: localStorageService.get('fbId'),
						message: "" + data.name + " has ranked " + $scope.city_name + " with " + $scope.rate + " points"
					}

					srvNews.save(news);
					socket.emit('send:news', {
	      				news: news
	    			});

				});


				srvCities.get({name: $scope.city_name}, function (data) {

					var result = (data.mark + $scope.rate)
					var number_votes = data.votes + 1;
					var result  = result / number_votes;
					var update_params = {
						mark: result,
						votes: number_votes
					};
					srvCities.update({name: $scope.city_name}, update_params);
					$scope.city_mark = result.toFixed(1);
					$scope.city_votes = number_votes;
					$scope.userHasVoted = true;
					$scope.user_vote = $scope.rate;
					socket.emit ('send:vote', {
						vote : {	
							city_name : $scope.city_name,
							city_votes : number_votes,
							user_vote : $scope.rate,
							city_mark : $scope.city_mark
						}
					});
					socket.emit ('send:rankings', {
						message : "update rankings"
					});
				});
			}
		}

		$scope.showRankings = function() {
			$scope.showCityPanel = false;
			$scope.asyncCitiesSelected = "";
		}

		function loadRankings () {

			srvVotes.get({userId: $scope.ownId}, function (data) {

				var votes = data;
				srvCities.query(function (data) {
					var ranking = [];
					angular.forEach(data, function (item) {
						$http.get('https://www.googleapis.com/freebase/v1/topic/en/' + srvDiacritics.removeDiacritics(item.name).toLowerCase().split(' ').join('_') 
							+ "?filter=/common/topic/image&limit=1&key=AIzaSyBjhGn5F7_mGO2p5n7LAsJV5d2RY17UNCY")
						.then(function (response) {
							if (response.data.property != null) {
								var image_url = "https://www.googleapis.com/freebase/v1/image/" +
								response.data.property['/common/topic/image'].values[0].id +
								"?maxwidth=960&key=AIzaSyBjhGn5F7_mGO2p5n7LAsJV5d2RY17UNCY";
							} else {
								var image_url = null;
							}
							var found = false;
							for(var i = 0; i < votes.length; i++) {
								if (votes[i].name === item.name) {
									found = true;
									ranking.push({
										name: item.name,
										country: item.country,
										mark: item.mark.toFixed(1),
										rankingmark: item.mark,
										voted: true,
										image: image_url
									});
								}
							}
							if(!found) {
								ranking.push({
									name: item.name,
									country: item.country,
									mark: item.mark.toFixed(1),
									rankingmark: item.mark,
									voted: false,
									image: image_url
								});
							}
						}, function(error) {
							var image_url = null;
							var found = false;
							for(var i = 0; i < votes.length; i++) {
								if (votes[i].name === item.name) {
									found = true;
									ranking.push({
										name: item.name,
										country: item.country,
										mark: item.mark.toFixed(1),
										rankingmark: item.mark,
										voted: true,
										image: image_url
									});
								}
							}
							if(!found) {
								ranking.push({
									name: item.name,
									country: item.country,
									mark: item.mark.toFixed(1),
									rankingmark: item.mark,
									voted: false,
									image: image_url
								});
							}
						});
					});
					$scope.ranking = ranking;
				});
			});
			

		}

		}]);