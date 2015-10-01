var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var ts = require('gulp-typescript');
var merge = require('merge2');

var tsProject = ts.createProject({
    declaration: true,
    noExternalResolve: true	
});

gulp.task('compile:ts', function() {
	var tsResult = gulp.src('./ts/**/*.ts')
		//.pipe(plumber())
		.pipe(ts(tsProject));
		
	return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done. 
        tsResult.dts.pipe(gulp.dest('dts')),
        tsResult.js.pipe(gulp.dest('js'))
    ]);		
});

gulp.task('compile:sass', function() {
	return gulp.src('sass/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(gulp.dest('css'));
});

gulp.task('reload:css', ['compile:sass'], function() {

	return gulp.src('css/*.css')
		.pipe(reload({
			stream: true
		}));

});

gulp.task('reload:all', ['compile:sass', 'compile:ts'], function() {

		reload();

});

gulp.task('default', ['compile:sass', 'compile:ts'], function() {
    browserSync.init({
		server: {
            baseDir: "./"
        }
	});

	gulp.watch('sass/**/*.scss', ['reload:css']);
	gulp.watch(['index.html', 'ts/**/*.ts'], ['reload:all']);
});