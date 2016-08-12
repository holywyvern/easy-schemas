import gulp       from 'gulp';

import babel      from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';

gulp.task('default', () => {
  return gulp.src('./src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['es2015' ]}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./lib'));
});
