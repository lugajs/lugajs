"use strict";

describe("luga.validator", function() {

	it("Lives inside its own namespace", function() {
		expect(luga.validator).toBeDefined();
	});

	describe("FieldValidatorGetInstance()", function() {

		it("Returns null if the passed HTML node can't be validated", function() {
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("<div>") })).toBeNull();
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("<button>") })).toBeNull();
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("<input type='reset'>") })).toBeNull();
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("<fieldset>") })).toBeNull();
		});

		it("Returns relevant validator, depending on the kind of field", function() {

			loadFixtures("validator/FormValidator/generic.htm");

			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("#age") }).constructor).toEqual(luga.validator.TextValidator);
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("#comments") }).constructor).toEqual(luga.validator.TextValidator);
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("#boxNicole") }).constructor).toEqual(luga.validator.CheckboxValidator);
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("#radioNicole") }).constructor).toEqual(luga.validator.RadioValidator);
			expect(luga.validator.FieldValidatorGetInstance({ fieldNode: jQuery("#food") }).constructor).toEqual(luga.validator.SelectValidator);

		});

	});

	describe("BaseFieldValidator is an abstract class", function() {
		it("Its isValid() method is abstract and can't be invoked", function() {
			var textNode = jQuery('<input type="text" data-luga-required="true" disabled="disabled" data-luga-errorclass="invalid">');
			var baseValidator = new luga.validator.BaseFieldValidator({
				fieldNode: textNode
			});
			expect(function(){
				baseValidator.isValid();
			}).toThrow();
		});
	});

	describe("All validators share some common capabilities", function() {

		it("Their message and errorclass properties are empty strings by default", function() {
			var textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("<input type='text'>")
			});
			expect(textValidator.options.message).toEqual("");
			expect(textValidator.options.errorclass).toEqual("");
		});

		it("They add/remove error class and title attribute", function() {
			var textNode = jQuery('<input type="text" data-luga-required="true" data-luga-errorclass="invalid" data-luga-message="Invalid field!">');
			var textValidator = new luga.validator.FieldValidatorGetInstance({
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

		it("Handle disabled fields as always valid", function() {
			var textNode = jQuery('<input type="text" data-luga-required="true" disabled="disabled" data-luga-errorclass="invalid">');
			var textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.validate()).toBeFalsy();
			expect(textNode.hasClass("invalid")).toBeFalsy();
		});

	});

});

describe("luga.validator.utils", function() {

	it("Lives inside its own namespace", function() {
		expect(luga.validator.utils).toBeDefined();
	});

	describe("isInputField()", function() {

		it("Accepts nodes that can be validated", function() {
			expect(luga.validator.utils.isInputField(jQuery("<textarea>"))).toBeTruthy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='text'>"))).toBeTruthy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='radio'>"))).toBeTruthy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='checkbox'>"))).toBeTruthy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='email'>"))).toBeTruthy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='date'>"))).toBeTruthy();
			expect(luga.validator.utils.isInputField(jQuery("<select>"))).toBeTruthy();
		});

		it("Refuses nodes that can't be validated", function() {
			expect(luga.validator.utils.isInputField(jQuery("<div>"))).toBeFalsy();
			expect(luga.validator.utils.isInputField(jQuery("<form>"))).toBeFalsy();
			expect(luga.validator.utils.isInputField(jQuery("<button>"))).toBeFalsy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='submit'>"))).toBeFalsy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='reset'>"))).toBeFalsy();
			expect(luga.validator.utils.isInputField(jQuery("<input type='button'>"))).toBeFalsy();
			expect(luga.validator.utils.isInputField(jQuery("<fieldset>"))).toBeFalsy();
		});

	});

	describe("getFieldGroup()", function() {

		describe("Extracts group of related radio buttons", function() {

			it("Within a given form", function() {
				loadFixtures("validator/RadioValidator/required.htm");
				expect(luga.validator.utils.getFieldGroup("lady", jQuery("#single")).length).toEqual(4);
			});

			it("Or not", function() {
				loadFixtures("validator/RadioValidator/required.htm");
				expect(luga.validator.utils.getFieldGroup("lady").length).toEqual(12);
			});

		});

	});

});