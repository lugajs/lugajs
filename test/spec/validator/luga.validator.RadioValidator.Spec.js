describe("luga.validator.RadioValidator", function(){

	"use strict";

	it("Implements the luga.validator.BaseGroupValidator abstract class", function(){
		loadFixtures("validator/RadioValidator/required.htm");
		var validator = luga.validator.fieldValidatorFactory.getInstance({
			formNode: jQuery("#single"),
			fieldNode: jQuery("#Nicole")
		});
		var MockValidator = function(options){
			luga.extend(luga.validator.BaseGroupValidator, this, [options]);
		};
		var inputGroup = luga.form.utils.getFieldGroup("lady",jQuery("#single"));
		expect(validator).toMatchDuckType(new MockValidator({inputGroup: inputGroup}));
	});

	it("Validates each group of radio buttons as a single unit", function(){

		loadFixtures("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#single")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toEqual(false);
		expect(jQuery("#Nicole")).toHaveClass("invalid");

		// Check one radio
		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");
	});

	it("In case of conflicting options/attributes among fields. The last one wins", function(){

		loadFixtures("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#multiple")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
	});

	it("Skips disabled fields", function(){

		loadFixtures("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#disabled")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");

		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");
	});

	it("Skips fields without name too", function(){

		loadFixtures("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#noNames")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");

		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");
	});


});