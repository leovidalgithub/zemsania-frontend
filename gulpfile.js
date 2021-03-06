'use strict';
let gulp         = require( 'gulp' );
let sass         = require( 'gulp-ruby-sass' );
let rename       = require( 'gulp-rename' );
let uglify       = require( 'gulp-uglify' );
let concat       = require( 'gulp-concat' );
let connect      = require( 'gulp-connect' );
let cleanCSS     = require( 'gulp-clean-css' );
// let minifyCss = require( 'gulp-minify-css' ); - DEPRECATED - NOW USING gulp-clean-css
let autoprefixer = require( 'gulp-autoprefixer' );

// gulp gulp-ruby-sass gulp-rename gulp-uglify gulp-concat gulp-connect gulp-clean-css gulp-autoprefixer
// "gulp": "^3.9.1",
// "gulp-autoprefixer": "^4.0.0",
// "gulp-concat": "^2.6.1",
// "gulp-connect": "^5.0.0",
// "gulp-minify-css": "^1.2.4",
// "gulp-rename": "^1.2.2",
// "gulp-ruby-sass": "^2.1.1",
// "gulp-uglify": "^2.0.1"

gulp.task( 'connect', function () {
    connect.server({
        root: 'app',
        port: 8080,
        livereload: true,
        fallback: 'app/index.html'
    });
});

gulp.task( 'sass', function() {
    return sass( './app/**/*.scss', { style: 'compressed' } )
        .pipe( concat( 'style.css' ) )
        .pipe( rename( { suffix: '.min' } ) )
        .pipe( autoprefixer() )
        .pipe( gulp.dest( './app/assets/css' ) )
        .pipe( connect.reload() );
});

gulp.task( 'html', function () {
    gulp.src( './app/**/*.html' )
        .pipe( connect.reload() );
});

gulp.task( 'json', function () {
    gulp.src( './app/**/*.json')
        .pipe( connect.reload() );
});

gulp.task( 'watch', function () {
    gulp.watch( ['./app/**/*.html'], ['html'] );
    gulp.watch( ['./app/**/*.json'], ['json'] );
    // gulp.watch( ['./app/**/*.js', '!./app/assets/**/*.js'], ['js'] );
    gulp.watch( ['./app/**/*.js'], ['js'] );
    gulp.watch( ['./app/**/*.scss'], ['sass'] );
});

gulp.task( 'js', function () {
    return gulp.src([
            './app/app.js',
            './app/features/components/formly/formlyConfig.js',
            './app/utils.js',
            './app/features/**/module.*.js',
            './app/features/**/service.*.js',
            './app/features/**/controller.*.js',
            './app/assets/js/vertex.js'
        ])
        .pipe( concat('app.js') )
        .pipe( gulp.dest('./app/assets/js/') )
        .pipe( connect.reload() );
});

gulp.task( 'js:compress', function () {
    return gulp.src( ['./app/assets/js/app.js'] )
        .pipe( concat( 'app.js' ) )
        .pipe( uglify({
            mangle: false
        }))
        .pipe( gulp.dest( './app/assets/js/' ) )
});

gulp.task( 'vendors:css', function () {
    return gulp.src([
            './bower_components/jquery-ui/themes/smoothness/jquery-ui.css',
            './bower_components/angular-loading-bar/build/loading-bar.min.css',
            './bower_components/bootstrap/dist/css/bootstrap.min.css',
            './bower_components/fullcalendar/dist/fullcalendar.min.css',
            './bower_components/animate.css/animate.min.css',
            './bower_components/font-awesome/css/font-awesome.css',
            './lib/ui-bootstrap/ui-bootstrap-custom-0.14.3-csp.css',
            './lib/slick/slick.css',
            './lib/slick/slick-theme.css'
        ])
        .pipe( concat( 'vendors.css') )
        // .pipe( minifyCss() ) - DEPRECATED - NOW USING gulp-clean-css
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe( gulp.dest( './app/assets/css/' ) );
});

gulp.task( 'vendors:js', function () {
    return gulp.src([
            './bower_components/jquery/jquery.js',
            './bower_components/jquery-ui/ui/jquery-ui.js',
            './bower_components/angular/angular.js',
            './bower_components/angular-animate/angular-animate.min.js',
            './bower_components/angular-sanitize/angular-sanitize.min.js',
            './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            './bower_components/ng-idle/angular-idle.js',
            './bower_components/bootstrap/dist/js/bootstrap.js',
            './bower_components/angular-ui-router/release/angular-ui-router.min.js',
            './bower_components/angular-permission/dist/angular-permission.js',
            './bower_components/angular-permission/dist/angular-permission-ui.js',
            './bower_components/i18next/i18next.min.js',
            './bower_components/i18next-xhr-backend/i18nextXHRBackend.min.js',
            './bower_components/ng-i18next/dist/ng-i18next.min.js',
            './bower_components/angular-loading-bar/build/loading-bar.min.js',
            './bower_components/ngstorage/ngStorage.min.js',
            './bower_components/moment/min/moment.min.js',
            './bower_components/angular-moment/angular-moment.min.js',
            './bower_components/angular-ui-calendar/src/calendar.js',
            './bower_components/fullcalendar/dist/fullcalendar.min.js',
            './bower_components/fullcalendar/dist/gcal.js',
            './bower_components/at-table/dist/angular-table.min.js',
            // './bower_components/angular-dynamic-locale/dist/tmhDynamicLocale.min.js',
            './bower_components/api-check/dist/api-check.min.js',
            './bower_components/angular-elastic/elastic.js',
            './bower_components/angular-formly/dist/formly.js',
            './bower_components/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.min.js',
            './bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
            './lib/slick/slick.min.js'
        ])
        .pipe( concat( 'vendors.js') )
        .pipe( uglify({
            mangle: false
        }))
        .pipe( gulp.dest( './app/assets/js/') );
});

gulp.task( 'vendors', [ 'vendors:js', 'vendors:css' ] );
gulp.task( 'start',   [ 'connect', 'watch' ] );
gulp.task( 'compile', [ 'vendors', 'js', 'js:compress' ] );
