"use strict";

describe("luga", function(){

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

	describe(".lookup()", function(){

		describe("Given the name of a function as a string", function(){

			it("Returns the relevant function if it finds it inside the window/global scope", function(){
				window.MyLookup = function(){
				};
				var result = luga.lookup("MyLookup");
				expect(result).not.toBeNull();
				expect(jQuery.isFunction(result)).toBeTruthy();
			});

			it("Or any given namespace (if the fully qualified name is passed)", function(){
				window.myLookUpSpace = {};
				myLookUpSpace.myFunction = function(){
				};
				var result = luga.lookup("myLookUpSpace.myFunction");
				expect(result).not.toBeNull();
				expect(jQuery.isFunction(result)).toBeTruthy();
			});

			it("Returns null if the function does not exist", function(){
				expect(luga.lookup("missing")).toBeNull();
			});

			it("Or if a corresponding variable exists, but it's not a function", function(){
				window.str = "ciao";
				expect(luga.lookup("str")).toBeNull();
			});

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

		it("Is an interface class that cannot be instantiated directly, it can only be used as a base class", function(){
			expect(jQuery.isFunction(luga.Notifier)).toBeTruthy();

			expect(function(){
				new luga.Notifier();
			}).toThrow();
		});

		describe(".observers", function(){

			it("Is an array", function(){
				expect(jQuery.isArray(notifierObj.observers)).toBeTruthy();
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

		describe('.removeObserver()', function(){

			it('Removes the given observer object.', function(){
				notifierObj.addObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(1);
				notifierObj.removeObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(0);
			});

		});

	});

});