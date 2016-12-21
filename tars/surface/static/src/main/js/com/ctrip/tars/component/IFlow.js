Class
  .forName({
    name: "class com.ctrip.tars.component.IFlow extends Object",

    'private plumbInstance': null,

    '@Getter private options': {
      //Connector: "StateMachine",
      DragOptions: {
        cursor: "default",
        zIndex: 500
      },
      PaintStyle: { // 连线
        //strokeStyle: "#0b8284",
        //lineWidth: 3
      },
      EndpointStyle: { // 端点
        //radius: 1,
        //fillStyle: "#0b8284"
      },
      HoverPaintStyle: {
        //strokeStyle: "#0b8284"
      },
      EndpointHoverStyle: {
        //fillStyle: "#0b8284"
      },
      Container: null
    },

    IFlow: function(options, $scope, $compile) {
      this.setOptions(options);
      this.$scope = $scope;
      this.$compile = $compile;

      /*
      var palette = $(options.Palette);
      palette.mCustomScrollbar("destroy");
      palette.mCustomScrollbar({
        theme: "rounded", //"rounded-dots" "minimal-dark" "default" "rounded" "light-3"
        axis: "yx",
        mouseWheel: {
          enable: true,
          axis: "x",
          preventDefault: true
        },
        autoHideScrollbar: false,
        callbacks: {
          whileScrolling: function() {}
        }
      });
      */
    },
    setOptions: function(options) {
      $.extend(true, this.options, options);
    },
    getDefaultPlumb: function() {
      if (this.plumbInstance) {
        return this.plumbInstance;
      }
      this.plumbInstance = jsPlumb.getInstance(this.getOptions());
      return this.plumbInstance;
    },
    getPlumb: function(options) {
      return jsPlumb.getInstance(Object.extend(options || {}, this.getOptions()));
    },

    destroy: function() {
      var defaultInstance = this.getDefaultPlumb();
      defaultInstance.reset();

      var options = this.getOptions(),
        container = $(options.Container);

      container.empty();
    },

    getOverlays: function(type, status, label) {
      return [
        ["Arrow", {
          location: 1
        }, {
          foldback: 0.8,
          fillStyle: type === 'rollback' ? "#ff6d00" : (status === 'SUCCESS' ? "#0b8284" : "#e51c23"),
          width: 8
        }],
        ["Label", {
          label: label || type,
          cssClass: type + " " + (status || "").toLowerCase()
        }]
      ];
    },
    getPaintStyle: function(type, status, real) {
      return {
        strokeStyle: type === 'rollback' ? "#ff6d00" : (status === 'SUCCESS' ? "#0b8284" : "#e51c23"),
        dashstyle: type === 'rollback' && !real ? "1 1" : "3 0",
        lineWidth: 3
      };
    },
    getConnector: function() {
      return ["Flowchart", {
        stub: 49,
        gap: 0,
        cornerRadius: 8,
        alwaysRespectStubs: false,
        midpoint: 0
      }];
    },

    draw: function(data) {
      var options = this.getOptions(),
        container = $(options.Container),
        palette = $(options.Palette),
        height = palette.height() || 182;

      if (Object.isNull(data) || !Object.isArray(data) || data.length <= 0) {
        this.destroy();
        container.html(['<div style="width: 100%; text-align: center; font-size: 14px; color: #A9D9DA; ',
          'line-height: ', height, 'px; height: ', height, 'px;"><span>', "此应用尚未在这个group上进行过任何发布！", '</span></div>'
        ].join(""));
        return;
      }

      if (data.error) {
        this.destroy();
        container.html(['<div style="width: 100%; text-align: center; font-size: 14px; color: #A9D9DA; ',
          'line-height: ', height, 'px; height: ', height, 'px;"><span>', data.status, '</span></div>'
        ].join(""));
        return;
      }

      var defaultInstance = this.getDefaultPlumb();
      var $scope = this.$scope,
        $compile = this.$compile,
        $this = this;

      defaultInstance
        .doWhileSuspended(function() {
          $this.destroy();

          var i = 0,
            len = data.length,
            padding = 8,
            spacing = (100 - padding) / len,
            scope = null,
            step = null;

          scope = $scope.$new(false);
          scope.data = data[i];
          scope.data.key = i;
          step = $compile("<progress-step/>")(scope);

          if (!scope.$$phase) {
            scope.$apply();
          }

          step.css({
            right: padding + '%', //(i + 1) * 24 * 3 + 8,
            top: '32%' //(i % 2 - 1) * 24 * 2 + 80
          });
          container.append(step);
          defaultInstance.addEndpoints(step, [{
            uuid: i + "-left",
            anchor: "Left",
            maxConnections: -1,
            connector: $this.getConnector()
          }, {
            uuid: i + "-bottom",
            anchor: "Bottom",
            maxConnections: -1,
            connector: $this.getConnector()
          }]);

          scope = $scope.$new(false);
          var coordinate = $compile("<coordinate/>")(scope);
          container.append(coordinate);

          var position = step.position();
          position.top = position.top - step.height() - coordinate.height() - 8;
          position.left = position.left + step.width() / 2 - coordinate.height() / 2 + 4;
          coordinate.css(position).show();

          var rollback = data[i].rollback;
          var onlink = false;
          if (Object.isNull(rollback)) {
            //不存在rollback

            //画rollback的rollback
            scope = $scope.$new(false);
            scope.data = {
              key: 'hide'
            };
            step = $compile("<progress-hide/>")(scope);

            if (!scope.$$phase) {
              scope.$apply();
            }

            step.css({
              top: '70%'
            });
            container.append(step);
            defaultInstance.addEndpoint(step, {
              uuid: len + "-rollback-right",
              anchor: "Right",
              maxConnections: -1,
              connector: $this.getConnector()
            });

            defaultInstance.connect({
              uuids: [i + "-bottom", len + "-rollback-right"],
              overlays: $this.getOverlays('rollback', null, "之前不存在正确的版本，无法回退。"),
              paintStyle: $this.getPaintStyle('rollback', null)
            });

          } else if (rollback.index > -1 && rollback.index < len) {
            //存在progress链上
            onlink = true;
          } else {
            //超出链

            //画rollback
            scope = $scope.$new(false);
            scope.data = rollback;
            scope.data.key = -1;
            step = $compile("<progress-step/>")(scope);

            if (!scope.$$phase) {
              scope.$apply();
            }

            step.css({
              right: '50%',
              top: '70%'
            });
            container.append(step);
            defaultInstance.addEndpoints(step, [{
              uuid: i + "-rollback-left",
              anchor: "Left",
              maxConnections: -1,
              connector: $this.getConnector()
            }, {
              uuid: i + "-rollback-right",
              anchor: "Right",
              maxConnections: -1,
              connector: $this.getConnector()
            }]);
            defaultInstance.connect({
              uuids: [i + "-bottom", i + "-rollback-right"],
              overlays: $this.getOverlays("rollback"),
              paintStyle: $this.getPaintStyle("rollback")
            });

            //画rollback的rollback
            scope = $scope.$new(false);
            step = $compile("<progress-hide/>")(scope);

            if (!scope.$$phase) {
              scope.$apply();
            }

            step.css({
              top: '70%'
            });
            container.append(step);
            defaultInstance.addEndpoint(step, {
              uuid: len + "-rollback-right",
              anchor: "Right",
              maxConnections: -1,
              connector: $this.getConnector()
            });

            defaultInstance.connect({
              uuids: [i + "-rollback-left", len + "-rollback-right"],
              overlays: $this.getOverlays("rollback"),
              paintStyle: $this.getPaintStyle("rollback")
            });
          }

          for (i = 1; i < len; i++) {
            scope = $scope.$new(false);
            scope.data = data[i];
            scope.data.key = i;
            step = $compile("<progress-step/>")(scope);

            if (!scope.$$phase) {
              scope.$apply();
            }

            step.css({
              right: padding + i * spacing + '%', //(i + 1) * 24 * 3 + 8,
              top: '32%' //(i % 2 - 1) * 24 * 2 + 80
            });
            container.append(step);
            defaultInstance.addEndpoints(step, [{
              uuid: i + "-left",
              anchor: "Left",
              maxConnections: -1,
              connector: $this.getConnector()
            }, {
              uuid: i + "-right",
              anchor: "Right",
              maxConnections: -1,
              connector: $this.getConnector()
            }]);

            defaultInstance.connect({
              uuids: [i + "-right", (i - 1) + "-left"],
              overlays: $this.getOverlays(data[i - 1].flavor, data[i - 1].status, data[i - 1].flavor),
              paintStyle: $this.getPaintStyle(data[i - 1].flavor, data[i - 1].status, true)
            });

            if (onlink && rollback.index === i) {
              defaultInstance.addEndpoints(step, [{
                uuid: i + "-bottom",
                anchor: "Bottom",
                maxConnections: -1,
                connector: $this.getConnector()
              }]);
              defaultInstance.connect({
                uuids: [0 + "-bottom", i + "-bottom"],
                overlays: $this.getOverlays("rollback"),
                paintStyle: $this.getPaintStyle("rollback")
              });
            }

          }

          scope = $scope.$new(false);
          step = $compile("<progress-hide/>")(scope);
          step.css({
            top: '32%'
          });

          if (!scope.$$phase) {
            scope.$apply();
          }

          container.append(step);
          defaultInstance.addEndpoint(step, {
            uuid: len + "-right",
            anchor: "Right",
            maxConnections: -1,
            connector: $this.getConnector()
          });

          defaultInstance.connect({
            uuids: [len + "-right", (len - 1) + "-left"],
            overlays: $this.getOverlays(data[len - 1].flavor, data[len - 1].status, "......"),
            paintStyle: $this.getPaintStyle(data[len - 1].flavor, data[len - 1].status, true)
          });
        });
      jsPlumb.fire("jsPlumbDemoLoaded", defaultInstance);
    }

  });

