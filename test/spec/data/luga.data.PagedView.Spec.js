describe("luga.data.PagedView", function(){

	"use strict";

	var emptyDs, loadedDs, testRecords, pagedView, testObserver;
	beforeEach(function(){

		testRecords = jasmineFixtures.read("data/ladies.json");
		emptyDs = new luga.data.DataSet({uuid: "test"});
		loadedDs = new luga.data.DataSet({uuid: "myDs", records: testRecords});

		pagedView = new luga.data.PagedView({uuid: "detailTest", parentDataSet: loadedDs});

		testObserver = {
			onDataChangedHandler: function(){
			}
		};
		pagedView.addObserver(testObserver);
		spyOn(testObserver, "onDataChangedHandler");

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
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
				expect(loadedDs.observers[0]).toEqual(pagedView);
			});
		});

	});

});