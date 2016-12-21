Class.forName({
  name: "class com.ctrip.tars.model.Group extend Object",

  "@Getter @Setter private id": "",
  "@Getter @Setter private groupId": "",
  "@Getter @Setter private name": "",

  "@Getter @Setter private siteName": "",
  "@Getter @Setter private healthCheckUrl": "",
  "@Getter @Setter private fort": "",

  Group: function() {

  },

  unserialize: function(json) {
    if (!Object.isNull(json)) {
      this.id = json.id;
      this.groupId = json.groupId;
      this.name = json.name;
      this.siteName = json.siteName;
      this.healthCheckUrl = json.healthCheckUrl;
      this.fort = json.fort;
    }
    return this;
  },
  serialize: function() {
    return this.toJson();
  }
});

