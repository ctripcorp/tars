$import("com.ctrip.tars.base.Service");
$import("com.ctrip.tars.util.Fridge");

Class.forName({
  name: "class com.ctrip.tars.base.PaginationService extends com.ctrip.tars.base.Service",

  PaginationService: function() {},

  "public static final SCOUR": -1,
  "public static final REPLACE": 0,
  "public static final INSERT": 1,
  "public static final APPEND": 2,

  "@Setter @Getter private pageSize": PAGE_SIZE,

  "private data": {
    count: 0,
    next: null,
    pageCount: 0,
    data: new com.ctrip.tars.util.Fridge()
  },

  count: function() {
    return this.data.count;
  },

  size: function() {
    return this.data.data.length;
  },

  getData: function() {
    return this.data.data;
  },

  clear: function() {
    this.data.count = 0;
    this.data.next = null;
    this.data.pageCount = 0;
    this.data.data.clear();
    this.update();
  },

  "protected parse": function(data, params, mode) {
    var results = data.results || [];

    switch (mode) {
      case com.ctrip.tars.base.PaginationService.REPLACE:
        this.data.data.replace(results, "id");
        break;
      case com.ctrip.tars.base.PaginationService.SCOUR:
        this.data.data.scour(results, "id");
        break;
      case com.ctrip.tars.base.PaginationService.INSERT:
        this.data.data.insert(results);
        break;
      case com.ctrip.tars.base.PaginationService.APPEND:
      default:
        this.data.data.append(results);
        break;
    }

    this.data.count = data.count;
    this.data.next = data.next;
  },

  first: function(path, filters, sorters, callback) {
    this.clear();
    this.loadData(this.getUrl(path), filters, sorters, {
      page_size: this.pageSize,
      page: 1
    }, function() {
      this.update(callback);
    }, com.ctrip.tars.base.PaginationService.REPLACE);
  },

  refresh: function(path, filters, sorters, callback) {
    this.loadData(this.getUrl(path), filters, sorters, {
      page_size: Math.max(this.size(), this.pageSize),
      page: 1
    }, function() {
      this.update(callback);
    }, com.ctrip.tars.base.PaginationService.SCOUR);
  },

  next: function(callback) {
    this.loadData(this.data.next, null, null, null, function() {
      this.update(callback);
    }, com.ctrip.tars.base.PaginationService.APPEND);
  },

  filterData: function(map, callback) {
    var data = [];
    for (var i = 0, len = this.data.data.length; i < len; i++) {
      var obj = this.data.data[i];

      if (obj) {
        for (var key in map) {
          var value = map[key];

          if (obj[key] !== value) {
            obj = null;
            break;
          }
        }
      }

      if (obj) {
        data.push(obj);
        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback(i, obj, this.data.data);
        }
      }
    }
    return data;
  }
});

