var gulp = require('gulp'),
  gutil = require('gulp-util'),
  config = require('config-file'),
  jeditor = require("gulp-json-editor"),
  less = require('gulp-less'),
  minifyCss = require('gulp-minify-css'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  minifyhtml = require('gulp-minify-html'),

  //imagemin = require('gulp-imagemin'),
  //"imagemin-gifsicle": "^4.1.0",
  //"imagemin-jpegtran": "^4.1.0",
  //"imagemin-optipng": "^4.2.0",
  //"imagemin-svgo": "^4.1.2",
  //optipng = require('imagemin-optipng'),
  //gifsicle = require('imagemin-gifsicle'),
  //svgo = require('imagemin-svgo'),
  //jpegtran = require('imagemin-jpegtran'),

  jsHint = require('gulp-jshint'),
  prettify = require('gulp-jsbeautifier'),
  livereload = require('gulp-livereload'),
  bowerFiles = require('main-bower-files'),
  bowerNormalizer = require('gulp-bower-normalize'),
  del = require('del'),
  bower = require('gulp-bower'),
  exec = require('child_process').exec;

var testunit = {
  jsrt: './jre/src/test/js',
  js: './src/test/js'
};

var src = {
  fonts: './src/main/fonts',
  images: './src/main/images',
  css: './src/main/css',
  skin: './src/main/skin',
  js: './src/main/js',
  template: './src/main/template',
  jre: [
    './jre/src/main/js/js/lang/Class.js',
    './jre/src/main/js/js/lang/Object.js',
    './jre/src/main/js/js/lang/Array.js',
    './jre/src/main/js/js/lang/Boolean.js',
    './jre/src/main/js/js/lang/Function.js',
    './jre/src/main/js/js/lang/Number.js',
    './jre/src/main/js/js/lang/RegExp.js',
    './jre/src/main/js/js/lang/String.js',
    './jre/src/main/js/js/lang/Throwable.js',
    './jre/src/main/js/js/lang/Exception.js',
    './jre/src/main/js/js/lang/Error.js',
    './jre/src/main/js/js/lang/ClassNotFoundException.js',
    './jre/src/main/js/js/lang/NoSuchMethodException.js',
    './jre/src/main/js/js/lang/NoSuchFieldException.js',
    './jre/src/main/js/js/lang/InternalError.js',
    './jre/src/main/js/js/lang/ClassLoader.js',
    './jre/src/main/js/js/net/URLClassLoader.js',
    './jre/src/main/js/js/dom/Document.js',
    './jre/src/main/js/atom/misc/Launcher.js'
  ],
  jsrt: './jre/src/main/js'
};

var dest = {
  fonts: './classes/fonts',
  images: './classes/images',
  css: './classes/css',
  skin: './classes/skin',
  js: './classes/js',
  template: './classes/template',
  jre: './jre',
  jsrt: './jre/classes/js',
  lib: './lib/'
};

var settings = config("./pom.json");

/****************tasks***************/
gulp.task('pom', function() {

  var target = gutil.env.t || gutil.env.target || gutil.env.type;

  settings.target = target;

  switch (target) {
    case "production":
      settings.debug = false;
      settings.skin = "default";
      break;
    case "uat":
    case "production_uat":
      settings.debug = false;
      settings.skin = "uat";
      break;
    case "fat":
    case "production_fat":
      settings.debug = false;
      settings.skin = "fat";
      break;
    case "test":
    case "matrix":
      settings.debug = false;
      settings.skin = "test";
      break;
    case "local":
    default:
      settings.debug = true;
      settings.skin = "default";
      settings.target = "local";
      break;
  }

  var version = gutil.env.tv || gutil.env.targetversion;
  if (version) {
    settings.version = version;
  }

  return gulp.src("./pom.json")
    .pipe(jeditor(settings))
    .pipe(gulp.dest("./"));
});

gulp.task('bower', ['pom'], function() {
  return gulp.src("./bower.json")
    .pipe(jeditor(settings))
    .pipe(gulp.dest("./"));
});

gulp.task('npm', ['pom'], function() {
  return gulp.src("./package.json")
    .pipe(jeditor(settings))
    .pipe(gulp.dest("./"));
});

gulp.task('env', ['pom', 'bower', 'npm'], function(cb) {
  cb();
});

gulp.task('pre-clean', ['env'], function(cb) {
  cb();
});

gulp.task('clean', ['pre-clean'], function(cb) {
  var error = del([
    dest.fonts + '/*',
    dest.images + '/*',
    dest.template + '/*',
    dest.css + '/*',
    dest.skin + '/*',
    src.css + '/**/*.css',
    src.skin + '/**/*.css',
    //dest.jre + '/jsvm.js',
    //dest.jre + '/jsvm.min.js',
    dest.jsrt + '/*',
    dest.lib + '/*',
    dest.js + '/*'
  ], function(err, deletedFiles) {
    console.log("##################################################");
    console.log("############### gulp clean finished. #############");
    console.log("##################################################");
    cb(err);
  });
});

gulp.task('post-clean', ['clean'], function(cb) {
  cb();
});

gulp.task('jshint', function() {
  return gulp.src([
      src.js + "/**/*.js",
      src.jsrt + "/**/*.js",
      testunit.jsrt + "/**/*.js",
      testunit.js + "/**/*.js"
    ])
    .pipe(jsHint())
    .pipe(jsHint.reporter('default'));
});

gulp.task('validate', ['post-clean'], function(cb) {

  //return gulp.src(src.js + "/**/*.js")
  //  .pipe(prettify({
  //    config: './.jsbeautifyrc',
  //    mode: 'VERIFY_ONLY'
  //  }));

  if (settings.debug) {
    exec('gulp jshint', function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return cb(err);
      }
      cb();
    });
  } else {
    cb();
  }
});

