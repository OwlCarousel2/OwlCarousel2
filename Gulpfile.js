var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('gulp-cssnano');

gulp.task('css', function() {
    return gulp.src('src/scss/owl.carousel.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([ autoprefixer({ browsers: [
            'last 2 versions',
            'ie 7',
            'ie 8',
            'ie 9',
            'ie 10',
            'ie 11'
        ] }) ]))
        .pipe(concat('owl.carousel.css'))
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets/'));
});

gulp.task('watch', function() {
    var watcher = gulp.watch('src/scss/*', ['css']);

    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + '. Now running css task...');
    });
});
