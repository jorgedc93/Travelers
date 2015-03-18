angular.module("travelersServices").service('SessionService', function(localStorageService){
    if(localStorageService.get('fbId') !== null) {
    	userIsAuthenticated = true;
    } else {
    	userIsAuthenticated = false;
    }

    this.setUserAuthenticated = function(value){
        userIsAuthenticated = value;
    };

    this.getUserAuthenticated = function(){
        return userIsAuthenticated;
    };
});