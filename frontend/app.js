angular.module('taskManagerApp', ['ngRoute', 'ngSanitize'])
  .constant('API_URL', 'http://localhost:3000/api')
  .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
    $httpProvider.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
    $httpProvider.defaults.withCredentials = true;

    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';

    $httpProvider.interceptors.push('AuthInterceptor');

    $routeProvider
      .when('/login', {
        templateUrl: 'components/login/login.component.html',
        controller: 'LoginController',
        resolve: {
          authCheck: ['AuthService', '$location', function(AuthService, $location) {
            if (AuthService.isAuthenticated()) {
              $location.path('/home');
            }
          }]
        }
      })
      .when('/signup', {
        templateUrl: 'components/signup/signup.component.html',
        controller: 'SignupController',
        resolve: {
          authCheck: ['AuthService', '$location', function(AuthService, $location) {
            if (AuthService.isAuthenticated()) {
              $location.path('/home');
            }
          }]
        }
      })
      .when('/home', {
        templateUrl: 'components/home/home.component.html',
        controller: 'HomeController',
        resolve: {
          authCheck: ['AuthService', '$location', function(AuthService, $location) {
            if (!AuthService.isAuthenticated()) {
              $location.path('/login');
            }
          }]
        }
      })
      .when('/admin', {
        templateUrl: 'components/admin/admin.component.html',
        controller: 'AdminController',
      })
      .otherwise({
        redirectTo: '/login'
      });
  }])
  .service('AuthService', ['$http', 'API_URL', '$window', function($http, API_URL, $window) {
    this.isAuthenticated = function() {
      var token = $window.localStorage.getItem('token');
      if (!token) {
        return false;
      }
      
      if (this.isTokenExpired()) {
        this.clearToken();
        return false;
      }
      
      return true;
    };

    this.isTokenExpired = function() {
      var decoded = this.decodeToken();
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      var currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    };

    this.getToken = function() {
      return $window.localStorage.getItem('token');
    };

    this.setToken = function(token) {
      $window.localStorage.setItem('token', token);
    };

    this.clearToken = function() {
      $window.localStorage.removeItem('token');
    };

    this.login = function(credentials) {
      var self = this;
      return $http.post(API_URL + '/auth/login', credentials)
        .then(function(response) {
          if (response.data.token) {
            self.setToken(response.data.token);
            self.startTokenExpirationCheck();
          }
          return response.data;
        });
    };

    this.logout = function() {
      var self = this;
      return $http.post(API_URL + '/auth/logout', {}, {
        headers: { 'Authorization': 'Bearer ' + this.getToken() }
      }).then(function() {
        self.clearToken();
        self.stopTokenExpirationCheck();
      }).catch(function() {
        self.clearToken();
        self.stopTokenExpirationCheck();
      });
    };

    this.deleteAccount = function() {
      var self = this;
      return $http.delete(API_URL + '/users/' + this.getCurrentUserId(), {
        headers: { 'Authorization': 'Bearer ' + this.getToken() }
      })
    };

    this.register = function(user) {
      return $http.post(API_URL + '/users', user, {
        headers: { 'Content-Type': 'application/json' }
      });
    };

    this.decodeToken = function() {
      var token = this.getToken();
      if (!token) return null;
      
      try {
        var parts = token.split('.');
        if (parts.length !== 3) return null;
        
        var payload = parts[1];
        payload += '='.repeat((4 - payload.length % 4) % 4);
        
        var decoded = atob(payload);
        return JSON.parse(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    };

    this.getCurrentUserId = function() {
      var decoded = this.decodeToken();
      return decoded ? decoded.id : null;
    };

    this.startTokenExpirationCheck = function() {
      var self = this;
      if (this.tokenCheckInterval) {
        clearInterval(this.tokenCheckInterval);
      }
      
      this.tokenCheckInterval = setInterval(function() {
        if (self.getToken() && self.isTokenExpired()) {
          console.warn('Token expired, logging out user');
          self.clearToken();
          $window.location.href = '#/login';
        }
      }, 60000);
    };

    this.stopTokenExpirationCheck = function() {
      if (this.tokenCheckInterval) {
        clearInterval(this.tokenCheckInterval);
        this.tokenCheckInterval = null;
      }
    };
  }])
  .service('TaskService', ['$http', 'API_URL', 'AuthService', function($http, API_URL, AuthService) {
    this.getTasks = function(params) {
      return $http.get(API_URL + '/tasks', {
        headers: { 'Authorization': 'Bearer ' + AuthService.getToken() },
        params: params
      });
    };

    this.createTask = function(task) {
      var taskData = angular.copy(task);
      if (taskData.due_date) {
        if (taskData.due_date instanceof Date) {
          taskData.due_date = taskData.due_date.toISOString().split('T')[0];
        }
      }
      
      return $http.post(API_URL + '/tasks', taskData, {
        headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
      });
    };

    this.updateTask = function(id, task) {
      var taskData = angular.copy(task);
      
      if (taskData.due_date) {
        if (taskData.due_date instanceof Date) {
          taskData.due_date = taskData.due_date.toISOString().split('T')[0];
        }
      }
      
      const allowedProperties = ['title', 'description', 'priority', 'due_date', 'is_completed'];
      Object.keys(taskData).forEach(key => {
        if (!allowedProperties.includes(key)) {
          delete taskData[key];
        }
      });
      
      return $http.put(API_URL + '/tasks/' + id, taskData, {
        headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
      });
    };

    this.deleteTask = function(id) {
      return $http.delete(API_URL + '/tasks/' + id, {
        headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
      });
    };
  }])
  .factory('AuthInterceptor', ['$q', '$location', '$window', function($q, $location, $window) {
    return {
      responseError: function(rejection) {
        if (rejection.status === 401) {
          $window.localStorage.removeItem('token');
          
          $location.path('/login');
          
          console.warn('Session expired. Please log in again.');
        }
        
        return $q.reject(rejection);
      }
    };
  }])
  .run(['AuthService', function(AuthService) {
    if (AuthService.isAuthenticated()) {
      AuthService.startTokenExpirationCheck();
    }
  }]);