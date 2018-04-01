describe("luga.validator.RadioValidator", function(){

	"use strict";

	it("Implements the luga.validator.BaseGroupValidator abstract class", function(){
		jasmineFixtures.loadHTML("validator/RadioValidator/required.htm");
		var validator = luga.validator.fieldValidatorFactory.getInstance({
			formNode: document.getElementById("single"),
			fieldNode: document.getElementById("Nicole")
		});
		var MockValidator = function(options){
			luga.extend(luga.validator.BaseGroupValidator, this, [options]);
		};
		var inputGroup = luga.form.utils.getFieldGroup("lady",document.getElementById("single"));
		expect(validator).toMatchDuckType(new MockValidator({inputGroup: inputGroup}));
	});

	it("Validates each group of radio buttons as a single unit", function(){

		jasmineFixtures.loadHTML("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("single")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("Nicole")).toHaveClass("invalid");

		// Check one radio
		document.getElementById("Nicole").checked = true;

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");
	});

	it("In case of conflicting options/attributes among fields. The last one wins", function(){

		jasmineFixtures.loadHTML("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("multiple")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		document.getElementById("Nicole").checked = true;
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
	});

	it("Skips disabled fields", function(){

		jasmineFixtures.loadHTML("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("disabled")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");

		document.getElementById("Nicole").checked = true;
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");
	});

	it("Skips fields without name too", function(){

		jasmineFixtures.loadHTML("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("noNames")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");

		document.getElementById("Nicole").checked = true;
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");
	});


});