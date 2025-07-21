angular.module('taskManagerApp')
  .controller('HomeController', ['$scope', 'AuthService', 'TaskService', '$location', '$sce', '$http', 'API_URL', function($scope, AuthService, TaskService, $location, $sce, $http, API_URL) {
    $scope.user = {};
    $scope.newTask = {
      title: '',
      description: '',
      priority: 'low',
      due_date: null
    };
    $scope.tasks = [];
    $scope.filteredTasks = [];
    $scope.filters = {
      status: 'all', 
      priority: 'all' 
    };
    
    
    $scope.editError = null;
    
    if (!AuthService.isAuthenticated()) {
      $location.path('/login');
      return;
    }
    
    function checkIfTaskChanged(task, editedTask) {
      const originalData = task.originalData;
      
      if (originalData.title !== editedTask.title) return true;
      if (originalData.description !== editedTask.description) return true;
      if (originalData.priority !== editedTask.priority) return true;
      if (!!originalData.is_completed !== !!editedTask.is_completed) return true;
      
      const origDate = originalData.due_date ? new Date(originalData.due_date) : null;
      const editDate = editedTask.due_date ? new Date(editedTask.due_date) : null;
      
      if (!origDate && !editDate) return false;
      
      if ((!origDate && editDate) || (origDate && !editDate)) return true;
      
      return origDate.toISOString().split('T')[0] !== editDate.toISOString().split('T')[0];
    }


    var userId = AuthService.getCurrentUserId();
    if (userId) {
      $http.get(API_URL + '/users/' + userId, {
        headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
      }).then(function(response) {
        $scope.user = response.data;
      }).catch(function(error) {
        console.error('Error fetching user info:', error);
        var errorMessage = 'Failed to fetch user info';
        if (error && error.data && error.data.message) {
          errorMessage = error.data.message;
        }
        $scope.error = $sce.trustAsHtml(errorMessage);
        
      });
    } else {
      console.error('Could not decode user ID from token');
      AuthService.clearToken();
      $location.path('/login');
      return;
    }

    function loadTasks() {
      const editingTasksMap = {};
      $scope.tasks.forEach(function(task) {
        if (task.editing) {
          editingTasksMap[task.id] = {
            editing: true,
            editData: task.editData,
            originalData: task.originalData
          };
        }
      });
      
      TaskService.getTasks()
        .then(function(response) {
          $scope.tasks = response.data;
          
          $scope.tasks.forEach(function(task) {
            task.is_completed = !!task.is_completed;
            
            if (editingTasksMap[task.id]) {
              task.editing = true;
              task.editData = editingTasksMap[task.id].editData;
              task.originalData = editingTasksMap[task.id].originalData;
              
              if (task.editData) {
                task.editData.is_completed = !!task.editData.is_completed;
              }
            }
          });
          
          $scope.applyFilters();
        })
        .catch(function(error) {
          if (error.status !== 401) {
            $scope.error = $sce.trustAsHtml(error.data.message || 'Failed to load tasks');
          }
        });
    }
    
    $scope.applyFilters = function() {
      $scope.filteredTasks = $scope.tasks.filter(function(task) {
        if ($scope.filters.status === 'pending' && task.is_completed) {
          return false;
        }
        if ($scope.filters.status === 'completed' && !task.is_completed) {
          return false;
        }
        
        if ($scope.filters.priority !== 'all' && task.priority !== $scope.filters.priority) {
          return false;
        }
        
        return true;
      });
    };
    
    $scope.resetFilters = function() {
      $scope.filters = {
        status: 'all',
        priority: 'all'
      };
      $scope.applyFilters();
    };
    
    loadTasks();

    $scope.createTask = function() {
      if (!$scope.newTask.title || !$scope.newTask.priority || !$scope.newTask.due_date) {
        $scope.error = $sce.trustAsHtml('Title, priority, and due date are required.');
        return;
      }

      console.log('Creating task with data:', $scope.newTask);

      TaskService.createTask($scope.newTask)
        .then(function(response) {
          console.log('Task created successfully:', response);
          $scope.error = null;
          
          $scope.newTask = { title: '', description: '', priority: 'medium', due_date: null };
          
          if ($scope.taskForm) {
            $scope.taskForm.$setPristine();
            $scope.taskForm.$setUntouched();
          }
          
          loadTasks();
        })
        .catch(function(error) {
          console.error('Error creating task:', error);
          if (error.status !== 401) {
            var errorMessage = 'Failed to create task';
            if (error && error.data) {
              if (error.data.message) {
                errorMessage = error.data.message;
              } else if (error.data.errors && Array.isArray(error.data.errors)) {
                errorMessage = error.data.errors.join(', ');
              }
            }
            $scope.error = $sce.trustAsHtml(errorMessage);
          }
        });
    };

    $scope.toggleTaskStatus = function(task) {
      TaskService.updateTask(task.id, { is_completed: !task.is_completed })
        .then(function() {
          loadTasks();
        })
        .catch(function(error) {
          if (error.status !== 401) {
            $scope.error = $sce.trustAsHtml(error.data.message || 'Failed to update task status');
          }
        });
    };
    
    $scope.startInlineEdit = function(task) {
      $scope.editError = null;
      
      task.originalData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        is_completed: !!task.is_completed,
        due_date: task.due_date
      };
      
      task.editData = angular.copy(task);
      
      task.editData.is_completed = !!task.is_completed; 
      if (task.editData.due_date) {
        try {
          const date = new Date(task.editData.due_date);
          if (!isNaN(date.getTime())) {
            task.editData.due_date = date;
          }
        } catch(e) {
          console.error('Error parsing date:', e);
          task.editData.due_date = null;
        }
      }
      
      console.log('Editing task with status:', task.is_completed, 
                  'Status in edit form:', task.editData.is_completed);
      
      task.editing = true;
    };
    
    $scope.cancelInlineEdit = function(task) {
      delete task.editData;
      delete task.originalData;
      task.editing = false;
      $scope.editError = null;
    };
    
    $scope.saveInlineEdit = function(task) {
      if (!task.editData.title || !task.editData.priority) {
        $scope.editError = $sce.trustAsHtml('Title and priority are required.');
        return;
      }
      
      const taskId = task.id;
      
      const updatedTask = angular.copy(task.editData);
      
      updatedTask.is_completed = !!updatedTask.is_completed;
      
      const hasChanges = checkIfTaskChanged(task, updatedTask);
      
      console.log('Task changed:', hasChanges);
      
      if (!hasChanges) {
        console.log('No changes detected, skipping update');
        delete task.editData;
        delete task.originalData;
        task.editing = false;
        $scope.editError = null;
        return;
      }
      
      console.log('Saving task with changes. Status:', updatedTask.is_completed);
      
      TaskService.updateTask(taskId, updatedTask)
        .then(function(response) {
          delete task.editData;
          delete task.originalData;
          task.editing = false;
          $scope.editError = null;
          
          loadTasks();
        })
        .catch(function(error) {
          console.error('Error updating task:', error);
          if (error.status !== 401) {
            var errorMessage = 'Failed to update task';
            if (error && error.data) {
              if (error.data.message) {
                errorMessage = error.data.message;
              } else if (error.data.errors && Array.isArray(error.data.errors)) {
                errorMessage = error.data.errors.join(', ');
              }
            }
            $scope.editError = $sce.trustAsHtml(errorMessage);
          }
        });
    };

    $scope.deleteTask = function(id) {
      if (confirm('Are you sure you want to delete this task?')) {
        TaskService.deleteTask(id)
          .then(function() {
            loadTasks();
          })
          .catch(function(error) {
            if (error.status !== 401) {
              $scope.error = $sce.trustAsHtml(error.data.message || 'Failed to delete task');
            }
          });
      }
    };

    $scope.logout = function() {
      AuthService.logout()
        .then(function() {
          $location.path('/login');
        })
        .catch(function(error) {
          $scope.error = $sce.trustAsHtml('Logout failed');
        });
    };

    $scope.deleteAccount = function() {
      if (confirm('Are you sure you want to delete your account?')) {
        AuthService.deleteAccount()
          .then(function() {
            AuthService.logout();
            $location.path('/login');
          })
          .catch(function(error) {
            if (error.status !== 401) {
              $scope.error = $sce.trustAsHtml(error.data.message || 'Failed to delete account');
            }
          });
      }
    };
  }]);
