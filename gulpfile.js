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

var pkg = require("./package.json");

var SRC_FOLDER = "src";
var DEST_FOLDER = "dist";
var LIB_PREFIX = "luga.";
var LIB_SUFFIX = ".js";
var MIN_SUFFIX = ".min.js";

var CONCATENATED_NAME= "Luga JS";
var CONCATENATED_FILE= "luga.js";

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
	return SRC_FOLDER + "/" + LIB_PREFIX + key + LIB_SUFFIX;
}

function getAllLibsSrc(){
	var paths = [];
	for(var x in pkg.libs){
		paths.push(getLibSrc(x));
	}
	return paths;
}

function releaseLib(key){
	var libName = pkg.libs[key].name;
	var libVersion = pkg.libs[key].version;

	return gulp.src(getLibSrc(key))
		// The "changed" task needs to know the destination directory
		// upfront to be able to figure out which files changed
		.pipe(changed(DEST_FOLDER))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(rename({
			extname: MIN_SUFFIX
		}))
		.pipe(header(assembleBanner(libName, libVersion)))
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(DEST_FOLDER));
}

gulp.task("concatLibs", function(){
	return gulp.src(getAllLibsSrc())
		// The "changed" task needs to know the destination directory
		// upfront to be able to figure out which files changed
		.pipe(changed(DEST_FOLDER))
		.pipe(concat(CONCATENATED_FILE))
		.pipe(header(assembleBanner(CONCATENATED_NAME, "")))
		.pipe(gulp.dest(DEST_FOLDER))
		.pipe(rename({
			extname: MIN_SUFFIX
		}))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(DEST_FOLDER));
});

gulp.task("libs", function(){
	for(var x in pkg.libs){
		releaseLib(x);
	}
});

gulp.task("ajaxform", function(){
	releaseLib("ajaxform");
	gulp.run("concatLibs");
});

gulp.task("core", function(){
	releaseLib("core");
	gulp.run("concatLibs");
});

gulp.task("csi", function(){
	releaseLib("csi");
	gulp.run("concatLibs");
});

gulp.task("validator", function(){
	releaseLib("validator");
	gulp.run("concatLibs");
});

gulp.task("default", function(callback){
	runSequence(
		"concatLibs",
		"libs",
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