/*
	Karma prepend "base" to any loaded file:
	https://github.com/karma-runner/karma/issues/1607

	This requires a different configuration for fixtures compared to the HTML runner
 */
beforeEach(function(){
	"use strict";
	jasmineFixtures.setup({
		basePath: "base/test/fixtures"
	});
});