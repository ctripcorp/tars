$import("com.ctrip.tars.component.IAjax");
$import("com.ctrip.tars.component.Command");
$import("com.ctrip.tars.util.Id");
$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.model.Runtime");

Class.forName({
  name: "class com.ctrip.tars.group.Command extends com.ctrip.tars.component.Command",
  "click": function() {
    //解决重复提交问题
    if (this.disabled) {
      return false;
    }
    return true;
  },

  "after": function($scope) {
    //强制刷新
    var $root = com.ctrip.tars.util.Angular.getRootScope();
    if ($scope && $scope.selectedGroup) {
      $root.$broadcast('deployment.group.update', $scope.selectedGroup);
    } else {
      $root.$broadcast('dispatcher.interval.timer');
    }
  }
});

Class.forName({
  name: "class com.ctrip.tars.group.AppCommand extends com.ctrip.tars.group.Command",
  "@Getter @Setter status": {},
  "@Getter @Setter size": "",
  "@Getter @Setter left": "",
  "@Getter @Setter marginLeft": "",
  "@Getter @Setter effect": false,
  "click": function($scope, $event) {

    return com.ctrip.tars.group.Command.getClass().getMethod("click").getValue().call(this);

    //var $root = com.ctrip.tars.util.Angular.getRootScope();
    //$root.$broadcast("status.rank.update", this.status);
  },
  "after": function($scope) {
    com.ctrip.tars.group.Command.getClass().getMethod("after").getValue().call(this, $scope);
  }
});

//Rolling
Class.forName({
  name: "class com.ctrip.tars.group.RollingOut extends com.ctrip.tars.group.AppCommand",
  "icon": "play",
  "title": "RollingOut",

  RollingOut: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    scope.disabled = true;

    $.licoMsgbox({
      title: "操作确认",
      content: "您确定执行 \"" + scope.title + "\" 操作吗？",
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":

            var deploymentId = $scope.getValidParams().deployment;
            if (com.ctrip.tars.util.Id.isValid(deploymentId)) {
              com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', deploymentId, '/rollout'].join(""), {
                success: function() {
                  scope.after($scope);
                  scope.disabled = false;
                },
                exception: function() {
                  scope.disabled = false;
                }
              });
            }
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }
      }
    });
  }
});

//Baking
Class.forName({
  name: "class com.ctrip.tars.group.Baking extends com.ctrip.tars.group.AppCommand",
  "icon": "step-forward",
  "title": "Baking",

  Baking: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    scope.disabled = true;

    $.licoMsgbox({
      title: "操作确认",
      content: "您确定执行 \"" + scope.title + "\" 操作吗？",
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":

            var deploymentId = $scope.getValidParams().deployment;
            if (com.ctrip.tars.util.Id.isValid(deploymentId)) {
              com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', deploymentId, '/bake'].join(""), {
                success: function() {
                  scope.after($scope);
                  scope.disabled = false;
                },
                exception: function() {
                  scope.disabled = false;
                }
              });
            }
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }
      }
    });
  }
});

//Smoking
Class.forName({
  name: "class com.ctrip.tars.group.Smoking extends com.ctrip.tars.group.AppCommand",
  "icon": "step-forward",
  "title": "Smoking",

  Smoking: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    scope.disabled = true;

    $.licoMsgbox({
      title: "操作确认",
      content: "您确定执行 \"" + scope.title + "\" 操作吗？",
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":

            var deploymentId = $scope.getValidParams().deployment;
            if (com.ctrip.tars.util.Id.isValid(deploymentId)) {
              com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', deploymentId, '/smoke'].join(""), {
                success: function() {
                  scope.after($scope);
                  scope.disabled = false;
                },
                exception: function() {
                  scope.disabled = false;
                }
              });
            }
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }
      }
    });
  }
});

