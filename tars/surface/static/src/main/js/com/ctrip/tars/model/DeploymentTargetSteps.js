$import("com.ctrip.tars.model.Flowstep");
Class.forName({
  name: "class com.ctrip.tars.model.DeploymentTargetSteps extends Array",

  DeploymentTargetSteps: function() {},

  build: function(status, targetId) {

    if (!status) {
      this.clear();
    } else {
      this.push(new com.ctrip.tars.model.Flowstep("拉出", "todo", "", {
        status: 'DISABLING',
        id: targetId
      }));
      this.push(new com.ctrip.tars.model.Flowstep("下载", "todo", "", {
        status: 'DOWNLOADING',
        id: targetId
      }));
      this.push(new com.ctrip.tars.model.Flowstep("部署", "todo", "", {
        status: 'INSTALLING',
        id: targetId
      }));
      this.push(new com.ctrip.tars.model.Flowstep("点火", "todo", "", {
        status: 'VERIFYING',
        id: targetId
      }));
      this.push(new com.ctrip.tars.model.Flowstep("拉入", "todo", "", {
        status: 'ENABLING',
        id: targetId
      }));

      switch (status) {
        case "PENDING":
          break;
        case "SKIPPING":
        case "DISABLING":
          this[0].progress = "doing";
          break;
        case "DISABLE_SUCCESS":
          this[0].progress = "done";
          break;
        case "DISABLE_FAILURE":
          this[0].progress = "error";
          break;

        case "DOWNLOADING":
          this[0].progress = "done";
          this[1].progress = "doing";
          break;
        case "DOWNLOAD_SUCCESS":
          this[0].progress = "done";
          this[1].progress = "done";
          break;
        case "DOWNLOAD_FAILURE":
          this[0].progress = "done";
          this[1].progress = "error";
          break;

        case "INSTALLING":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "doing";
          break;
        case "INSTALL_SUCCESS":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          break;
        case "INSTALL_FAILURE":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "error";
          break;

        case "VERIFYING":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          this[3].progress = "doing";
          break;
        case "VERIFY_SUCCESS":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          this[3].progress = "done";
          break;
        case "VERIFY_FAILURE":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          this[3].progress = "error";
          break;

        case "ENABLING":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          this[3].progress = "done";
          this[4].progress = "doing";
          break;
        case "ENABLE_SUCCESS":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          this[3].progress = "done";
          this[4].progress = "done";
          break;
        case "ENABLE_FAILURE":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          this[3].progress = "done";
          this[4].progress = "error";
          break;

        case "SUCCESS":
          this[0].progress = "done";
          this[1].progress = "done";
          this[2].progress = "done";
          this[3].progress = "done";
          this[4].progress = "done";
          break;

        case "FAILURE":
        case "REVOKED":
          this[0].progress = "error";
          this[1].progress = "error";
          this[2].progress = "error";
          this[3].progress = "error";
          this[4].progress = "error";
          break;
        default:
          this.clear();
          break;
      }
    }

    return this;
  }

});

