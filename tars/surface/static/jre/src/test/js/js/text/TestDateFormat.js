/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年10月16日
 */

$import("js.text.DateFormat", "BootstrapClassLoader");
$import("js.text.SimpleDateFormat", "BootstrapClassLoader");
$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.test.Assert", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.text.TestDateFormat extends js.test.TestCase",
  "@Setter @Getter private format": null,

  "@Before public setUp": function() {

  },

  "@Test testFormat": function() {
    var format1 = new js.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss SSS");
    var format2 = new js.text.SimpleDateFormat("yMdkHmsSEDFwWahK");



    var d = new Date(1413453621420);
    var t = d.getTime();

    //2014-10-16 18:00:21 420   Thu Oct 16 2014 18:00:21 GMT+0800 (中国标准时间) 
    js.test.Assert.assertTrue("类test.text.TestDateFormat中的testFormat方法测试不通过", format1.format(d) == "2014-10-16 18:00:21 420");
    js.test.Assert.assertTrue("类test.text.TestDateFormat中的testFormat方法测试不通过", format1.format(t) == "2014-10-16 18:00:21 420");
    js.test.Assert.assertTrue("类test.text.TestDateFormat中的testFormat方法测试不通过", format2.format(d) == "201410161818021420星期四2893423下午66");
    js.test.Assert.assertTrue("类test.text.TestDateFormat中的testFormat方法测试不通过", format2.format(t) == "201410161818021420星期四2893423下午66");

    //2014-01-01 00:00:00 00   201411240000星期三1111上午120
    js.lang.System.out.println(format1.format(1388505600000));
    js.lang.System.out.println(format2.format(1388505600000));

    //2014-02-28 23:59:59 999 201422823235959999星期五59495下午1111
    js.lang.System.out.println(format1.format(1393603199999));
    js.lang.System.out.println(format2.format(1393603199999));

    //2014-03-01 00:00:00 00 201431240000星期六60191上午120
    js.lang.System.out.println(format1.format(1393603200000));
    js.lang.System.out.println(format2.format(1393603200000));

    //2014-12-31 23:59:59 999 2014123123235959999星期三365515下午1111
    js.lang.System.out.println(format1.format(1420041599999));
    js.lang.System.out.println(format2.format(1420041599999));


  }
});
new test.text.TestDateFormat();

