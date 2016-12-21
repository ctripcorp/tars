$import("js.util.HashMap", "BootstrapClassLoader");
$import("js.util.Stack", "BootstrapClassLoader");
var welcome = angular
  .module("com.ctrip.tars.welcome", [])
  .directive(
    "welcome",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<div id="com-ctrip-tars-welcome" class="welcome cover" ng-show="show">',
          '<div class="shadow" style="width: 100%; height: 100%;"></div>',
          '<div class="content">',
          '<div class="title">Welcome to tars.</div>',
          '<div class="tools">',
          '<button ng-show="hasPrevious()" ng-click="previous()" class="btn btn-default btn-xs" style="-webkit-border-radius: 0px; border-radius: 0px; margin: 4px;">',
          '<i class="fa fa-arrow-left"></i>&nbsp;上一项',
          '</button>',
          '<button ng-show="hasNext()" ng-click="next()" class="btn btn-default btn-xs" style="-webkit-border-radius: 0px; border-radius: 0px; margin: 4px;">',
          '<i class="fa fa-arrow-right"></i>&nbsp;下一项',
          '</button>',
          '<button ng-show="!hasNext()" ng-click="close()" class="btn btn-default btn-xs" style="-webkit-border-radius: 0px; border-radius: 0px; margin: 4px;">',
          '<i class="fa fa-hand-o-right"></i>&nbsp;点我进入系统',
          '</button>',
          '</div>',
          '</div>',
          '<v1.1.2></v1.1.2>',
          '<v1.1.1></v1.1.1>',
          '<v1.0.6></v1.0.6>',
          '<v1.0.5></v1.0.5>',
          '<v1.0.4></v1.0.4>',
          // '<v1.0.3></v1.0.3>',
          '<v1.0.1></v1.0.1>',
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          if (element.parent() == $("body")) {
            var width = Math.max($(window).width(), $("body").width());
            var height = Math.max($(window).height(), $("body").height());

            element.css({
              top: 0,
              left: 0,
              width: width,
              height: height
            });
          }

          scope.element = element;
        },
        controller: ['$scope', '$interval', function($scope, $interval) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          //if (runtime.getDebug()) {
          //  runtime.storage.clear();
          //}

          $scope.welcomeStack = new js.util.HashMap();

          $scope.paths = {
            index: '/view/index',
            single: '/view/deployments/single',
            parallel: '/view/deployments/parallel'
          };

          $scope.welcomeStack.put($scope.paths.index, {
            forward: new js.util.Stack(),
            backward: new js.util.Stack()
          });
          $scope.welcomeStack.put($scope.paths.single, {
            forward: new js.util.Stack(),
            backward: new js.util.Stack()
          });
          $scope.welcomeStack.put($scope.paths.parallel, {
            forward: new js.util.Stack(),
            backward: new js.util.Stack()
          });

          $scope.close = function() {
            var backStack = $scope.welcomeStack.get(runtime.getPath()).backward;
            var previous = backStack.peek();
            if (previous) {
              previous.after();
            }
            $scope.show = false;
          };

          $scope.hasNext = function() {
            if (!$scope.show) {
              return false;
            }

            var forStack = $scope.welcomeStack.get(runtime.getPath()).forward;

            if (forStack.size() <= 0) {
              return false;
            }

            return true;
          };

          $scope.hasPrevious = function() {
            if (!$scope.show) {
              return false;
            }

            var backStack = $scope.welcomeStack.get(runtime.getPath()).backward;

            if (backStack.size() <= 1) {
              return false;
            }

            return true;
          };

          $scope.previous = function() {
            var backStack = $scope.welcomeStack.get(runtime.getPath()).backward;
            var forStack = $scope.welcomeStack.get(runtime.getPath()).forward;

            if (backStack.size() > 0) {
              $scope.reference = $scope.element.parent().offset();

              var scope = backStack.pop(),
                previous = backStack.peek();

              scope.after();
              forStack.push(scope);

              if (previous) {
                previous.welcome();
                runtime.welcome(previous.version);
              }
            }
          };

          $scope.next = function() {
            var backStack = $scope.welcomeStack.get(runtime.getPath()).backward;
            var forStack = $scope.welcomeStack.get(runtime.getPath()).forward;

            if (forStack.size() > 0) {
              $scope.reference = $scope.element.parent().offset();

              var previous = backStack.peek(),
                scope = forStack.pop();

              if (previous) {
                previous.after();
              }
              scope.welcome();
              backStack.push(scope);
              runtime.welcome(scope.version);
            }
          };

          $scope.isWelcome = function() {
            var stack = $scope.welcomeStack.get(runtime.getPath());
            return stack && stack.forward && stack.forward.size() > 0;
          };

          $scope.move = function(option) {
            $scope.element.find(".content").css(option);
          };

          $scope.$on('welcome', function(event) {
            var show = $scope.isWelcome();
            $scope.show = show;
            if (show) {
              $scope.next();
            }
          });
        }]
      };
    }).directive(
    "v1.0.1",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        require: '^?welcome',
        template: [
          '<div class="tips" style="display: none;">',
          '<div class="tip tip-1"><div class="arrow-bottom-left2 pull-left"/><div class="summary pull-left">按照名称或者id进行过滤</div></div>',
          '<div class="tip tip-2"><div class="arrow-top-left2"/><div class="summary">按照应用的group的发布状态进行过滤</div></div>',
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          scope.element = element;
        },
        controller: ['$scope', '$timeout', function($scope, $timeout) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          $scope.version = '1.0.1';

          var show = runtime.isWelcome($scope.version);
          if (show) {
            $scope.welcomeStack.get($scope.paths.parallel).forward.push($scope);
          }

          $scope.retry = 0;
          $scope.welcome = function() {

            if ($scope.retry > 3) {
              $scope.next();
              return false;
            }

            if ($scope.retry <= 0 || $(".apps-search-filters").length <= 0 || $(".apps-status-filters").length <= 0) {
              $scope.retry++;
              $timeout(function() {
                $scope.welcome();
              }, WELCOME_LISTENER, false, null);
              return false;
            }

            $scope.before();

            var reference = $scope.reference,
              offset = $(".apps-status-filters").offset(),
              width = $(".apps-status-filters").width(),
              height = $(".apps-status-filters").height(),
              tip2 = $scope.element.find(".tip-2"),
              tip1 = $scope.element.find(".tip-1");

            tip2.css({
              top: offset.top - reference.top + height,
              left: offset.left - reference.left + width / 2
            });

            offset = $(".apps-search-filters").offset();
            width = $(".apps-search-filters").width();
            height = $(".apps-search-filters").height();

            tip1.css({
              top: offset.top - reference.top + height / 2 - tip1.height() - 8,
              left: offset.left - reference.left + width + 4
            });
          };

          $scope.before = function() {
            $scope.element.show();
            $scope.move({
              'marginTop': '20%'
            });

            $(".apps-search-filters").addClass("welcome-ref");
            $(".apps-status-filters").addClass("welcome-ref");
          };

          $scope.after = function() {
            $scope.element.hide();
            $(".apps-search-filters").removeClass("welcome-ref");
            $(".apps-status-filters").removeClass("welcome-ref");
          };

        }]
      };
    }).directive(
    "v1.0.3",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        require: '^?welcome',
        template: [
          '<div class="tips" style="display: none;">',
          '<div class="tip tip-1"><div class="arrow-bottom-left2 pull-left"/><div class="summary pull-left">点击收缩左侧的应用列表</div></div>',
          '<div class="tip tip-2"><div class="arrow-top-left2"/><div class="summary">点击我切换group</div></div>',
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          scope.element = element;
        },
        controller: ['$scope', '$timeout', function($scope, $timeout) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          $scope.version = '1.0.3';

          var show = runtime.isWelcome($scope.version);
          if (show) {
            $scope.welcomeStack.get($scope.paths.parallel).forward.push($scope);
          }

          $scope.retry = 0;
          $scope.welcome = function() {

            if ($scope.retry > 3) {
              $scope.next();
              return false;
            }

            if ($("#sidebar-toggle").length <= 0 || $(".liteAccordion").length <= 0) {
              $scope.retry++;
              $timeout(function() {
                $scope.welcome();
              }, WELCOME_LISTENER, false, null);
              return false;
            }

            $scope.before();

            var reference = $scope.reference,
              offset = $(".liteAccordion").offset(),
              width = $(".liteAccordion").width(),
              height = $(".liteAccordion").height(),
              tip2 = $scope.element.find(".tip-2"),
              tip1 = $scope.element.find(".tip-1");

            tip2.css({
              top: offset.top - reference.top + height,
              left: offset.left - reference.left + 24
            });

            offset = $("#sidebar-toggle").offset();
            width = $("#sidebar-toggle").width();
            height = $("#sidebar-toggle").height();

            tip1.css({
              top: offset.top - reference.top + height / 2 - tip1.height(),
              left: offset.left - reference.left + width + 4
            });
          };

          $scope.before = function() {
            $scope.element.show();
            $("#sidebar-toggle").addClass("welcome-ref");
            $(".liteAccordion h2").addClass("welcome-ref");
          };

          $scope.after = function() {
            $scope.element.hide();
            $("#sidebar-toggle").removeClass("welcome-ref");
            $(".liteAccordion h2").removeClass("welcome-ref");
          };

        }]
      };
    }).directive(
    "v1.0.4",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        require: '^?welcome',
        template: [
          '<div class="tips" style="display: none;">',
          '<div class="tip tip-1"><div class="arrow-bottom-left2 pull-left"/><div class="summary pull-left">滚动至最下面加载下一页数据</div></div>',
          '<div class="tip tip-2"><div class="arrow arrow-bottom-right2 pull-right"/><div class="summary pull-right">滚动至最下面加载下一页数据</div></div>',
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          scope.element = element;
        },
        controller: ['$scope', '$timeout', function($scope, $timeout) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          $scope.version = '1.0.4';

          var show = runtime.isWelcome($scope.version);
          if (show) {
            $scope.welcomeStack.get($scope.paths.parallel).forward.push($scope);
          }

          $scope.retry = 0;

          var origin1 = "#multi-apps-scroller",
            origin2 = "#servers-scroller";

          $scope.welcome = function() {

            if ($scope.retry > 3) {
              $scope.next();
              return false;
            }

            if ($(origin1).length <= 0 || $(origin2).length <= 0) {
              $scope.retry++;
              $timeout(function() {
                $scope.welcome();
              }, WELCOME_LISTENER, false, null);
              return false;
            }

            $scope.before();

            var reference = $scope.reference,
              offset = $(origin2).offset(),
              width = $(origin2).width(),
              height = $(origin2).height(),
              tip2 = $scope.element.find(".tip-2"),
              tip1 = $scope.element.find(".tip-1");

            tip2.css({
              top: offset.top - reference.top - tip2.height(),
              left: offset.left - reference.left + width / 2
            });

            offset = $(origin1).offset();
            width = $(origin1).width();
            height = $(origin1).height();

            tip1.css({
              top: offset.top - reference.top + height / 2 - tip1.height(),
              left: offset.left - reference.left + width + 4
            });
          };

          $scope.before = function() {
            $scope.element.show();
            $scope.move({
              'marginTop': '0%'
            });
            $(origin1).addClass("welcome-ref");
            $(origin2).addClass("welcome-ref").parent().removeClass("monitor");
          };

          $scope.after = function() {
            $scope.element.hide();
            $(origin1).removeClass("welcome-ref");
            $(origin2).removeClass("welcome-ref").parent().addClass("monitor");
          };

        }]
      };
    }).directive(
    "v1.0.5",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        require: '^?welcome',
        template: [
          '<div class="tips" style="display: none;">',
          '<div class="tip tip-1"><div class="arrow arrow-top-left2"/><div class="summary">点击我切换tab页，查看发布过程详细数据：<ol><li>主机列表</li><li>日志</li><li>发布历史</li></ol></div></div>',
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          scope.element = element;
        },
        controller: ['$scope', '$timeout', function($scope, $timeout) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          $scope.version = '1.0.5';

          var show = runtime.isWelcome($scope.version);
          if (show) {
            $scope.welcomeStack.get($scope.paths.parallel).forward.push($scope);
          }

          $scope.retry = 0;

          var origin1 = ".nav-tabs.tab-header.deployment-tabs";

          $scope.welcome = function() {

            if ($scope.retry > 3) {
              $scope.next();
              return false;
            }

            if ($(origin1).length <= 0) {
              $scope.retry++;
              $timeout(function() {
                $scope.welcome();
              }, WELCOME_LISTENER, false, null);
              return false;
            }

            $scope.before();

            var reference = $scope.reference,
              offset = $(origin1).offset(),
              width = $(origin1).width(),
              height = $(origin1).height(),
              tip1 = $scope.element.find(".tip-1");

            tip1.css({
              top: offset.top - reference.top + height,
              left: offset.left - reference.left + 32
            });
          };

          $scope.before = function() {
            $scope.element.show();
            $scope.move({
              'marginTop': '0%'
            });
            $(origin1).addClass("welcome-ref welcome-ref-pos");
          };

          $scope.after = function() {
            $scope.element.hide();
            $(origin1).removeClass("welcome-ref welcome-ref-pos");
          };

        }]
      };
    }).directive(
    "v1.0.6",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        require: '^?welcome',
        template: [
          '<div class="tips" style="display: none;">',
          '<div class="tip tip-1"><div class="arrow arrow-bottom-right2 pull-right"/><div class="summary pull-right">点击我切换开关控制页面数据是否保持刷新，默认开启（每3秒钟重新拉取一次最新数据）。</div></div>',
          '<div class="tip tip-2"><div class="arrow arrow-top-right2 pull-right"/><div class="summary pull-right">数据分页情况，既可以通过滚动条加载下一页数据，也可以通过此处的按钮进行分页操作。</div></div>',
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          scope.element = element;
        },
        controller: ['$scope', '$timeout', function($scope, $timeout) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          $scope.version = '1.0.6';

          var show = runtime.isWelcome($scope.version);
          if (show) {
            $scope.welcomeStack.get($scope.paths.parallel).forward.push($scope);
          }

          $scope.retry = 0;

          var origin1 = ".refresh-switch";
          var origin2 = ".pagination2";

          $scope.welcome = function() {

            if ($scope.retry > 3) {
              $scope.next();
              return false;
            }

            if ($(origin1).length <= 0 || $(origin2).length <= 0) {
              $scope.retry++;
              $timeout(function() {
                $scope.welcome();
              }, WELCOME_LISTENER, false, null);
              return false;
            }

            $scope.before();

            var reference = $scope.reference,
              first = $(origin2).first(),
              offset = first.offset(),
              width = first.width(),
              height = first.height(),
              tip2 = $scope.element.find(".tip-2"),
              tip1 = $scope.element.find(".tip-1");

            tip2.css({
              top: offset.top - reference.top + height + 16,
              left: offset.left - reference.left + width / 2 - tip1.width()
            });

            first = $(origin1).first();
            offset = first.offset();
            width = first.width();
            height = first.height();

            tip1.css({
              top: offset.top - reference.top - tip1.height() + 16,
              left: offset.left - reference.left + width / 2 - tip1.width()
            });
          };

          $scope.before = function() {
            $scope.element.show();
            $scope.move({
              'marginTop': '0%',
              'marginLeft': '0%'
            });
            $(origin1).addClass("welcome-ref welcome-ref-pos");
            $(origin2).addClass("welcome-ref welcome-ref-pos");
            $(".ContentFlow>.flow>.item").removeClass("welcome-ref");
          };

          $scope.after = function() {
            $scope.element.hide();
            $(origin1).removeClass("welcome-ref welcome-ref-pos");
            $(origin2).removeClass("welcome-ref welcome-ref-pos");
          };

        }]
      };
    }).directive(
    "v1.1.1",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        require: '^?welcome',
        template: [
          '<div class="tips" style="display: none;">',
          '<div class="tip tip-1"><div class="arrow-top-left2"/><div class="summary">group展示：<ol><li>点击左右小方块切换group；</li><li>点击左右方向键切换group；</li></ol></div></div>', //<li>拖动切换group；</li><li>滚动鼠标切换group；</li><li>拖动底部滚动条切换group。</li>
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          scope.element = element;
        },
        controller: ['$scope', '$timeout', '$interval', function($scope, $timeout, $interval) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          $scope.version = '1.1.1';

          var show = runtime.isWelcome($scope.version);
          if (show) {
            $scope.welcomeStack.get($scope.paths.parallel).forward.push($scope);
          }

          $scope.retry = 0;

          var origin1 = ".ContentFlow>.flow>.item";

          $scope.welcome = function() {

            if ($scope.retry > 3) {
              $scope.next();
              return false;
            }

            if ($(origin1 + ".active").length <= 0) {
              $scope.retry++;
              $timeout(function() {
                $scope.welcome();
              }, WELCOME_LISTENER, false, null);
              return false;
            }

            $scope.before();

            var reference = $scope.reference,
              offset = $(origin1 + ".active").offset(),
              width = $(origin1 + ".active").width(),
              height = $(origin1 + ".active").height(),
              tip1 = $scope.element.find(".tip-1");

            tip1.css({
              top: offset.top - reference.top + height + 16,
              left: offset.left - reference.left + width / 2
            });
          };

          $scope.before = function() {
            $(origin1).addClass("welcome-ref");
            $scope.element.show();
            $scope.move({
              'marginTop': '26%',
              'marginLeft': '-26%'
            });
          };

          $scope.after = function() {
            $scope.element.hide();
            $(origin1).removeClass("welcome-ref");
          };

        }]
      };
    }).directive(
    "v1.1.2",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        require: '^?welcome',
        template: [
          '<div class="tips" style="display: none;">',
          '<div class="tip tip-1"><div class="arrow arrow-top-right2"/><div class="summary">回退发布</div></div>',
          '<div class="tip tip-2"><div class="arrow arrow-top-right2 pull-right"/><div class="summary">正常发布操作区，请将鼠标移动到对应的按钮上查看说明</div></div>',
          '</div>'
        ].join(""),
        link: function(scope, element, attrs) {
          scope.element = element;
        },
        controller: ['$scope', '$timeout', '$interval', function($scope, $timeout, $interval) {
          var runtime = com.ctrip.tars.model.Runtime.getInstance();

          $scope.version = '1.1.2';

          var show = runtime.isWelcome($scope.version);
          if (show) {
            $scope.welcomeStack.get($scope.paths.parallel).forward.push($scope);
          }

          var start = function() {
            var reference = $scope.reference,
              offset = $(".app-status-toolbar").offset(),
              parents = $(".app-status-toolbar").parents(".item"),
              parentOffset = parents.offset(),
              width = $(".app-status-toolbar").width(),
              height = $(".app-status-toolbar").height(),
              tip2 = $scope.element.find(".tip-2"),
              tip1 = $scope.element.find(".tip-1");

            tip2.css({
              top: parentOffset.top - reference.top + parents.height() + 24,
              left: offset.left - reference.left + width / 2 - tip2.width()
            });

            offset = $(".airmobile").offset();
            width = $(".airmobile").width();
            height = $(".airmobile").height();
            tip1.css({
              top: offset.top - reference.top + height,
              left: offset.left - reference.left + width / 2 - tip1.width()
            });
          };

          $scope.before = function() {
            $scope.element.show();
            $scope.move({
              'marginTop': '26%',
              'marginLeft': '-26%'
            });

            $(".app-status-toolbar").addClass("welcome-ref");
            $(".airmobile").addClass("welcome-ref");
            $(".ContentFlow>.flow>.item").addClass("welcome-ref");
          };

          $scope.after = function() {
            $scope.element.hide();
            $(".app-status-toolbar").removeClass("welcome-ref");
            $(".airmobile").removeClass("welcome-ref");
            $(".ContentFlow>.flow>.item").removeClass("welcome-ref");
          };

          $scope.retry = 0;
          $scope.welcome = function() {

            if ($scope.retry > 3) {
              $scope.next();
              return false;
            }

            if ($(".app-status-toolbar").length <= 0 || $(".airmobile").length <= 0) {
              $scope.retry++;
              $timeout(function() {
                $scope.welcome();
              }, WELCOME_LISTENER, false, null);
              return false;
            }

            $scope.before();

            switch (runtime.getPath()) {
              case $scope.paths.parallel:
                start();
                break;
              case $scope.paths.single:
                start();
                break;
              default:
                break;
            }
          };
        }]
      };
    });

