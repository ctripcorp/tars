Class.forName({
  name: "class com.ctrip.tars.component.ICheckbox extends Object",

  "@Setter checked": true,
  "@Setter disabled": false,

  "ICheckbox": function(checked, disabled) {
    this.checked = checked;
    this.disabled = disabled;
  },

  getChecked: function() {
    return this.isChecked() ? "checked" : "";
  },
  getDisabled: function() {
    return this.isDisabled() ? "disabled" : "";
  },

  isChecked: function() {
    return this.checked;
  },
  isDisabled: function() {
    return this.disabled;
  }
});

