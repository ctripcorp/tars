//依赖mCustomScrollbar
(function($) {
  if (!$.fn.licoDialog) {
    var zIndex = 10001;
    var licoDialog = function() {
      return {
        version: '0.3.3',
        defaults: {
          container: 'body',
          destory: true,
          blur: true
        },

        _createContentInDialog: function(parentNode, legendName) {
          //TODO  去掉fieldset，实现自定义样式，包含上下标题
          if (legendName) {
            var fieldset = $("<fieldset></fieldset>");

            $(parentNode).append(fieldset);
            var legend = $("<legend>" + legendName + "</legend>");
            fieldset.append(legend);

            return fieldset;

          }
          /*else {
					    var content = $("<div></div>");
					    $(parentNode).append(content);
					    return content;
					}*/
          return $(parentNode);
        },

        _setErrorInDialogByName: function(errors, level) {
          var ele = this._getDialogElementByLevel(level);
          if (errors) {
            for (var i in errors) {
              if (errors.hasOwnProperty(i)) {
                var input = ele.find("input[name='" + i + "'],select[name='" + i + "'], textarea[name='" + i + "']"),
                  container = input.parent(".au-dialog-input-container"),
                  label = container.parent("label"),
                  tip = label.find(".tip"),
                  errorE = label.find(".errormsg");
                label.addClass("error");
                tip.hide();
                errorE.html(errors[i]);
              }
            }
          }
        },

        _createDomInContent: function(filedset, vr, ats) {
          try {

            if (vr == "br") {
              filedset.append("<br/>");
            }

            if (!vr.tag) {
              vr.tag = {
                name: "div",
                attrs: {
                  css: 'au-dialog-layout-container'
                }
              };
            }

            var selectFlag = vr.tag.name == 'select',
              areaFlag = vr.tag.name == 'textarea',
              inputFlag = vr.tag.name == 'input',
              hiddenFlag = inputFlag && vr.tag.attrs && vr.tag.attrs.type == "hidden",
              submitFlag = inputFlag && vr.tag.attrs && vr.tag.attrs.type == "submit",
              normalInput = inputFlag && !hiddenFlag && !submitFlag,
              normalFormField = areaFlag || selectFlag || normalInput;

            var scope = this;
            var _container = null;
            if (normalFormField) {
              var tip = (vr.tip) ? vr.tip : "";
              var label = (vr.label) ? vr.label : "";
              var result = '<label><div>' + label + ':<span class="tip">' + tip + '</span><span class="errormsg"></span></div><div class="au-dialog-input-container"/></label>';
              _container = $(result);
              filedset.append(_container);
              if (!vr.tag.attrs.css) {
                vr.tag.attrs.css = normalInput ? 'au-dialog-au-dialog-text-input' : (areaFlag ? 'au-dialog-text-area' : (selectFlag ? 'au-dialog-text-select' : ''));
              }
            } else {
              if (submitFlag)
                if (!vr.tag.attrs.css) {
                  vr.tag.attrs.css = 'submit';
                }
              _container = filedset;
            }

            var tagName = vr.tag.name || "div";

            var input = '<' + tagName;
            var attrs = vr.tag.attrs;
            if (attrs) {
              $.each(attrs, function(i, n) {

                if (i == "legend" && tagName == 'fieldset') {
                  return true;
                }

                if (i == 'text') {
                  return true;
                }

                if (i == 'validateName' || i == 'css') {
                  i = 'class';
                }
                if (i == 'class' && input.indexOf('class="') != -1)
                  input = input.replace(/class="+/gi, 'class="' + n + ' ');
                else
                  input += ' ' + i + '=' + '"' + ((n) ? n : '') + '"';
              });
            }
            input += ' >' + (attrs.text || '') + '</' + tagName + '>';
            var _input = $(input);

            if (tagName == 'fieldset' && attrs.legend) {
              _input.append('<legend>' + attrs.legend + '</legend>');
            }

            if (hiddenFlag) {
              _container.append(_input);
              return;
            } else if (normalFormField) {
              _container = _container.find(".au-dialog-input-container");
            }
            _container.append(_input);

            var listeners = vr.listeners;
            if (listeners) {
              $.each(listeners, function(i, n) {
                if (i == 'load') {
                  if (listeners['reset']) {
                    listeners['reset'].apply(_input, [(_input.length > 0) ? _input[0] : _input], vr.tag.attrs, scope, window);
                  }
                  n.apply(_input, [(_input.length > 0) ? _input[0] : _input], vr.tag.attrs, scope, window);
                } else if (i != 'reset') {
                  _input.bind(i, function() {
                    n.apply(this, [this, vr.tag.attrs, scope, window]);
                  });
                }
              });
            } else {
              if (normalFormField) {
                _input.bind('blur', function() {
                  scope._validateContent(this);
                });
              }
            }

            if (vr.items) {
              var layout = vr.layout || {};

              switch (layout.name) {
                case "column":
                  var table = $("<table width='100%' border='0'  class='" + (layout.class || "") + "' style='" + (layout.style || "") + "' cellpadding='" + (layout.cellpadding || 0) + "' cellspacing='" + (layout.cellspacing || 0) + "'/>");

                  _input.append(table);

                  var columnWidth = 0,
                    tr = null,
                    td = null,
                    columns = 0,
                    skip = 0;
                  $.each(vr.items, function(i, n) {
                    if ((n.tag && n.tag.attrs && n.tag.attrs.type == "hidden")) {
                      td = _input;
                      skip++;
                    } else {
                      if (columnWidth >= 1) {
                        columnWidth = 0;
                        columns = columns ? columns : i;
                        tr = null;
                      }
                      if (!tr) {
                        tr = $("<tr/>");
                        table.append(tr);
                      }

                      var w = n.columnWidth;
                      td = $("<td/>");

                      if (w) {
                        td.attr({
                          width: w * 100 + '%'
                        });
                        columnWidth += w;
                      } else {
                        columnWidth = !columns || (i - skip + 1) % columns == 0 ? 1 : 0;
                      }
                      tr.append(td);
                    }
                    scope._createDomInContent(td, n, ats);
                  });
                  break;
                default:
                  $.each(vr.items, function(i, n) {
                    scope._createDomInContent(_input, n, ats);
                  });
              }

            }
            var proxy = vr.proxy;
            if (proxy) {
              if (vr.autoLoad) {
                var read = proxy.read;
                var config = $.extend({
                  self: _input
                }, read, true);

                this._loadData(config);
              }
            }

            var buttons = vr.buttons;
            if (buttons) {
              for (var i = 0, len = buttons.length; i < len; i++) {
                var b = buttons[i],
                  button = null,
                  method = null;
                switch (b) {
                  case 'update':
                    button = '<input type="button" value="UPDATE" class="au-dialog-button au-dialog-button-update"/>';
                    method = "POST";
                    break;
                  case 'read':
                    button = '<input type="button" value="READ" class="au-dialog-button au-dialog-button-read"/>';
                    method = "GET";
                    break;
                  case 'destory':
                    button = '<input type="button" value="DESTORY" class="au-dialog-button au-dialog-button-destory"/>';
                    method = "DELETE";
                    break;
                  case 'create':
                    button = '<input type="button" value="CREATE" class="au-dialog-button au-dialog-button-create"/>';
                    method = "PUT";
                  default:
                    break;
                }
                if (button) {

                  var _button = $(button);

                  var toolbar = $("<div class='au-dialog-toolbar'/>");
                  toolbar.appendTo(_input);
                  toolbar.append(_button);
                  if (proxy) {
                    var p = proxy[b];
                    _button.bind("click", function() {
                      var data = $.extend({
                        "_method": method
                      }, scope.getValues(_input), p.data);
                      var m = method;
                      if (p.restful === false) {
                        if (m == 'PUT') {
                          m = 'POST';
                        } else if (m == 'DELETE') {
                          m = 'GET';
                        }
                      }
                      p.dataType = p.dataType || "json";
                      if (p.dataType == "json" || p.dataType == "jsonp" || !data.format) {
                        data.format = 'json';
                      }
                      //Content-Type:application/x-www-form-urlencoded
                      //Content-Type:multipart/related
                      //application/json;charset=utf-8
                      $.ajax({
                        async: true,
                        type: m,
                        url: p.url,
                        contentType: p.contentType || 'application/x-www-form-urlencoded',
                        data: p.contentType == 'application/json;charset=utf-8' ? JSON.stringify(data) : data,
                        dataType: p.dataType || "json",
                        success: function(msg) {
                          if (p.callback) {
                            p.callback.call(scope, ats, msg);
                          } else {
                            if (msg.success) {
                              scope._toggleDialog(ats);
                            }
                          }
                        }
                      });

                    });

                  }
                }
              }
            }

          } catch (e) {
            //
          }
        },

        getValues: function(dom) {
          var values = {};
          if (dom) {
            $.each(dom.find("input,select,textarea"), function(i, n) {
              if (n.type != 'button') {
                if (n.id || n.name) {
                  var value = null;
                  try {
                    switch ($(n).attr("xtype")) {
                      case "number":
                        value = new Number($(n).val());
                        break;
                      default:
                        value = $(n).val();
                        break;
                    }
                  } catch (e) {}
                  values[n.id || n.name] = value;
                }
              }
            });
          }
          return values;
        },
        //TODO 整合下面的select选项
        _loadData: (function() {
          var setValues = function(scope, data, config) {
            if (data.success) {
              var d = (config.root) ? data[config.root] : data;
              var self = $(config.self);
              for (var i in d) {
                if (i != 'success') {
                  var id = (config.mapping && config.mapping[i]) ? config.mapping[i] : i;
                  scope._setDomValue(self.find("#" + id + ",[name='" + id + "']"), id, d[i]);
                }
              }
            }
          };
          return function(config) {
            var scope = this;
            if (config.local) {
              setValues(scope, config.data, config);
            } else if (config.url) {
              $.ajax({
                type: "GET",
                crossDomain: true,
                url: config.url,
                data: config.data,
                dataType: config.dataType || "json",
                success: function(msg) {
                  setValues(scope, msg, config);
                  if (config.callback) {
                    config.callback.call(config.scope || scope, config.args, msg);
                  }
                }
              });
            }
          };
        })(),

        _setDomValue: function(field, id, value) {
          try {
            var _input = field;
            if (_input.is("select") || (id && (_input = $("#" + id)).is("select"))) {
              $.each(_input.children(), function(i, n) {
                var nd = $(n);
                if (nd.val() == value) {
                  nd.attr("selected", "selected");
                  // return false;
                } else {
                  nd.removeAttr("selected");
                }
              });
            } else {
              _input = field;
              value = (value) ? value : '';
              _input.val(value);
            }
          } catch (e) {
            //
          }
        },

        _compileRegExp: function(pattern, attributes) {
          return eval('/' + pattern + '/' + attributes);
        },

        _getElementValue: function(_se, vd) {
          var result = '';
          var vs = vd.tag.attrs.vs;
          if (_se && vs != undefined && vs != null) {
            var vsarray = vs.split(' ');
            for (var index in vsarray) {
              var str = vsarray[index];

              if (str == 'style') {
                result = _se.getAttribute(str);
                (result && result != '') || ((result = _se.$[str]) && (result = (result instanceof CSSStyleDeclaration) ? result.cssText : result));
                (result && result != '') || (result = vd.tag.attrs.value);
              } else if (str.indexOf('.') == -1) {
                result = _se.getAttribute(str);
                (result && result != '') || (result = _se.$[str]);
                (result && result != '') || (result = vd.tag.attrs.value);
              } else if (str.indexOf('style.') == 0) {
                result = _se.$.style[str.split('.')[1]];
                (result && result != '') || (result = vd.tag.attrs.value);
              } else if (str.indexOf('event.') == 0) {
                var en = str.split('.')[1];
                var ena = (en.indexOf('on') == 0) ? en : 'on' + en;

                result = _se.getAttribute(ena);
                (result && result != '') || (result = _se.getAttribute('data-cke-pa-' + ena));
                // result = (result) ? result : _se.$[ena];
                // result = (result) ? result : _se.$[ena];
                (result && result != '') || (result = vd.tag.attrs.value);
                result && result.indexOf('(') == 0 && result.indexOf(')(this)') != -1 && (result = result.substring(1, result.length - 7));
              }
              if (result && result != '') {
                break;
              }
            }
          }
          var unit = vd.tag.attrs.unit;
          if (unit && unit != '' && result && result != '') {
            result = result.replace(this._compileRegExp('([0-9]+)\\s*(' + unit + ')\\s*;*\\s*$', 'gim'), '$1');
          }

          return (result) ? result : '';
          // result.replace(/px\b/g,'')
        },

        _setElementValue: function(_se, vd, flag) {
          var vs = (vd.vs || (flag ? '' : $(vd).attr('vs')));
          var unit = (vd.unit || (flag ? '' : $(vd).attr('unit')));
          if (_se && vs != undefined && vs != null) {
            var value = (vd.value || (flag ? '' : $(vd).val()));
            (unit && value && value != '') && (value = value + unit);
            var vsarray = vs.split(' ');
            for (var index in vsarray) {
              var str = vsarray[index];
              if (str.indexOf('.') == -1) {
                _se.setAttribute(str, value);
                _se.$[str] = value;
              } else if (str.indexOf('style.') == 0) {
                _se.$.style[str.split('.')[1]] = value;
              } else if (vs.indexOf('event.') == 0) {
                // eval('('+vd.value+')')
                // $(_se.$).unbind(vs.split('.')[1])
                // .bind(vs.split('.')[1],function(){console.log(this)});
                var en = str.split('.')[1];
                var ena = (en.indexOf('on') == 0) ? en : 'on' + en;
                _se.setAttribute(ena, '(' + value + ')(this)');
                // _se.$[ena] = vd.value;
              }
            }
          }
        },
        _loadOptionsOfSelection: function(config) {

          var appendOption = function(selection, data) {
            selection.empty();
            (data) && ($.each(data, function(i, n) {
              selection.append("<option value=\"" + ((!n && n != '') ? n : (n.value || n.name || n)) + "\">" + (!n && n != '' ? i : (n.name || (isNaN(i) ? i : n))) + "</option>");
            }));
          };
          var selectOption = function(porperties, selection, attrs) {
            attrs && (attrs.value != null) && (porperties._setDomValue(selection, attrs.id, attrs.value));
          };
          var scope = this;
          if (config.local) {
            appendOption(scope, config.data);
            selectOption(config.args[0], scope, config.args[1]);
          } else if (config.url) {
            $.ajax({
              type: "GET",
              url: config.url,
              data: config.data,
              dataType: "json",
              success: function(msg) {
                if (msg) {
                  appendOption(scope, msg);
                  selectOption(config.args[0], scope, config.args[1]);
                }
                if (config.callback) {
                  config.callback.call(config.scope || scope, config.args, msg);
                }
              }
            });
          }
        },
        _ajax: function(config) {},
        _validateContent: function(vd) {
          // 验证数据格式
          try {
            var form = $(vd).parents("form");
            var isError = form.validationEngine('validate');
            // if (isError != undefined && isError != null &&
            // isError ==
            // false) {
            form.submit();
            // }
          } catch (e) {
            //
          }
        },
        _initDomInDialog: function(v, attrs) {
          if (attrs.html) {
            v.append($(attrs.html));
            return;
          }

          if (attrs.contentEl) {
            v.append($(attrs.contentEl).children());
            return;
          }

          if (attrs.items && attrs.items.length > 0) {
            var _fieldset = this._createContentInDialog(v, attrs.title);

            var desc = {};
            $.extend(true, desc, attrs);
            this._createDomInContent(_fieldset, desc, attrs);
            return;
          }
        },
        _getContainerSize: function(attrs) {
          var container = attrs.container;
          var width = 0,
            height = 0;

          if (container[0] == $("body")[0]) {
            width = Math.max($(window).width(), $("body").width());
            height = Math.max($(window).height(), $("body").height());
          } else {
            width = $(container).width();
            height = $(container).height();
          }

          return {
            width: width,
            height: height
          };
        },
        _resizeShadow: function(attrs, s) {

          var size = this._getContainerSize(attrs);
          var width = size.width;
          var height = size.height;

          var w = s.width(),
            h = s.height();
          if (w < width) {
            s.css({
              "width": width + "px"
            });
          }
          if (h < height) {
            s.css({
              "height": height + "px"
            });
          }
        },
        _toggleShadow: function(attrs) {
          var w = $("#dialog-shadow");
          if (w.hasClass("au-dialog-shadow")) {
            if (w.is(":hidden")) {
              this._resizeShadow(attrs, w);
              w.show();
              if (attrs.blur) {
                $("body").children().not(".au-dialog-shadow,.au-dialog-panel,script,style,link").addClass("au-dialog-blur");
              }
            } else {
              w.hide();
              if (attrs.blur) {
                $("body").children().not(".au-dialog-shadow,.au-dialog-panel,script,style,link").removeClass("au-dialog-blur");
              }
            }
          } else {
            w = $("<div id='dialog-shadow' class='au-dialog-shadow' style='z-index: " + (zIndex - 1) + ";'></div>");
            w.appendTo("body");

            this._resizeShadow(attrs, w);
            w.fadeTo(0, 0.49);
            if (attrs.blur) {
              $("body").children().not(".au-dialog-shadow,.au-dialog-panel,script,style,link").addClass("au-dialog-blur");
            }
          }
          return w;
        },
        _resizeDialog: function(w, attrs) {
          var padding = 15;

          var offsetLeft = attrs.offset ? (attrs.offset.left || 0) : 0,
            offsetTop = attrs.offset ? (attrs.offset.top || 0) : 0;

          var windowWidth = $(window).width();
          var windowHeight = $(window).height();
          var size = this._getContainerSize(attrs);
          var containerWidth = size.width,
            containerHeight = size.height;
          var scale = {};

          if (windowWidth < 768) {
            scale.width = 0.9;
            scale.height = 0.9;
          } else if (windowWidth < 992) {
            scale.width = 0.92;
            scale.height = 0.92;
          } else if (windowWidth < 1200) {
            scale.width = 0.88;
            scale.height = 0.88;
          } else {
            scale.width = 0.8;
            scale.height = 0.68;
          }

          if (typeof attrs.width === "string") {
            scale.width = parseFloat(attrs.width);
            attrs.width = null;
          }

          if (typeof attrs.height === "string") {
            scale.height = parseFloat(attrs.height);
            attrs.height = null;
          }

          if (!attrs.width) {
            attrs.width = containerWidth * scale.width;
          }

          if (!attrs.height) {
            attrs.height = containerHeight * scale.height;
          }

          if (attrs.width > containerWidth - 2 * padding) {
            attrs.width = containerWidth - 2 * padding;
          }

          if (attrs.height > containerHeight - 2 * padding) {
            attrs.height = containerHeight - 2 * padding;
          }

          var marginleft = containerWidth - attrs.width - 2 * padding;
          var margintop = containerHeight - attrs.height - 2 * padding;

          w.css({
            "width": (attrs.width + 2 * padding) + "px",
            "height": (attrs.height + 2 * padding) + "px",
            left: marginleft / 2 - offsetLeft + "px",
            top: margintop / 2 - offsetTop + "px"
          });

          var c = w.find(".au-dialog-close"),
            v = w.find(".au-dialog-view"),
            l = v.find('.au-dialog-view-layout'),
            f = l.find("iframe");
          c.css({
            right: "0px",
            top: "0px",
            width: "30px",
            height: "30px"
          });
          v.css({
            "width": attrs.width + "px",
            "height": attrs.height + "px",
            left: padding + "px",
            top: padding + "px"
          });
          //解决iframe高度问题 15的滚动条
          f.css({
            "width": attrs.width - 16 + "px",
            "height": attrs.height - 22 + "px"
          });
        },
        _getMaxLevel: function() {
          var level = 0;
          $(".au-dialog-panel").each(function(i, v, n) {
            var l = $(v).attr("level") * 1;
            level = Math.max(level, l);
          });
          return level;
        },
        _getDialogElementByLevel: function(level) {
          if (level == null) {
            level = this._getMaxLevel();
          }
          return $("#window-" + level);
        },
        _toggleDialog: function(attrs) {
          var level = attrs.level;
          if (level == null) {
            level = this._getMaxLevel();
          }

          var scope = this;
          if (!attrs.model) {
            this._toggleShadow(attrs);
          }
          var w = $("#window-" + level),
            initial = w.attr("initial");
          if (w.hasClass("au-dialog-panel") && initial == "true") {
            var l = w.find('.au-dialog-view-layout');
            if (w.is(":hidden")) {
              // 更改dialog内容
              if (attrs.destory) {
                l.empty();
                this._initDomInDialog(l, attrs);
              }

              //render listener
              attrs.render && attrs.render.call(scope, w, l, attrs);

              this._resizeDialog(w, attrs);

              //show listener after layout
              w.show(400, 'swing', function() {
                attrs.show && attrs.show.call(scope, w, l, attrs);
              });
            } else {
              w.find("em[role='scroll-top']").hide();

              attrs.beforeClose && attrs.beforeClose.call(scope, w, l, attrs);

              //close listener
              w.hide(400, 'swing', function() {
                attrs.close && attrs.close.call(scope, w, l, attrs);
              });
            }
          } else {
            var c = null,
              v = null,
              l = null,
              e = null;
            if (initial != "false") {
              w = $("<div id='window-" + level + "' level='" + level + "' class='au-dialog-panel' style='z-index : " + (zIndex + level * 10) + ";' initial='true'></div>");
              c = $("<div class='au-dialog-close' style='z-index : " + (zIndex + level * 10 + 9) + ";'></div>");
              v = $("<div class='au-dialog-view' style='z-index : " + (zIndex + level * 10 + 1) + ";'></div>");
              l = $("<div class='au-dialog-view-layout'></div>");
              e = $("<em class='au-dialog-scroll-top' role='scroll-top' style='z-index : " + (zIndex + level * 10 + 9) + ";'><i class='glyphicon '></i></em>"); //glyphicon-eject

              w.appendTo(attrs.container);
              w.append(v);
              v.append(l);
              w.append(c);
              w.append(e);
            } else {
              c = w.find(".au-dialog-close");
              v = w.find(".au-dialog-view");
              l = w.find(".au-dialog-view-layout");
              e = w.find(".au-dialog-scroll-top");
              w.attr("initial", "true");
              w.appendTo(attrs.container);
              w.show();
            }
            if (attrs.destory) {
              this._initDomInDialog(l, attrs);
            }

            //render listener
            attrs.render && attrs.render.call(scope, w, l, attrs);

            v.mCustomScrollbar({
              theme: "minimal-dark",
              callbacks: {
                whileScrolling: function() {
                  var scrollTop = this.mcs.draggerTop;
                  if (scrollTop <= 8) {
                    e.hide();
                  } else {
                    e.fadeTo("slow", 0.5);
                  }
                }
              }
            });
            e.click(function() {
              v.mCustomScrollbar("scrollTo", 0);
            });

            this._resizeDialog(w, attrs);

            c.click(function() {
              scope._toggleDialog(attrs);
            });

            //show listener after layout
            attrs.show && attrs.show.call(scope, w, l, attrs);

          }
          return this;
        }
      };
    }();

    $.fn.licoDialog = function(opts) {
      if (this == $) {
        opts = $.extend({}, licoDialog.defaults, opts || {});
        if (typeof opts.container === 'string') {
          opts.container = $(opts.container);
        }
      } else {
        opts = $.extend({}, licoDialog.defaults, {
          container: this
        }, opts || {});
      }

      return (function() {
        return licoDialog._toggleDialog.apply(licoDialog, arguments);
      })(opts);
    };

    $.fn.licoDialog.isMasking = function() {
      var masking = false;
      $(".au-dialog-panel").each(function() {
        if (!$(this).is(":hidden")) {
          masking = true;
          return false;
        }
      });
      return masking;
    };

    $.licoDialog = $.fn.licoDialog;
  }
})(jQuery);
