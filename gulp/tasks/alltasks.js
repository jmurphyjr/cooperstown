/**
 * Created by jack on 11/9/15.
 */
'use strict';

var config = require('../config');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var browserify = require('browserify');

var p = require('gulp-load-plugins')();

var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
// var pagespeed = require('psi');
var reload = browserSync.reload;
var lazypipe = require('lazypipe');

// Karma related testing framework
var karma = require('karma').server;


if (p.util.env.dev === true) {
    config.isProduction = false;
}

gulp.task('clean', function(done) {
    return del([
        config.basePaths.dest,
        config.basePaths.archive
    ], done);
});

gulp.task('browserify', ['lint:js'], function(callback) {
    browserSync.notify('Browserifying JavaScript');
    var b = browserify({
        debug: true,
        entries: ['./src/js/index.js']
    });

    // bundle requires debug as well. Doesn't seem to pass through
    // via the browserify config.
    return b.bundle({ debug: true })
        .on('error', p.util.log)
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(p.sourcemaps.init({ loadMaps: true }))
        .pipe(p.uglify())
        .pipe(p.rename('bundle.min.js'))
        .pipe(p.sourcemaps.write('./'))
        .pipe(gulp.dest(config.paths.scripts.dest));
});

gulp.task('html', function() {
    // Using lazy pipe to get css sourcemaps
    // Ref: https://github.com/jonkemp/gulp-useref
    var assets = p.useref.assets({}, lazypipe().pipe(p.sourcemaps.init, { loadMaps: true }));

    return gulp.src(config.basePaths.src + '*.html')
        .pipe(assets)
        .pipe(p.minifyCss())
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

gulp.task('gzip', function() {
    // return gulp.src(config.paths.scripts.dest + 'bundle.min.js')
    //     .pipe(p.gzip())
    //     .pipe(p.size())
    //     .pipe(p.rename('bundle.min.jsgz'))
    //     .pipe(gulp.dest(config.paths.scripts.dest));
    return gulp.src(config.basePaths.dest + '**/*.{html,css,js}')
        .pipe(p.size())
        .pipe(p.gzip())
        .pipe(p.rename(function(path) {
            console.log(path);
            path.extname = path.extname.replace('.gz', 'gz');
        }))
        .pipe(gulp.dest(config.basePaths.dest));
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
    // 'copy:nodeModules',
    'copy:perfmatters',
    'copy:htaccess'
]);

gulp.task('copy:htaccess', function() {
    return gulp.src(config.basePaths.src + '.htaccess')
        .pipe(gulp.dest(config.basePaths.dest));
});

gulp.task('copy:nodeModules', function() {
    return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/normalize.css/normalize.css'
        ])
        .pipe(p.size())
        .pipe(gulp.dest(config.paths.styles.dest + 'vendor/'));
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

gulp.task('serve-dev', ['build_reload'], function() {
    browserSync.notify('Starting serve-dev');
    browserSync(config.browsersync.development);

    gulp.watch(['src/js/*.js'], ['build_reload', reload]);
    gulp.watch(['src/index.html'], ['build_reload', reload]);
    gulp.watch(['src/css/*.css'], ['build_reload', reload]);
});

gulp.task('serve-test', function() {
    browserSync({
        notify: false,
        logPrefix: 'TEST',

        server: {
            baseDir: '.',
            index: 'SpecRunner.html'
        }
    });
    gulp.watch('SpecRunner.html', reload);
    gulp.watch(['spec/*.js'], reload);
    gulp.watch(['src/**/*.js'], reload);
});

// -----------------------------------------------------------------------------------------------------
// | Main Tasks                                                                                        |
// -----------------------------------------------------------------------------------------------------

gulp.task('build', function(done) {
    runSequence('clean',
        'copy',
        'html',
        'browserify',
        'gzip',
        done);
});

gulp.task('reload', ['browserify'], function() {
    reload();
});

gulp.task('build_reload', function(done) {
    runSequence('clean',
        'copy',
        'html',
        'browserify',
        // 'uglify',
        // 'gzip',
        done);
});

gulp.task('watch', function(done) {
    gulp.watch(['src/js/*.js'], ['lint:js']);
});

gulp.task('test', function() {
    return gulp.src(['test/**/*.js'], { read: false })
        .pipe(p.mocha({ reporter: 'spec' }))
        .on('error', p.util.log);
});

gulp.task('watch-test', function() {
    gulp.watch(['src/js/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('karma-test', function(done) {
    karma.start({
        configFile: '/Users/jack/Development/src/github.com/knockout-browserify/' + 'karma.conf.js',
        singleRun: false
    }, done);
});

// gulp.task('karma-test', function() {
//     return gulp.src(config.paths.scripts.src + 'google.js')
//         .pipe(karma({
//             configFile: '/Users/jack/Development/src/github.com/knockout-browserify/' + 'karma.conf.js',
//             action: 'run'
//         }));
// });
