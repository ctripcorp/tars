var d3Tree = angular.module("com.ctrip.tars.d3.tree", []).service('com.ctrip.tars.d3.tree.Service', ['$rootScope', '$http', function($rootScope, $http) {

  var validate = function(d) {
    return d;
  };

  var loadData = function(start, end, fn) {
    end = end || (start + PAGE_SIZE);
    $http({
      method: 'GET',
      url: [TEST_URL, "common/clusters"].join("")
    }).success(function(data, status, headers, config) {
      if (data.success) {
        var d = data.data || [];
        for (var i = 0, len = d.length; i < len; i++) {
          if (start > 1) {
            service.tree.push(validate(d[i]));
          } else {
            service.tree[i] = validate(d[i]);
          }
        }
        fn(d);
      }
    });
  };

  var service = {
    tree: [],
    update: function(d, fn) {
      $rootScope.$broadcast('tree.update');
      if (fn) {
        fn.call(this, d);
      }
    },
    first: function(fn) {
      this.tree.clear();
      loadData(1, null, function(d) {
        service.update(d, fn);
      });
    },

    refresh: function(fn) {

      loadData(1, this.tree.length, function(d) {
        service.update(d, fn);
      });

    },

    next: function(fn) {
      loadData(this.tree.length + 1, null, function(d) {
        service.update(d, fn);
      });
    },

    filterData: function(map, fn) {

      var data = [];
      for (var i = 0, len = this.tree.length; i < len; i++) {
        var app = this.tree[i];

        if (app) {
          for (var key in map) {
            var value = map[key];

            if (app[key] !== value) {
              app = null;
              break;
            }
          }
        }

        if (app) {
          data.push(app);
          if (fn) {
            fn(i, app, this.tree);
          }
        }
      }
      return data;
    }
  };

  service.first();

  return service;
}]).controller("com.ctrip.tars.d3.tree.Controller", ['$scope', '$rootScope', 'com.ctrip.tars.d3.tree.Service', function($scope, $rootScope, service) {
  $scope.$on('tree.update', function(event) {
    $scope.tree = service.tree;
    /*
		if (!$scope.$$phase) {
			$scope.$apply();
		}*/
    return false;
  });

  $scope.tree = service.tree;

}]).directive(
  "d3Tree",
  function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        appName: "@dataappname",
        errLogCurr: "@dataerrlogcurr",
        visitCurr: "@datavisitcurr",
        costCurr: "@datacostcurr",
        releaseNumber: "@datareleasenumber",
        domainName: "@datadomainname",
        health: "@datahealth",
        favorite: "@datafavorite",
        onMore: "&",
        onFavorite: "&"
      },
      template: ['<div id="navdiv"></div>'].join(""),
      link: function(scope, element, attrs, treeController) {


        var width = parseInt($("#navdiv").width()),
          height = parseInt($("#navdiv").height());

        var scale_max = 2.3;
        var scale_min = 0.2;
        var current_scale = 1.1;
        var bar_len = 100;
        var border_len = 20;
        var colors = d3.scale.category20();

        // (1)定义节点和联系对象数组
        var dataset = {
          nodes: [ // 节点
            {
              name: "Peter",
              r: 16
            }, {
              name: "Bob",
              r: 21
            }, {
              name: "Tony",
              r: 31
            }, {
              name: "Davir",
              r: 25
            }, {
              name: "Edward",
              r: 27
            }, {
              name: "Army",
              r: 19
            }, {
              name: "Jonn",
              r: 35
            }, {
              name: "Hannah",
              r: 33
            }, {
              name: "Jack",
              r: 29
            }, {
              name: "Jerry",
              r: 32
            }
          ],
          edges: [ // 边
            {
              source: 0,
              target: 1,
              weight: 1,
              color: 1
            }, {
              source: 0,
              target: 2,
              weight: 3,
              color: 4
            }, {
              source: 0,
              target: 3,
              weight: 4,
              color: 6
            }, {
              source: 0,
              target: 4,
              weight: 6,
              color: 65
            }, {
              source: 1,
              target: 5,
              weight: 3,
              color: 76
            }, {
              source: 2,
              target: 5,
              weight: 8,
              color: 879
            }, {
              source: 2,
              target: 5,
              weight: 7,
              color: 989
            }, {
              source: 3,
              target: 4,
              weight: 9,
              color: 643
            }, {
              source: 5,
              target: 8,
              weight: 1,
              color: 54
            }, {
              source: 5,
              target: 9,
              weight: 3,
              color: 54
            }, {
              source: 6,
              target: 7,
              weight: 4,
              color: 45
            }, {
              source: 7,
              target: 8,
              weight: 0,
              color: 43
            }, {
              source: 2,
              target: 8,
              weight: 8,
              color: 243
            }, {
              source: 3,
              target: 8,
              weight: 1,
              color: 43
            }, {
              source: 5,
              target: 8,
              weight: 5,
              color: 13
            }, {
              source: 6,
              target: 8,
              weight: 3,
              color: 351
            }, {
              source: 8,
              target: 9,
              weight: 1,
              color: 1
            }
          ]
        };

        // (2)转化数据为适合生成力导向图的对象数组
        var force = d3.layout.tree()
          .size([width, height]) // 设置有效空间的大小
          .linkDistance(150) // 连线的长度
          .charge(-500).start(); // 设置生效

        var nodes = force.nodes(dataset.nodes); // 加载节点数据
        nodes.links(dataset.edges); // 加载边数据

        var svg = d3.select("#navdiv").append("svg").attr("width", width).attr("height", height).attr("pointer-events", "all").call(d3.behavior.zoom().on("zoom", redraw)) // redraw
          .on("mousedown.zoom", null).append('svg:g').attr("cursor", "pointer");

        var marker = d3.select("svg").append("svg:defs").selectAll("marker").data(dataset.nodes) // not
          // edges
          .enter().append("svg:marker");
        marker.attr({
          id: function(d) {
            return "marker-" + d.r;
          },
          viewBox: "0 -5 10 10",
          refX: function(d) {
            console.log("d.r:" + d.r);
            return d.r;
          },
          markerWidth: 10,
          markerHeight: 10,
          orient: "auto"
        }).append('svg:path').attr('d', "M0,-5L10,0L0,5").attr("fill", function(d) {
          return "black";
        });
        var dtb = d3.select("svg").append("svg:g").attr({
          heigth: bar_len,
          width: 200,
          x: 0,
          y: 0
        });
        dtb.append('rect') // top
          .attr({
            width: border_len,
            height: border_len,
            x: 10,
            y: 10
          }).attr("fill", 'black');
        dtb.append("rect") // bottom
          .attr({
            width: border_len,
            height: border_len,
            x: 10,
            y: 130
          }).attr("fill", "black");
        dtb.append("rect").attr({
          width: 4,
          height: bar_len,
          x: 19,
          y: 30
        }).attr("fill", "grey");

        var bar = dtb.append('rect').attr({
          width: 20,
          height: 5,
          x: 10,
          y: 82,
          fill: "green",
          cursor: "pointer"
        }).call(d3.behavior.drag().on("drag", dragmove)); // dragmove

        // (3)创建作为连线的svg直线
        var edges = svg.append('g').attr('cursor', 'pointer').selectAll(".link").data(dataset.edges).enter().append("line").attr("class", "link").style("stroke", function(d) { // 设置线的颜色
          return colors(d.color);
        }).style("stroke-width", function(d, i) { // 设置线的宽度
          return 1.5;
        }).attr("marker-end", function(d) {
          return "url(#marker-" + (d.target.r) + ")";
        });
        // (4) 创建作为连线的svg圆形
        nodes = svg.selectAll(".node").data(dataset.nodes).enter().append('g').attr('class', 'node').call(force.drag); // 可以拖动

        nodes.append("svg:circle").attr("r", function(d) {
          return d.r; // the r of circle
        }).style("fill", function(d) {
          return colors(d.r * d.r * d.r);
        });
        nodes.append('text').attr("text-anchor", "middle").attr("font-size", "10px").attr('stroke', 'black').attr('stroke-width', function(d) {
          return 0;
        }).text(function(d) {
          return d.name;
        });

        nodes.append("title").text(function(d) {
          return d.name;
        });

        // (5)打点更新，没有的话就显示不出来了
        force.on('tick', function() {
          edges.attr("x1", function(d) {
            return d.source.x;
          }).attr("y1", function(d) {
            return d.source.y;
          }).attr("x2", function(d) {
            return d.target.x;
          }).attr("y2", function(d) {
            return d.target.y;
          });
          // (6)设置节点坐标，节点先生成再确定坐标的
          nodes.attr("cx", function(d) { // 节点有坐标属性
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          }).attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });
        });

        var scale = 1.1;
        var currentY = 0;

        function redraw() { // 放大缩小 鼠标滑动 scale放大倍数，translate是转变，转换

          scale = d3.event.scale;
          if (scale > scale_max || scale < scale_min) {
            return;
          }
          currentY = scale / (scale_max - scale_min) * bar_len + 18;
          bar.attr("y", currentY);
          console.log("scale:" + scale + ",currentY:" + currentY);
          svg.attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + scale + ")");
        }

        function dragmove() {
          var x = 0; // not move in x axis
          var dy = d3.event.y;
          var diffY = dy; // +currentY - 30 ;

          if (diffY > 130) { // bar_len + border_len+ margin
            diffY = 125;
            return;
          }
          if (diffY < 30) { // border_len+ margin
            diffY = 30;
            return;
          }
          // console.log( "diffY:" + diffY + "dy:" + dy);
          scale = diffY / bar_len * (scale_max - scale_min);
          // console.log("scale:" + scale);
          bar.attr("y", diffY);
          svg.attr("transform", "translate(" + [(w / 3) - (w * current_scale / 3), (h / 2) - (h * current_scale / 2)] + ")" + "scale(" + scale + ")");
        }



      }
    };
  });

