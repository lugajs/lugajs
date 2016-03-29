describe("luga.form", function(){

	"use strict";

	it("Contains form-related API", function(){
		expect(luga.form).toBeDefined();
	});

	describe(".toQueryString()", function(){

		beforeEach(function(){
			loadFixtures("form/common.htm");
		});

		it("Returns a string of name/value pairs from fields contained inside a given node", function(){
			expect(luga.form.toQueryString(jQuery("#basicValue"))).toEqual("firstname=ciccio&lastname=pasticcio&radio=yes");
			expect(luga.form.toQueryString(jQuery("#basicNoValue"))).toEqual("firstname=&lastname=");
		});

		it("Throws an exception if the given node does not exists", function(){
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
			expect(luga.form.toQueryString(jQuery("#multiBox"))).toEqual("firstname=ciccio&box=first&box=second&box=fourth");
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

		it("Return a JavaScript object containing name/value pairs from fields contained inside a given node", function(){
			expect(luga.form.toHash(jQuery("#basicValue"))).toEqual({firstname: "ciccio", lastname: "pasticcio", radio: "yes"});
			expect(luga.form.toHash(jQuery("#basicNoValue"))).toEqual({firstname: "", lastname: ""});
		});

		it("Throws an exception if the given node does not exists", function(){
			expect(function(){
				luga.form.toHash(jQuery("#missing"));
			}).toThrow();
		});

		it("Ignores unsuccessful fields", function(){
			expect(luga.form.toHash(jQuery("#unsuccessfulFields"))).toEqual({firstname: "ciccio"});
		});

		it("Values of multiple checked checkboxes are included as a single entry, with array value", function(){
			expect(luga.form.toHash(jQuery("#multiBox"))).toEqual({firstname: "ciccio", box: ["first", "second", "fourth"]});
		});

		it("Values of multiple select are included as a single entry, with comma-delimited value", function(){
			expect(luga.form.toHash(jQuery("#multiSelect"))).toEqual({firstname: "ciccio", select: ["first", "second"]});
		});

		it("If the second argument is set to true, MS Word's special chars are replaced with plausible substitutes", function(){
			var moronicStr = String.fromCharCode(8230);
			jQuery("#moronicValue").val(moronicStr);
			expect(luga.form.toHash(jQuery("#moronicForm"), true)).toEqual({firstname: "ciccio", moronicValue: "..."});
		});

	});

	describe(".toJson()", function(){

		beforeEach(function(){
			loadFixtures("form/tojson.htm");
		});

		it("Given a form tag or another element wrapping input fields, serialize them into JSON data", function(){
			expect(luga.form.toJson(jQuery("#basicValue"))).toEqual({
				person: {
					firstname: "ciccio",
					lastname: "pasticcio"
				},
				radio: "yes"
			});
			expect(luga.form.toJson(jQuery("#basicNoValue"))).toEqual({
				person: {
					firstname: "",
					lastname: ""
				}
			});
		});

		it("Throws an exception if the given node does not exists", function(){
			expect(function(){
				luga.form.toJson(jQuery("#missing"));
			}).toThrow();
		});

		it("Ignores unsuccessful fields", function(){
			expect(luga.form.toJson(jQuery("#unsuccessfulFields"))).toEqual({
				person: {
					firstname: "ciccio"
				}
			});
		});

		it("Values of multiple checked checkboxes are included as a single entry, with array value", function(){
			expect(luga.form.toJson(jQuery("#multiBox"))).toEqual({
				person: {
					firstname: "ciccio"
				},
				box: ["first", "second"]
			});
		});

		it("Values of multiple select are included as a single entry, with comma-delimited value", function(){
			expect(luga.form.toJson(jQuery("#multiSelect"))).toEqual({
				person: {
					firstname: "ciccio"
				},
				select: ["first", "second"]
			});
		});

		it("Requires luga.form.toHash() in order to work", function(){
			spyOn(luga.form, "toHash");
			luga.form.toJson(jQuery("#basicValue"));
			expect(luga.form.toHash).toHaveBeenCalledWith($("#basicValue"));
		});

	});

	describe(".utils", function(){

		it("Contains form-related, static methods and utilities", function(){
			expect(luga.form.utils).toBeDefined();
		});

		describe(".getFieldGroup()", function(){

			describe("Extracts group of fields that share the same name from", function(){

				it("A given root node", function(){
					loadFixtures("validator/RadioValidator/required.htm");
					expect(luga.form.utils.getFieldGroup("lady", jQuery("#single")).length).toEqual(4);
				});

				it("Or the whole document if the second argument is not passed", function(){
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

		describe(".isInputField()", function(){

			it("Returns true if the passed node is a form field that we care about", function(){
				expect(luga.form.utils.isInputField(jQuery("<textarea>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<input type='text'>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<input type='radio'>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<input type='checkbox'>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<input type='email'>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<input type='date'>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<input type='submit'>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<input type='button'>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<button>"))).toEqual(true);
				expect(luga.form.utils.isInputField(jQuery("<select>"))).toEqual(true);
			});

			it("False otherwise", function(){
				expect(luga.form.utils.isInputField(jQuery("<div>"))).toEqual(false);
				expect(luga.form.utils.isInputField(jQuery("<form>"))).toEqual(false);
				expect(luga.form.utils.isInputField(jQuery("<input type='reset'>"))).toEqual(false);
				expect(luga.form.utils.isInputField(jQuery("<fieldset>"))).toEqual(false);
			});

		});

		describe(".isSuccessfulField()", function(){

			it("Returns false if the field is disabled", function(){
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='b' disabled='disabled' type='text' />"))).toEqual(false);
			});

			it("Returns true if the given field is successful", function(){
				expect(luga.form.utils.isSuccessfulField(jQuery("<textarea name='a'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='b' type='text'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='c' type='radio'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='d' type='checkbox'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='e' type='email'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='f' type='date'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='g' type='submit'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='h' type='button'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<button name='i'>"))).toEqual(true);
				expect(luga.form.utils.isSuccessfulField(jQuery("<select name='l'>"))).toEqual(true);
			});

			it("False otherwise", function(){
				expect(luga.form.utils.isSuccessfulField(jQuery("<div>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<form>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<button>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<select>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<textarea>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input type='submit'>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input type='text'>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input type='reset'>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<input name='test' type='reset'>"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(jQuery("<fieldset>"))).toEqual(false);
			});

		});

	});

});