"use strict";

// Override the default error handler to avoid triggering alert messages
luga.validator.CONST.HANDLERS.FORM_ERROR = function() {};

	describe("luga.validator.FormValidator", function() {

	it("Blocksubmit option is true by default", function() {
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

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#myName")).toHaveClass("invalid");

		jQuery("#myName").val("filled");
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#myName")).not.toHaveClass("invalid");
	});

	it("Or multiple fields", function() {

		loadFixtures("validator/FormValidator/generic.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#generic")
		});
		expect(formValidator.validate().length).toEqual(8);
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
		expect(formValidator.validate().length).toEqual(7);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#age")).not.toHaveClass("invalid");

		jQuery("#name").val("anything");
		expect(formValidator.validate().length).toEqual(6);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#name")).not.toHaveClass("invalid");

		jQuery("#email").val("test@testing.com");
		expect(formValidator.validate().length).toEqual(5);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#email")).not.toHaveClass("invalid");

		jQuery("#date").val("2005-05-09");
		expect(formValidator.validate().length).toEqual(4);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#date")).not.toHaveClass("invalid");

		jQuery("#comments").val("love it");
		expect(formValidator.validate().length).toEqual(3);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#comments")).not.toHaveClass("invalid");

		jQuery("#boxNicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(2);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#boxNicole")).not.toHaveClass("invalid");

		jQuery("#radioNicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#radioNicole")).not.toHaveClass("invalid");

		jQuery("#food").prop("selectedIndex", 1);
		expect(formValidator.validate().length).toEqual(0);

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

	describe("Exposes three handlers (before, error, after), functions that will be called at different times after the onSubmit event is triggered", function() {

		var formValidator, flags, customBeforeHandler, customErrorHandler, customAfterHandler;
		beforeEach(function() {

			loadFixtures("validator/FormValidator/basic.htm");
			flags = {
				beforeCalled: false,
				errorCalled: false,
				afterCalled: false
			};
			customBeforeHandler = function(formNode, validators) {
				flags.beforeCalled = true;
			};
			customErrorHandler = function(formNode, validators) {
				flags.errorCalled = true;
			};
			customAfterHandler = function(formNode, validators) {
				flags.afterCalled = true;
			};

			formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#basic"),
				before: customBeforeHandler,
				error: customErrorHandler,
				after: customAfterHandler
			});

		});

		describe("All the handlers can be passed programmatically as params", function() {

			it("In case the form is invalid, 'before' 'is called, then 'error'", function() {

				formValidator.validate();
				expect(formValidator.isValid()).toBeFalsy();
				expect(flags.beforeCalled).toBeTruthy();
				expect(flags.errorCalled).toBeTruthy();
				expect(flags.afterCalled).toBeFalsy();

			});

		});

	});

});