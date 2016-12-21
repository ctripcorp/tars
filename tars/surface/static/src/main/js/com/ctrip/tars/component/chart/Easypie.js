$import("com.ctrip.tars.component.chart.Highcharts");
Class.forName({
  name: "class com.ctrip.tars.component.chart.Easypie extends com.ctrip.tars.component.chart.Highcharts",

  Pie: function(id) {},

  render: function(series) {
    var referId = this.referId;
    $("#" + referId).empty();

    this.element = new Highcharts.Chart({
      chart: {
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
        pointFormat: '{point.percentage:.1f}%'
      },
      plotOptions: {
        pie: {
          borderWidth: 0,
          shadow: true,
          allowPointSelect: true,
          slicedOffset: 10,
          dataLabels: {
            enabled: false,
            distance: 0,
            color: "#fff"
          },
          colors: ['#2DE3BF', '#F39C12', '#FDB71F']
        }
      },
      series: [{
        type: 'pie',
        innerSize: '100%',
        data: [
          ['工作中', 60.0],
          ['发布中', 25.0],
          ['维护中', 15.0]
        ]
      }]
    });
  }
});

