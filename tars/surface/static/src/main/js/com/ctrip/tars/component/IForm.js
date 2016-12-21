Class.forName({
  name: "class com.ctrip.tars.component.IForm extends Object",

  "@Getter @Setter element": "",

  IForm: function(element) {
    this.element = element;
  },
  "public reset": function() {
    //TODO
  },
  "public getValues": function() {
    var values = {},
      dom = this.element;
    if (dom) {
      $.each(dom.find('input,select,textarea'), function(i, n) {
        if (n.type != 'button' && !n.disabled) {
          if (n.id || n.name) {
            var value = null;
            try {
              switch (n.type) {
                case "radio":
                case "number":
                  value = $(n).val() * 1;
                  break;
                default:
                  value = $(n).val();
                  break;
              }
            } catch (e) {}
            if (value == 'undefined') value = null;
            values[n.id || n.name] = value || null;
          }
        }
      });
    }
    return values;
  }
});

