var assertPathChecked = require("./utility").assertPathChecked;
var getFakeFiles = require("./utility").getFakeFiles;
describe("gulp-bower-normalize path checked", function() {

    it("should implicitly fall back to extension", function() {
        var fakeFiles = getFakeFiles("dependency1");
        assertPathChecked(fakeFiles[0], '/path/dependency1/js/some.js');
    });

    it("should not match given pattern and fall back to extension", function() {
        var fakeFiles = getFakeFiles("dependency2");
        assertPathChecked(fakeFiles[0], '/path/dependency2/js/some.js');
    });

    it("should not match given patterns and fall back to extension", function() {
        var fakeFiles = getFakeFiles("dependency3");
        assertPathChecked(fakeFiles[0], '/path/dependency3/js/some.js');
        assertPathChecked(fakeFiles[1], '/path/dependency3/css/some.css');
    });

    it("should not match given patterns and fall back to extension", function() {
        var fakeFiles = getFakeFiles("dependency4");
        assertPathChecked(fakeFiles[0], '/path/dependency4/js/some.js');
        assertPathChecked(fakeFiles[1], '/path/dependency4/json/some.json');
    });

    it("should not match given patterns and fall back to extension", function() {
        var fakeFiles = getFakeFiles("dependency5");
        assertPathChecked(fakeFiles[0], '/path/dependency5/js/some.js');
        assertPathChecked(fakeFiles[1], '/path/dependency5/json/some.json');
    });

    it("should not match given patterns and fall back to extension", function() {
        var fakeFiles = getFakeFiles("dependency6");
        assertPathChecked(fakeFiles[0], '/path/dependency6/js/file.js');
    });

    it("should match the pattern for the second file", function() {
        var fakeFiles = getFakeFiles("dependency7");
        assertPathChecked(fakeFiles[0], '/path/dependency7/js/some.js');
        assertPathChecked(fakeFiles[1], '/path/dependency7/js/some/other.js');
    });
});
