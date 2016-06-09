describe("luga.validator.api", function(){

	"use strict";

	it("Contains Validator's static APIs", function(){
		expect(luga.validator.api).toBeDefined();
	});

	describe(".validateForm()", function(){

		it("Allows to programmatically validate a form", function(){

			loadFixtures("validator/FormValidator/basic.htm");

			expect(luga.validator.api.validateForm({formNode: jQuery("#basic")})).toEqual(false);
			expect(jQuery("#myName")).toHaveClass("invalid");

			jQuery("#myName").val("filled");
			expect(luga.validator.api.validateForm({formNode: jQuery("#basic")})).toEqual(true);
			expect(jQuery("#myName")).not.toHaveClass("invalid");

		});

		it("And returns a boolean", function(){
			loadFixtures("validator/FormValidator/basic.htm");
			expect(luga.validator.api.validateForm({formNode: jQuery("#basic")})).toEqual(false);
		});

	});

	describe(".validateField()", function(){

		it("Thows an error if the field can't be validated", function(){

			expect(function(){
				luga.validator.api.validateField({fieldNode: jQuery("<input type='reset'>")});
			}).toThrow();

		});

		it("Allows to programmatically validate a field", function(){

			loadFixtures("validator/FormValidator/basic.htm");

			expect(luga.validator.api.validateField({fieldNode: jQuery("#myName")})).toEqual(false);
			expect(jQuery("#myName")).toHaveClass("invalid");

			jQuery("#myName").val("filled");
			expect(luga.validator.api.validateField({
				fieldNode: jQuery("#myName")
			})).toEqual(true);
			expect(jQuery("#myName")).not.toHaveClass("invalid");

		});

		it("And returns a boolean", function(){

			loadFixtures("validator/FormValidator/basic.htm");
			expect(luga.validator.api.validateField({fieldNode: jQuery("#myName")})).toEqual(false);

		});

	});

	describe(".validateFields()", function(){

		it("Allows to programmatically validate a collection of fields", function(){

			loadFixtures("validator/FormValidator/generic.htm");
			var fields = jQuery("#name,#age");

			expect(luga.validator.api.validateFields({fields: fields})).toBe(false);
			expect(jQuery("#name")).toHaveClass("invalid");

		});

		it("And return true if all fields are validated", function(){

			loadFixtures("validator/FormValidator/generic.htm");
			var fields = jQuery("#name,#age");

			jQuery("#age").val("33");
			jQuery("#name").val("filled");
			expect(luga.validator.api.validateFields({fields: fields})).toBe(true);
			expect(jQuery("#name")).not.toHaveClass("invalid");

		});

	});

	describe(".validateChildFields()", function(){

		it("Allows to programmatically validate all fields contained inside a given node", function(){

			loadFixtures("validator/FormValidator/generic.htm");
			var fieldset = jQuery("#fieldGroup");

			expect(luga.validator.api.validateChildFields({rootNode: fieldset})).toBe(false);
			expect(jQuery("#name")).toHaveClass("invalid");

		});

		it("And return true if all fields are validated", function(){

			loadFixtures("validator/FormValidator/generic.htm");
			var fieldset = jQuery("#fieldGroup");

			jQuery("#age").val("33");
			jQuery("#name").val("filled");
			expect(luga.validator.api.validateChildFields({rootNode: fieldset})).toBe(true);
			expect(jQuery("#name")).not.toHaveClass("invalid");

		});

	});

});