//错误重试
Class.forName({
  name: "class com.ctrip.tars.group.Retry extends com.ctrip.tars.group.AppCommand",
  "icon": "retweet",
  "title": "错误重试",

  Retry: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event) {

    var groupId = $scope.getValidParams().group;
    com.ctrip.tars.component.IAjax.post([BASE_URL, 'groups/', groupId, '/sync'].join(""), {
      data: {
        "ignore_setting": "true"
      },
      ignore: true
    });

    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    scope.disabled = true;

    $.licoMsgbox({
      title: "操作确认",
      content: "您确定执行 \"" + scope.title + "\" 操作吗？",
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":

            var deploymentId = $scope.getValidParams().deployment;
            if (com.ctrip.tars.util.Id.isValid(deploymentId)) {
              com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', deploymentId, '/retry'].join(""), {
                success: function() {
                  scope.after($scope);
                  scope.disabled = false;
                },
                exception: function() {
                  scope.disabled = false;
                }
              });
            }
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }
      }
    });
  }
});

//终止
Class.forName({
  name: "class com.ctrip.tars.group.Revoke extends com.ctrip.tars.group.AppCommand",
  "icon": "stop",
  "title": "终止",

  Revoke: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event, success) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    scope.disabled = true;

    $.licoMsgbox({
      title: "操作确认",
      content: "您确定执行 \"" + (scope.confirm || scope.title) + "\" 操作吗？",
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":

            var deploymentId = $scope.getValidParams().deployment;
            if (com.ctrip.tars.util.Id.isValid(deploymentId)) {
              com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', deploymentId, '/revoke'].join(""), {
                success: function() {
                  if (success) {
                    success($scope, $event);
                  } else {
                    scope.after($scope);
                  }
                  scope.disabled = false;
                },
                exception: function() {
                  scope.disabled = false;
                }
              });
            }
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }
      }
    });
  }
});

Class.forName({
  name: "class com.ctrip.tars.group.StartRollout extends com.ctrip.tars.group.AppCommand",
  "icon": "paper-plane-o",
  "title": "开始发布至 - " + com.ctrip.tars.model.Runtime.getInstance().getTarget() + "环境",

  StartRollout: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event, reroll) {
    var groupId = $scope.getValidParams().group;
    com.ctrip.tars.component.IAjax.post([BASE_URL, 'groups/', groupId, '/sync'].join(""), {
      data: {
        "ignore_setting": "true"
      },
      ignore: true
    });

    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    scope.disabled = true;

    var $root = com.ctrip.tars.util.Angular.getRootScope();

    $.licoDialog({
      level: -2,
      destory: false,
      blur: false,
      height: "0.88",
      width: "0.96",
      offset: {
        top: 0
      },
      show: function(w, layout, attrs) {

        if ($root) {
          //var $scope = angular.element(ele).scope();
          var history = $scope.history || {};
          $root.$broadcast('dialog.rollout.config.begin', {
            layout: layout,
            attrs: attrs,
            flavor: reroll ? 'reroll' : 'rollout',
            params: reroll ? {
              deploymentId: history.id
            } : {}
          });
        }

        var flatPanel = layout.find('.mscrollbar'),
          scrollTopBtn = layout.find(".au-dialog-scroll-top");
        scrollTopBtn.click(function() {
          flatPanel.mCustomScrollbar("scrollTo", 0);
        });
        flatPanel.mCustomScrollbar({
          theme: "minimal-dark",
          callbacks: {
            whileScrolling: function() {
              var scrollTop = this.mcs.draggerTop;
              if (scrollTop <= 8) {
                scrollTopBtn.hide();
              } else {
                scrollTopBtn.fadeTo("slow", 0.5);
              }
            }
          }
        });
      },
      beforeClose: function(w, layout, attrs) {
        if ($root) {
          $root.$broadcast('dialog.rollout.config.end', {
            layout: layout,
            attrs: attrs
          });
        }
        scope.disabled = false;
      }
    });
  }
});

