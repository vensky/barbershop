const { src, dest, parallel, series, watch } = require('gulp');
const newer = require('gulp-newer'),
    rename = require('gulp-rename'),
    gulpIf = require('gulp-if'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    htmlReplace = require('gulp-html-replace'),
    fileInclude = require('gulp-file-include'),
    terser = require('gulp-terser'),
    htmlValidator = require('gulp-w3c-html-validator'),
    bemValidator = require('gulp-html-bem-validator'),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify'),
    multipipe = require('multipipe'),
    del = require('del');

const buildFolder= 'build/';
const srcFolder = 'src/';
const paths = {
    build: {
        html: buildFolder,
        css: buildFolder + 'css/',
        js: buildFolder + 'js/',
        img: buildFolder + 'img/',
        fonts: buildFolder + 'fonts/'
    },
    src: {
        html: srcFolder + 'html/',
        scss: srcFolder + 'scss/style.scss',
        css: srcFolder + 'css/',
        js: srcFolder + 'js/',
        img: srcFolder + 'img/**/*.{jpg, png, svg, webp}',
        fonts: srcFolder + 'fonts/*.{woff, woff2}'
    },
    watch: {
        html: srcFolder + 'html/**/*.html',
        scss: srcFolder + 'scss/**/*.scss',
        js: srcFolder + 'js/**/*.js',
        img: srcFolder + 'img/**/*.{jpg, png, svg, webp}'
    },
    clean: './' + buildFolder + '/'
}

const isBuild = process.env.NODE_ENV === 'build';
const version = Date.now();

function server() {
    browserSync.init({
        server: { baseDir: srcFolder },
        notify: false,
        online: true
    })
}

function styles() {
    return multipipe(
        src(paths.src.scss, { sourcemaps: true }),
        sass(),
        autoprefixer(
            {
                overrideBrowserslist: ['last 10 versions'],
                grid: true
            }
        ),
        gulpIf(isBuild, dest(paths.build.css), dest(paths.src.css, { sourcemaps: true })),
        gulpIf(isBuild, cleancss(
            {
                level: {
                    1: {
                        all: true,
                        normalizeUrls: false
                    },
                    2: {
                        restructureRules: true
                    }
                }
            })
        ),
        gulpIf(isBuild, rename({extname: `.min.css?v=${version}`})),
        gulpIf(isBuild, dest(paths.build.css)),
        gulpIf(!isBuild, browserSync.stream())
    ).
    on('error', notify.onError(function(err){
        return {
            title: 'Style',
            message: err.message
        }
    }))
}

function scripts() {
    return src(`${paths.src.js}scripts.js`)
        .pipe(fileInclude())
        .pipe(rename('scripts.min.js'))
        .pipe(gulpIf(isBuild, dest(paths.build.js), dest(paths.src.js)))
        .pipe(gulpIf(isBuild, terser()))
        .pipe(gulpIf(isBuild, rename(`scripts.min.js?v=${version}`)))
        .pipe(gulpIf(isBuild, dest(paths.build.js)))
        .pipe(gulpIf(!isBuild, browserSync.stream()))
}

function html() {
    // return src(`${paths.src.html}*.html`)
        return src(`${paths.src.html}/*.html`)
        .pipe(fileInclude())
        .pipe(dest(`${srcFolder}`))
        // .pipe(htmlValidator())
        // .pipe(bemValidator())
        // .pipe(gulpIf(isBuild, htmlReplace({
        //     'css': `css/style.min.css?v=${version}`,
        //     'js': `js/scripts.min.js?v=${version}`,
        // })))
        .pipe(gulpIf(isBuild, dest(paths.build.html)))
}

// function images() {
//     return src(`${paths.img}/**/*`)
//     .pipe(newer(`${paths.dist}/img`))
//     .pipe(imagemin())
//     .pipe(dest(`${paths.dist}/img`))
// }

function clean() {
    return del(paths.clean);
}

function startWatch() {
    watch(paths.watch.html).on('change', browserSync.reload);
    watch(paths.watch.scss, styles);
    watch(paths.watch.html, html);
    watch([paths.watch.js, '!' + paths.watch.js + 'scripts.min.js'], scripts);
   /* watch(paths.watch.js, scripts);*/
}

exports.server = server;
exports.scripts = scripts;
exports.styles = styles;
exports.html = html;
// exports.images = images;
exports.clean = clean;

exports.default = parallel(html, styles, scripts, startWatch, server);
exports.build = series(clean, html, styles, scripts);


