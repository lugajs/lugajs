describe("luga.data.PagedView", function(){

	"use strict";

	var emptyDs, jsonDs, pagedView, plainPagedView, testObserver;
	beforeEach(function(){

		var testRecords = jasmineFixtures.read("data/usa-states.json");
		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest("data/usa-states.json").andReturn({
			contentType: "application/json",
			responseText: JSON.stringify(testRecords),
			status: 200
		});

		emptyDs = new luga.data.DataSet({uuid: "test"});
		jsonDs = new luga.data.JsonDataSet({uuid: "myDs", url: "data/usa-states.json"});

		pagedView = new luga.data.PagedView({uuid: "pagedViewTest", parentDataSet: jsonDs});
		plainPagedView = new luga.data.PagedView({uuid: "plainPagedViewTest", parentDataSet: emptyDs});

		testObserver = {
			onCurrentRowChangedHandler: function(){
			},
			onDataChangedHandler: function(){
			},
			onStateChangedHandler: function(){
			}
		};
		pagedView.addObserver(testObserver);
		spyOn(testObserver, "onCurrentRowChangedHandler");
		spyOn(testObserver, "onDataChangedHandler");
		spyOn(testObserver, "onStateChangedHandler");

		pagedView.loadData();

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
		jasmine.Ajax.uninstall();
	});

	it("Is the pagedView constructor", function(){
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
				expect(ds.getPageSize()).toEqual(30);
			});
			it("Default to 10", function(){
				expect(pagedView.getPageSize()).toEqual(10);
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
				expect(jsonDs.observers[0]).toEqual(pagedView);
			});

		});

	});

	describe("The following methods are just proxies to the parentDataset", function(){

		it(".getCurrentRowIndex()", function(){
			spyOn(jsonDs, "getCurrentRowIndex");
			pagedView.getCurrentRowIndex();
			expect(jsonDs.getCurrentRowIndex).toHaveBeenCalled();
		});

		it(".getRecordsCount()", function(){
			spyOn(jsonDs, "getRecordsCount");
			pagedView.getRecordsCount();
			expect(jsonDs.getRecordsCount).toHaveBeenCalled();
		});

		it(".setCurrentRowId()", function(){
			spyOn(jsonDs, "setCurrentRowId");
			pagedView.setCurrentRowId("testId");
			expect(jsonDs.setCurrentRowId).toHaveBeenCalledWith("testId");
		});

		it(".setCurrentRowIndex()", function(){
			spyOn(jsonDs, "setCurrentRowIndex");
			pagedView.setCurrentRowIndex(3);
			expect(jsonDs.setCurrentRowIndex).toHaveBeenCalledWith(3);
		});

		it(".setState()", function(){
			spyOn(jsonDs, "setState");
			pagedView.setState(luga.data.STATE.LOADING);
			expect(jsonDs.setState).toHaveBeenCalledWith(luga.data.STATE.LOADING);
		});

	});

	describe("The following event handlers propagate events fired by the parent dataset:", function(){

		it(".onDataChangedHandler()", function(){
			pagedView.onDataChangedHandler({});
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: pagedView});
		});

		it(".onDataChangedHandler()", function(){
			pagedView.onStateChangedHandler({});
			expect(testObserver.onStateChangedHandler).toHaveBeenCalledWith({dataSource: pagedView});
		});

	});

	describe(".getContext()", function(){

		it("Invoke .getContext() on the parent dataSet", function(){
			spyOn(jsonDs, "getContext").and.callThrough();
			pagedView.getContext();
			expect(jsonDs.getContext).toHaveBeenCalled();
		});

		it("Return the pagedView context (of type luga.data.PagedView.context)", function(){

			var context = pagedView.getContext();
			expect(context.recordCount).toEqual(59);
			expect(context.currentPageNumber).toEqual(1);
			expect(context.currentPageRecordCount).toEqual(10);
			expect(context.currentOffsetEnd).toEqual(9);
			expect(context.currentOffsetStart).toEqual(0);
			expect(context.pageSize).toEqual(10);
			expect(context.pageCount).toEqual(6);

			// Matching all entities would be a bit overkilling
			expect(context.entities.length).toEqual(10);
			expect(context.entities[0]).toEqual({name: "Alabama", abbreviation: "AL", lugaRowId: "lugaPk_0"});
			expect(context.entities[9]).toEqual({
				name: "District Of Columbia",
				abbreviation: "DC",
				lugaRowId: "lugaPk_9"
			});

			// Navigate to last page and check changed values
			pagedView.goToPage(6);
			context = pagedView.getContext();
			expect(context.currentPageNumber).toEqual(6);
			expect(context.currentPageRecordCount).toEqual(9);
			expect(context.currentOffsetEnd).toEqual(59);
			expect(context.currentOffsetStart).toEqual(50);
		});

	});

	describe(".getCurrentOffsetEnd()", function(){

		it("Return 0 if the parentDataSet is empty", function(){
			expect(plainPagedView.getCurrentOffsetEnd()).toEqual(0);
		});

		it("Return the zero-based offset of the last record inside the current page", function(){
			expect(pagedView.getCurrentOffsetEnd()).toEqual(9);
			pagedView.goToPage(3);
			expect(pagedView.getCurrentOffsetEnd()).toEqual(29);
			pagedView.goToPage(6);
			expect(pagedView.getCurrentOffsetEnd()).toEqual(59);
		});

	});

	describe(".getCurrentOffsetStart()", function(){

		it("Return 0 if the parentDataSet is empty", function(){
			expect(plainPagedView.getCurrentOffsetStart()).toEqual(0);
		});

		it("Return the zero-based offset of the first record inside the current page", function(){
			expect(pagedView.getCurrentOffsetStart()).toEqual(0);
			pagedView.goToPage(3);
			expect(pagedView.getCurrentOffsetStart()).toEqual(20);
			pagedView.goToPage(6);
			expect(pagedView.getCurrentOffsetStart()).toEqual(50);
		});

	});

	describe(".getCurrentPageIndex()", function(){

		it("Return 1 if the parentDataSet is empty", function(){
			expect(plainPagedView.getCurrentPageIndex()).toEqual(1);
		});

		it("Return the current page index. Starting at 1", function(){
			expect(pagedView.getCurrentPageIndex()).toEqual(1);
			pagedView.goToPage(3);
			expect(pagedView.getCurrentPageIndex()).toEqual(3);
		});

	});

	describe(".getPagesCount()", function(){

		it("Return 0 if the parentDataSet is empty", function(){
			expect(plainPagedView.getPagesCount()).toEqual(0);
		});

		it("Return the current page index. Starting at 1", function(){
			expect(pagedView.getPagesCount()).toEqual(6);
			pagedView.goToPage(3);
			expect(pagedView.getPagesCount()).toEqual(6);
		});

	});

	describe(".getPageSize()", function(){

		it("Return the value of options.pageSize", function(){
			var ds = new luga.data.PagedView({uuid: "uniqueId", parentDataSet: emptyDs, pageSize: 30});
			expect(ds.getPageSize()).toEqual(30);
		});

		it("Return 10 if options.pageSize has not been specified", function(){
			expect(plainPagedView.getPageSize()).toEqual(10);
		});

	});

	describe(".goToPage()", function(){

		describe("Perform multiple actions:", function(){

			it("Set the current page number", function(){
				expect(pagedView.getCurrentPageIndex()).toEqual(1);
				pagedView.goToPage(2);
				expect(pagedView.getCurrentPageIndex()).toEqual(2);
			});

			it("Set the current offsetStart", function(){
				expect(pagedView.getCurrentOffsetStart()).toEqual(0);
				pagedView.goToPage(2);
				expect(pagedView.getCurrentOffsetStart()).toEqual(10);
			});

			it("Set the current rowIndex", function(){
				expect(pagedView.getCurrentRowIndex()).toEqual(0);
				pagedView.goToPage(2);
				expect(pagedView.getCurrentRowIndex()).toEqual(10);
			});

		});

		describe("Fails silently if the  given page number is:", function(){

			it("Out of range", function(){
				expect(plainPagedView.getCurrentPageIndex()).toEqual(1);
				plainPagedView.goToPage(-1);
				expect(plainPagedView.getCurrentPageIndex()).toEqual(1);
				plainPagedView.goToPage(0);
				expect(plainPagedView.getCurrentPageIndex()).toEqual(1);
				plainPagedView.goToPage(7);
				expect(plainPagedView.getCurrentPageIndex()).toEqual(1);
			});

			it("Equal to the current page number", function(){
				spyOn(pagedView, "setCurrentRowIndex");
				pagedView.goToPage(1);
				expect(pagedView.setCurrentRowIndex).not.toHaveBeenCalled();
			});

		});

	});

	describe(".goToNextPage()", function(){

		it("Navigate to the next page", function(){
			expect(pagedView.getCurrentPageIndex()).toEqual(1);
			pagedView.goToNextPage();
			expect(pagedView.getCurrentPageIndex()).toEqual(2);
			pagedView.goToNextPage();
			expect(pagedView.getCurrentPageIndex()).toEqual(3);
		});

		it("Fails silently if the current page is the last one", function(){
			pagedView.goToPage(6);
			expect(pagedView.getCurrentPageIndex()).toEqual(6);
			pagedView.goToNextPage();
			expect(pagedView.getCurrentPageIndex()).toEqual(6);
		});

	});

	describe(".goToPrevPage()", function(){

		it("Navigate to the next page", function(){
			pagedView.goToPage(6);
			expect(pagedView.getCurrentPageIndex()).toEqual(6);
			pagedView.goToPrevPage();
			expect(pagedView.getCurrentPageIndex()).toEqual(5);
			pagedView.goToPrevPage();
			expect(pagedView.getCurrentPageIndex()).toEqual(4);
		});

		it("Fails silently if the current page is the first one", function(){
			expect(pagedView.getCurrentPageIndex()).toEqual(1);
			pagedView.goToPrevPage();
			expect(pagedView.getCurrentPageIndex()).toEqual(1);
		});

	});

	describe(".isPageInRange()", function(){

		describe("Return true if:", function(){

			it("If the given page number is in range", function(){
				expect(pagedView.isPageInRange(1)).toEqual(true);
				expect(pagedView.isPageInRange(3)).toEqual(true);
				expect(pagedView.isPageInRange(6)).toEqual(true);
			});

		});

		describe("Return false if", function(){

			it("If the parentDataSet is empty", function(){
				expect(plainPagedView.isPageInRange(1)).toEqual(false);
				expect(plainPagedView.isPageInRange(0)).toEqual(false);
			});

			it("If the given page number is out of range", function(){
				expect(pagedView.isPageInRange(7)).toEqual(false);
			});

			it("If the given page number is negative", function(){
				expect(pagedView.isPageInRange(-1)).toEqual(false);
			});

		});

	});

	describe(".loadData()", function(){

		it("If the parent dataSet is HTTP based: invoke its .loadData() method", function(){
			spyOn(jsonDs, "loadData");
			pagedView.loadData();
			expect(jsonDs.loadData).toHaveBeenCalled();
		});

		it("Else: fails silently", function(){
			expect(function(){
				plainPagedView.loadData();
			}).not.toThrow();
		});

	});

	describe(".sort()", function(){

		it("First: invoke .sort() on the parent dataSet", function(){
			spyOn(jsonDs, "sort");
			pagedView.sort("name", luga.data.sort.ORDER.ASC);
			expect(jsonDs.sort).toHaveBeenCalledWith("name", luga.data.sort.ORDER.ASC);
		});

		it("The: triggers a 'dataChanged' notification", function(){
			pagedView.sort("name", luga.data.sort.ORDER.ASC);
			expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: pagedView});
		});

	});

});