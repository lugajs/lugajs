describe("luga.validator.CheckboxValidator", function(){

	"use strict";

	it("Implements the luga.validator.BaseGroupValidator abstract class", function(){
		jasmineFixtures.loadHTML("validator/CheckboxValidator/required.htm");
		const validator = luga.validator.fieldValidatorFactory.getInstance({
			formNode: document.getElementById("single"),
			fieldNode: document.getElementById("Nicole")
		});
		const MockValidator = function(options){
			luga.extend(luga.validator.BaseGroupValidator, this, [options]);
		};
		const inputGroup = luga.form.utils.getFieldGroup("lady",document.getElementById("single"));
		expect(validator).toMatchDuckType(new MockValidator({inputGroup: inputGroup}));
	});

	it("Validates each group of checkboxes as a single unit", function(){

		jasmineFixtures.loadHTML("validator/CheckboxValidator/required.htm");
		const formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("single")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("Nicole")).toHaveClass("invalid");

		// Check one box
		document.getElementById("Nicole").checked = true;
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");
	});

	it("In case of conflicting options/attributes among fields. The last one wins", function(){

		jasmineFixtures.loadHTML("validator/CheckboxValidator/required.htm");
		const formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("multiple")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		document.getElementById("Nicole").checked = true;
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
	});

	it("Skips disabled fields", function(){

		jasmineFixtures.loadHTML("validator/CheckboxValidator/required.htm");
		const formValidator = new luga.validator.FormValidator({
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

		jasmineFixtures.loadHTML("validator/CheckboxValidator/required.htm");
		const formValidator = new luga.validator.FormValidator({
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

	it("Can use a combination of data-lugavalidator-minchecked and data-lugavalidator-maxchecked", function(){

		jasmineFixtures.loadHTML("validator/CheckboxValidator/required.htm");
		const formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("minMaxChecked")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("maxNicole")).toHaveClass("invalid");

		// Check one box
		document.getElementById("maxNicole").checked = true;
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");

		// Check three boxes
		document.getElementById("maxNicole").checked = true;
		document.getElementById("maxKate").checked = true;
		document.getElementById("maxJennifer").checked = true;
		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toEqual(false);
		expect(document.getElementById("maxNicole")).toHaveClass("invalid");
	});

	it("data-lugavalidator-maxchecked alone makes everything optional", function(){

		jasmineFixtures.loadHTML("validator/CheckboxValidator/required.htm");
		const formValidator = new luga.validator.FormValidator({
			formNode: document.getElementById("maxChecked")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toEqual(true);
		expect(document.getElementById("Nicole")).not.toHaveClass("invalid");

	});

});