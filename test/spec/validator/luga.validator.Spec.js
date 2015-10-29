"use strict";

describe("luga.validator", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.validator).toBeDefined();
	});

	describe("Uses separated namespace for storing:", function(){
		it(".rules", function(){
			expect(luga.validator.rules).toBeDefined();
		});
		it(".patterns", function(){
			expect(luga.validator.patterns).toBeDefined();
		});
		it(".dateSpecs", function(){
			expect(luga.validator.dateSpecs).toBeDefined();
		});
		it(".handlers", function(){
			expect(luga.validator.handlers).toBeDefined();
		});
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.validator.version).toBeDefined();
		});
	});

	describe(".BaseFieldValidator is an abstract class", function(){
		it("That can't be invoked directly", function(){
			var textNode = jQuery('<input type="text" data-lugavalidator-required="true" disabled="disabled" data-lugavalidator-errorclass="invalid">');
			expect(function(){
				new luga.validator.BaseFieldValidator({
					fieldNode: textNode
				});
			}).toThrow();
		});
	});

	describe(".BaseGroupValidator is an abstract class", function(){
		it("That can't be invoked directly", function(){
			var boxNode = jQuery('<input type="checkbox">');
			expect(function(){
				new luga.validator.BaseGroupValidator({
					fieldNode: boxNode
				});
			}).toThrow();
		});
	});

	describe("All validators share some common capabilities", function(){

		it("Their message and errorclass properties are empty strings by default", function(){
			var textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("<input type='text'>")
			});
			expect(textValidator.config.message).toEqual("");
			expect(textValidator.config.errorclass).toEqual("");
		});

		it("They add/remove error class and title attribute", function(){
			var textNode = jQuery('<input type="text" data-lugavalidator-required="true" data-lugavalidator-errorclass="invalid" data-lugavalidator-message="Invalid field!">');
			var textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textNode.hasClass("invalid")).toBeFalsy();
			textValidator.flagInvalid();
			expect(textNode.hasClass("invalid")).toBeTruthy();
			expect(textNode.attr("title")).toEqual("Invalid field!");
			textValidator.flagValid();
			expect(textNode.hasClass("invalid")).toBeFalsy();
			expect(textNode.attr("title")).toBeUndefined();
		});

		it("Handle disabled fields as always valid", function(){
			var textNode = jQuery('<input type="text" data-lugavalidator-required="true" disabled="disabled" data-lugavalidator-errorclass="invalid">');
			var textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.validate()).toBeFalsy();
			expect(textNode.hasClass("invalid")).toBeFalsy();
		});

		it("They have a 'name' property derived from the field's name or id. If none is available, it defaults to an empty string", function(){
			var textValidator;

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("<input type='text'>")
			});
			expect(textValidator.name).toEqual("");

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("<input type='text' name='myName'>")
			});
			expect(textValidator.name).toEqual("myName");

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("<input type='text' id='myId'>")
			});
			expect(textValidator.name).toEqual("myId");
		});

	});

});

describe("luga.validator.handlers", function(){

	it("Contains handlers for form validation", function(){
		expect(luga.validator.handlers).toBeDefined();
	});

	describe("luga.validator.handlers.errorAlert", function(){
		it("Display error messages inside alert", function(){
			expect(luga.validator.handlers.errorAlert).toBeDefined();
			expect(jQuery.isFunction(luga.validator.handlers.errorAlert)).toBeTruthy();
		});
	});

	describe("luga.validator.handlers.errorBox", function(){
		it("Display errors inside a box above the form", function(){
			expect(luga.validator.handlers.errorBox).toBeDefined();
			expect(jQuery.isFunction(luga.validator.handlers.errorBox)).toBeTruthy();
		});
	});

	describe("luga.validator.handlers.bootstrap", function(){
		it("Use Bootstrap validation states to display errors", function(){
			expect(luga.validator.handlers.bootstrap).toBeDefined();
			expect(jQuery.isFunction(luga.validator.handlers.bootstrap)).toBeTruthy();
		});
	});

});

describe("luga.validator.fieldValidatorFactory.getInstance()", function(){

	describe("Returns either:", function(){

		beforeEach(function(){
			loadFixtures("validator/FormValidator/generic.htm");
		});

		it("null if the passed HTML has no matching validator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: jQuery("<div>")})).toBeNull();
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: jQuery("<input type='reset'>")})).toBeNull();
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: jQuery("<fieldset>")})).toBeNull();
		});

		it("An instance of luga.validator.TextValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: jQuery("#age")}).constructor).toEqual(luga.validator.TextValidator);
		});

		it("An instance of luga.validator.CheckboxValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: jQuery("#boxNicole")}).constructor).toEqual(luga.validator.CheckboxValidator);
		});

		it("An instance of luga.validator.RadioValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: jQuery("#boxNicole")}).constructor).toEqual(luga.validator.CheckboxValidator);
		});

		it("An instance of luga.validator.SelectValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: jQuery("#food")}).constructor).toEqual(luga.validator.SelectValidator);
		});

	});

});