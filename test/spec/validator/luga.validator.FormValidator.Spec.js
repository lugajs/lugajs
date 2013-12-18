"use strict";

// Override the default error handler to avoid triggering alert messages
luga.validator.CONST.HANDLERS.FORM_ERROR = function(){
};

describe("luga.validator.FormValidator", function(){

	it("Always positively validates empty forms", function(){
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("<form></form>")
		});
		expect(formValidator.isValid()).toBeTruthy();
	});

	it("Will throws an exception if the form node does not exists", function(){
		expect(function(){
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#missing")
			});
		}).toThrow();
	});

	it("Can validate form with one", function(){

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

	it("Or multiple fields", function(){

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

	describe("By default disables submit buttons as soon as the form is submitted. This prevents duplicated requests", function(){

		it("Blocksubmit option is true by default", function(){
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("<form></form>")
			});
			expect(formValidator.config.blocksubmit).toBeTruthy();
		});

		it("It can be set with custom HTML attribute", function(){
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery('<form data-luga-blocksubmit="false"></form>')
			});
			expect(formValidator.config.blocksubmit).toEqual("false");
		});

		it("Or programmatically", function(){
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("<form></form>"),
				blocksubmit: false
			});
			expect(formValidator.config.blocksubmit).toEqual(false);
		});

	});

	describe("If a data-luga-disabledlabel attribute is specified for a button", function(){

		it("It overrides the value of the disabled button once the form is validated", function(){

			loadFixtures("validator/FormValidator/basic.htm");
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#basic")
			});

			formValidator.validate();
			expect(formValidator.isValid()).toBeFalsy();
			expect(jQuery("#submit").val()).toEqual("Submit");

			jQuery("#myName").val("str");
			formValidator.validate();
			expect(formValidator.isValid()).toBeTruthy();
			expect(jQuery("#submit").val()).toEqual("I am disabled");

		});

	});

	describe("Exposes three handlers (before, error, after), functions that will be called at different times after the onSubmit event is triggered", function(){

		var formValidator, flags, customBeforeHandler, customErrorHandler, customAfterHandler, handlers;
		beforeEach(function(){

			loadFixtures("validator/FormValidator/basic.htm");
			flags = {
				beforeCalled: false,
				errorCalled: false,
				afterCalled: false
			};
			customBeforeHandler = function(formNode){
				flags.beforeCalled = true;
			};
			customErrorHandler = function(formNode, validators){
				flags.errorCalled = true;
			};
			customAfterHandler = function(formNode){
				flags.afterCalled = true;
			};

			handlers = {};
			handlers.before = customBeforeHandler;
			handlers.error = customErrorHandler;
			handlers.after = customAfterHandler;

			formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#basic"),
				before: customBeforeHandler,
				error: customErrorHandler,
				after: customAfterHandler
			});

		});

		it("In case the form is invalid, 'before' 'is called, then 'error'", function(){

			formValidator.validate();
			expect(formValidator.isValid()).toBeFalsy();
			expect(flags.beforeCalled).toBeTruthy();
			expect(flags.errorCalled).toBeTruthy();
			expect(flags.afterCalled).toBeFalsy();

		});

		it("If validation is passed, 'before' 'is called, then 'after'", function(){

			jQuery("#myName").val("filled");
			formValidator.validate();
			expect(formValidator.isValid()).toBeTruthy();
			expect(flags.beforeCalled).toBeTruthy();
			expect(flags.errorCalled).toBeFalsy();
			expect(flags.afterCalled).toBeTruthy();

		});

		it("Custom handlers can be defined inside their own namespaces too", function(){

			formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#basic"),
				before: handlers.before,
				error: handlers.error,
				after: handlers.after
			});

			formValidator.validate();
			expect(formValidator.isValid()).toBeFalsy();
			expect(flags.beforeCalled).toBeTruthy();
			expect(flags.errorCalled).toBeTruthy();
			expect(flags.afterCalled).toBeFalsy();

		});

	});

});