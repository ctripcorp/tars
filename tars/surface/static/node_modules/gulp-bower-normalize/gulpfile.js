var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');

gulp.task('test', function() {
    return gulp.src('test/*.spec.js')
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('lint', ['test'], function() {
    return gulp.src('index.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('default', ['test', 'lint'], function() {
});