$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.util.HashMap", "BootstrapClassLoader");
$import("js.test.Assert", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

Class.forName({
  name: "class test.util.TestHashMap extends js.test.TestCase",
  "@Setter @Getter private map": new js.util.HashMap(),
  TestHashMap: function() {
    for (var i = 0; i < 6; i++) {
      this.getMap().put(i, "测试Map" + i);
    }
  },
  "@Test testEntrySet": function() {
    var itr = this.getMap().entrySet().iterator();
    while (itr.hasNext()) {
      var entry = itr.next();
      js.lang.System.out.println("key:" + entry.getKey() + ",value:" + entry.getValue());
    }
  },
  "@Test testKeySet": function() {
    var itr = this.getMap().keySet().iterator();
    while (itr.hasNext()) {
      var key = itr.next();
      js.lang.System.out
        .println("key:" + key + ",value:" + this.getMap().get(key));
    }
  },
  "@Test testValues": function() {
    var itr = this.getMap().values().iterator();
    while (itr.hasNext()) {
      var value = itr.next();
      js.lang.System.out.println("value:" + value);
    }
  }
});

new test.util.TestHashMap();

