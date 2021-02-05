const { src, dest, parallel, series, watch } = require("gulp");

const browserSync = require("browser-sync").create(),
  concat = require("gulp-concat"),
  del = require("del"),
  fileInclude = require("gulp-file-include"),
  gulpIf = require("gulp-if"),
  multipipe = require("multipipe"),
  notify = require("gulp-notify"),
  rename = require("gulp-rename");

const autoprefixer = require("gulp-autoprefixer"),
  cleancss = require("gulp-clean-css"),
  sass = require("gulp-dart-sass");

const bemValidator = require("gulp-html-bem-validator"),
  htmlMin = require("gulp-htmlmin"),
  htmlValidator = require("gulp-w3c-html-validator"),
  htmlReplace = require("gulp-html-replace");

const terser = require("gulp-terser");

const imagemin = require("gulp-imagemin"),
  newer = require("gulp-newer"),
  svgstore = require("gulp-svgstore"),
  webp = require("gulp-webp"),
  webpHTML = require("gulp-webp-in-html");

const ttf2woff = require("gulp-ttf2woff"),
  ttf2woff2 = require("gulp-ttf2woff2");

const FONTS =
  '<link rel="preload" href="fonts/PTSansNarrow-Bold.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="fonts/PTSansNarrow-Regular.woff2" as="font" type="font/woff2" crossorigin>';

const buildFolder = "build/";
const srcFolder = "src/";
const paths = {
  build: {
    html: buildFolder,
    css: buildFolder + "css/",
    js: buildFolder + "js/",
    img: buildFolder + "img/",
    fonts: buildFolder + "fonts/",
  },
  src: {
    html: srcFolder + "html/",
    scss: srcFolder + "scss/style.scss",
    css: srcFolder + "css/",
    js: srcFolder + "js/",
    img: srcFolder + "img/src/**/*.{jpg,jpeg,png,svg,webp}",
    icons: srcFolder + "img/src/icons/**/*.svg",
    fonts: srcFolder + "fonts/*.{woff,woff2}",
  },
  watch: {
    html: srcFolder + "html/**/*.html",
    scss: srcFolder + "scss/**/*.scss",
    js: srcFolder + "js/**/*.js",
    img: srcFolder + "img/src/**/*.{jpg,jpeg,png,svg,webp}",
  },
  clean: "./" + buildFolder,
};

const isBuild = process.env.NODE_ENV === "build";
const version = Date.now();

function server() {
  browserSync.init({
    server: { baseDir: srcFolder },
    notify: false,
    online: true,
  });
}

function styles() {
  return multipipe(
    src(paths.src.scss, { sourcemaps: true }),
    sass(),
    autoprefixer({
      overrideBrowserslist: ["last 10 versions"],
      grid: true,
    }),
    gulpIf(
      isBuild,
      multipipe(
        rename({ extname: `.min-v${version}.css` }),
        cleancss({
          level: {
            1: {
              all: true,
              normalizeUrls: false,
            },
            2: {
              restructureRules: true,
            },
          },
        }),
        dest(paths.build.css)
      ),
      multipipe(dest(paths.src.css, { sourcemaps: true }), browserSync.stream())
    )
  );
}

function scripts() {
  return multipipe(
    src(`${paths.src.js}app.js`),
    fileInclude(),
    gulpIf(
      isBuild,
      multipipe(
        rename(`scripts.min-v${version}.js`),
        terser(),
        dest(paths.build.js)
      ),
      multipipe(rename("scripts.js"), dest(paths.src.js), browserSync.stream())
    )
  );
}

function html() {
  return multipipe(
    src(`${paths.src.html}/*.html`),
    fileInclude(),
    webpHTML(),
    dest(`${srcFolder}`),
/*    htmlValidator(),
    bemValidator(),*/
    gulpIf(
      isBuild,
      multipipe(
        htmlReplace({
          css: `css/style.min-v${version}.css`,
          js: `js/scripts.min-v${version}.js`,
          fonts: FONTS,
        }),
        htmlMin({
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          removeComments: true,
        }),
        dest(paths.build.html)
      )
    )
  );
}

function images() {
  return multipipe(
    src(paths.src.img),
    gulpIf(
      isBuild,
      multipipe(
        webp({ quality: 70 }),
        dest(paths.build.img),
        src(paths.src.img),
        imagemin({
          progressive: true,
          interlaced: true,
          optimizationLevel: 3,
        }),
        dest(paths.build.img)
      ),
      multipipe(
        newer(`${srcFolder}img/`),
        webp({ quality: 70 }),
        dest(`${srcFolder}img/`),
        src(paths.src.img),
        imagemin({
          progressive: true,
          interlaced: true,
          optimizationLevel: 3,
        }),
        dest(`${srcFolder}img/`)
      )
    )
  );
}

function svgSprite() {
  return multipipe(
    src(`${srcFolder}img/src/icons/**/*.svg`),
    svgstore({
      inlineSvg: true,
    }),
    dest(`${srcFolder}img/`)
  );
}

function fonts() {
  return multipipe(
    src(paths.src.fonts),
    /*ttf2woff(),*/
    /* ttf2woff2(),*/
    dest(paths.build.fonts)
  );
}

function copy() {
  return multipipe(
    src(`${srcFolder}*{.ico,.svg,.png,.json}`),
    dest(buildFolder)
  );
}

function clean() {
  return del(paths.clean);
}

function startWatch() {
  watch(paths.watch.html).on("change", browserSync.reload);
  watch(paths.watch.scss, styles);
  watch(paths.watch.html, html);
  watch([paths.watch.js, `!${paths.src.js}scripts.js`], scripts);
  watch(paths.watch.img, images);
}

exports.server = server;
exports.scripts = scripts;
exports.styles = styles;
exports.html = html;
exports.svgSprite = svgSprite;
exports.images = images;
exports.clean = clean;

exports.default = parallel(html, styles, scripts, images, startWatch, server);
exports.build = series(
  clean,
  styles,
  fonts,
  scripts,
  images,
  svgSprite,
  copy,
  html
);
