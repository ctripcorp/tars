/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年9月29日
 */

$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.util.Calendar", "BootstrapClassLoader");
$import("js.util.GregorianCalendar", "BootstrapClassLoader");
$import("js.test.Assert", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.util.TestCalendar extends js.test.TestCase",
  "@Setter @Getter private calendar": null,

  "@Setter @Getter private static staticField": 1,

  "@Setter @Getter private field": 2,

  TestCalendar: function() {},

  "@BeforeClass public static setUpBeforeClass": function() {
    js.test.Assert.assertTrue("类test.util.TestCalendar中的setUpBeforeClass方法测试不通过", this.staticField === 1);
    js.test.Assert.assertTrue("类test.util.TestCalendar中的setUpBeforeClass方法测试不通过", this.field === null);
  },

  "@AfterClass public static tearDownAfterClass": function() {
    js.test.Assert.assertTrue("类test.util.TestCalendar中的setUpBeforeClass方法测试不通过", this.staticField === 1);
    js.test.Assert.assertTrue("类test.util.TestCalendar中的setUpBeforeClass方法测试不通过", this.field === null);
  },

  "@Before public setUp": function() {
    this.setCalendar(js.util.Calendar.getInstance());
    this.getCalendar().setTimeInMillis(0);
  },

  "@After public tearDown": function() {},

  "@Test testAfter": function() {
    js.test.Assert.assertTrue("类js.util.Calendar中的after方法测试不通过", js.util.Calendar.getInstance().after(this.getCalendar()));
  },

  "@Test testBefore": function() {
    js.test.Assert.assertTrue("类js.util.Calendar中的before方法测试不通过", this.getCalendar().before(js.util.Calendar.getInstance()));
  },

  "@Test testClear": function() {
    this.getCalendar().clear(js.util.Calendar.YEAR);
    js.test.Assert.assertTrue("类js.util.Calendar中的clear方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1970);

    this.getCalendar().clear();
    js.test.Assert.assertTrue("类js.util.Calendar中的clear方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 0);

  },

  "@Test testClone": function() {
    js.test.Assert.assertTrue("类js.util.Calendar中的clone方法测试不通过", this.getCalendar().clone().compareTo(this.getCalendar()) === 0);
  },

  "@Test testCompareTo": function() {
    js.test.Assert.assertTrue("类js.util.Calendar中的compareTo方法测试不通过", js.util.Calendar.getInstance().compareTo(this.getCalendar()) > 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的compareTo方法测试不通过", this.getCalendar().compareTo(js.util.Calendar.getInstance()) < 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的compareTo方法测试不通过", this.getCalendar().clone().compareTo(this.getCalendar()) === 0);
  },

  "@Test testEquals": function() {

    js.test.Assert.assertTrue("类js.util.Calendar中的equals方法测试不通过", this.getCalendar().clone().equals(this.getCalendar()));
    js.test.Assert.assertTrue("类js.util.Calendar中的equals方法测试不通过", !this.getCalendar().clone().equals(js.util.Calendar.getInstance()));
  },

  "@Test testGet": function() {

    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(YEAR) 正确值：1970 实际值：" + this.getCalendar().get(js.util.Calendar.YEAR), this.getCalendar().get(js.util.Calendar.YEAR) === 1970);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(MONTH) 正确值：0 实际值：" + this.getCalendar().get(js.util.Calendar.MONTH), this.getCalendar().get(js.util.Calendar.MONTH) === 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(WEEK_OF_YEAR) 正确值：1 实际值：" + this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR), this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(WEEK_OF_MONTH) 正确值：1 实际值：" + this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH), this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(DAY_OF_MONTH) 正确值：1 实际值：" + this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH), this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(DAY_OF_YEAR) 正确值：1 实际值：" + this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR), this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(DAY_OF_WEEK) 正确值：5 实际值：" + this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK), this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(DAY_OF_WEEK_IN_MONTH) 正确值：1 实际值：" + this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH), this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(AM_PM) 正确值：0 实际值：" + this.getCalendar().get(js.util.Calendar.AM_PM), this.getCalendar().get(js.util.Calendar.AM_PM) === 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(HOUR) 正确值：8 实际值：" + this.getCalendar().get(js.util.Calendar.HOUR), this.getCalendar().get(js.util.Calendar.HOUR) === 8);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(HOUR_OF_DAY) 正确值：8 实际值：" + this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY), this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) === 8);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(MINUTE) 正确值：0 实际值：" + this.getCalendar().get(js.util.Calendar.MINUTE), this.getCalendar().get(js.util.Calendar.MINUTE) === 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(SECOND) 正确值：0 实际值：" + this.getCalendar().get(js.util.Calendar.SECOND), this.getCalendar().get(js.util.Calendar.SECOND) === 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的get方法测试不通过 get(MILLISECOND) 正确值：0 实际值：" + this.getCalendar().get(js.util.Calendar.MILLISECOND), this.getCalendar().get(js.util.Calendar.MILLISECOND) === 0);
  },

  "@Test testGetInstance": function() {
    js.test.Assert.assertTrue("类js.util.Calendar中的getInstance方法测试不通过", Object.isNull(this.getCalendar()) || Object.isInstanceof(this.getCalendar(), js.util.Calendar));
  },

  "@Test testGetTime": function() {
    js.lang.System.out.println(this.getCalendar().getTime());
    js.test.Assert.assertTrue("类js.util.Calendar中的getTime方法测试不通过", this.getCalendar().getTime().compareTo(new Date(0)) === 0);
  },

  "@Test testGetTimeInMillis": function() {
    js.test.Assert.assertTrue("类js.util.Calendar中的getTime方法测试不通过", this.getCalendar().getTimeInMillis() === 0);
  },

  "@Test testSet": function() {

    //12小时制
    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);
    this.getCalendar().set(js.util.Calendar.MONTH, 3);
    this.getCalendar().set(js.util.Calendar.DAY_OF_MONTH, 10);
    this.getCalendar().set(js.util.Calendar.AM_PM, 1);
    this.getCalendar().set(js.util.Calendar.HOUR, 10);
    this.getCalendar().set(js.util.Calendar.MINUTE, 10);
    this.getCalendar().set(js.util.Calendar.SECOND, 10);
    this.getCalendar().set(js.util.Calendar.MILLISECOND, 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 3);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 15);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 100);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 6);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.AM_PM) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) === 22);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MINUTE) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.SECOND) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MILLISECOND) === 10);

    //24小时制
    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);
    this.getCalendar().set(js.util.Calendar.DAY_OF_WEEK, 5);
    this.getCalendar().set(js.util.Calendar.HOUR_OF_DAY, 22);
    this.getCalendar().set(js.util.Calendar.MINUTE, 10);
    this.getCalendar().set(js.util.Calendar.SECOND, 10);
    this.getCalendar().set(js.util.Calendar.MILLISECOND, 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.AM_PM) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) === 22);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MINUTE) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.SECOND) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MILLISECOND) === 10);

    //DAY_OF_YEAR  一年中的第几天
    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);
    this.getCalendar().set(js.util.Calendar.DAY_OF_YEAR, 100);
    this.getCalendar().set(js.util.Calendar.HOUR_OF_DAY, 22);
    this.getCalendar().set(js.util.Calendar.MINUTE, 10);
    this.getCalendar().set(js.util.Calendar.SECOND, 10);
    this.getCalendar().set(js.util.Calendar.MILLISECOND, 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 3);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 15);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 100);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 6);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.AM_PM) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) === 22);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MINUTE) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.SECOND) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MILLISECOND) === 10);

    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.DAY_OF_YEAR, 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 1);

    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.DAY_OF_YEAR, 31);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 31);

    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.DAY_OF_YEAR, 32);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 1);

    //DAY_OF_WEEK : 月中的第一个周几
    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);
    this.getCalendar().set(js.util.Calendar.MONTH, 3);
    this.getCalendar().set(js.util.Calendar.DAY_OF_WEEK, 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 3);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 14);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 92);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 1);

    //WEEK_OF_MONTH : 按照日历中的第几周的周天 下标从1开始
    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);
    this.getCalendar().set(js.util.Calendar.MONTH, 3);
    this.getCalendar().set(js.util.Calendar.WEEK_OF_MONTH, 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 14);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 29);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 88);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 5);

    // DAY_OF_WEEK_IN_MONTH : 按照日历中的第几周的周天 下标从0开始
    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);
    this.getCalendar().set(js.util.Calendar.MONTH, 3);
    this.getCalendar().set(js.util.Calendar.DAY_OF_WEEK_IN_MONTH, 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 3);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 15);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 95);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 1);

    this.getCalendar().clear();
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);
    this.getCalendar().set(js.util.Calendar.MONTH, 3);
    this.getCalendar().set(js.util.Calendar.DAY_OF_WEEK_IN_MONTH, 0);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的set方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 29);
  },

  "@Test testIsSet": function() {
    this.getCalendar().set(js.util.Calendar.YEAR, 1987);

    js.test.Assert.assertTrue("类js.util.Calendar中的isFieldSet方法测试不通过", this.getCalendar().isFieldSet(js.util.Calendar.YEAR));
  },

  "@Test testSetDate": function(year, month, date, hourOfDay, minute, second) {
    this.getCalendar().setDate(1987, 3, 10, 22, 10, 10);

    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 3);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 15);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 100);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 6);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.AM_PM) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) === 22);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.MINUTE) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setDate方法测试不通过", this.getCalendar().get(js.util.Calendar.SECOND) === 10);

  },

  "@Test testSetTime": function(date) {
    this.getCalendar().setTime(new Date(545062210010));

    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 3);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 15);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 100);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 6);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.AM_PM) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) === 22);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.MINUTE) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTime方法测试不通过", this.getCalendar().get(js.util.Calendar.SECOND) === 10);
  },

  "@Test testSetTimeInMillis": function(millis) {

    this.getCalendar().setTimeInMillis(545062210010);

    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) === 1987);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) === 3);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) === 15);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) === 100);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) === 6);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) === 2);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.AM_PM) === 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) === 22);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.MINUTE) === 10);
    js.test.Assert.assertTrue("类js.util.Calendar中的setTimeInMillis方法测试不通过", this.getCalendar().get(js.util.Calendar.SECOND) === 10);

  },

  "@Test testToString": function() {
    js.lang.System.out.println(this.getCalendar().toString());
  }
});

new test.util.TestCalendar();

