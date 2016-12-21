(function($) {
  if (!$.fn.licoLoading) {
    var licoLoading = function() {
      return {
        version: '0.1.2',
        defaults: {
          container: 'body',
          cls: 'cls-0',
          desc: 'Loading'
        },
        _resizeShadow: function(s) {
          var size = this._getContainerSize();;

          s.css({
            "width": size.width + "px",
            "height": size.height + "px"
          });
        },
        _toggleShadow: function(w, flag) {
          var container = this.options.container;
          var hidden = w.is(":hidden");

          if (hidden && (flag === true || flag == null)) {
            this._resizeShadow(w);
            w.show();
            //$(container).children().not(".au-loading,script,style,link").addClass("au-loading-blur");
          } else if (!hidden && (flag === false || flag == null)) {
            w.hide();
            //$(container).children().not(".au-loading,script,style,link").removeClass("au-loading-blur");
          }

          return w;
        },
        _getContainerSize: function() {
          var container = this.options.container;
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
        _resizeLoading: function(w) {
          //解决padding，margin问题
          var size = this._getContainerSize();;
          w.css({
            "width": size.width + "px",
            "height": size.height + "px"
          });
        },

        _initLoading: function(w) {

          var attrs = this.options;
          var v = w.find('.title').find(".name");

          if (attrs.title && v.html() !== attrs.title) {
            v.html(attrs.title);
          }

          v = w.find('.desc').find(".text");
          if (attrs.desc && v.html() !== attrs.desc) {
            v.html(attrs.desc);
          }

          l = w.find('.cls');
          if (attrs.cls && !l.hasClass(attrs.cls)) {
            l.attr('class', 'cls');
            l.empty();

            l.addClass(attrs.cls);
            if (attrs.cls == 'cls-1') {
              for (var i = 1; i < 7; i++) {
                l.append('<div class="vague vague' + i + '"/>');
              }
            } else if (attrs.cls == 'cls-7') {
              l.append('<div class="boule"/>');
            } else if (attrs.cls == 'cls-9') {
              l.append('<div class="round"/>');
            } else if (attrs.cls == 'cls-10') {
              l.append('<div class="process"/>');
            }
          }

        },
        _toggleLoading: function(flag) {
          var container = $(this.options.container);

          var w = container.children(".au-loading");
          if (w.length > 0) {
            var hidden = w.is(":hidden");

            this._initLoading(w);

            if (hidden && (flag === true || flag == null)) {
              this._resizeLoading(w);

              this._toggleShadow(w.find(".shadow"), true);
              w.show();
            } else if (!hidden && (flag === false || flag == null)) {
              this._toggleShadow(w.find(".shadow"), false);
              w.hide();
            }
          } else {
            var position = this.options.position;
            if (!position) {
              position = container.css("position");
              switch (position) {
                case '':
                case 'static':
                  position = "relative";
                  break;
                default:
                  break;
              }
            }

            w = $("<div class='au-loading' style='display:none; position:" + position + "'></div>");
            var c = $("<div class='shadow' style='display:none'></div>");
            var v = $('<div class="content">' +
              '<div class="cls"/>' +
              '<div class="title"><span class="logo"></span><span class="name"></span></div>' +
              '<div class="desc"><span class="text"/><span class="point"/></div>' +
              '</div>');

            w.append(c);
            w.append(v);
            w.appendTo(container);
            this._toggleLoading(true);
          }
          return this;
        },
        hide: function() {
          this._toggleLoading(false);
        },
        show: function(opts) {
          this.options = $.extend({}, this.options, opts || {});
          this._toggleLoading(true);
        }
      };
    }();
    $.fn.licoLoading = function(opts) {

      if (this == $) {
        opts = $.extend({}, licoLoading.defaults, opts || {});
        if (typeof opts.container === 'string') {
          opts.container = $(opts.container);
        }
      } else {
        opts = $.extend({}, licoLoading.defaults, {
          container: this,
          title: this.attr("data-title"),
          desc: this.attr("data-desc"),
          cls: this.attr("data-cls"),
          position: this.attr("data-position")
        }, opts || {});
      }

      licoLoading.options = opts;
      return (function() {
        return licoLoading._toggleLoading.call(licoLoading, true);
      })(opts);
    };

    $.licoLoading = $.fn.licoLoading;
  }
})(jQuery);
