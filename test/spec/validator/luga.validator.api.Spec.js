"use strict";

describe("luga.validator.api", function() {

	it("Lives inside its own namespace", function() {
		expect(luga.validator.api).toBeDefined();
	});

	describe(".validateForm()", function() {

		it("Allows to programmatically validate a form", function() {

			loadFixtures("validator/FormValidator/basic.htm");

			expect(luga.validator.api.validateForm({formNode: jQuery("#basic")})).toBeFalsy();
			expect(jQuery("#myName")).toHaveClass("invalid");

			jQuery("#myName").val("filled");
			//expect(formValidator.validate().length).toEqual(0);
			expect(luga.validator.api.validateForm({formNode: jQuery("#basic")})).toBeTruthy();
			expect(jQuery("#myName")).not.toHaveClass("invalid");

		});

	});

});
