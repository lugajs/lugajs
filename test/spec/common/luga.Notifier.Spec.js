describe("luga.Notifier", function(){

	"use strict";

	var notifierObj, observerObj, uselessObj, eventObserverObj;
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

		var EventObserverClass = function(){
			this.firstHandler = function(data){
			};
			this.secondHandler = function(){
			};
		};

		notifierObj = new NotifierClass();
		observerObj = new ObserverClass();
		uselessObj = new UselessObserverClass();
		eventObserverObj = new EventObserverClass();
	});

	it("Is an interface class, it can only be used as a base class", function(){
		expect(luga.type(luga.Notifier)).toEqual("function");
	});

	it("Throw an exception if instantiated directly", function(){
		expect(function(){
			new luga.Notifier();
		}).toThrow();
	});

	describe(".observers", function(){

		it("Is an array", function(){
			expect(luga.type(notifierObj.observers)).toEqual("array");
		});

		it("Empty by default", function(){
			expect(notifierObj.observers.length).toEqual(0);
		});

		it("Contains all the 'generic' observers", function(){
			notifierObj.addObserver(observerObj);
			expect(notifierObj.observers[0]).toEqual(observerObj);
		});

	});

	describe(".eventObservers", function(){

		it("Is a plain object", function(){
			expect(luga.isPlainObject(notifierObj.eventObservers)).toEqual(true);
		});

		it("Empty by default", function(){
			expect(Object.keys(notifierObj.eventObservers)).toEqual([]);
		});

		it("Store 'event' observers. Event names are used as keys and each value is an array of observer/method objects", function(){
			notifierObj.addObserver(eventObserverObj, "first", "firstHandler");
			expect(notifierObj.eventObservers["first"]).toEqual([
				{
					observer: eventObserverObj,
					methodName: "firstHandler"
				}
			]);

			notifierObj.addObserver(eventObserverObj, "second", "secondHandler");
			notifierObj.addObserver(eventObserverObj, "second", "firstHandler");
			expect(notifierObj.eventObservers["second"]).toEqual([
				{
					observer: eventObserverObj,
					methodName: "secondHandler"
				},
				{
					observer: eventObserverObj,
					methodName: "firstHandler"
				}
			]);
		});

	});

	describe(".addObserver()", function(){

		it("Ensure that only objects are register as observers", function(){
			expect(function(){
				notifierObj.addObserver("test");
			}).toThrow();
		});

		describe("If invoked with only one argument:", function(){

			it("Register the given object as a 'generic' observer", function(){
				notifierObj.addObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(1);
				notifierObj.addObserver(uselessObj);
				expect(notifierObj.observers.length).toEqual(2);
			});

			it("'generic' observers must follow a naming convention. For an event named 'complete' they must implement a method named: 'onCompleteHandler'", function(){
				notifierObj.addObserver(observerObj);
				spyOn(observerObj, "onCompleteHandler");
				spyOn(observerObj, "onSomethingHandler");

				notifierObj.notifyObservers("complete", {});
				expect(observerObj.onCompleteHandler).toHaveBeenCalled();
				expect(observerObj.onSomethingHandler).not.toHaveBeenCalled();
			});

		});

		describe("If invoked with two arguments:", function(){

			it("Nothing happens", function(){
				notifierObj.addObserver(observerObj, "whatever");
				expect(notifierObj.observers.length).toEqual(0);
				notifierObj.addObserver(eventObserverObj, "first");
				expect(Object.keys(notifierObj.eventObservers)).toEqual([]);
			});

		});

		describe("If invoked with three arguments:", function(){

			it("Ensure that second and third arguments are strings", function(){
				expect(function(){
					notifierObj.addObserver(eventObserverObj, "xxx", {});
				}).toThrow();
				expect(function(){
					notifierObj.addObserver(eventObserverObj, [], "xxx");
				}).toThrow();
			});

			it("Register the given object as an 'event' observer", function(){
				notifierObj.addObserver(eventObserverObj, "first", "firstHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["first"]);

				notifierObj.addObserver(eventObserverObj, "second", "secondHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["first", "second"]);
				expect(notifierObj.eventObservers["second"].length).toEqual(1);

				notifierObj.addObserver(eventObserverObj, "second", "firstHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["first", "second"]);
				expect(notifierObj.eventObservers["second"].length).toEqual(2);
			});

			it("Fail silently if the same observer/method combination is added more than once for the same event", function(){
				notifierObj.addObserver(eventObserverObj, "first", "firstHandler");
				expect(notifierObj.eventObservers["first"].length).toEqual(1);

				notifierObj.addObserver(eventObserverObj, "first", "firstHandler");
				expect(notifierObj.eventObservers["first"].length).toEqual(1);
			});

		});

	});

	describe(".notifyObserver()", function(){

		it("Send a notification to all registered observers", function(){
			spyOn(observerObj, "onCompleteHandler");
			spyOn(eventObserverObj, "firstHandler");

			notifierObj.addObserver(observerObj);
			notifierObj.addObserver(eventObserverObj, "complete", "firstHandler");
			notifierObj.notifyObservers("complete", {});

			expect(observerObj.onCompleteHandler).toHaveBeenCalled();
			expect(eventObserverObj.firstHandler).toHaveBeenCalled();
		});

		it("Fails silently if registered observers do not implement matching methods", function(){
			notifierObj.addObserver(eventObserverObj, "noWhere", "missingHandler");
			expect(function(){
				notifierObj.notifyObservers("noWhere", {});
			}).not.toThrow();
		});

		it("Require two parameters: eventName and data. Both are mandatory", function(){
			expect(function(){
				notifierObj.notifyObservers("complete");
			}).toThrow();
		});

		it("If the data parameter is not an object, an exception is thrown", function(){
			expect(function(){
				notifierObj.notifyObservers("complete", "ciao");
			}).toThrow();
		});

		it("The data parameter provides a way for passing data from the point of notification to all interested observers", function(){
			spyOn(observerObj, "onCompleteHandler");
			spyOn(eventObserverObj, "firstHandler");

			notifierObj.addObserver(observerObj);
			notifierObj.addObserver(eventObserverObj, "complete", "firstHandler");

			notifierObj.notifyObservers("complete", {flag: true});
			expect(observerObj.onCompleteHandler).toHaveBeenCalledWith({flag: true});
			expect(eventObserverObj.firstHandler).toHaveBeenCalledWith({flag: true});
		});

	});

	describe(".removeObserver()", function(){

		describe("If invoked with only one argument:", function(){

			it("Remove the given 'generic' observer", function(){
				notifierObj.addObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(1);
				notifierObj.removeObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(0);
			});

			it("Fails silently if the given object was not registered", function(){
				notifierObj.addObserver(observerObj);
				expect(notifierObj.observers.length).toEqual(1);
				notifierObj.removeObserver({});
				expect(notifierObj.observers.length).toEqual(1);
			});

		});

		describe("If invoked with three arguments:", function(){

			it("Remove the given 'event' observer associated with the given event name and method", function(){
				notifierObj.addObserver(eventObserverObj, "first", "firstHandler");
				notifierObj.addObserver(eventObserverObj, "second", "firstHandler");
				notifierObj.addObserver(eventObserverObj, "second", "secondHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["first", "second"]);
				expect(notifierObj.eventObservers["first"].length).toEqual(1);
				expect(notifierObj.eventObservers["second"].length).toEqual(2);

				notifierObj.removeObserver(eventObserverObj, "first", "firstHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["second"]);
				expect(notifierObj.eventObservers["second"].length).toEqual(2);

				notifierObj.removeObserver(eventObserverObj, "second", "firstHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["second"]);
				expect(notifierObj.eventObservers["second"].length).toEqual(1);

				notifierObj.removeObserver(eventObserverObj, "second", "secondHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual([]);
			});

			it("Fails silently if the given combination of arguments was not registered", function(){
				notifierObj.addObserver(eventObserverObj, "first", "firstHandler");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["first"]);

				notifierObj.removeObserver(eventObserverObj, "second", "missing");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["first"]);

				notifierObj.removeObserver(eventObserverObj, "missing", "missing");
				expect(Object.keys(notifierObj.eventObservers)).toEqual(["first"]);
			});

		});

	});

});