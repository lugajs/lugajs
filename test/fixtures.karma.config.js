/*
	Karma prepend "base" to any loaded file:
	https://github.com/karma-runner/karma/issues/1607

	This requires a different configuration for fixtures compared to the HTML runner
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
jasmine.getFixtures().fixturesPath = "base/test/fixtures";
jasmine.getJSONFixtures().fixturesPath = "base/test/fixtures";

var TEST_XHR_BASE = "base/test/";