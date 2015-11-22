/* globals formValidatorHandlers */

"use strict";

// Override the default error handler to avoid triggering alert messages
luga.validator.CONST.HANDLERS.FORM_ERROR = "luga.validator.handlers.errorBox";

window.formValidatorHandlers = {};

describe("luga.validator.FormValidator", function(){

	var basicFormValidator, attributeFormValidator, configFormValidator;
	beforeEach(function(){
		loadFixtures("validator/FormValidator/config.htm");

		basicFormValidator = new luga.validator.FormValidator({
			formNode: jQuery("<form></form>")
		});

		attributeFormValidator = new luga.validator.FormValidator({
			formNode: jQuery("#formValidatorconfig")
		});

		configFormValidator = new luga.validator.FormValidator({
			formNode: jQuery("<form></form>"),
			error: "formValidatorHandlers.customErrorHandler",
			before: "formValidatorHandlers.customBefore",
			after: "formValidatorHandlers.customAfter",
			blocksubmit: false
		});

		formValidatorHandlers.customErrorHandler = function(){
		};
		formValidatorHandlers.customBefore = function(){
		};
		formValidatorHandlers.customAfter = function(){
		};

	});

	it("Throws an exception if the associated form node does not exists", function(){
		expect(function(){
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#missing")
			});
		}).toThrow();
	});

	it("Always positively validates empty forms", function(){
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("<form></form>")
		});
		expect(formValidator.isValid()).toBeTruthy();
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

	describe("Accepts an Options object as single argument", function(){

		describe("options.formNode", function(){

			it("Is mandatory", function(){
				expect(function(){
					new luga.validator.FormValidator({});
				}).toThrow();
			});

		});

		describe("options.error either:", function(){

			it("Default to the value specified in 'luga.validator.CONST.HANDLERS.FORM_ERROR'", function(){
				expect(basicFormValidator.config.error).toEqual(luga.validator.CONST.HANDLERS.FORM_ERROR);
			});
			it("Retrieves the value from the form's data-lugavalidator-error custom attribute", function(){
				expect(attributeFormValidator.config.error).toEqual("formValidatorHandlers.customErrorHandler");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configFormValidator.config.error).toEqual("formValidatorHandlers.customErrorHandler");
			});

		});

		describe("options.before either:", function(){

			it("Default to null'", function(){
				expect(basicFormValidator.config.before).toEqual(null);
			});
			it("Retrieves the value from the form's data-lugavalidator-before custom attribute", function(){
				expect(attributeFormValidator.config.before).toEqual("formValidatorHandlers.customBefore");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configFormValidator.config.before).toEqual("formValidatorHandlers.customBefore");
			});

		});

		describe("options.after either:", function(){

			it("Default to null'", function(){
				expect(basicFormValidator.config.after).toEqual(null);
			});
			it("Retrieves the value from the form's data-lugavalidator-after custom attribute", function(){
				expect(attributeFormValidator.config.after).toEqual("formValidatorHandlers.customAfter");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configFormValidator.config.after).toEqual("formValidatorHandlers.customAfter");
			});

		});

		describe("options.blocksubmit either:", function(){

			it("Default to true'", function(){
				expect(basicFormValidator.config.blocksubmit).toEqual(true);
			});
			it("Retrieves the value from the form's data-lugavalidator-blocksubmit custom attribute", function(){
				expect(attributeFormValidator.config.blocksubmit).toEqual(false);
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configFormValidator.config.blocksubmit).toEqual(false);
			});

		});

	});

	describe("If a data-lugavalidator-disabledlabel attribute is specified for a button", function(){

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

	describe("Exposes three handlers functions that will be called at different times after the onSubmit event is triggered", function(){

		window.formValidatorHandlers = {};
		var formValidator, jForm;
		beforeEach(function(){

			loadFixtures("validator/FormValidator/basic.htm");

			jForm = jQuery("#basic");
			formValidatorHandlers.before = function(formNode){
			};
			formValidatorHandlers.error = function(formNode, validators){
			};
			formValidatorHandlers.after = function(formNode){
			};

			formValidator = new luga.validator.FormValidator({
				formNode: jForm,
				before: "formValidatorHandlers.before",
				error: "formValidatorHandlers.error",
				after: "formValidatorHandlers.after"
			});

			spyOn(formValidatorHandlers, "before").and.callFake(function(){
			});
			spyOn(formValidatorHandlers, "error").and.callFake(function(){
			});
			spyOn(formValidatorHandlers, "after").and.callFake(function(){
			});

		});

		it("before", function(){
			expect(formValidator.config.before).toBeDefined();
		});

		it("error", function(){
			expect(formValidator.config.error).toBeDefined();
		});

		it("after", function(){
			expect(formValidator.config.after).toBeDefined();
		});

		describe("In case the form is not validated", function(){

			it("First: before handler is called (if any)", function(){
				formValidator.validate();
				expect(formValidator.isValid()).toBeFalsy();
				expect(formValidatorHandlers.before).toHaveBeenCalled();
			});
			it("Passing the form's DOM node as first argument, the submit event as second", function(){
				var formEvent = new jQuery.Event();
				formValidator.validate(formEvent);
				expect(formValidatorHandlers.before).toHaveBeenCalledWith(jForm[0], formEvent);
			});

			it("Then: error handler is called", function(){
				formValidator.validate();
				expect(formValidator.isValid()).toBeFalsy();
				expect(formValidatorHandlers.error).toHaveBeenCalled();
			});

			it("The after handler instead is not called (if any)", function(){
				formValidator.validate();
				expect(formValidator.isValid()).toBeFalsy();
				expect(formValidatorHandlers.after).not.toHaveBeenCalled();
			});

		});

		describe("In case the form is valid", function(){

			it("First: before handler is called (if any)", function(){
				jQuery("#myName").val("filled");
				formValidator.validate();
				expect(formValidator.isValid()).toBeTruthy();
				expect(formValidatorHandlers.before).toHaveBeenCalled();
			});
			it("Passing the form's DOM node as first argument, the submit event as second", function(){
				var formEvent = new jQuery.Event();
				formValidator.validate(formEvent);
				expect(formValidatorHandlers.before).toHaveBeenCalledWith(jForm[0], formEvent);
			});

			it("The error handler is not called", function(){
				jQuery("#myName").val("filled");
				formValidator.validate();
				expect(formValidator.isValid()).toBeTruthy();
				expect(formValidatorHandlers.error).not.toHaveBeenCalled();
			});

			it("Finally: after handler is called (if any)", function(){
				jQuery("#myName").val("filled");
				formValidator.validate();
				expect(formValidator.isValid()).toBeTruthy();
				expect(formValidatorHandlers.after).toHaveBeenCalled();
			});
			it("Passing the form's DOM node as first argument, the submit event as second", function(){
				var formEvent = new jQuery.Event();
				jQuery("#myName").val("filled");
				formValidator.validate(formEvent);
				expect(formValidator.isValid()).toBeTruthy();
				expect(formValidatorHandlers.after).toHaveBeenCalledWith(jForm[0], formEvent);
			});

		});

	});

});