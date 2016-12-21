Class.forName({
  name: "class com.ctrip.tars.component.ISearch extends Object",

  'private keyword': null,
  'private suggest': null,

  'private keyvalue': null,

  'private options': {
    template: [],
    store: {
      data: {}
    },
    setUpBefore: function(data) {
      return data;
    },
    setUp: function(data) {
      return data;
    }
  },

  ISearch: function(selector, options) {
    this.selector = selector;
    this.options = $.extend(true, this.options, options);
  },

  initial: function() {
    this.keyword = $(this.selector + ' .global-search-keyword');
    this.suggest = $(this.selector + ' .global-search-suggest');

    var scope = this;
    this.keyword.bind('keyup', function(e) {
      scope.keywordListener(e);
    });
    // this.keyword.bind('blur', function(e){scope.hideSuggests(e);});

    this.options.getTemplate = function(template, data, opts) {
      scope.suggest.find('ul').append(template);
    };

    this.options.getTemplates = function(template, data, opts) {

      if (data.length <= 0) {
        scope.hideSuggests();
        return;
      }

      scope.showSuggests();

      // 为下拉选项绑定鼠标事件
      scope.suggest.find('li').hover(function() {
        scope.suggest.find('li').removeClass('hover');
        $(this).addClass('hover');

      }, function() {
        $(this).removeClass('hover');
      }).bind('click', function() {
        scope.setKeywordBySuggest($(this));
        scope.hideSuggests();
      });
    };
  },

  keywordListener: function(event) {

    // 键盘选择下拉项
    if (!this.suggest.is(":hidden") && (event.keyCode == 38 || event.keyCode == 40)) {
      var current = this.suggest.find('li.hover');
      if (event.keyCode == 38) {
        if (current.length > 0) {
          var prevLi = current.removeClass('hover').prev();
          if (prevLi.length > 0) {
            prevLi.addClass('hover');
            this.setKeywordBySuggest(prevLi);
          }
        } else {
          var last = this.suggest.find('li:last');
          last.addClass('hover');
          this.setKeywordBySuggest(last);
        }

      } else if (event.keyCode == 40) {
        if (current.length > 0) {
          var nextLi = current.removeClass('hover').next();
          if (nextLi.length > 0) {
            nextLi.addClass('hover');
            this.setKeywordBySuggest(nextLi);
          }
        } else {
          var first = this.suggest.find('li:first');
          first.addClass('hover');

          this.setKeywordBySuggest(first);
        }
      }

      // 输入字符
    } else {
      var valText = $.trim(this.keyword.val());
      if (valText === "" || valText === this.keyvalue) {

        if (valText === "") {
          this.keyvalue = "";
        }

        this.hideSuggests();
        return;
      }
      this.refresh(valText);

    }

  },

  refresh: function(keyword) {

    this.keyvalue = keyword;

    var ul = this.suggest.find('ul');
    ul.empty();

    this.options.store.data.search = keyword;

    $.licoTemplate(this.options);

  },
  hideSuggests: function() {
    if (!this.suggest.is(":hidden")) {
      // this.suggest.hide();

      this.suggest.animate({
        height: "0px"
      }, 1000, "swing", function() {
        $(this).hide();
      });
    }

  },

  showSuggests: function() {
    if (this.suggest.is(":hidden")) {
      // this.suggest.show();

      this.suggest.css({
        height: "0px"
      }).show().animate({
        height: "512px"
      }, 1200);

    }
  },
  'private getKeywordBySuggest': function(li) {
    return li.find(".global-search-suggest-keyword").html();
  },

  setKeywordBySuggest: function(li) {
    this.keyword.val(this.getKeywordBySuggest(li));
  }
});

