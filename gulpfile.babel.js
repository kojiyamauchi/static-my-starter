'use strict'

// Switches Each Mode.
const switches = {
  ecma: true,
  json: true,
  styles: true,
  templates: true,
  templatemin: true,
  compressionImages: true,
  favicon: true,
  delete: true,
  siteMap: false,
  copy: false,
  rename: false
}

// Import Gulp API.
import { src, dest, lastRun, series, parallel, watch } from 'gulp'

// For ECMA.
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import webpackDev from './webpack/webpack.dev.babel'
import webpackPro from './webpack/webpack.pro.babel'
// For Style.
import sass from 'gulp-sass'
import sassCompiler from 'sass'
import stylelint from 'gulp-stylelint'
import sassGlob from 'gulp-sass-glob'
import fibers from 'fibers'
import postCSS from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import fixFlexBugs from 'postcss-flexbugs-fixes'
import cacheBustingBackgroundImage from 'postcss-cachebuster'
import cssmin from 'gulp-cssmin'
// For Template.
import ejs from 'gulp-ejs'
import templateMinify from 'gulp-htmlmin'
import templatePrettify from 'gulp-prettify'
// For Images.
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
// For Env.
import browserSync from 'browser-sync'

// Settings.
sass.compiler = sassCompiler
const settings = {
  postCSSLayoutFix: [autoprefixer({ grid: true }), fixFlexBugs],
  postCSSCacheBusting: [cacheBustingBackgroundImage({ imagesPath: '/resource/materials' })],
  templatesMonitor: ['./resource/templates/**/*'],
  templateEntryPointIgnore: [],
  cacheBustingTemplate: ['./delivery/**/*.html'],
  styleEntryPointIgnore: [],
  styleGlobIgnore: [],
  inCompressionImages: ['./resource/materials/images/*'],
  outCompressionImages: './delivery/assets/images/',
  reloadMonitor: ['./delivery/**/*', './resource/templates/**/_*.ejs', './resource/styles/**/*.scss']
}

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

// Compile Sass.
export const onSass = () => {
  return src(['./resource/styles/**/*.scss', ...settings.styleEntryPointIgnore], { sourcemaps: true })
    .pipe(plumber({ errorHandler: notify.onError({ message: 'SCSS Compile Error: <%= error.message %>', onLast: true }) }))
    .pipe(stylelint({ reporters: [{ formatter: 'string', console: true }] }))
    .pipe(sassGlob({ ignorePaths: settings.styleGlobIgnore }))
    .pipe(sass({ fiber: fibers, outputStyle: 'expanded' }))
    .pipe(postCSS(settings.postCSSLayoutFix))
    .pipe(dest('./resource/materials/css/', { sourcemaps: '../maps' }))
}

// Minify CSS.
export const onCssmin = () => {
  return src('./resource/materials/css/**/*.css')
    .pipe(postCSS(settings.postCSSCacheBusting))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./delivery/assets/css/'))
}

// Compile EJS.
export const onEjs = () => {
  return src(['./resource/templates/**/*.ejs', '!./resource/templates/**/_*.ejs', ...settings.templateEntryPointIgnore])
    .pipe(plumber({ errorHandler: notify.onError({ message: 'EJS Compile Error: <%= error.message %>', onLast: true }) }))
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('./delivery/'))
}

// Add Cache Busting to File Path & Minify or Prettify for Template.
export const onCacheBustingTemplate = () => {
  return src(settings.cacheBustingTemplate)
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

// Images Minify.
export const onCompressionImages = () => {
  return src(settings.inCompressionImages)
    .pipe(plumber())
    .pipe(
      imagemin([
        pngquant({ quality: [0.65, 0.8], speed: 1 }),
        mozjpeg({ quality: 80 }),
        imagemin.gifsicle({ interlaced: false }),
        imagemin.svgo({ plugins: [{ removeViewBox: true }, { cleanupIDs: false }] })
      ])
    )
    .pipe(dest(settings.outCompressionImages))
}

// When Add site.webmanifest && browserconfig.xml. ( for Favicon. )
export const onManifest = () => {
  return src(['./resource/materials/favicons/site.webmanifest', './resource/materials/favicons/browserconfig.xml']).pipe(dest('./delivery/'))
}

// When Add Favicon.
export const onFavicon = () => {
  return src(['./resource/materials/favicons/*', '!./resource/materials/favicons/site.webmanifest', '!./resource/materials/favicons/browserconfig.xml']).pipe(
    dest('./delivery/assets/favicons/')
  )
}

// Delete Unnecessary Files.
export const onDelete = (cb) => {
  return del(['**/.DS_Store', './delivery/**/*.ejs', '!node_modules/**/*'], cb)
}

// For When Building Manually, Delete Compiled Files Before Building. ( When Switching Working Branches. )
export const onClean = (cd) => {
  return del(['./delivery/**/*', './resource/materials/css', './resource/materials/maps'])
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
  parallel(onWebpackPro, onStyles, onTemplates, onCompressionImages, (doneReport) => {
    switches.json && onJson()
    switches.favicon && onManifest()
    switches.favicon && onFavicon()
    doneReport()
  })
)

// When Developing, Build Automatically.
exports.default = parallel(onBrowserSync, () => {
  switches.ecma && watch(['./resource/base/**/*', './resource/types/**/*'], onEcma)
  switches.json && watch('./resource/materials/json/*', onJson)
  switches.styles && watch('./resource/styles/**/*.scss', onStyles)
  switches.templates && watch(settings.templatesMonitor, onTemplates)
  switches.compressionImages && watch(settings.inCompressionImages, onCompressionImages)
  switches.favicon && watch('./resource/materials/favicons/*', onManifest)
  switches.favicon && watch('./resource/materials/favicons/*', onFavicon)
  switches.delete && watch(['./resource/**/*.ejs', '!./resource/templates/**/*'], onDelete)
  switches.rename && watch('**/*', onRename)
  let timeID
  watch(settings.reloadMonitor).on('change', () => {
    clearTimeout(timeID)
    timeID = setTimeout(() => {
      switches.copy && onCopy()
      browserSync.reload()
    }, 2000)
  })
})