gulp.task('dependancy', function() {
  return bower();
});

gulp.task('initialize', ['validate'], function(cb) {
  exec('gulp dependancy', function(err, stdout, stderr) {
    console.log(stdout);
    if (err) {
      return cb(err);
    }
    cb();
  });
});

gulp.task('format-html', function() {
  return gulp.src(src.template + "/**/*.html")
    .pipe(prettify({
      braceStyle: "collapse",
      indentChar: " ",
      indentScripts: "keep",
      indentSize: 2,
      maxPreserveNewlines: 10,
      preserveNewlines: true,
      unformatted: ["a", "sub", "sup", "b", "i", "u"],
      wrapLineLength: 0
    }))
    .pipe(gulp.dest(src.template));
});

gulp.task('format-css', function() {
  return gulp.src(src.css + "/**/*.css")
    .pipe(prettify({
      indentChar: " ",
      indentSize: 2
    }))
    .pipe(gulp.dest(src.css));
});

gulp.task('format-skin', function() {
  return gulp.src(src.skin + "/**/*.css")
    .pipe(prettify({
      indentChar: " ",
      indentSize: 2
    }))
    .pipe(gulp.dest(src.skin));
});

gulp.task('format-jsrt', function() {
  return gulp.src(src.jsrt + "/**/*.js")
    .pipe(prettify({
      config: './.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest(src.jsrt));
});

gulp.task('format-js', function() {
  return gulp.src(src.js + "/**/*.js")
    .pipe(prettify({
      config: './.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest(src.js));
});

gulp.task('format', ['format-js', 'format-jsrt', 'format-css', 'format-skin', 'format-html'], function(cb) {
  cb();
});

gulp.task('generate-sources', ['initialize'], function(cb) {
  if (settings.debug) {
    exec('gulp format', function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return cb(err);
      }
      cb();
    });
  } else {
    cb();
  }
});

gulp.task('process-sources', ['generate-sources'], function() {
  return gulp.src(bowerFiles(), {
      base: './bower_components'
    })
    .pipe(bowerNormalizer({
      bowerJson: './bower.json'
    }))
    .pipe(gulp.dest(dest.lib));
});

gulp.task('generate-resources', ['process-sources'], function(cb) {
  cb();
});

gulp.task('fonts', function() {
  return gulp.src(src.fonts + "/**/*")
    .pipe(gulp.dest(dest.fonts));
});

gulp.task('images', function() {
  return gulp.src(src.images + "/**/*")
    /*.pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [
        optipng(), svgo(), jpegtran({
                progressive: true
              }), gifsicle({
                interlaced: true
              })
      ]
    }))*/
    .pipe(gulp.dest(dest.images));
});


gulp.task('skin-images', function() {
  return gulp.src(src.skin + "/*/images/**/*")
    /*.pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [
        optipng(), svgo(), jpegtran({
                progressive: true
              }), gifsicle({
                interlaced: true
              })
      ]
    }))*/
    .pipe(gulp.dest(dest.skin));
});

gulp.task('template', function() {
  return gulp.src(src.template + "/**/*.html")
    .pipe(minifyhtml({
      empty: true,
      cdata: true,
      spare: false,
      conditionals: true,
      quotes: true
    }))
    .pipe(gulp.dest(dest.template));
});

gulp.task('less', function() {
  return gulp.src(src.css + '/**/*.less')
    .pipe(less())
    .pipe(gulp.dest(src.css))
    .pipe(livereload());
});
gulp.task('skin-less', function() {
  return gulp.src(src.skin + '/*/css/**/*.less')
    .pipe(less())
    .pipe(gulp.dest(src.skin))
    .pipe(livereload());
});

gulp.task('css', ['less'], function() {
  return gulp.src(src.css + "/**/*.css")
    .pipe(minifyCss())
    .pipe(gulp.dest(dest.css));
});
gulp.task('skin-css', ['skin-less'], function() {
  return gulp.src(src.skin + "/*/css/**/*.css")
    .pipe(minifyCss())
    .pipe(gulp.dest(dest.skin));
});

gulp.task('resources', ['fonts', 'images', 'skin-images', 'template', 'css', 'skin-css'], function(cb) {
  cb();
});
gulp.task('process-resources', ['generate-resources'], function(cb) {
  if (settings.debug) {
    exec('gulp less skin-less', function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return cb(err);
      }
      cb();
    });
  } else {
    exec('gulp resources', function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return cb(err);
      }

      var error = del([
        src.css + '/**/*.css',
        src.skin + '/**/*.css',
      ], function(err, deletedFiles) {
        cb(err);
      });
    });
  }
});

