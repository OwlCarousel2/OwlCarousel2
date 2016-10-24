var assemble = require('assemble');

var app = assemble({
    flatten: false,
    expand: true,
    production: false,
    assets: 'docs/assets',
    postprocess: require('pretty'),

    // metadata
    pkg: 'owl.carousel',
    //app: '<%= app %>',
    data: ['docs_src/data/*.{json,yml}'],

    // templates
    partials: 'docs_src/templates/partials/*.hbs',
    layoutdir: 'docs_src/layouts/',

    // extensions
    helpers: 'docs_src/helpers/*.js'
});


app.task('index', function() {
    return app.toStream('pages') //<= push "pages" collection into stream
        .pipe(app.renderFile()) //<= render pages with default engine (hbs)
        .pipe(app.dest('site'));
});
