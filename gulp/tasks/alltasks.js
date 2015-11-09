/**
 * Created by jack on 11/9/15.
 */
'use strict';

var config = require('../config');
var bundle = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var browserify = require('gulp-browserify');

var p = require('gulp-load-plugins')();

var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
// var pagespeed = require('psi');
var reload = browserSync.reload;

if (p.util.env.dev === true) {
    config.isProduction = false;
}

function getAllFilesFromFolders(dir) {
    var results = [];

    fs.readdirSync(dir).forEach(function(file) {
        file = path.join(dir, file);
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesFromFolders(file));
        } else {
            if (file.substring(0, 1) !== '.') {
                results.push(file);
            }
        }
    });

    return results;
}

gulp.task('clean', function(done) {
    return del([
        config.basePaths.dest,
        config.basePaths.archive
    ], done);
});

gulp.task('browserify', ['lint:js'], function(callback) {
    return gulp.src(config.paths.scripts.src + 'index.js')
        .pipe(browserify({
            debug: false
        }))
        .pipe(p.rename('bundle.js'))
        .pipe(p.size())
        .pipe(gulp.dest(config.paths.scripts.dest))
        .pipe(p.notify({ message: 'browserify task is complete' }), callback);
});

gulp.task('uglify', function() {
    return gulp.src(config.paths.scripts.dest + 'bundle.js')
        .pipe(p.uglify())
        .pipe(p.rename('bundle.min.js'))
        .pipe(p.size())
        .pipe(gulp.dest(config.paths.scripts.dest));
});

gulp.task('gzip', function() {
    return gulp.src(config.paths.scripts.dest + 'bundle.min.js')
        .pipe(p.gzip())
        .pipe(p.size())
        .pipe(p.rename('bundle.min.jsgz'))
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
    var files = [];
    files = files.concat(getAllFilesFromFolders(config.paths.styles.src));

    var streams = files.map(function(file) {
        gulp.src(file, { base: 'src' })
            .pipe(p.minifyCss())
            .pipe(p.size())
            .pipe(gulp.dest(config.basePaths.dest));
    });
});

gulp.task('copy', [
    'copy:html',
    'copy:nodeModules',
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
    browserSync({
        notify: true,
        open: false,
        debug: true,
        logPrefix: 'SERVE-DEV',
        proxy: { target: 'http://knockout-browserify.dist' },
        browser: ['google chrome canary']
    });

    gulp.watch(['src/js/*.js'], ['build_reload', reload]);
    gulp.watch(['src/index.html'], ['build_reload', reload]);
    gulp.watch(['src/css/*.css'], ['build_reload', reload]);
    gulp.watch(['gulpfile.js'], ['build_reload', reload]);
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

gulp.task('build', ['clean'],  function(dog) {
    runSequence(
        ['browserify', 'minify:css', 'copy'],

        dog);
});

gulp.task('reload', ['browserify'], function() {
    reload();
});

gulp.task('build_reload', function(done) {
    var s = p.size();
    runSequence('clean',
        ['minify:css', 'copy'],
        'browserify',
        'uglify',
        'gzip',
        done);
});
