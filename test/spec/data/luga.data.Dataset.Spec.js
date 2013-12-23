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
			this.onCurrentRowChangedHandler = function(data){
			};
		};
		testObserver = new ObserverClass();
		testDs.addObserver(testObserver);
		spyOn(testObserver, "onDataChangedHandler");
		spyOn(testObserver, "onCurrentRowChangedHandler");
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
		it("Adds rows to a dataSet", function(){
			testDs.insert({ firstName: "Nicole", lastName: "Kidman" });
			testDs.insert({ firstName: "Elisabeth", lastName: "Banks" });
			expect(testDs.data.length).toEqual(2);
		});
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
		it("It will automatically create one PK field that is the equivalent of the row's index within the array", function(){
			testDs.insert(testRows);
			expect(testDs.data[0][luga.data.CONST.PK_KEY]).toEqual(0);
			expect(testDs.data[6][luga.data.CONST.PK_KEY]).toEqual(6);
		});

	});

	describe(".getCurrentRowId()", function(){
		it("Returns the rowId of the current row", function(){
			testDs.insert(testRows);
			testDs.setCurrentRowById(2);
			expect(testDs.getCurrentRowId()).toEqual(2);
		});
		it("Returns 0 on an empty dataSet", function(){
			expect(testDs.getCurrentRowId()).toEqual(0);
		});
	});

	describe(".setCurrentRowById()", function(){
		it("Sets the current row of the data set to the row with the given rowId.", function(){
			testDs.insert(testRows);
			testDs.setCurrentRowById(3);
			expect(testDs.getCurrentRowId()).toEqual(3);
		});
		it("Throws an exception if the given rowId is invalid", function(){
			expect(function(){
				testDs.setCurrentRowById(3);
			}).toThrow();
		});
		it("Triggers a 'currentRowChanged' notification", function(){
			testDs.insert(testRows);
			testDs.setCurrentRowById(3);
			expect(testObserver.onCurrentRowChangedHandler).toHaveBeenCalled();
		});
	});

	describe(".getRowById()", function(){
		it("Returns the row object associated with the given rowId", function(){
			testDs.insert(testRows);
			var row = testDs.getRowById(2);
			expect(row).toEqual(testRows[2]);
		});
		it("Returns null if the dataSet contains no data", function(){
			var row = testDs.getRowById(2);
			expect(row).toBeNull();
		});
		it("Or if no available record matches the given rowId", function(){
			testDs.insert(testRows);
			var row = testDs.getRowById(99);
			expect(row).toBeNull();
		});
	});

});