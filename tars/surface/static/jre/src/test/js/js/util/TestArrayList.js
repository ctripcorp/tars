$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.util.ArrayList", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.util.TestArrayList extends js.test.TestCase",
  "@Setter @Getter private list": new js.util.ArrayList(),

  "TestArrayList": function() {
    for (var i = 0; i < 3; i++) {
      this.getList().add("测试ArrayList" + i);
    }
  },

  "@Test testAdd": function() {
    for (var i = 4; i < 7; i++) {
      this.getList().add("测试ArrayList" + i);
      js.lang.System.out.println("添加->测试ArrayList" + i);
    }
  },
  "@Test testGet": function() {
    for (var i = 0; i < 3; i++) {
      js.lang.System.out.println("********index:" + i + "   value:" + this.getList().get(i));
    }
  },
  "@Test testSet": function() {
    var i = 2,
      v = "新添加的3";
    js.lang.System.out.println("set-> index:" + i + ",value:" + v + "  ,旧值：" + this.getList().set(i, v) + "新值:" + this.getList().get(i));
  },
  "@Test testRemove": function() {
    var i = 2;
    js.lang.System.out.println("remove-> index:" + i + ",旧值：" + this.getList().remove(i) + "size:" + this.getList().size());

  },
  "@Test testSize": function() {
    js.lang.System.out.println("size:" + this.getList().size());
  },
  "@Test testClone": function() {
    var c = this.getList().clone();

    js.lang.System.out.println("克隆前：" + this.getList().size());
    js.lang.System.out.println("克隆后：" + c.size());

    var itr = c.iterator();
    var i = 0;
    while (itr.hasNext()) {
      js.lang.System.out.println("克隆前：" + this.getList().get(i++) + "       克隆后：" + itr.next());
    }
  }
});
new test.util.TestList();
new test.util.TestArrayList();

