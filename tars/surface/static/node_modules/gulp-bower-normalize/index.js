'strict';
// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var minimatch = require('minimatch');
var Path = require('path');
var PluginError = gutil.PluginError;

// consts
var PLUGIN_NAME = 'gulp-bower-normalize';
var NORMALIZE_MULTI_KEY = 'normalizeMulti';

// Gets the component parts, package name, filename, ext
function getComponents(file) {
    var relativePath = file.relative;
    var pathParts = Path.dirname(relativePath).split(Path.sep);
    return {
        ext: Path.extname(relativePath).substr(1), // strip dot
        filename: Path.basename(relativePath),
        packageName: pathParts[0]
    };
}

// plugin level function (dealing with files)
function gulpBowerNormalize(userOptions) {
    var options = userOptions || {},
        basePath = options.basePath || process.cwd(),
        bowerJson = options.bowerJson || "./bower.json",
        overrides = {};

    bowerJson = Path.join(basePath, bowerJson);

    try {
        overrides = require(bowerJson);
        overrides = overrides.overrides || {};
    } catch(e) {
        throw new PluginError(PLUGIN_NAME, "No bower.json at " + bowerJson + " or overrides invalid!");
    }

    // Add any multiOverrides
    if (NORMALIZE_MULTI_KEY in overrides) {
        var multiNormalize = overrides[NORMALIZE_MULTI_KEY];
        if (!Array.isArray(multiNormalize)) {
            multiNormalize = [multiNormalize];
        }
        multiNormalize.forEach(function(multiNormalizeObject) {
            try {
                multiNormalizeObject.dependencies.forEach(function(dependency) {
                    if (dependency in overrides) {
                        var mergedOverride = {};
                        if ('normalize' in overrides[dependency]) {
                            mergedOverride = overrides[dependency].normalize;
                        }
                        // This would be a one-liner in lodash, but just implement here for a simple object to avoid
                        // the additional dependency
                        Object.keys(multiNormalizeObject.normalize).forEach(function(depFolder) {
                            // If the multi has the same folder as the manual, the manual override wins flat out, no merging
                            if (!(depFolder in mergedOverride)) {
                                mergedOverride[depFolder] = multiNormalizeObject.normalize[depFolder];
                            }
                        });

                        overrides[dependency].normalize = mergedOverride;
                    } else {
                        // nothing is in the overrides, we can just put the multi values straight in
                        overrides[dependency] = {
                            'normalize': multiNormalizeObject.normalize
                        };
                    }
                });
            } catch(e) {
                throw new PluginError(PLUGIN_NAME, "Invalid " + NORMALIZE_MULTI_KEY + " object must be in form {dependencies:[], normalize:{}}");
            }
        });

        // Remove from the overrides so it doesn't get processed as a dependency
        delete overrides[NORMALIZE_MULTI_KEY];
    }

    // creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, cb) {
        var components = getComponents(file),
            type = components.ext,
            pkgOverrides = null,
            normalize = null;

        // Check if there are overrides
        if (components.packageName in overrides) {
            pkgOverrides = overrides[components.packageName];
            // Check if there are any normalize overrides
            if ('normalize' in pkgOverrides) {
                normalize = pkgOverrides.normalize;
                // Loop through each type in normalize
                Object.keys(normalize).forEach(function(key) {
                    var filter = normalize[key];

                    // Check if it's a string and make it an array, just for ease of processing
                    if (typeof filter === "string") {
                        filter = [filter];
                    }

                    // Check each glob
                    filter.map(function(glob) {
                        // Potential bug here if multiple types match glob
                        // Last one in wins right now, maybe throw error?
                        var path = components.filename;

                        // If checkPath is set to true, pass the relative path to the matching utility
                        if (options.checkPath) {
                            path = file.relative;
                        }

                        if (minimatch(path, glob)) {
                            type = key;
                        }
                    });
                });
            }
        }

        if (options.flatten) {
            file.path = Path.join(file.base, type, components.filename);
        } else if (options.typeTop) {
            file.path = Path.join(file.base, type, components.packageName, components.filename);
        } else {
            file.path = Path.join(file.base, components.packageName, type, components.filename);
        }

        this.push(file);

        return cb();
    });

    // returning the file stream
    return stream;
}

// exporting the plugin main function
module.exports = gulpBowerNormalize;
