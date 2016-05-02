/**
 * Created by jack on 11/9/15.
 */
'use strict';

var config = require('../config');
var path = require('path');

var gulp = require('gulp');
var gulpif = require('gulp-if');
var useref = require('gulp-useref');
var p = require('gulp-load-plugins')();

var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
// var pagespeed = require('psi');
var reload = browserSync.reload;
var lazypipe = require('lazypipe');


if (p.util.env.dev === true) {
    config.isProduction = false;
}

gulp.task('clean', function(done) {
    return del([
        config.basePaths.dest,
        config.basePaths.archive
    ], done);
});

gulp.task('html', function() {
    // Using lazy pipe to get css sourcemaps
    // Ref: https://github.com/jonkemp/gulp-useref
    var assets = p.useref.assets({}, lazypipe().pipe(p.sourcemaps.init, { loadMaps: true }));

    return gulp.src(config.basePaths.src + '*.html')
        .pipe(assets)
        //.pipe(p.minifyCss())
        .pipe(p.sourcemaps.write('./'))
        .pipe(assets.restore())
        .pipe(p.useref())
        .pipe(p.size())
        .pipe(gulp.dest(config.basePaths.dest));
});

gulp.task('uglify', function() {
    return gulp.src(config.paths.scripts.dest + 'bundle.js')
        .pipe(p.uglify())
        .pipe(p.rename('bundle.min.js'))
        .pipe(p.size())
        .pipe(gulp.dest(config.paths.scripts.dest));
});

gulp.task('lint:js', function() {
    return gulp.src(
        config.appFiles.scripts
        )
        .pipe(p.jscs())
        .pipe(p.jshint())
        .pipe(p.jshint.reporter('jshint-stylish'));
});

gulp.task('minify:css', function() {
    return gulp.src(config.appFiles.styles, { base: 'src' })
        .pipe(p.minifyCss())
        .pipe(p.size())
        .pipe(gulp.dest(config.basePaths.dest));
});

gulp.task('copy', [
    // 'copy:html',
    'copy:nodeModules',
    'copy:images',
    'copy:htaccess'
]);

gulp.task('copy:htaccess', function() {
    return gulp.src(config.basePaths.src + '.htaccess')
        .pipe(gulp.dest(config.basePaths.dest));
});

gulp.task('copy:nodeModules', function() {
    return gulp.src(['node_modules/normalize.css/normalize.css'
        ])
        .pipe(p.size())
        .pipe(gulp.dest(config.paths.styles.dest));
});

gulp.task('copy:images', function() {
    return gulp.src(config.basePaths.src + 'images/*')
        .pipe(gulp.dest(config.basePaths.dest + 'images/'));
});

gulp.task('copy:perfmatters', function() {
    return gulp.src(config.paths.scripts.src + 'perfmatters.js')
        .pipe(p.size())
        .pipe(gulp.dest(config.paths.scripts.dest));
});

gulp.task('copy:html', function() {
    return gulp.src(config.basePaths.src + '*.html', {
            dot:true,
            base: 'src'
        })
        .pipe(gulp.dest(config.basePaths.dest));
});

gulp.task('default', ['build_reload'], function() {
    browserSync.notify('Starting serve-dev');
    browserSync(config.browsersync.development);

    gulp.watch(['src/js/*.js'], ['build_reload', reload]);
    gulp.watch(['src/index.html'], ['build_reload', reload]);
    gulp.watch(['src/css/*.css'], ['build_reload', reload]);
});

// ------------------------------------------------------------------------------------------------
// | Main Tasks                                                                                   |
// ------------------------------------------------------------------------------------------------

gulp.task('build_reload', function(done) {
    runSequence('clean',
        'copy',
        'html',
        'uglify',
        done);
});

