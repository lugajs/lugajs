"use strict";

describe("luga.validator.CheckboxValidator", function() {

	it("Validates each group of checkboxes as a single unit", function() {

		loadFixtures("validator/CheckboxValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#single")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#Nicole")).toHaveClass("invalid");

		// Check one box
		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");
	});

	it("In case of conflicting options/attributes among fields. The last one wins", function() {

		loadFixtures("validator/CheckboxValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#multiple")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
	});

	it("Skips disabled fields", function() {

		loadFixtures("validator/CheckboxValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#disabled")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");

		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");
	});

	it("Skips fields without name too", function() {

		loadFixtures("validator/CheckboxValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#noNames")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");

		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");
	});

	it("Can use a combination of data-luga-minchecked and data-luga-maxchecked", function() {

		loadFixtures("validator/CheckboxValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#minMaxChecked")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#maxNicole")).toHaveClass("invalid");

		// Check one box
		jQuery("#maxNicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");

		// Check three boxes
		jQuery("#maxNicole").prop("checked", true);
		jQuery("#maxKate").prop("checked", true);
		jQuery("#maxJennifer").prop("checked", true);
		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#maxNicole")).toHaveClass("invalid");
	});

	it("data-luga-maxchecked alone makes everything optional", function() {

		loadFixtures("validator/CheckboxValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#maxChecked")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");

	});

});