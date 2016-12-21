angular.module('com.ctrip.tars.component.angular.iButton', [])
  .directive('iButton', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      scope: {
        iContent: '@'
      },
      // FIXME: find a better way to assign style
      template: [
        '<button type="button" class="btn btn-filter i-button">',
        '<span class="redspot"> {{ iContent }} </span>',
        '<ng-transclude></ng-transclude>',
        '</button>'
      ].join(""),
      link: function(scope, el, attrs) {
        var iContent = scope.iContent,
          MAX_CONTENT_LENGTH = 4;

        scope.spotText = '?';

        scope.$watch('iContent', function(newVal) {
          if (!newVal) {
            scope.spotText = '?';
          } else if (newVal.toString().length > MAX_CONTENT_LENGTH) {
            scope.spotText = '...';
          } else {
            scope.spotText = newVal;
          }
        });
      }
    };
  })
  .directive('exclusiveBtnGroup', function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {},
      template: [
        '<div class="btn-group btn-group-lg box-title box non-full flat-card" ng-transclude>',
        '</div>'
      ].join(""),
      link: function(scope, el, attrs) {
        scope.lastActiveBtn = $();

        // register click on btn group, to make btn exclusive active
        el.on('click', 'button', function() {
          var $this = $(this);

          if ($this.hasClass('active')) {
            $this.removeClass('active');
          } else {
            scope.lastActiveBtn.removeClass('active');
            $this.addClass('active');
          }

          scope.lastActiveBtn = $this;
        });
      }
    };
  });