gulp.task('jsrt', function() {
  return gulp.src(src.jsrt + "/**/*.js")
    .pipe(uglify({
      mangle: true
    }))
    .pipe(gulp.dest(dest.jsrt));
});

gulp.task('jre', ["jsrt"], function() {
  return gulp.src(src.jre)
    .pipe(concat("jsvm.js"))
    .pipe(gulp.dest(dest.jre))
    .pipe(uglify({
      mangle: true
    }))
    .pipe(rename("jsvm.min.js"))
    .pipe(gulp.dest(dest.jre));
});

gulp.task('js', ["jre"], function() {
  return gulp.src(src.js + "/**/*.js")
    .pipe(uglify({
      mangle: true
    }))
    .pipe(gulp.dest(dest.js));
});

gulp.task('compile', ['process-resources'], function(cb) {
  if (settings.debug) {
    exec('gulp jre', function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return cb(err);
      }
      cb();
    });
  } else {
    exec('gulp js', function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return cb(err);
      }
      cb();
    });
  }
  console.log("###################################################");
  console.log("############## gulp compile finished. #############");
  console.log("###################################################");
});

gulp.task("repack-mousewheel", function() {
  return gulp.src([
      "./lib/jquery-mousewheel/js/jquery.mousewheel.js"
    ])
    .pipe(rename("jquery-mousewheel.js"))
    .pipe(gulp.dest("./lib/jquery-mousewheel/js/"));
});

gulp.task("repack-malihu-css", function() {
  return gulp.src([
      "./lib/malihu-custom-scrollbar-plugin/css/jquery.mCustomScrollbar.css"
    ])
    .pipe(rename("jquery-mCustomScrollbar.css"))
    .pipe(gulp.dest("./lib/malihu-custom-scrollbar-plugin/css/"));
});

gulp.task("repack-malihu", ["repack-malihu-css"], function() {
  return gulp.src([
      "./lib/malihu-custom-scrollbar-plugin/js/jquery.mCustomScrollbar.js"
    ])
    .pipe(rename("jquery-mCustomScrollbar.js"))
    .pipe(gulp.dest("./lib/malihu-custom-scrollbar-plugin/js/"));
});

gulp.task("repack-bxslider-css", function() {
  return gulp.src([
      "./lib/bxslider-4/css/jquery.bxslider.css"
    ])
    .pipe(rename("jquery-bxslider.css"))
    .pipe(gulp.dest("./lib/bxslider-4/css/"));
});

gulp.task("repack-bxslider", ["repack-bxslider-css"], function() {
  return gulp.src([
      "./lib/bxslider-4/js/jquery.bxslider.js"
    ])
    .pipe(rename("jquery-bxslider.js"))
    .pipe(gulp.dest("./lib/bxslider-4/js/"));
});

gulp.task("repack-jsPlumb", function() {
  return gulp.src([
      "./lib/jsPlumb/js/jquery.jsPlumb-1.7.5.js"
    ])
    .pipe(rename("jquery-jsPlumb.js"))
    .pipe(gulp.dest("./lib/jsPlumb/js/"));
});

