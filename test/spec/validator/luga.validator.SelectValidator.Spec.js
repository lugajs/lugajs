"use strict";

describe("luga.validator.SelectValidator", function(){

	it("Accepts two validation attributes", function(){
		var selectNode = jQuery('<select name="dish"  data-lugavalidator-invalidindex="1" data-lugavalidator-invalidvalue="Crepes" data-lugavalidator-message="Invalid!">');
		var selectValidator = luga.validator.FieldValidatorGetInstance({
			fieldNode: selectNode
		});
		expect(selectValidator.config.invalidindex).toEqual("1");
		expect(selectValidator.config.invalidvalue).toEqual("Crepes");
		expect(selectValidator.config.message).toEqual("Invalid!");
	});

	it("Throws an exception if the associated field node does not exists", function(){
		expect(function(){
			new luga.validator.SelectValidator({
				fieldNode: jQuery("#missing")
			});
		}).toThrow();
	});

	describe("Accepts an Options object as single argument", function(){

		var selectNode, selectValidator;
		beforeEach(function(){
			selectNode = jQuery('<select name="dish"  data-lugavalidator-invalidindex="1" data-lugavalidator-invalidvalue="Crepes" data-lugavalidator-message="Invalid!">');
			selectValidator = luga.validator.FieldValidatorGetInstance({
				fieldNode: selectNode
			});
		});
	});

	describe("data-lugavalidator-invalidindex", function(){

		it("Accepts only numbers", function(){
			var selectNode = jQuery('<select data-lugavalidator-invalidindex="test">');
			expect(function(){
				var selectValidator = luga.validator.FieldValidatorGetInstance({
					fieldNode: selectNode
				});
			}).toThrow();
		});

		it("Prevents selection of an entry on a given position", function(){
			loadFixtures("validator/SelectValidator/invalidindex.htm");
			var selectValidator = null;

			selectValidator = luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#notSelected")
			});
			expect(selectValidator.isValid()).toBeFalsy();

			selectValidator = luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#kateSelected")
			});
			expect(selectValidator.isValid()).toBeTruthy();
		});

		it("Works around a weird brower bug when the size attribute is specified", function(){
			loadFixtures("validator/SelectValidator/invalidindex.htm");
			var selectValidator = null;

			selectValidator = luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#selectWithSize")
			});
			expect(selectValidator.isValid()).toBeFalsy();

		});

	});

	describe("data-lugavalidator-invalidvalue", function(){

		it("Prevents selection of an entry with a given value", function(){
			loadFixtures("validator/SelectValidator/invalidvalue.htm");
			var selectValidator = null;

			selectValidator = luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#pizza")
			});
			expect(selectValidator.isValid()).toBeFalsy();

			selectValidator = luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#spaghetti")
			});
			expect(selectValidator.isValid()).toBeTruthy();
		});

	});

	describe("Multiple select inside the same form can be validated too", function(){
		// It's an obvious test, but check for a regression that happened once
		it("Since the two field validators have different names", function(){

			loadFixtures("validator/SelectValidator/both.htm");

			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#twoSelect")
			});
			expect(formValidator.validate().length).toEqual(2);
			expect(formValidator.isValid()).toBeFalsy();

		});

	});

});