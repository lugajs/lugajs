/*global luga, it, describe, expect */

describe("luga.data.Dataset", function(){

	beforeEach(function(){

		testDs = new luga.data.DataSet({id: "test"});
		testRecords = [
			{ firstName: "Nicole", lastName: "Kidman", country: "Australia" },
			{ firstName: "Kate", lastName: "Beckinsale", country: "UK" },
			{ firstName: "Jennifer", lastName: "Connelly", country: "USA" },
			{ firstName: "Salma", lastName: "Hayek", country: "Mexico" },
			{ firstName: "Gisele", lastName: "Bundchen", country: "Brasl" },
			{ firstName: "Elisabeth", lastName: "Banks", country: "USA" },
			{ firstName: "Liz", lastName: "Hurley", country: "UK" }
		];

		removeUk = function(dataSet, row, rowIndex){
			if(row.country === "UK"){
				return null;
			}
			return row;
		};
		removeBrasil = function(dataSet, row, rowIndex){
			if(row.country === "Brasl"){
				return null;
			}
			return row;
		};

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

	it("Implements the Notifier interface", function(){
		var ds = new luga.data.DataSet({id: "myDs"});
		expect(jQuery.isFunction(ds.addObserver)).toBeTruthy();
		expect(jQuery.isFunction(ds.notifyObservers)).toBeTruthy();
		expect(jQuery.isArray(ds.observers)).toBeTruthy();
	});

	describe("Its constructor options requires:", function(){
		it("An id, to act as unique identifier that will be stored inside a global registry (options.id)", function(){
			var ds = new luga.data.DataSet({id: "myDs"});
			expect(luga.data.datasetRegistry.myDs).toEqual(ds);
		});

	});

	describe("Its constructor options may contains:", function(){
		it("An initial set of records (options.records)", function(){
			var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
			expect(ds.select()).toEqual(testRecords);
			expect(ds.getRecordsCount()).toEqual(7);
		});
		it("A filter function to be called once for each row in the data set (options.filter)", function(){
			var ds = new luga.data.DataSet({id: "myDs", records: testRecords, filter: removeUk});
			expect(ds.filter).toEqual(removeUk);
			expect(ds.getRecordsCount()).toEqual(5);
		});
	});

	describe("Its constructor throws an exception if:", function(){
		it("options.id is missing", function(){
			expect(function(){
				var ds = new luga.data.DataSet({});
			}).toThrow();
		});
		it("options.filter is not a function", function(){
			expect(function(){
				var ds = new luga.data.DataSet({id: "myDs", filter: "test"});
			}).toThrow();
		});
	});

	describe(".select():", function(){
		it("Returns an array of the internal row objects that store the records in the dataSet", function(){
			var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
			expect(ds.select()).toEqual(testRecords);
			expect(ds.select().length).toEqual(7);
		});
		it("If the dataSet contains a filter function, it returns the filtered records", function(){
			var ds = new luga.data.DataSet({id: "myDs", records: testRecords, filter: removeUk});
			expect(ds.select().length).toEqual(5);
		});
		describe("It accepts an optional filter function as an argument", function(){
			it("If specified only records matching the filter will be returned", function(){
				var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
				expect(ds.select(removeUk).length).toEqual(5);
			});
			it("If the filter is not a function, an exception is throws", function(){
				expect(function(){
					testDs.select("test");
				}).toThrow();
			});
		});
	});

	describe(".delete():", function(){
		it("Delete all records", function(){
			testDs.insert(testRecords);
			expect(testDs.select().length).toEqual(7);
			testDs.delete();
			expect(testDs.select().length).toEqual(0);
		});
		it("Then it triggers a 'dataChanged' notification", function(){
			testDs.insert(testRecords);
			testDs.delete();
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
		});
		describe("It accepts an optional filter function as an argument", function(){
			it("If specified only records matching the filter will be deleted", function(){
				var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
				ds.delete(removeUk);
				expect(ds.select().length).toEqual(5);
			});
			it("If the filter is not a function, an exception is throws", function(){
				expect(function(){
					testDs.delete("test");
				}).toThrow();
			});
		});
	});

	describe(".insert()", function(){
		it("Adds records to a dataSet", function(){
			testDs.insert({ firstName: "Nicole", lastName: "Kidman" });
			testDs.insert({ firstName: "Elisabeth", lastName: "Banks" });
			expect(testDs.getRecordsCount()).toEqual(2);
		});
		it("Accepts either a single record", function(){
			expect(testDs.getRecordsCount()).toEqual(0);
			testDs.insert({ firstName: "Nicole", lastName: "Kidman" });
			expect(testDs.getRecordsCount()).toEqual(1);
		});
		it("Or an array of records", function(){
			expect(testDs.getRecordsCount()).toEqual(0);
			testDs.insert(testRecords);
			expect(testDs.getRecordsCount()).toEqual(7);
		});
		it("Fires a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
			testDs.insert(testRecords);
			expect(testObserver.onDataChangedHandler).toHaveBeenCalled();
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
		});
		it("It will automatically create one PK field that is the equivalent of the row's index within the array", function(){
			testDs.insert(testRecords);
			expect(testDs.records[0][luga.data.CONST.PK_KEY]).toEqual(0);
			expect(testDs.records[6][luga.data.CONST.PK_KEY]).toEqual(6);
		});

	});

	describe(".setFilter():", function(){
		beforeEach(function(){
			testDs.insert(testRecords);
			testDs.setFilter(removeUk);
		});
		it("Throws an exception if the given filter is not a function", function(){
			expect(function(){
				testDs.setFilter("test");
			}).toThrow();
		});
		it("Replaces current filter with a new filter functions", function(){
			testDs.setFilter(removeBrasil);
			expect(testDs.filter).toEqual(removeBrasil);
		});
		it("And apply the new filter", function(){
			expect(testDs.getRecordsCount()).toEqual(5);
			testDs.setFilter(removeBrasil);
			expect(testDs.getRecordsCount()).toEqual(6);
		});
		it("Then it triggers a 'dataChanged' notification", function(){
			testDs.setFilter(removeBrasil);
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
		});
	});

	describe(".deleteFilter():", function(){
		beforeEach(function(){
			testDs.insert(testRecords);
			testDs.setFilter(removeUk);
		});
		it("Deletes current filter", function(){
			expect(testDs.getRecordsCount()).toEqual(5);
			testDs.deleteFilter();
			expect(testDs.filter).toBeNull();
		});
		it("Resets the records to their unfiltered status", function(){
			testDs.deleteFilter();
			expect(testDs.getRecordsCount()).toEqual(7);
			expect(testDs.select()).toEqual(testRecords);
		});
		it("Then it triggers a 'dataChanged' notification", function(){
			testDs.deleteFilter();
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
		});
	});

	describe(".getRecordsCount()", function(){
		it("Returns the number of records in the dataSet", function(){
			// Already tested
		});
		it("If the dataSet has a filter, returns the number of filtered records", function(){
			// Already tested
		});
	});

	describe(".getCurrentRowId()", function(){
		it("Returns the rowId of the current row", function(){
			testDs.insert(testRecords);
			testDs.setCurrentRowId(2);
			expect(testDs.getCurrentRowId()).toEqual(2);
		});
		it("Returns 0 on an empty dataSet", function(){
			expect(testDs.getCurrentRowId()).toEqual(0);
		});
	});

	describe(".setCurrentRowId()", function(){
		it("Sets the current row of the data set to the row matching the given rowId", function(){
			testDs.insert(testRecords);
			testDs.setCurrentRowId(3);
			expect(testDs.getCurrentRowId()).toEqual(3);
		});
		it("Throws an exception if the given rowId is invalid", function(){
			expect(function(){
				testDs.setCurrentRowId(3);
			}).toThrow();
		});
		it("Triggers a 'currentRowChanged' notification", function(){
			testDs.insert(testRecords);
			testDs.setCurrentRowId(3);
			expect(testObserver.onCurrentRowChangedHandler).toHaveBeenCalled();
		});
	});

	describe(".getRowById()", function(){
		it("Returns the row object associated with the given rowId", function(){
			testDs.insert(testRecords);
			var row = testDs.getRowById(2);
			expect(row).toEqual(testRecords[2]);
		});
		it("Returns null if the dataSet contains no data", function(){
			var row = testDs.getRowById(2);
			expect(row).toBeNull();
		});
		it("Or if no available record matches the given rowId", function(){
			testDs.insert(testRecords);
			var row = testDs.getRowById(99);
			expect(row).toBeNull();
		});
	});

});