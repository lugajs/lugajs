/* global module */

/*
 Use Karma only for the sake of producing a code coverage report.
 No need to use multiple browsers
 */
module.exports = function(config){
	"use strict";
	config.set({
		basePath: "../",
		browsers: ["Chrome"],
		frameworks: ["jasmine"],
		files: [
			// Libs
			"lib/jquery/jquery.min.js",
			"lib/handlebars.min.js",

			// Jasmine libs and configuration
			"test/lib/jasmine/jasmine-jquery.js",
			"test/lib/jasmine/mock-ajax.js",
			"test/fixtures.karma.config.js",

			// Source files
			"src/luga.core.js",
			"src/luga.data.core.js",
			"src/luga.data.region.js",
			"src/luga.data.DataSet.js",
			"src/luga.data.HttpDataSet.js",
			"src/luga.data.JsonDataSet.js",
			"src/**/*.js",

			// Jasmine custom matcher. Requires Luga
			"test/lib/jasmine/jasmine-ducktype.js",

			// Test specs
			"test/spec/*.Spec.js",
			"test/spec/**/*.Spec.js",

			// Fixtures
			{pattern: "test/fixtures/**/*.json", watched: true, served: true, included: false},
			{pattern: "test/fixtures/**/*.htm", watched: true, served: true, included: false},
			{pattern: "test/fixtures/**/*.txt", watched: true, served: true, included: false},
			{pattern: "test/fixtures/**/*.xml", watched: true, served: true, included: false}
		],
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		preprocessors: {
			"src/**/*.js": ["coverage"]
		},

		coverageReporter: {
			reporters: [
				{type: "lcov", dir: "test/coverage/", subdir: "."},
				{type: "text", dir: "test/coverage/", subdir: ".", file: "coverage.txt"},
				{type: "text-summary"}
			]
		},

		reporters: ["progress", "html", "coverage"],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true
	});
};