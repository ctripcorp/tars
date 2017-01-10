/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 16, 2014
 */

$import("js.text.Format", "BootstrapClassLoader");

Class.forName({
  name: "abstract class js.text.DateFormat extends js.text.Format",

  '@Gatter @Setter protected calendar': null,

  /**
   * Useful constant for ERA field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int ERA_FIELD": 0,

  /**
   * Useful constant for YEAR field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int YEAR_FIELD": 1,

  /**
   * Useful constant for MONTH field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int MONTH_FIELD": 2,

  /**
   * Useful constant for DATE field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int DATE_FIELD": 3,

  /**
   * Useful constant for one-based HOUR_OF_DAY field alignment. Used in
   * FieldPosition of date/time formatting. HOUR_OF_DAY1_FIELD is used for the
   * one-based 24-hour clock. For example, 23:59 + 01:00 results in 24:59.
   */
  "public final static int HOUR_OF_DAY1_FIELD": 4,

  /**
   * Useful constant for zero-based HOUR_OF_DAY field alignment. Used in
   * FieldPosition of date/time formatting. HOUR_OF_DAY0_FIELD is used for the
   * zero-based 24-hour clock. For example, 23:59 + 01:00 results in 00:59.
   */
  "public final static int HOUR_OF_DAY0_FIELD": 5,

  /**
   * Useful constant for MINUTE field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int MINUTE_FIELD": 6,

  /**
   * Useful constant for SECOND field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int SECOND_FIELD": 7,

  /**
   * Useful constant for MILLISECOND field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int MILLISECOND_FIELD": 8,

  /**
   * Useful constant for DAY_OF_WEEK field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int DAY_OF_WEEK_FIELD": 9,

  /**
   * Useful constant for DAY_OF_YEAR field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int DAY_OF_YEAR_FIELD": 10,

  /**
   * Useful constant for DAY_OF_WEEK_IN_MONTH field alignment. Used in
   * FieldPosition of date/time formatting.
   */
  "public final static int DAY_OF_WEEK_IN_MONTH_FIELD": 11,

  /**
   * Useful constant for WEEK_OF_YEAR field alignment. Used in FieldPosition
   * of date/time formatting.
   */
  "public final static int WEEK_OF_YEAR_FIELD": 12,

  /**
   * Useful constant for WEEK_OF_MONTH field alignment. Used in FieldPosition
   * of date/time formatting.
   */
  "public final static int WEEK_OF_MONTH_FIELD": 13,

  /**
   * Useful constant for AM_PM field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int AM_PM_FIELD": 14,

  /**
   * Useful constant for one-based HOUR field alignment. Used in FieldPosition
   * of date/time formatting. HOUR1_FIELD is used for the one-based 12-hour
   * clock. For example, 11:30 PM + 1 hour results in 12:30 AM.
   */
  "public final static int HOUR1_FIELD": 15,

  /**
   * Useful constant for zero-based HOUR field alignment. Used in
   * FieldPosition of date/time formatting. HOUR0_FIELD is used for the
   * zero-based 12-hour clock. For example, 11:30 PM + 1 hour results in 00:30
   * AM.
   */
  "public final static int HOUR0_FIELD": 16,

  /**
   * Useful constant for TIMEZONE field alignment. Used in FieldPosition of
   * date/time formatting.
   */
  "public final static int TIMEZONE_FIELD": 17,

  DateFormat: function() {},

  /** 格式化一个对象以生成一个字符串。 */
  'final format': function(obj) {

    if (Object.isDate(obj))
      return this.formatDate(obj).toString();
    else if (Object.isNumber(obj))
      return this.formatDate(new Date(obj)).toString();
    else
      throw new js.lang.IllegalArgumentException(
        "Cannot format given Object as a Date");
  },

  /** 格式化一个对象以生成一个字符串。 */
  'abstract formatDate': function(date) {},

  /** 从给定字符串的开始分析文本，以生成一个日期。 */
  'abstract parse': function(source) {}

});

