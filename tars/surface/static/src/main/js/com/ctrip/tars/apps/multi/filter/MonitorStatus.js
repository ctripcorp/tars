Class.forName({
  name: "class com.ctrip.tars.apps.multi.filter.MonitorStatus extends Object",
  "@Getter @Setter name": "",
  "@Getter @Setter icon": "",
  "@Getter @Setter title": "",
  "@Getter @Setter size": "",
  "@Getter @Setter left": "",
  "@Getter @Setter marginLeft": "",
  "@Getter @Setter disabled": false,
  "@Getter @Setter active": false,
  "@Getter @Setter effect": false,
  "@Getter @Setter value": 0,
  "@Getter @Setter badge": "",

  MonitorStatus: function(name, icon, title, size, left, marginLeft, active, disabled, effect, badge) {
    this.name = name;
    this.icon = icon;
    this.title = title;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.active = !!active;
    this.disabled = !!disabled;
    this.effect = !!effect;
    this.badge = badge;
  },

  "abstract click": function($scope, $event) {
    $scope.toggleStatusWanted(this.name);
  },

  "plus": function(value) {
    this.value += value;
  },

  "minus": function(value) {
    this.value -= value;
  }
});

