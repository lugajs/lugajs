describe("luga.data.JsonDataset", function(){

	"use strict";
	var testDs, DEFAULT_TIMEOUT;
	beforeEach(function(){
		testDs = new luga.data.JsonDataSet({id: "jsonDs", url: "fixtures/data/ladies.json"});
		DEFAULT_TIMEOUT = 2000;
	});

	it("Extends luga.data.HttpDataSet", function(){
		expect(jQuery.isFunction(testDs.loadData)).toBeTruthy();
	});

	it("Is the JSON dataset class", function(){
		expect(jQuery.isFunction(luga.data.JsonDataSet)).toBeTruthy();
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

			it("The nature and amount of records may vary depending on the path", function(done){
				peopleDs.setPath("jazzPlayers");
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
					expect(peopleObserver.onDataChangedHandler).toHaveBeenCalledWith(peopleDs);
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
			it("The 'dataChange' will not be triggered", function(done){
				peopleDs.setPath("invalid");
				peopleDs.loadData();
				setTimeout(function(){
					expect(peopleObserver.onDataChangedHandler).not.toHaveBeenCalledWith(peopleDs);
					done();
				}, DEFAULT_TIMEOUT);
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