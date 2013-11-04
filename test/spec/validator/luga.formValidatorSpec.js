"use strict";

describe("luga.validator.formValidator", function() {

	it("Blocksubmit option true by default", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form></form>')
		});
		expect(formObj.options.blocksubmit).toBeTruthy();
	});

	it("Blocksubmit option can be set with custom HTML attribute", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form data-luga-blocksubmit="false"></form>')
		});
		expect(formObj.options.blocksubmit).toEqual("false");
	});

	it("Blocksubmit option can be set programmatically", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form></form>'),
			blocksubmit: false
		});
		expect(formObj.options.blocksubmit).toEqual(false);
	});

	it("Empty form must be valid", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form></form>')
		});
		expect(formObj.isValid()).toBeTruthy();
	});

});