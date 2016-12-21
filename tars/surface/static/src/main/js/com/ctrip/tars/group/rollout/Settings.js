/**
 * Created by liujc on 2015/2/28.
 */
$import("com.ctrip.tars.util.Jquery");
$import("com.ctrip.tars.util.Angular");
Class.forName({
  name: "class com.ctrip.tars.group.rollout.Settings extends Object",

  "private settings": new js.util.HashMap(),
  "@Getter private values": {},

  Settings: function() {
    this.reset();

    this.settings.put("flavor", {
      active: false,
      align: 'top',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("regulars", {
      active: false,
      align: 'top',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("group", {
      active: false,
      align: 'top',
      offset: 0,
      valid: false,
      validMsg: null
    });
    this.settings.put("ignoreVerifyResult", {
      active: false,
      align: 'top',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("batchPattern", {
      active: true,
      align: 'top',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("pauseTime", {
      active: false,
      align: 'top',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("waitForXmon", {
      active: false,
      align: 'top',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("stopThreshold", {
      active: false,
      align: 'top',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("startupTimeout", {
      active: false,
      align: 'bottom',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("verifyTimeout", {
      active: false,
      align: 'bottom',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("validateFailAction", {
      active: false,
      align: 'bottom',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("rollbackVersion", {
      active: false,
      align: 'bottom',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("formula", {
      active: false,
      align: 'bottom',
      offset: 0,
      valid: true,
      validMsg: null
    });
    this.settings.put("restartAppPool", {
      active: false,
      align: 'bottom',
      offset: 0,
      valid: true,
      validMsg: null
    });

    this.settings.put("manual", {
      active: false,
      align: 'bottom',
      offset: 0,
      valid: true,
      validMsg: null
    });
  },
  setValues: function(data) {
    $.extend(true, this.values, data);
  },
  setActive: function($event, name) {
    var ele = $event.target,
      iter = this.settings.keySet().iterator();
    while (iter.hasNext()) {
      var key = iter.next(),
        value = this.settings.get(key);
      if (key.equals(name)) {
        value.active = true;
        //设置offset
        var os = 28,
          os2 = $(ele).height() / 2,
          offset = com.ctrip.tars.util.Jquery.getOffset(ele, ".bubbles-origin");
        value.offset = os2 + ((value.align == 'top') ? (offset.top - os) : (offset.top - $(".bubbles-target").height() + os));
      } else {
        value.active = false;
        value.offset = 0;
      }
    }
  },
  isActive: function(name) {
    var value = this.settings.get(name);
    return value && value.active;
  },
  getActive: function() {
    var iter = this.settings.values().iterator();
    while (iter.hasNext()) {
      var value = iter.next();
      if (value.active) {
        return value;
      }
    }
  },
  getValidMsg: function(name) {
    var value = this.settings.get(name);
    return (value && !value.valid) ? value.validMsg : "";
  },
  isValid: function(name) {
    var value = this.settings.get(name);
    return value ? !!value.valid : false;
  },
  isValidAll: function() {
    var iter = this.settings.keySet().iterator();
    while (iter.hasNext()) {
      var name = iter.next();
      if (!this.isValid(name)) {
        return false;
      }
    }
    return true;
  },
  getPosition: function() {
    var value = this.getActive();
    return {
      top: (value ? value.offset : 0)
    };
  },
  reset: function(data) {
    if (!data) {
      data = {
        //group: null,
        batchPattern: 25,
        pauseTime: 0,
        startupTimeout: 3,
        verifyTimeout: 0,
        ignoreVerifyResult: false,
        restartAppPool: false,
        manual: false,
        flavor: 'rollout'
      };
    }
    this.setValues(data);

    //reset form.
    $("form[name='rollout-settings']").find("input[ion-range]").each(function() {
      var scope = com.ctrip.tars.util.Angular.getScope($(this));
      if (scope) {
        scope.update({
          from: data[$(this).attr("name")] * 1
        });
      }
    });

    //var iter = this.settings.values().iterator();
    //while (iter.hasNext()) {
    //  var value = iter.next();
    //  value.valid = true;
    //  value.validMsg = null;
    //}

    this.validateAll();
  },
  getValue: function(key) {
    return this.getValues()[key];
  },
  getTranslatedValues: function() {
    var values = this.getValues();
    return {
      batch_pattern: (values.batchPattern || 1) + '%',
      pause_time: values.pauseTime * 60,
      startup_timeout: values.startupTimeout * 60,
      verify_timeout: values.verifyTimeout * 60,
      ignore_verify_result: values.ignoreVerifyResult,
      restart_app_pool: values.restartAppPool,
      mode: values.manual ? "m" : "a"
    };
  },
  getTranslatedValue: function(key) {
    return this.getTranslatedValues()[key];
  },
  validate: function(name) {
    var values = this.getValues(),
      value = null,
      setting = null;
    switch (name) {
      case "group":
        value = values.group;
        setting = this.settings.get("group");
        if (Object.isNull(value)) {
          setting.valid = false;
          setting.validMsg = "group 不能为空";
          return false;
        } else {
          setting.valid = true;
          setting.validMsg = null;
        }
        return true;

      case "batchPattern":
        value = values.batchPattern;
        setting = this.settings.get("batchPattern");
        if (Object.isNull(value) || value > 50 || value < 0) {
          setting.valid = false;
          setting.validMsg = "单个批次拉出上限取值范围是[0,50]%";
          return false;
        } else {
          setting.valid = true;
          setting.validMsg = null;
        }
        return true;

      case "pauseTime":
        value = values.pauseTime;
        setting = this.settings.get("pauseTime");
        if (Object.isNull(value) || value > 30 || value < 0) {
          setting.valid = false;
          setting.validMsg = "批次间等待时间取值范围是[0,30]分钟";
          return false;
        } else {
          setting.valid = true;
          setting.validMsg = null;
        }
        return true;

      case "startupTimeout":
        value = values.startupTimeout;
        setting = this.settings.get("startupTimeout");
        if (Object.isNull(value) || value > 180 || value < 0) {
          setting.valid = false;
          setting.validMsg = "应用启动超时时间取值范围是[0,180]分钟";
          return false;
        } else {
          setting.valid = true;
          setting.validMsg = null;
        }
        return true;

      case "verifyTimeout":
        value = values.verifyTimeout;
        setting = this.settings.get("verifyTimeout");
        if (Object.isNull(value) || value > 5 || value < 0) {
          setting.valid = false;
          setting.validMsg = "点火验证耗时取值范围是[0,5]分钟";
          return false;
        } else {
          setting.valid = true;
          setting.validMsg = null;
        }
        return true;

      default:
        return true;
    }
  },
  validateAll: function() {
    var iter = this.settings.keySet().iterator(),
      flag = true;
    while (iter.hasNext()) {
      var name = iter.next();
      flag = flag && this.validate(name);
    }
    return flag;
  }
});

