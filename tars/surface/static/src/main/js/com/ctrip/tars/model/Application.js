$import("com.ctrip.tars.model.Group");
Class.forName({

  name: "class com.ctrip.tars.model.Application extend Object",

  "@Getter @Setter private id": null,
  "@Getter @Setter private appId": null,
  "@Getter @Setter private name": null,

  "@Getter @Setter private createdAt": null,
  "@Getter @Setter private updatedAt": null,

  "@Getter @Setter private statuses": null,

  "@Getter @Setter private groups": [],

  Application: function() {

  },

  unserialize: function(json) {
    if (!Object.isNull(json)) {
      this.id = json.id;
      this.appId = json.appId;
      this.name = json.name;
      this.createdAt = json.createdAt;
      this.updatedAt = json.updatedAt;
      this.statuses = json.statuses;
      if (!Object.isNull(json.groups) && Object.isArray(json.groups)) {
        for (var i = 0, len = json.groups.length; i < len; i++) {
          this.groups.push(new com.ctrip.tars.model.Group().unserialize(json.groups[i]));
        }
      }
    }
    return this;
  },
  serialize: function() {
    return this.toJson();
  }
});

