var gulp = require('gulp')

gulp.task('copy', function() {
    gulp.src(['./src/*.html', './src/**/*.ttf'])
    .pipe(gulp.dest('./bin/'))
})