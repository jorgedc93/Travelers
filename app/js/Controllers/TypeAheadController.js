angular.module('travelersControllers').controller('TypeaheadCtrl', ['$scope', '$window', '$http', 'localStorageService', 'srvUser', 'srvAlerts',
	function ($scope, $window, $http, localStorageService, srvUser, srvAlerts) {

		$scope.selected = undefined;

		// Any function returning a promise object can be used to load values asynchronously 
		$scope.getFriendList = function(val) {
			//Get FB friends from the FB API
			 return $http.get('https://graph.facebook.com/me/friends?fields=installed,name&access_token=' + localStorageService.get('fbToken'))
			 .then(function(res){
				var friends = [];
				angular.forEach(res.data.data, function(item){
					if(item.installed != null) {										//check if user has Travelers installed to include him/her in the results array
						if(item.name.toLowerCase().indexOf(val.toLowerCase())>=0) {		//convert all strings to lower case to make the searcher case insensitive
							//add the name and id to the results array
							friends.push({"name" : item.name, "id" : item.id});
						}
					}
				});
				return friends;
			});
		};

		$scope.selectedFriend = function(friend) {
			srvUser.get({ userId: friend.id}, function (data) {
				if(data.id !== null) {
					$window.location.href = "#/" + friend.id;
				} else {
					$scope.asyncSelected = "";
					console.log('error searching')
					srvAlerts.add(friend.name + "'s profile could not be found.");
					//$window.location.href = "#/" + $scope.ownId;
				}
			});
		}
}]);