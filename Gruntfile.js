module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		uglify: {
			options: {
				banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n",
				mangle: false
			},
			dist: {
				files: {
					"src/luga.min.js": "src/luga.js",
					"src/luga.csi.min.js": "src/luga.csi.js",
					"src/luga.validator.min.js": "src/luga.validator.js"
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// Default task(s).
	grunt.registerTask("default", ["uglify"]);

};