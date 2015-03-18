angular.module("travelersServices").provider('srvAuth', function() {


		this.$get = ['localStorageService', '$window', '$http', 'srvUser', 'SessionService',
			function(localStorageService, $window, $http, srvUser, SessionService) {

			var watchAuthenticationStatusChange = function() {

				var _self = this;

				FB.Event.subscribe('auth.authResponseChange', function(response) {

					if (response.status === 'connected') {
						
						/* 
						 The user is already logged, 
						 is possible retrieve his personal info
						*/
						_self.getUserInfo();

						/*
						 This is also the point where you should create a 
						 session for the current user.
						 For this purpose you can use the data inside the 
						 response.authResponse object.
						*/
						localStorageService.add('fbToken',response.authResponse.accessToken);
						SessionService.setUserAuthenticated(true);

					}
					else {

						/*
						 The user is not logged to the app, or into Facebook:
			 			 destroy the session on the server.
						*/
						console.log("not identified")
						localStorageService.remove("fbToken");
						localStorageService.remove("fbId");
						SessionService.setUserAuthenticated(false);
						//SessionService.setUserAuthenticated(false);
						$window.location.href= '#/login';
					}

				});

			};
			var getUserInfo = function() {


				var _self = this;

				FB.api('/me?fields=id, name, gender, location, first_name', function(response) {


					srvUser.get({ userId: response.id}, function(data) {
						if (data.id !== null) {
							localStorageService.add('fbId', response.id);
							var redirect = '#/' + response.id;
							$window.location.href=redirect;
						} else if (data.id === null) {
							//convert to json, just as a double check
							var params = angular.toJson(response);
							srvUser.save(response, function(){
								var redirect = '#/' + response.id;
								$window.location.href=redirect;
							});
						}
					});
				});

			};


	return {
		watchAuthenticationStatusChange: watchAuthenticationStatusChange,
		getUserInfo: getUserInfo
	}
}]});