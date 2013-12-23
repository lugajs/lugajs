/*global luga, it, describe, expect */

describe("luga.data.Dataset", function(){

	beforeEach(function(){

		testDs = new luga.data.DataSet({id: "test"});
		testRows = [
			{ firstName: "Nicole", lastName: "Kidman" },
			{ firstName: "Kate", lastName: "Beckinsale" },
			{ firstName: "Jennifer", lastName: "Connelly" },
			{ firstName: "Salma", lastName: "Hayek" },
			{ firstName: "Gisele", lastName: "Bundchen" },
			{ firstName: "Emmanuelle", lastName: "Beart" },
			{ firstName: "Liz", lastName: "Hurley" }
		];

		var ObserverClass = function(){
			this.onDataChangedHandler = function(data){
			};
		};
		testObserver = new ObserverClass();
		testDs.addObserver(testObserver);
		spyOn(testObserver, "onDataChangedHandler");

	});

	it("Is the base dataset class", function(){
		expect(jQuery.isFunction(luga.data.DataSet)).toBeTruthy();
	});

	it("It implements the Notifier interface", function(){
		var ds = new luga.data.DataSet({id: "myDs"});
		expect(jQuery.isFunction(ds.addObserver)).toBeTruthy();
		expect(jQuery.isFunction(ds.notifyObservers)).toBeTruthy();
		expect(jQuery.isArray(ds.observers)).toBeTruthy();
	});

	it("Throws an error if no id is passed among the parameters", function(){
		expect(function(){
			var ds = new luga.data.DataSet({});
		}).toThrow();
	});

	describe(".insert()", function(){
		it("Accepts either a single record", function(){
			expect(testDs.data.length).toEqual(0);
			testDs.insert({ firstName: "Nicole", lastName: "Kidman" });
			expect(testDs.data.length).toEqual(1);
		});
		it("Or an array of records", function(){
			expect(testDs.data.length).toEqual(0);
			testDs.insert(testRows);
			expect(testDs.data.length).toEqual(7);
		});
		it("Fires a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
			testDs.insert(testRows);
			expect(testObserver.onDataChangedHandler).toHaveBeenCalled();
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
		});
	});

});