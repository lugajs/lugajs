describe("luga.data.Dataset", function(){

	"use strict";

	let baseDs, loadedDs, testRecords, addTestCol, removeUk, removeAus, removeBrasil, removeAll, testObserver;
	beforeEach(function(){

		baseDs = new luga.data.DataSet({uuid: "test"});
		testRecords = jasmineFixtures.read("data/ladies.json");
		loadedDs = new luga.data.DataSet({uuid: "myDs", records: testRecords});

		addTestCol = function(row, rowIndex, dataSet){
			row.testCol = "test";
			return row;
		};

		removeUk = function(row, rowIndex, dataSet){
			if(row.country === "UK"){
				return null;
			}
			return row;
		};
		removeAus = function(row, rowIndex, dataSet){
			if(row.country === "Australia"){
				return null;
			}
			return row;
		};
		removeBrasil = function(row, rowIndex, dataSet){
			if(row.country === "Brasil"){
				return null;
			}
			return row;
		};
		removeAll = function(row, rowIndex, dataSet){
			return null;
		};

		testObserver = {
			onDataChangedHandler: function(){
			},
			onCurrentRowChangedHandler: function(){
			},
			onDataSortedHandler: function(){
			},
			onPreDataSortedHandler: function(){
			},
			onStateChangedHandler: function(){
			}
		};
		baseDs.addObserver(testObserver);
		spyOn(testObserver, "onDataChangedHandler");
		spyOn(testObserver, "onCurrentRowChangedHandler");
		spyOn(testObserver, "onDataSortedHandler");
		spyOn(testObserver, "onPreDataSortedHandler");
		spyOn(testObserver, "onStateChangedHandler");
	});

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
	});

	it("Is the base dataSet constructor", function(){
		expect(luga.type(luga.data.DataSet)).toEqual("function");
	});

	it("Implements the luga.Notifier interface", function(){
		const MockNotifier = function(){
			luga.extend(luga.Notifier, this);
		};
		expect(baseDs).toMatchDuckType(new MockNotifier());
	});

	describe("Accepts an Options object as single argument", function(){

		describe("options.uuid", function(){
			it("Acts as unique identifier that will be stored inside a global registry", function(){
				const ds = new luga.data.DataSet({uuid: "uniqueDs"});
				expect(luga.data.dataSourceRegistry.uniqueDs).toEqual(ds);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.DataSet({});
				}).toThrow();
			});
		});

		describe("options.filter", function(){
			it("Is null by default", function(){
				expect(baseDs.filter).toBeNull();
			});

			it("Will cause the filter to be applied as soon as any record is loaded", function(){
				const filteredDs = new luga.data.DataSet({uuid: "uniqueDs", filter: removeAus});
				filteredDs.insert(testRecords);
				expect(testRecords.length).toEqual(7);
				// Minus one, since Aussies get filtered out
				expect(filteredDs.getRecordsCount()).toEqual(6);
			});

			it("Throws an exception if the given filter is not a function", function(){
				expect(function(){
					new luga.data.DataSet({uuid: "uniqueDs", filter: "test"});
				}).toThrow();
			});
		});

		describe("options.formatter", function(){
			it("Is null by default", function(){
				expect(baseDs.formatter).toBeNull();
			});

			it("Will cause the formatter to be applied as soon as any record is loaded", function(){
				const formattedDs = new luga.data.DataSet({uuid: "uniqueDs", formatter: addTestCol});
				formattedDs.insert(testRecords);
				// Check to see if the test column was added
				expect(formattedDs.getCurrentRow().testCol).toEqual("test");
			});

			it("Throws an exception if the given formatter is not a function", function(){
				expect(function(){
					new luga.data.DataSet({uuid: "uniqueDs", formatter: "test"});
				}).toThrow();
			});
		});

		describe("options.records", function(){
			it("Pre-load data inside the dataSet", function(){
				const ds = new luga.data.DataSet({uuid: "uniqueDs", records: testRecords});
				expect(ds.select()).toEqual(testRecords);
			});
			it("If not specified the dataSet is empty", function(){
				expect(baseDs.records).toEqual([]);
				expect(baseDs.select().length).toEqual(0);
			});
			describe("Can be either:", function(){
				it("An array of name/value pairs", function(){
					const arrayRecords = [];
					arrayRecords.push({name: "Nicole"});
					arrayRecords.push({name: "Kate"});
					const ds = new luga.data.DataSet({uuid: "uniqueDs", records: arrayRecords});
					expect(ds.records).toEqual(arrayRecords);
					expect(ds.getRecordsCount()).toEqual(2);
				});
				it("Or a single object containing value/name pairs", function(){
					const recObj = {name: "Ciccio", lastname: "Pasticcio"};
					const ds = new luga.data.DataSet({uuid: "uniqueDs", records: recObj});
					expect(ds.select().length).toEqual(1);
				});
			});

			describe("Throws an exception if:", function(){
				it("The given array contains one primitive value", function(){
					const arrayRecords = [];
					arrayRecords.push({name: "Nicole"});
					// Simple value!
					arrayRecords.push("Kate");
					expect(function(){
						new luga.data.DataSet({uuid: "uniqueDs", records: arrayRecords});
					}).toThrow();
				});
				it("The given single object is a primitive value", function(){
					expect(function(){
						new luga.data.DataSet({uuid: "uniqueDs", records: "test"});
					}).toThrow();
				});
			});
		});

	});

	describe("Once initialized", function(){
		it("Calls luga.data.setDataSource()", function(){
			spyOn(luga.data, "setDataSource").and.callFake(function(){
			});
			const ds = new luga.data.DataSet({uuid: "uniqueDs"});
			expect(luga.data.setDataSource).toHaveBeenCalledWith("uniqueDs", ds);
		});
	});

	describe(".clearFilter()", function(){
		beforeEach(function(){
			baseDs.insert(testRecords);
			baseDs.setFilter(removeUk);
		});

		describe("First:", function(){
			it("Deletes current filter", function(){
				expect(baseDs.getRecordsCount()).toEqual(5);
				baseDs.clearFilter();
				expect(baseDs.filter).toBeNull();
			});
		});
		describe("Then:", function(){
			it("Resets the records to their unfiltered status", function(){
				baseDs.clearFilter();
				expect(baseDs.getRecordsCount()).toEqual(7);
				expect(baseDs.select()).toEqual(testRecords);
			});
		});
		describe("Finally:", function(){
			it("Triggers a 'dataChanged' notification", function(){
				baseDs.clearFilter();
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: baseDs});
			});
		});

	});

	describe(".delete()", function(){

		it("Delete all records", function(){
			baseDs.insert(testRecords);
			expect(baseDs.getRecordsCount()).toEqual(7);
			baseDs.delete();
			expect(baseDs.getRecordsCount()).toEqual(0);
		});

		describe("Accepts an optional filter function as an argument", function(){
			it("If specified only records matching the filter will be deleted", function(){
				const ds = new luga.data.DataSet({uuid: "uniqueDs", records: testRecords});
				ds.delete(removeUk);
				expect(ds.getRecordsCount()).toEqual(5);
			});
			it("Throws an exception if the given filter is not a function", function(){
				expect(function(){
					baseDs.delete("test");
				}).toThrow();
			});
		});

		describe("First:", function(){
			it("Reset the currentRow", function(){
				spyOn(baseDs, "resetCurrentRow").and.callFake(function(){
				});
				baseDs.insert(testRecords);
				baseDs.delete();
				expect(baseDs.resetCurrentRow).toHaveBeenCalled();
			});
		});

		describe("Then:", function(){
			it("Calls .setState('ready')", function(){
				spyOn(baseDs, "setState");
				baseDs.delete();
				expect(baseDs.setState).toHaveBeenCalledWith(luga.data.STATE.READY);
			});
		});

		describe("Finally:", function(){
			it("Triggers a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
				baseDs.insert(testRecords);
				baseDs.delete();
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: baseDs});
			});
		});

	});

	describe(".getColumnType()", function(){

		it("Returns the type of the given column", function(){
			loadedDs.setColumnType("birthDate", "date");
			expect(loadedDs.getColumnType("birthDate")).toEqual("date");

		});

		it("Returns 'string' if no type was specified", function(){
			expect(loadedDs.getColumnType("country")).toEqual("string");
		});

	});

	describe(".getContext() (of type luga.data.DataSet.context)", function(){

		it("Returns the dataSet's context", function(){
			const context = loadedDs.getContext();
			expect(context.entities).toEqual(loadedDs.select());
			expect(context.recordCount).toEqual(loadedDs.getRecordsCount());
		});

	});

	describe(".getCurrentRow()", function(){

		it("Returns first row object on a newly created dataSet", function(){
			baseDs.insert(testRecords);
			expect(baseDs.getCurrentRow()).toEqual(baseDs.recordsHash["lugaPk_0"]);
		});
		it("Returns the current row object if it was changed at run-time", function(){
			baseDs.insert(testRecords);
			baseDs.setCurrentRowId("lugaPk_2");
			expect(baseDs.getCurrentRow()).toEqual(baseDs.recordsHash["lugaPk_2"]);
		});

		describe("Returns the first row among filtered records if:", function(){
			it("The dataSet has a filter associated with it", function(){
				const noAussieDs = new luga.data.DataSet({uuid: "uniqueDs", filter: removeAus});
				noAussieDs.insert(testRecords);
				expect(noAussieDs.getCurrentRow()).toEqual(noAussieDs.filteredRecords[0]);
			});
			it("A filter is set at run-time", function(){
				baseDs.insert(testRecords);
				expect(baseDs.getCurrentRow()).toEqual(baseDs.recordsHash["lugaPk_0"]);
				baseDs.setFilter(removeAus);
				expect(baseDs.getCurrentRow()).toEqual(baseDs.filteredRecords[0]);
			});
		});

		describe("Returns null if:", function(){
			it("The dataSet is empty", function(){
				expect(baseDs.getCurrentRow()).toBeNull();
			});
			it("All the records are filtered out", function(){
				baseDs.insert(testRecords);
				expect(baseDs.getCurrentRow()).toEqual(baseDs.recordsHash["lugaPk_0"]);
				baseDs.setFilter(removeAll);
				expect(baseDs.getCurrentRow()).toBeNull();
			});
		});

	});

	describe(".getCurrentRowId()", function(){

		it("Returns the rowId of the current row", function(){
			baseDs.insert(testRecords);
			baseDs.setCurrentRowId("lugaPk_2");
			expect(baseDs.getCurrentRowId()).toEqual("lugaPk_2");
		});

		describe("Returns the first record if:", function(){
			it("Records are just added to the dataSet", function(){
				baseDs.insert(testRecords);
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
			});
			it("A filter was just applied that removed the currentRow", function(){
				baseDs.insert(testRecords);
				baseDs.setCurrentRowId("lugaPk_1");
				baseDs.setFilter(removeUk);
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
			});
		});

		describe("Returns null if:", function(){
			it("The dataSet is empty", function(){
				expect(baseDs.getCurrentRowId()).toBeNull();
			});
			it("All the records are filtered out", function(){
				baseDs.insert(testRecords);
				expect(baseDs.getCurrentRow()).toEqual(baseDs.recordsHash["lugaPk_0"]);
				baseDs.setFilter(removeAll);
				expect(baseDs.getCurrentRowId()).toBeNull();
			});
		});
	});

	describe(".getCurrentRowIndex()", function(){

		it("Returns a zero-based index at which the current row can be found", function(){
			baseDs.insert(testRecords);
			baseDs.setCurrentRowId("lugaPk_2");
			expect(baseDs.getCurrentRowIndex()).toEqual(2);
		});

		describe("Returns 0 if:", function(){
			it("As soon as reords are added to the dataSet", function(){
				baseDs.insert(testRecords);
				expect(baseDs.getCurrentRowIndex()).toEqual(0);
			});
			it("A filter was just applied to the dataSet that removed the currentRow", function(){
				baseDs.insert(testRecords);
				baseDs.setCurrentRowId("lugaPk_1");
				baseDs.setFilter(removeUk);
				expect(baseDs.getCurrentRowIndex()).toEqual(0);
			});
		});

		describe("Returns -1 if:", function(){
			it("The dataSet is empty", function(){
				expect(baseDs.getCurrentRowIndex()).toEqual(-1);
			});
			it("All the records are filtered out", function(){
				baseDs.insert(testRecords);
				expect(baseDs.getCurrentRowIndex()).toEqual(0);
				baseDs.setFilter(removeAll);
				expect(baseDs.getCurrentRowIndex()).toEqual(-1);
			});
		});
	});

	describe(".getRecordsCount()", function(){
		it("Returns the number of records in the dataSet", function(){
			baseDs.insert(testRecords);
			expect(baseDs.getRecordsCount()).toEqual(7);
		});
		it("If the dataSet has a filter, returns the number of filtered records", function(){
			baseDs.insert(testRecords);
			baseDs.setFilter(removeUk);
			expect(baseDs.getRecordsCount()).toEqual(5);
		});
		it("Returns zero on an empty dataSet", function(){
			expect(baseDs.getRecordsCount()).toEqual(0);
		});
	});

	describe(".getRowById()", function(){
		it("Returns the row object associated with the given rowId", function(){
			baseDs.insert(testRecords);
			const row = baseDs.getRowById("lugaPk_2");
			expect(row).toEqual(testRecords[2]);
		});
		describe("Returns null if:", function(){
			it("The dataSet is empty", function(){
				const row = baseDs.getRowById("lugaPk_0");
				expect(row).toBeNull();
			});
			it("No available record matches the given rowId", function(){
				baseDs.insert(testRecords);
				expect( baseDs.getRowById(99)).toBeNull();
			});
			it("A record with the given rowId exists, but it's filtered out", function(){
				baseDs.insert(testRecords);
				baseDs.setFilter(removeAus);
				expect(baseDs.getRowById("lugaPk_0")).toBeNull();
			});
		});
	});

	describe(".getRowByIndex()", function(){

		describe("Given a zero-based index:", function(){

			describe("Returns the row object at the given index:", function(){
				it("Among records", function(){
					baseDs.insert(testRecords);
					expect(baseDs.getRowByIndex(2)).toEqual(testRecords[2]);
				});
				it("Or filtered records", function(){
					baseDs.insert(testRecords);
					baseDs.setFilter(removeAus);
					expect(baseDs.getRowByIndex(2)).toEqual(testRecords[3]);
				});
			});

			describe("Throws an exception if:", function(){
				it("The dataSet is empty", function(){
					expect(function(){
						baseDs.getRowByIndex(1);
					}).toThrow();
				});
				it("The given index is out of range", function(){
					baseDs.insert(testRecords);
					expect(function(){
						baseDs.getRowByIndex(99);
					}).toThrow();
				});
			});
		});

	});

	describe(".getRowIndex()", function(){

		describe("Given a row:", function(){

			describe("Returns a zero-based index at which a row can be found:", function(){
				it("Among records", function(){
					const row = loadedDs.getRowById("lugaPk_2"); // Jennifer
					expect(loadedDs.getRowIndex(row)).toEqual(2);
				});
				it("Or filtered records", function(){
					baseDs.insert(testRecords);
					baseDs.setFilter(removeUk);
					const row = baseDs.getRowById("lugaPk_2");
					expect(loadedDs.getRowIndex(row)).toEqual(2);
				});
			});

			describe("Returns -1 if:", function(){
				it("The dataSet is empty", function(){
					const row = loadedDs.getRowById(2);
					expect(baseDs.getRowIndex(row)).toEqual(-1);
				});
				it("No available record matches the given row", function(){
					const arrayRecords = [];
					arrayRecords.push({name: "Nicole"});
					arrayRecords.push({name: "Kate"});
					const ds = new luga.data.DataSet({uuid: "uniqueDs", records: arrayRecords});
					const row = loadedDs.getRowById(2);
					expect(ds.getRowIndex(row)).toEqual(-1);
				});
			});
		});

	});

	describe(".getSortColumn()", function(){

		describe("If no sort operation has been performed yet:", function(){
			it("Returns an empty string ", function(){
				expect(baseDs.getSortColumn()).toEqual("");
			});
		});

		describe("Else:", function(){
			it("Returns the name of the single column most recently used for sorting", function(){
				loadedDs.sort("firstName");
				expect(loadedDs.getSortColumn()).toEqual("firstName");
				loadedDs.sort("country");
				expect(loadedDs.getSortColumn()).toEqual("country");
			});
		});

	});

	describe(".getSortOrder()", function(){

		describe("If no sort operation has been performed yet:", function(){
			it("Returns an empty string ", function(){
				expect(baseDs.getSortOrder()).toEqual("");
			});
		});

		describe("Else:", function(){
			it("Returns the most recently used sort order", function(){
				loadedDs.sort("firstName");
				expect(loadedDs.getSortOrder()).toEqual("ascending");
				loadedDs.sort("firstName");
				expect(loadedDs.getSortOrder()).toEqual("descending");
			});
		});

	});

	describe(".getState()", function(){
		it("Returns the dataSet's current state", function(){
			baseDs.setState("ready");
			expect(baseDs.getState()).toEqual("ready");
		});
		it("Returns null on an newly created dataSet", function(){
			expect(baseDs.getState()).toBeNull();
		});
	});

	describe(".insert()", function(){

		describe("First:", function(){

			describe("First:", function(){
				it("Adds records to a dataSet", function(){
					baseDs.insert({firstName: "Nicole", lastName: "Kidman"});
					baseDs.insert({firstName: "Elisabeth", lastName: "Banks"});
					expect(baseDs.getRecordsCount()).toEqual(2);
				});
				it("Automatically adding a PK field called: " + luga.data.CONST.PK_KEY, function(){
					baseDs.insert(testRecords);
					expect(baseDs.records[0][luga.data.CONST.PK_KEY]).toEqual("lugaPk_0");
					expect(baseDs.records[6][luga.data.CONST.PK_KEY]).toEqual("lugaPk_6");
				});
			});

			describe("Then:", function(){
				it("Apply the formatter (if any)", function(){
					const mock = {
						formatter: addTestCol
					};
					spyOn(mock, "formatter").and.callThrough();
					const formattedDs = new luga.data.DataSet({uuid: "uniqueDs", formatter: mock.formatter});
					formattedDs.insert(testRecords);
					expect(mock.formatter).toHaveBeenCalled();
				});
			});

			describe("Then:", function(){
				it("Apply the filter (if any)", function(){
					const mock = {
						filter: removeAus
					};
					spyOn(mock, "filter").and.callThrough();
					const filteredDs = new luga.data.DataSet({uuid: "uniqueDs", filter: mock.filter});
					filteredDs.insert(testRecords);
					expect(mock.filter).toHaveBeenCalled();
				});
			});

			describe("Then:", function(){
				it("Calls .resetCurrentRow()", function(){
					spyOn(baseDs, "resetCurrentRow");
					baseDs.insert(testRecords);
					expect(baseDs.resetCurrentRow).toHaveBeenCalled();
				});
			});

			describe("Then:", function(){
				it("Calls .setState('ready')", function(){
					spyOn(baseDs, "setState");
					baseDs.insert(testRecords);
					expect(baseDs.setState).toHaveBeenCalledWith(luga.data.STATE.READY);
				});
			});

			describe("Finally::", function(){
				it("Fires a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
					baseDs.insert(testRecords);
					expect(testObserver.onDataChangedHandler).toHaveBeenCalled();
					expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: baseDs});
				});
			});

		});

		describe("Accepts either:", function(){
			it("An array of name/value pairs", function(){
				expect(baseDs.getRecordsCount()).toEqual(0);
				baseDs.insert(testRecords);
				expect(baseDs.getRecordsCount()).toEqual(7);
			});
			it("Or a single object containing value/name pairs", function(){
				expect(baseDs.getRecordsCount()).toEqual(0);
				baseDs.insert({firstName: "Nicole", lastName: "Kidman"});
				expect(baseDs.getRecordsCount()).toEqual(1);
			});
		});

		describe("Throws an exception if:", function(){
			it("The given array contains one primitive value", function(){
				const arrayRecords = [];
				arrayRecords.push({name: "Nicole"});
				// Simple value!
				arrayRecords.push("Kate");
				expect(function(){
					baseDs.insert(arrayRecords);
				}).toThrow();
			});
			it("The given single object is a primitive value", function(){
				expect(function(){
					baseDs.insert(new Date());
				}).toThrow();
			});
		});

	});

	describe(".resetCurrentRow()", function(){

		describe("If the dataSet has no previous current row:", function(){

			it("Calls .resetCurrentRowToFirst()", function(){
				spyOn(baseDs, "resetCurrentRowToFirst");
				baseDs.insert(testRecords);
				baseDs.resetCurrentRow();
				expect(baseDs.resetCurrentRowToFirst).toHaveBeenCalled();
			});

		});

		describe("If the dataSet has previous current row:", function(){

			it("Set currentRowId to the previously selected row", function(){
				// Insert Nicole
				baseDs.insert(testRecords[0]);
				// Insert Kate
				baseDs.insert(testRecords[1]);
				// Select Kate
				baseDs.setCurrentRowId("lugaPk_1");
				baseDs.resetCurrentRow();
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
			});

			it("Reset normally if the previously selected row is not available", function(){
				// Insert Nicole
				baseDs.insert(testRecords[0]);
				// Insert Kate
				baseDs.insert(testRecords[1]);
				// Insert Jennifer
				baseDs.insert(testRecords[2]);
				// Select Kate
				baseDs.setCurrentRowId("lugaPk_1");
				// Delete UK
				baseDs.delete(removeUk);
				baseDs.resetCurrentRow();
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
			});

		});

	});

	describe(".resetCurrentRowToFirst()", function(){

		it("Set currentRowId to the first record available", function(){
			baseDs.insert(testRecords);
			baseDs.resetCurrentRowToFirst();
			expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
		});

		it("Set currentRow to the first filtered record if the dataSet is associated with a filter", function(){
			const noAussieDs = new luga.data.DataSet({uuid: "uniqueDs", filter: removeAus});
			noAussieDs.insert(testRecords);
			noAussieDs.resetCurrentRowToFirst();
			expect(noAussieDs.getCurrentRowId()).toEqual("lugaPk_1");
		});

		describe("Set currentRowId to null if:", function(){
			it("The dataSet is empty", function(){
				baseDs.resetCurrentRowToFirst();
				expect(baseDs.getCurrentRowId()).toBeNull();
			});
			it("All the records are filtered out", function(){
				baseDs.insert(testRecords);
				baseDs.setFilter(removeAll);
				baseDs.resetCurrentRowToFirst();
				expect(baseDs.getCurrentRowId()).toBeNull();
			});
		});

	});

	describe(".select()", function(){
		it("Returns an array of the internal row objects stored inside the dataSet", function(){
			const ds = new luga.data.DataSet({uuid: "uniqueDs", records: testRecords});
			expect(ds.select()).toEqual(testRecords);
			expect(ds.select().length).toEqual(7);
		});
		it("If the dataSet contains a filter function, returns the row objects matching the filter", function(){
			const ds = new luga.data.DataSet({uuid: "uniqueDs", records: testRecords, filter: removeUk});
			expect(ds.select().length).toEqual(5);
		});
		describe("Accepts an optional filter function as an argument", function(){
			it("In this case, only records matching the filter will be returned", function(){
				const ds = new luga.data.DataSet({uuid: "uniqueDs", records: testRecords});
				expect(ds.select(removeUk).length).toEqual(5);
			});
			it("Throws an exception if the given filter is not a function", function(){
				expect(function(){
					baseDs.select("test");
				}).toThrow();
			});
		});
	});

	describe(".setColumnType()", function(){

		it("Set the type of the given column", function(){
			baseDs.insert(testRecords);
			baseDs.setColumnType("birthDate", "date");
			expect(baseDs.getColumnType("birthDate")).toEqual("date");

		});
		it("Accepts an array of column names as first parameter", function(){
			baseDs.setColumnType(["birthDate", "country"], "number"); //Makes no sense in real life
			expect(baseDs.getColumnType("birthDate")).toEqual("number");
			expect(baseDs.getColumnType("country")).toEqual("number");
		});
		it("Throws an exception if the given type is not allowed", function(){
			expect(function(){
				baseDs.setColumnType("birthDate", "whatever I want");
			}).toThrow();
		});

	});

	describe(".setCurrentRow()", function(){

		describe("Given a row:", function(){

			describe("First:", function(){
				it("Sets the current row of the dataSet to the one matching the given row", function(){
					baseDs.insert(testRecords);
					const row3 = baseDs.getRowById("lugaPk_3");
					baseDs.setCurrentRow(row3);
					expect(baseDs.getCurrentRowId()).toEqual("lugaPk_3");
				});
			});

			describe("Then:", function(){
				it("Triggers a 'currentRowChanged' notification", function(){
					baseDs.insert(testRecords);
					const row3 = baseDs.getRowById("lugaPk_3");
					baseDs.setCurrentRow(row3);
					expect(testObserver.onCurrentRowChangedHandler).toHaveBeenCalled();
				});
			});

			describe("Throws an exception if:", function(){
				it("The dataSet is empty", function(){
					const row = loadedDs.getRowById("lugaPk_2");
					expect(function(){
						baseDs.setCurrentRow(row);
					}).toThrow();
				});
				it("No available record matches the given row", function(){
					const arrayRecords = [];
					arrayRecords.push({name: "Nicole"});
					arrayRecords.push({name: "Kate"});
					const ds = new luga.data.DataSet({uuid: "uniqueDs", records: arrayRecords});
					const row = loadedDs.getRowById("lugaPk_2");
					expect(function(){
						ds.setCurrentRow(row);
					}).toThrow();
				});
			});

		});

	});

	describe(".setCurrentRowId()", function(){

		it("Throws an exception if the given rowId is invalid", function(){
			expect(function(){
				baseDs.setCurrentRowId("test");
			}).toThrow();
		});

		describe("First:", function(){
			it("Sets the current row of the dataSet to the row matching the given rowId", function(){
				baseDs.insert(testRecords);
				baseDs.setCurrentRowId("lugaPk_3");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_3");
			});
		});

		describe("Then:", function(){
			it("Triggers a 'currentRowChanged' notification", function(){
				baseDs.insert(testRecords);
				baseDs.setCurrentRowId("lugaPk_3");
				expect(testObserver.onCurrentRowChangedHandler).toHaveBeenCalled();
			});
		});

	});

	describe(".setCurrentRowIndex()", function(){

		describe("Given a zero-based index:", function(){

			describe("First:", function(){
				it("Sets the current row of the dataSet to the one matching the given index", function(){
					baseDs.insert(testRecords);
					baseDs.setCurrentRowIndex(3);
					expect(baseDs.getCurrentRowIndex()).toEqual(3);
				});
			});

			describe("Then:", function(){
				it("Triggers a 'currentRowChanged' notification", function(){
					baseDs.insert(testRecords);
					const row3 = baseDs.getRowById("lugaPk_3");
					baseDs.setCurrentRow(row3);
					expect(testObserver.onCurrentRowChangedHandler).toHaveBeenCalled();
				});
			});

			describe("Throws an exception if:", function(){
				it("The dataSet is empty", function(){
					expect(function(){
						baseDs.setCurrentRowIndex(1);
					}).toThrow();
				});
				it("The given index is out of range", function(){
					baseDs.insert(testRecords);
					expect(function(){
						baseDs.setCurrentRowIndex(99);
					}).toThrow();
				});
			});

		});

	});

	describe(".setFilter()", function(){
		beforeEach(function(){
			baseDs.insert(testRecords);
			baseDs.setFilter(removeUk);
		});
		it("Throws an exception if the given filter is not a function", function(){
			expect(function(){
				baseDs.setFilter("test");
			}).toThrow();
		});

		describe("First:", function(){
			it("Replaces current filter (if any), with a new filter functions", function(){
				baseDs.setFilter(removeBrasil);
				expect(baseDs.filter).toEqual(removeBrasil);
			});
		});
		describe("Then:", function(){
			it("Apply the new filter to the records", function(){
				expect(baseDs.getRecordsCount()).toEqual(5);
				baseDs.setFilter(removeBrasil);
				expect(baseDs.getRecordsCount()).toEqual(6);
			});
		});
		describe("Then:", function(){
			it("Calls .setState('ready')", function(){
				spyOn(baseDs, "setState");
				baseDs.setFilter(removeBrasil);
				expect(baseDs.setState).toHaveBeenCalledWith(luga.data.STATE.READY);
			});
		});
		describe("Finally", function(){
			it("Triggers a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
				baseDs.setFilter(removeBrasil);
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: baseDs});
			});
		});

	});

	describe(".setState()", function(){

		it("Set the dataSet's state", function(){
			baseDs.setState("ready");
			expect(baseDs.state).toEqual("ready");

		});
		it("Triggers a 'stateChanged' notification", function(){
			baseDs.setState("ready");
			expect(testObserver.onStateChangedHandler).toHaveBeenCalled();
		});
		it("Throws an exception if the given state is not allowed", function(){
			expect(function(){
				baseDs.setState("whatever I want");
			}).toThrow();
		});

	});

	describe(".sort()", function(){

		describe("Sort the data based on either:", function(){

			describe("Single column:", function(){

				it("Passing a string", function(){
					loadedDs.sort("firstName");
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_5"); // Elisabeth
				});
				it("Passing a single element array", function(){
					loadedDs.sort(["firstName"]);
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_5"); // Elisabeth
				});

			});

			describe("Multiple columns:", function(){

				it("Passing an array of names", function(){
					loadedDs.sort(["firstName", "lastName"]);
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_5"); // Elisabeth
				});

			});

			describe("Sort order, either:", function(){

				it("'toggle' (default)", function(){
					loadedDs.sort("firstName");
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_5"); // Elisabeth
					loadedDs.sort("firstName");
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_3"); // Salma
				});
				it("'ascending'", function(){
					loadedDs.sort("firstName", "descending");
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_3"); // Salma
					loadedDs.sort("firstName", "ascending");
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_5"); // Elisabeth
				});
				it("'descending'", function(){
					loadedDs.sort("firstName", "descending");
					expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_3"); // Salma
				});

			});

		});

		describe("Whenever called :", function(){

			describe("First:", function(){
				it("Triggers a 'preDataSorted' notification", function(){
					baseDs.sort("firstName");
					expect(testObserver.onPreDataSortedHandler).toHaveBeenCalled();
				});
			});

			describe("Then:", function(){
				it("Sorts the records", function(){
					spyOn(baseDs.records, "sort").and.callThrough();
					baseDs.sort("firstName");
					expect(baseDs.records.sort).toHaveBeenCalled();
				});
			});

			describe("Then:", function(){
				it("Calls .resetCurrentRowToFirst()", function(){
					spyOn(baseDs, "resetCurrentRowToFirst").and.callThrough();
					baseDs.sort("firstName");
					expect(baseDs.resetCurrentRowToFirst).toHaveBeenCalled();
				});
			});

			describe("Then:", function(){
				it("Calls .setState('ready')", function(){
					spyOn(baseDs, "setState");
					baseDs.sort("firstName");
					expect(baseDs.setState).toHaveBeenCalledWith(luga.data.STATE.READY);
				});
			});

			describe("Then", function(){
				it("Triggers a 'dataSorted' notification", function(){
					baseDs.sort("firstName");
					expect(testObserver.onDataSortedHandler).toHaveBeenCalled();
				});
			});

			describe("Finally:", function(){
				it("Triggers a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
					baseDs.sort("firstName");
					expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: baseDs});
				});
			});

		});

		describe("Depending on the combination of columnType and sortOrder different sort strategies will be used:", function(){

			it("luga.data.sort.date.ascending", function(){
				spyOn(luga.data.sort.date, "ascending").and.callThrough();
				loadedDs.setColumnType("birthDate", "date");
				loadedDs.sort("birthDate", "ascending");
				expect(luga.data.sort.date.ascending).toHaveBeenCalled();
			});
			it("luga.data.sort.date.descending", function(){
				spyOn(luga.data.sort.date, "descending").and.callThrough();
				loadedDs.setColumnType("birthDate", "date");
				loadedDs.sort("birthDate", "descending");
				expect(luga.data.sort.date.descending).toHaveBeenCalled();
			});
			it("luga.data.sort.number.ascending", function(){
				spyOn(luga.data.sort.number, "ascending").and.callThrough();
				loadedDs.setColumnType("birthDate", "number");
				loadedDs.sort("birthDate", "ascending");
				expect(luga.data.sort.number.ascending).toHaveBeenCalled();
			});
			it("luga.data.sort.number.descending", function(){
				spyOn(luga.data.sort.number, "descending").and.callThrough();
				loadedDs.setColumnType("birthDate", "number");
				loadedDs.sort("birthDate", "descending");
				expect(luga.data.sort.number.descending).toHaveBeenCalled();
			});
			it("luga.data.sort.string.ascending", function(){
				spyOn(luga.data.sort.string, "ascending").and.callThrough();
				loadedDs.sort("firstName", "ascending");
				expect(luga.data.sort.string.ascending).toHaveBeenCalled();
			});
			it("luga.data.sort.string.descending", function(){
				spyOn(luga.data.sort.string, "descending").and.callThrough();
				loadedDs.sort("firstName", "descending");
				expect(luga.data.sort.string.descending).toHaveBeenCalled();
			});

		});

		describe("Leaves order unchanged if:", function(){

			it("A non existing column is passed", function(){
				loadedDs.sort("missing", "ascending");
				expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_0");
				loadedDs.sort("missing", "descending");
				expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_0");

				loadedDs.setColumnType("missing", "date");
				loadedDs.sort("missing", "ascending");
				expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_0");
				loadedDs.sort("missing", "descending");
				expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_0");

				loadedDs.setColumnType("missing", "number");
				loadedDs.sort("missing", "ascending");
				expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_0");
				loadedDs.sort("missing", "descending");
				expect(loadedDs.getCurrentRowId()).toEqual("lugaPk_0");
			});

		});

		describe("Compare:", function(){

			it("Upper/lower case", function(){
				const records = [
					{name: "Ciccio"},
					{name: "ciccio"},
					{name: "Franco"},
					{name: "franco"}
				];
				baseDs.insert(records);
				baseDs.sort("name", "ascending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
				baseDs.sort("name", "descending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_3");
			});

			it("Strings that start the same. Ascending", function(){
				const records = [
					{name: "ciccio"},
					{name: "ciccione"}
				];
				baseDs.insert(records);
				baseDs.sort("name", "ascending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
				baseDs.sort("name", "descending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
			});

			it("Strings that start the same. Descending", function(){
				const records = [
					{name: "ciccione"},
					{name: "ciccio"}
				];
				baseDs.insert(records);
				baseDs.sort("name", "descending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
				baseDs.sort("name", "ascending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
			});

			it("Strings that are the same", function(){
				const records = [
					{name: "ciccio"},
					{name: "ciccio"}
				];
				baseDs.insert(records);
				baseDs.sort("name", "ascending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
				baseDs.sort("name", "descending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
			});

			it("One character at time. Ascending", function(){
				const records = [
					{name: "ciccio"},
					{name: "cicCio"}
				];
				baseDs.insert(records);
				baseDs.sort("name", "ascending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
			});

			it("One character at time. Descending", function(){
				const records = [
					{name: "ciccio"},
					{name: "cicCio"}
				];
				baseDs.insert(records);
				baseDs.sort("name", "descending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
			});

			it("Strings to undefined values. Ascending", function(){
				const records = [
					{},
					{name: "test"},
					{}
				];
				baseDs.insert(records);
				baseDs.sort("name", "ascending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
				baseDs.sort("name", "ascending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
			});

			it("Strings to undefined values. Descending", function(){
				const records = [
					{},
					{name: "test"},
					{}
				];
				baseDs.insert(records);
				baseDs.sort("name", "descending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
				baseDs.sort("name", "descending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
			});

			it("Numbers to undefined values. Ascending", function(){
				const records = [
					{},
					{num: 1},
					{}
				];
				baseDs.insert(records);
				baseDs.setColumnType("num", "number");
				baseDs.sort("num", "ascending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
				baseDs.sort("num", "descending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
			});

			it("Numbers to undefined values. Descending", function(){
				const records = [
					{num: 1},
					{}
				];
				baseDs.insert(records);
				baseDs.setColumnType("num", "number");
				baseDs.sort("num", "descending");

				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_0");
				baseDs.sort("num", "ascending");
				expect(baseDs.getCurrentRowId()).toEqual("lugaPk_1");
			});

		});

		describe("Throws an exception if:", function(){
			it("An invalid sort order is used", function(){
				expect(function(){
					baseDs.sort("birthDate", "whatever I want");
				}).toThrow();
			});
			it("A column is not specified", function(){
				expect(function(){
					baseDs.sort();
				}).toThrow();
			});
		});

	});

	describe(".update()", function(){

		let onlyUk, mock;
		beforeEach(function(){

			onlyUk = function(row, rowIndex, dataSet){
				if(row.country === "UK"){
					return row;
				}
				return null;
			};

			addTestCol = function(row, rowIndex, dataSet){
				row.testCol = "test";
				return row;
			};

			mock = {
				filter: onlyUk,
				updater: addTestCol
			};
			spyOn(mock, "filter").and.callThrough();
			spyOn(mock, "updater").and.callThrough();
		});

		describe("Given a filter function and an updater function", function(){

			describe("First", function(){

				it("Invoke the updater on each filtered record", function(){
					loadedDs.update(mock.filter, mock.updater);
					expect(mock.updater.calls.count()).toEqual(2);
				});

				it("Passing: row, index, dataSet", function(){
					loadedDs.update(mock.filter, mock.updater);
					expect(mock.updater.calls.argsFor(0)).toEqual([testRecords[1], 0, loadedDs]);
					expect(mock.updater.calls.argsFor(1)).toEqual([testRecords[6], 1, loadedDs]);
				});

			});

			describe("Then:", function(){
				it("Calls .resetCurrentRow()", function(){
					spyOn(loadedDs, "resetCurrentRow");
					loadedDs.update(mock.filter, mock.updater);
					expect(loadedDs.resetCurrentRow).toHaveBeenCalled();
				});
			});

			describe("Then:", function(){
				it("Calls .setState('ready')", function(){
					spyOn(loadedDs, "setState");
					loadedDs.update(mock.filter, mock.updater);
					expect(loadedDs.setState).toHaveBeenCalledWith(luga.data.STATE.READY);
				});
			});

			describe("Finally::", function(){
				it("Fires a 'dataChanged' notification. Sending the whole dataSet along the way", function(){
					const mockObserver = {
						onDataChangedHandler: function(){
						}
					};
					spyOn(mockObserver, "onDataChangedHandler");
					loadedDs.addObserver(mockObserver);

					loadedDs.update(mock.filter, mock.updater);
					expect(mockObserver.onDataChangedHandler).toHaveBeenCalled();
					expect(mockObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: loadedDs});
				});
			});

		});

	});
});