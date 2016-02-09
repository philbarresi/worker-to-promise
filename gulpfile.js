var gulp = require('gulp'),
    watch = require('gulp-watch'),
    debug = require('gulp-debug'),
    batch = require('gulp-batch');;

gulp.task('build', function () {
    return gulp.src('worker-to-*.js')
        .pipe(gulp.dest('tests/public/js/w2p'));
})

gulp.task('default', function () {
    return gulp.watch('*.js', ['build']);
});