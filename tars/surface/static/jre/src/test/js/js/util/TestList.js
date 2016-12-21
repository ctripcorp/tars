$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.util.ArrayList", "BootstrapClassLoader");
$import("js.test.Assert", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.util.TestList extends js.test.TestCase",
  "@Setter @Getter private list": new js.util.ArrayList(),
  TestList: function() {
    for (var i = 0; i < 3; i++) {
      this.getList().add("测试List接口" + i);
    }
  },
  "@Test testListIterator": function() {
    var itr = this.getList().listIterator();
    while (itr.hasNext()) {
      js.lang.System.out.println(itr.next());
    }

    while (itr.hasPrevious()) {
      js.lang.System.out.println(itr.previous());
    }
  },
  "@Test testIterator": function() {
    var itr = this.getList().iterator();
    while (itr.hasNext()) {
      js.lang.System.out.println(itr.next());
    }
  },
  "@Test testIndexOf": function() {
    for (var i = 0; i < 3; i++) {
      js.lang.System.out.println("********indexOf:" + i + "   value:" + this.getList().indexOf("测试" + i));
    }
  },
  "@Test testLastIndexOf": function() {
    for (var i = 0; i < 3; i++) {
      js.lang.System.out.println("********lastIndexOf:" + i + "   value:" + this.getList().lastIndexOf("测试" + i));
    }
  },
  "@Test testSubList": function() {
    js.lang.System.out.println("********subList(1,2)->" + "   value:" + this.getList().subList(1, 2));
  },
  "@Test testClear": function() {
    js.lang.System.out.println("clear前：" + this.getList().size());
    this.getList().clear();
    js.lang.System.out.println("clear后：" + this.getList().size());
  }
});
new test.util.TestList();

