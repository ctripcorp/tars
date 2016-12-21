#gulp-bower-normalize [![Build Status](https://travis-ci.org/cthrax/gulp-bower-normalize.svg)](https://travis-ci.org/cthrax/gulp-bower-normalize)

> Use rules in the bower.json or implicit rules to normalize the files being copied out of bower_components so that a consistent and clean version of the bower dependencies can be checked into the repo. This is intended to work with main-bower-files.

##INSTALL

```
npm install --save-dev gulp-bower-normalize
```

##USAGE
Designed to work with [main-bower-files](https://github.com/ck86/main-bower-files) as so:

```javascript
gulp.task('default', function() {
    var bower = require('main-bower-files');
    var bowerNormalizer = require('gulp-bower-normalize');
    return gulp.src(bower(), {base: './bower_components'})
        .pipe(bowerNormalizer({bowerJson: './bower.json'}))
        .pipe(gulp.dest('./bower_dependencies/'))
});
```

bower.json

```javascript
{
    name and otherstuff
    "dependencies": {
        "dependency1": "~1.0.1"
        "dependency2": "~1.0.1"
        "dependency3": "~1.0.1"
        "dependency4": "~1.0.1"
    },
    "overrides": {
        // Muli allows one normalize definition to span multiple dependencies
        // NOTE: This is first one in wins for the multi list and will always
        // defer to the overrides.
        "normalizeMulti": [
            {
                "dependencies": ["dependency1", "dependency2"],
                "normalize": {
                    "img": ["*.jpeg", "*.png", "*.jpg"],
                    "font": ["*.ttf", "*.woff2"]
                }
            },
            {
                "dependencies": ["dependency2", "dependency3"],
                "normalize": {
                    // Note since dependency3 defines js, it won't get this definition
                    "js": ["*.js", "*.less"],
                }
            },
            {
                "dependencies": ["dependency2"],
                "normalize": {
                    // Note since dependency2 already had js defined by the multi, it won't get this definition
                    "js": ["*.*"],
                }
            }
        ],
        // Implicitly normalizes this file by file extension 'dependency1/js/some.js'
        "dependency1": {
            "main": "some.js"
        },
        // Implicitly organized into 'dependency2/js/some.js' 'dependency2/js/some.js'
        "dependency2": {
            "main": ["some.js", "some.css"]
        },
        // Explicitly organized into 'dependency3/js/some.js', 'dependency3/css/some.ext', 'dependency3/css/some.css'
        "dependency3": {
            "main": ["some.js", "some.ext", "some.css"],
            "normalize": {
                "js": "*.js",
                "css": ["*.ext", "*.css"]
            }
        } // dependency4 is implicitly organized into 'dependency4/<ext>/<file>
    }
}
```

**NOTE:** Comments are not valid JSON, so if you're copying this, you'll need to remove them.

##API

###bowerNormalize(options)

####options.basePath

Type: `string`
Default: `process.cwd()`

Path to search for the bower.json file in.

####options.bowerJson

Type: `string`
Default: `./bower.json`

Path to bower.json that overrides will come from. This should be relative to `options.BasePath`.

####options.flatten

Type: `boolean`
Default: `false`

Option to remove the component level folders. This would turn `/lib/jquery/js/jquery.js` into `/lib/js/jquery.js`.

**Note:** If your components have files with the same name then only one of them will be included in the results.

####options.typeTop

Type: `boolean`
Default: `false`

Option to put the type folder on top of the hierarchy. This would turn `/lib/jquery/js/jquery.js` into `/lib/js/jquery/jquery.js`.

####options.checkPath

Type: `boolean`
Default: `false`

This option allows a multi-level path on the normalization destination. This allows matching similar to the following:

```
 "dependency7": {
      "main": ["some.js", "some/other.js"],
      "normalize": {
        "js": "*.js",
        "js/some": "**/some/*.js"
      }
 }
```

**Note:** This will not work in conjunction with the flatten option.

## License

MIT © [Myles Bostwick](http://www.zithora.com)
