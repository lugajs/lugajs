describe("luga.data.JsonDataset", function(){

	"use strict";

	var testRecords, noUrlDs, testDs, DEFAULT_TIMEOUT;
	beforeEach(function(){
		testRecords = getJSONFixture("data/ladies.json");
		noUrlDs = new luga.data.JsonDataSet({id: "noUrlDs"});
		testDs = new luga.data.JsonDataSet({id: "jsonDs", url: "fixtures/data/ladies.json"});
		DEFAULT_TIMEOUT = 2000;
	});

	it("Is the JSON dataset class", function(){
		expect(jQuery.isFunction(luga.data.JsonDataSet)).toBeTruthy();
	});

	it("Implements the luga.data.HttpDataSet abstract class", function(){
		var MockDs = function(options){
			luga.extend(luga.data.HttpDataSet, this, [options]);
		}
		expect(noUrlDs).toMatchDuckType(new MockDs({id:"duck"}, false));
	});

	describe("Its constructor options are the same as luga.data.HttpDataSet and may also contains:", function(){
		it("options.path", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs", path: "myPath"});
			expect(ds.path).toEqual("myPath");
		});
	});

	describe(".getPath()", function(){
		it("Returns the path to be used to extract data out of the JSON data structure", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs", path: "test"});
			expect(ds.getPath()).toEqual("test");
		});
		it("Returns null if path is not set", function(){
			expect(testDs.getPath()).toBeNull();
		});
	});

	describe(".getRawJson()", function(){
		it("Returns the raw JSON data structure", function(){
			noUrlDs.loadRecords(testRecords);
			expect(noUrlDs.getRawJson()).toEqual(testRecords);
		});
		it("Returns null if no data has been loaded yet", function(){
			expect(noUrlDs.getRawJson()).toBeNull();
		});
	});

	describe(".loadData()", function(){

		var peopleDs, peopleObserver;
		beforeEach(function(){

			peopleDs = new luga.data.JsonDataSet({id: "jsonDs", url: "fixtures/data/people.json", path: "ladies"});
			DEFAULT_TIMEOUT = 2000;

			var ObserverClass = function(){
				this.onDataChangedHandler = function(data){
				};
			};
			peopleObserver = new ObserverClass();
			peopleDs.addObserver(peopleObserver);
			spyOn(peopleObserver, "onDataChangedHandler");
		});

		describe("First:", function(){
			it("Extract records out of the fetched JSON data based on the current path", function(done){
				peopleDs.loadData();
				setTimeout(function(){
					expect(peopleDs.getRecordsCount()).toEqual(7);
					done();
				}, DEFAULT_TIMEOUT);
			});
			it("Records are extracted even if the HTTP's Content-Type is not application/json (as long as it contains JSON data)", function(done){
				var txtDs = new luga.data.JsonDataSet({id: "jsonDs", url: "fixtures/data/people.txt", path: "ladies"});
				txtDs.loadData();
				setTimeout(function(){
					expect(txtDs.getRecordsCount()).toEqual(7);
					done();
				}, DEFAULT_TIMEOUT);
			});
			it("The nature and amount of records may vary depending on the path", function(done){
				peopleDs.setPath("others.jazzPlayers");
				peopleDs.loadData();
				setTimeout(function(){
					expect(peopleDs.getRecordsCount()).toEqual(4);
					done();
				}, DEFAULT_TIMEOUT);
			});
		});

		describe("Then:", function(){
			it("Triggers a 'dataChange' notification", function(done){
				peopleDs.loadData();
				setTimeout(function(){
					expect(peopleObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: peopleDs});
					done();
				}, DEFAULT_TIMEOUT);
			});
		});

		describe("If the path has no matches inside the JSON data:", function(){
			it("No record will be added to the dataSet", function(done){
				peopleDs.setPath("invalid");
				peopleDs.loadData();
				setTimeout(function(){
					expect(peopleDs.getRecordsCount()).toEqual(0);
					done();
				}, DEFAULT_TIMEOUT);
			});
			it("The 'dataChanged' event will not be triggered", function(done){
				peopleDs.setPath("invalid");
				peopleDs.loadData();
				setTimeout(function(){
					expect(peopleObserver.onDataChangedHandler).not.toHaveBeenCalledWith(peopleDs);
					done();
				}, DEFAULT_TIMEOUT);
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
			it("Then calls .loadRecords()", function(){
				spyOn(noUrlDs, "loadRecords");
				noUrlDs.loadRawJson(testRecords);
				expect(noUrlDs.loadRecords).toHaveBeenCalledWith(testRecords);
			});

		});

	});

	describe(".loadRecords()", function(){

		describe("Given JSON data", function(){

			describe("First:", function(){

				it("Set the .rawJson property", function(){
					noUrlDs.loadRecords(testRecords);
					expect(noUrlDs.rawJson).toEqual(testRecords);
				});

			});

			describe("If .path is null:", function(){

				it("Directely pass the JSON to .insert()", function(){
					spyOn(noUrlDs, "insert");
					noUrlDs.loadRecords(testRecords);
					expect(noUrlDs.insert).toHaveBeenCalledWith(testRecords);
				});

			});

			describe("Else", function(){

				it("First calls luga.lookupProperty() to extract the relevant data", function(){
					spyOn(luga, "lookupProperty");
					var peopleRecords = getJSONFixture("data/people.json");
					noUrlDs.setPath("others.jazzPlayers");
					noUrlDs.loadRecords(peopleRecords);
					expect(luga.lookupProperty).toHaveBeenCalledWith(peopleRecords, "others.jazzPlayers");
				});
				it("Then calls .insert(), passing the relevant data", function(){
					spyOn(noUrlDs, "insert");

					var peopleRecords = getJSONFixture("data/people.json");
					var jazzPlayers = luga.lookupProperty(peopleRecords, "others.jazzPlayers");

					noUrlDs.setPath("others.jazzPlayers");
					noUrlDs.loadRecords(peopleRecords);

					expect(noUrlDs.insert).toHaveBeenCalledWith(jazzPlayers);
				});

			});

		});

	});

	describe(".setPath()", function(){
		it("Set the path to be used to extract data out of the JSON data structure", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs"});
			ds.setPath("test");
			expect(ds.getPath()).toEqual("test");
		});
	});

});