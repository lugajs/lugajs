describe("luga.data.JsonDataset", function(){

	"use strict";

	let testRecords, testRecordsStr, noUrlDs, testDs;
	beforeEach(function(){
		testRecords = jasmineFixtures.read("data/ladies.json");
		testRecordsStr = jasmineFixtures.read("data/ladies.txt");
		noUrlDs = new luga.data.JsonDataSet({uuid: "noUrlDs"});
		testDs = new luga.data.JsonDataSet({uuid: "jsonDs", url: "fixtures/data/ladies.json"});
	});

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
	});

	it("Is the JSON dataSet constructor", function(){
		expect(luga.type(luga.data.JsonDataSet)).toEqual("function");
	});

	it("Implements the luga.data.HttpDataSet abstract class", function(){
		const MockDs = function(options){
			luga.extend(luga.data.HttpDataSet, this, [options]);
		};
		expect(noUrlDs).toMatchDuckType(new MockDs({uuid: "duck"}), false);
	});

	describe("Its constructor options are the same as luga.data.HttpDataSet and may also contains:", function(){
		it("options.path", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs", path: "myPath"});
			expect(ds.path).toEqual("myPath");
		});
	});

	describe(".contentType", function(){
		it("Is: application/json", function(){
			const xmlDs = new luga.data.JsonDataSet({uuid: "myXmlDs"});
			expect(xmlDs.contentType).toEqual("application/json");
		});
	});

	describe(".getPath()", function(){
		it("Returns the path to be used to extract data out of the JSON data structure", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs", path: "test"});
			expect(ds.getPath()).toEqual("test");
		});
		it("Returns null if path is not set", function(){
			expect(testDs.getPath()).toBeNull();
		});
	});

	describe(".getRawJson()", function(){
		it("Returns the raw JSON data structure", function(){
			noUrlDs.loadRawJson(testRecords);
			expect(noUrlDs.getRawJson()).toEqual(testRecords);
		});
		it("Returns null if no data has been loaded yet", function(){
			expect(noUrlDs.getRawJson()).toBeNull();
		});
	});

	describe(".loadData()", function(){

		let mockJson, peopleDs, peopleObserver;
		beforeEach(function(){

			mockJson = jasmineFixtures.read("data/people.json");

			jasmine.Ajax.install();
			jasmine.Ajax.stubRequest("mock/people.json").andReturn({
				contentType: "application/json",
				responseText: JSON.stringify(mockJson),
				status: 200
			});
			jasmine.Ajax.stubRequest("mock/people.txt").andReturn({
				contentType: "text/plain",
				responseText: JSON.stringify(mockJson),
				status: 200
			});

			peopleDs = new luga.data.JsonDataSet({uuid: "loadDataUniqueDs", url: "mock/people.json", path: "ladies"});

			const ObserverClass = function(){
				this.onDataChangedHandler = function(data){
				};
			};
			peopleObserver = new ObserverClass();
			peopleDs.addObserver(peopleObserver);
			spyOn(peopleObserver, "onDataChangedHandler");
		});

		afterEach(function() {
			jasmine.Ajax.uninstall();
		});

		describe("First:", function(){
			it("Extract records out of the fetched JSON data based on the current path", function(){
				peopleDs.loadData();
				expect(peopleDs.getRecordsCount()).toEqual(7);
			});
			it("Records are extracted even if the HTTP's Content-Type is not application/json (as long as it contains JSON data)", function(){
				const txtDs = new luga.data.JsonDataSet({uuid: "uniqueDs", url: "mock/people.txt", path: "ladies"});
				txtDs.loadData();
				expect(txtDs.getRecordsCount()).toEqual(7);
			});
			it("The nature and amount of records may vary depending on the path", function(){
				peopleDs.setPath("others.jazzPlayers");
				peopleDs.loadData();
				expect(peopleDs.getRecordsCount()).toEqual(4);
			});
		});

		describe("Then:", function(){
			it("Triggers a 'dataChange' notification", function(){
				peopleDs.loadData();
				expect(peopleObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: peopleDs});
			});
		});

		describe("If the path has no matches inside the JSON data:", function(){
			it("No record will be added to the dataSet", function(){
				peopleDs.setPath("invalid");
				peopleDs.loadData();
				expect(peopleDs.getRecordsCount()).toEqual(0);
			});
			it("The 'dataChanged' event will not be triggered", function(){
				peopleDs.setPath("invalid");
				peopleDs.loadData();
				expect(peopleObserver.onDataChangedHandler).not.toHaveBeenCalledWith(peopleDs);
			});
		});


	});

	describe(".loadRawJson()", function(){

		describe("Given JSON data", function(){

			it("First calls .delete()", function(){
				spyOn(noUrlDs, "delete");
				noUrlDs.loadRawJson(testRecords);
				expect(noUrlDs.delete).toHaveBeenCalled();
			});
			it("Then load the records", function(){
				noUrlDs.loadRawJson(testRecords);
				expect(noUrlDs.getRecordsCount()).toEqual(7);
			});

		});

	});

	describe(".loadRecords()", function(){

		describe("Given an XHR response", function(){

			describe("First:", function(){

				it("Set the .rawJson property", function(){
					noUrlDs.loadRecords({responseText: testRecordsStr});
					expect(noUrlDs.rawJson).not.toBeNull();
				});

			});

			describe("If .path is null:", function(){

				it("Directely pass the JSON to .insert()", function(){
					spyOn(noUrlDs, "insert");
					noUrlDs.loadRecords({responseText: testRecordsStr});
					expect(noUrlDs.insert).toHaveBeenCalled();
				});

			});

			describe("Else", function(){

				it("First calls luga.lookupProperty() to extract the relevant data", function(){
					spyOn(luga, "lookupProperty");
					noUrlDs.setPath("others.jazzPlayers");
					noUrlDs.loadRecords({responseText: testRecordsStr});
					expect(luga.lookupProperty).toHaveBeenCalled();
				});
				it("Then calls .insert(), passing the relevant data", function(){
					spyOn(noUrlDs, "insert");
					noUrlDs.loadRecords({responseText: testRecordsStr});
					expect(noUrlDs.insert).toHaveBeenCalled();
				});

			});

		});

	});

	describe(".setPath()", function(){
		it("Set the path to be used to extract data out of the JSON data structure", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs"});
			ds.setPath("test");
			expect(ds.getPath()).toEqual("test");
		});
	});

});