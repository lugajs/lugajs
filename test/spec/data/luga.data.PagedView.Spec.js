describe("luga.data.PagedView", function(){

	"use strict";

	var emptyDs, parentDs, testRecords, pagedView, testObserver;
	beforeEach(function(){

		testRecords = jasmineFixtures.read("data/usa-states.json");
		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest("data/usa-states.json").andReturn({
			contentType: "application/json",
			responseText: JSON.stringify(testRecords),
			status: 200
		});

		emptyDs = new luga.data.DataSet({uuid: "test"});
		parentDs = new luga.data.JsonDataSet({uuid: "myDs", url: "data/usa-states.json"});

		pagedView = new luga.data.PagedView({uuid: "detailTest", parentDataSet: parentDs});

		testObserver = {
			onDataChangedHandler: function(){
			}
		};
		pagedView.addObserver(testObserver);
		spyOn(testObserver, "onDataChangedHandler");

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
		jasmine.Ajax.uninstall();
	});

	it("Is the pagedView class", function(){
		expect(jQuery.isFunction(luga.data.PagedView)).toEqual(true);
	});

	it("Implements the luga.Notifier interface", function(){
		var MockNotifier = function(){
			luga.extend(luga.Notifier, this);
		};
		expect(pagedView).toMatchDuckType(new MockNotifier());
	});

	describe("Accepts an Options object as single argument", function(){

		describe("options.uuid", function(){
			it("Acts as unique identifier that will be stored inside a global registry", function(){
				var ds = new luga.data.PagedView({uuid: "uniqueId", parentDataSet: emptyDs});
				expect(luga.data.dataSourceRegistry.uniqueId).toEqual(ds);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.PagedView({dataSet: emptyDs});
				}).toThrow();
			});
		});

		describe("options.parentDataSet", function(){
			it("Is the dataSource that will be used by the PagedView", function(){
				var ds = new luga.data.PagedView({uuid: "uniqueId", parentDataSet: emptyDs});
				expect(ds.parentDataSet).toEqual(emptyDs);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.PagedView({uuid: "uniqueId"});
				}).toThrow();
			});
		});

		describe("options.pageSize", function(){
			it("Is optional", function(){
				var ds = new luga.data.PagedView({uuid: "uniqueId", parentDataSet: emptyDs, pageSize: 30});
				expect(ds.pageSize).toEqual(30);
			});
			it("Default to 10", function(){
				expect(pagedView.pageSize).toEqual(10);
			});
		});

		describe("Once initialized:", function(){
			it("Calls luga.data.setDataSource()", function(){
				spyOn(luga.data, "setDataSource").and.callFake(function(){
				});
				var testPagedView = new luga.data.PagedView({uuid: "test", parentDataSet: emptyDs});
				expect(luga.data.setDataSource).toHaveBeenCalledWith("test", testPagedView);
			});
			it("Register itself as observer of options.dataSet", function(){
				expect(parentDs.observers[0]).toEqual(pagedView);
			});
		});

	});

	describe("The following methods are just proxies to the parentDataset", function(){

		it(".getRecordsCount()", function(){
			spyOn(parentDs, "getRecordsCount");
			pagedView.getRecordsCount();
			expect(parentDs.getRecordsCount).toHaveBeenCalled();
		});

		it(".loadData()", function(){
			spyOn(parentDs, "loadData");
			pagedView.loadData();
			expect(parentDs.loadData).toHaveBeenCalled();
		});

		it(".setCurrentRowId()", function(){
			spyOn(parentDs, "setCurrentRowId");
			pagedView.setCurrentRowId("testId");
			expect(parentDs.setCurrentRowId).toHaveBeenCalledWith("testId");
		});

		it(".setCurrentRowIndex()", function(){
			spyOn(parentDs, "setCurrentRowIndex");
			pagedView.setCurrentRowIndex(3);
			expect(parentDs.setCurrentRowIndex).toHaveBeenCalledWith(3);
		});

		it(".setState()", function(){
			spyOn(parentDs, "setState");
			pagedView.setState(luga.data.STATE.LOADING);
			expect(parentDs.setState).toHaveBeenCalledWith(luga.data.STATE.LOADING);
		});

		it(".sort()", function(){
			spyOn(parentDs, "sort");
			pagedView.sort("name", luga.data.sort.ORDER.ASC);
			expect(parentDs.sort).toHaveBeenCalledWith("name", luga.data.sort.ORDER.ASC);
		});

	});

});