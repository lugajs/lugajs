describe("luga.data.utils", function(){

	"use strict";

	it("Contains generic, static methods and utilities", function(){
		expect(luga.data.utils).toBeDefined();
	});

	describe(".assembleStateDescription()", function(){

		it("Throws an exception if the given state is not allowed", function(){
			expect(function(){
				luga.data.utils.assembleStateDescription("whatever I want");
			}).toThrow();
		});

		describe("Given a state string, returns an object containing the following fields:", function(){
			it("state", function(){
				var desc = luga.data.utils.assembleStateDescription("loading");
				expect(desc.state).toEqual("loading");
			});
			it("isStateLoading", function(){
				var pos = luga.data.utils.assembleStateDescription("loading");
				expect(pos.isStateLoading).toEqual(true);
				var neg = luga.data.utils.assembleStateDescription("ready");
				expect(neg.isStateLoading).toEqual(false);
			});
			it("isStateError", function(){
				var pos = luga.data.utils.assembleStateDescription("error");
				expect(pos.isStateError).toEqual(true);
				var neg = luga.data.utils.assembleStateDescription("ready");
				expect(neg.isStateError).toEqual(false);
			});
			it("isStateReady", function(){
				var pos = luga.data.utils.assembleStateDescription("ready");
				expect(pos.isStateReady).toEqual(true);
				var neg = luga.data.utils.assembleStateDescription("error");
				expect(neg.isStateReady).toEqual(false);
			});
		});

	});

	describe(".filter()", function(){

		var ladiesRecords, dummyDs, addTestCol, longUk, removeUsa, mock;
		beforeEach(function(){
			ladiesRecords = getJSONFixture("data/ladies.json?_luga.data.utils.filter");
			dummyDs = new luga.data.DataSet({uuid: "testDs"});

			addTestCol = function(row, rowIndex, dataSet){
				row.testCol = "test";
				return row;
			};

			longUk = function(row, rowIndex, dataSet){
				if(row.country === "UK"){
					row.country = "United Kingdom";
				}
				return row;
			};

			removeUsa = function(row, rowIndex, dataSet){
				if(row.country === "USA"){
					return null;
				}
				return row;
			};

			mock = {
				filter: function(row, rowIndex, dataSet){
					// Do nothing
					return row;
				}
			};
			spyOn(mock, "filter").and.callThrough();

		});

		afterEach(function() {
			luga.data.dataSourceRegistry = {};
		});

		describe("Given a an array of row objects and a function", function(){

			describe("Invoke the given function:", function(){

				it("Once for each row", function(){
					expect(mock.filter.calls.count()).toEqual(0);
					luga.data.utils.filter(ladiesRecords, mock.filter, dummyDs);
					expect(mock.filter.calls.count()).toEqual(7);
				});

				it("Passing: row, index, dataSet", function(){
					luga.data.utils.filter(ladiesRecords, mock.filter, dummyDs);
					expect(mock.filter.calls.argsFor(0)).toEqual([ladiesRecords[0], 0, dummyDs]);
					expect(mock.filter.calls.argsFor(6)).toEqual([ladiesRecords[6], 6, dummyDs]);
				});

			});

			describe("The given function can manipulate each row to:", function(){

				it("Add one or more column/s", function(){
					luga.data.utils.filter(ladiesRecords, addTestCol, dummyDs);
					expect(ladiesRecords[0].testCol).toEqual("test");
					expect(ladiesRecords[6].testCol).toEqual("test");
				});

				it("Alter values inside an existing column/s", function(){
					luga.data.utils.filter(ladiesRecords, longUk, dummyDs);
					expect(ladiesRecords[1].country).toEqual("United Kingdom");
					expect(ladiesRecords[6].country).toEqual("United Kingdom");
				});

				it("Removes one or more row (returning null)", function(){
					expect(ladiesRecords.length).toEqual(7);
					var filteredRecords = luga.data.utils.filter(ladiesRecords, removeUsa, dummyDs);
					expect(filteredRecords.length).toEqual(5);
				});

			});

			describe("Throws an exception if the function returns:", function(){

				it("an array", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return ["ciccio", "pasticcio"];
					};
					expect(function(){
						luga.data.utils.filter(ladiesRecords, evilFunc, dummyDs);
					}).toThrow();
				});
				it("a string", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return "test";
					};
					expect(function(){
						luga.data.utils.filter(ladiesRecords, evilFunc, dummyDs);
					}).toThrow();
				});
				it("undefined", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return undefined;
					};
					expect(function(){
						luga.data.utils.filter(ladiesRecords, evilFunc, dummyDs);
					}).toThrow();
				});

			});

			describe("Do not throws an exception if the function returns:", function(){

				it("null", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return null;
					};
					expect(function(){
						luga.data.utils.filter(ladiesRecords, evilFunc, dummyDs);
					}).not.toThrow();
				});

			});

		});

	});
	
	
	describe(".format()", function(){

		var ladiesRecords, dummyDs, addTestCol, longUk, mock;
		beforeEach(function(){
			ladiesRecords = getJSONFixture("data/ladies.json?_luga.data.utils.format");
			dummyDs = new luga.data.DataSet({uuid: "testDs"});

			addTestCol = function(row, rowIndex, dataSet){
				row.testCol = "test";
				return row;
			};

			longUk = function(row, rowIndex, dataSet){
				if(row.country === "UK"){
					row.country = "United Kingdom";
				}
				return row;
			};

			mock = {
				formatter: function(row, rowIndex, dataSet){
					// Do nothing
					return row;
				}
			};
			spyOn(mock, "formatter").and.callThrough();

		});

		afterEach(function() {
			luga.data.dataSourceRegistry = {};
		});

		describe("Given a an array of row objects and a function", function(){

			describe("Invoke the given function:", function(){

				it("Once for each row", function(){
					expect(mock.formatter.calls.count()).toEqual(0);
					luga.data.utils.format(ladiesRecords, mock.formatter, dummyDs);
					expect(mock.formatter.calls.count()).toEqual(7);
				});

				it("Passing: row, index, dataSet", function(){
					luga.data.utils.format(ladiesRecords, mock.formatter, dummyDs);
					expect(mock.formatter.calls.argsFor(0)).toEqual([ladiesRecords[0], 0, dummyDs]);
					expect(mock.formatter.calls.argsFor(6)).toEqual([ladiesRecords[6], 6, dummyDs]);
				});

			});

			describe("The given function can manipulate each row to:", function(){

				it("Add one or more column/s", function(){
					luga.data.utils.format(ladiesRecords, addTestCol, dummyDs);
					expect(ladiesRecords[0].testCol).toEqual("test");
					expect(ladiesRecords[6].testCol).toEqual("test");
				});

				it("Alter values inside an existing column/s", function(){
					luga.data.utils.format(ladiesRecords, longUk, dummyDs);
					expect(ladiesRecords[1].country).toEqual("United Kingdom");
					expect(ladiesRecords[6].country).toEqual("United Kingdom");
				});

			});

			describe("Throws an exception if the function returns:", function(){

				it("an array", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return ["ciccio", "pasticcio"];
					};
					expect(function(){
						luga.data.utils.format(ladiesRecords, evilFunc, dummyDs);
					}).toThrow();
				});
				it("a string", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return "test";
					};
					expect(function(){
						luga.data.utils.format(ladiesRecords, evilFunc, dummyDs);
					}).toThrow();
				});
				it("null", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return null;
					};
					expect(function(){
						luga.data.utils.format(ladiesRecords, evilFunc, dummyDs);
					}).toThrow();
				});
				it("undefined", function(){
					var evilFunc = function(row, rowIndex, dataSet){
						return undefined;
					};
					expect(function(){
						luga.data.utils.format(ladiesRecords, evilFunc, dummyDs);
					}).toThrow();
				});

			});

		});

	});

	describe(".isValidState()", function(){

		describe("Returns true if the passed state is either", function(){
			it("loading", function(){
				expect(luga.data.utils.isValidState("loading")).toBeTruthy();
			});
			it("error", function(){
				expect(luga.data.utils.isValidState("error")).toBeTruthy();
			});
			it("toggle", function(){
				expect(luga.data.utils.isValidState("ready")).toBeTruthy();
			});
		});
		describe("Otherwise", function(){
			it("Returns false", function(){
				expect(luga.data.utils.isValidState("whatever")).toBeFalsy();
				expect(luga.data.utils.isValidState("test")).toBeFalsy();
				expect(luga.data.utils.isValidState(0)).toBeFalsy();
			});
		});

	});


});