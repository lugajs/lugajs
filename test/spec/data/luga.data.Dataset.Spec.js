describe("luga.data.Dataset", function(){

	"use strict";

	var testDs, testRecords, removeUk, removeAus, removeBrasil, removeAll, testObserver;
	beforeEach(function(){

		testDs = new luga.data.DataSet({id: "test"});
		testRecords = getJSONFixture("data/ladies.json");

		removeUk = function(dataSet, row, rowIndex){
			if(row.country === "UK"){
				return null;
			}
			return row;
		};
		removeAus = function(dataSet, row, rowIndex){
			if(row.country === "Australia"){
				return null;
			}
			return row;
		};
		removeBrasil = function(dataSet, row, rowIndex){
			if(row.country === "Brasil"){
				return null;
			}
			return row;
		};
		removeAll = function(dataSet, row, rowIndex){
			return null;
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

	describe("Accepts an Options object as single argument", function(){

		describe("options.id", function(){
			it("Acts as unique identifier that will be stored inside a global registry", function(){
				var ds = new luga.data.DataSet({id: "myDs"});
				expect(luga.data.datasetRegistry.myDs).toEqual(ds);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.DataSet({});
				}).toThrow();
			});
		});

		describe("options.filter", function(){
			it("Is null by default", function(){
				expect(testDs.filter).toBeNull();
			});
			it("Throws an exception if the passed filter is not a function", function(){
				expect(function(){
					var ds = new luga.data.DataSet({id: "myDs", filter: "test"});
				}).toThrow();
			});
		});

		describe("options.records", function(){
			it("Pre-load data inside the dataSet", function(){
				var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
				expect(ds.select()).toEqual(testRecords);
			});
			it("If not specified the dataSet is empty", function(){
				expect(testDs.records).toEqual([]);
				expect(testDs.select().length).toEqual(0);
			});
			describe("Can be either:", function(){
				it("An array of name/value pairs", function(){
					var arrayRecords = [];
					arrayRecords.push({name: "Nicole"});
					arrayRecords.push({name: "Kate"});
					var ds = new luga.data.DataSet({id: "myDs", records: arrayRecords});
					expect(ds.records).toEqual(arrayRecords);
					expect(ds.select().length).toEqual(2);
				});
				it("Or a single object containing value/name pairs", function(){
					var recObj = {name: "Ciccio", lastname: "Pasticcio"};
					var ds = new luga.data.DataSet({id: "myDs", records: recObj});
					expect(ds.select().length).toEqual(1);
				});
			});

			describe("Throws an exception if:", function(){
				it("The passed array contains one primitive value", function(){
					var arrayRecords = [];
					arrayRecords.push({name: "Nicole"});
					// Simple value!
					arrayRecords.push("Kate");
					expect(function(){
						var ds = new luga.data.DataSet({id: "myDs", records: arrayRecords});
					}).toThrow();
				});
				it("The passed single object is a primitive value", function(){
					expect(function(){
						var ds = new luga.data.DataSet({id: "myDs", records: "test"});
					}).toThrow();
				});
			});
		});

	});

	describe(".delete()", function(){

		it("Delete all records", function(){
			testDs.insert(testRecords);
			expect(testDs.select().length).toEqual(7);
			testDs.delete();
			expect(testDs.select().length).toEqual(0);
		});

		describe("Accepts an optional filter function as an argument", function(){
			it("If specified only records matching the filter will be deleted", function(){
				var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
				ds.delete(removeUk);
				expect(ds.select().length).toEqual(5);
			});
			it("Throws an exception if the passed filter is not a function", function(){
				expect(function(){
					testDs.delete("test");
				}).toThrow();
			});
		});

		describe("First:", function(){
			it("Reset the currentRow", function(){
				spyOn(testDs, "resetCurrentRow").and.callFake(function(){
				});
				testDs.insert(testRecords);
				testDs.delete();
				expect(testDs.resetCurrentRow).toHaveBeenCalled();
			});
		});

		describe("Then:", function(){
			it("Triggers a 'dataChanged' notification", function(){
				testDs.insert(testRecords);
				testDs.delete();
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
			});
		});

	});

	describe(".deleteFilter()", function(){
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
		it("Then triggers a 'dataChanged' notification", function(){
			testDs.deleteFilter();
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
		});
	});

	describe(".getCurrentRow()", function(){

		it("Returns first row object on a newly created dataSet", function(){
			testDs.insert(testRecords);
			expect(testDs.getCurrentRow()).toEqual(testDs.recordsHash[0]);
		});
		it("Returns the current row object if it was changed at run-time", function(){
			testDs.insert(testRecords);
			testDs.setCurrentRowId(2);
			expect(testDs.getCurrentRow()).toEqual(testDs.recordsHash[2]);
		});

		describe("Returns the first row among filtered records if:", function(){
			it("The dataSet has a filter associated with it", function(){
				var noAussieDs = new luga.data.DataSet({id: "test", filter: removeAus});
				noAussieDs.insert(testRecords);
				expect(noAussieDs.getCurrentRow()).toEqual(noAussieDs.filteredRecords[0]);
			});
			it("A filter is set at run-time", function(){
				testDs.insert(testRecords);
				expect(testDs.getCurrentRow()).toEqual(testDs.recordsHash[0]);
				testDs.setFilter(removeAus);
				expect(testDs.getCurrentRow()).toEqual(testDs.filteredRecords[0]);
			});
		});

		describe("Returns null if:", function(){
			it("The dataSet is empty", function(){
				expect(testDs.getCurrentRow()).toBeNull();
			});
			it("All the records are filtered out", function(){
				testDs.insert(testRecords);
				expect(testDs.getCurrentRow()).toEqual(testDs.recordsHash[0]);
				testDs.setFilter(removeAll);
				expect(testDs.getCurrentRow()).toBeNull();
			});
		});

	});

	describe(".getCurrentRowId()", function(){

		it("Returns the rowId of the current row", function(){
			testDs.insert(testRecords);
			testDs.setCurrentRowId(2);
			expect(testDs.getCurrentRowId()).toEqual(2);
		});

		it("Returns 0 on a newly created dataSet", function(){
			testDs.insert(testRecords);
			expect(testDs.getCurrentRowId()).toEqual(0);
		});

		describe("Returns null if:", function(){
			it("The dataSet is empty", function(){
				expect(testDs.getCurrentRowId()).toBeNull();
			});
			it("All the records are filtered out", function(){
				testDs.insert(testRecords);
				expect(testDs.getCurrentRow()).toEqual(testDs.recordsHash[0]);
				testDs.setFilter(removeAll);
				expect(testDs.getCurrentRowId()).toBeNull();
			});
		});
	});

	describe(".getRecordsCount()", function(){
		it("Returns the number of records in the dataSet", function(){
			testDs.insert(testRecords);
			expect(testDs.getRecordsCount()).toEqual(7);
		});
		it("If the dataSet has a filter, returns the number of filtered records", function(){
			testDs.insert(testRecords);
			testDs.setFilter(removeUk);
			expect(testDs.getRecordsCount()).toEqual(5);
		});
		it("Returns 0 on an empty dataSet", function(){
			expect(testDs.getRecordsCount()).toEqual(0);
		});
	});

	describe(".getRowById()", function(){
		it("Returns the row object associated with the given rowId", function(){
			testDs.insert(testRecords);
			var row = testDs.getRowById(2);
			expect(row).toEqual(testRecords[2]);
		});
		describe("Returns null if:", function(){
			it("The dataSet contains no data", function(){
				var row = testDs.getRowById(2);
				expect(row).toBeNull();
			});
			it("No available record matches the given rowId", function(){
				testDs.insert(testRecords);
				var row = testDs.getRowById(99);
				expect(row).toBeNull();
			});
		});
	});

	describe(".insert()", function(){

		it("Adds records to a dataSet", function(){
			testDs.insert({ firstName: "Nicole", lastName: "Kidman" });
			testDs.insert({ firstName: "Elisabeth", lastName: "Banks" });
			expect(testDs.getRecordsCount()).toEqual(2);
		});
		it("Fires a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
			testDs.insert(testRecords);
			expect(testObserver.onDataChangedHandler).toHaveBeenCalled();
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
		});
		it("Automatically add a PK field that is the equivalent of the row's index within the array", function(){
			testDs.insert(testRecords);
			expect(testDs.records[0][luga.data.CONST.PK_KEY]).toEqual(0);
			expect(testDs.records[6][luga.data.CONST.PK_KEY]).toEqual(6);
		});

		describe("Accepts either:", function(){
			it("An array of name/value pairs", function(){
				expect(testDs.getRecordsCount()).toEqual(0);
				testDs.insert(testRecords);
				expect(testDs.getRecordsCount()).toEqual(7);
			});
			it("Or a single object containing value/name pairs", function(){
				expect(testDs.getRecordsCount()).toEqual(0);
				testDs.insert({ firstName: "Nicole", lastName: "Kidman" });
				expect(testDs.getRecordsCount()).toEqual(1);
			});
		});

		describe("Throws an exception if:", function(){
			it("The passed array contains one primitive value", function(){
				var arrayRecords = [];
				arrayRecords.push({name: "Nicole"});
				// Simple value!
				arrayRecords.push("Kate");
				expect(function(){
					testDs.insert(arrayRecords);
				}).toThrow();
			});
			it("The passed single object is a primitive value", function(){
				expect(function(){
					testDs.insert(new Date());
				}).toThrow();
			});
		});

	});

	describe(".resetCurrentRow()", function(){

		it("Set currentRowId to 0", function(){
			testDs.insert(testRecords);
			testDs.setCurrentRowId(2);
			testDs.resetCurrentRow();
			expect(testDs.getCurrentRowId()).toEqual(0);
		});

		it("Set currentRowId to the rowId of the first filtered record if the dataSet is associated with a filter", function(){
			var noAussieDs = new luga.data.DataSet({id: "test", filter: removeAus});
			noAussieDs.insert(testRecords);
			expect(noAussieDs.getCurrentRowId()).toEqual(1);
			noAussieDs.setCurrentRowId(2);
			expect(noAussieDs.getCurrentRowId()).toEqual(2);
			noAussieDs.resetCurrentRow();
			expect(noAussieDs.getCurrentRowId()).toEqual(1);
		});

		describe("Set currentRowId to null if:", function(){
			it("The dataSet is empty", function(){
				testDs.resetCurrentRow();
				expect(testDs.getCurrentRowId()).toBeNull();
			});
			it("All the records are filtered out", function(){
				testDs.insert(testRecords);
				testDs.setFilter(removeAll);
				testDs.resetCurrentRow();
				expect(testDs.getCurrentRowId()).toBeNull();
			});
		});

	});

	describe(".select()", function(){
		it("Returns an array of the internal row objects stored inside the dataSet", function(){
			var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
			expect(ds.select()).toEqual(testRecords);
			expect(ds.select().length).toEqual(7);
		});
		it("If the dataSet contains a filter function, returns the row objects matching the filter", function(){
			var ds = new luga.data.DataSet({id: "myDs", records: testRecords, filter: removeUk});
			expect(ds.select().length).toEqual(5);
		});
		describe("It accepts an optional filter function as an argument", function(){
			it("If specified, only records matching the filter will be returned", function(){
				var ds = new luga.data.DataSet({id: "myDs", records: testRecords});
				expect(ds.select(removeUk).length).toEqual(5);
			});
			it("Throws an exception if the passed filter is not a function", function(){
				expect(function(){
					testDs.select("test");
				}).toThrow();
			});
		});
	});

	describe(".setFilter()", function(){
		beforeEach(function(){
			testDs.insert(testRecords);
			testDs.setFilter(removeUk);
		});
		it("Throws an exception if the given filter is not a function", function(){
			expect(function(){
				testDs.setFilter("test");
			}).toThrow();
		});

		describe("First:", function(){
			it("Replaces current filter (if any), with a new filter functions", function(){
				testDs.setFilter(removeBrasil);
				expect(testDs.filter).toEqual(removeBrasil);
			});
		});
		describe("Then:", function(){
			it("Apply the new filter to the records", function(){
				expect(testDs.getRecordsCount()).toEqual(5);
				testDs.setFilter(removeBrasil);
				expect(testDs.getRecordsCount()).toEqual(6);
			});
		});
		describe("Finally", function(){
			it("Triggers a 'dataChanged' notification", function(){
				testDs.setFilter(removeBrasil);
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
			});
		});

	});

	describe(".setCurrentRowId()", function(){

		it("Throws an exception if the given rowId is invalid", function(){
			expect(function(){
				testDs.setCurrentRowId(3);
			}).toThrow();
		});

		describe("First:", function(){
			it("Sets the current row of the dataSet to the row matching the given rowId", function(){
				testDs.insert(testRecords);
				testDs.setCurrentRowId(3);
				expect(testDs.getCurrentRowId()).toEqual(3);
			});
		});

		describe("Then:", function(){
			it("Triggers a 'currentRowChanged' notification", function(){
				testDs.insert(testRecords);
				testDs.setCurrentRowId(3);
				expect(testObserver.onCurrentRowChangedHandler).toHaveBeenCalled();
			});
		});

	});

});