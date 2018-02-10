/* eslint-env node */
module.exports = {

	// Enable Jasmine environment
	env: {
		jasmine: true
	},

	// Add Jasmine globals
	globals: {
		"jasmineFixtures": false,
		"formValidatorHandlers": false
	},

	rules: {
		"no-array-constructor": ["warn"],
		"no-new-wrappers": ["warn"]
	}
};