/**
 * Created by jack on 11/8/15.
 */

var src = 'src/';
var dest = 'dist/';
var archive = 'archive/';

module.exports = {
    basePaths: {
        src: src,
        dest: dest,
        archive: archive
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

    isProduction: true
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
//     browsersync: {
//         development: {
//             proxy: { target: 'http://knockout-browserify.dist' },
//             browser: ['google chrome canary'],
//             logPrefix: 'SERVE-DEV',
//             debug: true,
//             open: false,
//             notify: true,
//             files: [
//                 developmentAssets + '/css/*.css',
//                 developmentAssets + '/js/*.js'
//             ]
//
//         }
//
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
