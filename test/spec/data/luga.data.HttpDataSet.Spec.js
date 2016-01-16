/* global LUGA_TEST_XHR_BASE */

describe("luga.data.HttpDataSet", function(){

	"use strict";

	var testDs;
	beforeEach(function(){
		testDs = new luga.data.JsonDataSet({uuid: "jsonDs"});
	});

	it("Is an abstract class. Throws an exception if instantiated directly", function(){
		expect(function(){
			new luga.data.HttpDataSet({uuid: "tryThis"});
		}).toThrow();
	});

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
	});

	it("Extends luga.data.Dataset", function(){
		expect(testDs).toMatchDuckType(new luga.data.DataSet({uuid: "duck"}));
	});

	describe("Its constructor options are the same as luga.data.DataSet and may also contains:", function(){

		it("options.url", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs", url: "test.json"});
			expect(ds.url).toEqual("test.json");
		});

		it("options.cache (a flag to turn on XHR caching)", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs"});
			expect(ds.cache).toBe(true);
			var fastDs = new luga.data.JsonDataSet({uuid: "fastDs", cache: false});
			expect(fastDs.cache).toBe(false);
		});

		it("options.headers (name/value pairs to be used as custom HTTP headers)", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs", headers: {"X-Requested-With": "ciccio"}});
			expect(ds.headers).toEqual({"X-Requested-With": "ciccio"});
		});

		it("options.incrementalLoad ", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs", incrementalLoad: true});
			expect(ds.incrementalLoad).toEqual(true);
		});

		it("options.timeout (timeout for XHR requests))", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs"});
			expect(ds.timeout).toEqual(luga.data.CONST.XHR_TIMEOUT);
			var fastDs = new luga.data.JsonDataSet({uuid: "fastDs", timeout: 200});
			expect(fastDs.timeout).toEqual(200);
		});

	});

	describe(".cancelRequest()", function(){
		it("Abort any pending XHR request", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs"});
			ds.setUrl("test.json");
			ds.loadData();
			expect(ds.xhrRequest).not.toBeNull();
			ds.cancelRequest();
			expect(ds.xhrRequest).toBeNull();
		});
	});

	describe(".getUrl()", function(){
		it("Returns the URL that will be used to fetch the data", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs", url: "test.json"});
			expect(ds.getUrl()).toEqual("test.json");
		});
		it("Returns null if URL is not set", function(){
			expect(testDs.getUrl()).toBeNull();
		});
	});

	describe(".loadData()", function(){

		var testDs, DEFAULT_TIMEOUT, testObserver;
		beforeEach(function(){

			testDs = new luga.data.JsonDataSet({uuid: "uniqueDs", url: LUGA_TEST_XHR_BASE + "fixtures/data/ladies.json"});
			DEFAULT_TIMEOUT = 2000;
			testObserver = {
				onDataChangedHandler: function(){
				},
				onDataLoadingHandler: function(){
				},
				onXhrErrorHandler: function(){
				}
			};
			testDs.addObserver(testObserver);
			spyOn(testObserver, "onDataChangedHandler");
			spyOn(testObserver, "onDataLoadingHandler");
			spyOn(testObserver, "onXhrErrorHandler");
		});

		it("Throws an exception if the dataSet's URL is null", function(){
			var ds = new luga.data.JsonDataSet({uuid: "myDs"});
			expect(function(){
				ds.loadData();
			}).toThrow();
		});

		describe("First:", function(){
			it("Calls .setState('loading')", function(){
				spyOn(testDs, "setState");
				testDs.loadData();
				expect(testDs.setState).toHaveBeenCalledWith(luga.data.STATE.LOADING);
			});
		});

		describe("Then:", function(){
			it("Triggers a 'loading' notification", function(){
				testDs.loadData();
				expect(testObserver.onDataLoadingHandler).toHaveBeenCalledWith({dataSet: testDs});
			});
		});

		describe("Then:", function(){
			it("Call .cancelRequest() to abort any pending request", function(){
				spyOn(testDs, "cancelRequest").and.callFake(function(){
				});
				testDs.loadData();
				expect(testDs.cancelRequest).toHaveBeenCalled();
			});
		});

		describe("Then:", function(){
			it("Fires an XHR request to fetch and load the data", function(done){
				testDs.loadData();
				setTimeout(function(){
					expect(testDs.getRecordsCount()).toEqual(7);
					done();
				}, DEFAULT_TIMEOUT);
			});
		});

		describe("Then:", function(){
			it("Update its .headers properties", function(done){
				var oldHeaders = testDs.headers;
				testDs.loadData();
				setTimeout(function(){
					expect(oldHeaders).not.toEqual(testDs.headers);
					done();
				}, DEFAULT_TIMEOUT);
			});
		});

		describe("Then:", function(){
			it("If options.incrementalLoad is false. Call .delete() to empty the dataSet", function(done){
				spyOn(testDs, "delete").and.callFake(function(){
				});
				testDs.loadData();
				setTimeout(function(){
					expect(testDs.delete).toHaveBeenCalled();
					done();
				}, DEFAULT_TIMEOUT);
			});
			it("Else doesn't call .delete()", function(done){
				testDs.incrementalLoad = true;
				spyOn(testDs, "delete").and.callFake(function(){
				});
				testDs.loadData();
				setTimeout(function(){
					expect(testDs.delete).not.toHaveBeenCalled();
					done();
				}, DEFAULT_TIMEOUT);
			});
		});

		describe("Finally:", function(){
			it("Call .loadRecords()", function(done){
				spyOn(testDs, "loadRecords").and.callFake(function(){
				});
				testDs.loadData();
				setTimeout(function(){
					expect(testDs.loadRecords).toHaveBeenCalled();
					done();
				}, DEFAULT_TIMEOUT);
			});
		});

		describe("In case of an HTTP error", function(){

			describe("First:", function(){
				it("Invokes .xhrError()", function(done){
					spyOn(testDs, "xhrError");
					testDs.setUrl("missing.json");
					testDs.loadData();
					setTimeout(function(){
						expect(testDs.xhrError).toHaveBeenCalled();
						done();
					}, DEFAULT_TIMEOUT);
				});
			});
			describe("Then:", function(){
				it("Triggers an 'xhrError' notification in case of an HTTP error", function(done){
					testDs.setUrl("missing.json");
					testDs.loadData();
					setTimeout(function(){
						expect(testObserver.onXhrErrorHandler).toHaveBeenCalled();
						done();
					}, DEFAULT_TIMEOUT);
				});
			});

		});

	});

	describe(".loadRecords()", function(){
		it("Is an abstract method, child classes must implement it to extract records from XHR response", function(){
			expect(jQuery.isFunction(testDs.loadRecords)).toBeTruthy();
		});
	});

	describe(".setUrl()", function(){
		it("Set the URL that will be used to fetch the data", function(){
			testDs.setUrl("test.json");
			expect(testDs.getUrl()).toEqual("test.json");
		});
	});

	describe(".xhrError()", function(){

		it("Is the default handler for XHR errors", function(){
			expect(testDs.xhrError).toBeDefined();
		});

		describe("First:", function(){
			it("Calls .setState('error')", function(){
				spyOn(testDs, "setState");
				testDs.xhrError({});
				expect(testDs.setState).toHaveBeenCalledWith(luga.data.STATE.ERROR);
			});
		});

		describe("Then:", function(){
			it("Triggers an 'error' notification", function(){
				var testObserver = {
					onXhrErrorHandler: function(){
					}
				};
				spyOn(testObserver, "onXhrErrorHandler");
				testDs.addObserver(testObserver);
				testDs.xhrError({});
				expect(testObserver.onXhrErrorHandler).toHaveBeenCalled();
			});
		});

	});

});