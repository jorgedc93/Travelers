'use strict';

/* App Module */

var travelersApp = angular.module('travelersApp', [
	'ngRoute',
	'ngResource',
	'travelersControllers',
	'travelersServices',
	'google-maps',
	'LocalStorageModule',
	'ui.bootstrap',
	'btford.socket-io'
]);

travelersApp.config(['$routeProvider', 'localStorageServiceProvider', '$locationProvider', '$httpProvider',
	function($routeProvider, localStorageServiceProvider, $locationProvider, $httpProvider) {


		// use the HTML5 History API
		
		localStorageServiceProvider.setPrefix('travelers');

		window.routes = 
		{
			'/': {
				resolve: function($q, $location, SessionService, localStorageService) {
					var deferred = $q.defer(); 

					if (!SessionService.getUserAuthenticated()) {
						$location.path('#/login');
					} 
					else {
						$location.path('#/' + localStorageService.get('fbId'));
					}

					deferred.resolve();
					return deferred.promise;

    			},
    			requireLogin: false
		},
			'/login': {
				templateUrl: 'partials/login.html',
				controller: 'LoginCtrl',
				requireLogin: false,
				resolve: function($q, $location, SessionService, localStorageService) {
			      var deferred = $q.defer(); 

			      if (SessionService.getUserAuthenticated()) {
			         $location.path('#/' + localStorageService.get('fbId'));
			      } 
			      if (!SessionService.getUserAuthenticated()){
			      	 $location.path('#/login');
			      }

			      deferred.resolve();
			      return deferred.promise;
    			}
		},
			
			'/:id': {
				templateUrl: 'partials/user_profile.html',
				controller: 'UserProfileCtrl',
				requireLogin: true
		},
			'/:id/rankings': {
				templateUrl: 'partials/rankings.html',
				controller: 'RankingsCtrl',
				requireLogin: true
			}
		};


		//this loads up our routes dynamically from the previous object 
    	for(var path in window.routes) {
        	$routeProvider.when(path, window.routes[path]);
    	}
    	$routeProvider.otherwise({redirectTo: '/login'});

}]);

travelersApp.run(['$window', '$rootScope', 'srvAuth', 'SessionService', 'localStorageService',
	function($window, $rootScope, srvAuth, SessionService, localStorageService) {


		
		$rootScope.$on("$routeChangeStart", function(event, next, current) {
			
			if(!SessionService.getUserAuthenticated()) {
        		localStorageService.remove("fbToken");
				localStorageService.remove("fbId");
				$window.location.href = "#/login";
			} 
			
			if($window.location.hash === "#/login") {
				//User is not logged in, so set it to false
				localStorageService.remove("fbToken");
				localStorageService.remove("fbId");
        		SessionService.setUserAuthenticated(false);
	        }
	      	if(next.requireLogin) {
                if(!SessionService.getUserAuthenticated()) {
                    event.preventDefault();
                    $window.location.href = "#/login";
                }   
        	}
        });


	$window.fbAsyncInit = function() {
		// Executed when the SDK is loaded

		FB.init({ 

			/* 
			 The app id of the web app;
			 To register a new app visit Facebook App Dashboard
			 ( https://developers.facebook.com/apps/ ) 
			*/

			appId: '299331450223667', 


			/* 
			 Set if you want to check the authentication status
			 at the start up of the app 
			*/

			status: true, 

			/* 
			 Enable cookies to allow the server to access 
			 the session 
			*/

			cookie: true, 

			/* Parse XFBML */

			xfbml: true 
		});

		//We check the user status here because in case he has logged out from facebook web, 
		//we still have the local storage items which would make the page not to load properly
		FB.getLoginStatus(function(res) {
            if( res.status !== "connected" ){
                localStorageService.remove("fbToken");
				localStorageService.remove("fbId");
				SessionService.setUserAuthenticated(false)
				$window.location.href = "#/login";
            }
        });


		srvAuth.watchAuthenticationStatusChange();

	};

	(function(d){
		// load the Facebook javascript SDK

		var js, 
		id = 'facebook-jssdk', 
		ref = d.getElementsByTagName('script')[0];

		if (d.getElementById(id)) {
			return;
		}

		js = d.createElement('script'); 
		js.id = id; 
		js.async = true;
		js.src = "//connect.facebook.net/en_US/all.js";

		ref.parentNode.insertBefore(js, ref);

	}(document));

}]);

//Initiate Controllers Module
angular.module('travelersControllers', []);

//Initiate Services Module
angular.module("travelersServices", []);

//Fix for angular UI Bootstrap error
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function        ($scope, $timeout, $transition, $q) {
}]).directive('carousel', [function() {
    return {

    }
}]);