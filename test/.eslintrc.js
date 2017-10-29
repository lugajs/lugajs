/* eslint-env node */
module.exports = {

	// Enable Jasmine environment
	env: {
		jasmine: true
	},

	// Add Jasmine globals
	globals: {
		loadFixtures: false,
		readFixtures: false,
		getJSONFixture: false,
		spyOnEvent: false
	}
};