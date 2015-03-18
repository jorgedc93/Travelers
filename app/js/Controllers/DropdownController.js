angular.module('travelersControllers').controller('DropdownCtrl', ['$scope',
 function ($scope) {

  $scope.status = {
    isopen: false
  };

  $scope.toggled = function(open) {
    //console.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };
}]);