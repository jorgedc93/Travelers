angular.module("travelersServices").filter('gt0', function () {
    return function (items, value) {
    	var filteredItems = []
        angular.forEach(items, function ( item ) {
            if ( item.mark > 0.0 ) {
                filteredItems.push(item);
            }
        });
        return filteredItems;
    }
});

angular.module("travelersServices").filter('home', function () {
	return function (items, value) {
        var filteredItems = [];
		angular.forEach(items, function ( item ) {
			if (item.name == value) {
				filteredItems.push(item);
			}
		});
		return filteredItems;
	}
});