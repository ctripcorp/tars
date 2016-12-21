Highcharts.theme = {
  colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
  chart: {
    backgroundColor: null,
    spacing: [0, 0, 0, 0],
    style: {
      fontFamily: "Microsoft YaHei, sans-serif",
      color: "#757575"
    }
  },
  title: {
    margin: 4,
    style: {
      fontSize: '10px',
      fontWeight: 100,
      textTransform: 'uppercase',
      color: "#757575"
    }
  },
  tooltip: {
    borderRadius: 24,
    borderWidth: 0,
    shadow: false,
    backgroundColor: "rgba(0,0,0,0.3)",
    style: {
      fontSize: '8px',
      fontWeight: 100,
      color: "rgba(255,255,255,0.72)"
    }
  },
  legend: {
    itemStyle: {
      fontWeight: 100,
      fontSize: '8px',
      color: "rgba(255,255,255,0.72)"
    },
    itemMarginBottom: 3,
    itemMarginTop: -3,
    itemDistance: 24,
    borderRadius: 0,
    borderWidth: 0,
    symbolHeight: 0,
    lineHeight: 12,
    verticalAlign: "bottom",
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    margin: 0
  },
  xAxis: {
    gridLineColor: "rgba(0,0,0,0.05)",
    gridLineWidth: 1,
    gridLineDashStyle: "solid",
    labels: {
      style: {
        fontSize: '8px',
        fontWeight: 100,
        color: "#607D8B"
      }
    }
  },
  yAxis: {
    gridLineColor: "rgba(0,0,0,0.05)",
    gridLineWidth: 0,
    gridLineDashStyle: "solid",
    minorTickInterval: 'auto',
    minorGridLineWidth: 1,
    minorGridLineColor: "rgba(0,0,0,0.05)",
    minorGridLineDashStyle: "solid",
    title: {
      style: {
        textTransform: 'uppercase',
        color: "#607D8B"
      }
    },
    labels: {
      style: {
        fontSize: '8px',
        fontWeight: 100,
        color: "#607D8B"
      }
    }
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 0.8
    }
  }
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);

