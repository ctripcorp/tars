'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var globalDir = require('global-modules');
var extend = require('extend-shallow');
var lookup = require('look-up');
var read = require('read-data');
var homedir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

/**
 * Returns an object from parsing JSON or YAML from the given
 * config file. Uses `config.resolve` to resolve the filepath.
 * If no filepath is specified, `config.resolve` falls back to
 * 'package.json'
 *
 * ```js
 * var opts = config('.jshintrc');
 * ```
 * @param {String} `filename` The name of the file to parse
 * @param {Object} `options` Optionally specify `{parse:'json'}` or `{parse:'yaml'}`
 * @return {Object}
 * @api public
 */

function config(filename, options) {
  return config.parse(filename, options);
}

/**
 * Expose `globalDir`
 */

config.globalDir = globalDir;

/**
 * Parse a config file located in a locally installed npm
 * package (in `node_modules`).
 *
 * ```js
 * var data = config.npm('read-data', 'package.json');
 * //=> { name: "read-data", ... }
 * ```
 * @param {String} `moduleName` The name of the npm package to search in `node_modules`
 * @param {String} `filename` Name of the file to find.
 * @param {Object} `options`
 * @api public
 */

config.npm = function npmConfig(moduleName, filename, opts) {
  if (typeof filename === 'object') {
    opts = filename;
    filename = null;
  }

  opts = opts || {};
  var base = path.join('node_modules', opts.base || '', moduleName);
  opts.cwd = path.resolve(opts.cwd || '', base);
  return config.parse(filename, opts);
};

/**
 * Parse a config file in a globally installed npm package.
 *
 * ```js
 * var data = config.global('verb-cli', 'package.json');
 * //=> { name: "verb-cli", ... }
 * ```
 * @param {String} `moduleName` The name of the global module to search
 * @param {String} `filename` Name of the file to find.
 * @param {Object} `options`
 * @api public
 */

config.global = function globalConfig(moduleName, filename, opts) {
  if (typeof filename === 'object') {
    opts = filename;
    filename = null;
  }

  opts = opts || {};
  opts.cwd = path.resolve(globalDir, opts.cwd || '', moduleName);
  return config.parse(filename, opts);
};

/**
 * Return a filepath the user's home directory
 *
 * ```js
 * var data = config.home('.jshintrc');
 * ```
 * @param {String} `filepath` Filepath to find
 * @param {Object} `options`
 * @api public
 */

config.home = function homeConfig(filename, opts) {
  opts = opts || {};
  var cwd = path.join(homedir, opts.cwd || '');
  return config.parse(filename, { cwd: cwd });
};

/**
 * Returns the fully resolve path for the specified config file.
 * Searches the local project first, then the user's home directory.
 *
 * ```js
 * var fp = config.resolve('.jshintrc');
 * //=> '/Users/jonschlinkert/dev/config-file/package.json'
 * ```
 * @param   {String} `filepath` Filepath to find
 * @param   {Object} `options`
 * @returns {String} filepath to config file
 * @api public
 */

config.resolve = function resolveConfig(filename, options) {
  if (typeof filename === 'object') {
    options = filename;
    filename = null;
  }
  var opts = extend({cwd: process.cwd()}, options);
  filename = filename || 'package.json';
  return lookup(filename, opts);
};

/**
 * Parse a config file. Same as using `config()`.
 *
 * ```js
 * var data = config.parse('.jshintrc');
 * ```
 * @param  {String} `filename` Name of the file to parse.
 * @param  {Object} `options`
 * @return {Object}
 * @api public
 */

config.parse = function parseConfig(filename, options) {
  filename = filename || 'package.json';
  var opts = extend({ parse: type(filename, options) }, options);
  var fp = config.resolve(filename, opts);
  try {
    return read.data.sync(fp, opts);
  } catch (err) {}
  return null;
};

/**
 * Detect the type to parse, JSON or YAML. Sometimes this is based on file extension,
 * other times it must be specified on the options.
 *
 * @param  {String} `filename`
 * @param  {Object} `opts` If `filename` does not have an extension, specify the type on the `parse` option.
 * @return {String} The type to parse.
 */

function type(filename, opts) {
  opts = opts || {};
  if (opts.parse && typeof opts.parse === 'string') {
    return opts.parse;
  }
  var ext = path.extname(filename);
  return ext || 'json';
}

/**
 * Expose `config`
 */

module.exports = config;
