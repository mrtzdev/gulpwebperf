/**
 * Created by Morris R.  on 4/10/2017.
 */
var browserify = require('browserify'),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css');
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserSync = require('browser-sync');
    gutil = require('gulp-util');
    critical = require('critical').stream;
    imagemin = require('gulp-imagemin');

/* pathConfig */
var entryPoint = './src/js/index.js',
    browserDir = './dist/',
    sassWatchPath = './src/sass/**/*.scss',
    jsWatchPath = './src/**/*.js',
    htmlWatchPath = './**/*.html';
    cssWatchPath = './dist/css/*.css';


gulp.task('js', function () {
    return browserify(entryPoint, {debug: true, extensions: ['es6']})
        .transform("babelify", {presets: ["es2015"]})
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/js/'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function () {
    const config = {
        server: {baseDir: browserDir}
    };

    return browserSync(config);
});


gulp.task('sass', function () {
  return sass('src/sass/main.scss', {sourcemap: true})
    .on('error', sass.logError)
    .pipe(autoprefixer('> 1%','last 4 versions'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write('maps', {
            // includeContent: false,
            sourceRoot: './dist/css/maps'
        }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.reload({stream: true}));

});

// Generate & Inline Critical-path CSS
gulp.task('critical', function () {
    return gulp.src('./src/*.html')
        .pipe(critical({base: 'src/', inline: true, css: ['dist/css/main.css'],  width: 320,
         height: 480, }))
        .on('error', function(err) { gutil.log(gutil.colors.red(err.message)); })
        .pipe(gulp.dest('dist'));
});



gulp.task('imagemin', function () {
    return gulp.src('src/img/*')
    .pipe(imagemin())
		.pipe(gulp.dest('dist/img'))

});



gulp.task('watch', function () {
    gulp.watch(jsWatchPath, ['js']);
    gulp.watch(sassWatchPath, ['sass']).on('change', browserSync.reload);
    gulp.watch(cssWatchPath , ['critical']).on('change', browserSync.reload);
    gulp.watch( './src/*.html' , ['critical']).on('change', browserSync.reload);

    gulp.watch(htmlWatchPath, function () {
        return gulp.src('')
            .pipe(browserSync.reload({stream: true}))
    });

});

gulp.task('run', ['js', 'sass', 'watch', 'browser-sync', 'critical', 'imagemin']);


// add production task: remove souremaps.
