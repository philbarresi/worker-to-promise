var gulp = require('gulp'),
    watch = require('gulp-watch'),
    debug = require('gulp-debug'),
    batch = require('gulp-batch'),
    ts = require('gulp-typescript');

gulp.task('build-caller', function () {
    return gulp.src('src/worker-to-promise-caller.ts')
        .pipe(ts())
        .pipe(gulp.dest('dest/'))
        .pipe(gulp.dest('tests/public/js/w2p/'));
});

gulp.task('build-worker', function () {
    return gulp.src('src/worker-to-promise-dedicated-worker.ts')
        .pipe(ts())
        .pipe(gulp.dest('dest/'))
        .pipe(gulp.dest('tests/public/js/w2p/'));
});

gulp.task('default', function () {
    gulp.watch('src/worker-to-promise-caller.ts', ['build-caller']);
    gulp.watch('src/worker-to-promise-dedicated-worker.ts', ['build-worker']);
});