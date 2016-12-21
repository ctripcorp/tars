var expect = require('chai').expect;
var File = require('vinyl');
var Path = require('path');
var normalizer = require('../');
var assertTypeTop = require('./utility').assertTypeTop;
var getFakeFiles = require('./utility').getFakeFiles;
describe('gulp-bower-normalize typeTop', function() {

  it('should implicitly set normalized path without override section', function() {
    var fakeFile = new File({
      cwd: '/',
      base: '/path',
      path: '/path/to/a/file.ext'
    });

    var myNormalizer = normalizer({typeTop: true, bowerJson: './test/fixtures/bower-without-override.json'});
    myNormalizer.write(fakeFile);
    myNormalizer.once('data', function(file) {
      console.log(file.path);
      expect(file.path).to.equal(Path.normalize('/path/ext/to/file.ext'));
    })
  });

  it('should implicitly set normalized path without overrides', function() {
    var fakeFile = new File({
      cwd: '/',
      base: '/path',
      path: '/path/to/a/file.ext'
    });

    assertTypeTop(fakeFile, '/path/ext/to/file.ext');
  });

  it('should implicitly set normalized path with overide and no normalize', function() {
    var fakeFiles = getFakeFiles('dependency1');
    assertTypeTop(fakeFiles[0], '/path/js/dependency1/some.js');
  });

  it('should normalize based on explicit normalize overrides', function() {
    var fakeFiles = getFakeFiles('dependency2');
    assertTypeTop(fakeFiles[0], '/path/javascript/dependency2/some.js');
  });

  it('should normalize with mulitple normalization targets', function() {
    var fakeFiles = getFakeFiles('dependency3');
    assertTypeTop(fakeFiles[0], '/path/js/dependency3/some.js');
    assertTypeTop(fakeFiles[1], '/path/css/dependency3/some.css');
  });

  it('should normalize with multiple filter to one target', function() {
    var fakeFiles = getFakeFiles('dependency4');
    assertTypeTop(fakeFiles[0], '/path/js/dependency4/some.js');
    assertTypeTop(fakeFiles[1], '/path/js/dependency4/some.json');
    fakeFiles = getFakeFiles('dependency8');
    assertTypeTop(fakeFiles[0], '/path/js/dependency8/some.js');
  });

  it('should normalize with a mix of implicit and explicit', function() {
    var fakeFiles = getFakeFiles('dependency5');
    assertTypeTop(fakeFiles[0], '/path/js/dependency5/some.js');
    assertTypeTop(fakeFiles[1], '/path/json/dependency5/some.json');
  });

  it('should normalize long file paths to a short path', function() {
    var fakeFiles = getFakeFiles('dependency6');
    assertTypeTop(fakeFiles[0], '/path/js/dependency6/file.js');
  });

  it('should normalize file paths from file names', function() {
    var fakeFiles = getFakeFiles('dependency7');
    assertTypeTop(fakeFiles[0], '/path/js/dependency7/some.js');
    assertTypeTop(fakeFiles[1], '/path/js/dependency7/other.js');
  });
});
