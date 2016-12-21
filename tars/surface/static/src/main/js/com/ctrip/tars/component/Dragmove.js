(function($) {

  $.fn.dragmove = function() {

    return this.each(function() {

      var $document = $(document),
        $this = $(this),
        active,
        startX,
        startY;

      $this.on('mousedown touchstart', function(e) {

        active = true;
        startX = e.originalEvent.pageX - $this.offset().left;
        startY = e.originalEvent.pageY - $this.offset().top;

        if ('mousedown' == e.type)

          click = $this;

        if ('touchstart' == e.type)

          touch = $this;

        if (window.mozInnerScreenX === null)

          return false;
      });

      $document.on('mousemove touchmove', function(e) {

        if ('mousemove' == e.type && active)

          click.offset({

          left: e.originalEvent.pageX - startX,
          top: e.originalEvent.pageY - startY

        });

        if ('touchmove' == e.type && active)

          touch.offset({

          left: e.originalEvent.pageX - startX,
          top: e.originalEvent.pageY - startY

        });

      }).on('mouseup touchend', function() {

        active = false;

      });

    });

  };

})(jQuery);

