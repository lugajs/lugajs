describe("luga", function(){

	"use strict";

	it("Requires jQuery in order to work", function(){
		expect(jQuery).toBeDefined();
	});

	it("Lives inside its own namespace", function(){
		expect(luga).toBeDefined();
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.version).toBeDefined();
		});
	});

	describe(".namespace()", function(){

		it("Creates namespaces to be used for scoping variables and classes", function(){
			luga.namespace("myNamespace");
			expect(myNamespace).toBeDefined();
		});

		it("Does not override existing namespaces", function(){
			var testRoot = {};
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
			var testRoot = {};
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

			var nicole = new Superstar("female", "Nicole Kidman");

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
				var result = luga.lookupFunction("MyLookup");
				expect(result).not.toBeUndefined();
				expect(jQuery.isFunction(result)).toEqual(true);
			});

			it("Or any given namespace (if the fully qualified name is passed)", function(){
				window.myLookUpSpace = {};
				myLookUpSpace.myFunction = function(){
				};
				var result = luga.lookupFunction("myLookUpSpace.myFunction");
				expect(result).not.toBeUndefined();
				expect(jQuery.isFunction(result)).toEqual(true);
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

			it("Returns the propetry's value if it is available at the given path", function(){
				expect(luga.lookupProperty({key: "test"}, "key")).toEqual("test");
			});

			it("Supports unlimited nesting levels (if the fully qualified path is passed)", function(){
				var target = {
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
			var config = {letter: "a", number: 1};
			var params = {number: 2, symbol: "@"};
			luga.merge(config, params);
			expect(config).toEqual({letter: "a", number: 2, symbol: "@"});
		});

	});

	describe(".setProperty()", function(){

		describe("Given an object, a path and a value", function(){

			var targetObj;
			beforeEach(function(){

				targetObj = {
					firstName: "Ciccio",
					children: [],
					firstLevel: {
						secondLevel: "Second"
					}
				};

			});

			it("Set the property located at the given path to the given value", function(){
				luga.setProperty(targetObj, "lastName", "Pasticcio");
				expect(targetObj.lastName).toEqual("Pasticcio");
				luga.setProperty(targetObj, "firstLevel.moreSecond", "more");
				expect(targetObj.firstLevel.moreSecond).toEqual("more");
			});
			it("If the path does not exists, it creates it", function(){
				luga.setProperty(targetObj, "first.second.third", 3);
				expect(targetObj.first.second.third).toEqual(3);
			});
			it("Works on empty objects too", function(){
				var storage = {};
				luga.setProperty(storage, "first.second.third", 3);
				expect(storage.first.second.third).toEqual(3);
			});

		});

	});

	describe(".type()", function(){

		describe("Mimic jQuery.type() delivering the following results", function(){

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
				var test = {}
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


	describe(".Notifier", function(){
		var notifierObj, observerObj, uselessObj;

		beforeEach(function(){

			var NotifierClass = function(){
				luga.extend(luga.Notifier, this);
			};
			var ObserverClass = function(){
				this.onCompleteHandler = function(data){
				};
				this.onSomethingHandler = function(){
				};
			};
			var UselessObserverClass = function(){
			};
			notifierObj = new NotifierClass();
			observerObj = new ObserverClass();
			uselessObj = new UselessObserverClass();
		});

		it("Is an interface class, it can only be used as a base class", function(){
			expect(jQuery.isFunction(luga.Notifier)).toEqual(true);
		});

		it("Throws an exception if instantiated directly", function(){
			expect(function(){
				new luga.Notifier();
			}).toThrow();
		});

		describe(".observers", function(){

			it("Is an array", function(){
				expect(jQuery.isArray(notifierObj.observers)).toEqual(true);
				expect(notifierObj.observers.length).toEqual(0);
			});

			it("That contains all the observers", function(){
				notifierObj.addObserver(observerObj);
				expect(notifierObj.observers[0]).toEqual(observerObj);
			});

		});

		describe(".addObserver()", function(){

			it("Adds an observer object to the list of observers", function(){
				notifierObj.addObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(1);
				notifierObj.addObserver(uselessObj);
				expect(notifierObj.observers.length).toEqual(2);
			});

			it("Ensures that only objects are register as observers", function(){
				expect(function(){
					notifierObj.addObserver("test");
				}).toThrow();
			});

		});

		describe(".notifyObserver()", function(){

			it("Is used to send a notification to all registered observers", function(){
				spyOn(observerObj, "onCompleteHandler").and.callFake(function(){
				});
				notifierObj.addObserver(observerObj);
				notifierObj.notifyObservers("complete", {});
				expect(observerObj.onCompleteHandler).toHaveBeenCalled();
			});

			it("Requires two parameters: eventName and data. Both are required", function(){
				expect(function(){
					notifierObj.notifyObservers("complete");
				}).toThrow();
			});

			it("The data parameter must be an object", function(){
				expect(function(){
					notifierObj.notifyObservers("complete", "ciao");
				}).toThrow();
			});

			it("Observers must follow a naming convention. For an event named 'complete' they must implement a method named: 'onCompleteHandler'", function(){
				notifierObj.addObserver(observerObj);
				spyOn(observerObj, "onCompleteHandler").and.callFake(function(){
				});
				spyOn(observerObj, "onSomethingHandler").and.callFake(function(){
				});

				notifierObj.notifyObservers("complete", {});
				expect(observerObj.onCompleteHandler).toHaveBeenCalled();
				expect(observerObj.onSomethingHandler).not.toHaveBeenCalled();
			});

			it("The data parameter provides a means for passing data from the point of notification to all interested observers", function(){
				spyOn(observerObj, "onCompleteHandler").and.callFake(function(){
				});
				notifierObj.addObserver(observerObj);
				notifierObj.notifyObservers("complete", {flag: true});
				expect(observerObj.onCompleteHandler).toHaveBeenCalledWith({flag: true});
			});

		});

		describe(".removeObserver()", function(){

			it("Removes the given observer object", function(){
				notifierObj.addObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(1);
				notifierObj.removeObserver({});
				expect(notifierObj.observers.length).toEqual(1);
				notifierObj.removeObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(0);
			});

		});

	});

});