describe("luga.form", function(){

	"use strict";

	it("Contains form-related API", function(){
		expect(luga.form).toBeDefined();
	});

	describe(".toQueryString()", function(){

		beforeEach(function(){
			jasmineFixtures.loadHTML("form/common.htm");
		});

		it("Return a string of name/value pairs from fields contained inside a given node", function(){
			expect(luga.form.toQueryString(document.getElementById("basicValue"))).toEqual("firstname=ciccio&lastname=pasticcio&radio=yes");
			expect(luga.form.toQueryString(document.getElementById("basicNoValue"))).toEqual("firstname=&lastname=");
		});

		it("Throws an exception if the given node does not exists", function(){
			expect(function(){
				luga.form.toQueryString(document.getElementById("missing"));
			}).toThrow();
		});

		it("Ignores unsuccessful fields", function(){
			expect(luga.form.toQueryString(document.getElementById("unsuccessfulFields"))).toEqual("firstname=ciccio");
		});

		it("Names and values are URI encoded", function(){
			expect(luga.form.toQueryString(document.getElementById("encodedValue"))).toEqual("firstname=ciccio&slash=%2F&ampersand=%26");
		});

		it("Values of multiple checked checkboxes are included as multiple value/pairs", function(){
			expect(luga.form.toQueryString(document.getElementById("multiBox"))).toEqual("firstname=ciccio&box=first&box=second&box=fourth");
		});

		it("Values of multiple select are included as multiple value/pairs", function(){
			expect(luga.form.toQueryString(document.getElementById("multiSelect"))).toEqual("firstname=ciccio&select=first&select=second");
		});

		it("If the second argument is set to true, MS Word's special chars are replaced with plausible substitutes", function(){
			var moronicStr = String.fromCharCode(8216) + String.fromCharCode(8220);
			document.getElementById("moronicValue").value = moronicStr;
			expect(luga.form.toQueryString(document.getElementById("moronicForm"), true)).toEqual("firstname=ciccio&moronicValue='%22");
		});

	});

	describe(".toMap()", function(){

		beforeEach(function(){
			jasmineFixtures.loadHTML("form/common.htm");
		});

		it("Return a JavaScript object containing name/value pairs from fields contained inside a given node", function(){
			expect(luga.form.toMap(document.getElementById("basicValue"))).toEqual({
				firstname: "ciccio",
				lastname: "pasticcio",
				radio: "yes"
			});
			expect(luga.form.toMap(document.getElementById("basicNoValue"))).toEqual({firstname: "", lastname: ""});
		});

		it("Throws an exception if the given node does not exists", function(){
			expect(function(){
				luga.form.toMap(document.getElementById("missing"));
			}).toThrow();
		});

		it("Ignores unsuccessful fields", function(){
			expect(luga.form.toMap(document.getElementById("unsuccessfulFields"))).toEqual({firstname: "ciccio"});
		});

		it("Values of multiple checked checkboxes are included as a single entry, with array value", function(){
			expect(luga.form.toMap(document.getElementById("multiBox"))).toEqual({
				firstname: "ciccio",
				box: ["first", "second", "fourth"]
			});
		});

		it("Values of multiple select are included as a single entry, with comma-delimited value", function(){
			expect(luga.form.toMap(document.getElementById("multiSelect"))).toEqual({firstname: "ciccio", select: ["first", "second"]});
		});

		it("If the second argument is set to true, MS Word's special chars are replaced with plausible substitutes", function(){
			var moronicStr = String.fromCharCode(8230);
			document.getElementById("moronicValue").value = moronicStr;
			expect(luga.form.toMap(document.getElementById("moronicForm"), true)).toEqual({firstname: "ciccio", moronicValue: "..."});
		});

	});

	describe(".toJson()", function(){

		beforeEach(function(){
			jasmineFixtures.loadHTML("form/tojson.htm");
		});

		it("Given a form tag or another element wrapping input fields, serialize them into JSON data", function(){
			expect(luga.form.toJson(document.getElementById("basicValue"))).toEqual({
				person: {
					firstname: "ciccio",
					lastname: "pasticcio"
				},
				radio: "yes"
			});
			expect(luga.form.toJson(document.getElementById("basicNoValue"))).toEqual({
				person: {
					firstname: "",
					lastname: ""
				}
			});
		});

		it("Throws an exception if the given node does not exists", function(){
			expect(function(){
				luga.form.toJson(document.getElementById("missing"));
			}).toThrow();
		});

		it("Ignores unsuccessful fields", function(){
			expect(luga.form.toJson(document.getElementById("unsuccessfulFields"))).toEqual({
				person: {
					firstname: "ciccio"
				}
			});
		});

		it("Values of multiple checked checkboxes are included as a single entry, with array value", function(){
			expect(luga.form.toJson(document.getElementById("multiBox"))).toEqual({
				person: {
					firstname: "ciccio"
				},
				box: ["first", "second"]
			});
		});

		it("Values of multiple select are included as a single entry, with comma-delimited value", function(){
			expect(luga.form.toJson(document.getElementById("multiSelect"))).toEqual({
				person: {
					firstname: "ciccio"
				},
				select: ["first", "second"]
			});
		});

		it("Requires luga.form.toMap() in order to work", function(){
			spyOn(luga.form, "toMap");
			luga.form.toJson(document.getElementById("basicValue"));
			expect(luga.form.toMap).toHaveBeenCalledWith(document.getElementById("basicValue"));
		});

	});

	describe(".utils", function(){

		it("Contains form-related, static methods and utilities", function(){
			expect(luga.form.utils).toBeDefined();
		});

		describe(".getFieldGroup()", function(){

			describe("Extracts group of fields that share the same name from", function(){

				it("A given root node", function(){
					jasmineFixtures.loadHTML("validator/RadioValidator/required.htm");
					expect(luga.form.utils.getFieldGroup("lady", jQuery("#single")).length).toEqual(4);
				});

				it("Or the whole document if the second argument is not passed", function(){
					jasmineFixtures.loadHTML("validator/RadioValidator/required.htm");
					expect(luga.form.utils.getFieldGroup("lady").length).toEqual(12);
				});

				it("Even if the name attribute contains invalid characters", function(){
					jasmineFixtures.loadHTML("form/common.htm");
					expect(luga.form.utils.getFieldGroup("specChars(_[here]").length).toEqual(4);
				});

			});

		});

		describe(".getChildFields()", function(){

			it("Return an array of input fields contained inside a given root node", function(){
				jasmineFixtures.loadHTML("validator/FormValidator/generic.htm");
				expect(luga.form.utils.getChildFields(document.getElementById("generic")).length).toEqual(15);
			});

			it("Return an empty array if there are no suitable input fields", function(){
				jasmineFixtures.loadHTML("validator/FormValidator/generic.htm");
				expect(luga.form.utils.getChildFields(document.getElementById("food")).length).toEqual(0);
			});

		});

		describe(".isInputField()", function(){

			it("Return true if the passed node is a form field that we care about", function(){
				expect(luga.form.utils.isInputField(document.createElement("textarea"))).toEqual(true);

				var text = document.createElement("input")
				text.setAttribute("type", "text");
				expect(luga.form.utils.isInputField(text)).toEqual(true);

				var radio = document.createElement("input")
				radio.setAttribute("type", "radio");
				expect(luga.form.utils.isInputField(radio)).toEqual(true);

				var checkbox = document.createElement("input")
				checkbox.setAttribute("type", "checkbox");
				expect(luga.form.utils.isInputField(checkbox)).toEqual(true);

				var email = document.createElement("input")
				email.setAttribute("type", "email");
				expect(luga.form.utils.isInputField(email)).toEqual(true);

				var date = document.createElement("input")
				date.setAttribute("type", "date");
				expect(luga.form.utils.isInputField(date)).toEqual(true);

				var submit = document.createElement("input")
				submit.setAttribute("type", "submit");
				expect(luga.form.utils.isInputField(submit)).toEqual(true);

				var button = document.createElement("input")
				button.setAttribute("type", "button");
				expect(luga.form.utils.isInputField(button)).toEqual(true);

				expect(luga.form.utils.isInputField(document.createElement("button"))).toEqual(true);

				expect(luga.form.utils.isInputField(document.createElement("select"))).toEqual(true);
			});

			it("False otherwise", function(){
				expect(luga.form.utils.isInputField(document.createElement("div"))).toEqual(false);
				expect(luga.form.utils.isInputField(document.createElement("form"))).toEqual(false);
				var reset = document.createElement("input")
				reset.setAttribute("type", "reset");
				expect(luga.form.utils.isInputField(reset)).toEqual(false);
				expect(luga.form.utils.isInputField(document.createElement("fieldset"))).toEqual(false);
			});

		});

		describe(".isSuccessfulField()", function(){

			it("Return false if the field is disabled", function(){
				var input = document.createElement("input");
				input.setAttribute("name", "b");
				input.setAttribute("disabled", "disabled");
				input.setAttribute("type", "text");
				expect(luga.form.utils.isSuccessfulField(input)).toEqual(false);
			});

			it("Return true if the given field is successful", function(){
				var textarea = document.createElement("textarea");
				textarea.setAttribute("name", "a");
				expect(luga.form.utils.isSuccessfulField(textarea)).toEqual(true);

				var text = document.createElement("input");
				text.setAttribute("name", "b");
				text.setAttribute("type", "text");
				expect(luga.form.utils.isSuccessfulField(text)).toEqual(true);

				var radio = document.createElement("input");
				radio.setAttribute("name", "c");
				radio.setAttribute("type", "radio");
				expect(luga.form.utils.isSuccessfulField(radio)).toEqual(true);

				var checkbox = document.createElement("input");
				checkbox.setAttribute("name", "c");
				checkbox.setAttribute("type", "checkbox");
				expect(luga.form.utils.isSuccessfulField(checkbox)).toEqual(true);

				var email = document.createElement("input");
				email.setAttribute("name", "e");
				email.setAttribute("type", "email");
				expect(luga.form.utils.isSuccessfulField(email)).toEqual(true);

				var date = document.createElement("input");
				date.setAttribute("name", "f");
				date.setAttribute("type", "date");
				expect(luga.form.utils.isSuccessfulField(date)).toEqual(true);

				var submit = document.createElement("input");
				submit.setAttribute("name", "g");
				submit.setAttribute("type", "submit");
				expect(luga.form.utils.isSuccessfulField(submit)).toEqual(true);

				var inputButton = document.createElement("input");
				inputButton.setAttribute("name", "h");
				inputButton.setAttribute("type", "button");
				expect(luga.form.utils.isSuccessfulField(inputButton)).toEqual(true);

				var button = document.createElement("button");
				button.setAttribute("name", "i");
				expect(luga.form.utils.isSuccessfulField(button)).toEqual(true);

				var select = document.createElement("select");
				select.setAttribute("name", "l");
				expect(luga.form.utils.isSuccessfulField(select)).toEqual(true);
			});

			it("False otherwise", function(){
				expect(luga.form.utils.isSuccessfulField(document.createElement("div"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(document.createElement("form"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(document.createElement("button"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(document.createElement("select"))).toEqual(false);
				expect(luga.form.utils.isSuccessfulField(document.createElement("textarea"))).toEqual(false);

				var submit = document.createElement("input");
				submit.setAttribute("type", "submit");
				expect(luga.form.utils.isSuccessfulField(submit)).toEqual(false);

				var text = document.createElement("input");
				text.setAttribute("type", "text");
				expect(luga.form.utils.isSuccessfulField(text)).toEqual(false);

				var reset = document.createElement("input");
				reset.setAttribute("type", "reset");
				expect(luga.form.utils.isSuccessfulField(reset)).toEqual(false);

				var namedReset = document.createElement("input");
				namedReset.setAttribute("type", "reset");
				namedReset.setAttribute("name", "test");
				expect(luga.form.utils.isSuccessfulField(namedReset)).toEqual(false);

				expect(luga.form.utils.isSuccessfulField(document.createElement("fieldset"))).toEqual(false);
			});

		});

	});

});