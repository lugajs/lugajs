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

		it("options.url", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs", url: "test.json"});
			expect(ds.url).toEqual("test.json");
		});

		it("options.timeout (timeout for XHR requests))", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs"});
			expect(ds.timeout).toEqual(luga.data.CONST.XHR_TIMEOUT);
			var fastDs = new luga.data.JsonDataSet({id: "fastDs", timeout: 200});
			expect(fastDs.timeout).toEqual(200);
		});

		it("options.cache (a flag to turn on XHR caching)", function(){
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
				this.onXhrErrorHandler = function(data){
				};
			};
			testObserver = new ObserverClass();
			testDs.addObserver(testObserver);
			spyOn(testObserver, "onDataChangedHandler");
			spyOn(testObserver, "onLoadingHandler");
			spyOn(testObserver, "onXhrErrorHandler");
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

		it("Triggers an 'xhrError' notification in case of an HTTP error", function(done) {
			testDs.setUrl("missing.json");
			testDs.loadData();
			setTimeout(function() {
				expect(testObserver.onXhrErrorHandler).toHaveBeenCalled();
				done();
			}, DEFAULT_TIMEOUT);
		});

	});

});