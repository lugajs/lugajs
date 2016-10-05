"use strict";

describe("luga.Notifier", function(){
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