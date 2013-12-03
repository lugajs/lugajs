module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		uglify: {
			options: {
				mangle: false
			},
			coreTarget: {
				options: {
					banner: "/*! <%= pkg.name %> <%= pkg.versionCore %> compiled: <%= grunt.template.today('yyyy-mm-dd HH:mm') %> */\n"
				},
				files: {
					"src/luga.min.js": ["src/luga.js"]
				}
			},
			csiTarget: {
				options: {
					banner: "/*! <%= pkg.name %> <%= pkg.versionCsi %> compiled: <%= grunt.template.today('yyyy-mm-dd HH:mm') %> */\n"
				},
				files: {
					"src/luga.csi.min.js": ["src/luga.csi.js"]
				}
			},
			validatorTarget: {
				options: {
					banner: "/*! <%= pkg.name %> <%= pkg.versionValidator %> compiled: <%= grunt.template.today('yyyy-mm-dd HH:mm') %> */\n"
				},
				files: {
					"src/luga.validator.min.js": ["src/luga.validator.js"]
				}
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-compress");

	// Default task(s).
	grunt.registerTask("default", ["uglify:coreTarget", "uglify:csiTarget", "uglify:validatorTarget"]);

};