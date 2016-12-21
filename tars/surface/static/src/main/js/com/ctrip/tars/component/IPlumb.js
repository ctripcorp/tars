Class
  .forName({
    name: "class com.ctrip.tars.component.IPlumb extends Object",

    'private plumbInstance': null,

    '@Getter private options': {


      //["Bezier", {curviness: 38}],
      //["Flowchart" ,{stub:0, gap:0,alwaysRespectStubs :true,cornerRadius :8,midpoint :0.5}]
      //["Straight" ,{stub:0, gap:0}]
      Connector: ["Straight", {
        stub: 0,
        gap: 0
      }],
      DragOptions: {
        cursor: "pointer",
        zIndex: 500
      },
      PaintStyle: { // 连线
        strokeStyle: "#0b8284",
        lineWidth: 2
      },
      EndpointStyle: { // 端点
        radius: 1,
        fillStyle: "#0b8284"
      },
      HoverPaintStyle: {
        strokeStyle: "orange"
      },
      EndpointHoverStyle: {
        fillStyle: "orange"
      },
      Container: null
    },

    IPlumb: function(options, $scope) {
      var palette = $(options.Container),
        container = palette.find(".palette");
      if (container.length <= 0) {
        container = $("<div class='palette' style='position:relative;'></div>");
        palette.append(container);
      }
      options.Container = container.get(0);
      $.extend(true, this.options, options, {
        Palette: palette.get(0)
      });

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

      this.$scope = $scope;
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

    draw: (function() {
      var ldr = (function() {
        var traversal = function(children, parent, callback) {
          if (children && Object.isArray(children)) {
            for (var i = 0, len = children.length; i < len; i++) {
              var child = children[i];
              child.first = i === 0;
              child.last = i === children.length - 1;
              child.depth = parent.depth + 1;
              callback(child, parent);
              traversal(child.children, child, callback);
            }
          }
        };

        return function(root, callback) {
          if (root && !Object.isArray(root)) {
            root.first = true;
            root.last = true;
            root.depth = -1;
            //root.depth = 0;//不画根节点
            //callback(root, null);//不画根节点
            traversal(root.children, root, callback);
          }
        };
      })();

      var fdr = (function() {
        var previous = null;

        var traversal = function(children, parent, callback) {
          if (children && Object.isArray(children)) {
            for (var i = 0, len = children.length; i < len; i++) {
              var child = children[i];

              child.depth = parent.depth + 1;

              traversal(child.children, child, callback);

              callback(child, previous, parent);

              previous = child;
            }
          }
        };

        return function(root, callback) {
          if (root && !Object.isArray(root)) {
            root.previous = 0;
            root.depth = -1;
            //root.depth = 0;//不画根节点

            traversal(root.children, root, callback);
            //callback(root, previous, null);//不画根节点


            previous = null;
          }
        };
      })();

      var config = {
        vip: {
          width: 320,
          height: 40
        },
        ld: {
          width: 144,
          height: 40
        },
        vm: {
          width: 160,
          height: 80
        },
        task: {
          width: 144,
          height: 80
        }
      };

      return function(data) {

        if (Object.isNull(data)) {
          return;
        }

        var options = this.getOptions();

        if (data.error) {
          var container = $(options.Container),
            palette = $(options.Palette),
            height = palette.height() || 160;
          container.empty();
          //background-color: rgba(11, 130, 132, 0.3); border-radius: 8px;
          container.html(['<div style="width: 100%; text-align: center; font-size: 14px; color: #A9D9DA; ',
            'line-height: ', height, 'px; height: ', height, 'px;"><span>获取数据失败！【', data.status, '】</span></div>'
          ].join(""));
          return;
        }

        var defaultInstance = this.getDefaultPlumb();
        var $scope = this.$scope;

        var strokeStyle = options.PaintStyle.strokeStyle,
          fillStyle = options.EndpointStyle.fillStyle;

        var arrowCommon = {
            foldback: 0.7,
            fillStyle: fillStyle,
            width: 8
          },
          arrow = {
            positive: ["Arrow", {
              location: 0.72
            }, arrowCommon],
            reverse: ["Arrow", {
              location: 0.28,
              direction: -1
            }, arrowCommon]
          };

        defaultInstance
          .doWhileSuspended(function() {
            var maxSizes = new js.util.HashMap();
            var container = $(options.Container),
              palette = $(options.Palette);
            defaultInstance.reset();
            container.empty();

            ldr(data, function(child, parent) {
              if (container.find("#" + child.id).length <= 0) {
                container
                  .append(
                    ['<div class="element ', child.type, ' ', (child.status || '') + '" id="', child.id, '"><div class="title text-overflow">', child.title,
                      '</div><div class="content text-overflow">', child.text, '</div></div>'
                    ].join(''));
              }

              var width = config[child.type].width,
                key = null;

              if ("vm".equals(child.type) || "task".equals(child.type)) {
                key = "leaf" + parent.id;
                var size = maxSizes.get(key);
                if (size.ld) {
                  size.width = width;
                  size.ld = false;
                } else {
                  size.width += width;
                  size.leafs += 1;
                }
              } else if ("ld".equals(child.type)) {
                key = "leaf" + child.id;
                maxSizes.put(key, {
                  width: width,
                  leafs: 1,
                  ld: true
                });
                if (!child.last) {
                  /*container.append('<div class="separate-block separate-block-top" id="' + child.id + '-block-top"/>');
									container.append('<div class="separate-block separate-block-bottom" id="' + child.id + '-block-bottom"/>');*/

                  if (container.find("#" + child.id + '-vertical-line').length <= 0) {
                    container.append('<div class="separate-vertical-line" id="' + child.id + '-vertical-line"/>');
                  }
                }
              }
            });

            var paletteWidth = palette.width(),
              paletteHeigth = palette.height() - 30, //30为滚动条的大小
              maxWidth = 0,
              maxHeigth = config.vip.height + config.ld.height + Math.max(config.vm.height, config.task.height),
              offsetWidth = 0,
              offsetHeigth = 0,
              leafs = 0;
            var ite = maxSizes.keySet().iterator();
            while (ite.hasNext()) {
              var key = ite.next(),
                value = maxSizes.get(key);
              maxWidth += value.width;
              leafs += value.leafs;
            }

            var scrollWidth = 0,
              scrollHeight = 0;
            //平均分配横向间隔
            if (paletteWidth >= maxWidth) {
              offsetWidth = (paletteWidth - maxWidth) / leafs;
            } else {
              offsetWidth = 16;
              var pw = maxWidth + leafs * offsetWidth;
              scrollWidth = pw - paletteWidth;
              paletteWidth = pw;
            }

            //2的等比倍数分配纵向间隔
            if (paletteHeigth >= maxHeigth) {
              offsetHeigth = (paletteHeigth - maxHeigth) / (1 + 2 + 4 + 1);
            } else {
              offsetHeigth = 16;
              var ph = maxHeigth + 3 * offsetHeigth;
              scrollHeight = ph - paletteHeigth;
              paletteHeigth = ph;
            }

            container.css({
              width: paletteWidth,
              height: paletteHeigth
            });

            //palette.mCustomScrollbar("update");
            //palette.mCustomScrollbar("scrollTo", [scrollHeight / 2, scrollWidth / 2]);

            var slibing = 0,
              slibing2 = 0;
            fdr(data, function(child, previous, parent) {

              var width = config[child.type].width,
                height = config[child.type].height;

              child.length = (!previous ? 0 : previous.length);
              if (leafs === 0) {
                child.length = paletteWidth - maxWidth;
              }

              var oh = 0,
                left = 0;

              switch (child.type) {
                case "vip":
                  left = slibing2 + (child.length - slibing2 - width) / 2;
                  slibing2 = slibing;
                  break;
                case "ld":
                  if (child.length <= 0) {
                    child.length = offsetWidth;
                  }
                  oh = config.vip.height;
                  left = slibing + (child.length - slibing - width) / 2;
                  slibing = child.length;

                  break;
                case "vm":
                case "task":
                default:
                  oh = config.vip.height + config.ld.height;

                  left = child.length + offsetWidth / 2;
                  child.length += offsetWidth + width;
                  break;
              }

              if ("ld".equals(child.type)) {
                /*$("#" + child.id + "-block-top").css({
									left : Math.abs(slibing - 1)
								});
								$("#" + child.id + "-block-bottom").css({
									left : Math.abs(slibing - 1)
								});*/
                $("#" + child.id + "-vertical-line").css({
                  left: Math.abs(slibing - 1),
                  height: paletteHeigth
                });

              }

              $("#" + child.id).css({
                width: width,
                height: height,
                top: (Math.pow(2, child.depth + 1) - 1) * offsetHeigth + oh, //2的等比数列求和（2的n方 -1）* a1/（2 - 1）
                left: left
              }).bind("click", function() {
                switch (child.type) {
                  case "vip":
                    break;
                  case "ld":
                    window.open(child.data[0]);
                    break;
                  case "vm":
                  case "task":
                  default:

                    if (child.name == "working" || child.name == "maintain") {
                      return;
                    }

                    $.licoDialog({
                      level: -1,
                      destory: false,
                      blur: false,
                      offset: {
                        top: 0
                      },
                      show: function(w, layout, attrs) {
                        $scope.$root.$broadcast('dialog.batches.open', {
                          dialog: w,
                          layout: layout,
                          target: child
                        });
                        //layout.append($("#batches-dialog").children());
                        //$scope && $scope.initScroll.call($scope, layout);
                      },
                      close: function(w, layout, attrs) {
                        //$("#batches-dialog").append(layout.children());
                        $scope.$root.$broadcast('dialog.batches.close', {
                          layout: layout,
                          target: child
                        });
                      }
                    });
                    break;
                }

              });
            });
            ldr(data, function(child, parent) {

              var endPoint = document.getElementById(child.id),
                paintStyle = null,
                conn = child.connect,
                none = false,
                overlays = [];

              if (conn) {

                if (conn.positive) {
                  overlays.push(arrow.positive);
                }

                if (conn.reverse) {
                  overlays.push(arrow.reverse);
                }

                if (conn.text) {
                  overlays.push(["Label", {
                    label: conn.text,
                    cssClass: ""
                  }]);
                }

                paintStyle = {
                  strokeStyle: strokeStyle
                };

                switch (conn.style) {
                  case "dashed":
                    paintStyle.dashstyle = "2 2";
                    paintStyle.lineWidth = 2;
                    break;
                  case "none":
                    none = true;
                    break;
                  case "solid":
                  default:
                    paintStyle.dashstyle = "2 0";
                    paintStyle.lineWidth = 2;
                    break;
                }
              }

              defaultInstance.addEndpoint(endPoint, {
                uuid: child.id + "-bottom",
                anchor: "Bottom",
                maxConnections: -1

                /*
                 * ,endpoint : "Dot", anchor : [
                 * "Perimeter", { shape : "Square",
                 * anchorCount : 150 } ]
                 */
              });

              defaultInstance.addEndpoint(endPoint, {
                uuid: child.id + "-top",
                anchor: "Top",
                maxConnections: -1
              });

              if (parent && parent.depth !== -1 && !none) { //不画根节点

                defaultInstance.connect({
                  uuids: [parent.id + "-bottom", child.id + "-top"],
                  overlays: overlays,
                  // detachable : true,
                  // reattach : true,
                  paintStyle: paintStyle
                });
              }

              /*if ("ld".equals(child.type)) {
								var epTop = document.getElementById(child.id + '-block-top'), epBottom = document.getElementById(child.id + '-block-bottom');
								if (epTop && epBottom) {
									defaultInstance.addEndpoint(epTop, {
										uuid : child.id + "-block-bottom",
										anchor : "Bottom",
										maxConnections : 1,
										connector: [ "Bezier", {
											curviness : 0
										} ]
									});

									defaultInstance.addEndpoint(epBottom, {
										uuid : child.id + "-block-top",
										anchor : "Top",
										maxConnections : 1
									});

									defaultInstance.connect({
										source : epTop,
										target : epBottom,
										paintStyle : {
											strokeStyle : "#fff",
											dashstyle : "1 8",
											lineWidth : 1
										}
									});
								}
							}*/

              // defaultInstance.draggable(endPoint);
            });
          });

        jsPlumb.fire("jsPlumbDemoLoaded", defaultInstance);
      };
    })()

  });

