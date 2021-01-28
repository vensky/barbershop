const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    del = require('del'),
    fileInclude = require('gulp-file-include'),
    gulpIf = require('gulp-if'),
    multipipe = require('multipipe'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename');

const autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    sass = require('gulp-sass');

const bemValidator = require('gulp-html-bem-validator'),
    htmlValidator = require('gulp-w3c-html-validator'),
    htmlReplace = require('gulp-html-replace');

const terser = require('gulp-terser');

const imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer'),
    /*    svgmin = require('gulp-svgmin'),*/
    svgstore = require('gulp-svgstore');

const buildFolder = 'build/';
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
        img: srcFolder + 'img/src/**/*.{jpg,jpeg,png,svg,webp}',
        icons: srcFolder + 'img/src/icons/**/*.svg',
        fonts: srcFolder + 'fonts/*.{woff, woff2}'
    },
    watch: {
        html: srcFolder + 'html/**/*.html',
        scss: srcFolder + 'scss/**/*.scss',
        js: srcFolder + 'js/**/*.js',
        img: srcFolder + 'img/src/**/*.{jpg,jpeg,png,svg,webp}'
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
        autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }),
        gulpIf(isBuild, dest(paths.build.css), dest(paths.src.css, { sourcemaps: true })),
        gulpIf(isBuild, cleancss({
            level: {
                1: {
                    all: true,
                    normalizeUrls: false
                },
                2: {
                    restructureRules: true
                }
            }
        })),
        gulpIf(isBuild, rename({ extname: `.min.css?v=${version}` })),
        gulpIf(isBuild, dest(paths.build.css)),
        gulpIf(!isBuild, browserSync.stream())
    ).
    on('error', notify.onError(function(err) {
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
    return src(`${paths.src.html}/*.html`)
        .pipe(fileInclude())
        .pipe(dest(`${srcFolder}`))
        .pipe(htmlValidator())
        // .pipe(bemValidator())
        .pipe(gulpIf(isBuild, htmlReplace({
            'css': `css/style.min.css?v=${version}`,
            'js': `js/scripts.min.js?v=${version}`,
        })))
        .pipe(gulpIf(isBuild, dest(paths.build.html)))
    on('error', notify.onError(function(err) {
        return {
            title: 'HTML',
            message: err.message
        }
    }))
}

function svgSprite() {
    return src(`${srcFolder}img/dist/icons/**/*.svg`)
        .pipe(svgstore({ fileName: 'icons.svg', inlineSvg: true, cleanup: false }))
        .pipe(dest(`${srcFolder}img/dist/`))
}

function images() {
    return src(paths.src.img)
        .pipe(newer(`${srcFolder}img/dist/`))
        .pipe(imagemin())
        .pipe(dest(`${srcFolder}img/dist/`))
}

function clean() {
    return del(paths.clean);
}

function startWatch() {
    watch(paths.watch.html).on('change', browserSync.reload);
    watch(paths.watch.scss, styles);
    watch(paths.watch.html, html);
    watch([paths.watch.js, `!${paths.src.js}scripts.min.js`], scripts);
    watch(paths.watch.img, images);
}

exports.server = server;
exports.scripts = scripts;
exports.styles = styles;
exports.html = html;
exports.svgSprite = svgSprite;
exports.images = images;
exports.clean = clean;

exports.default = parallel(html, styles, scripts, startWatch, server);
exports.build = series(clean, html, styles, scripts);