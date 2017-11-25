var gulp = require('gulp')

gulp.task('copy', function() {
    gulp.src(['./src/*.html', './src/**/*.ttf', './src/**/fonts/*.*'])
    .pipe(gulp.dest('./bin/'))
})