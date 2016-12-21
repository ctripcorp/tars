Class.forName({
  name: "class com.ctrip.tars.component.IScroll extends Object",

  '@Setter @Getter private scroller': null,

  'private downButton': null,
  'private dlabel': null,
  'private dnum': 0,
  'private upButton': null,
  'private ulabel': null,
  'private unum': 0,
  'private state': 0, // 加载状态
  // 0默认，1显示加载状态，2执行加载数据，只有当为0时才能再次加载，这是防止过快拉动刷新
  'private top': null,
  '@Setter @Getter private options': {
    top: 0,
    bottom: 0,
    innerHeight: 0,
    sensitive: {
      top: -8,
      bottom: 0,
      fade: 8,
      animate: 0
    }
  },

  'private downButtonTemplate': ['<div class="down container-fluid">', '<div class="row">', '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">', '<div class="spinner pull-right">',
    '<div class="spinner-container container-1">', '<div class="circle-1"></div>', '<div class="circle-2"></div>', '<div class="circle-3"></div>',
    '<div class="circle-4"></div>', '</div>', '<div class="spinner-container container-2">', '<div class="circle-1"></div>', '<div class="circle-2"></div>',
    '<div class="circle-3"></div>', '<div class="circle-4"></div>', '</div>', '<div class="spinner-container container-3">', '<div class="circle-1"></div>',
    '<div class="circle-2"></div>', '<div class="circle-3"></div>', '<div class="circle-4"></div>', '</div>', '</div>', '</div>',
    '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">', '<div class="label">&nbsp;</div>', '</div>', '</div>', '</div>'
  ],

  'private upButtonTemplate': ['<div class="up container-fluid">', '<div class="row">', '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">', '<div class="spinner pull-right">',
    '<div class="spinner-container container-1">', '<div class="circle-1"></div>', '<div class="circle-2"></div>', '<div class="circle-3"></div>',
    '<div class="circle-4"></div>', '</div>', '<div class="spinner-container container-2">', '<div class="circle-1"></div>', '<div class="circle-2"></div>',
    '<div class="circle-3"></div>', '<div class="circle-4"></div>', '</div>', '<div class="spinner-container container-3">', '<div class="circle-1"></div>',
    '<div class="circle-2"></div>', '<div class="circle-3"></div>', '<div class="circle-4"></div>', '</div>', '</div>', '</div>',
    '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">', '<div class="label">&nbsp;</div>', '</div>', '</div>', '</div>'
  ],
  'private topButtonTemplate': ['<div class="pull-right img-circle action-button action-button-40 purple" role="scroll-top"', 'style="position: absolute; bottom: 8px; right: 8px;color:#fff;">',
    '<i class="fa fa-arrow-up"></i>', '</div>'
  ],

  'private nextButtonTemplate': ['<div class="pull-right img-circle action-button action-button-40 purple" role="next-page"', 'style="position: absolute; bottom: 8px; right: 104px;color:#fff;">',
    '<i class="fa fa-arrow-down"></i>', '</div>'
  ],
  'private reloadButtonTemplate': ['<div class="pull-right img-circle action-button action-button-40 purple" role="reload-data"', 'style="position: absolute; bottom: 8px; right: 56px;color:#fff;">',
    '<i class="fa fa-refresh"></i>', '</div>'
  ],


  IScroll: function(selector, options, pullUpAction, pullDownAction) {
    this.selector = selector;
    this.pullUpAction = pullUpAction;
    this.pullDownAction = pullDownAction;
    $.extend(true, this.options, options);
  },

  initial: function() {

    var scope = this,
      selector = this.selector;

    var iscroll = $(selector).find('.iscroll-scroller');

    scope.downButton = $(scope.downButtonTemplate.join(""));
    scope.downButton.prependTo(iscroll);
    scope.dlabel = scope.downButton.find('.label');
    scope.downButton['class'] = scope.downButton.attr('class');
    scope.downButton.attr('class', '').hide();

    scope.upButton = $(scope.upButtonTemplate.join(""));
    scope.upButton.appendTo(iscroll);
    scope.ulabel = scope.upButton.find('.label');
    scope.upButton['class'] = scope.upButton.attr('class');
    scope.upButton.attr('class', '').hide();

    $(iscroll).wrap("<div class=\"iscroll-wapper\"/>");
    var wapper = $(selector).children('.iscroll-wapper');

    scope.topButton = $(scope.topButtonTemplate.join(""));
    scope.topButton.appendTo(wapper);
    scope.topButton.hide();
    scope.topButton.on("click", function() {
      scope.scrollTop();
      //scope.scroller && scope.scroller.scrollTo(0, 0, 1000);
    });
    /*
		scope.reloadButton = $(scope.reloadButtonTemplate.join(""));
		scope.reloadButton.appendTo(wapper);
		scope.reloadButton.fadeTo(scope.options.sensitive.animate, 0.68);
		scope.reloadButton.on("click", function() {
			scope.reload();
		});

		scope.nextButton = $(scope.nextButtonTemplate.join(""));
		scope.nextButton.appendTo(wapper);
		scope.nextButton.fadeTo(scope.options.sensitive.animate, 0.68);
		scope.nextButton.on("click", function() {
			scope.next();
		});
		*/
    scope.scroller = new IScroll(wapper.get(0), {
      probeType: 2, // probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
      scrollbars: true, // 有滚动条
      mouseWheel: true, // 允许滑轮滚动
      fadeScrollbars: true, // 滚动时显示滚动条，默认影藏，并且是淡出淡入效果
      bounce: true, // 边界反弹
      interactiveScrollbars: true, // 滚动条可以拖动
      shrinkScrollbars: 'scale', // 当滚动边界之外的滚动条是由少量的收缩。'clip' or 'scale'.
      click: true, // 允许点击事件
      keyBindings: true, // 允许使用按键控制
      momentum: true, // 允许有惯性滑动
      useTransform: false,
      preventDefault: false
    });

    wapper.css({
      top: scope.options.top, // $(selector).offset().top +
      // scope.options.top,
      bottom: scope.options.bottom
    });

    // 滚动时
    scope.scroller.on('scroll', function() {
      if (scope.state === 0 && !scope.downButton.attr('class').match('flip|loading') && !scope.upButton.attr('class').match('flip|loading')) {
        if (this.y >= -scope.options.sensitive.top) {
          // 下拉刷新效果
          scope.downButton.attr('class', scope.upButton['class']);
          scope.downButton.addClass('flip');
          scope.dlabel.html('刷新.');
          scope.downButton.fadeTo(scope.options.sensitive.animate, 1);
          scope.state = 1;
        } else if (this.y <= (this.maxScrollY + scope.options.sensitive.bottom)) {
          // 上拉刷新效果
          scope.upButton.attr('class', scope.upButton['class']);
          scope.upButton.addClass('flip');
          scope.ulabel.html('更多.');
          var pos = this.maxScrollY - 32;
          scope.upButton.fadeTo(scope.options.sensitive.animate, 1, function() {
            scope.scroller.refresh();
            scope.scroller.scrollTo(0, pos, 0);
          });
          scope.state = 1;
        }
      }
    });

    // 滚动完毕
    scope.scroller.on('scrollEnd', function() {
      if (scope.state === 1) {
        if (scope.downButton.attr('class').match('flip|loading')) {

          scope.downButton.removeClass('flip').addClass('loading');
          scope.dlabel.html('正在刷新...');
          scope.state = 2;

          // setTimeout(function(){scope.pullDown();}, 1000);
          scope.pullDown();

        } else if (scope.upButton.attr('class').match('flip|loading')) {

          scope.upButton.removeClass('flip').addClass('loading');
          scope.ulabel.html('正在加载...');
          scope.state = 2;

          // setTimeout(function(){scope.pullUp();}, 1000);
          scope.pullUp();
        }
      }

      if (this.y < -scope.options.sensitive.fade) {
        scope.topButton.fadeTo(scope.options.sensitive.animate, 0.56);
      } else {
        scope.topButton.fadeOut();
      }

    });
  },

  "pullDown": function() { // 下拉事件

    var scope = this,
      pd = function() {
        scope.downButton.removeClass('loading');
        scope.dlabel.html('刷新完成.');
        scope.downButton['class'] = scope.downButton.attr('class');
        scope.downButton.attr('class', '').fadeOut();

        setTimeout(function() {
          if (scope.scroller) {
            scope.scroller.refresh();
          }
          //scope.nextButton.fadeTo(scope.options.sensitive.animate, 0.68);
          //scope.reloadButton.fadeTo(scope.options.sensitive.animate, 0.68);
        }, 1000);
        scope.state = 0;
      };

    if (scope.pullDownAction) {
      scope.pullDownAction(pd);
    } else {
      setTimeout(function() {
        pd();
      }, 1000);
    }
  },

  pullUp: function() { // 上拉事件

    var scope = this,
      pu = function(data) {
        scope.upButton.removeClass('loading');
        scope.ulabel.html((data &&
          (data.length > 0 ||
            (Object.isFunction(data.size) &&
              data.size() > 0))) ? '加载完成.' : '没有更多数据.');
        scope.upButton['class'] = scope.upButton.attr('class');
        scope.upButton.attr('class', '').fadeOut();

        setTimeout(function() {
          if (scope.scroller) {
            scope.scroller.refresh();

            var maxScrollY = scope.scroller.maxScrollY;
            var height = -scope.options.innerHeight - scope.options.bottom - scope.options.top;
            if (height && height <= maxScrollY) {
              scope.scroller.scrollTo(0, 0, 100);
            }
          }
          //scope.nextButton.fadeTo(scope.options.sensitive.animate, 0.68);
          //scope.reloadButton.fadeTo(scope.options.sensitive.animate, 0.68);
        }, 1000);
        scope.state = 0;
      };

    if (scope.pullUpAction) {
      scope.pullUpAction(pu);
    } else {
      setTimeout(function() {
        pu();
      }, 1000);
    }
  },

  'previous': function() {
    //setTimeout(function() {
    var scrollTop = this.scroller.y + (this.options.pageHeight || $(this.selector).find(".iscroll-wapper").height());
    if (this.scroller) {
      this.scroller.scrollTo(0, scrollTop > 0 ? 24 : scrollTop, 100);
    }
    //}, 1000);
  },

  'next': function() {
    // 上拉刷新效果
    //this.nextButton.hide();
    //this.reloadButton.hide();
    this.upButton.attr('class', this.upButton['class']);
    this.upButton.fadeTo(this.options.sensitive.animate, 1);
    //this.scroller.refresh();
    this.upButton.addClass('flip');
    this.ulabel.html('显示更多.');
    this.state = 1;

    var maxScrollY = this.scroller.maxScrollY;
    var scrollBottom = this.scroller.y - (this.options.pageHeight || $(this.selector).find(".iscroll-wapper").height());
    this.scroller.scrollTo(0, scrollBottom > maxScrollY ? scrollBottom : maxScrollY - 24, 100);
  },

  refresh: function() {
    this.scroller.refresh();
  },

  reload: function() {
    // 上拉刷新效果
    //this.nextButton.hide();
    //this.reloadButton.hide();
    this.downButton.attr('class', this.upButton['class']);
    this.downButton.fadeTo(this.options.sensitive.animate, 1);
    //this.scroller.refresh();
    this.downButton.addClass('flip');
    this.dlabel.html('刷新.');
    this.state = 1;

    this.scroller.scrollTo(0, this.scroller.y - 1, 100);
  },

  scrollBottom: function() {
    var maxScrollY = this.scroller.maxScrollY;
    var height = -this.options.innerHeight - this.options.bottom - this.options.top;
    if (height && height <= maxScrollY) {
      return;
    }
    this.scroller.scrollTo(0, maxScrollY, 1000);
  },

  scrollTop: function() {
    this.scroller.scrollTo(0, 0, 1000);
  },

  scrollTo: function(x, y, time) {
    this.scroller.scrollTo(
      Math.max(x, this.scroller.maxScrollX),
      Math.max(y, this.scroller.maxScrollY),
      time || 1000
    );
  },

  destroy: function() {
    this.scroller.destroy();
    this.scroller = null;
  },

  getVisibleTop: function() {
    return this.scroller.y;
  },

  getVisibleBottom: function() {
    return this.scroller.y - $(this.selector).find(".iscroll-wapper").height();
  },

  getVisibleTopEle: function() {
    var wapper = $(this.selector).find(".iscroll-wapper"),
      items = wapper.find(".iscroll-item"),
      item = null;

    if (items.length <= 0) {
      items = wapper.find("[ng-repeat]");
    }

    for (var i = 0; i < items.length; i++) {
      item = $(items.get(i));
      if (item.position().top + item.height() + this.scroller.y > 0) {
        return item;
      }
    }
    return items.length > 0 ? $(items.get(0)) : null;
  },

  getVisibleBottomEle: function() {
    var wapper = $(this.selector).find(".iscroll-wapper"),
      items = wapper.find(".iscroll-item"),
      item = null;

    if (items.length <= 0) {
      items = wapper.find("[ng-repeat]");
    }

    for (var i = items.length - 1; i >= 0; i--) {
      item = $(items.get(i));
      if (item.position().top - $(this.selector).find(".iscroll-wapper").height() + this.scroller.y <= 0) {
        return item;
      }
    }
    return items.length > 0 ? $(items.get(items.length - 1)) : null;
  }

});

