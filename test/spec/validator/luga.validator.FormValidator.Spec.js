"use strict";

describe("luga.validator.FormValidator", function() {

	it("Blocksubmit option true by default", function() {
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("<form></form>")
		});
		expect(formValidator.options.blocksubmit).toBeTruthy();
	});

	it("Blocksubmit option can be set with custom HTML attribute", function() {
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery('<form data-luga-blocksubmit="false"></form>')
		});
		expect(formValidator.options.blocksubmit).toEqual("false");
	});

	it("Blocksubmit option can be set programmatically", function() {
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("<form></form>"),
			blocksubmit: false
		});
		expect(formValidator.options.blocksubmit).toEqual(false);
	});

	it("Empty form must be valid", function() {
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("<form></form>")
		});
		expect(formValidator.isValid()).toBeTruthy();
	});

	it("Missing form will throw an exception", function() {
		expect(function(){
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#missing")
			});
		}).toThrow();
	});

});