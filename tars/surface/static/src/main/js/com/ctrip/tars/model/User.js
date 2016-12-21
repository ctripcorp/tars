Class.forName({

  name: "class com.ctrip.tars.model.User extend Object",

  "@Getter @Setter private username": "",
  "@Getter @Setter private passwd": "",
  "@Getter @Setter private name": "",
  "@Getter @Setter private organization": "",
  "@Getter @Setter private email": "",

  User: function(username, passwd, name, organization, email) {
    this.update(username, passwd, name, organization, email);
  },

  update: function(username, passwd, name, organization, email) {
    this.username = username;
    this.passwd = passwd;
    this.name = name;
    this.organization = organization;
    this.email = email;
  },
  save: function() {
    sessionStorage.username = this.username;
    sessionStorage.passwd = this.passwd;
    sessionStorage.name = this.name;
    sessionStorage.organization = this.organization;
    sessionStorage.email = this.email;
  },

  load: function() {
    this.username = sessionStorage.username;
    this.passwd = sessionStorage.passwd;
    this.name = sessionStorage.name;
    this.organization = sessionStorage.organization;
    this.email = sessionStorage.email;
  },

  remove: function() {
    this.username = "";
    this.passwd = "";
    this.name = "";
    this.organization = "";
    this.email = "";
    sessionStorage.username = "";
    sessionStorage.passwd = "";
    sessionStorage.name = "";
    sessionStorage.organization = "";
    sessionStorage.email = "";
  }
});

