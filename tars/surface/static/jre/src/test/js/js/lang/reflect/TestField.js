$import("js.model.Animal");
$import("js.model.Dog");

$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");

var testReflectObject = new js.model.Dog("dog", "汪汪");

Class.forName({
  name: "class test.lang.reflect.TestField extends js.test.TestCase",
  "@Setter @Getter private field": testReflectObject.getClass()
    .getField("color"),
  TestField: function() {},
  "@Test testGetDeclaringClass": function() {
    js.lang.System.out.println(this.getField().getDeclaringClass());
  },
  "@Test testGetName": function() {
    js.lang.System.out.println(this.getField().getName());
  },
  "@Test testGetModifiers": function() {
    js.lang.System.out.println(this.getField().getModifiers());
  },
  "@Test testGetAnnotations": function() {
    js.lang.System.out.println(this.getField().getAnnotations());
  },
  "@Test testGetValue": function() {
    js.lang.System.out.println(this.getField().getValue());
  },
  "@Test testGet": function() {
    js.lang.System.out.println(this.getField().get(testReflectObject));
  },
  "@Test testSet": function() {
    js.lang.System.out.println("set(\"red\")");
    this.getField().set(testReflectObject, "red");
    js.lang.System.out.println(this.getField().get(testReflectObject));
  }
});
new test.lang.reflect.TestField();

