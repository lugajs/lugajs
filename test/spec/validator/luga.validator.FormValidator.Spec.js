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

	it("Can validate form with one", function() {

		loadFixtures("validator/FormValidator/basic.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#basic")
		});

		expect(formValidator.executeValidators().length).toEqual(1);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#myName")).toHaveClass("invalid");

		jQuery("#myName").val("filled");
		expect(formValidator.executeValidators().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#myName")).not.toHaveClass("invalid");
	});

	it("Or multiple fields", function() {

		loadFixtures("validator/FormValidator/generic.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#generic")
		});
		expect(formValidator.executeValidators().length).toEqual(8);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#age")).toHaveClass("invalid");
		expect(jQuery("#name")).toHaveClass("invalid");
		expect(jQuery("#email")).toHaveClass("invalid");
		expect(jQuery("#date")).toHaveClass("invalid");
		expect(jQuery("#comments")).toHaveClass("invalid");
		expect(jQuery("#boxNicole")).toHaveClass("invalid");
		expect(jQuery("#radioNicole")).toHaveClass("invalid");
		expect(jQuery("#food")).toHaveClass("invalid");

		jQuery("#age").val("20");
		expect(formValidator.executeValidators().length).toEqual(7);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#age")).not.toHaveClass("invalid");

		jQuery("#name").val("anything");
		expect(formValidator.executeValidators().length).toEqual(6);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#name")).not.toHaveClass("invalid");

		jQuery("#email").val("test@testing.com");
		expect(formValidator.executeValidators().length).toEqual(5);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#email")).not.toHaveClass("invalid");

		jQuery("#date").val("2005-05-09");
		expect(formValidator.executeValidators().length).toEqual(4);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#date")).not.toHaveClass("invalid");

		jQuery("#comments").val("love it");
		expect(formValidator.executeValidators().length).toEqual(3);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#comments")).not.toHaveClass("invalid");

		jQuery("#boxNicole").prop("checked", true);
		expect(formValidator.executeValidators().length).toEqual(2);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#boxNicole")).not.toHaveClass("invalid");

		jQuery("#radioNicole").prop("checked", true);
		expect(formValidator.executeValidators().length).toEqual(1);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#radioNicole")).not.toHaveClass("invalid");

		jQuery("#food").prop("selectedIndex", 1);
		expect(formValidator.executeValidators().length).toEqual(0);

		expect(formValidator.isValid()).toBeTruthy();

		expect(jQuery("#age")).not.toHaveClass("invalid");
		expect(jQuery("#name")).not.toHaveClass("invalid");
		expect(jQuery("#email")).not.toHaveClass("invalid");
		expect(jQuery("#date")).not.toHaveClass("invalid");
		expect(jQuery("#comments")).not.toHaveClass("invalid");
		expect(jQuery("#boxNicole")).not.toHaveClass("invalid");
		expect(jQuery("#radioNicole")).not.toHaveClass("invalid");
		expect(jQuery("#food")).not.toHaveClass("invalid");

	});

});