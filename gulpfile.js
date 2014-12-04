'use strict';

var
	gulp = require('gulp'),
	istanbul = require('gulp-istanbul'),
	jshint = require('gulp-jshint'),
	mocha = require('gulp-mocha');


gulp.task('jshint', function () {
	return gulp
		.src(['./lib/**/*.js', './test/lib/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
});


gulp.task('test-all', ['jshint'], function () {

});


gulp.task('test-coverage', function (callback) {
	gulp
		.src('./lib/**/*.js')
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function () {
			gulp
				.src('./test/lib/**/*.js')
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.end('end', callback);
		});
});
