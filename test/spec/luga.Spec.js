/*global luga, it, describe, expect, beforeEach, spyOn */

"use strict";

describe("luga", function(){

	it("Requires jQuery in order to work", function(){
		expect(jQuery).toBeDefined();
	});

	it("Lives inside its own namespace", function(){
		expect(luga).toBeDefined();
	});

	describe(".namespace()", function(){

		it("Does not override existing namespaces", function(){
			var testRoot = {};
			testRoot.child = {};
			testRoot.child.grandChild = {};
			luga.namespace("child", testRoot);
			expect(testRoot.child.grandChild).toBeDefined();
		});

		it("By default uses window as root object", function(){
			luga.namespace("ciccio");
			expect(ciccio).toBeDefined();
		});

		it("But works on any arbitrary root object", function(){
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
			expect(nicole.getName()).toEqual("Nicole Kidman")
		});

	});

	describe(".merge()", function(){

		it("Merges the contents of two objects together into the first object", function(){
			var config = {letter: "a", number: 1};
			var params = {number: 2, symbol: "@"};
			luga.merge(config, params);
			expect(config).toEqual({letter: "a", number: 2, symbol: "@"});
		});

	});

	describe(".Notifier", function(){
		var notifierObj, observerObj, uselessObj;

		beforeEach(function(){

			var NotifierClass = function(){
				luga.extend(luga.Notifier, this);
			};
			var ObserverClass = function(){
				this.completeFlag = false;
				this.onCompleteHandler = function(data){
					this.completeFlag = data.flag;
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

		it("Is an interface class that cannot be instantiated directly, it can only be used as a base class", function(){
			expect(jQuery.isFunction(luga.Notifier)).toBeTruthy();

			expect(function(){
				new luga.Notifier();
			}).toThrow();
		});

		it("Observers are stored as an array inside the .observers property", function(){
			expect(jQuery.isArray(notifierObj.observers)).toBeTruthy();
			expect(notifierObj.observers.length).toEqual(0);
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
				notifierObj.addObserver(observerObj);
				spyOn(observerObj, "onCompleteHandler").and.callFake(function(){
				});

				notifierObj.notifyObserver("complete", {});
				expect(observerObj.onCompleteHandler).toHaveBeenCalled();
			});

			it("Requires two parameters: eventName and data. Both are required", function(){
				expect(function(){
					notifierObj.notifyObserver("complete");
				}).toThrow();
			});

			it("The data parameter must be an object", function(){
				expect(function(){
					notifierObj.notifyObserver("complete", "ciao");
				}).toThrow();
			});

			it("Observers must follow a naming convention. For an event named 'complete' they must implement a method named: 'onCompleteHandler'", function(){
				notifierObj.addObserver(observerObj);
				spyOn(observerObj, "onCompleteHandler").and.callFake(function(){
				});
				spyOn(observerObj, "onSomethingHandler").and.callFake(function(){
				});

				notifierObj.notifyObserver("complete", {});
				expect(observerObj.onCompleteHandler).toHaveBeenCalled();
				expect(observerObj.onSomethingHandler).not.toHaveBeenCalled();
			});

			it("The data parameter provides a means for passing data from the point of notification to all interested observers", function(){
				notifierObj.addObserver(observerObj);
				expect(observerObj.completeFlag).toEqual(false);

				notifierObj.notifyObserver("complete", {flag: true});
				expect(observerObj.completeFlag).toEqual(true);
			});

		});

	});

});

describe("luga.utils stores generic, static methods and utilities", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.utils).toBeDefined();
	});

	describe(".formatString()", function(){

		describe("Given a string containing placeholders", function(){

			it("It assembles a new string replacing the placeholders with the strings contained inside the second argument", function(){
				expect(luga.utils.formatString("My name is {0}", ["Ciccio"])).toEqual("My name is Ciccio");
			});
			it("The string can contains multiple instances of the same placeholder", function(){
				expect(luga.utils.formatString("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
			});
			it("If no matching placeholder is find, the original string will be returned", function(){
				expect(luga.utils.formatString("This {str}", { another: "test"})).toEqual("This {str}");
			});

		});

		describe("The second argument can be either:", function(){

			it("An array", function(){
				expect(luga.utils.formatString("My name is {0} {1}", ["Ciccio", "Pasticcio"])).toEqual("My name is Ciccio Pasticcio");
				expect(luga.utils.formatString("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
			});
			it("An object", function(){
				expect(luga.utils.formatString("My name is {firstName} {lastName}", {firstName: "Ciccio", lastName: "Pasticcio"})).toEqual("My name is Ciccio Pasticcio");
				expect(luga.utils.formatString("This {str} is just a {str}", { str: "test"})).toEqual("This test is just a test");
			});

		});
	});

	describe(".stringToFunction(). Given the name of a function as a string", function(){

		it("Returns the relevant function if it finds it inside the window/global scope", function(){
			window.myFunc = function(){
			};
			var result = luga.utils.stringToFunction("myFunc");
			expect(result).not.toBeNull();
			expect(jQuery.isFunction(result)).toBeTruthy();
		});

		it("Returns null if the function does not exist", function(){
			expect(luga.utils.stringToFunction("missing")).toBeNull();
		});

		it("Or if the variable exists, but it's not a function", function(){
			window.str = "ciao";
			expect(luga.utils.stringToFunction("str")).toBeNull();
		});

	});

	describe(".stringDemoronize(). Given a string", function(){

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
			expect(luga.utils.demoronizeString(crappyStr)).toBe(cleanStr);
		});

	});

	describe(".displayMessage()", function(){

		it("Displays a message box above a given node", function(){
			loadFixtures("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(boxNode).not.toExist();
			luga.utils.displayMessage(formNode, "Ciao");
			var boxNode = formNode.prev();
			expect(boxNode).toExist();
			expect(boxNode).toHaveText("Ciao");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayErrorMessage()", function(){

		it("Displays an error box above a given node", function(){
			loadFixtures("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(boxNode).not.toExist();
			luga.utils.displayErrorMessage(formNode, "Error");
			var boxNode = formNode.prev();
			expect(boxNode).toExist();
			expect(boxNode).toHaveText("Error");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
		});

	});

});

describe("luga.validationHandlers", function(){

	it("Is a dedicated namespace", function(){
		expect(luga.validationHandlers).toBeDefined();
	});

	it("That stores handlers for form validation (both client and server-side)", function(){
		expect(luga.validationHandlers.errorAlert).toBeDefined();
		expect(jQuery.isFunction(luga.validationHandlers.errorAlert)).toBeTruthy();
		expect(luga.validationHandlers.errorBox).toBeDefined();
		expect(jQuery.isFunction(luga.validationHandlers.errorBox)).toBeTruthy();
	});

});