angular.module('taskManagerApp')
  .controller('SignupController', ['$scope', 'AuthService', '$location', '$sce', function($scope, AuthService, $location, $sce) {
    $scope.user = {
      name: '',
      email: '',
      password: ''
    };

    $scope.signup = function() {
      if (!$scope.user.name || !$scope.user.email || !$scope.user.password) {
        $scope.error = $sce.trustAsHtml('All fields are required.');
        return;
      }

      console.log('Sending registration data:', $scope.user);
      AuthService.register($scope.user)
        .then(function(response) {
          $location.path('/login');
        })
        .catch(function(error) {
          var errorMessage = 'Registration failed. Please try again.';
          console.log('Registration error:', error);
          if (error && error.data && error.data.message) {
            errorMessage = error.data.message;
          } else if (error && error.data && error.data.errors) {
            errorMessage = Array.isArray(error.data.errors) ? error.data.errors.join('<br>') : error.data.errors;
          } else if (error && error.statusText) {
            errorMessage = error.statusText;
          }
          $scope.error = $sce.trustAsHtml(errorMessage);
        });
    };
  }]);