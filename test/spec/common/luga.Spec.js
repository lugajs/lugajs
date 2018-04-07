describe("luga", function(){

	"use strict";

	it("Lives inside its own namespace", function(){
		expect(luga).toBeDefined();
	});

	describe(".common.version", function(){
		it("Reports the current version number", function(){
			expect(luga.common.version).toBeDefined();
		});
	});

	describe(".namespace()", function(){

		it("Creates namespaces to be used for scoping variables and classes", function(){
			luga.namespace("myNamespace");
			expect(myNamespace).toBeDefined();
		});

		it("Does not override existing namespaces", function(){
			const testRoot = {};
			testRoot.child = {};
			testRoot.child.grandChild = {};
			luga.namespace("child", testRoot);
			expect(testRoot.child.grandChild).toBeDefined();
		});

		it("By default uses window as root object", function(){
			luga.namespace("ciccio");
			expect(window.ciccio).toBeDefined();
		});

		it("Accept a second argument to be used as root object", function(){
			const testRoot = {};
			luga.namespace("child", testRoot);
			expect(testRoot.child).toBeDefined();
		});

	});

	describe(".extend()", function(){

		it("Offers a simple solution for inheritance among classes", function(){

			/* Class Person. */
			function Person(gender){
				this.gender = gender;
				this.getGender = function(){
					return this.gender;
				};
			}

			/* Class Superstar */
			function Superstar(gender, name){
				luga.extend(Person, this, arguments);
				this.gender = gender;
				this.name = name;
				this.getName = function(){
					return this.name;
				};
			}

			const nicole = new Superstar("female", "Nicole Kidman");

			expect(nicole.getGender()).toEqual("female");
			expect(nicole.getName()).toEqual("Nicole Kidman");
		});

	});

	describe(".isPlainObject()", function(){

		it("Return true if an object is a plain object (created using '{}' or 'new Object')", function(){
			expect(luga.isPlainObject({})).toEqual(true);
			expect(luga.isPlainObject(new Object())).toEqual(true);
			expect(luga.isPlainObject(Object.create(null))).toEqual(true);
		});

		it("Return false otherwise", function(){
			expect(luga.isPlainObject()).toEqual(false);
			expect(luga.isPlainObject("test")).toEqual(false);
			expect(luga.isPlainObject(3)).toEqual(false);
			expect(luga.isPlainObject(document)).toEqual(false);
		});

	});

	describe(".lookupFunction()", function(){

		describe("Given the name of a function as a string", function(){

			it("Returns the relevant function if it is available inside the window/global scope", function(){
				window.MyLookup = function(){
				};
				const result = luga.lookupFunction("MyLookup");
				expect(result).not.toBeUndefined();
				expect(luga.type(result)).toEqual("function");
			});

			it("Or any given namespace (if the fully qualified name is passed)", function(){
				window.myLookUpSpace = {};
				myLookUpSpace.myFunction = function(){
				};
				const result = luga.lookupFunction("myLookUpSpace.myFunction");
				expect(result).not.toBeUndefined();
				expect(luga.type(result)).toEqual("function");
			});

			describe("Returns undefined if:", function(){

				it("The function does not exist", function(){
					expect(luga.lookupFunction("missing")).toBeUndefined();
				});

				it("A corresponding object exists, but it's not a function", function(){
					window.str = "ciao";
					expect(luga.lookupFunction("str")).toBeUndefined();
				});

				it("The name is undefined, null or an empty string", function(){
					expect(luga.lookupFunction()).toBeUndefined();
					expect(luga.lookupFunction(null)).toBeUndefined();
					expect(luga.lookupFunction("")).toBeUndefined();
				});

			});

		});

	});

	describe(".lookupProperty()", function(){

		describe("Given an object and the path of a property as a string", function(){

			it("Returns the property value if it is available at the given path", function(){
				expect(luga.lookupProperty({key: "test"}, "key")).toEqual("test");
			});

			it("Supports unlimited nesting levels (if the fully qualified path is passed)", function(){
				const target = {
					firstLevel: {
						secondLevel: {
							message: "Ciao Mamma!"
						}
					}
				};
				expect(luga.lookupProperty(target, "firstLevel.secondLevel.message")).toEqual("Ciao Mamma!");
			});

			describe("Returns undefined if:", function(){

				it("The property does not exist", function(){
					expect(luga.lookupProperty({}, "missing")).toBeUndefined();
				});

				it("The object is undefined, null or an empty string", function(){
					expect(luga.lookupProperty()).toBeUndefined();
					expect(luga.lookupProperty(null)).toBeUndefined();
					expect(luga.lookupProperty("")).toBeUndefined();
				});

				it("The path is undefined, null or an empty string", function(){
					expect(luga.lookupProperty({})).toBeUndefined();
					expect(luga.lookupProperty({}, null)).toBeUndefined();
					expect(luga.lookupProperty({}, "")).toBeUndefined();
				});

			});

		});

	});

	describe(".merge()", function(){

		it("Shallow-merges the contents of two objects together into the first object", function(){
			const config = {letter: "a", number: 1};
			const params = {number: 2, symbol: "@"};
			luga.merge(config, params);
			expect(config).toEqual({letter: "a", number: 2, symbol: "@"});
		});

		it("Does not copy properties inherited through the prototype chain", function(){
			const config = {};

			const Person = function(name){
				this.name = name;
			};
			Person.prototype.greet = function(){
				console.log("Hello!");
			};

			const Tester = function(name){
				Person.call(this, name);
			};
			Tester.prototype = Object.create(Person.prototype);
			Tester.prototype.tool = "Jasmine";

			const params = new Tester("Ciccio");

			luga.merge(config, params);
			expect(config.greet).toBeUndefined();
			expect(config.name).toEqual("Ciccio");
		});

		describe("Works if the target object is", function(){

			it("A complex object", function(){
				const target = {name: "Ciccio", friends: [{name: "Franco"}, {name: "Federico"}]};
				const params = {number: 2, symbol: "@"};
				luga.merge(target, params);
				expect(target).toEqual({
					name: "Ciccio",
					number: 2,
					symbol: "@",
					friends: [{name: "Franco"}, {name: "Federico"}]
				});
			});

			it("An Array", function(){
				const target = [];
				const params = {number: 2, symbol: "@"};
				luga.merge(target, params);
				expect(target.number).toEqual(2);
				expect(target.symbol).toEqual("@");
			});

		});

	});

	describe(".setProperty()", function(){

		describe("Given an object, a path and a value", function(){

			let targetObj;
			beforeEach(function(){

				targetObj = {
					firstName: "Ciccio",
					children: [],
					firstLevel: {
						secondLevel: "Second"
					}
				};

			});

			it("Set or update the property located at the given path to the given value", function(){
				luga.setProperty(targetObj, "firstName", "Cicciuzzo");
				expect(targetObj.firstName).toEqual("Cicciuzzo");

				luga.setProperty(targetObj, "lastName", "Pasticcio");
				expect(targetObj.lastName).toEqual("Pasticcio");

				luga.setProperty(targetObj, "firstLevel.moreSecond", "more");
				expect(targetObj.firstLevel.moreSecond).toEqual("more");
			});
			it("If the path does not exists, it creates it", function(){
				luga.setProperty(targetObj, "first.second.third", 3);
				expect(targetObj.first.second.third).toEqual(3);
				luga.setProperty(targetObj, "first.second.third", 1);
				expect(targetObj.first.second.third).toEqual(1);
			});
			it("Works on empty objects too", function(){
				const storage = {};
				luga.setProperty(storage, "first.second.third", 3);
				expect(storage.first.second.third).toEqual(3);
			});

		});

	});

	describe(".toQueryString()", function(){

		it("Throws an exception if the given input is not a plain object", function(){
			expect(function(){
				luga.toQueryString(new Date());
			}).toThrow();
			expect(function(){
				luga.toQueryString("Test");
			}).toThrow();
			expect(function(){
				luga.toQueryString({msg: "test"});
			}).not.toThrow();
		});

		it("Create a query string out of a plain object containing name/value pairs", function(){
			expect(luga.toQueryString({mixedCase: "Test"})).toEqual("mixedCase=Test");
			const plainObj = {
				first: "primo",
				second: "secondo",
				third: "terzo"
			};
			expect(luga.toQueryString(plainObj)).toEqual("first=primo&second=secondo&third=terzo");
		});

		it("Array properties are serialized as multiple value/pairs", function(){
			const person = {
				name: "Massimo",
				lastName: "Foti",
				nationalities: ["Italian", "Swiss"]
			};
			expect(luga.toQueryString(person)).toEqual("name=Massimo&lastName=Foti&nationalities=Italian&nationalities=Swiss");
		});

	});

	describe(".type()", function(){

		describe("Determine the internal JavaScript [[Class]] of an object. Delivering the following results", function(){

			it("luga.type(null) === 'null'", function(){
				expect(luga.type(null)).toEqual("null");
			});

			it("luga.type(undefined) === 'undefined'", function(){
				expect(luga.type(undefined)).toEqual("undefined");
			});

			it("luga.type() === 'undefined'", function(){
				expect(luga.type()).toEqual("undefined");
			});

			it("luga.type(obj.notDefined) === 'undefined'", function(){
				const test = {};
				expect(luga.type(test.notDefined)).toEqual("undefined");
			});

			it("luga.type(true) === 'boolean'", function(){
				expect(luga.type(true)).toEqual("boolean");
				expect(luga.type(false)).toEqual("boolean");
			});

			it("luga.type(new Boolean()) === 'boolean'", function(){
				expect(luga.type(new Boolean())).toEqual("boolean");
			});

			it("luga.type(3) === 'number'", function(){
				expect(luga.type(3)).toEqual("number");
				expect(luga.type(-3)).toEqual("number");
				expect(luga.type(0)).toEqual("number");
			});

			it("luga.type(new Number(3)) === 'number'", function(){
				expect(luga.type(new Number(3))).toEqual("number");
			});

			it("luga.type(NaN) === 'number'", function(){
				expect(luga.type(NaN)).toEqual("number");
			});

			it("luga.type('test') === 'string'", function(){
				expect(luga.type("test")).toEqual("string");
				expect(luga.type("")).toEqual("string");
			});

			it("luga.type(new String('text')) === 'string'", function(){
				expect(luga.type(new String("test"))).toEqual("string");
				expect(luga.type(new String(""))).toEqual("string");
			});

			it("luga.type(function(){}) === 'function'", function(){
				expect(luga.type(function(){
				})).toEqual("function");
			});

			it("luga.type([]) === 'array'", function(){
				expect(luga.type([])).toEqual("array");
			});

			it("luga.type(new Array()) === 'array'", function(){
				expect(luga.type(new Array())).toEqual("array");
			});

			it("luga.type(new Date()) === 'date'", function(){
				expect(luga.type(new Date())).toEqual("date");
			});

			it("luga.type(new Error()) === 'error'", function(){
				expect(luga.type(new Error())).toEqual("error");
			});

			it("luga.type(/test/) === 'regexp'", function(){
				expect(luga.type(/test/)).toEqual("regexp");
			});

		});

	});

});