gulp.task("repack-ionrangeslider-skin", function() {
  return gulp.src([
      "./lib/ionrangeslider/css/ion.rangeSlider.skinNice.css"
    ])
    .pipe(rename("ion-rangeSlider-skinNice.css"))
    .pipe(gulp.dest("./lib/ionrangeslider/css/"));
});

gulp.task("repack-ionrangeslider-css", ["repack-ionrangeslider-skin"], function() {
  return gulp.src([
      "./lib/ionrangeslider/css/ion.rangeSlider.css"
    ])
    .pipe(rename("ion-rangeSlider.css"))
    .pipe(gulp.dest("./lib/ionrangeslider/css/"));
});

gulp.task("repack-ionrangeslider", ["repack-ionrangeslider-css"], function() {
  return gulp.src([
      "./lib/ionrangeslider/js/ion.rangeSlider.js"
    ])
    .pipe(rename("ion-rangeSlider.js"))
    .pipe(gulp.dest("./lib/ionrangeslider/js/"));
});

gulp.task("repack-angular-strap-tpl", function() {
  return gulp.src([
      "./bower_components/angular-strap/dist/angular-strap.tpl.js"
    ])
    .pipe(rename("angular-strap-tpl.js"))
    .pipe(gulp.dest("./lib/angular-strap/js/"));
});

gulp.task("repack-easy-pie-chart", function() {
  return gulp.src([
      "./bower_components/jquery.easy-pie-chart/dist/angular.easypiechart.js"
    ])
    .pipe(rename("angular-easypiechart.js"))
    .pipe(gulp.dest("./lib/easy-pie-chart/js/"));
});

gulp.task("repack-bootstrap-woff2", function() {
  return gulp.src([
      "./bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff2"
    ])
    .pipe(gulp.dest("./lib/bootstrap/fonts/"));
});

gulp.task("repack-easing", function() {
  return gulp.src([
      "./lib/jquery-easing-original/js/jquery.easing.js"
    ])
    .pipe(rename("jquery-easing.js"))
    .pipe(gulp.dest("./lib/jquery-easing-original/js/"));
});

gulp.task("repack-fly", function() {
  return gulp.src([
      "./lib/au-proxy-fly/js/jquery.fly.js"
    ])
    .pipe(rename("jquery-fly.js"))
    .pipe(gulp.dest("./lib/au-proxy-fly/js/"));
});

gulp.task("repack-liteaccordion-images", function() {
  return gulp.src([
      "./lib/au-proxy-liteaccordion/png/*.png"
    ])
    .pipe(gulp.dest("./lib/au-proxy-liteaccordion/css/"));
});
gulp.task("repack-liteaccordion", ["repack-liteaccordion-images"], function() {
  return gulp.src([
      "./lib/au-proxy-liteaccordion/js/liteaccordion.jquery.js"
    ])
    .pipe(rename("liteaccordion.js"))
    .pipe(gulp.dest("./lib/au-proxy-liteaccordion/js/"));
});

gulp.task("repack-letteringjs", function() {
  return gulp.src([
      "./lib/letteringjs/js/jquery.lettering.js"
    ])
    .pipe(rename("lettering.js"))
    .pipe(gulp.dest("./lib/letteringjs/js/"));
});
gulp.task("repack-animate-css", function() {
  return gulp.src([
      "./lib/animate.css/css/*"
    ])
    .pipe(gulp.dest("./lib/animate/css/"));
});
gulp.task("repack-textillate", ['repack-animate-css', 'repack-letteringjs'], function() {
  return gulp.src([
      "./lib/textillate/js/jquery.textillate.js"
    ])
    .pipe(rename("textillate.js"))
    .pipe(gulp.dest("./lib/textillate/js/"));
});

gulp.task("repack-file", [
  "repack-mousewheel",
  "repack-malihu",
  "repack-bxslider",
  "repack-jsPlumb",
  "repack-ionrangeslider",
  "repack-angular-strap-tpl",
  "repack-easy-pie-chart",
  "repack-bootstrap-woff2",
  "repack-easing",
  "repack-fly",
  "repack-liteaccordion",
  "repack-textillate"
], function(cb) {
  del([
    "./lib/jquery-mousewheel/js/jquery.mousewheel.js",
    "./lib/malihu-custom-scrollbar-plugin/js/jquery.mCustomScrollbar.js",
    "./lib/malihu-custom-scrollbar-plugin/css/jquery.mCustomScrollbar.css",
    "./lib/bxslider-4/js/jquery.bxslider.js",
    "./lib/bxslider-4/css/jquery.bxslider.css",
    "./lib/jsPlumb/js/jquery.jsPlumb-1.7.5.js",
    "./lib/ionrangeslider/js/ion.rangeSlider.js",
    "./lib/ionrangeslider/css/ion.rangeSlider.css",
    "./lib/ionrangeslider/css/ion.rangeSlider.skinNice.css",
    "./lib/jquery.easy-pie-chart",
    "./lib/jsPlumb/js/dom.jsPlumb*.js",
    "./lib/highstock-release/js/exporting.js",
    "./lib/highstock-release/js/highcharts-more.js",
    "./lib/jquery-easing-original/js/jquery.easing.js",
    "./lib/au-proxy-fly/js/jquery.fly.js",
    "./lib/au-proxy-liteaccordion/png",
    "./lib/au-proxy-liteaccordion/js/liteaccordion.jquery.js",
    "./lib/textillate/js/jquery.textillate.js",
    "./lib/letteringjs/js/jquery.lettering.js",
    "./lib/animate.css"
  ], function(err, deletedFiles) {
    cb(err);
  });
});

