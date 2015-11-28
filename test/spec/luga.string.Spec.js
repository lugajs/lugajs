describe("luga.string", function(){

	"use strict";

	it("Contains string-related API", function(){
		expect(luga.string).toBeDefined();
	});

	describe(".format()", function(){

		describe("Given a string containing placeholders", function(){

			it("It assembles a new string replacing the placeholders with the strings contained inside the second argument", function(){
				expect(luga.string.format("My name is {0}", ["Ciccio"])).toEqual("My name is Ciccio");
			});
			it("The string can contains multiple instances of the same placeholder", function(){
				expect(luga.string.format("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
			});
			it("If no matching placeholder is find, the original string will be returned", function(){
				expect(luga.string.format("This {str}", {another: "test"})).toEqual("This {str}");
			});

		});

		describe("The second argument can be either:", function(){

			describe("An array:", function(){

				it("In which case placeholders need to be numbers", function(){
					expect(luga.string.format("My name is {0} {1}", ["Ciccio", "Pasticcio"])).toEqual("My name is Ciccio Pasticcio");
					expect(luga.string.format("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
				});

			});

			describe("An object containing name/value pairs:", function(){

				it("In which case placeholders need to be keys", function(){
					expect(luga.string.format("My name is {firstName} {lastName}", {
						firstName: "Ciccio",
						lastName: "Pasticcio"
					})).toEqual("My name is Ciccio Pasticcio");
					expect(luga.string.format("This {str} is just a {str}", {str: "test"})).toEqual("This test is just a test");
				});

			});

		});
	});

	describe(".demoronize()", function(){

		describe("Given a string", function(){

			it("Replace MS Word's non-ISO characters with plausible substitutes", function(){
				var crappyStr = String.fromCharCode(710);
				crappyStr += String.fromCharCode(732);
				crappyStr += String.fromCharCode(8216);
				crappyStr += String.fromCharCode(8217);
				crappyStr += String.fromCharCode(8220);
				crappyStr += String.fromCharCode(8221);
				crappyStr += String.fromCharCode(8211);
				crappyStr += String.fromCharCode(8230);
				var cleanStr = "^~''\"\"-...";
				expect(luga.string.demoronize(crappyStr)).toBe(cleanStr);
			});
		});

	});

});