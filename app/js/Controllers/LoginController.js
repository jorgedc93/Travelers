angular.module('travelersControllers').controller('LoginCtrl',['$scope', '$window', '$rootScope', 'localStorageService', 'SessionService',
	function ($scope, $window, $rootScope, localStorageService, SessionService) {
		/*
		$rootScope.$on("$routeChangeStart", function(event, next, current) {
			if (current.$$route && current.$$route.resolve) {
				// Show a loading message until promises are not resolved
				$scope.loadingView = true;
			}
			
			if(localStorageService.get('fbId') !== null) {
				SessionService.setUserAuthenticated(true);
				$window.location.href = "#/" + localStorageService.get('fbId');
			}
			
		});
		*/
}]);