gulp.task("repack-jslib", ["repack-file"], function() {
  return gulp.src('./lib/**/*.js')
    .pipe(uglify({
      mangle: true
    }))
    .pipe(gulp.dest('./lib'));
});

gulp.task("repack-csslib", ["repack-file"], function() {
  return gulp.src('./lib/**/*.css')
    .pipe(minifyCss())
    .pipe(gulp.dest('./lib'));
});

gulp.task('process-classes', ['compile'], function(cb) {
  exec('gulp repack-csslib repack-jslib', function(err, stdout, stderr) {
    console.log(stdout);
    if (err) {
      return cb(err);
    }
    cb();
  });
});

gulp.task('testunit-jsrt', function() {
  return gulp.src(testunit.jsrt + "/**/*.js")
    .pipe(prettify({
      config: './.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest(testunit.jsrt));
});

gulp.task('testunit', ['testunit-jsrt'], function() {
  return gulp.src(testunit.js + "/**/*.js")
    .pipe(prettify({
      config: './.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest(testunit.js));
});
gulp.task('testunit', ['testunit-jsrt'], function() {
  return gulp.src(testunit.js + "/**/*.js")
    .pipe(prettify({
      config: './.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest(testunit.js));
});

gulp.task('generate-test-sources', ['process-classes'], function(cb) {
  if (settings.debug) {
    exec('gulp testunit', function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return cb(err);
      }
      cb();
    });
  } else {
    cb();
  }
});

gulp.task('process-test-sources', ['generate-test-sources'], function(cb) {
  cb();
});
gulp.task('generate-test-resources', ['process-test-sources'], function(cb) {
  cb();
});
gulp.task('process-test-resources', ['generate-test-resources'], function(cb) {
  cb();
});


gulp.task('test-compile', ['process-test-resources'], function(cb) {
  cb();
});
gulp.task('process-test-classes', ['test-compile'], function(cb) {
  cb();
});

gulp.task('test', ['process-test-classes'], function(cb) {
  //TODO 自动化单元测试
  console.log("###################################################");
  console.log("############### gulp test finished. ###############");
  console.log("###################################################");
  cb();
});

gulp.task('prepare-package', ['test'], function(cb) {
  cb();
});

gulp.task('package', ['test'], function(cb) {
  //TODO按照bower结构打包
  console.log("###################################################");
  console.log("############# gulp package finished. ##############");
  console.log("###################################################");
  cb();
});

gulp.task('install', ['package'], function(cb) {
  //TODO添加到本地bower cache
  console.log("###################################################");
  console.log("############# gulp install finished. ##############");
  console.log("###################################################");
  cb();
});

gulp.task('deploy', ['install'], function(cb) {
  //TODO注册到bower
  console.log("###################################################");
  console.log("############# gulp deploy finished. ###############");
  console.log("###################################################");
  cb();
});

gulp.task('watch', function() {
  livereload.listen();

  gulp.watch(src.template, ['format-html', 'template']);
  gulp.watch(src.css + "/**/*.less", ['format-css', 'css', 'less']);
  gulp.watch(src.skin + '/*/css/**/*.less', ['format-skin', 'skin-css', 'skin-less']);
  gulp.watch(src.js, ['format-js', 'js']);
  gulp.watch(src.images, ['images']);
  gulp.watch(src.fonts, ['fonts']);
  gulp.watch(src.jsrt, ['jre']);
  gulp.watch([testunit.js, testunit.jsrt], ['testunit']);
  gulp.watch('./bower.json', ['dependancy']);
});

gulp.task('default', ['package'], function(cb) {
  //gulp.start('watch');
});
