$import("com.ctrip.tars.component.chart.Highcharts");
Class.forName({
  name: "class com.ctrip.tars.component.chart.Pie extends com.ctrip.tars.component.chart.Highcharts",

  Pie: function(id) {},

  render: function(series) {
    var referId = this.referId;
    $("#" + referId).empty();

    var n = Math.floor(Math.random() * 100);

    this.element = new Highcharts.Chart({
      chart: {
        type: 'pie',
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
          return this.point.name + ': ' + Math.floor(this.point.percentage) + '%';
        },
        backgroundColor: 'rgba(0,0,0,0.8)'
      },
      plotOptions: {
        pie: {
          borderWidth: 0,
          shadow: false,
          allowPointSelect: true,
          slicedOffset: 5,
          showInLegend: false,
          size: 32,
          dataLabels: {
            enabled: true,
            distance: 1,
            halo: false,
            style: '{"fontSize": "6px"}',
            formatter: function() {
              return this.point.name; //+ ':' + this.point.percentage + '%';
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
        }
      },
      series: [{
        type: 'pie',
        innerSize: '0%',
        data: [
          ['v1', n],
          ['v2', 100 - n]
        ]
      }]
    });
  }
});

