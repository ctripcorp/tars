(function($) {
  if (!$.fn.licoMsgbox) {
    var msgboxs = [];

    var licoMsgbox = function() {

      return {
        version: '0.1.3',
        defaults: {
          content: '',
          title: '提示',
          icon: 'default' //error
            //YES : 'Yes',
            //NO : 'No',
            //OK : 'OK',
            //CANCEL : 'Cancal'
        },

        createOverlay: function(options) {
          var width = Math.max($(window).width(), $("body").width());
          var height = Math.max($(window).height(), $("body").height());

          $('<div/>').css({
            "width": width + "px",
            "height": height + "px"
          }).addClass('au-msgbox au-msgbox-overlay au-msgbox-overlay-' + options.icon + ' au-msgbox-' + options.timestamp).hide().appendTo('body');
        },
        showOverlay: function(options) {
          $('.au-msgbox.au-msgbox-overlay.au-msgbox-' + options.timestamp).fadeIn();
        },
        deleteOverlay: function(options) {
          $('.au-msgbox.au-msgbox-overlay.au-msgbox-' + options.timestamp).fadeOut(function() {
            $(this).remove();
          });
        },
        createBox: function(options) {
          var icon = options.icon;
          var content = options.content;
          var title = options.title;
          var yesBtn = options.YES;
          var noBtn = options.NO;
          var okBtn = options.OK;
          var cancelBtn = options.CANCEL;
          var btns = options.buttons;

          switch (icon) {
            case 'error':
              title = "<i class='fa fa-bolt'></i>&nbsp;&nbsp;" + title;
              break;
            case 'warning':
              title = "<i class='fa fa-warning'></i>&nbsp;&nbsp;" + title;
              break;
            case 'default':
            default:
              title = "<i class='fa fa-star'></i>&nbsp;&nbsp;" + title;
              break;
          }

          var $box = $('<div/>').addClass('au-msgbox au-msgbox-box au-msgbox-box-' + icon + ' au-msgbox-' + options.timestamp).hide().appendTo('body');

          $('<h3 class="au-msgbox-box-title"/>').html(title).appendTo($box);

          $('<p class="au-msgbox-box-validate au-msgbox-box-validate-' + icon + '"/>').appendTo($box);

          $('<p class="au-msgbox-box-content au-msgbox-box-content-' + icon + '"/>').html(content).appendTo($box);

          if (options.html) {
            $box.append('<p>' + options.html + '</p>');
          }

          if (btns && btns.length > 0) {
            $.each(btns, function(i, o, bs) {
              $('<button role="msgbox" type="button" class="btn ' + (o.cls || "button-info") + '" value=' + o.value + '/>')
                .html('<i class="fa fa-' + o.icon + '"></i>&nbsp;&nbsp;&nbsp;&nbsp;' + o.text).appendTo($box);
            });
          }

          if (cancelBtn) { //button-cancel
            $('<button role="msgbox" type="button" class="btn btn-default" value=0/>').html('<i class="fa fa-arrow-circle-left"></i>&nbsp;&nbsp;&nbsp;&nbsp;' + cancelBtn).appendTo($box);
          }

          if (noBtn) {
            $('<button role="msgbox" type="button" class="btn button-no" value=0/>').html('<i class="fa fa-times-circle"></i>&nbsp;&nbsp;&nbsp;&nbsp;' + noBtn).appendTo($box);
          }

          if (okBtn) { //button-ok
            $('<button role="msgbox" type="button" class="btn btn-warning" value=1/>').html('<i class="fa fa-arrow-circle-right"></i>&nbsp;&nbsp;&nbsp;&nbsp;' + okBtn).appendTo($box);
          }

          if (yesBtn) {
            $('<button role="msgbox" type="button" class="btn button-yes" value=1/>').html('<i class="fa fa-check-circle"></i>&nbsp;&nbsp;&nbsp;&nbsp;' + yesBtn).appendTo($box);
          }

          /*
		  $('.au-msgbox.au-msgbox-box.au-msgbox-' + options.timestamp + ' button').on('keydown', function(e) {
			if (e.which === 9 || e.which === 39 || e.which === 37) { //Tab key
			  e.preventDefault();
			}
		  });
		  */
        },
        showBox: function(options) {
          $('.au-msgbox.au-msgbox-box.au-msgbox-' + options.timestamp).fadeIn(function() {
            $(this).children('button').eq(1).focus();
          });
        },

        deleteBox: function(options) {
          $('.au-msgbox.au-msgbox-box.au-msgbox-' + options.timestamp).fadeOut(function() {
            $(this).remove();
          });
        },

        attachHandlers: function(options) {
          var icon = options.icon,
            scope = this;
          $('.au-msgbox.au-msgbox-' + options.timestamp + ' button').on('click', function() {

            var disabled = $(this).attr("disabled");
            if (disabled === "disabled" || disabled === 'true' || disabled == true || $(this).hasClass("disabled")) {
              return;
            }

            $(this).attr("disabled", "disabled").addClass("disabled");

            var value = $(this).val(),
              msgbox = $('.au-msgbox.au-msgbox-' + options.timestamp);

            if (options.validate) {
              var result = options.validate.call(options, value, msgbox);

              if (!result.success) {
                msgbox.find('.au-msgbox-box-validate').html(result.msg);
                return;
              }
            }

            var flag = null;
            if (options.handler) {
              flag = options.handler.call(options, value, msgbox);
            }

            if (flag !== false) {
              scope.deleteOverlay(options);
              scope.deleteBox(options);
            } else {
              $(this).attributeName("disabled").removeClass("disabled");
            }

            //Call the handler function. the TRUE parameter indicates that the user pressed the YES button
          });
        },

        show: function(options) {
          options.timestamp = (new Date().getTime() + Math.random()).toString(16).replace(/[.]/g, "");
          msgboxs.push(options);
          this.createOverlay(options);
          this.showOverlay(options);
          this.createBox(options);
          this.showBox(options);
          this.attachHandlers(options);
          return this;
        }
      };
    }();

    (function() {
      $(document).on('keydown.confirmon.close', function(e) {
        if (msgboxs.length > 0) {
          if (e.which === 27 || e.which === 13) { //Esc key // Enter key
            var options = msgboxs.pop();
            licoMsgbox.deleteOverlay(options);
            licoMsgbox.deleteBox(options);
            if (options.handler) {
              options.handler.call(options, e.which === 13 ? '1' : '0');
            }
          } else if (e.which === 9 || e.which === 39 || e.which === 37) { //Tab key
            var options = msgboxs[msgboxs.length - 1];
            var forcus = $('.au-msgbox.au-msgbox-box.au-msgbox-' + options.timestamp + ' button:focus');

            var neighbor = e.which === 37 ? forcus.prev('button') : $(this).next('button');

            if (neighbor.length > 0) {
              neighbor.focus();
            } else {
              $('.au-msgbox.au-msgbox-box.au-msgbox-' + options.timestamp + ' button').first().focus();
            }
          }
        }
        //e.preventDefault();
        //$(document).off('keydown.confirmon.close');
      });
    })();

    $.fn.licoMsgbox = function(opts) {
      var opts = $.extend({}, licoMsgbox.defaults, opts || {});
      return (function() {
        return licoMsgbox.show.apply(licoMsgbox, arguments);
      })(opts);
    };

    $.fn.licoMsgbox.isMasking = function() {
      var masking = false;
      $(".au-msgbox").each(function() {
        if (!$(this).is(":hidden")) {
          masking = true;
          return false;
        }
      });
      return masking;
    };

    $.licoMsgbox = $.fn.licoMsgbox;
  }
})(jQuery);
