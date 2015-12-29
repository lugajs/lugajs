/* globals console, require */
"use strict";

var gulp = require("gulp");
var changed = require("gulp-changed");
var concat = require("gulp-concat");
var fs = require("fs");
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
	DATA_PREFIX: "luga.data.",
	DATA_CORE_KEY: "core",
	JS_EXTENSION: ".js",
	MIN_SUFFIX: ".min.js",
	CONCATENATED_LUGA_FILE: "luga.js",
	CONCATENATED_DATA_FILE: "luga.data.js",
	FOLDERS_TO_ARCHIVE: ["LICENSE", "dist/**/*", "docs/**/*", "lib/**/*", "src/**/*", "test/**/*"],
	ARCHIVE_FILE: "luga-js.zip",
	ARCHIVE_FOLDER: "archive",
	VERSION_PATTERN: new RegExp(".version = \"(\\d.\\d(.\\d\\d?)?)\";")
};

/* Utilities */

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

function getVersionNumber(filePath){
	var buffer = fs.readFileSync(filePath);
	var fileStr = buffer.toString("utf8", 0, buffer.length);
	var version = CONST.VERSION_PATTERN.exec(fileStr)[1];
	return version;
}

function distributeFile(src, name, version){
	return gulp.src(src)
		// The "changed" task needs to know the destination directory upfront
		.pipe(changed(CONST.DIST_FOLDER))
		.pipe(header(assembleBanner(name, version))) // Banner for copy
		.pipe(gulp.dest(CONST.DIST_FOLDER))
		.pipe(sourcemaps.init())
			.pipe(uglify({
				mangle: false
			}))
			.pipe(rename({
				extname: CONST.MIN_SUFFIX
			}))
			.pipe(header(assembleBanner(name, version)))
		.pipe(sourcemaps.write(".", {
			includeContent: true,
			sourceRoot: "."
		}))
		.pipe(gulp.dest(CONST.DIST_FOLDER));
}

function concatAndMinify(src, fileName, name, version){
	return gulp.src(src)
		.pipe(sourcemaps.init())
			.pipe(concat(fileName))
			// The "changed" task needs to know the destination directory upfront
			.pipe(changed(CONST.DIST_FOLDER))
			.pipe(header(assembleBanner(name, version))) // Banner for copy
			.pipe(gulp.dest(CONST.DIST_FOLDER))
			.pipe(rename({
				extname: CONST.MIN_SUFFIX
			}))
			.pipe(uglify({
				mangle: false
			}))
			.pipe(header(assembleBanner(name, version)))// Banner for minified
		.pipe(sourcemaps.write(".", {
			includeContent: true,
			sourceRoot: "."
		}))
		.pipe(gulp.dest(CONST.DIST_FOLDER));
}

/* For Luga Libs */

function getLibSrc(key){
	return CONST.SRC_FOLDER + "/" + CONST.LIB_PREFIX + key + CONST.JS_EXTENSION;
}

function getAllLibsSrc(){
	var paths = [];
	for(var x in pkg.libs){
		paths.push(getLibSrc(x));
	}
	return paths;
}

/* For Luga Data */

function getDataFragmentSrc(key){
	return CONST.SRC_FOLDER + "/" + CONST.DATA_PREFIX + key + CONST.JS_EXTENSION;
}

function getAllDataFragmentsSrc(){
	var paths = [];
	for(var i = 0; i < pkg.dataLibFragments.length; i++){
		var path = getDataFragmentSrc(pkg.dataLibFragments[i]);
		paths.push(path);
	}
	return paths;
}

/* Tasks */

gulp.task("data", function(){
	var dataVersion = getVersionNumber(getDataFragmentSrc(CONST.DATA_CORE_KEY));
	return concatAndMinify(getAllDataFragmentsSrc(), CONST.CONCATENATED_DATA_FILE, pkg.dataLibDisplayName, dataVersion);
});

gulp.task("libs", function(){
	// All Luga libs
	for(var x in pkg.libs){
		var src = getLibSrc(x);
		var libName = pkg.libs[x].name;
		var libVersion = getVersionNumber(src);
		distributeFile(src, libName, libVersion);
	}
	// Concatenated version
	concatAndMinify(getAllLibsSrc(), CONST.CONCATENATED_LUGA_FILE, pkg.displayName, "");
});

gulp.task("zip", function(){
	return gulp.src(CONST.FOLDERS_TO_ARCHIVE, {base: "."})
		.pipe(zip(CONST.ARCHIVE_FILE))
		.pipe(gulp.dest(CONST.ARCHIVE_FOLDER));
});

gulp.task("default", function(callback){
	runSequence(
		"libs",
		"data",
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