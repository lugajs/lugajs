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

	describe(".lookup(). Given the name of a function as a string", function(){

		it("Returns the relevant function if it finds it inside the window/global scope", function(){
			window.myFunc = function(){
			};
			var result = luga.lookup("myFunc");
			expect(result).not.toBeNull();
			expect(jQuery.isFunction(result)).toBeTruthy();
		});

		it("Or any namespace", function(){
			var mySpace = {};
			mySpace.myFunction = function(){
			};
			var result = luga.lookup("luga.namespace");
			expect(result).not.toBeNull();
			expect(jQuery.isFunction(result)).toBeTruthy();
		});

		it("Returns null if the function does not exist", function(){
			expect(luga.lookup("missing")).toBeNull();
		});

		it("Or if the variable exists, but it's not a function", function(){
			window.str = "ciao";
			expect(luga.lookup("str")).toBeNull();
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
				notifierObj.addObserver(observerObj);
				expect(observerObj.completeFlag).toEqual(false);

				notifierObj.notifyObservers("complete", {flag: true});
				expect(observerObj.completeFlag).toEqual(true);
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