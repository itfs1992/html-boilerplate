const gulp = require('gulp');
const connect = require('gulp-connect');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const watch = require('gulp-watch');
const prettify = require('gulp-jsbeautifier');
const useref = require('gulp-useref');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const del = require('del');
var htmlhint = require("gulp-htmlhint");

gulp.sources = {
  src: './src',
  dist: './html'
};

// Start server dev
gulp.task('connect:dev', (done) => {
  connect.server({
    root: [gulp.sources.src, '.tmp', './'],
    livereload: true,
    port: 9000,
    host: '0.0.0.0',
    fallback: gulp.sources.src + '/index.html'
  });
  done();
});

// Start server product
gulp.task('connect:prod', (done) => {
  connect.server({
    root: [gulp.sources.dist],
    livereload: true,
    port: 9090,
    host: '0.0.0.0',
    fallback: gulp.sources.dist + '/index.html'
  });
  done();
});

// Watch
gulp.task('stream', (done) => {
  gulp.watch(gulp.sources.src + '/views/**/*.html', gulp.series('fileinclude'));
  gulp.watch(gulp.sources.src + '/styles/**/*.scss', gulp.series('sass'));
  gulp.watch(gulp.sources.src + '/scripts/**/*.js', gulp.series('script'));
  watch('**/*.css').pipe(connect.reload());
  done();
});

// Include HTML
gulp.task('fileinclude', (done) => {
  return gulp.src([gulp.sources.src + '/views/pages/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(gulp.sources.src))
    .pipe(connect.reload());
});

// Minify CSS, JS
gulp.task('minify', (done) => {
  return gulp.src(gulp.sources.src + '/*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify({
      compress: false
    })))
    .pipe(gulpif('*.css', cleanCSS({
      specialComments: 0
    })))
    .pipe(gulp.dest(gulp.sources.dist));
});

// Sass
gulp.task('sass', () => {
  return gulp.src(gulp.sources.src + '/styles/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(connect.reload());
});


// Javascript
gulp.task('script', (done) => {
  return gulp.src(gulp.sources.src + '/scripts/**/*.js')
    .pipe(connect.reload());
});

// Minify images
gulp.task('imagemin', (done) => {
  return gulp.src(gulp.sources.src + '/images/**/*')
    .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true,
      verbose: true
    }))
    .pipe(gulp.dest(gulp.sources.dist + '/images'))
});

// Copy fonts
gulp.task('htmlhint', gulp.series('fileinclude', (done) => {
  return gulp.src(gulp.sources.src + '/*.html')
    .pipe(htmlhint())
    .pipe(htmlhint.failReporter());
}));

// Copy fonts
gulp.task('copy:fonts', (done) => {
  return gulp.src(gulp.sources.src + '/fonts/**/*')
    .pipe(gulp.dest(gulp.sources.dist + '/fonts'));
});

// HTML beautify
gulp.task('prettify', gulp.series('copy:fonts', (done) => {
  return gulp.src([gulp.sources.dist + '/*.html'])
    .pipe(prettify({
      indent_char: ' ',
      indent_size: 2
    }))
    .pipe(gulp.dest(gulp.sources.dist));
}));

// Remove dist, tmp
gulp.task('clean', (done) => {
  return del(['.tmp', gulp.sources.dist]);
});

// Build source
gulp.task('build', gulp.series('clean', 'fileinclude', 'htmlhint', 'sass', 'minify', 'imagemin', 'copy:fonts', 'prettify', (done) => {
  console.log('Success!');
  done();
}));

// Start development server
gulp.task('run:dev', gulp.series('clean', 'connect:dev', 'fileinclude', 'sass', 'stream', (done) => {
  console.log('Development version is running...');
  done();
}));

// Start product server
gulp.task('run:prod', gulp.series('build', 'connect:prod', (done) => {
  console.log('Production version is running...');
  done();
}));
