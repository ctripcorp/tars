/**
 * Created by lico on 14-3-20.
 */
Class
  .forName({
    name: "class com.ctrip.tars.util.Chart extends Object",

    "private static tokenize": function(timelineName) {
      return timelineName.split(",");
    },
    "private static getTimelineType": function(timelineName) {
      return com.ctrip.tars.util.Chart.tokenize(timelineName)[0];
    },
    "private static getTimelineCurOrPrev": function(timelineName) {
      return com.ctrip.tars.util.Chart.tokenize(timelineName)[1];
    },
    "private static getTimelineHost": function(timelineName) {
      return com.ctrip.tars.util.Chart.tokenize(timelineName)[2];
    },

    "static excludeSeries": function(series) {
      return "highcharts-navigator-series" == series.options.id || "pie" == series.options.id;
    },

    "static excludeSeries2": function(series) {
      return com.ctrip.tars.util.Chart.isRollingSeries(series) || com.ctrip.tars.util.Chart.excludeSeries3(series);
    },

    "static excludeSeries3": function(series) {
      return (series.options.id && (series.options.id.indexOf("highcharts-series-warning-flags-") != -1)) || com.ctrip.tars.util.Chart.excludeSeries(series);
    },

    "static isExpSeries": function(series) {
      return series.options.id.indexOf("highcharts-series-exp-") != -1;
    },
    "static isRollingSeries": function(series) {
      return (series.options.id && (series.options.id.indexOf("highcharts-series-rollout-flags-") != -1 || series.options.id.indexOf("highcharts-series-rollout-area-") != -1 || series.options.id.indexOf("highcharts-series-rollout-spline-") != -1));
    },

    "static isRollingSplines": function(series) {
      return (series.options.id && series.options.id.indexOf("highcharts-series-rollout-spline-") != -1);
    },

    "static isNavigator": function(seriesId) {
      return SERIES.ERRORVISIT == com.ctrip.tars.util.Chart.getTimelineType(seriesId) && SERIES.CURRENT == com.ctrip.tars.util.Chart.getTimelineCurOrPrev(seriesId);
    },

    "static isErrorVisitBASE": function(seriesId) {
      return SERIES.ERRORVISIT == com.ctrip.tars.util.Chart.getTimelineType(seriesId) && SERIES.BASE == com.ctrip.tars.util.Chart.getTimelineCurOrPrev(seriesId) && SERIES.FLAG_AGGR == com.ctrip.tars.util.Chart.getTimelineFlag(seriesId);
    },

    "static timelineName2SeriesName": function(timelineName, debug) {
      var type = SERIES.TYPE2DESC[com.ctrip.tars.util.Chart.getTimelineType(timelineName)];

      // In legend, we only show servers.
      var host = com.ctrip.tars.util.Chart.getTimelineHost(timelineName);
      host = (host == SERIES.HOST_TOTAL ? SERIES.HOST_TOTAL2DESC : host);

      var curOrPrev = com.ctrip.tars.util.Chart.getTimelineCurOrPrev(timelineName);
      var current = curOrPrev == SERIES.CURRENT;
      curOrPrev = SERIES.CURORPRE2DESC[curOrPrev];

      var ret = (current ? (type + " " + host + " ") : " ") + curOrPrev;

      return debug ? (timelineName + ": " + ret) : ret;
    },

    "static getDataForNavigator": function(seriesArray) {

      var seriesForNavigator = {
        type: 'areaspline',
        color: '#4572A7',
        fillOpacity: 0.4,
        dashStyle: "Solid",
        dataGrouping: {
          smoothed: true
        },
        lineWidth: 1,
        marker: {
          enabled: false
        },
        // visible : false,
        shadow: false,
        data: []
      };
      if (seriesArray && seriesArray.length > 0) {

        for (var i in seriesArray) {
          var series = seriesArray[i];
          var timelineName = series.id;

          if (!timelineName) {
            continue;
          }

          if (com.ctrip.tars.util.Chart.isNavigator(timelineName)) {
            // && SERIES.HOST_TOTAL ==
            // com.ctrip.tars.util.Chart.getTimelineHost(timelineName)
            seriesForNavigator.data = series.data;
            // console.log("Series for navigator selected B: " +
            // series.id);
            return seriesForNavigator;
          }
        }

        seriesForNavigator.data = seriesArray[0].data;
        return seriesForNavigator;

      }
      return seriesForNavigator;
    },
    "static getDashStyle": function(type) {
      var dashStyle = "";
      switch (type) {
        // case SERIES.SUB:
        case SERIES.CURRENT:
        case SERIES.ROUND:
        case SERIES.BASE:
        case SERIES.WBASE:
        case SERIES.EBASE:
          dashStyle = 'Solid';
          break;
        case SERIES.MARK:
          dashStyle = 'ShortDot';
          break;
        case SERIES.MINUTE:

          dashStyle = 'ShortDash';
          break;
        case SERIES.WEEK:
          dashStyle = 'ShortDashDotDot';
          break;
        default:
          dashStyle = 'Dot';
          break;

      }
      return dashStyle;
    },

    "static getPattern": function(keys) {

      var pattern = "^";
      pattern += keys.join(",");
      pattern += "$";
      return new RegExp(pattern);
    },

    "static setSeriesColors": function(seriesArray) {
      for (var i in seriesArray) {
        var series = seriesArray[i];
        var timelineName = series.id;
        if (!timelineName) {
          continue;
        }

        if ((timelineName.indexOf("highcharts-series-warning-flags-") != -1)) {
          series.style = {
            color: 'rgba(255,255,255,0)' // 'white'
          };
        } else if ((timelineName.indexOf("highcharts-series-rollout-flags-") != -1)) {
          series.color = "rgba(52,128,0,0.8)";
          series.fillColor = "rgba(52,128,0,0.8)";
          series.style = {
            color: 'white'
          };
          series.states = {
            hover: {
              fillColor: 'rgba(96,96,0,0.8)'
            }
          };
          continue;
        }
        if ((timelineName.indexOf("highcharts-series-rollout-area-") != -1)) {
          series.color = "rgba(96,179,0,0.8)";
          series.fillColor = "rgba(96,179,0,0.1)";
          continue;
        }
        if ((timelineName.indexOf("highcharts-series-rollout-spline-") != -1)) {
          series.color = "rgba(96,179,0,0.8)";
          continue;
        }

        var timelineType = com.ctrip.tars.util.Chart.getTimelineType(timelineName);
        var timelineType2 = com.ctrip.tars.util.Chart.getTimelineCurOrPrev(timelineName);
        // if (timelineHost != SERIES.HOST_TOTAL)
        // continue;
        if (timelineType2 == SERIES.BASE) {
          series.color = "#212121";
        } else if (timelineType2 == SERIES.WBASE) {
          series.color = "#ff9800";
        } else if (timelineType2 == SERIES.EBASE) {
          series.color = "#e84e40";
        } else if (timelineType2 == SERIES.MARK) {
          series.color = "#404040";
        } else if (timelineType2 == SERIES.MINUTE) {
          series.color = "#ff001a";
        } else if (timelineType2 == SERIES.WEEK) {
          series.color = "#b30012";
        } else if (SERIES.MEMORY == timelineType) {
          series.color = "#99CC00";
        } else if (SERIES.CPU == timelineType) {
          series.color = "#99CCFF";
        } else if (SERIES.ERROR == timelineType) {
          series.color = "#ffcc00";
        } else if (SERIES.FATAL == timelineType) {
          series.color = "#FF6600";
        } else if (SERIES.VISIT == timelineType) {
          series.color = "#cddc39";
        } else if (SERIES.COST == timelineType) {
          series.color = "#9966cc";
        } else {
          series.color = "#0b8284";
        }
      }
    },
    "static translateData": function(globalData, range, host) {

      var dataTable = new js.util.HashMap();

      range = range || [];

      var cpuCurrs = [],
        cpuRounds = [],
        memCurrs = [],
        memRounds = [];
      var errLogCurrs = [],
        errLogRounds = [],
        fatalLogCurrs = [],
        fatalLogRounds = [];
      var visitCurrs = [],
        visitRounds = [];
      var errorVisitCurrs = [],
        erBaselines = [],
        erBaselineWarnings = [],
        erBaselineErrors = [];
      var costCurrs = [],
        costRounds = [];
      var expCurrs = [],
        expRounds = [];
      var data = globalData.data;
      for (var i in data) {
        var d = data[i];

        if (range.contains(SERIES.EXCEPTION)) {
          expCurrs.push([d.monitorTime, d.currentCount || 0]);
          expRounds.push([d.monitorTime, d.roundCount || 0]);
        }

        if (range.contains(SERIES.CPU)) {
          cpuCurrs.push([d.monitorTime, d.cpuCurr || 0]);
          cpuRounds.push([d.monitorTime, d.cpuRound || 0]);
        }

        if (range.contains(SERIES.MEMORY)) {
          memCurrs.push([d.monitorTime, d.memCurr || 0]);
          memRounds.push([d.monitorTime, d.memRound || 0]);
        }

        if (range.contains(SERIES.ERROR)) {
          errLogCurrs.push([d.monitorTime, d.errLogCurr || 0]);
          errLogRounds.push([d.monitorTime, d.errLogRound || 0]);
        }

        if (range.contains(SERIES.FATAL)) {
          fatalLogCurrs.push([d.monitorTime, d.fatalLogCurr || 0]);
          fatalLogRounds.push([d.monitorTime, d.fatalLogRound || 0]);
        }

        if (range.contains(SERIES.VISIT)) {
          visitCurrs.push([d.monitorTime, d.visitCurr || 0]);
          visitRounds.push([d.monitorTime, d.visitRound || 0]);
        }

        if (range.contains(SERIES.ERRORVISIT)) {
          errorVisitCurrs.push([d.monitorTime, d.errorVisitCurr || 0]);
          erBaselines.push([d.monitorTime, d.erBaseline || 0]);
          erBaselineWarnings.push([d.monitorTime, d.erBaselineWarning || 0]);
          erBaselineErrors.push([d.monitorTime, d.erBaselineError || 0]);
        }

        if (range.contains(SERIES.COST)) {
          costCurrs.push([d.monitorTime, d.costCurr || 0]);
          costRounds.push([d.monitorTime, d.costRound || 0]);
        }
      }

      var currentKeys = null;

      if (range.contains(SERIES.EXCEPTION)) {

        currentKeys = [SERIES.EXCEPTION, SERIES.CURRENT, globalData.exceptType];
        dataTable.put(currentKeys.join(","), expCurrs);

        currentKeys = [SERIES.EXCEPTION, SERIES.ROUND, globalData.exceptType];
        dataTable.put(currentKeys.join(","), expRounds);
      }

      if (range.contains(SERIES.ERRORVISIT)) {
        currentKeys = [SERIES.ERRORVISIT, SERIES.CURRENT, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), errorVisitCurrs);

        currentKeys = [SERIES.ERRORVISIT, SERIES.BASE, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), erBaselines);

        currentKeys = [SERIES.ERRORVISIT, SERIES.WBASE, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), erBaselineWarnings);

        currentKeys = [SERIES.ERRORVISIT, SERIES.EBASE, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), erBaselineErrors);
      }

      if (range.contains(SERIES.VISIT)) {
        currentKeys = [SERIES.VISIT, SERIES.CURRENT, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), visitCurrs);

        currentKeys = [SERIES.VISIT, SERIES.ROUND, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), visitRounds);
      }

      if (range.contains(SERIES.ERROR)) {
        currentKeys = [SERIES.ERROR, SERIES.CURRENT, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), errLogCurrs);

        currentKeys = [SERIES.ERROR, SERIES.ROUND, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), errLogRounds);

      }

      if (range.contains(SERIES.FATAL)) {
        currentKeys = [SERIES.FATAL, SERIES.CURRENT, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), fatalLogCurrs);

        currentKeys = [SERIES.FATAL, SERIES.ROUND, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), fatalLogRounds);
      }
      if (range.contains(SERIES.COST)) {
        currentKeys = [SERIES.COST, SERIES.CURRENT, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), costCurrs);

        currentKeys = [SERIES.COST, SERIES.ROUND, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), costRounds);

      }

      if (range.contains(SERIES.CPU)) {

        currentKeys = [SERIES.CPU, SERIES.CURRENT, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), cpuCurrs);

        currentKeys = [SERIES.CPU, SERIES.ROUND, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), cpuRounds);
      }

      if (range.contains(SERIES.MEMORY)) {
        currentKeys = [SERIES.MEMORY, SERIES.CURRENT, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), memCurrs);

        currentKeys = [SERIES.MEMORY, SERIES.ROUND, host || SERIES.HOST_TOTAL];
        dataTable.put(currentKeys.join(","), memRounds);
      }
      return dataTable;
    },
    "static buildSeries": function(data, range, host) {

      var seriesMap = new js.util.HashMap(),
        plotBands = [],
        plotLines = [];

      var dataTable = com.ctrip.tars.util.Chart.translateData(data, range, null);

      var iterator = dataTable.entrySet().iterator();
      while (iterator.hasNext()) {
        var entry = iterator.next();
        var timelineName = entry.getKey();
        var timeline = entry.getValue();

        var dashStyle = com.ctrip.tars.util.Chart.getDashStyle(com.ctrip.tars.util.Chart.getTimelineCurOrPrev(timelineName));

        var type = com.ctrip.tars.util.Chart.getTimelineType(timelineName),
          curOrPrev = com.ctrip.tars.util.Chart
          .getTimelineCurOrPrev(timelineName),
          current = (curOrPrev == SERIES.CURRENT);

        var series = {
          type: current ? 'areaspline' : 'spline',
          id: timelineName,
          name: com.ctrip.tars.util.Chart.timelineName2SeriesName(timelineName),
          visible: true,
          dashStyle: dashStyle,
          shadow: false,
          lineWidth: 2,
          dataGrouping: {
            approximation: 'open'
          },
          data: timeline,
          tooltip: {
            pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
          }
        };

        var seriesArray = seriesMap.get(type);
        if (seriesArray) {
          seriesArray.push(series);
        } else {
          seriesMap.put(type, [series]);
        }
      }

      return {
        series: seriesMap,
        plotLines: plotLines,
        plotBands: plotBands
      };
    }
  });

