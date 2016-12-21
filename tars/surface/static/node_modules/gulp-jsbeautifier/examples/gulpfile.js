var gulp = require('gulp');
var prettify = require('../');

// normal usage
gulp.task('verify-js', function() {
  gulp.src(['./src/foo.js', './src/bar.json'])
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_ONLY'}));
});

gulp.task('format-js', function() {
  gulp.src(['./src/foo.js', './src/bar.json'])
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest('./build'));
});

gulp.task('prettify-html', function() {
  gulp.src('./src/foo.html')
    .pipe(prettify({indent_size: 2}))
    .pipe(gulp.dest('./build'));
});

gulp.task('prettify-css', function() {
  gulp.src('./src/foo.css')
    .pipe(prettify({indent_size: 2}))
    .pipe(gulp.dest('./build'));
});

gulp.task('prettify-css-with-just-css-options', function() {
  gulp.src('./src/foo.css')
    .pipe(prettify({css: {indent_size: 2, indent_char: '\t'}}))
    .pipe(gulp.dest('./build'));
});
