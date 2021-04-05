const gulp = require('gulp');
// const {src, dest, task, series, parallel} = require('gulp');

// RUNNING DEVELOPMENT
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

//MINIFICATION AND OPTIMIZE
const uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	tinypngfree = require('gulp-tinypng-free'),
	purgecss = require('gulp-purgecss'),
	critical = require('critical').stream;

//ERROR MANAGEMENT
const plumber = require('gulp-plumber'),
	notify = require('gulp-notify');

//Postcss and plugins
const postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer');

//FILE MANAGEMENT
const CompressZip = require('gulp-zip'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	// gulpCopy = require('gulp-copy'),
	htmlreplace = require('gulp-html-replace'),
	sourcemaps = require('gulp-sourcemaps');

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// critical JS
gulp.task('criticalCSS', criticalCSS);

function criticalCSS() {
	return gulp
		.src('build/*.html')
		.pipe(
			critical({
				base: 'build',
				inline: true,
				css: [
					'build/css/bundle.vendor.min.css',
				]
			})
		)
		.pipe(plumber())
		.pipe(gulp.dest('build'))
		.pipe(notify('Critical done'));
}

// Purge CSS
gulp.task('purgeCss', purgeCss);

function purgeCss() {
	return gulp
		.src('build/css/bundle.vendor.min.css')
		.pipe(
			purgecss({
				content: [
					// All css
					'build/*html',
					

					// All JS
					'build/js/assets/bundle.plugins.js',
					'build/js/functions.min.js'

				]
			})
		)
		.pipe(gulp.dest('build/css/purge/bundle.vendor.min.css'));
}

// Optimize JS to production
gulp.task('jsOptimize', jsOptimize);

function jsOptimize() {
	return gulp
		.src('src/js/functions.js')
		.pipe(concat('functions.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/js/'))
		.pipe(notify('JS successfully optimized'));
}

// Optimize Jquery to production
gulp.task('jqueryOptimize', jqueryOptimize);

function jqueryOptimize() {
	return gulp
		.src('src/js/assets/jquery.js')
		.pipe(concat('jquery.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/js/assets'))
		.pipe(notify('Jquery successfully optimized'));
}

// Compile Javascript component to production
gulp.task('jsBundle', jsBundle);

function jsBundle() {
	return (
		gulp
		// select asset for bundle
		.src([
			'src/js/assets/bootstrap.js',
			'src/js/assets/jquery.placeholder.js',
			'src/js/assets/masonry.pkgd.min.js',
			'src/js/assets/imagesloaded.pkgd.min.js',
			'src/js/assets/validation.js',
			'src/js/assets/packery.pkgd.min.js',
			'src/js/assets/velocity.min.js',
			'src/js/assets/typed.min.js',
			'src/js/assets/animsition.js',
			'src/js/assets/show-on-scroll.js'
		])
		//
		.pipe(plumber())
		.pipe(concat('bundle.plugins.js'))
		.pipe(gulp.dest('build/js/assets'))
		.pipe(rename('bundle.plugins.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/js/assets'))
		.pipe(notify('All JS successfully compile and optimized'))
	);
}

// Compile CSS component to production
gulp.task('cssBundle', cssBundle);

function cssBundle() {
	var plugins = [autoprefixer({
		overrideBrowserslist: ['last 3 version']
	})];
	return (
		gulp
		// select asset for bundle
		.src([
			'src/css/core.css',
			'src/css/styles.css',
			'src/css/custom.css'
		])
		//
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(postcss(plugins))
		.pipe(concat('bundle.vendor.min.css'))
		.pipe(cleanCSS())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('build/css/'))
		.pipe(notify('All CSS successfully compile and optimized'))
	);
}

gulp.task('copyExtraAsset1', copyExtraAsset1);

function copyExtraAsset1() {
	return gulp
		.src(['src/fonts/**/*'])
		.pipe(gulp.dest('build/fonts'));
}

// Optimize image (tinyPNG) to production
gulp.task('tinypngOptimization', tinypngOptimization);

function tinypngOptimization() {
	return gulp
		.src(['src/images/**/*.*'])
		.pipe(plumber())
		.pipe(tinypngfree())
		.pipe(gulp.dest('build/images'));
}

// HTML Replace
gulp.task('htmlReplace', htmlReplace);

function htmlReplace() {
	return gulp
		.src('src/*.html')
		.pipe(
			htmlreplace({
				jsPlugins: 'js/assets/bundle.plugins.min.js',
				jQuery: 'js/assets/jquery.min.js',
				jsFunction: 'js/functions.min.js',

				cssBundel: 'css/bundle.vendor.min.css'
			})
		)
		.pipe(plumber())
		.pipe(gulp.dest('build/'));
}

// ***************************************
// ************** MAIN TASK **************
// ***************************************

// Default Task. Local webserver
gulp.task('run', run);

function run() {
	browserSync.init({
		server: {
			baseDir: 'src'
		}
	});
	// Watch all file
	gulp.watch('src/**/*').on('change', browserSync.reload);
}


// Compress to ZIP
gulp.task('zip', zip);

function zip() {
	gulp.src('build/**')
		.pipe(CompressZip('build.zip'))
		.pipe(gulp.dest('build'));
}

// define complex tasks
const build = gulp.series(htmlReplace, cssBundle, jsOptimize, jqueryOptimize, jsBundle, copyExtraAsset1, tinypngOptimization, criticalCSS);

// export tasks
exports.build = build;

// BUILD PROJECT

///////////////////////////////////////////////////////////////////////////////////////////////

// Clean build directory
function clear() {
	return gulp.src('build/**/*', {
		read: false
	}).pipe(clean());
}

///////////////////////////////////////////////////////////////////////////////////////////////

// FINAL BUILD AND ZIP FILE
// gulp.task('zipBuild', ['build'], function() {
//     gulp.src('build/**')
//         .pipe(zip('archive.zip'))
//         .pipe(gulp.dest('build'));
// });
///////////////////////////////////////////////////////////////////////////////////////////////