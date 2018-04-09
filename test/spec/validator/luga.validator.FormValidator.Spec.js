// Override the default error handler to avoid triggering alert messages
luga.validator.CONST.HANDLERS.FORM_ERROR = "luga.validator.handlers.errorBox";

window.formValidatorHandlers = {};

describe("luga.validator.FormValidator", function(){

	"use strict";

	let basicFormValidator, attributeFormValidator, configFormValidator;
	beforeEach(function(){
		jasmineFixtures.loadHTML("validator/FormValidator/config.htm");

		basicFormValidator = new luga.validator.FormValidator({
			formNode: document.createElement("form")
		});

		attributeFormValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("formValidatorconfig")
		});

		configFormValidator = new luga.validator.FormValidator({
			formNode: document.createElement("form"),
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
			new luga.validator.FormValidator({
				formNode: document.getElementById("missing")
			});
		}).toThrow();
	});

	it("Always positively validates empty forms", function(){
		const formValidator = new luga.validator.FormValidator({
			formNode: document.createElement("form")
		});
		expect(formValidator.isValid()).toEqual(true);
	});

	it("Can validate form with one", function(){

		jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
		const formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("basic")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("myName")).toHaveClass("invalid");

		document.getElementById("myName").value = "filled";
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("myName")).not.toHaveClass("invalid");
	});

	it("Or multiple fields", function(){

		jasmineFixtures.loadHTML("validator/FormValidator/generic.htm");
		const formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("generic")
		});
		expect(formValidator.validate().length).toEqual(8);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("age")).toHaveClass("invalid");
		expect(document.getElementById("name")).toHaveClass("invalid");
		expect(document.getElementById("email")).toHaveClass("invalid");
		expect(document.getElementById("date")).toHaveClass("invalid");
		expect(document.getElementById("comments")).toHaveClass("invalid");
		expect(document.getElementById("boxNicole")).toHaveClass("invalid");
		expect(document.getElementById("radioNicole")).toHaveClass("invalid");
		expect(document.getElementById("food")).toHaveClass("invalid");

		document.getElementById("age").value = "20";
		expect(formValidator.validate().length).toEqual(7);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("age")).not.toHaveClass("invalid");

		document.getElementById("name").value = "anything";
		expect(formValidator.validate().length).toEqual(6);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("name")).not.toHaveClass("invalid");

		document.getElementById("email").value = "test@testing.com";
		expect(formValidator.validate().length).toEqual(5);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("email")).not.toHaveClass("invalid");

		document.getElementById("date").value = "2005-05-09";
		expect(formValidator.validate().length).toEqual(4);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("date")).not.toHaveClass("invalid");

		document.getElementById("comments").value = "love it";
		expect(formValidator.validate().length).toEqual(3);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("comments")).not.toHaveClass("invalid");

		document.getElementById("boxNicole").checked = true;
		expect(formValidator.validate().length).toEqual(2);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("boxNicole")).not.toHaveClass("invalid");

		document.getElementById("radioNicole").checked = true;
		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("radioNicole")).not.toHaveClass("invalid");

		document.getElementById("food").selectedIndex = 1;
		expect(formValidator.validate().length).toEqual(0);

		expect(formValidator.isValid()).toEqual(true);

		expect(document.getElementById("age")).not.toHaveClass("invalid");
		expect(document.getElementById("name")).not.toHaveClass("invalid");
		expect(document.getElementById("email")).not.toHaveClass("invalid");
		expect(document.getElementById("date")).not.toHaveClass("invalid");
		expect(document.getElementById("comments")).not.toHaveClass("invalid");
		expect(document.getElementById("boxNicole")).not.toHaveClass("invalid");
		expect(document.getElementById("radioNicole")).not.toHaveClass("invalid");
		expect(document.getElementById("food")).not.toHaveClass("invalid");

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

			it("Default to true", function(){
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

			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			const formValidator = new luga.validator.FormValidator({
				formNode: document.getElementById("basic")
			});

			formValidator.validate();
			expect(formValidator.isValid()).toEqual(false);
			expect(document.getElementById("submit").value).toEqual("Submit");

			document.getElementById("myName").value = "str";
			formValidator.validate();
			expect(formValidator.isValid()).toEqual(true);
			expect(document.getElementById("submit").value).toEqual("I am disabled");

		});

	});

	describe("Exposes three handlers functions that will be called at different times after the onSubmit event is triggered", function(){

		window.formValidatorHandlers = {};
		let formValidator, testFormNode;
		beforeEach(function(){

			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");

			testFormNode = document.getElementById("basic");
			formValidatorHandlers.before = function(formNode){
			};
			formValidatorHandlers.error = function(formNode, validators){
			};
			formValidatorHandlers.after = function(formNode){
			};

			formValidator = new luga.validator.FormValidator({
				formNode: testFormNode,
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
				expect(formValidator.isValid()).toEqual(false);
				expect(formValidatorHandlers.before).toHaveBeenCalled();
			});

			it("Passing the form's DOM node as first argument, the submit event as second", function(){
				const formEvent = document.createEvent("Event");
				formValidator.validate(formEvent);
				expect(formValidatorHandlers.before).toHaveBeenCalledWith(testFormNode, formEvent);
			});

			it("An error is throw if the error handler points to a non existing function", function(){
				formValidator.config.error = "missingFunction";
				expect(function(){
					formValidator.validate();
				}).toThrow();
			});

			it("Then: error handler is called", function(){
				formValidator.validate();
				expect(formValidator.isValid()).toEqual(false);
				expect(formValidatorHandlers.error).toHaveBeenCalled();
			});

			it("The after handler instead is not called (if any)", function(){
				formValidator.validate();
				expect(formValidator.isValid()).toEqual(false);
				expect(formValidatorHandlers.after).not.toHaveBeenCalled();
			});

		});

		describe("In case the form is valid", function(){

			it("An error is throw if the before handler points to a non existing function", function(){
				document.getElementById("myName").value = "filled";
				formValidator.config.before = "missingFunction";
				expect(function(){
					formValidator.validate();
				}).toThrow();
			});

			it("First: before handler is called (if any)", function(){
				document.getElementById("myName").value = "filled";
				formValidator.validate();
				expect(formValidator.isValid()).toEqual(true);
				expect(formValidatorHandlers.before).toHaveBeenCalled();
			});

			it("Passing the form's DOM node as first argument, the submit event as second", function(){
				const formEvent = document.createEvent("Event");
				formValidator.validate(formEvent);
				expect(formValidatorHandlers.before).toHaveBeenCalledWith(testFormNode, formEvent);
			});

			it("The error handler is not called", function(){
				document.getElementById("myName").value = "filled";
				formValidator.validate();
				expect(formValidator.isValid()).toEqual(true);
				expect(formValidatorHandlers.error).not.toHaveBeenCalled();
			});

			it("If blocksubmit equal true, form submission is disabled", function(){
				document.getElementById("myName").value = "filled";
				spyOn(formValidator, "disableSubmit");

				// blocksubmit is on by default
				formValidator.validate();
				expect(formValidator.disableSubmit).toHaveBeenCalled();
			});

			it("If blocksubmit equal false, form submission stay enabled", function(){
				document.getElementById("myName").value = "filled";
				spyOn(formValidator, "disableSubmit");

				// Switch blocksubmit off
				formValidator.config.blocksubmit = false;
				formValidator.validate();
				expect(formValidator.disableSubmit).not.toHaveBeenCalled();
			});

			it("An error is throw if the after handler points to a non existing function", function(){
				document.getElementById("myName").value = "filled";
				formValidator.config.after = "missingFunction";
				expect(function(){
					formValidator.validate();
				}).toThrow();
			});

			it("Finally: after handler is called (if any)", function(){
				document.getElementById("myName").value = "filled";
				formValidator.validate();
				expect(formValidator.isValid()).toEqual(true);
				expect(formValidatorHandlers.after).toHaveBeenCalled();
			});
			it("Passing the form's DOM node as first argument, the submit event as second", function(){
				const formEvent = document.createEvent("Event");
				document.getElementById("myName").value = "filled";
				formValidator.validate(formEvent);
				expect(formValidator.isValid()).toEqual(true);
				expect(formValidatorHandlers.after).toHaveBeenCalledWith(testFormNode, formEvent);
			});

		});

	});

});