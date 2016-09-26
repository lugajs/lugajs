describe("luga.string", function(){

	"use strict";

	it("Contains string-related API", function(){
		expect(luga.string).toBeDefined();
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

	describe(".format()", function(){

		describe("Given a string containing placeholders", function(){

			it("It assembles a new string replacing the placeholders with the strings contained inside the second argument", function(){
				expect(luga.string.format("My name is {0}", ["Ciccio"])).toEqual("My name is Ciccio");
			});
			it("The string can contains multiple instances of the same placeholder", function(){
				expect(luga.string.format("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
			});
			it("If no matching placeholder is find, return the original string", function(){
				expect(luga.string.format("This {str}", {another: "test"})).toEqual("This {str}");
			});

		});

		describe("The second argument can be either:", function(){

			describe("An array:", function(){

				it("In which case placeholders need to be in {index} format", function(){
					expect(luga.string.format("My name is {0} {1}", ["Ciccio", "Pasticcio"])).toEqual("My name is Ciccio Pasticcio");
					expect(luga.string.format("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
				});

			});

			describe("An object containing name/value pairs:", function(){

				it("In which case placeholders need to be in {key} format", function(){
					expect(luga.string.format("My name is {firstName} {lastName}", {
						firstName: "Ciccio",
						lastName: "Pasticcio"
					})).toEqual("My name is Ciccio Pasticcio");
					expect(luga.string.format("This {str} is just a {str}", {str: "test"})).toEqual("This test is just a test");
				});

			});

		});
	});

	describe(".queryToHash()", function(){

		describe("Given a string in querystring format, return an object containing name/value pairs", function(){

			it("A '?' at the beginning of the string is ignored", function(){
				expect(luga.string.queryToHash("?name=Ciccio&lastname=Pasticcio")).toEqual({
					name: "Ciccio",
					lastname: "Pasticcio"
				});
				expect(luga.string.queryToHash("name=Ciccio&lastname=Pasticcio")).toEqual({
					name: "Ciccio",
					lastname: "Pasticcio"
				});
			});
			it("If a name has no associated value, the hash contains an entry with an empty string value", function(){
				expect(luga.string.queryToHash("?name=Ciccio&lastname=")).toEqual({name: "Ciccio", lastname: ""});
				expect(luga.string.queryToHash("?name=Ciccio&lastname")).toEqual({name: "Ciccio", lastname: ""});
			});
			it("Names and values are URI decoded", function(){
				expect(luga.string.queryToHash("name=Ciccio&slash=%2F&ampersand=%26")).toEqual({
					name: "Ciccio",
					slash: "/",
					ampersand: "&"
				});
			});
			it("If the same name is contained multiple times inside the queryString, the matching entry inside the hash is an array", function(){
				expect(luga.string.queryToHash("name=Ciccio&box=first&box=second&box=third")).toEqual({
					name: "Ciccio",
					box: ["first", "second", "third"]
				});
				expect(luga.string.queryToHash("name=Ciccio&box=first&box=&box=third")).toEqual({
					name: "Ciccio",
					box: ["first", "", "third"]
				});
			});
			it("If the given string is empty, an empty hash is returned", function(){
				expect(luga.string.queryToHash("")).toEqual({});
			});
			it("If the given string is '?', an empty hash is returned", function(){
				expect(luga.string.queryToHash("?")).toEqual({});
			});

		});

	});

	describe(".populate()", function(){

		describe("Given a string containing placeholders in {placeholder} format", function(){

			it("It assembles a new string replacing the placeholders with the strings contained inside the second argument", function(){
				expect(luga.string.populate("My name is {name}", {name: "Ciccio"})).toEqual("My name is Ciccio");
			});
			it("The string can contains multiple instances of the same placeholder", function(){
				expect(luga.string.populate("This {key} is just a {key}", {key: "test"})).toEqual("This test is just a test");
			});
			it("If no matching placeholder is find, return the original string", function(){
				expect(luga.string.populate("This {missing}", {another: "test"})).toEqual("This {missing}");
			});
			it("If the second argument is not an object, return the original string", function(){
				expect(luga.string.populate("This {missing}", "ciao mamma")).toEqual("This {missing}");
			});

		});

		describe("The second argument is:", function(){

			describe("An object containing keys:", function(){

				it("Placeholders must match a key", function(){
					expect(luga.string.populate("My name is {firstName} {lastName}", {
						firstName: "Ciccio",
						lastName: "Pasticcio"
					})).toEqual("My name is Ciccio Pasticcio");
				});

				it("Placeholders can match nested properties too {placeholder.key}", function(){
					var nestedObj = {
						type: "people",
						person: {
							firstName: "Ciccio",
							lastName: "Pasticcio"
						}
					};
					expect(luga.string.populate("My name is {person.firstName} {person.lastName}", nestedObj)).toEqual("My name is Ciccio Pasticcio");
				});

			});

		});
	});

});