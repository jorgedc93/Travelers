angular.module("travelersServices").factory('srvCities', function($resource) {
	return $resource(
		'data/cities/:name', 
		{name: "@name"},
		{
			get: {
				method: 'GET',
				isArray: false,
				transformResponse: function(data, headersGetter){
					if(data === 'null'){
					  return {null: true};
					}
					return angular.fromJson(data);
				}
    		},
			save: {method: 'POST', isArray: true},
			update: {method:'PUT'}
		}
	);
});

angular.module("travelersServices").factory('srvNews', function($resource) {

	return $resource(
		'data/news/:newsId', 
		{newsId: "@newsId"},
		{

			get: {method: 'GET', isArray:true},
			save: {method: 'POST', isArray:true}
		}
		);
});

angular.module("travelersServices").factory('srvMessages', function($resource) {

	return $resource(
		'data/messages/:id', 
		{id: "@id"},
		{
			get: {method: 'GET', isArray:true},
			save: {method: 'POST', isArray: true}
		}
	);

});

angular.module("travelersServices").factory('srvUser', function($resource) {

	return $resource(
		'data/user/:userId', 
		{userId: "@userId"},
		{
			update: {method: "PUT"}

		});
	
});

angular.module("travelersServices").factory('srvVotes', function($resource) {
	return $resource(
		'data/votes/:userId', 
		{userId: "@userId"},
		{
			get: {method: 'GET', isArray: true},
			save: {method: 'POST', isArray: true}
		}
	);
});