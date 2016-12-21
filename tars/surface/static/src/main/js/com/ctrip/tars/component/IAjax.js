$import("js.lang.StringBuffer", "BootstrapClassLoader");
$import("com.ctrip.tars.util.Csrf");
Class.forName({
  name: "class com.ctrip.tars.component.IAjax extends Object",

  "public static csrfSafeMethod": function(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  },
  "public static get": function(url, opts) {
    opts = opts || {};
    opts.method = "GET";
    this.ajax(url, opts);
  },
  "public static post": function(url, opts) {
    opts = opts || {};
    opts.method = "POST";
    this.ajax(url, opts);
  },
  "public static ajax": (function() {

    var retrieve = function(error) {
      if (Object.isNull(error) || Object.isString(error)) {
        return error;
      } else {
        var summary = [];
        for (var i in error) {
          summary.push(i + " : " + retrieve(error[i]));
        }
        return summary.join(";");
      }
    };

    var formatErrors = function(errors, status) {

      var errorsHtml = new js.lang.StringBuffer();

      errorsHtml.append('<div class="container-fluid" style="font-size: 15px;font-weight: 200;line-height: 2;">')
        .append('<div class="row">')
        .append('<div class="col-lg-4 col-md-4 col-sm-2 col-xs-2" style="text-align: right;">')
        .append('响应状态:')
        .append('</div>')
        .append('<div class="col-lg-8 col-md-8 col-sm-10 col-xs-10" style="text-align: left;">')
        .append(status)
        .append('</div>')
        .append('</div>')
        .append('<div class="row">')
        .append('<div class="col-lg-4 col-md-4 col-sm-2 col-xs-2" style="text-align: right;">')
        .append('详细信息:')
        .append('</div>')
        .append('<div class="col-lg-8 col-md-8 col-sm-10 col-xs-10" style="text-align: left;">');

      errorsHtml.append('<ul style="padding-left: 0px;">');
      for (var i in errors) {
        var error = errors[i];
        if (Object.isString(error)) {
          errorsHtml.append('<li>').append(error).append('</li>');
        } else {
          for (var j in error) {
            errorsHtml.append('<li>').append(retrieve(error[j])).append('</li>');
          }
        }
      }
      errorsHtml.append('</ul>');

      errorsHtml.append('</div>')
        .append('</div>')
        .append('</div>');

      return errorsHtml.toString();
    };

    return function(url, opts) {

      /*
  		var m = method ;
  		if(p.restful === false){
  		    if(m == 'PUT'){
  		        m = 'POST';
  		    }else if(m == 'DELETE'){
  		        m = 'GET';
  		    }
  		}
  		p.dataType = p.dataType || "json";
  		if(p.dataType == "json" || p.dataType == "jsonp" || !data.format){
  		    data.format = 'json';
  		}
  		//Content-Type:application/x-www-form-urlencoded
  		//Content-Type:multipart/related
  		//application/json;charset=utf-8
  		$.ajax({
  		    async : true,
  		    type : m,
  		    url : p.url,
  		    contentType : p.contentType || 'application/x-www-form-urlencoded',
  		    data : p.contentType == 'application/json;charset=utf-8' ? JSON.stringify(data) : data,
  		    dataType : p.dataType || "json",
  		    success : function(msg) {
  		        if(p.callback){
  		            p.callback.call(scope,ats,msg);
  		        }else{
  		            if (msg.success) {
  		                scope._toggleDialog(ats);
  		            }
  		        }
  		    }
  		*/

      var data = opts.data || {},
        success = opts.success,
        failure = opts.failure,
        error = opts.error,
        exception = opts.exception,
        headers = opts.headers || {},
        crossDomain = opts.crossDomain || false,
        async = opts.async || true,
        method = opts.method || "GET",
        ignore = opts.ignore;

      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          if (Object.isNull(data[i])) {
            delete data[i];
          }
        }
      }

      if (!com.ctrip.tars.component.IAjax.csrfSafeMethod(method) && !crossDomain) {
        headers["X-CSRFToken"] = com.ctrip.tars.util.Csrf.getCookie('csrftoken');
      }

      data._method = method;
      $.ajax({
        async: async,
        crossDomain: crossDomain,
        type: method,
        headers: headers,
        url: url,
        contentType: method == 'GET' ? 'application/x-www-form-urlencoded' : 'application/json;charset=utf-8',
        data: method == 'GET' ? data : JSON.stringify(data),
        dataType: "json",
        success: function(msg, textStatus, jqXHR) {
          if ((!msg && jqXHR.status == 204) || (msg.status >= 200 && msg.status < 300) || (msg.status === 304)) {
            //TODO SUCCESS
            if (success) {
              success.call((msg ? msg.data : null));
            }
          } else {
            var errors = (jqXHR.responseJSON || {}).errors || [];

            if (ignore) {
              if (failure) {
                failure.call(errors);
              }
              if (exception) {
                exception.call(errors);
              }
              return;
            }

            $.licoMsgbox({
              title: "FAILURE",
              content: formatErrors(errors, 'FAILURE'),
              icon: 'error',
              OK: '确定',
              buttons: [],
              handler: function() {
                if (failure) {
                  failure.call(errors);
                }
                if (exception) {
                  exception.call(errors);
                }
              }
            });
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          var errors = (jqXHR.responseJSON || {
            errors: [(jqXHR.responseText || 'No Error Message').substring(0, 256) + '......']
          }).errors || [];

          if (ignore) {
            if (error) {
              error.call(errors);
            }
            if (exception) {
              exception.call(errors);
            }
            return;
          }

          $.licoMsgbox({
            title: textStatus.toUpperCase(),
            content: formatErrors(errors, errorThrown + " （" + jqXHR.status + " ）"),
            icon: 'error',
            OK: '确定',
            buttons: [],
            handler: function() {
              if (error) {
                error.call(errors);
              }
              if (exception) {
                exception.call(errors);
              }
            }
          });
        }
      });
    };
  })()
});

