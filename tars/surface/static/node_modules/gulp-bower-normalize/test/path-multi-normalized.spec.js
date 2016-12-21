var expect = require("chai").expect;
var assertNormalized = require("./utility").assertNormalized;
var getFakeFiles = require("./utility").getFakeFiles;
var getAFakeFile = require("./utility").getAFakeFile;
describe("gulp-bower-normalize multi", function() {
    it("should properly process normalizeMulti", function () {
        var fakeFile1 = getFakeFiles("dependency8");
        var fakeFile2 = getAFakeFile("dependency8", "file.ttf");
        var fakeFile3 = getAFakeFile("dependency8", "file.woff2");
        var fakeFile4 = getAFakeFile("dependency8", "file.css");
        var fakeFile5 = getAFakeFile("dependency8", "file.ext");

        expect(fakeFile1.length).to.equal(1);
        assertNormalized(fakeFile1[0], '/path/dependency8/js/some.js');
        assertNormalized(fakeFile2, '/path/dependency8/font/file.ttf');
        assertNormalized(fakeFile3, '/path/dependency8/font/file.woff2');
        assertNormalized(fakeFile4, '/path/dependency8/css/file.css');
        assertNormalized(fakeFile5, '/path/dependency8/ext/file.ext');
    });

    it("should normalize implicitly defined multi overrides", function() {
        var fakeFile1 = getAFakeFile("dependency10", "file.js");
        var fakeFile2 = getAFakeFile("dependency10", "file.less");
        var fakeFile3 = getAFakeFile("dependency10", "file.ext");

        assertNormalized(fakeFile1, '/path/dependency10/javascript/file.js');
        assertNormalized(fakeFile2, '/path/dependency10/lessFiles/file.less');
        assertNormalized(fakeFile3, '/path/dependency10/ext/file.ext');
    });

    it("should handle the same dependency in multiple multi overrides, first one in wins", function() {
        var fakeFile1 = getAFakeFile("dependency9", "file.ttf");
        var fakeFile2 = getAFakeFile("dependency9", "file.woff2");
        var fakeFile3 = getAFakeFile("dependency9", "file.css");
        var fakeFile4 = getAFakeFile("dependency9", "file.js");
        var fakeFile5 = getAFakeFile("dependency9", "file.less");
        var fakeFile6 = getAFakeFile("dependency9", "file.ext");

        assertNormalized(fakeFile1, '/path/dependency9/font/file.ttf');
        assertNormalized(fakeFile2, '/path/dependency9/font/file.woff2');
        assertNormalized(fakeFile3, '/path/dependency9/css/file.css');
        assertNormalized(fakeFile4, '/path/dependency9/javascript/file.js');
        assertNormalized(fakeFile5, '/path/dependency9/lessFiles/file.less');
        assertNormalized(fakeFile6, '/path/dependency9/ext/file.ext');
    });
});
