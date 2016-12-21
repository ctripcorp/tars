var File = require('vinyl');
var es = require('event-stream');
var Path = require('path');
var normalizer = require('../');
var expect = require('chai').expect;

var assertFlattened = function(fakeFile, expected) {
    var myNormalizer = normalizer({flatten: true, bowerJson: './test/fixtures/bower.json'});
    myNormalizer.write(fakeFile);
    myNormalizer.once("data", function(file) {
        expect(file.path).to.equal(Path.normalize(expected));
    });
};

var assertNormalized = function(fakeFile, expected) {
    var myNormalizer = normalizer({bowerJson: './test/fixtures/bower.json'});
    myNormalizer.write(fakeFile);
    myNormalizer.once("data", function(file) {
        expect(file.path).to.equal(Path.normalize(expected));
    });
};

var assertTypeTop = function(fakeFile, expected) {
  var myNormalizer = normalizer({typeTop: true, bowerJson: './test/fixtures/bower.json'});
  myNormalizer.write(fakeFile);
  myNormalizer.once('data', function(file) {
    expect(file.path).to.equal(Path.normalize(expected));
  });
}
var assertPathChecked = function(fakeFile, expected) {
    var myNormalizer = normalizer({checkPath: true, bowerJson: './test/fixtures/bower.json'});
    myNormalizer.write(fakeFile);
    myNormalizer.once("data", function(file) {
        expect(file.path).to.equal(Path.normalize(expected));
    });
};

var getFakeFiles = function(packageName) {
    var bowerJson = require('./fixtures/bower.json');
    var depOverrides = bowerJson.overrides[packageName];
    var files = [];
    var main = depOverrides.main;
    if (typeof main === "string") {
        main = [main];
    }

    main.map(function(file) {
        files.push(getAFakeFile(packageName, file));
    });

    return files;
};

var getAFakeFile = function(packageName, file) {
    return new File({
        cwd: '/',
        base: '/path',
        path: '/path/' + packageName + '/a/' + file
    })
};

module.exports = {
    getAFakeFile: getAFakeFile,
    getFakeFiles: getFakeFiles,
    assertFlattened: assertFlattened,
    assertNormalized: assertNormalized,
    assertTypeTop: assertTypeTop,
    assertPathChecked: assertPathChecked
};
