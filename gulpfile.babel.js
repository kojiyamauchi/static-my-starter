'use strict'

// Switches.
const switches = {
  ecma: true,
  json: true,
  styles: true,
  templates: true,
  templatemin: true,
  webps: true,
  minifyImages: true,
  favicon: true,
  siteMap: false,
  htaccess: false,
  copy: false,
  rename: false
}

// Gulp API.
import { src, dest, lastRun, series, parallel, watch } from 'gulp'

// For ECMA.
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import webpackDev from './webpack/webpack.dev.babel'
import webpackPro from './webpack/webpack.pro.babel'
// For Style.
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import stylelint from 'gulp-stylelint'
import sassGlob from 'gulp-sass-glob'
import postCss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import fixFlexBugs from 'postcss-flexbugs-fixes'
import cacheBustingBackgroundImage from 'postcss-cachebuster'
import cssmin from 'gulp-cssmin'
// For Template.
import ejs from 'gulp-ejs'
import templateMinify from 'gulp-htmlmin'
import templatePrettify from 'gulp-prettify'
// For Images.
import webp from 'gulp-webp'
import imagemin from 'gulp-imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import pngquant from 'imagemin-pngquant'
// Utilities.
import utility from 'gulp-util'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import rename from 'gulp-rename'
import del from 'del'
import replace from 'gulp-replace'
import crypto from 'crypto'
import gulpIf from 'gulp-if'
import { exec } from 'child_process'
// For Env.
import browserSync from 'browser-sync'

// Setup.
const sass = gulpSass(dartSass)
const setup = {
  ecmas: {
    in: './resource/base/**/*',
    out: './delivery/assets/js/',
    inTypes: './resource/types/**/*',
    inJson: './resource/materials/json/*',
    outJson: './delivery/assets/json/'
  },
  styles: {
    inScss: './resource/styles/**/*.scss',
    outScss: './resource/materials/css/',
    inCss: './resource/materials/css/**/*.css',
    outCss: './delivery/assets/css/',
    entryPointIgnore: [],
    globIgnore: [],
    postCssLayoutFix: [autoprefixer({ grid: true }), fixFlexBugs],
    postCssCacheBusting: [cacheBustingBackgroundImage({ imagesPath: '/resource/materials' })]
  },
  templates: {
    in: './resource/templates/**/*.ejs',
    out: './delivery/',
    ignore: '!./resource/templates/**/_*.ejs',
    entryPointIgnore: [],
    cacheBusting: './delivery/**/*.html'
  },
  images: {
    in: './resource/materials/images/*.{svg,png,jpg,jpeg,gif}',
    out: './delivery/assets/images/',
    inWebps: './resource/materials/toWebps/*.{svg,png,jpg,jpeg,gif}',
    outWebps: './resource/materials/images/'
  },
  favicons: {
    in: './resource/materials/favicons/*',
    out: './delivery/assets/favicons/'
  },
  reloadMonitor: ['./delivery/**/*', './resource/templates/**/_*.ejs']
}

// Development Mode of ECMA by Webpack.
export const onWebpackDev = () => {
  return webpackStream(webpackDev, webpack)
    .on('error', function () {
      this.emit('end')
    })
    .pipe(dest(setup.ecmas.out))
}

// Production Mode of ECMA by Webpack.
export const onWebpackPro = () => {
  return webpackStream(webpackPro, webpack)
    .on('error', function () {
      this.emit('end')
    })
    .pipe(dest(setup.ecmas.out))
}

// When Add JSON.
export const onJson = () => {
  return src(setup.ecmas.inJson).pipe(dest(setup.ecmas.outJson))
}

// Compile Sass.
export const onSass = () => {
  return src([setup.styles.inScss, ...setup.styles.entryPointIgnore], { sourcemaps: true })
    .pipe(plumber({ errorHandler: notify.onError({ message: 'SCSS Compile Error: <%= error.message %>', onLast: true }) }))
    .pipe(sassGlob({ ignorePaths: setup.styles.globIgnore }))
    .pipe(sass.sync({ outputStyle: 'expanded' }))
    .pipe(postCss(setup.styles.postCssLayoutFix))
    .pipe(stylelint({ reporters: [{ formatter: 'string', console: true }], fix: true }))
    .pipe(dest(setup.styles.outScss, { sourcemaps: '../maps' }))
}

// Minify CSS.
export const onCssmin = () => {
  return src(setup.styles.inCss)
    .pipe(postCss(setup.styles.postCssCacheBusting))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(setup.styles.outCss))
}

// Compile EJS.
export const onEjs = () => {
  return src([setup.templates.in, setup.templates.ignore, ...setup.templates.entryPointIgnore])
    .pipe(plumber({ errorHandler: notify.onError({ message: 'EJS Compile Error: <%= error.message %>', onLast: true }) }))
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(dest(setup.templates.out))
}

