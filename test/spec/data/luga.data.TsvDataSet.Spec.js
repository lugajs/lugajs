describe("luga.data.TsvDataset", function(){

	"use strict";

	let tsvStr, noUrlDs;
	beforeEach(function(){

		tsvStr = jasmineFixtures.read("data/jazzPlayersTsv.txt");

		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest("mock/jazzPlayersTsv.txt").andReturn({
			contentType: "plain/text",
			responseText: tsvStr,
			status: 200
		});

		noUrlDs = new luga.data.TsvDataset({uuid: "noUrlDs"});

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
		jasmine.Ajax.uninstall();
	});

	it("Is the TsvDataset constructor", function(){
		expect(luga.type(luga.data.TsvDataset)).toEqual("function");
	});

	it("Extend the luga.data.HttpDataSet class", function(){
		const MockDs = function(options){
			luga.extend(luga.data.HttpDataSet, this, [options]);
		};
		expect(noUrlDs).toMatchDuckType(new MockDs({uuid: "duck"}));
	});

	it("Can retrieve TSV using XHR", function(){
		const testDs = new luga.data.TsvDataset({uuid: "testDs", url: "mock/jazzPlayersTsv.txt"});
		expect(testDs.getRecordsCount()).toEqual(0);
		testDs.loadData();
		expect(testDs.getRecordsCount()).toEqual(4);
	});

	describe(".getRawTsv()", function(){

		it("Returns the raw TSV data", function(){
			noUrlDs.loadRecords({
				responseText: tsvStr
			});
			expect(noUrlDs.getRawTsv()).toEqual(tsvStr);
		});

		it("Returns null if no data has been loaded yet", function(){
			expect(noUrlDs.getRawTsv()).toBeNull();
		});

	});

	describe(".loadRawTsv()", function(){

		describe("Given a string", function(){

			it("First calls .delete()", function(){
				spyOn(noUrlDs, "delete");
				noUrlDs.loadRawTsv(tsvStr);
				expect(noUrlDs.delete).toHaveBeenCalled();
			});

			it("Then calls .loadRecords()", function(){
				spyOn(noUrlDs, "loadRecords");
				noUrlDs.loadRawTsv(tsvStr);
				expect(noUrlDs.loadRecords).toHaveBeenCalledWith({
					responseText: tsvStr
				});
			});

		});

	});

	describe(".loadRecords()", function(){

		describe("Given an XHR response", function(){

			describe("First:", function(){

				it("Set the .rawTsv property", function(){
					noUrlDs.loadRecords({
						responseText: tsvStr
					});

					expect(noUrlDs.getRawTsv()).not.toBeNull();
				});

			});

			describe("Then:", function(){

				it("Calls .insert(), passing the relevant data", function(){
					spyOn(noUrlDs, "insert").and.callThrough();
					noUrlDs.loadRecords({
						responseText: tsvStr
					});
					expect(noUrlDs.insert).toHaveBeenCalled();
					// Test the first record matches
					expect(noUrlDs.getCurrentRow()).toEqual({
						firstName: "John",
						lastName: "Coltrane",
						country: "USA",
						lugaRowId: "lugaPk_0"
					});
				});

			});

		});

	});


});