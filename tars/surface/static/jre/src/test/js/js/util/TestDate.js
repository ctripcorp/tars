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
$import("js.util.Date", "BootstrapClassLoader");
$import("js.test.Assert", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.util.TestDate extends js.test.TestCase",
  "@Setter @Getter private date": new js.util.Date(),
  TestDate: function() {},

  "@Test public testEquals": function() {
    js.test.Assert.assertTrue("类js.util.Date中的equals方法测试不通过", !this.getDate().equals(new Date()));
    js.test.Assert.assertTrue("类js.util.Date中的equals方法测试不通过", this.getDate().equals(this.getDate()));
    js.test.Assert.assertTrue("类js.util.Date中的equals方法测试不通过", this.getDate().equals(this.getDate().clone()));
  },

  "@Test public testAfter": function() {
    js.test.Assert.assertTrue("类js.util.Date中的after方法测试不通过", new Date().after(this.getDate()));
  },

  "@Test public testBefore": function() {
    js.test.Assert.assertTrue("类js.util.Date中的after方法测试不通过", this.getDate().before(new Date()));
  },

  "@Test public testCompareTo": function() {
    js.test.Assert.assertTrue("类js.util.Date中的compareTo方法测试不通过", new Date().compareTo(this.getDate()) > 0);
    js.test.Assert.assertTrue("类js.util.Date中的compareTo方法测试不通过", this.getDate().compareTo(new Date()) < 0);
    js.test.Assert.assertTrue("类js.util.Date中的compareTo方法测试不通过", this.getDate().compareTo(this.getDate().clone()) === 0);
  }
});

new test.util.TestDate();

