module.exports = function(grunt){
	// Project configuration.
	grunt.initConfig({

		compress: {
			main: {
				options: {
					archive: "archive/luga-js.zip"
				},
				files: [
					{src: ["docs/**"]},
					{src: ["lib/**"]},
					{src: ["src/**"]},
					{src: ["dist/**"]},
					{src: ["test/**"]}
				]
			}
		}

	});

	// Load plugins
	grunt.loadNpmTasks("grunt-contrib-compress");

	// Default task
	grunt.registerTask("default", ["compress"]);

};
