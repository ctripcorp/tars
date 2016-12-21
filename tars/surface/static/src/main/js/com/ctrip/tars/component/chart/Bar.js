$import("com.ctrip.tars.component.chart.Highcharts");
Class.forName({
  name: "class com.ctrip.tars.component.chart.Bar extends com.ctrip.tars.component.chart.Highcharts",

  Bar: function(id) {
    var referId = this.referId;
    $("#" + referId).empty();

    this.element = new Highcharts.Chart({
      chart: {
        type: 'bar',
        renderTo: referId
      },

      credits: {
        enabled: false
      },

      legend: {
        enabled: false
      },
      title: {
        text: null
      },
      subtitle: {
        text: null
      },

      tooltip: {
        enabled: true,
        formatter: function() {
          return '<span style="color:' + this.point.color + '">\u25CF</span><span style="padding-left: 8px; font-size: 12px; font-weight: bold;">' + this.series.name + ': ' + Math.floor(this.y) + '台</span></span>';
        },
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 15,
        style: {
          fontWeight: 800,
          padding: 5
        }
      },
      plotOptions: {
        bar: {
          borderWidth: 0,
          shadow: false,
          allowPointSelect: true,
          showInLegend: false,
          stacking: 'normal',
          dataLabels: {
            enabled: false,
            formatter: function() {
              return '<span style="font-size: 10px; color: #ffffff;">' + this.point.y + "</span>";
            }
          },
          colors: ['#00bcd4', '#ffeb3b'],
          states: {
            hover: {
              brightness: 0.1,
              enabled: true,
              halo: false
            }
          }
        },
      },
      series: [],
      yAxis: {
        labels: {
          enabled: false
        },
        title: {
          text: null
        },
        gridLineWidth: 0,
        minorGridLineWidth: 0
      },
      xAxis: {
        labels: {
          enabled: false
        },
        title: {
          text: null
        },
        gridLineWidth: 0
      }
    });
  },

  redraw: function(data) {

    if (Object.isNull(data) || !Object.isArray(data)) {

      //todo当前线上无版本

      return;
    }

    var series = [],
      colors = ['#00bcd4', '#ffeb3b'];
    for (var i = 0, len = data.length; i < len; i++) {
      series.push({
        id: data[i].package.id,
        name: data[i].package.name,
        data: [{
          y: data[i].count,
          color: i >= colors.length ? null : colors[i]
        }]
      });
    }
    this.$super.redraw.call(this, series, true);

  }
});

