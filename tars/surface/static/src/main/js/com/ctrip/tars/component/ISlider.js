Class.forName({
  name: "class com.ctrip.tars.component.ISlider extends Object",

  "@Getter @Setter element": null,

  ISlider: function(element, options) {
    this.options = options;
    this.element = $(element).bxSlider(this.options);
  },

  reflow: function(options) {
    if (Object.isNull(this.element)) {
      return;
    }

    var index = this.element.getCurrentSlide(),
      count = this.element.getSlideCount();

    if (index >= count || index < 0) {
      index = 0;
    }

    this.options = $.extend(true, this.options, options, {
      startSlide: index
    });

    this.element.reloadSlider(this.options);

    //this.element.goToSlide(index);
  }

});

