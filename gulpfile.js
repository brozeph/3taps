'use strict';

var
	del = require('del'),
	gulp = require('gulp'),
	istanbul = require('gulp-istanbul'),
	jshint = require('gulp-jshint'),
	mocha = require('gulp-mocha');


gulp.task('clean', function (callback) {
	del(['coverage'], callback);
});


gulp.task('jshint', function () {
	return gulp
		.src(['lib/**/*.js', 'test/lib/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
});


gulp.task('test-all', ['jshint', 'test-coverage'], function () {

});


gulp.task('test-coverage', ['clean'], function (callback) {
	gulp
		.src(['./lib/*.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function () {
			gulp
				.src(['./test/lib/*.js'])
				.pipe(mocha({
					reporter : 'spec'
				}))
				.pipe(istanbul.writeReports('./reports'))
				.on('end', callback);
		});
});


gulp.task('test-unit', function () {
	return gulp
	.src(['./test/lib/**/*.js'], { read : false })
	.pipe(mocha({
		checkLeaks : true,
		reporter : 'spec',
		ui : 'bdd'
	}));
});
