/**
 * 
 * 
 */

var animalClass = Class.forName({
  name: "class js.model.Animal extends Object",
  "@Getter @Setter private age": 0,
  "private name": 0,
  Animal: function(name) {
    this.name = name;
  },
  setName: function(name) {
    this.name = name;
  },
  getName: function() {
    return this.name;
  },
  say: function() {
    return "i am a animal";
  }
});

