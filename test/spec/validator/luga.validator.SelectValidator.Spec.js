"use strict";

describe("luga.validator.SelectValidator", function() {

	it("Accepts two validation attributes", function() {
		var selectNode = jQuery('<select name="dish"  data-luga-invalidindex="1" data-luga-invalidvalue="Crepes" data-luga-message="Invalid!">');
		var selectValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: selectNode
		});
		expect(selectValidator.config.invalidindex).toEqual("1");
		expect(selectValidator.config.invalidvalue).toEqual("Crepes");
		expect(selectValidator.config.message).toEqual("Invalid!");
	});

	describe("data-luga-invalidindex", function() {

		it("Accepts only numbers", function() {
			var selectNode = jQuery('<select data-luga-invalidindex="test">');
			expect(function(){
				var selectValidator = new luga.validator.FieldValidatorGetInstance({
					fieldNode: selectNode
				});
			}).toThrow();
		});

		it("Prevents selection of an entry on a given position", function() {
			loadFixtures("validator/SelectValidator/invalidindex.htm");
			var selectValidator = null;

			selectValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#notSelected")
			});
			expect(selectValidator.isValid()).toBeFalsy();

			selectValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#kateSelected")
			});
			expect(selectValidator.isValid()).toBeTruthy();
		});

		it("Works around a weird brower bug when the size attribute is specified", function() {
			loadFixtures("validator/SelectValidator/invalidindex.htm");
			var selectValidator = null;

			selectValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#selectWithSize")
			});
			expect(selectValidator.isValid()).toBeFalsy();

		});

	});

	describe("data-luga-invalidvalue", function() {

		it("Prevents selection of an entry with a given value", function() {
			loadFixtures("validator/SelectValidator/invalidvalue.htm");
			var selectValidator = null;

			selectValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#pizza")
			});
			expect(selectValidator.isValid()).toBeFalsy();

			selectValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#spaghetti")
			});
			expect(selectValidator.isValid()).toBeTruthy();
		});

	});

	describe("Multiple select inside the same form can be validated too", function() {
		// It's an obvious test, but check for a regression that happened once
		it("Since the two field validators have different names", function() {

			loadFixtures("validator/SelectValidator/both.htm");

			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#twoSelect")
			});
			expect(formValidator.validate().length).toEqual(2);
			expect(formValidator.isValid()).toBeFalsy();

		});

	});

});