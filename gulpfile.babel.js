'use strict'

// Switches Each Mode.
const switches = {
  production: false,
  siteMap: false,
  ecma: true,
  json: true,
  styles: true,
  templates: true,
  templatemin: true,
  compressionImages: true,
  favicon: true,
  delete: true,
  copy: false,
  rename: false
}

// Import Gulp API.
import { src, dest, lastRun, series, parallel, watch } from 'gulp'

/*
 Plugin Modules.
*/
// Utilities.
import utility from 'gulp-util'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import rename from 'gulp-rename'
import del from 'del'
import replace from 'gulp-replace'
import crypto from 'crypto'
import gulpIf from 'gulp-if'
// For Webpack & JS.
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import webpackDev from './webpack/webpack.dev.babel'
import webpackPro from './webpack/webpack.pro.babel'
// For Sass & CSS.
import sass from 'gulp-sass'
import sassGlob from 'gulp-sass-glob'
import postCSS from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import fixFlexBugs from 'postcss-flexbugs-fixes'
import cacheBustingBackgroundImage from 'postcss-cachebuster'
import csscomb from 'gulp-csscomb'
import cssmin from 'gulp-cssmin'
// For Template.
import ejs from 'gulp-ejs'
import templateMinify from 'gulp-htmlmin'
import templatePrettify from 'gulp-prettify'
// For Images.
import imagemin from 'gulp-imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import pngquant from 'imagemin-pngquant'
// For Env.
import browserSync from 'browser-sync'

// Settings.
const postCSSLayoutFix = [autoprefixer({ grid: true }), fixFlexBugs]
const postCSSCacheBusting = [cacheBustingBackgroundImage({imagesPath: '/resource/materials'})]
const templatesMonitor = ['./resource/templates/**/*']
const templateEntryPointIgnore = []
const cacheBustingTemplate = ['./delivery/**/*.html']
const styleEntryPointIgnore = []
const styleGlobIgnore = []
const inCompressionImages = ['./resource/materials/images/*']
const outCompressionImages = './delivery/assets/images/'
const reloadMonitor = ['./delivery/**/*', './resource/templates/**/_*.ejs', './resource/styles/**/*.scss']

// Development Mode of ECMA by Webpack.
export const onWebpackDev = () => {
  return webpackStream(webpackDev, webpack)
    .on('error', function () {
      this.emit('end')
    })
    .pipe(dest('./delivery/assets/js/'))
}

// Production Mode of ECMA by Webpack.
export const onWebpackPro = () => {
  return webpackStream(webpackPro, webpack)
    .on('error', function () {
      this.emit('end')
    })
    .pipe(dest('./delivery/assets/js/'))
}

// When Add JSON.
export const onJson = () => {
  return src('./resource/materials/json/*').pipe(dest('./delivery/assets/json/'))
}

// Compile sass.
export const onSass = () => {
  return src(['./resource/styles/**/*.scss', ...styleEntryPointIgnore], { sourcemaps: true })
    .pipe(plumber({ errorHandler: notify.onError('error: <%= error.message %>') }))
    .pipe(sassGlob({ ignorePaths: styleGlobIgnore }))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postCSS(postCSSLayoutFix))
    .pipe(csscomb())
    .pipe(dest('./resource/materials/css/', { sourcemaps: '../maps' }))
}

// Minify CSS.
export const onCssmin = () => {
  return src('./resource/materials/css/**/*.css')
    .pipe(postCSS(postCSSCacheBusting))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./delivery/assets/css/'))
}

// Compile EJS.
export const onEjs = () => {
  return src(['./resource/templates/**/*.ejs', '!./resource/templates/**/_*.ejs', ...templateEntryPointIgnore])
    .pipe(plumber({ errorHandler: notify.onError('error: <%= error.message %>') }))
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('./delivery/'))
}

// Add Cache Busting to File Path & Minify or Prettify for Template.
export const onCacheBustingTemplate = () => {
  return src(cacheBustingTemplate)
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
          end_with_newline: false,
          preserve_newlines: false,
          unformatted: ['span', 'a', 'img']
        })
      )
    )
    .pipe(dest('./delivery/'))
}

// Delete Query String for Cache Busting.
export const onDeleteCacheBusting = () => {
  return src('./resource/templates/**/*.ejs').pipe(replace('?rev', '')).pipe(dest('./resource/templates/'))
}

const onCompressionImages = () => {
  return src(inCompressionImages)
    .pipe(plumber())
    .pipe(
      imagemin([
        pngquant({ quality: [0.65, 0.8], speed: 1 }),
        mozjpeg({ quality: 80 }),
        imagemin.gifsicle({ interlaced: false }),
        imagemin.svgo({ plugins: [{ removeViewBox: true }, { cleanupIDs: false }] })
      ])
    )
    .pipe(dest(outCompressionImages))
}

// When Add site.webmanifest && browserconfig.xml. ( for Favicon. )
export const onManifest = () => {
  return src(['./resource/materials/favicons/site.webmanifest', './resource/materials/favicons/browserconfig.xml']).pipe(dest('./delivery/'))
}

// When Add Favicon.
export const onFavicon = () => {
  return src(['./resource/materials/favicons/*', '!./resource/materials/favicons/site.webmanifest', '!./resource/materials/favicons/browserconfig.xml']).pipe(dest('./delivery/assets/favicons/'))
}

// Delete Unnecessary Files.
export const onDelete = (cb) => {
  return del(['**/.DS_Store', './delivery/**/*.ejs', '!node_modules/**/*'], cb)
}

// For When Building Manually, Delete Compiled Files Before Building. ( When Switching Working Branches. )
export const onClean = (cd) => {
  return del(['./delivery/**/*','./resource/materials/css', './resource/materials/maps'])
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
// Logic / Style / Template / All.
export const onEcma = switches.production ? onWebpackPro : onWebpackDev
export const onStyles = series(onSass, onCssmin)
export const onTemplates = series(onEjs, onCacheBustingTemplate)
export const onBuild = series(
  onClean,
  parallel(onWebpackPro, onStyles, onTemplates, onCompressionImages, (doneReport) => {
    if (switches.json) onJson()
    if (switches.favicon) onManifest()
    if (switches.favicon) onFavicon()
    doneReport()
  })
)

// When Developing, Build Automatically.
exports.default = parallel(onBrowserSync, () => {
  if (switches.ecma) watch(['./resource/base/**/*', './resource/types/**/*'], onEcma)
  if (switches.json) watch('./resource/materials/json/*', onJson)
  if (switches.styles) watch('./resource/styles/**/*.scss', onStyles)
  if (switches.templates) watch(templatesMonitor, onTemplates)
  if (switches.compressionImages) watch(inCompressionImages, onCompressionImages)
  if (switches.favicon) watch('./resource/materials/favicons/*', onManifest)
  if (switches.favicon) watch('./resource/materials/favicons/*', onFavicon)
  if (switches.delete) watch(['./resource/**/*.ejs', '!./resource/templates/**/*'], onDelete)
  if (switches.rename) watch('**/*', onRename)
  let timeID
  watch(reloadMonitor).on('change', () => {
    clearTimeout(timeID)
    timeID = setTimeout(() => {
      if (switches.copy) onCopy()
      browserSync.reload()
    }, 2000)
  })
})
