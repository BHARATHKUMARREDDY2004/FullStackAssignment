angular.module('taskManagerApp')
  .controller('LoginController', ['$scope', 'AuthService', '$location', '$sce', function($scope, AuthService, $location, $sce) {
    $scope.credentials = {
      email: '',
      password: ''
    };

    $scope.login = function() {
      if (!$scope.credentials.email || !$scope.credentials.password) {
        $scope.error = $sce.trustAsHtml('Email and password are required.');
        return;
      }

      AuthService.login($scope.credentials)
        .then(function(response) {
          $location.path('/home');
        })
        .catch(function(error) {
          var errorMessage = 'Login failed. Please try again.';
          if (error && error.data && error.data.message) {
            errorMessage = error.data.message;
          } else if (error && error.statusText) {
            errorMessage = error.statusText;
          }
          $scope.error = $sce.trustAsHtml(errorMessage);
        });
    };
  }]);