//RevokeAndStartRollout
Class.forName({
  name: "class com.ctrip.tars.group.RevokeAndStartRollout extends com.ctrip.tars.group.AppCommand",
  "icon": "paper-plane-o",
  "title": "开始发布至 - " + com.ctrip.tars.model.Runtime.getInstance().getTarget() + "环境",
  "confirm": "该操作将终止正在执行的发布单，终止后需重建发布单执行发布，是否确认终止？",

  RevokeAndStartRollout: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },
  "click": function($scope, $event) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    $.licoMsgbox({
      title: "操作确认",
      content: scope.confirm,
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":
            //var revokeClass = com.ctrip.tars.group.Revoke.getClass();
            //revokeClass.getMethod("click").getValue().call(scope, $scope, $event, function() {
            //revoke //begin
            var beginClass = com.ctrip.tars.group.StartRollout.getClass();
            beginClass.getMethod("click").getValue().call(scope, $scope, $event);
            //});

            scope.disabled = false;
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }
      }
    });
  }
});

//ReRoll
Class.forName({
  name: "class com.ctrip.tars.group.ReRoll extends com.ctrip.tars.group.AppCommand",
  "icon": "fast-forward",
  "text": "重发",
  "title": "重新发布至此版本",
  "confirm": "该操作将重新发布至此版本，确认执行？",

  ReRoll: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },
  "click": function($scope, $event) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    $.licoMsgbox({
      title: "操作确认",
      content: scope.confirm,
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":

            var beginClass = com.ctrip.tars.group.StartRollout.getClass();
            beginClass.getMethod("click").getValue().call(scope, $scope, $event, true);

            scope.disabled = false;
            break;
          case "0":
          default:
            break;
        }
        scope.disabled = false;
      }
    });

  }
});

Class.forName({
  name: "class com.ctrip.tars.group.StartRollback extends com.ctrip.tars.group.AppCommand",
  "icon": "undo",
  "title": "开始回退",

  StartRollback: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event, reroll) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    scope.disabled = true;

    var $root = com.ctrip.tars.util.Angular.getRootScope();

    $.licoDialog({
      level: -3,
      destory: false,
      blur: false,
      height: "0.88",
      width: "0.96",
      offset: {
        top: 0
      },
      show: function(w, layout, attrs) {

        if ($root) {
          //var $scope = angular.element(ele).scope();
          var history = $scope.history || {};
          $root.$broadcast('dialog.rollback.config.begin', {
            layout: layout,
            attrs: attrs,
            params: reroll ? {
              deploymentId: history.id
            } : {}
          });
        }

        var flatPanel = layout.find('.mscrollbar'),
          scrollTopBtn = layout.find(".au-dialog-scroll-top");
        scrollTopBtn.click(function() {
          flatPanel.mCustomScrollbar("scrollTo", 0);
        });
        flatPanel.mCustomScrollbar({
          theme: "minimal-dark",
          callbacks: {
            whileScrolling: function() {
              var scrollTop = this.mcs.draggerTop;
              if (scrollTop <= 8) {
                scrollTopBtn.hide();
              } else {
                scrollTopBtn.fadeTo("slow", 0.5);
              }
            }
          }
        });
      },
      beforeClose: function(w, layout, attrs) {
        if ($root) {
          $root.$broadcast('dialog.rollback.config.end', {
            layout: layout,
            attrs: attrs
          });
        }
        scope.disabled = false;
      }
    });
  }
});

//回退
Class.forName({
  name: "class com.ctrip.tars.group.Rollback extends com.ctrip.tars.group.AppCommand",
  "icon": "fast-backward",
  //"text": "回退",
  "title": "回退",

  Rollback: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);

    if (!result) {
      return false;
    }

    $.licoMsgbox({
      title: "操作确认",
      content: "您确定执行 \"" + scope.title + "\" 操作吗？",
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":
            if ($scope.hasRunningDeployment()) {
              //revoke
              var revokeClass = com.ctrip.tars.group.Revoke.getClass();
              scope.confirm = "此刻该应用有正在执行的发布单，终止后方可执行ROLLBACK操作，是否确认终止？";
              revokeClass.getMethod("click").getValue().call(scope, $scope, $event, function() {
                $scope.setCoolDownSection(true);
                //begin
                scope.disabled = false;
                var beginClass = com.ctrip.tars.group.StartRollback.getClass();
                beginClass.getMethod("click").getValue().call(scope, $scope, $event);
              });
            } else {
              scope.disabled = false;
              var beginClass = com.ctrip.tars.group.StartRollback.getClass();
              beginClass.getMethod("click").getValue().call(scope, $scope, $event);
            }
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }

      }
    });
  }
});