// Add Cache Busting to File Path & Minify or Prettify for Template.
export const onCacheBustingTemplate = () => {
  return src(setup.templates.cacheBusting)
    .pipe(
      replace(/\.(js|css|jpg|jpeg|png|svg|gif)\?rev/g, (match) => {
        const revision = () => crypto.randomBytes(8).toString('hex')
        return `${match}=${revision()}`
      })
    )
    .pipe(
      gulpIf(
        switches.templatemin,
        templateMinify({
          minifyJS: true,
          minifyCSS: true,
          collapseWhitespace: true,
          removeComments: true
        }),
        templatePrettify({
          indent_size: 2,
          indent_char: ' ',
          brace_style: 'preserve-inline',
          end_with_newline: false,
          preserve_newlines: false
        })
      )
    )
    .pipe(dest(setup.templates.out))
}

// Delete Query String for Cache Busting.
export const onDeleteCacheBusting = () => {
  return src(setup.templates.in).pipe(replace('?rev', '')).pipe(dest('./resource/templates/'))
}

// Convert to Webp.
export const onWebps = () => {
  return src(setup.images.inWebps).pipe(webp()).pipe(dest(setup.images.outWebps)).pipe(dest(setup.images.out))
}

// Minify Images.
export const onMinifyImages = () => {
  return src(setup.images.in)
    .pipe(plumber())
    .pipe(
      imagemin([
        pngquant({ quality: [0.65, 0.8], speed: 1 }),
        mozjpeg({ quality: 80 }),
        imagemin.gifsicle({ interlaced: false }),
        imagemin.svgo({ plugins: [{ removeViewBox: true }, { cleanupIDs: false }] })
      ])
    )
    .pipe(dest(setup.images.out))
}

// When Add site.webmanifest && browserconfig.xml. ( for Favicon. )
export const onManifest = () => {
  const cmd = 'cp resource/materials/favicons/site.webmanifest resource/materials/favicons/browserconfig.xml delivery'
  return exec(cmd)
}

// When Add Favicon.
export const onFavicon = () => {
  return src(['./resource/materials/favicons/*', '!./resource/materials/favicons/site.webmanifest', '!./resource/materials/favicons/browserconfig.xml']).pipe(
    dest(setup.favicons.out)
  )
}

// When Add Basic Auth.
export const onHtaccess = () => {
  const cmd = 'cp resource/materials/htaccess/.htaccess resource/materials/htaccess/.htpasswd delivery'
  return exec(cmd)
}

// Delete Unnecessary Files.
export const onDelete = (cb) => {
  return del(['**/.DS_Store', '!node_modules/**/*'], cb)
}

// For When Building Manually, Delete Compiled Files Before Building. ( When Switching Working Branches. )
export const onClean = () => {
  const cmd = 'npx rimraf delivery/* delivery/.htaccess delivery/.htpasswd resource/materials/css resource/materials/maps resource/materials/images/*.webp'
  return exec(cmd)
}

// When Renaming Files.
export const onRename = () => {
  return src('addFile.name')
    .pipe(rename({ extname: '.extension' }))
    .pipe(dest('.'))
}

// When File Copy / Move.
export const onCopy = () => {
  return src('Add Source Dir/').pipe('Add Destination Dir/')
}

// Launch Local Browser.
export const onBrowserSync = () => {
  return browserSync({
    browser: 'google chrome canary',
    open: 'external',
    notify: false,
    /* if Setting Proxy.
    proxy: 'test.dev or localhost:8080'
    */
    // Setting Root.
    server: { baseDir: './delivery/', index: 'index.html' },
    startPath: switches.siteMap ? 'site-map.html' : null
  })
}

// Build　Manually.
// ECMA / Style / Template / All.
export const onEcma = onWebpackDev
export const onStyles = series(onSass, onCssmin)
export const onTemplates = series(onEjs, onCacheBustingTemplate)
export const onBuild = series(
  onClean,
  parallel(onWebpackPro, onStyles, onTemplates, onWebps, onMinifyImages, (doneReport) => {
    switches.json && onJson()
    switches.favicon && onManifest()
    switches.favicon && onFavicon()
    switches.htaccess && onHtaccess()
    doneReport()
  })
)

// When Developing, Build Automatically.
exports.default = parallel(onBrowserSync, () => {
  switches.ecma && watch([setup.ecmas.in, setup.ecmas.inTypes], onEcma)
  switches.json && watch(setup.ecmas.inJson, onJson)
  switches.styles && watch(setup.styles.inScss, onStyles)
  switches.templates && watch(setup.templates.in, onTemplates)
  switches.webps && watch(setup.images.inWebps, onWebps)
  switches.minifyImages && watch(setup.images.in, onMinifyImages)
  switches.favicon && watch(setup.favicons.in, onManifest)
  switches.favicon && watch(setup.favicons.in, onFavicon)
  switches.rename && watch('**/*', onRename)
  watch(setup.reloadMonitor, { events: 'all', delay: 2000 }, (doneReport) => {
    switches.copy && onCopy()
    browserSync.reload()
    doneReport()
  })
})
