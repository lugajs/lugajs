describe("luga.validator.RadioValidator", function() {

	it("Each group of radio buttons is validated as a single unit", function() {

		loadFixtures("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#single")
		});

		expect(formValidator.validate().length).toEqual(1);
		expect(formValidator.validate()[0].message).toEqual("Select a Lady");
		expect(formValidator.isValid()).toBeFalsy();
		expect(jQuery("#Nicole")).toHaveClass("invalid");

		// Check one radio
		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		expect(jQuery("#Nicole")).not.toHaveClass("invalid");
	});

	it("In case of conflicting requirements among fields. The last one wins", function() {

		loadFixtures("validator/RadioValidator/required.htm");
		var formValidator = new luga.validator.FormValidator({
			formNode: jQuery("#multiple")
		});

		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
		jQuery("#Nicole").prop("checked", true);
		expect(formValidator.validate().length).toEqual(0);
		expect(formValidator.isValid()).toBeTruthy();
	});

	it("Disabled fields are skipped", function() {

		loadFixtures("validator/RadioValidator/required.htm");
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

	it("Fields without name attribute are skipped too", function() {

		loadFixtures("validator/RadioValidator/required.htm");
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


});