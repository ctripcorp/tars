/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年6月25日
 */

Class.forName({
  name: "class Date",
  alias: "js.util.Date",
  Date: function() {},
  "public equals": function(s) {
    if (Object.isNull(s) || !Object.isInstanceof(s, js.util.Date)) {
      return false;
    }
    return this === s || this.getTime() == s.getTime();
  },
  /**Tests if this date is after the specified date.*/
  "public after": function(when) {
    return this.compareTo(when) > 0;
  },

  /** Tests if this date is before the specified date.*/
  "public before": function(when) {
    return this.compareTo(when) < 0;
  },

  "public compareTo": function(anotherDate) {
    if (Object.isNull(anotherDate)) {
      throw new js.lang.IllegalArgumentException("Parameters of the compareTo method of the Date object to receive only not null type");
    }
    if (!Object.isDate(anotherDate)) {
      throw new js.lang.IllegalArgumentException("Parameters of the compareTo method of the Date object to receive only Date type");
    }
    var thisTime = this.getTime(),
      anotherTime = anotherDate.getTime();
    return thisTime > anotherTime ? 1 : thisTime == anotherTime ? 0 : -1;
  }

});

