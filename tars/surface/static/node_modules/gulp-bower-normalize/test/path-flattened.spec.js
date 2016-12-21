var assertFlattened = require("./utility").assertFlattened;
var getFakeFiles = require("./utility").getFakeFiles;
describe("gulp-bower-normalize flattened", function() {
    it("should implicitly set flattened path with override and no normalize", function() {
        var fakeFiles = getFakeFiles("dependency1");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
    });

    it("should flatten based on explicit normalize overrides", function() {
        var fakeFiles = getFakeFiles("dependency2");
        assertFlattened(fakeFiles[0], '/path/javascript/some.js');
    });

    it("should flatten with multiple normalization targets", function() {
        var fakeFiles = getFakeFiles("dependency3");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
        assertFlattened(fakeFiles[1], '/path/css/some.css');
    });

    it("should flatten with multiple filter to one target", function() {
        var fakeFiles = getFakeFiles("dependency4");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
        assertFlattened(fakeFiles[1], '/path/js/some.json');
    });

    it("should flatten with a mix of implicit and explicit", function() {
        var fakeFiles = getFakeFiles("dependency5");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
        assertFlattened(fakeFiles[1], '/path/json/some.json');
    });

    it("should flatten long file paths", function() {
        var fakeFiles = getFakeFiles("dependency6");
        assertFlattened(fakeFiles[0], '/path/js/file.js');
    });

    it("should flatten from file names", function() {
        var fakeFiles = getFakeFiles("dependency7");
        assertFlattened(fakeFiles[0], '/path/js/some.js');
        assertFlattened(fakeFiles[1], '/path/js/other.js');
    });
});
