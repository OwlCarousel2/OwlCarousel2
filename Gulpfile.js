'use strict';

var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('gulp-cssnano'),
    app = require('assemble')(),
    extname = require('gulp-extname')
    ;

var cfg = {
        docs: {
            "src":       "docs_src",
            "dest":      "docs",
            "templates": "docs_src/templates",
            "pages":     "docs_src/templates/pages",
            "layouts":   "docs_src/templates/layouts"
        },
        src: {
            "dist": "dist",
            "scripts": [
                "src/js/owl.carousel.js",
                "src/js/owl.autorefresh.js",
                "src/js/owl.lazyload.js",
                "src/js/owl.autoheight.js",
                "src/js/owl.video.js",
                "src/js/owl.animate.js",
                "src/js/owl.autoplay.js",
                "src/js/owl.navigation.js",
                "src/js/owl.hash.js",
                "src/js/owl.support.js"
            ]
        },

        title:    "Owl Carousel",
        download: "https://github.com/OwlCarousel2/OwlCarousel2/archive/master.zip",
        donate:   "https://www.paypal.com"
    },
    pkg = require('./package.json');

function cssPipe(source, target, path) {
    return gulp.src(source)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([ autoprefixer({ browsers: [
            'last 2 versions',
            'ie 7', 'ie 8', 'ie 9', 'ie 10', 'ie 11'
        ] }) ]))
        .pipe(concat(target))
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path));
}

gulp.task(
    'init-assemble',
    function(cb) {
        app.option('assets', cfg.docs.templates + '/assets');

        app.create('partials', {viewType: 'partial'});
        app.partials(cfg.docs.templates + '/partials/*.hbs');

        app.create('layout', { viewType: 'layout' });
        app.layouts(cfg.docs.templates + '/layouts/*.hbs');

        app.create('pages');
        app.pages(cfg.docs.templates + '/pages/*.hbs');

        app.option('pkg', pkg);
        app.option('app', cfg);

        app.data(cfg.docs.templates + '/data/*.{json,yml}');

        cb();
    }
);

gulp.task(
    'assemble',
    ['init-assemble'],
    function() {
        return app.toStream('pages')
            .pipe(app.renderFile())
            .pipe(extname())
            .pipe(app.dest(cfg.docs.dest + "/test"));
    }
);

gulp.task(
    'css',
    function() {
        return cssPipe(
            'src/scss/owl.carousel.scss',
            'owl.carousel.css',
            'dist/assets/'
        );
    }
);

gulp.task(
    'build-dist',
    ['css'],
    function() {

    }
);

gulp.task('watch', function() {
    var watcher = gulp.watch('src/scss/*', ['css']);

    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + '. Now running css task...');
    });
});
