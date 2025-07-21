angular.module('taskManagerApp')
  .controller('AdminController', ['$scope', '$http', 'API_URL', function($scope, $http, API_URL) {
    $scope.users = [];

    $scope.loadUsers = function() {
      $http.get(`${API_URL}/users`)
        .then(response => {
          $scope.users = response.data;
        })
        .catch(error => {
          console.error('Error loading users:', error);
        });
    };

    $scope.loadUsers();
  }]);
  