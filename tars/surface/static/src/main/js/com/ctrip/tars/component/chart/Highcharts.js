$import("com.ctrip.tars.util.Common");
Class.forName({
  name: "class com.ctrip.tars.component.chart.Highcharts extends Object",

  "private id": null,
  "private referId": null,
  "private logicId": null,
  "private @Getter element": null,

  Highcharts: function(id) {
    this.id = new Date().getTime();
    this.referId = "high-chart" + (id ? "-" + com.ctrip.tars.util.Common.stripscript(id) : "");
    this.logicId = id;
  },

  setShowSeriesCallback: function(fn) {
    this.showSeriesCallback = fn;
  },

  setHideSeriesCallback: function(fn) {
    this.hideSeriesCallback = fn;
  },

  dyncRenderChart: function(fn) {
    this.dyncRenderChart = fn;
  },

  render: function(series) {},

  reflow: function() {
    if (Object.isNull(this.element)) {
      return;
    }
    this.element.reflow();
  },

  'protected redraw': function(series, redraw) {

    if (Object.isNull(this.element)) {
      return;
    }

    if (Object.isNull(series)) {
      this.element.redraw();
    }

    var allSeries = this.element.series;

    for (var j = 0, len1 = series.length; j < len1; j++) {

      var s1 = series[j],
        s2 = null;
      for (var i = 0, len2 = allSeries.length; i < len2; i++) {

        if (allSeries[i].options.id == s1.id) {
          s2 = allSeries[i];
          break;
        }
      }

      if (s2) {
        s2.setData(s1.data, false, false, false);
      } else {
        this.element.addSeries(s1, false);
      }
    }

    if (redraw) {
      this.element.redraw();
    }
  }

});

