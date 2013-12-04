module.exports = function(grunt){

	function assembleBanner(libData){
		var str = "/*! ";
		str += libData.name + " " + libData.version + " compiled: <%= grunt.template.today('yyyy-mm-dd HH:mm') %>\n";
		str += "Copyright 2013 Massimo Foti (massimo@massimocorner.com) \n";
		str += "Licensed under the Apache License, Version 2.0|  http://www.apache.org/licenses/LICENSE-2.0 \n";
		str += "*/  \n";
		return str;
	}

	global.pkg = grunt.file.readJSON("package.json");

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		uglify: {
			options: {
				mangle: false
			},
			coreTarget: {
				options: {
					banner: assembleBanner(global.pkg.libs.core)
				},
				files: {
					"src/luga.min.js": ["src/luga.js"]
				}
			},
			csiTarget: {
				options: {
					banner: assembleBanner(global.pkg.libs.csi)
				},
				files: {
					"src/luga.csi.min.js": ["src/luga.csi.js"]
				}
			},
			validatorTarget: {
				options: {
					banner: assembleBanner(global.pkg.libs.validator)
				},
				files: {
					"src/luga.validator.min.js": ["src/luga.validator.js"]
				}
			}
		},

		compress: {
			main: {
				options: {
					archive: "dist/luga-js.zip"
				},
				files: [
					{src: ["docs/**"]},
					{src: ["lib/**"]},
					{src: ["src/**"]},
					{src: ["test/**"]}
				]
			}
		}

	});

	// Load plugins
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// Default task(s).
	grunt.registerTask("default", ["uglify:coreTarget", "uglify:csiTarget", "uglify:validatorTarget", "compress"]);

};