$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.util.HashSet", "BootstrapClassLoader");
$import("js.test.Assert", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.util.TestHashSet extends js.test.TestCase",
  "@Setter @Getter private set": new js.util.HashSet(),
  TestHashSet: function() {
    for (var i = 0; i < 3; i++) {
      this.getSet().add("测试set" + i);
    }
  },
  "@Test testSize": function() {
    js.lang.System.out.println("size:" + this.getSet().size());
  },
  "@Test testClear": function() {
    js.lang.System.out.println("clear:");
    this.getSet().clear();
    js.lang.System.out.println("size:" + this.getSet().size());
  },
  "@Test testAdd": function() {
    for (var i = 0; i < 3; i++) {
      js.lang.System.out.println("测试set" + i);
      this.getSet().add("测试set" + i);
    }
    for (var j = 0; j < 3; j++) {
      js.lang.System.out.println("测试set" + j);
      this.getSet().add("测试set" + j);
    }
    js.lang.System.out.println("size:" + this.getSet().size());
  },
  "@Test testIterator": function() {
    var itr = this.getSet().iterator();
    while (itr.hasNext()) {
      js.lang.System.out.println(itr.next());
    }
  },
  "@Test testContains": function() {
    var i = "测试set" + 3;
    js.lang.System.out.println("value:" + i + ",contains:" + this.getSet().contains(i));
  },

  "@Test testIsEmpty": function() {
    js.lang.System.out.println("isEmpty:" + this.getSet().isEmpty());
  },

  "@Test testRemove": function() {
    var i = "测试set" + 2;
    js.lang.System.out.println("remove-> key:" + i + ",旧值：" + this.getSet().remove(i) + " ,size:" + this.getSet().size());
  },
  "@Test testClone": function() {
    var c = this.getSet().clone();

    js.lang.System.out.println("克隆前：" + this.getSet().size());
    js.lang.System.out.println("克隆后：" + c.size());

    var itr1 = this.getSet().iterator();

    var itr2 = c.iterator();

    while (itr1.hasNext()) {
      var v1 = itr1.next();
      var v2 = itr2.next();
      js.lang.System.out.println("克隆前：value:" + v1 + "       克隆后：value:" + v2);
    }
  }
});

new test.util.TestHashSet();

