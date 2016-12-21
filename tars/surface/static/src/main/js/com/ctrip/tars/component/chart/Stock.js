/*
 Materials:

 Toggle range selector: http://jsfiddle.net/pablojim/bGwEp/1/:
 It does not work

 Toggle navigator: http://stackoverflow.com/questions/15906941/is-it-possible-to-hide-the-navigator-in-highcharts-at-runtime
 http://jsfiddle.net/dJbZT/1/
 It works but the implementation is too complex
 */

$import("com.ctrip.tars.component.chart.Highcharts");
$import("com.ctrip.tars.util.Chart");
Class.forName({
  name: "class com.ctrip.tars.component.chart.Stock extends com.ctrip.tars.component.chart.Highcharts",
  "private @Getter endTimestamp": null,

  Stock: function(id, endTimestamp) {
    this.endTimestamp = endTimestamp;
  },

  afterSetExtremes: function(fn) {
    this.afterSetExtremes = fn;
  },

  dyncRenderChart: function(fn) {
    this.dyncRenderChart = fn;
  },

  render: function(series, plots) {

    var referId = this.referId;
    $("#" + referId).empty();
    var chart = this;
    var seriesForNavigator = com.ctrip.tars.util.Chart
      .getDataForNavigator(series);
    com.ctrip.tars.util.Chart.setSeriesColors(series);
    this.element = new Highcharts.StockChart({
      chart: {
        renderTo: referId,
        animation: true,
        zoomType: '',
        marginLeft: 40,
        marginRight: 20,
        backgroundColor: null,
        events: {
          load: function() {}
        }
      },
      navigator: {
        enabled: false,
        adaptToUpdatedData: true,
        series: seriesForNavigator
      },
      scrollbar: {
        enabled: false,
        liveRedraw: false
      },

      credits: {
        enabled: false
      },
      rangeSelector: {
        enabled: false
      },

      legend: {
        enabled: true
      },
      title: {
        text: null
      },
      subtitle: {
        text: null
      },
      series: series,

      xAxis: {
        plotBands: plots.plotBands,
        plotLines: plots.plotLines,
        minRange: 10000,
        events: {
          afterSetExtremes: function() {
            if (!(chart.inited))
              return;
          }
        }
      },
      yAxis: [{
        opposite: false,
        min: 0,
        labels: {
          formatter: function() {
            return this.value;
          }
        },
        title: {
          text: null
        }
      }],
      plotOptions: {
        spline: {
          states: {
            hover: {
              lineWidth: 3
            }
          }
        },
        areaspline: {
          states: {
            hover: {
              lineWidth: 2
            }
          }
        },
        flags: {},

        series: {
          // lineWidth : 2,
          marker: {
            enabled: false,
            symbol: "circle",
            radius: 2
          },

          events: {
            show: function(event) {
              if (chart.showSeriesCallback) {
                chart.showSeriesCallback(chart, this, event);
              }
            },
            hide: function(event) {
              if (chart.hideSeriesCallback) {
                chart.hideSeriesCallback(chart, this, event);
              }
            }
          },
          cursor: '',
          point: {
            events: {}
          },
          stickyTracking: false,

          showInLegend: true
        }
      }
    });
    this.inited = true;
  }

});

