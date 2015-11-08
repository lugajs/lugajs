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

	describe(".setPath()", function(){
		it("Set the path to be used to extract data out of the JSON data structure", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs"});
			ds.setPath("test");
			expect(ds.getPath()).toEqual("test");
		});
	});

	describe(".loadData()", function() {

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

		it("Extract records out of the JSON data structure based on the current path", function(done) {
			peopleDs.loadData();
			setTimeout(function() {
				expect(peopleDs.getRecordsCount()).toEqual(7);
				expect(peopleObserver.onDataChangedHandler).toHaveBeenCalledWith(peopleDs);
				done();
			}, DEFAULT_TIMEOUT);
		});

		it("A different path will extract a different set of records", function(done) {
			peopleDs.setPath("jazzPlayers");
			peopleDs.loadData();
			setTimeout(function() {
				expect(peopleDs.getRecordsCount()).toEqual(4);
				expect(peopleObserver.onDataChangedHandler).toHaveBeenCalledWith(peopleDs);
				done();
			}, DEFAULT_TIMEOUT);
		});

		it("A path that has no matches inside the JSON data will result in an empty dataSet", function(done) {
			peopleDs.setPath("invalid");
			peopleDs.loadData();
			setTimeout(function() {
				expect(peopleDs.getRecordsCount()).toEqual(0);
				expect(peopleObserver.onDataChangedHandler).not.toHaveBeenCalledWith(peopleDs);
				done();
			}, DEFAULT_TIMEOUT);
		});

	});

});