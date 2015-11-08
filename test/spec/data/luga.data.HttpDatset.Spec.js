describe("luga.data.HttpDataSet", function(){

	"use strict";

	var testDs;
	beforeEach(function(){
		testDs = new luga.data.JsonDataSet({id: "jsonDs"});
	});

	it("Extends luga.data.Dataset", function(){
		expect(jQuery.isFunction(testDs.select)).toBeTruthy();
	});

	it("Is an abstract class. That can't be invoked directly", function(){
		expect(function(){
			new luga.data.HttpDataSet({id: "tryThis"});
		}).toThrow();
	});

	describe("Its constructor options are the same as luga.data.DataSet and may also contains:", function(){

		it("An URL (options.url)", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs", url: "test.json"});
			expect(ds.url).toEqual("test.json");
		});

		it("A timeout for XHR requests (options.timeout)", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs"});
			expect(ds.timeout).toEqual(luga.data.CONST.XHR_TIMEOUT);
			var fastDs = new luga.data.JsonDataSet({id: "fastDs", timeout: 200});
			expect(fastDs.timeout).toEqual(200);
		});

		it("A cache flag for XHR requests (options.cache)", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs"});
			expect(ds.cache).toBe(true);
			var fastDs = new luga.data.JsonDataSet({id: "fastDs", cache: false});
			expect(fastDs.cache).toBe(false);
		});

	});

	describe(".loadRecords()", function(){
		it("Is an abstract method, child classes must implement it to extract records from XHR response", function(){
			expect(jQuery.isFunction(testDs.loadRecords)).toBeTruthy();
		});
	});

	describe(".getUrl()", function(){
		it("Returns the URL that will be used to fetch the data", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs", url: "test.json"});
			expect(ds.getUrl()).toEqual("test.json");
		});
		it("Returns null if URL is not set", function(){
			expect(testDs.getUrl()).toBeNull();
		});
	});

	describe(".setUrl()", function(){
		it("Set the URL that will be used to fetch the data", function(){
			testDs.setUrl("test.json");
			expect(testDs.getUrl()).toEqual("test.json");
		});
	});

	describe(".loadData()", function() {

		var testDs, DEFAULT_TIMEOUT, testObserver;
		beforeEach(function(){

			testDs = new luga.data.JsonDataSet({id: "jsonDs", url: "fixtures/data/ladies.json"});
			DEFAULT_TIMEOUT = 2000;

			var ObserverClass = function(){
				this.onDataChangedHandler = function(data){
				};
				this.onLoadingHandler = function(data){
				};
				this.onErrorHandler = function(data){
				};
			};
			testObserver = new ObserverClass();
			testDs.addObserver(testObserver);
			spyOn(testObserver, "onDataChangedHandler");
			spyOn(testObserver, "onLoadingHandler");
			spyOn(testObserver, "onErrorHandler");
		});

		it("Fires off XHR request to fetch and load the data", function(done) {
			testDs.loadData();
			setTimeout(function() {
				expect(testDs.getRecordsCount()).toEqual(7);
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
				done();
			}, DEFAULT_TIMEOUT);
		});

		it("Triggers a 'loading' notification as soon as it's called", function() {
			testDs.loadData();
			expect(testObserver.onLoadingHandler).toHaveBeenCalledWith(testDs);
		});

		it("Invokes .xhrError() in case of an HTTP error", function(done) {
			spyOn(testDs, "xhrError");
			testDs.setUrl("missing.json");
			testDs.loadData();
			setTimeout(function() {
				expect(testDs.xhrError).toHaveBeenCalled();
				done();
			}, DEFAULT_TIMEOUT);
		});

		it("Triggers an 'error' notification in case of an HTTP error", function(done) {
			testDs.setUrl("missing.json");
			testDs.loadData();
			setTimeout(function() {
				expect(testObserver.onErrorHandler).toHaveBeenCalled();
				done();
			}, DEFAULT_TIMEOUT);
		});

	});

});