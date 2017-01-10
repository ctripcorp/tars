$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.util.HashMap", "BootstrapClassLoader");
$import("js.test.Assert", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.util.TestMap extends js.test.TestCase",
  "@Setter @Getter private map": new js.util.HashMap(),
  TestMap: function() {
    for (var i = 0; i < 6; i++) {
      this.getMap().put(i, "测试Map" + i);
    }
  },
  "@Test testContainsKey": function() {
    for (var i = 2; i < 4; i++) {
      js.lang.System.out.println("containsKey->  index:" + i + ",containsKey:" + this.getMap().containsKey(i));
    }
  },
  "@Test testContainsValue": function() {
    for (var i = 2; i < 4; i++) {
      js.lang.System.out.println("containsValue->  value:测试Map" + i + ",containsValue:" + this.getMap().containsValue("测试Map" + i));
    }
  },
  "@Test testGet": function() {
    for (var i = 4; i < 6; i++) {
      js.lang.System.out.println("get-> index:" + i + ",value:" + this.getMap().get(i));
    }
  },
  "@Test testIsEmpty": function() {
    js.lang.System.out.println("isEmpty->" + this.getMap().isEmpty());

  },
  "@Test testPut": function() {
    for (var i = 3; i < 6; i++) {
      this.getMap().put(i, "新put" + i);
      js.lang.System.out.println("put->key:" + i + ",value:" + this.getMap().get(i));
    }
  },
  "@Test testSize": function() {
    js.lang.System.out.println("size:" + this.getMap().size());
  },
  "@Test testRemove": function() {
    var i = 5;
    js.lang.System.out.println("remove-> key:" + i + ",旧值：" + this.getMap().remove(i) + " ,size:" + this.getMap().size());

  },
  "@Test testClone": function() {
    var c = this.getMap().clone();

    js.lang.System.out.println("克隆前：" + this.getMap().size());
    js.lang.System.out.println("克隆后：" + c.size());

    var itr1 = this.getMap().entrySet().iterator();

    var itr2 = c.entrySet().iterator();

    while (itr1.hasNext()) {
      var entry1 = itr1.next();
      var entry2 = itr2.next();
      js.lang.System.out.println("克隆前：key:" + entry1.getKey() + ",value:" + entry1.getValue() + "       克隆后：key:" + entry2.getKey() + ",value:" + entry2.getValue());
    }
  }
});
new test.util.TestMap();

