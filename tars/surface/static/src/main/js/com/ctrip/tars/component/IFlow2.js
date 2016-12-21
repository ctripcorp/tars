$import("com.ctrip.tars.util.Angular");
Class
  .forName({
    name: "class com.ctrip.tars.component.IFlow2 extends Object",

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

    IFlow2: function(options, $scope, $compile) {
      this.setOptions(options);
      this.$scope = $scope;
      this.$compile = $compile;

      var status = new js.util.HashMap();
      status.put("PENDING", 0);

      status.put("DISABLING", 1);
      status.put("DISABLE_FAILURE", 2);
      status.put("DISABLE_SUCCESS", 3);

      status.put("DOWNLOADING", 4);
      status.put("DOWNLOAD_FAILURE", 5);
      status.put("DOWNLOAD_SUCCESS", 6);

      status.put("INSTALLING", 7);
      status.put("INSTALL_FAILURE", 8);
      status.put("INSTALL_SUCCESS", 9);

      status.put("VERIFYING", 10);
      status.put("VERIFY_FAILURE", 11);
      status.put("VERIFY_SUCCESS", 12);

      status.put("ENABLING", 13);
      status.put("ENABLE_FAILURE", 14);
      status.put("ENABLE_SUCCESS", 15);

      status.put("FAILURE", 16);
      //status.put("REVOKED", 0);
      status.put("SUCCESS", 17);
      this.status = status;
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

    getOverlays: function(status) {
      var color = "";
      switch (status) {
        case 'PENDING':
          color = "#cfcfcf";
          break;
        case 'DEPLOYING':
        case 'SUCCESS':
          color = "#0b8284";
          break;
        case 'FAILURE':
        case 'REVOKED':
        default:
          color = "#e51c23";
          break;
      }
      return [
        ["Arrow", {
          location: 1
        }, {
          foldback: 0.8,
          fillStyle: color,
          width: 8
        }],
        ["Label", {
          label: "", //(status || "").toLowerCase(),
          cssClass: (status || "").toLowerCase()
        }]
      ];
    },
    getPaintStyle: function(status) {
      var color = "",
        dash = "";
      switch (status) {
        case 'PENDING':
          color = "#cfcfcf";
          dash = "1 1";
          break;
        case 'DEPLOYING':
          color = "#0b8284";
          dash = "1 1";
          break;
        case 'SUCCESS':
          color = "#0b8284";
          dash = "3 0";
          break;
        case 'FAILURE':
        case 'REVOKED':
        default:
          color = "#e51c23";
          dash = "3 0";
          break;
      }
      return {
        strokeStyle: color,
        dashstyle: dash,
        lineWidth: 3
      };
    },
    getConnector: function() {
      return ["Straight", {
        stub: 0,
        gap: 0,
        cornerRadius: 0,
        alwaysRespectStubs: false,
        midpoint: 0
      }];
    },
    drawStep: function(key, data) {
      // var ele = $("a[name='progress-step-" + key + "'],div[name='progress-step-" + key + "']");
      var scope = null,
        ele = null,
        options = this.getOptions(),
        container = $(options.Container);

      // if (ele.length > 0) {
      //   scope = com.ctrip.tars.util.Angular.getScope(ele);
      //   scope.data = data;
      // } else {
      scope = this.$scope.$new(false);
      scope.data = data;
      if (key === 'start' || key === 'end' || key === 'hide') {
        ele = this.$compile("<progress-" + key + "/>")(scope);
      } else if (key === 'coordinate') {
        ele = this.$compile("<coordinate/>")(scope);
      } else {
        ele = this.$compile("<progress-step2/>")(scope);
      }
      // }

      if (scope.data) {
        scope.data.key = key;
      }

      if (!scope.$$phase) {
        scope.$apply();
      }

      container.append(ele);
      return ele;
    },
    draw: function(data) {

      var options = this.getOptions(),
        container = $(options.Container),
        palette = $(options.Palette),
        height = palette.height() || 172;

      if (Object.isNull(data) || !Object.isArray(data) || data.length <= 0) {
        this.destroy();
        container.html(['<div style="width: 100%; text-align: center; font-size: 14px; color: #A9D9DA; ',
          'line-height: ', height, 'px; height: ', height, 'px;"><span>', "绘图数据格式不正确！", '</span></div>'
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

          var pi = Math.PI,
            len = data.length,
            width = container.width(),
            height = container.height(),
            position = {},
            status = 'SUCCESS',
            x = 0,
            y = 0,
            hr = height / 2,
            scope = null,
            step = null,
            point = {
              width: 80,
              height: 30 + 20 + 28,
              offset: {
                left: -30,
                top: -8
              }
            },
            i = -1,
            j = 1,
            padding = 0,
            degree = 0;

          step = $this.drawStep('start', {
            status: 'SUCCESS'
          });

          step.css({
            left: padding - point.offset.left + 'px',
            top: hr + point.offset.top + 'px'
          });

          defaultInstance.addEndpoints(step, [{
            uuid: i + "-right",
            anchor: "Center",
            maxConnections: -1,
            connector: $this.getConnector()
          }]);

          position = step.position();


          var segments = 0,
            spacing = 0,
            r = 0;

          if (len <= 3) {
            spacing = (width - 2 * padding - point.width) / (len + 1);
            r = spacing;
          } else {
            segments = 3;
            spacing = (width - 2 * padding - point.width) / segments;
            r = spacing;
            if (height < 2 * r + point.height) {
              r = (height - point.height) / 2;
              spacing = (width - 2 * r - 2 * padding - point.width) / (segments - 2);
              if (r > spacing) {
                r = spacing;
                spacing = (width - 2 * r - 2 * padding - point.width) / (segments - 2);
              }
            }
          }

          var d = data[0];
          if (d.fortBatch) {
            if (len <= 3) {
              spacing = (width - 2 * padding - point.width) / (len + 2);
              r = spacing;
            } else {
              segments = 5;
              spacing = (width - 2 * padding - point.width) / segments;
              r = spacing;
              if (height < 2 * r + point.height) {
                r = (height - point.height) / 2;
                spacing = (width - 2 * r - 2 * padding - point.width) / (segments - 2);
                if (r > spacing) {
                  r = spacing;
                  spacing = (width - 2 * r - 2 * padding - point.width) / (segments - 2);
                }
              }
            }
            i++;
            var servers = 0,
              score = 0,
              verifyStatus = "",
              enableStatus = "",
              verify = 0;

            status = 'PENDING';

            if (d.status === 'PENDING') {
              verifyStatus = d.status;
              enableStatus = d.status;
            } else if (d.status === 'SUCCESS') {
              verifyStatus = d.status;
              enableStatus = d.status;
              verify = 4;
              status = 'SUCCESS';
            } else {
              for (var m in d.summary) {
                servers += d.summary[m];
                score += $this.status.get(m);
              }
              if (score < servers * $this.status.get('VERIFY_SUCCESS')) {
                verifyStatus = d.status;
                enableStatus = "PENDING";
                verify = 1;
              } else if (score === servers * $this.status.get('VERIFY_SUCCESS')) {
                verifyStatus = "SUCCESS";
                enableStatus = "PENDING";
                verify = 2;
              } else {
                verifyStatus = "SUCCESS";
                enableStatus = d.status;
                if (score < servers * $this.status.get('SUCCESS')) {
                  verify = 3;
                } else if (score === servers * $this.status.get('SUCCESS')) {
                  verify = 4;
                  status = 'SUCCESS';
                }
              }
            }

            step = $this.drawStep(i, {
              id: d.id,
              forBatch: true,
              index: 'Smoking',
              status: verifyStatus
            });

            step.css({
              left: padding - point.offset.left + (i + 1) * spacing + 'px',
              top: hr + point.offset.top + 'px'
            });

            defaultInstance.addEndpoints(step, [{
              uuid: i + "-smoke-left",
              anchor: "Center",
              maxConnections: -1,
              connector: $this.getConnector()
            }, {
              uuid: i + "-smoke-right",
              anchor: "Center",
              maxConnections: -1,
              connector: $this.getConnector()
            }]);

            defaultInstance.connect({
              uuids: [(i - 1) + "-right", i + "-smoke-left"],
              overlays: $this.getOverlays(verifyStatus),
              paintStyle: $this.getPaintStyle(verifyStatus)
            });

            if (verify <= 2) {
              position = step.position();
            }

            step = $this.drawStep(i + 1, {
              id: d.id,
              forBatch: true,
              index: 'Baking',
              status: enableStatus
            });

            step.css({
              left: padding - point.offset.left + (i + 2) * spacing + 'px',
              top: hr + point.offset.top + 'px'
            });

            defaultInstance.addEndpoints(step, [{
              uuid: i + "-bake-left",
              anchor: "Center",
              maxConnections: -1,
              connector: $this.getConnector()
            }, {
              uuid: i + "-right",
              anchor: "Center",
              maxConnections: -1,
              connector: $this.getConnector()
            }]);

            defaultInstance.connect({
              uuids: [i + "-smoke-right", i + "-bake-left"],
              overlays: $this.getOverlays(enableStatus),
              paintStyle: $this.getPaintStyle(enableStatus)
            });

            if (verify > 2 && verify <= 4) {
              position = step.position();
            }
          }

          var de = 2 * pi / (len - (i + 1)),
            deploying = false;

          for (var bf = i + 1, j = bf; j < len; j++) {
            d = data[j].clone();
            d.index = "批次" + d.index;
            if (status !== 'SUCCESS' || d.status !== 'SUCCESS') {
              status = 'PENDING';
            }

            degree = pi + de * j - (i === 0 ? de : 0);
            x = r * Math.cos(degree);
            y = r * Math.sin(degree);

            step = $this.drawStep(j + 1, d);

            if (len <= 3) {
              step.css({
                left: padding - point.offset.left + spacing * (i * 2 + 3) + (j - bf) * r + 'px', //(i + 1) * 24 * 3 + 8,
                top: hr + point.offset.top + 'px'
              });
            } else {
              step.css({
                left: padding - point.offset.left + spacing * (i * 2 + 3) + r + x + 'px', //(i + 1) * 24 * 3 + 8,
                top: hr + point.offset.top + y + "px"
              });
            }

            defaultInstance.addEndpoints(step, [{
              uuid: j + "-left",
              anchor: "Center",
              maxConnections: -1,
              connector: $this.getConnector()
            }, {
              uuid: j + "-right",
              anchor: "Center",
              maxConnections: -1,
              connector: $this.getConnector()
            }]);

            defaultInstance.connect({
              uuids: [(j - 1) + "-right", j + "-left"],
              overlays: $this.getOverlays(d.status),
              paintStyle: $this.getPaintStyle(d.status)
            });

            if (d.status === 'DEPLOYING') {
              deploying = true;
              position = step.position();
            } else {
              if (!deploying && (d.status === 'FAILURE' || d.status === 'REVOKED' || d.status === 'SUCCESS')) {
                position = step.position();
              }
            }
          }

          step = $this.drawStep('end', {
            status: status
          });

          if (len <= 3) {
            step.css({
              right: padding - point.offset.left + 'px',
              top: hr + point.offset.top + 'px'
            });
          } else {
            step.css({
              left: padding - point.offset.left + spacing * (i * 2 + 3) + r + 'px',
              top: hr + point.offset.top + 'px'
            });
          }
          defaultInstance.addEndpoints(step, [{
            uuid: len + "-left",
            anchor: "Center",
            maxConnections: -1,
            connector: $this.getConnector()
          }, {
            uuid: len + "-right",
            anchor: "Center",
            maxConnections: -1,
            connector: $this.getConnector()
          }]);

          defaultInstance.connect({
            uuids: [(j - 1) + "-right", len + "-right"],
            overlays: $this.getOverlays(status),
            paintStyle: $this.getPaintStyle(status)
          });
          if (status === 'SUCCESS') {
            position = step.position();
          }

          //coordinate
          coordinate = $this.drawStep('coordinate');

          position.top = position.top - step.height() - coordinate.height() + 8;
          position.left = position.left + step.width() / 2 - coordinate.height() / 2 + 4;
          coordinate.css(position).show();
        });
      jsPlumb.fire("jsPlumbDemoLoaded", defaultInstance);
    }

  });

