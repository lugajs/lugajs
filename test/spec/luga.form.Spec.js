"use strict";

describe("luga.form contains form-related API", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.form).toBeDefined();
	});

	describe("luga.form.util stores form-related, static methods and utilities", function(){

		it("Lives inside its own namespace", function(){
			expect(luga.form.utils).toBeDefined();
		});

		describe(".isInputField()", function(){

			it("Returns true if the passed node is a form field that we care about", function(){
				expect(luga.form.utils.isInputField(jQuery("<textarea>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<input type='text'>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<input type='radio'>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<input type='checkbox'>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<input type='email'>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<input type='date'>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<input type='submit'>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<input type='button'>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<button>"))).toBeTruthy();
				expect(luga.form.utils.isInputField(jQuery("<select>"))).toBeTruthy();
			});

			it("False otherwise", function(){
				expect(luga.form.utils.isInputField(jQuery("<div>"))).toBeFalsy();
				expect(luga.form.utils.isInputField(jQuery("<form>"))).toBeFalsy();
				expect(luga.form.utils.isInputField(jQuery("<input type='reset'>"))).toBeFalsy();
				expect(luga.form.utils.isInputField(jQuery("<fieldset>"))).toBeFalsy();
			});

		});

		describe(".getFieldGroup()", function(){

			describe("Extracts group of related radio buttons", function(){

				it("Within a given form", function(){
					loadFixtures("validator/RadioValidator/required.htm");
					expect(luga.form.utils.getFieldGroup("lady", jQuery("#single")).length).toEqual(4);
				});

				it("Or the whole document", function(){
					loadFixtures("validator/RadioValidator/required.htm");
					expect(luga.form.utils.getFieldGroup("lady").length).toEqual(12);
				});

			});

		});

		describe(".getChildFields()", function(){

			it("Returns an array of input fields contained inside a given root node", function(){
				loadFixtures("validator/FormValidator/generic.htm");
				expect(luga.form.utils.getChildFields(jQuery("#generic")).length).toEqual(15);
			});

			it("Returns an empty array if there are no suitable input fields", function(){
				loadFixtures("validator/FormValidator/generic.htm");
				expect(luga.form.utils.getChildFields(jQuery("#food")).length).toEqual(0);
			});

		});

	});

});