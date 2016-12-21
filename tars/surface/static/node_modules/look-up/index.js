'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var isGlob = require('is-glob');
var expandTilde = require('expand-tilde');
var mm = require('micromatch');

/**
 * Expose `lookup`
 */

module.exports = lookup;

/**
 * @param  {String|Array} `patterns` Glob pattern(s) or file path(s) to match against.
 * @param  {Object} `options` Options to pass to [micromatch]. Note that if you want to start in a different directory than the current working directory, specify a `cwd` property here.
 * @return {String} Returns the first matching file.
 * @api public
 */

function lookup(patterns, opts) {
  if (typeof patterns !== 'string' && !Array.isArray(patterns)) {
    throw new TypeError('look-up expects a string or array as the first argument.');
  }

  // ensure the pattern is an array
  patterns = typeof patterns === 'string'
    ? [patterns]
    : patterns;

  var cwd = (opts && opts.cwd) || '.';
  cwd = path.resolve(expandTilde(cwd));

  var segs = cwd.split(/[\\\/]/);
  var slen = segs.length;

  while (slen--) {
    var dir = segs.join('/');

    var fp = findFile(dir, patterns, opts);
    if (fp) { return fp; }
    segs.pop();
  }
  return null;
}

function findFile(cwd, patterns, opts) {
  var len = patterns.length;

  while (len--) {
    var pattern = expandTilde(patterns[len]);
    if (!isGlob(pattern)) {
      var fp = join(cwd, pattern);

      // we can avoid fs.readdir if this
      // resolves to an actual file
      if (fs.existsSync(fp)) { return fp; }

    } else {
      try {
        var files = fs.readdirSync(cwd);
        var re = mm.makeRe(pattern, opts);

        for (var i = 0; i < files.length; i++) {
          var name = files[i];
          var file = join(cwd, name);

          // try matching against the basename in the cwd,
          // or the absolute path
          if (re.test(name) || re.test(file)) {
            return file;
          }
        }
      } catch (err) {
        if (opts && opts.verbose) { throw err; }
      }
    }
  }
  return null;
}

function join(dir, fp) {
  return dir + '/' + fp;
}
