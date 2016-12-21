$import("com.ctrip.tars.base.PaginationService");
$import("com.ctrip.tars.util.SegmentTable");

Class.forName({
  name: "class com.ctrip.tars.base.SegmentService extends com.ctrip.tars.base.PaginationService",
  SegmentService: function() {},

  "private data": {
    count: 0,
    next: null,
    pageCount: 0,
    data: new com.ctrip.tars.util.SegmentTable()
  },

  size: function() {
    return this.data.data.size();
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
      page_size: this.pageSize,
      page: filters.page
    }, function() {
      this.update(callback);
    }, com.ctrip.tars.base.PaginationService.SCOUR);
  },

  next: function(callback) {
    this.loadData(this.data.next, null, null, null, function() {
      this.update(callback);
    }, com.ctrip.tars.base.PaginationService.APPEND);
  },

  "protected parse": function(data, params, mode) {
    var results = data.results || [];

    if (!params.page) {
      return;
    }

    if (Object.isString(params.page)) {
      params.page = parseInt(params.page);
    }

    this.data.data.update(params.page - 1, results);

    this.data.count = data.count;

    if (params.page >= this.data.pageCount) {
      this.data.next = data.next;
      this.data.pageCount = params.page;
    }
  }
});

