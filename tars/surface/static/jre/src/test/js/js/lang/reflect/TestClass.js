$import("js.model.Animal");
$import("js.model.Dog");

$import("js.test.TestCase", "BootstrapClassLoader");
$import("js.lang.System", "BootstrapClassLoader");
$import("js.lang.reflect.Method", "BootstrapClassLoader");
$import("js.lang.reflect.Field", "BootstrapClassLoader");

var testReflectObject = new js.model.Dog("dog", "汪汪");

Class.forName({
  name: "class test.lang.TestClass extends js.test.TestCase",
  "@Setter @Getter private dog": testReflectObject.getClass(),
  TestClass: function() {},
  "@Test testGetClassConstructor": function() {
    js.lang.System.out.println(this.getDog().getClassConstructor());
  },
  "@Test testGetConstructor": function() {
    js.lang.System.out.println(this.getDog().getConstructor());
  },
  "@Test testGetInitial": function() {
    js.lang.System.out.println(this.getDog().getInitial());
  },
  "@Test testGetName": function() {
    js.lang.System.out.println(this.getDog().getName());
  },
  "@Test testGetFullName": function() {
    js.lang.System.out.println(this.getDog().getFullName());
  },
  "@Test testGetInstance": function() {
    js.lang.System.out.println(this.getDog().getInstance());
  },
  "@Test testGetAnnotations": function() {
    js.lang.System.out.println(this.getDog().getAnnotations());
  },
  "@Test testGetPackage": function() {
    js.lang.System.out.println(this.getDog().getPackage());
  },
  "@Test testGetDeclaredField": function() {
    js.lang.System.out.println(this.getDog().getDeclaredField("color"));
  },
  "@Test testGetDeclaredFields": function() {
    js.lang.System.out.println(this.getDog().getDeclaredFields());
  },
  "@Test testGetField": function() {
    js.lang.System.out.println(this.getDog().getField("color"));
  },
  "@Test testGetFields": function() {
    js.lang.System.out.println(this.getDog().getFields());
  },
  "@Test testGetDeclaredMethod": function() {
    js.lang.System.out.println(this.getDog().getDeclaredMethod("say"));
  },
  "@Test testGetDeclaredMethods": function() {
    js.lang.System.out.println(this.getDog().getDeclaredMethods());
  },
  "@Test testGetMethod": function() {
    js.lang.System.out.println(this.getDog().getMethod("say"));
  },
  "@Test testGetMethods": function() {
    js.lang.System.out.println(this.getDog().getMethods());
  },
  "@Test testGetSuperClass": function() {
    js.lang.System.out.println(this.getDog().getSuperClass());
  },
  "@Test testGetModifiers": function() {
    js.lang.System.out.println(this.getDog().getModifiers());
  },
  "@Test testAddMethod": function() {
    this.getDog().addMethod(new js.lang.reflect.Method("testAddMethod", function() {
      return "我是动态新增的方法";
    }, this.getDog(), 1, []));
    js.lang.System.out.println(testReflectObject.testAddMethod());
  },
  "@Test testAddField": function() {
    js.lang.System.out.println(this.getDog()
      .addField(new js.lang.reflect.Field("testAddField",
        "我是动态新增的属性", this.getDog(), 1, ["@Getter", "@Setter"])));
    js.lang.System.out.println(testReflectObject.getTestAddField());
  },
  "@Test testNewInstance": function() {
    var c = this.getDog().newInstance();
    js.lang.System.out.println(c.getColor());
  }
});

new test.lang.TestClass();

