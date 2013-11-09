"use strict";

describe("luga.validator", function() {

	it("Namespaces must be defined", function() {
		expect(luga.validator).toBeDefined();
		expect(luga.validator.util).toBeDefined();
	});

	describe("fieldValidatorGetInstance()", function() {

		it("Return null if the passed HTML node can't be validated", function() {
			expect(luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<div>") })).toBeNull();
			expect(luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<button>") })).toBeNull();
			expect(luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<input type='reset'>") })).toBeNull();
			expect(luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<fieldset>") })).toBeNull();
		});

		it("Return relevant validator object for the given field type", function() {
			var textValidator = luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<input type='text'>") });
			expect(textValidator.constructor).toEqual(luga.validator.textValidator);
			var selectValidator = luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<select>") });
			expect(selectValidator.constructor).toEqual(luga.validator.selectValidator);
			var radioValidator = luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<input type='radio'>") });
			expect(radioValidator.constructor).toEqual(luga.validator.radioValidator);
			var checkboxValidator = luga.validator.fieldValidatorGetInstance({ fieldNode: jQuery("<input type='checkbox'>") });
			expect(checkboxValidator.constructor).toEqual(luga.validator.checkboxValidator);
		});

	});

	describe("baseFieldValidator is an abstract class", function() {
		it("Its isValid() method is abstract and can't be invoked", function() {
			var textNode = jQuery('<input type="text" data-luga-required="true" disabled="disabled" data-luga-errorclass="invalid">');
			var baseValidator = new luga.validator.baseFieldValidator({
				fieldNode: textNode
			});
			expect(function(){
				baseValidator.isValid();
			}).toThrow();
		});
	});

	describe("All validators share some common capabilities", function() {

		it("Message and errorclass properties are empty strings by default", function() {
			var textValidator = new luga.validator.fieldValidatorGetInstance({
				fieldNode: jQuery("<input type='text'>")
			});
			expect(textValidator.options.message).toEqual("");
			expect(textValidator.options.errorclass).toEqual("");
		});

		it("Add/remove error class and title attribute", function() {
			var textNode = jQuery('<input type="text" data-luga-required="true" data-luga-errorclass="invalid" data-luga-message="Invalid field!">');
			var textValidator = new luga.validator.fieldValidatorGetInstance({
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
			var textValidator = new luga.validator.fieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.validate()).toBeFalsy();
			expect(textNode.hasClass("invalid")).toBeFalsy();
		});

	});

	describe("util.isInputField()", function() {

		it("Accepts nodes that can be validated", function() {
			expect(luga.validator.util.isInputField(jQuery("<textarea>"))).toBeTruthy();
			expect(luga.validator.util.isInputField(jQuery("<input type='text'>"))).toBeTruthy();
			expect(luga.validator.util.isInputField(jQuery("<input type='radio'>"))).toBeTruthy();
			expect(luga.validator.util.isInputField(jQuery("<input type='checkbox'>"))).toBeTruthy();
			expect(luga.validator.util.isInputField(jQuery("<input type='email'>"))).toBeTruthy();
			expect(luga.validator.util.isInputField(jQuery("<input type='date'>"))).toBeTruthy();
			expect(luga.validator.util.isInputField(jQuery("<select>"))).toBeTruthy();
		});

		it("Refuses nodes that can't be validated", function() {
			expect(luga.validator.util.isInputField(jQuery("<div>"))).toBeFalsy();
			expect(luga.validator.util.isInputField(jQuery("<form>"))).toBeFalsy();
			expect(luga.validator.util.isInputField(jQuery("<button>"))).toBeFalsy();
			expect(luga.validator.util.isInputField(jQuery("<input type='submit'>"))).toBeFalsy();
			expect(luga.validator.util.isInputField(jQuery("<input type='reset'>"))).toBeFalsy();
			expect(luga.validator.util.isInputField(jQuery("<input type='button'>"))).toBeFalsy();
			expect(luga.validator.util.isInputField(jQuery("<fieldset>"))).toBeFalsy();
		});

	});

});