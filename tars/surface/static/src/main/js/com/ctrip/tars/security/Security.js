$import("com.ctrip.tars.model.User");

angular.module("com.ctrip.tars.security", [])
  .service('com.ctrip.tars.security.Service', ['$rootScope', '$http', function($rootScope, $http) {

    var validate = function(v) {
      return {
        health: Math.floor((Math.random() * 2)),
        name: v
      };
    };

    var service = {
      user: new com.ctrip.tars.model.User(),

      isLogin: function() {
        return true; //sessionStorage.username && sessionStorage.passwd;
      },
      login: function(username, passwd, callback) {
        if (!username || !username.trim() || !passwd || !passwd.trim()) {
          if (!Object.isNull(callback) && Object.isFunction(callback)) {
            callback(false, null, "用户名密码不能为空。");
          }
        } else {
          // 生产测试
          $http({
            method: 'GET',
            url: [TEST_URL, "common/login?username=", username, "&passwd=", passwd].join("")
          }).success(function(data, status, headers, config) {
            if (data.success) {
              service.user.update(data.username, data.passwd, data.name, data.organization, data.email);
              if (!Object.isNull(callback) && Object.isFunction(callback)) {
                callback(true, service.user);
              }
            } else {
              if (!Object.isNull(callback) && Object.isFunction(callback)) {
                callback(false, null, "用户名密码错误，请重新输入。");
              }
            }
          });
        }
      }
    };

    return service;
  }])
  .controller("com.ctrip.tars.security.Controller", ['$scope', '$rootScope', '$location',
    'com.ctrip.tars.security.Service',
    function($scope, $rootScope, $location, service) {

      $scope.$on('security.user.login', function(event, user) {

        user.save();
        $scope.user = user;

        if (document.getElementById("remeberme").checked) {
          localStorage.username = user.getUsername();
          localStorage.passwd = user.getPasswd();
          localStorage.remeberme = true;
        } else {
          localStorage.username = "";
          localStorage.passwd = "";
          localStorage.remeberme = false;
        }

        $location.path("/view/index");
        return false;
      });

      $scope.login = function() {
        if (!service.isLogin()) {
          service.login($("#username").val(), $("#passwd").val(), function(flag, user, message) {
            if (flag) {
              $rootScope.$broadcast('security.user.login', user);
            } else {
              $("#message").css({
                color: "#e51c23",
                opacity: 1
              }).html(message).animate({
                opacity: 0
              }, 5000);
            }
          });
        } else {
          $location.path("/view/index");
        }
      };
      $("#username").val(localStorage.username);
      $("#passwd").val(localStorage.passwd);

      document.getElementById("remeberme").checked = (localStorage.remeberme == "true");

      $scope.user = service.user;

    }
  ]);

