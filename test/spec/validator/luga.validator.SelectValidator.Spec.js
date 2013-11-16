"use strict";

describe("luga.validator.SelectValidator", function() {

	it("Accept two validation attributes", function() {
		var selectNode = jQuery('<select name="dish"  data-luga-invalidindex="1" data-luga-invalidvalue="Crepes" data-luga-message="Invalid!">');
		var selectValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: selectNode
		});
		expect(selectValidator.options.invalidindex).toEqual("1");
		expect(selectValidator.options.invalidvalue).toEqual("Crepes");
		expect(selectValidator.options.message).toEqual("Invalid!");
	});

	describe("data-luga-invalidindex", function() {

		it("Accept only numbers", function() {
			var selectNode = jQuery('<select data-luga-invalidindex="test">');
			expect(function(){
				var selectValidator = new luga.validator.FieldValidatorGetInstance({
					fieldNode: selectNode
				});
			}).toThrow();
		});

		it("Prevent selecting an entry from a given position (zero based)", function() {
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

		it("Work around a weird brower bug when the size attribute is specified", function() {
			loadFixtures("validator/SelectValidator/invalidindex.htm");
			var selectValidator = null;

			selectValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#selectWithSize")
			});
			expect(selectValidator.isValid()).toBeFalsy();

		});

	});

	describe("data-luga-invalidvalue", function() {

		it("Prevent the user from selecting an entry with a given value", function() {
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

});