describe("luga.data.RemoteJsonDataSet", function(){

	"use strict";

	var stateRecords, jsonDs, remoteDs, DEFAULT_TIMEOUT;
	beforeEach(function(){
		stateRecords = getJSONFixture("data/usa-states.json");
		jsonDs = new luga.data.JsonDataSet({uuid: "jsonDs"});
		jsonDs.insert(stateRecords);
		remoteDs = new luga.data.RemoteJsonDataSet({
			uuid: "remoteDs",
			dataSet: jsonDs,
			urlPattern: "fixtures/data/usa-states-{abbreviation}.json"
		});
		DEFAULT_TIMEOUT = 2000;
	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	it("Is the remote JSON dataset class", function(){
		expect(jQuery.isFunction(luga.data.RemoteJsonDataSet)).toBeTruthy();
	});

	it("Extends luga.data.JsonDataSet", function(){
		expect(remoteDs).toMatchDuckType(new luga.data.JsonDataSet({uuid: "duck"}));
	});

	it("Register as observer of its dataSet", function(){
		expect(jsonDs.observers.indexOf(remoteDs)).not.toEqual(-1);

	});

	describe("Its constructor options are the same as luga.data.JsonDataSet and must also contains:", function(){

		describe("options.dataSet", function(){

			it("Is the master JsonDataSet", function(){
				expect(remoteDs.dataSet).toEqual(jsonDs);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.RemoteJsonDataSet({
						uuid: "remoteDs",
						urlPattern: "fixtures/data/usa-states-{abbreviation}.json"
					});
				}).toThrow();
			});

		});

		describe("options.urlPattern", function(){

			it("Is the pattern that will be used to compose the url", function(){
				expect(remoteDs.urlPattern).toEqual("fixtures/data/usa-states-{abbreviation}.json");
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.RemoteJsonDataSet({uuid: "remoteDs", dataSet: jsonDs});
				}).toThrow();
			});

		});

	});

	describe(".fetchData()", function(){

		beforeEach(function(){
			spyOn(remoteDs, "loadData");
		});

		describe("First:", function(){

			it("Use luga.string.replaceProperty", function(){
				spyOn(luga.string, "replaceProperty");
				remoteDs.fetchData(stateRecords[2]);
				expect(luga.string.replaceProperty).toHaveBeenCalledWith(remoteDs.urlPattern, stateRecords[2]);
			});
			it("To updates its .url property", function(){
				remoteDs.fetchData(stateRecords[2]);
				expect(remoteDs.url).toEqual("fixtures/data/usa-states-AS.json");
			});

		});

		describe("Then:", function(){

			it("Call .loadData()", function(){
				remoteDs.fetchData(stateRecords[2]);
				expect(remoteDs.loadData).toHaveBeenCalled();
			});

		});
	});

	describe(".onCurrentRowChangedHandler()", function(){

		it("Is invoked whenever the masterDataSet's currentRow changes", function(){
			spyOn(remoteDs, "onCurrentRowChangedHandler");
			jsonDs.setCurrentRowIndex(2);
			expect(remoteDs.onCurrentRowChangedHandler).toHaveBeenCalled();
		});
		it("Invokes .fetchData(). Passing the the masterDataSet's currentRow", function(){
			spyOn(remoteDs, "fetchData");
			jsonDs.setCurrentRowIndex(2);
			expect(remoteDs.fetchData).toHaveBeenCalledWith(stateRecords[2]);
		});

	});

});