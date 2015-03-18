angular.module("travelersServices").factory('srvAlerts', function() {

	var alerts = [];

	return {
        add: function (message) {
        	alerts.push({msg: message});
        	console.log(alerts)
        },
        get: function () {
            return alerts
        }
    };
});