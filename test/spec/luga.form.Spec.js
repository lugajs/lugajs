"use strict";

describe("luga.form", function(){

	it("Contains form-related API", function(){
		expect(luga.form).toBeDefined();
	});

	describe(".toQueryString()", function(){

		beforeEach(function(){
			loadFixtures("form/common.htm");
		});

		it("Returns a string of field name/value pairs from a given form", function(){
			expect(luga.form.toQueryString(jQuery("#basicValue"))).toEqual("firstname=ciccio&lastname=pasticcio");
			expect(luga.form.toQueryString(jQuery("#basicNoValue"))).toEqual("firstname=&lastname=");
		});

		it("Throws an exception if the given form node does not exists", function(){
			expect(function(){
				luga.form.toQueryString(jQuery("#missing"));
			}).toThrow();
		});

		it("Ignores unsuccessful fields", function(){
			expect(luga.form.toQueryString(jQuery("#unsuccessfulFields"))).toEqual("firstname=ciccio");
		});

		it("Names and values are URI encoded", function(){
			expect(luga.form.toQueryString(jQuery("#encodedValue"))).toEqual("firstname=ciccio&slash=%2F&ampersand=%26");
		});

		it("Values of multiple checked checkboxes are included as multiple value/pairs", function(){
			expect(luga.form.toQueryString(jQuery("#multiBox"))).toEqual("firstname=ciccio&box=first&box=second&box=third");
		});

		it("Values of multiple select are included as multiple value/pairs", function(){
			expect(luga.form.toQueryString(jQuery("#multiSelect"))).toEqual("firstname=ciccio&select=first&select=second");
		});

		it("If the second argument is set to true, MS Word's special chars are replaced with plausible substitutes", function(){
			var moronicStr = String.fromCharCode(8216) + String.fromCharCode(8220);
			jQuery("#moronicValue").val(moronicStr);
			expect(luga.form.toQueryString(jQuery("#moronicForm"), true)).toEqual("firstname=ciccio&moronicValue='%22");
		});

	});

	describe(".toHash()", function(){

		beforeEach(function(){
			loadFixtures("form/common.htm");
		});

		it("Returns a JavaScript object containing name/value pairs from a given form", function(){
			expect(luga.form.toHash(jQuery("#basicValue"))).toEqual({firstname: "ciccio", lastname: "pasticcio"});
			expect(luga.form.toHash(jQuery("#basicNoValue"))).toEqual({firstname: "", lastname: ""});
		});

		it("Throws an exception if the given form node does not exists", function(){
			expect(function(){
				luga.form.toHash(jQuery("#missing"));
			}).toThrow();
		});

		it("Ignores unsuccessful fields", function(){
			expect(luga.form.toHash(jQuery("#unsuccessfulFields"))).toEqual({firstname: "ciccio"});
		});

		it("Values of multiple checked checkboxes are included as a single entry, with comma-delimited value", function(){
			expect(luga.form.toHash(jQuery("#multiBox"))).toEqual({firstname: "ciccio", box: "first,second,third"});
		});

		it("Values of multiple select are included as a single entry, with comma-delimited value", function(){
			expect(luga.form.toHash(jQuery("#multiSelect"))).toEqual({firstname: "ciccio", select: "first,second"});
		});

		it("If the second argument is set to true, MS Word's special chars are replaced with plausible substitutes", function(){
			var moronicStr = String.fromCharCode(8230);
			jQuery("#moronicValue").val(moronicStr);
			expect(luga.form.toHash(jQuery("#moronicForm"), true)).toEqual({firstname: "ciccio", moronicValue: "..."});
		});

		it("You can change the delimiter by setting the value of luga.form.CONST.HASH_DELIMITER", function(){
			luga.form.CONST.HASH_DELIMITER = ";";
			expect(luga.form.toHash(jQuery("#multiBox"))).toEqual({firstname: "ciccio", box: "first;second;third"});
			expect(luga.form.toHash(jQuery("#multiSelect"))).toEqual({firstname: "ciccio", select: "first;second"});
			// Reset
			luga.form.CONST.HASH_DELIMITER = ",";
		});

	});

	describe(".utils", function(){

		it("Contains form-related, static methods and utilities", function(){
			expect(luga.form.utils).toBeDefined();
		});

		describe(".getFieldGroup(). Extracts group of related radio buttons", function(){

			it("Within a given form", function(){
				loadFixtures("validator/RadioValidator/required.htm");
				expect(luga.form.utils.getFieldGroup("lady", jQuery("#single")).length).toEqual(4);
			});

			it("Or the whole document", function(){
				loadFixtures("validator/RadioValidator/required.htm");
				expect(luga.form.utils.getFieldGroup("lady").length).toEqual(12);
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

		describe(".isSuccessfulField()", function(){

			it("Returns true if the given field is successful", function(){
				expect(luga.form.utils.isSuccessfulField(jQuery("<textarea name='a'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='b' type='text'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='c' type='radio'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='d' type='checkbox'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='e' type='email'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='f' type='date'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='g' type='submit'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='h' type='button'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<button name='i'>"))).toBeTruthy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<select name='l'>"))).toBeTruthy();
			});

			it("False otherwise", function(){
				expect(luga.form.utils.isSuccessfulField(jQuery("<div>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<form>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<button>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<select>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<textarea>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input type='submit'>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input type='text'>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input type='reset'>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='test' type='reset'>"))).toBeFalsy();
				expect(luga.form.utils.isSuccessfulField(jQuery("<fieldset>"))).toBeFalsy();
			});

		});

	});

});