//继续
Class.forName({
  name: "class com.ctrip.tars.group.Resume extends com.ctrip.tars.group.AppCommand",
  "icon": "play",
  "title": "继续",

  Resume: function(status, size, left, marginLeft, disabled, effect) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
    this.disabled = !!disabled;
    this.effect = !!effect;
  },

  "click": function($scope, $event) {
    var scope = this;

    var result = scope.$super.click.call(scope, $scope, $event);
    if (!result) {
      return false;
    }

    scope.disabled = true;

    $.licoMsgbox({
      title: "操作确认",
      content: "您确定执行 \"" + scope.title + "\" 操作吗？",
      OK: '确定',
      CANCEL: '取消',
      icon: 'default',
      buttons: [],
      handler: function(value, msgbox) {
        switch (value) {
          case "1":

            var deploymentId = $scope.getValidParams().deployment;
            if (com.ctrip.tars.util.Id.isValid(deploymentId)) {
              com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', deploymentId, '/resume'].join(""), {
                success: function() {
                  scope.after($scope);
                  scope.disabled = false;
                },
                exception: function() {
                  scope.disabled = false;
                }
              });
            }
            break;
          case "0":
          default:
            scope.disabled = false;
            break;
        }

      }
    });
  }
});

/*
//重新整理
Class.forName({
	name: "class com.ctrip.tars.group.Arrange extends com.ctrip.tars.group.AppCommand",
	"icon": "file-archive-o",
	"title": "重新整理",

	Arrange: function(status, size, left, marginLeft, disabled, effect) {
		this.status = status;
		this.size = size;
		this.left = left;
		this.marginLeft = marginLeft;
		this.disabled = !!disabled;
    this.effect = !!effect;
	}
});

//生产发布
Class.forName({
	name: "class com.ctrip.tars.group.ProdRolling extends com.ctrip.tars.group.AppCommand",
	"icon": "hand-o-right",
	"title": "生产发布",

	ProdRolling: function(status, size, left, marginLeft, disabled, effect) {
		this.status = status;
		this.size = size;
		this.left = left;
		this.marginLeft = marginLeft;
		this.disabled = !!disabled;
    this.effect = !!effect;
	},

	"click": function($scope, $event) {
		this.$super.click.call(this, $scope, $event);
	}
});

//暂停
Class.forName({
	name: "class com.ctrip.tars.group.Pause extends com.ctrip.tars.group.AppCommand",
	"icon": "pause",
	"title": "暂停",

	Pause: function(status, size, left, marginLeft, disabled, effect) {
		this.status = status;
		this.size = size;
		this.left = left;
		this.marginLeft = marginLeft;
		this.disabled = !!disabled;
    this.effect = !!effect;
	}
});

Class.forName({
	name: "class com.ctrip.tars.group.RetryConfig extends com.ctrip.tars.group.AppCommand",
	"icon": "reply-all",
	"title": "错误重试",

	RetryConfig: function(status, size, left, marginLeft, disabled, effect) {
		this.status = status;
		this.size = size;
		this.left = left;
		this.marginLeft = marginLeft;
		this.disabled = !!disabled;
    this.effect = !!effect;
	}
});

Class.forName({
  name: "class com.ctrip.tars.group.RetryUpload extends com.ctrip.tars.group.AppCommand",

	"icon": "upload",
	"title": "错误重试",

	RetryUpload: function(status, size, left, marginLeft, disabled, effect) {
		this.status = status;
		this.size = size;
		this.left = left;
		this.marginLeft = marginLeft;
		this.disabled = !!disabled;
    this.effect = !!effect;
	}
});
*/

