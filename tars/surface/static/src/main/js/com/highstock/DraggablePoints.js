/**
 * Draggable points plugin
 * Author: lico
 * License: MIT License
 *
 */
(function(Highcharts) {

  var addEvent = Highcharts.addEvent,
    each = Highcharts.each,
    pick = Highcharts.pick;

  /**
   * Filter by dragMin and dragMax
   */
  function getRange(series, XOrY) {
    var options = series.options,
      dragMin = pick(options['dragMin' + XOrY], undefined),
      dragMax = pick(options['dragMax' + XOrY], undefined);
    return {
      min: dragMin,
      max: dragMax
    };
  }

  function filterRange(newY, dragMin, dragMax) {

    if (newY < dragMin) {
      newY = dragMin;
    } else if (newY > dragMax) {
      newY = dragMax;
    }
    return newY;
  }

  var round = function(n) {
    return Math.round(n * Math.pow(10, 20)) / Math.pow(10, 20);
  };

  function move(dragPoint, series, draggableGroup, draggableX, draggableY, newX, newY, rangeX, rangeY, redraw) {

    if (draggableGroup == "series") {
      if (draggableX || draggableY) {
        var percentX = dragPoint.x ? newX / dragPoint.x : 0,
          percentY = dragPoint.y ? newY / dragPoint.y : 0;

        var points = series.points;
        for (var i = 0, len = points.length; i < len; i++) {
          var point = points[i];

          var x = draggableX ? Math.round(percentX * point.x) : point.x,
            y = draggableY ? round(percentY * point.y) : point.y;

          point.update({
            x: x,
            y: y
          }, redraw ? ((i == len - 1) ? true : false) : false);
        }
      }
    } else {
      dragPoint.update({
        x: draggableX ? newX : dragPoint.x,
        y: draggableY ? newY : dragPoint.y
      }, false);
    }
  }


  Highcharts.dragdrop = {
    mouseDown: function(e, chart) {

      var hoverPoint = chart.hoverPoint,
        options;

      if (hoverPoint && hoverPoint.series) {
        options = hoverPoint.series.options;
        if (options.draggableX) {
          dragPoint = hoverPoint;

          dragX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
          dragPlotX = dragPoint.plotX;
        }

        if (options.draggableY) {
          dragPoint = hoverPoint;

          dragY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
          dragPlotY = dragPoint.plotY + (chart.plotHeight - (dragPoint.yBottom || chart.plotHeight));
        }

        // Disable zooming when dragging
        if (dragPoint) {
          chart.mouseIsDown = false;
        }
      }
    }
  };

  Highcharts.Chart.prototype.callbacks.push(function(chart) {

    var container = chart.container,
      dragPoint, dragX, dragY, dragPlotX, dragPlotY;

    chart.redraw();
    // kill animation (why was this again?)

    addEvent(container, 'mousedown touchstart', function(e) {
      var hoverPoint = chart.hoverPoint,
        options;

      if (hoverPoint && hoverPoint.series) {
        options = hoverPoint.series.options;
        if (options.draggableX) {
          dragPoint = hoverPoint;
          dragX = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.pageX;
          dragPlotX = dragPoint.plotX;
        }

        if (options.draggableY) {
          dragPoint = hoverPoint;

          dragY = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageY : e.pageY;
          dragPlotY = dragPoint.plotY + (chart.plotHeight - (dragPoint.yBottom || chart.plotHeight));
        }

        // Disable zooming when dragging
        if (dragPoint) {
          chart.mouseIsDown = false;
        }
      }
    });

    addEvent(container, 'mousemove touchmove', function(e) {

      e.preventDefault();

      if (dragPoint && dragPoint.series) {
        var pageX = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.pageX,
          pageY = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageY : e.pageY,
          deltaY = dragY - pageY,
          deltaX = dragX - pageX,
          draggableX = dragPoint.series.options.draggableX,
          draggableY = dragPoint.series.options.draggableY,
          draggableGroup = dragPoint.series.options.draggableGroup,
          series = dragPoint.series,
          isScatter = series.type === 'bubble' || series.type === 'scatter',
          newPlotX = isScatter ? dragPlotX - deltaX : dragPlotX - deltaX - dragPoint.series.xAxis.minPixelPadding,
          newPlotY = dragPlotY - deltaY,
          newX = dragX === undefined ? dragPoint.x : dragPoint.series.xAxis.toValue(newPlotX, true),
          newY = dragY === undefined ? dragPoint.y : dragPoint.series.yAxis.toValue(newPlotY, true),
          proceed;
        // Fire the 'drag' event with a default action to move the point.

        var rangeX = getRange(series, 'X');
        var rangeY = getRange(series, 'Y');

        if (draggableX) {

          if (newX === 0 || dragPoint.x === 0) {
            return false;
          }
          newX = filterRange(Math.round(newX), rangeX.min, rangeX.max);
        }

        if (draggableY) {

          if (newY === 0 || dragPoint.y === 0) {
            return false;
          }
          newY = filterRange(round(newY), rangeY.min, rangeY.max);

        }

        dragPoint.firePointEvent('drag', {
          newX: newX,
          newY: newY
        }, function() {
          proceed = true;

          move(dragPoint, series, draggableGroup, draggableX, draggableY, newX, newY, false);

          if (chart.tooltip) {
            chart.tooltip.refresh(chart.tooltip.shared ? [dragPoint] : dragPoint);
          }
          if (series.stackKey) {
            chart.redraw();
          } else {
            series.redraw();
          }
        });

        // The default handler has not run because of prevented default
        if (!proceed) {
          drop();
        }
      }
    });

    function drop(e) {

      if (dragPoint && dragPoint.series) {
        if (e) {
          var pageX = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.pageX,
            pageY = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageY : e.pageY,
            deltaY = dragY - pageY,
            deltaX = dragX - pageX,
            draggableX = dragPoint.series.options.draggableX,
            draggableY = dragPoint.series.options.draggableY,
            draggableGroup = dragPoint.series.options.draggableGroup,
            series = dragPoint.series,
            isScatter = series.type === 'bubble' || series.type === 'scatter',
            newPlotX = isScatter ? dragPlotX - deltaX : dragPlotX - deltaX - dragPoint.series.xAxis.minPixelPadding,
            newPlotY = dragPlotY - deltaY,
            newX = dragX === undefined ? dragPoint.x : dragPoint.series.xAxis.toValue(newPlotX, true),
            newY = dragY === undefined ? dragPoint.y : dragPoint.series.yAxis.toValue(newPlotY, true);

          var rangeX = getRange(series, 'X');
          var rangeY = getRange(series, 'Y');

          if (draggableX) {

            if (newX === 0 || dragPoint.x === 0) {
              return false;
            }
            newX = filterRange(Math.round(newX), rangeX.min, rangeX.max);
          }

          if (draggableY) {

            if (newY === 0 || dragPoint.y === 0) {
              return false;
            }
            newY = filterRange(round(newY), rangeY.min, rangeY.max);

          }

          dragPoint.firePointEvent('drop', {
            newX: newX,
            newY: newY
          }, function() {
            move(dragPoint, series, draggableGroup, draggableX, draggableY, newX, newY, rangeX, rangeY, true);
          });
        }
      }
      dragPoint = dragX = dragY = undefined;
    }

    addEvent(document, 'mouseup touchend', drop);
    addEvent(container, 'mouseleave', drop);
  });

  /**
   * Extend the column chart tracker by visualizing the tracker object for small points
   */
  Highcharts.wrap(Highcharts.seriesTypes.column.prototype, 'drawTracker', function(proceed) {
    var series = this,
      options = series.options;
    proceed.apply(series);

    if (options.draggableX || options.draggableY) {

      each(series.points, function(point) {

        point.graphic.attr(point.shapeArgs.height < 3 ? {
          'stroke': 'black',
          'stroke-width': 2,
          'dashstyle': 'shortdot'
        } : {
          'stroke-width': series.options.borderWidth,
          'dashstyle': series.options.dashStyle || 'solid'
        });
      });
    }
  });

})(Highcharts);

