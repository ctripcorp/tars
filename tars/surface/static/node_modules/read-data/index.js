/*!
 * read-data <https://github.com/jonschlinkert/read-data>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var yaml = require('read-yaml');

/**
 * Asynchronously read a YAML file.
 *
 * ```js
 * var yaml = require('read-data').yaml;
 *
 * yaml('foo.yml', function(err, data) {
 *   if (err) throw err;
 *   console.log(data);
 * });
 * ```
 *
 * @name .yaml
 * @param {String} `fp` path of the file to read.
 * @param {Object|String} `options` to pass to [js-yaml]
 * @param {Function} `cb` callback function
 * @return {Object} JSON
 * @api public
 */

exports.yaml = yaml;

/**
 * Synchronously read a YAML file.
 *
 * ```js
 * var yaml = require('read-data').yaml;
 * var data = yaml.sync('foo.yml');
 * ```
 *
 * @name ..yaml.sync
 * @param {String} `fp` path of the file to read.
 * @param {Object|String} `options` to pass to [js-yaml]
 * @return {Object} JSON
 * @api public
 */

exports.yaml.sync = yaml.sync;

/**
 * Asynchronously read a JSON file.
 *
 * ```js
 * var json = require('read-data');
 *
 * json('foo.json', function(err, data) {
 *   if (err) throw err;
 *   console.log(data);
 * });
 * ```
 *
 * @name .json
 * @param {String} `fp` path of the file to read.
 * @param {Function} `callback` callback function
 * @return {Object} JSON
 * @api public
 */

exports.json = function json(fp, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts; opts = {};
  }
  // opts param exists to maintain the same arity as the
  // yaml method, so we can dynamically choose the reader
  fs.readFile(fp, 'utf8', function (err, data) {
    if (err) cb(err);
    cb(null, JSON.parse(data));
  });
};

/**
 * Synchronously read a JSON file.
 *
 * ```js
 * var json = require('read-data').json;
 * var data = json.sync('foo.json');
 * ```
 *
 * @name .json.sync
 * @param {String} `fp` path of the file to read.
 * @return {Object} JSON
 * @api public
 */

exports.json.sync = function jsonSync(fp) {
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch (err) {
    err.message = 'read-data failed to parse "' + fp + '": ' + err.message;
    throw err;
  }
};

/**
 * Asynchronously read a JSON or YAML file, automatically determining the
 * reader based on extension.
 *
 * ```js
 * var read = require('read-data');
 *
 * read('foo.json', function(err, data) {
 *   if (err) throw err;
 *   console.log(data);
 * });
 *
 * read('foo.yml', function(err, data) {
 *   if (err) throw err;
 *   console.log(data);
 * });
 * ```
 *
 * @name .data
 * @param {String} `fp` path of the file to read.
 * @param {Object|String} `options` to pass to [js-yaml]
 * @param {Function} `cb` callback function
 * @return {Object} JSON
 * @api public
 */

exports.data = function data(fp, opts, cb) {
  if (opts && typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};
  var ext = opts.lang || path.extname(fp);
  var reader = exports.json;
  switch (ext) {
    case '.json':
      reader = exports.json;
      break;
    case '.yml':
    case '.yaml':
      reader = exports.yaml;
      break;
  }
  reader(fp, opts, cb);
};

/**
 * Synchronously read a data file, automatically determining the
 * reader based on extension.
 *
 * ```js
 * var data = require('read-data').data;
 *
 * var yaml = data.sync('foo.yml');
 * var json = data.sync('foo.json');
 * ```
 *
 * @name .data.sync
 * @param {String} `fp` path of the file to read.
 * @param {Object|String} `options` to pass to [js-yaml]
 * @return {Object} JSON
 * @api public
 */

exports.data.sync = function dataSync(fp, opts) {
  opts = opts || {};
  var ext = opts.lang || path.extname(fp);
  var reader = exports.json.sync;
  switch(ext) {
    case '.json':
      reader = exports.json.sync;
      break;
    case '.yml':
    case '.yaml':
      reader = exports.yaml.sync;
      break;
  }
  return reader(fp, opts);
};
