/**
 * Define tars portal angular module
 */

$import("com.ctrip.tars.model.Runtime");

// au-loading
$import("au-loading.css.default", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
// au-msgbox
$import("au-msgbox.css.default", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
// font Awesome
$import("fontawesome.css.font-awesome", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
// Bootstrap
$import("bootstrap.css.bootstrap", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
// malihu-custom-scrollbar
$import("malihu-custom-scrollbar-plugin.css.jquery-mCustomScrollbar", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
// au-dialog
$import("au-dialog.css.default", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
// bxslider todo
$import("bxslider-4.css.jquery-bxslider", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
// Ion.RangeSlider
$import("ionrangeslider.css.ion-rangeSlider", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
$import("ionrangeslider.css.ion-rangeSlider-skinNice", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);
//animate
$import("animate.css.animate", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.EXT);

//load global style
//$import("animate", "CSSClassLoader");
$import("sidebar", "CSSClassLoader");
//$import("accordion", "CSSClassLoader");
$import("easypie", "CSSClassLoader");
$import("tars", "CSSClassLoader");
$import("flowstep", "CSSClassLoader");
$import("plumb", "CSSClassLoader");
$import("histories", "CSSClassLoader");
//$import("events", "CSSClassLoader");
$import("bubbles", "CSSClassLoader");
$import("notification", "CSSClassLoader");
//$import("tween-button", "CSSClassLoader");
$import("beautifybox", "CSSClassLoader");
$import("countdown", "CSSClassLoader");
$import("cover", "CSSClassLoader");
$import("bxslider", "CSSClassLoader");
$import("components", "CSSClassLoader");
$import("index", "CSSClassLoader");


//load skin
$import("skin", "CSSClassLoader", atom.misc.Launcher.CSSClassLoader.SKIN);

//jquery
$import("jquery.js.jquery", "ExtClassLoader");

//au-loading 0.0.2
$import("au-loading.js.au-loading", "ExtClassLoader");

//au-msgbox 0.0.2
$import("au-msgbox.js.au-msgbox", "ExtClassLoader");

window.loading = $("body").licoLoading({
  title: "Tars",
  cls: "cls-1",
  position: "absolute"
});

window.loading.show({
  desc: "正在初始化，请稍后"
});

// Bootstrap
$import("bootstrap.js.bootstrap", "ExtClassLoader", true);

// angular
$import("angular.js.angular", "ExtClassLoader");
$import("angular-route.js.angular-route", "ExtClassLoader");
$import("angular-strap.js.angular-strap", "ExtClassLoader");
$import("angular-strap.js.angular-strap-tpl", "ExtClassLoader");
$import("angular-resource.js.angular-resource", "ExtClassLoader");
//$import("angular-ui-bootstrap-bower.js.ui-bootstrap-tpls", "ExtClassLoader");
//$import("angular-animate.js.angular-animate", "ExtClassLoader");

// mousewheel
$import("jquery-mousewheel.js.jquery-mousewheel", "ExtClassLoader");

// malihu-custom-scrollbar
$import("malihu-custom-scrollbar-plugin.js.jquery-mCustomScrollbar", "ExtClassLoader");

//$import("au-store.js.atom.lico.store.Store", "ExtClassLoader", true);
//$import("au-template.js.atom.lico.template.Template", "ExtClassLoader", true);
//$import("au-dialog.js.malihu.manos.mCustomScrollbar", "ExtClassLoader", true);

//au-dialog
$import("au-dialog.js.au-dialog", "ExtClassLoader");

// bxslider todo
$import("bxslider-4.js.jquery-bxslider", "ExtClassLoader");

// easy-pie-chart
$import("easy-pie-chart.js.angular-easypiechart", "ExtClassLoader");

// greensock
//$import("greensock.js.TweenMax", "ExtClassLoader");

// highchart
$import("highstock-release.js.highstock", "ExtClassLoader", false, function() {
  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });
  $import("com.highstock.Theme", "AppClassLoader", true);
});

// iscroll
$import("iscroll.js.iscroll-probe", "ExtClassLoader");

// jsPlumb
$import("jsPlumb.js.jquery-jsPlumb", "ExtClassLoader", true);

// fly
$import("au-proxy-fly.js.jquery-fly", "ExtClassLoader", true);

// liteAccordion
//$import("au-proxy-liteaccordion.css.liteaccordion", "CSSClassLoader", true);
//$import("jquery-easing-original.js.jquery-easing", "ExtClassLoader", true);
//$import("au-proxy-liteaccordion.js.liteaccordion", "ExtClassLoader");

// Ion.RangeSlider
$import("ionrangeslider.js.ion-rangeSlider", "ExtClassLoader", true);

// greensock tweenmax
$import("greensock.js.TweenMax", "ExtClassLoader", true);

// textillate
$import("letteringjs.js.lettering", "ExtClassLoader", true);
$import("textillate.js.textillate", "ExtClassLoader", true);

$import("com.ctrip.tars.config.Config");

window.tarsPortal = angular.module('com.ctrip.tars.Portal', [

  'ngRoute',

  //'ngAnimate',

  //'ui.bootstrap',

  'filters',

  'com.ctrip.tars.component.angular.tooltip', 'com.ctrip.tars.component.angular.action',
  'com.ctrip.tars.component.angular.tabpanel', 'com.ctrip.tars.component.angular.bubble',
  'com.ctrip.tars.component.angular.flowstep', 'com.ctrip.tars.component.angular.percent',
  'com.ctrip.tars.component.angular.countdown', 'com.ctrip.tars.component.angular.cover',
  'com.ctrip.tars.component.angular.pagination', 'com.ctrip.tars.component.angular.layout.Concern',
  'com.ctrip.tars.component.angular.popouts', 'com.ctrip.tars.component.angular.slider',
  'com.ctrip.tars.component.angular.postmark', 'com.ctrip.tars.component.angular.flp.Flp',
  'com.ctrip.tars.component.angular.ink.Ink', 'com.ctrip.tars.component.angular.accordion',
  'com.ctrip.tars.component.angular.sidebar', 'com.ctrip.tars.component.angular.expander',
  'com.ctrip.tars.component.angular.tween.show', "com.ctrip.tars.component.angular.contentflow",

  // 'com.ctrip.tars.config', 
  'com.ctrip.tars.security',
  'com.ctrip.tars.component.angular.notification', 'com.ctrip.tars.header',

  'com.ctrip.tars.apps', 'com.ctrip.tars.servers', 'com.ctrip.tars.batches',
  'com.ctrip.tars.app', 'com.ctrip.tars.group', 'com.ctrip.tars.apps.multi',
  'com.ctrip.tars.plumb', 'com.ctrip.tars.progress', 'com.ctrip.tars.xmon',
  'com.ctrip.tars.histories', 'com.ctrip.tars.console', 'com.ctrip.tars.packages', 'com.ctrip.tars.groups',
  'com.ctrip.tars.group.rollout', 'com.ctrip.tars.group.rollback', 'com.ctrip.tars.welcome'

  //'com.ctrip.tars.component.angular.percent.bar2',
  //'com.ctrip.tars.component.angular.percent.pie',
  //'com.ctrip.tars.events', 'com.ctrip.tars.exceptions', 'com.ctrip.tars.d3.tree', 
  //'com.ctrip.tars.subscriptions', 
  //'com.ctrip.tars.tween.menu', 'com.ctrip.tars.tween.share',
  //'com.ctrip.tars.component.angular.iButton',
]).directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
}).factory('AutomationInterceptor', ['$q', '$templateCache', function($q, $templateCache) {
  return {
    request: function(httpconfig) {
      var url = (httpconfig.url || "").trim();

      // url.indexOf('http') !== 0 && url.indexOf('/') !== 0
      if (!$templateCache.get(url)) {
        if (url.indexOf('template!') === 0) {
          url = ROOT_URL + "template/" + url.substring(9);
        }

        if (url.indexOf("?") !== -1) {
          url.replace("?", "?v=" + VERSION + "&");
        } else {
          url += "?v=" + VERSION;
        }

        httpconfig.url = url;
      }

      return httpconfig;
    }
  };
}]).config(['$httpProvider', '$routeProvider',
  function($httpProvider, $routeProvider) {

    $httpProvider.interceptors.push('AutomationInterceptor');
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

    $routeProvider.when('/view/index', {
      templateUrl: 'template!index.html',
      reloadOnSearch: false
    }).when('/view/deployments/single', {
      templateUrl: 'template!single.html',
      reloadOnSearch: false
    }).when('/view/deployments/serial', {
      templateUrl: 'template!serial.html',
      reloadOnSearch: false
    }).when('/view/details', {
      templateUrl: 'template!parallel.html',
      reloadOnSearch: false
    }).when('/view/multi-app', {
      templateUrl: 'template!parallel.html',
      reloadOnSearch: false
    }).when('/view/deployments/parallel', {
      templateUrl: 'template!parallel.html',
      reloadOnSearch: false
    }).otherwise({
      templateUrl: 'template!404.html',
      reloadOnSearch: false
    });
  }
]);

// $import("com.ctrip.tars.config.Service");

$import("com.ctrip.tars.controller.Root");
$import("com.ctrip.tars.controller.Dispatcher");
$import("com.ctrip.tars.header.Header");
$import("com.ctrip.tars.security.Security", true);
$import("com.ctrip.tars.navigator.Navigator", true);
$import("com.ctrip.tars.filter.Filter", true);
$import("com.ctrip.tars.welcome.Welcome", true);

$import("com.ctrip.tars.component.angular.tween.Show", true);
$import("com.ctrip.tars.component.angular.tooltip.Tooltip", true);
$import("com.ctrip.tars.component.angular.action.Action", true);
$import("com.ctrip.tars.component.angular.notification.Notification", true);
$import("com.ctrip.tars.component.angular.tabpanel.Tabpanel", true);
$import("com.ctrip.tars.component.angular.expander.Expander", true);
$import("com.ctrip.tars.component.angular.flowstep.Flowstep", true);
$import("com.ctrip.tars.component.angular.percent.Easypie", true);
$import("com.ctrip.tars.component.angular.countdown.Countdown", true);
$import("com.ctrip.tars.component.angular.cover.Cover", true);
$import("com.ctrip.tars.component.angular.popout.Popouts", true);
$import("com.ctrip.tars.component.angular.slider.IonRange", true);
//$import("com.ctrip.tars.component.angular.percent.Pie", true);
$import("com.ctrip.tars.component.angular.bubble.Bubble", true);
$import("com.ctrip.tars.component.angular.postmark.Postmark", true);
$import("com.ctrip.tars.component.angular.ink.Ink", true);
$import("com.ctrip.tars.component.angular.flp.Flp", true);
//$import("com.ctrip.tars.component.angular.iButton.iButton", true);
//$import("com.ctrip.tars.component.angular.percent.Bar", true);
$import("com.ctrip.tars.component.angular.pagination.Pagination", true);
//$import("com.ctrip.tars.component.angular.tween.Menu", true);
//$import("com.ctrip.tars.component.angular.tween.Share", true);
$import("com.ctrip.tars.component.angular.accordion.Accordion", true);
$import("com.ctrip.tars.component.angular.sidebar.Sidebar", true);
$import("com.ctrip.tars.component.angular.layout.Concern", true);
$import("com.ctrip.tars.component.angular.contentflow.ContentFlow", true);

$import("com.ctrip.tars.app.App", true);
$import("com.ctrip.tars.apps.Apps", true);
$import("com.ctrip.tars.apps.multi.Apps", true);

$import("com.ctrip.tars.controller.Index", true);
$import("com.ctrip.tars.deployments.Single", true);
$import("com.ctrip.tars.deployments.Serial", true);
$import("com.ctrip.tars.deployments.Parallel", true);

$import("com.ctrip.tars.group.Group", true);
$import("com.ctrip.tars.groups.Groups", true);

$import("com.ctrip.tars.deployments.tabs.Tabpanel", true);
$import("com.ctrip.tars.servers.Servers", true);
$import("com.ctrip.tars.histories.Histories", true);
$import("com.ctrip.tars.console.Console", true);
//$import("com.ctrip.tars.events.Events", true);
//$import("com.ctrip.tars.exceptions.Exceptions",true);
//$import("com.ctrip.tars.subscriptions.all", true);

$import("com.ctrip.tars.plumb.Plumb", true);
$import("com.ctrip.tars.progress.Progress", true);
$import("com.ctrip.tars.xmon.Xmon", true);
$import("com.ctrip.tars.group.rollout.Controller", true);
$import("com.ctrip.tars.group.rollback.Controller", true);
$import("com.ctrip.tars.batches.Batches", true);
$import("com.ctrip.tars.packages.Packages", true);

window.loading.show({
  desc: "Tars初始化完毕，请稍后"
});

