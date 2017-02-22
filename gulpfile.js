'use strict';

var gulp      = require( 'gulp' );
var connect   = require( 'gulp-connect' );
var compass   = require( 'gulp-compass' );
var concat    = require( 'gulp-concat' );
var uglify    = require( 'gulp-uglify' );
var minifyCss = require( 'gulp-minify-css' );

gulp.task('connect', function () {
    connect.server({
        root: 'app',
        port: 8080,
        livereload: true,
        fallback: 'app/index.html'
    });
});

gulp.task('sass', function () {
    gulp.src('./app/**/*.scss')
        .pipe(compass({
            config_file: './app/assets/config.rb',
            css: './app/assets/css',
            sass: './app/assets/sass'
        }))
        .pipe(gulp.dest('temp'))
        .pipe(connect.reload());
});

gulp.task('html', function () {
    gulp.src('./app/**/*.html')
        .pipe(connect.reload());
});

gulp.task('json', function () {
    gulp.src('./app/**/*.json')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./app/**/*.html'], ['html']);
    gulp.watch(['./app/**/*.json'], ['json']);
    // gulp.watch(['./app/**/*.js', '!./app/assets/**/*.js'], ['js']);
    gulp.watch(['./app/**/*.js'], ['js']);
    gulp.watch(['./app/**/*.scss'], ['sass']);
});

gulp.task('js', function () {
    return gulp.src([
            './app/app.js',
            './app/features/components/formly/formlyConfig.js',
            './app/utils.js',
            './app/features/**/module.*.js',
            './app/features/**/service.*.js',
            './app/features/**/controller.*.js',
            './app/assets/js/vertex.js'
        ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./app/assets/js/'))
        .pipe(connect.reload());
});

gulp.task('js:compress', function () {
    return gulp.src(['./app/assets/js/app.js'])
        .pipe(concat('app.js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(gulp.dest('./app/assets/js/'))
});

gulp.task('vendors:css', function () {
    return gulp.src([
            './bower_components/angular-loading-bar/build/loading-bar.min.css',
            './bower_components/bootstrap/dist/css/bootstrap.min.css',
            './bower_components/fullcalendar/dist/fullcalendar.min.css',
            './bower_components/animate.css/animate.min.css',
            './bower_components/font-awesome/css/font-awesome.css',

            './lib/ui-bootstrap/ui-bootstrap-custom-0.14.3-csp.css'
        ])
        .pipe(concat('vendors.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./app/assets/css/'));
});

gulp.task('vendors:js', function () {
    return gulp.src([
            // './bower_components/angular/angular.min.js',
            './bower_components/angular/angular.js',
            './bower_components/jquery/dist/jquery.min.js',
            './bower_components/angular-ui-router/release/angular-ui-router.min.js',
            './bower_components/angular-permission/dist/angular-permission.js',
            './bower_components/angular-permission/dist/angular-permission-ui.js',
            './bower_components/angular-sanitize/angular-sanitize.min.js',
            './bower_components/i18next/i18next.min.js',
            './bower_components/i18next-xhr-backend/i18nextXHRBackend.min.js',
            './node_modules/ng-i18next/dist/ng-i18next.min.js',
            './bower_components/angular-loading-bar/build/loading-bar.min.js',
            './bower_components/ngstorage/ngStorage.min.js',
            './bower_components/angular-animate/angular-animate.min.js',
            './bower_components/moment/min/moment.min.js',
            './bower_components/angular-ui-calendar/src/calendar.js',
            './bower_components/fullcalendar/dist/fullcalendar.min.js',
            './bower_components/fullcalendar/dist/gcal.js',
            './bower_components/at-table/dist/angular-table.min.js',
            './bower_components/angular-dynamic-locale/dist/tmhDynamicLocale.min.js',
            './bower_components/api-check/dist/api-check.min.js',
            './bower_components/angular-elastic/elastic.js',
            './bower_components/angular-formly/dist/formly.js',
            './bower_components/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.min.js',
            './bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',

            './lib/ui-bootstrap/ui-bootstrap-custom-tpls-0.14.3.min.js'
        ])
        .pipe(concat('vendors.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('./app/assets/js/'));
});

gulp.task('vendors', ['vendors:js', 'vendors:css']);
gulp.task('start', ['connect', 'watch']);
gulp.task('compile', ['vendors', 'js', 'js:compress']);

