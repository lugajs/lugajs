/* eslint no-implicit-globals: "off" */
/* eslint strict: "off" */
/* global require, __dirname */

"use strict";

const gulp = require("gulp");
const changed = require("gulp-changed");
const concat = require("gulp-concat");
const fs = require("fs");
const header = require("gulp-header");
const rename = require("gulp-rename");
const runSequence = require("run-sequence");
const sourcemaps = require("gulp-sourcemaps");
const composer = require("gulp-uglify/composer");
const uglifyes = require("uglify-es");
const uglify = composer(uglifyes, console);
const zip = require("gulp-zip");
const karmaServer = require("karma").Server;

const pkg = require("./package.json");

const CONST = {
	SRC_FOLDER: "src",
	DIST_FOLDER: "dist",
	PATH_TO_COMMON_SRC: "src/luga.common.js",
	LIB_PREFIX: "luga.",
	DATA_PREFIX: "luga.data.",
	DATA_CORE_FILE_KEY: "core",
	JS_EXTENSION: ".js",
	MIN_SUFFIX: ".min.js",
	CONCATENATED_LUGA_FILE: "luga.js",
	CONCATENATED_DATA_FILE: "luga.data.js",
	FOLDERS_TO_ARCHIVE: ["LICENSE", "dist/**/*", "docs/**/*", "lib/**/*", "src/**/*", "test/**/*"],
	ARCHIVE_FILE: "luga-js.zip",
	ARCHIVE_FOLDER: "archive",
	VERSION_PATTERN: new RegExp(".version = \"(\\d.\\d(.\\d\\d?(dev)?)?)\";")
};

/* Utilities */

function assembleBanner(name, version){
	const now = new Date();
	const banner = [
		"/*! ",
		name + " " + version + " " + now.toISOString(),
		pkg.homepage,
		"Copyright 2013-" + now.getFullYear() + " " + pkg.author.name + " (" + pkg.author.email + ")",
		"Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0",
		" */",
		""].join("\n");
	return banner;
}

function getVersionNumber(){
	const buffer = fs.readFileSync(CONST.PATH_TO_COMMON_SRC);
	const fileStr = buffer.toString("utf8", 0, buffer.length);
	const version = CONST.VERSION_PATTERN.exec(fileStr)[1];
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

function getLibSrc(key){
	return CONST.SRC_FOLDER + "/" + CONST.LIB_PREFIX + key + CONST.JS_EXTENSION;
}

/* For Luga Libs */

function getAllLibsSrc(){
	const paths = [];
	for(let x in pkg.libs){
		paths.push(getLibSrc(x));
	}
	return paths;
}

/* For Luga Data */

function getDataFragmentSrc(key){
	return CONST.SRC_FOLDER + "/" + CONST.DATA_PREFIX + key + CONST.JS_EXTENSION;
}

function getAllDataFragmentsSrc(){
	const paths = [];
	for(let i = 0; i < pkg.dataLibFragments.length; i++){
		const path = getDataFragmentSrc(pkg.dataLibFragments[i]);
		paths.push(path);
	}
	return paths;
}

/* Tasks */

gulp.task("coverage", function(done){
	// Use Karma only for the sake of producing a code coverage report
	new karmaServer({
		configFile: __dirname + "/test/karma.conf.js"
	}, done).start();
});

gulp.task("data", function(){
	const dataVersion = getVersionNumber();
	return concatAndMinify(getAllDataFragmentsSrc(), CONST.CONCATENATED_DATA_FILE, pkg.dataLibDisplayName, dataVersion);
});

gulp.task("libs", function(){
	// All Luga libs
	for(let x in pkg.libs){
		const src = getLibSrc(x);
		const libName = pkg.libs[x].name;
		const libVersion = getVersionNumber();
		distributeFile(src, libName, libVersion);
	}
	const allLibs = getAllLibsSrc();

	// Add luga.data
	allLibs.push(CONST.DIST_FOLDER + "/" + CONST.CONCATENATED_DATA_FILE);
	// Concatenated version
	concatAndMinify(allLibs, CONST.CONCATENATED_LUGA_FILE, pkg.displayName, getVersionNumber());
});

gulp.task("zip", function(){
	return gulp.src(CONST.FOLDERS_TO_ARCHIVE, {base: "."})
		.pipe(zip(CONST.ARCHIVE_FILE))
		.pipe(gulp.dest(CONST.ARCHIVE_FOLDER));
});

gulp.task("default", function(callback){
	runSequence(
		"data",
		"libs",
		"zip",
		"coverage",
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