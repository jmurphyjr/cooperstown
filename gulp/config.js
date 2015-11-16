/**
 * Created by jack on 11/8/15.
 */

var src = 'src/';
var dest = 'dist/';
var archive = 'archive/';
var home = '.';

module.exports = {
    basePaths: {
        src: src,
        dest: dest,
        archive: archive,
        home: home
    },

    paths: {
        scripts: {
            src: src + 'js/',
            dest: dest + 'js/'
        },
        styles: {
            src: src + 'css/',
            dest: dest + 'css/'
        }
    },

    appFiles: {
        styles: src + 'css/*.css',
        scripts: [src + 'js/*.js', '*.js']
    },

    isProduction: true,

    browsersync: {
        development: {
            proxy: { target: 'http://knockout-browserify.dist/' },
            browser: ['google chrome canary'],
            logPrefix: 'SERVE-DEV',
            debug: false,
            open: false,
            notify: true
        }

    },
    browserify: {
        // Enable source maps
        debug: true,
        entries: ['./src/js/index.js']
    }
};
// module.exports = {
//     paths: {
//         scripts: {
//             src: src + 'js/',
//             development: development + 'js/',
//             production: production + 'js'
//         },
//         styles: {
//             src: src + 'css/',
//             development: development + 'css/',
//             production: production + 'css/'
//         }
//     },
//     delete: {
//         src: [development]
//     },
//     browserify: {
//         // Enable source maps
//         debug: true,
//         bundleConfigs: [{
//             entries:
//         }]
//     }
// };
//
