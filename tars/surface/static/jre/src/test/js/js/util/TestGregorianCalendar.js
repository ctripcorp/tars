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
  name: "class test.util.TestGregorianCalendar extends js.test.TestCase",
  "@Setter @Getter private calendar": new js.util.GregorianCalendar(),
  TestGregorianCalendar: function() {},

  "@Before public setUp": function() {
    js.lang.System.out.println("setUp");

    this.setCalendar(js.util.Calendar.getInstance());
    this.getCalendar().setTimeInMillis(545062210010);
  },

  "@Test testAdd": function() {

    this.getCalendar().add(js.util.Calendar.YEAR, -10);
    this.getCalendar().add(js.util.Calendar.MONTH, 25);
    this.getCalendar().add(js.util.Calendar.DAY_OF_MONTH, 21);
    this.getCalendar().add(js.util.Calendar.HOUR_OF_DAY, -10);
    this.getCalendar().add(js.util.Calendar.MINUTE, 51);
    this.getCalendar().add(js.util.Calendar.SECOND, 15);

    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.YEAR) == 1979);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.MONTH) == 4);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_YEAR) == 22);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.WEEK_OF_MONTH) == 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_MONTH) == 31);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_YEAR) == 151);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK) == 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.DAY_OF_WEEK_IN_MONTH) == 5);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.AM_PM) == 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR) == 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.HOUR_OF_DAY) == 13);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.MINUTE) == 1);
    js.test.Assert.assertTrue("类js.util.Calendar中的add方法测试不通过", this.getCalendar().get(js.util.Calendar.SECOND) == 25);

  }
});

new test.util.TestGregorianCalendar();

