/**
 * Created by jack on 11/2/15.
 */
/* jshint node: true */
'use strict';

var basePaths = {
    src: 'src/',
    dest: 'dist/',
    archive: 'archive/'
};

var paths = {
    scripts: {
        src: basePaths.src + 'js/',
        dest: basePaths.dest + 'js/'
    },
    styles: {
        src: basePaths.src + 'css/',
        dest: basePaths.dest + 'css/'
    }
};

var appFiles = {
    styles: paths.styles.src + '*.css',
    scripts: [paths.scripts.src + '*.js', '*.js']
};

var isProduction = true;

var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var browserify = require('gulp-browserify');

var p = require('gulp-load-plugins')();

var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;

if (p.util.env.dev === true) {
    isProduction = false;
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
        basePaths.dest,
        basePaths.archive
    ], done);
});

gulp.task('browserify', ['lint:js'], function(callback) {
    gulp.src([paths.scripts.src + 'index.js'], { read: false })
        .pipe(browserify({
            debug: true
        }))
        .on('prebundle', function(bundler) {
            bundler.require('knockout');
        })
        .pipe(p.rename('bundle.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(p.notify({ message: 'browserify task is complete' }));
    callback();
});

gulp.task('lint:js', function() {
    return gulp.src(
        appFiles.scripts
    )
        .pipe(p.jscs())
        .pipe(p.jshint())
        .pipe(p.jshint.reporter('jshint-stylish'));
});

gulp.task('minify:css', function() {
    var files = [];
    files = files.concat(getAllFilesFromFolders(paths.styles.src));

    var streams = files.map(function(file) {
        gulp.src(file, { base: 'src' })
            .pipe(p.minifyCss())
            .pipe(gulp.dest(basePaths.dest));
    });
});

gulp.task('copy', [
    'copy:html',
    'copy:nodeModules'
]);

gulp.task('copy:nodeModules', function() {
    return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/normalize.css/normalize.css'
    ])
        .pipe(gulp.dest(paths.styles.dest + 'vendor/'));
});

gulp.task('copy:html', function() {
    return gulp.src(basePaths.src + '*.html', {
        dot:true,
        base: 'src'
    })
        .pipe(gulp.dest(basePaths.dest));
});

gulp.task('serve-dev', ['build_reload'], function() {
    browserSync.init(['dist/js/bundle.js'], {
        notify: false,

        logPrefix: 'WSK',

        server: ['.tmp', 'dist'],
        browser: ['google chrome canary']
    });

    // gulp.watch(['dist/js/bundle.js'], reload);
    gulp.watch(['src/js/*.js'], ['build_reload']);
    gulp.watch(['src/index.html'], ['build_reload']);
    gulp.watch(['src/css/*.css'], ['build_reload']);
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
    runSequence('clean', ['minify:css', 'copy'], 'browserify', done);
});
