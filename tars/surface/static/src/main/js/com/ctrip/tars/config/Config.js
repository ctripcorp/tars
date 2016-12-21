URL_DATE_FORMAT = "YYYYMMDDHHmmss";

PAGE_SIZE = 10;

INTERVAL_TIMER = 3000;

BASE_URL = "/api/v1/";

TEST_URL = '/static/src/test/api/';

DEBUG = !!js.lang.ClassLoader.getSystemClassLoader().getDebug();

VERSION = js.lang.ClassLoader.getSystemClassLoader().getVersion();

ROOT_URL = (DEBUG ? '/static/src/main/' : '/static/classes/');

HIGH_CHART_HEIGHT = 40;
HIGH_CHART_MARGIN = 10;
HIGH_CHART_ROWS = 4;
HIGH_CHART_OFFSET = 156;

ROMOTE_CONNECTION = 3000;
RESIZE_LISTENER = 3000;
WELCOME_LISTENER = 500;

MAIN_VIEW_POINT = 272 + 16;

CONCERN = [134, 64];

URL_PARAMS = {
  DEBUG: "debug",
  HOUR: "hour",
  APPS: "apps",
  APP: "app",
  GROUP: "group",
  DEPLOYMENT: "deployment",
  SEARCH: "search",
  FROM_DATE: "fromDate",
  TO_DATE: "toDate",
  NAVIGATOR_FROM_DATE: "navigatorFromDate",
  NAVIGATOR_TO_DATE: "navigatorToDate",
  DYNC: "dync",
  TIMESTAMP: "timestamp"
};

SERIES = {

  // 第一级  type
  MEMORY: "memCurrSeries",
  CPU: "cpuCurrSeries",
  FATAL: "fatalCurrSeries",
  ERROR: "errorCurrSeries",
  VISIT: "visitCurrSeries",
  ERRORVISIT: "errorVisitSeries",
  COST: "costCurrSeries",

  EXCEPTION: "exceptionSeries",

  TYPE2DESC: {
    memCurrSeries: "内存使用率",
    cpuCurrSeries: "Cpu使用率",
    errorCurrSeries: "ERROR数",
    fatalCurrSeries: "FATAL ERROR数",
    visitCurrSeries: "访问数",
    errorVisitSeries: "ER比",
    costCurrSeries: "HTTP响应时间",

    releaseSeries: "应用发布",
    warningSeries: "报警",

    exceptionSeries: "特定错误数"
  },

  // 第二级  current or previous
  CURRENT: "current",
  ROUND: "round",
  SUB: "sub",
  MARK: "mark",
  MINUTE: "minute",
  WEEK: "week",

  BASE: "base",
  EBASE: "ebase",
  FBASE: "fbase",
  WBASE: "wbase",

  CURORPRE2DESC: {
    current: "当前",
    round: "环比",
    sub: "sub",
    mark: "基准",
    minute: "前n分钟的ER比平均值",
    week: "前n周ER比平均值",

    base: "基线",
    wbase: "报警线",
    ebase: "严重错误线",
    fbase: "自动回退基线"
  },

  HOST_TOTAL: "hostTotal",
  HOST_TOTAL2DESC: "",

  ANY: "[^,]+"
};

// check /tars/deployment/constants.py
/*
DEPLOYMENT_STATUS = {
  'running': ['PENDING', 'SMOKING', 'BAKING', 'ROLLING_OUT', 'SMOKE_BRAKED',
    'BAKE_BRAKED', 'ROLLOUT_BRAKED'
  ],
  'failure': ['SMOKE_FAILURE', 'BAKE_FAILURE', 'ROLLOUT_FAILURE', 'FAILURE'],
  'braked': ['SMOKE_BRAKED', 'BAKE_BRAKED', 'ROLLOUT_BRAKED',
    'SMOKE_SUCCESS_BRAKED', 'BAKE_SUCCESS_BRAKED', 'ROLLOUT_SUCCESS_BRAKED',
    'SMOKE_FAILURE_BRAKED', 'BAKE_FAILURE_BRAKED', 'ROLLOUT_FAILURE_BRAKED'
  ]
};
*/

