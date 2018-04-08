describe("luga.data.HttpDataSet", function(){

	"use strict";

	let testDs;
	beforeEach(function(){
		testDs = new luga.data.JsonDataSet({uuid: "jsonDs"});
	});

	it("Is an abstract class. Throws an exception if instantiated directly", function(){
		expect(function(){
			new luga.data.HttpDataSet({uuid: "tryThis"});
		}).toThrow();
	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	it("Extends luga.data.Dataset", function(){
		expect(testDs).toMatchDuckType(new luga.data.DataSet({uuid: "duck"}));
	});

	describe("Its constructor options are the same as luga.data.DataSet and may also contains:", function(){

		it("options.url", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs", url: "test.json"});
			expect(ds.url).toEqual("test.json");
		});

		it("options.cache (a flag to turn on XHR caching)", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs"});
			expect(ds.cache).toBe(true);
			const fastDs = new luga.data.JsonDataSet({uuid: "fastDs", cache: false});
			expect(fastDs.cache).toBe(false);
		});

		it("options.headers (array of name/value pairs to be used as custom HTTP headers)", function(){
			const ds = new luga.data.JsonDataSet({
				uuid: "myDs"
				, headers: [{name: "X-Requested-With", value: "ciccio"}]
			});
			expect(ds.headers).toEqual([{name: "X-Requested-With", value: "ciccio"}]);
		});

		it("options.incrementalLoad ", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs", incrementalLoad: true});
			expect(ds.incrementalLoad).toEqual(true);
		});

		it("options.timeout (timeout for XHR requests))", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs"});
			expect(ds.timeout).toEqual(luga.data.CONST.XHR_TIMEOUT);
			const fastDs = new luga.data.JsonDataSet({uuid: "fastDs", timeout: 200});
			expect(fastDs.timeout).toEqual(200);
		});

	});

	describe(".contentType", function(){
		it("Can ve overridden by child classes", function(){
			const jsonDs = new luga.data.JsonDataSet({uuid: "myJsonDs"});
			expect(jsonDs.contentType).toEqual("application/json");
			const xmlDs = new luga.data.XmlDataSet({uuid: "myXmlDs"});
			expect(xmlDs.contentType).toEqual("application/xml");
		});
	});

	describe(".cancelRequest()", function(){
		it("Abort any pending XHR request", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs"});
			ds.setUrl("test.json");
			ds.loadData();
			ds.cancelRequest();
			expect(ds.xhrRequest).toBeNull();
		});
	});

	describe(".getUrl()", function(){
		it("Returns the URL that will be used to fetch the data", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs", url: "test.json"});
			expect(ds.getUrl()).toEqual("test.json");
		});
		it("Returns null if URL is not set", function(){
			expect(testDs.getUrl()).toBeNull();
		});
	});

	describe(".loadData()", function(){

		let mockJson, testJsonDs, testObserver;
		beforeEach(function(){

			mockJson = jasmineFixtures.read("data/ladies.json");

			jasmine.Ajax.install();
			jasmine.Ajax.stubRequest("mock/missing.json").andReturn({
				status: 404
			});
			jasmine.Ajax.stubRequest("mock/ladies.json").andReturn({
				contentType: "application/json",
				responseText: JSON.stringify(mockJson),
				status: 200
			});

			testJsonDs = new luga.data.JsonDataSet({uuid: "uniqueDs", url: "mock/ladies.json"});
			testObserver = {
				onDataChangedHandler: function(){
				},
				onDataLoadingHandler: function(){
				},
				onXhrErrorHandler: function(){
				}
			};
			testJsonDs.addObserver(testObserver);
			spyOn(testObserver, "onDataChangedHandler");
			spyOn(testObserver, "onDataLoadingHandler");
			spyOn(testObserver, "onXhrErrorHandler");
		});

		afterEach(function(){
			jasmine.Ajax.uninstall();
		});

		it("Throws an exception if the dataSet's URL is null", function(){
			const ds = new luga.data.JsonDataSet({uuid: "myDs"});
			expect(function(){
				ds.loadData();
			}).toThrow();
		});

		describe("First:", function(){
			it("Calls .setState('loading')", function(){
				spyOn(testJsonDs, "setState");
				testJsonDs.loadData();
				expect(testJsonDs.setState).toHaveBeenCalledWith(luga.data.STATE.LOADING);
			});
		});

		describe("Then:", function(){
			it("Triggers a 'loading' notification", function(){
				testJsonDs.loadData();
				expect(testObserver.onDataLoadingHandler).toHaveBeenCalledWith({dataSet: testJsonDs});
			});
		});

		describe("Then:", function(){
			it("Call .cancelRequest() to abort any pending request", function(){
				spyOn(testJsonDs, "cancelRequest").and.callFake(function(){
				});
				testJsonDs.loadData();
				expect(testJsonDs.cancelRequest).toHaveBeenCalled();
			});
		});

		describe("Then:", function(){
			it("Fires an XHR request to fetch and load the data", function(){
				testJsonDs.loadData();
				expect(testJsonDs.getRecordsCount()).toEqual(7);
			});
		});

		describe("Then:", function(){
			it("If options.incrementalLoad is false. Call .delete() to empty the dataSet", function(){
				spyOn(testJsonDs, "delete").and.callFake(function(){
				});
				testJsonDs.loadData();
				expect(testJsonDs.delete).toHaveBeenCalled();
			});
			it("Else doesn't call .delete()", function(){
				testJsonDs.incrementalLoad = true;
				spyOn(testJsonDs, "delete").and.callFake(function(){
				});
				testJsonDs.loadData();
				expect(testJsonDs.delete).not.toHaveBeenCalled();
			});
		});

		describe("Finally:", function(){

			it("Call .loadRecords()", function(){
				spyOn(testJsonDs, "loadRecords").and.callFake(function(){
				});
				testJsonDs.loadData();
				expect(testJsonDs.loadRecords).toHaveBeenCalled();
			});

			it("Uses custom headers if specified", function(){
				testJsonDs.headers = [{name: "x-msg", value:"Ciao Mamma"}];
				testJsonDs.loadData();
				const request = jasmine.Ajax.requests.mostRecent();
				expect(request.requestHeaders["x-msg"]).toEqual("Ciao Mamma");
			});

			it("Headers are preserved across multiple calls", function(){
				const oldHeaders = testJsonDs.headers;
				testJsonDs.loadData();
				testJsonDs.loadData();
				expect(oldHeaders).toEqual(testJsonDs.headers);
			});
		});

		describe("In case of an HTTP error", function(){

			describe("First:", function(){
				it("Invokes .xhrError()", function(){
					spyOn(testJsonDs, "xhrError");
					testJsonDs.setUrl("mock/missing.json");
					testJsonDs.loadData();
					expect(testJsonDs.xhrError).toHaveBeenCalled();
				});
			});
			describe("Then:", function(){
				it("Triggers an 'xhrError' notification in case of an HTTP error", function(){
					testJsonDs.setUrl("mock/missing.json");
					testJsonDs.loadData();
					expect(testObserver.onXhrErrorHandler).toHaveBeenCalled();
				});
			});

		});

	});

	describe(".loadRecords()", function(){
		it("Is an abstract method, child classes must implement it to extract records from XHR response", function(){
			expect(luga.type(testDs.loadRecords)).toEqual("function");
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
				const testObserver = {
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