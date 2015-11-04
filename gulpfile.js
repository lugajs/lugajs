/* globals console, require */
"use strict";

var gulp = require("gulp");
var changed = require("gulp-changed");
var concat = require("gulp-concat");
var header = require("gulp-header");
var rename = require("gulp-rename");
var runSequence = require("run-sequence");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var zip = require("gulp-zip");

var pkg = require("./package.json");

var CONST = {
	SRC_FOLDER: "src",
	DIST_FOLDER: "dist",
	LIB_PREFIX: "luga.",
	LIB_SUFFIX: ".js",
	MIN_SUFFIX: ".min.js",
	CONCATENATED_NAME: "Luga JS",
	CONCATENATED_FILE: "luga.js",
	FOLDERS_TO_ARCHIVE: ["dist/**/*", "docs/**/*", "lib/**/*", "src/**/*", "test/**/*"],
	ARCHIVE_FILE: "luga-js.zip",
	ARCHIVE_FOLDER: "archive"
};

function assembleBanner(name, version){
	var now = new Date();
	var banner = [
		"/*! ",
		name + " " + version + " " + now.toISOString(),
		"Copyright 2013-" + now.getFullYear() + " " + pkg.author.name + " (" + pkg.author.email + ")",
		"Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0",
		" */",
		""].join("\n");
	return banner;
}

function getLibSrc(key){
	return CONST.SRC_FOLDER + "/" + CONST.LIB_PREFIX + key + CONST.LIB_SUFFIX;
}

function getAllLibsSrc(){
	var paths = [];
	for(var x in pkg.libs){
		paths.push(getLibSrc(x));
	}
	return paths;
}

function copyLib(key){
	return gulp.src(getLibSrc(key))
		.pipe(gulp.dest(CONST.DIST_FOLDER));
}

function releaseLib(key){
	var libName = pkg.libs[key].name;
	var libVersion = pkg.libs[key].version;

	return gulp.src(getLibSrc(key))
		// The "changed" task needs to know the destination directory
		// upfront to be able to figure out which files changed
		.pipe(changed(CONST.DIST_FOLDER))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(rename({
			extname: CONST.MIN_SUFFIX
		}))
		.pipe(header(assembleBanner(libName, libVersion)))
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(CONST.DIST_FOLDER));
}

gulp.task("concatLibs", function(){
	return gulp.src(getAllLibsSrc())
		.pipe(concat(CONST.CONCATENATED_FILE))
		.pipe(changed(CONST.DIST_FOLDER))
		.pipe(gulp.dest(CONST.DIST_FOLDER))
		.pipe(rename({
			extname: CONST.MIN_SUFFIX
		}))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(header(assembleBanner(CONST.CONCATENATED_NAME, "")))
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(CONST.DIST_FOLDER));
});

gulp.task("libs", function(){
	for(var x in pkg.libs){
		releaseLib(x);
		copyLib(x);
	}
});

gulp.task("zip", function(){
	return gulp.src(CONST.FOLDERS_TO_ARCHIVE, {base: "."})
		.pipe(zip(CONST.ARCHIVE_FILE))
		.pipe(gulp.dest(CONST.ARCHIVE_FOLDER));
});

gulp.task("default", function(callback){
	runSequence(
		"concatLibs",
		"libs",
		"zip",
		function(error){
			if(error){
				console.log(error.message);
			}
			else{
				console.log("BUILD FINISHED SUCCESSFULLY");
			}
			callback(error);
		});
});