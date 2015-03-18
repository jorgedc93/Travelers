angular.module('travelersControllers').controller('UserProfileCtrl',['$scope', '$window', '$route', 'localStorageService', '$routeParams', 
	'srvAuth', 'srvUser', 'srvNews', 'srvMessages', 'srvVotes', '$http', 'socket', 'srvAlerts',
	function ($scope, $window, $route, localStorageService, $routeParams, srvAuth, srvUser, srvNews, srvMessages, srvVotes, $http, socket, srvAlerts) {
		$scope.id = $routeParams.id;
		$scope.ownId = localStorageService.get('fbId');


		//Socket listeners

		socket.on('send:message', function (data) {
			if(data.message.fromId == localStorageService.get('fbId') || $scope.id == localStorageService.get('fbId')) {
				data.message.showDelete = true;
			} else {
				data.message.showDelete = false;
			}
			$scope.wall_messages.push(data.message);
		});

		socket.on('delete:message', function (data) {
			//Remove message from wall
			for (var i=0;i<$scope.wall_messages.length;i++) {
				if ($scope.wall_messages[i].message_id == data.id) {
					$scope.wall_messages.splice(i,1);
				}
			}
		});

		socket.on('send:news', function (data) {
			$scope.news.unshift(data.news)
		});

		socket.on('delete:news', function (data) {
			for (var i=0;i<$scope.news.length;i++) {
				if ($scope.news[i].news_id == data.id) {
					$scope.news.splice(i,1);
				}
			}
		});


		//Error message handling
		$scope.alerts = srvAlerts.get();
		$scope.closeAlert = function(index) {
    		$scope.alerts.splice(index, 1);
	  	};

		//Initial values for the map properties, will be overwritten later with the user's home location
		$scope.map = {
			center: {
				latitude: 50,
				longitude: 0
			},
			zoom: 3
		};

		$scope.wall_messages = []
		$scope.news = [];


		$scope.coords = {
			latitude: "50",
			longitude: "10"
		};
		$scope.mapicon = 'img/home.png';


		srvUser.get({ userId: $scope.id}, function (data) {

			if(data !== null) {
				//user found, load profile
				$scope.name = data.name;
				$scope.firstname = data.first_name;
				if (data.location.name == null) {
					$scope.city_name = "";
				} else {
					$scope.city_name = data.location.name;
				}
				var home_coords = {};

				//GET request to the FB API to get the user's home location
				$http({
					url: "http://graph.facebook.com/" + data.location.id + "/?fields=location", 
					method: "GET"
				}).
				success(function(data, status, headers, config) {

					if (data.location != null) {
						//Get the city
						//Pass to the View the coordinates of the location
						$scope.coords.latitude = data.location.latitude;
						$scope.coords.longitude = data.location.longitude;
						home_coords = {
							latitude: Math.round(data.location.latitude * 10 ) / 10,
							longitude: Math.round(data.location.longitude * 10 ) / 10
						}
						//Center the map on that location
						$scope.map = {
							center: {
								latitude: data.location.latitude,
								longitude: data.location.longitude 
							},
							zoom: 3 
						};
					}

					srvVotes.get({userId: $scope.id}, function (data) {
						var user_ranking = []
						var visited_cities = []
						//var home_vote = -1;
						for (var i = 0; i<=data.length - 1; i++) {
							item = data[i];
						//angular.forEach(data, function(item) {
							user_ranking.push({
								name: item.name,
								vote: item.vote,
							});


							//we check if the current item is the home location, if it is, we don't add it to the map
							//we round the coordinates to 1 decimal as they provide from different services and are not
							//exactly the same
							if(item.coords.latitude == null || item.coords.longitude == null) {
								break;
							}
							if ((home_coords.latitude != item.coords.latitude.toFixed(1))
								&& (home_coords.longitude != item.coords.longitude.toFixed(1))) {
								visited_cities.push({
									name: item.name,
									vote: item.vote,
									coords: item.coords
								});
							} /*else {
								home_vote = item.vote;
							}	*/				
						}//);
						//We assign it to the view
						//$scope.homevote = home_vote;
						$scope.cities = user_ranking;
						$scope.visited_cities = visited_cities;
					});
				});

				//Get the user's image from FB
				$scope.profile_img = "http://graph.facebook.com/" + $scope.id + "/picture?type=large";
				$scope.own_img = "http://graph.facebook.com/" + $scope.ownId + "/picture";

				//GET request to the backend to get the current loaded profile's wall
				srvMessages.get({ id : $scope.id}, function(data) {
					var wall_messages = [];
					//Create an array with all the messages returned by the request
					angular.forEach(data, function(item){
						if(item.fromId == localStorageService.get('fbId') || $scope.id == localStorageService.get('fbId')) {
							item.showDelete = true;
						} else {
							item.showDelete = false;
						}
						wall_messages.push(item);
					});
					//Make the messages available to the wall
					$scope.wall_messages = wall_messages;
				});

				srvNews.get({id : $scope.id},function (data) {
					$scope.news = data;
				});


			} else {
				//user doesn't exist, redirect to own home
				$window.location.href = "#/" + localStorageService.get('fbId');
			}
		});




$scope.postmessage = function () {

			//get name for the logged in user from the stored id and use it asynchronously
			srvUser.get({userId : localStorageService.get('fbId')}, function (data) {

				//get current timestamp
				var currentTime = new Date();
				var month = currentTime.getMonth() + 1;
				var day = currentTime.getDate();
				var year = currentTime.getFullYear();
				var hours = currentTime.getHours()
				var minutes = currentTime.getMinutes()
				//var seconds = currentTime.getSeconds()
				if (minutes < 10) {
					minutes = '0' + minutes;
				}
				var datetime = hours + ":" + minutes + /*":" + seconds + */" " + day + "/" + month + "/" + year;

				var message_id = Math.random().toString(36).substring(2)

				//parameters for the post to the backend
				var post_params = {
					message_id: message_id,
					toId: $scope.id,
					fromId: localStorageService.get('fbId'),
					fromName: data.name,
					message: $scope.message_text,
					time: datetime
				};

				srvMessages.save(post_params);

				socket.emit('send:message', {
      				message: post_params
    			});
    			$scope.message_text = "";


				var news = {
					news_id: message_id,
					userId: localStorageService.get('fbId'),
					message: "" + data.name + " has posted to " + $scope.name + "\'s wall"
				}

				srvNews.save(news);

				socket.emit('send:news', {
      				news: news
    			});

			});
};


	$scope.deletemessage = function(message_id) {
		//Then delete it from the server
		srvMessages.delete({id : message_id});
		socket.emit ('delete:message', {
			id : message_id
		});

		srvNews.delete({ newsId : message_id});
		socket.emit ('delete:news', {
			id : message_id
		});
		


		//Reload the view to see the changes
		//$route.reload();
	};


		
	}]);