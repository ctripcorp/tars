/**
 * 
 * 
 */

$import("js.model.Animal");
var dogClass = Class.forName({
  name: "public class js.model.Dog extends js.model.Animal",
  "@Getter @Setter private color": "black",
  "@Getter @Setter private word": "",
  "public Dog": function(name, word) {
    this.word = word;
  },
  say: function() {
    return this.word;
  }
});

