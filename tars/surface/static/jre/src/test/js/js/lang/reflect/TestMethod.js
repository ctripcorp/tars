$import("js.model.Animal");
$import("js.model.Dog");

$import("js.test.TestCase", "BootstrapClassLoader");

var testReflectObject = new js.model.Dog("dog", "汪汪");

Class
  .forName({
    name: "class test.lang.reflect.TestMethod extends js.test.TestCase",

    "@Setter @Getter private method": testReflectObject
      .getClass().getMethod("say"),

    TestMethod: function() {},

    "@Test testInvoke": function() {
      js.lang.System.out
        .println("invoke say(), The desired operation is to print \"汪汪\"");
      js.lang.System.out.println(this.getMethod().invoke(testReflectObject));
    },
    "@Test testGetDeclaringClass": function() {
      js.lang.System.out.println(this.getMethod().getDeclaringClass());
    },
    "@Test testGetName": function() {
      js.lang.System.out.println(this.getMethod().getName());
    },
    "@Test testGetModifiers": function() {
      js.lang.System.out.println(this.getMethod().getModifiers());
    },
    "@Test testGetAnnotations": function() {
      js.lang.System.out.println(this.getMethod().getAnnotations());
    },
    "@Test testGetValue": function() {
      js.lang.System.out.println(this.getMethod().getValue());
    }
  });

new test.lang.reflect.TestMethod();

