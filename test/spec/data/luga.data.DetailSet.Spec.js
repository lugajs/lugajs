describe("luga.data.DetailSet", function(){

	"use strict";

	var emptyDs, loadedDs, testRecords, detailSet, emptyDetailSet, testObserver;
	beforeEach(function(){

		testRecords = jasmineFixtures.read("data/ladies.json");
		emptyDs = new luga.data.DataSet({uuid: "test"});
		loadedDs = new luga.data.DataSet({uuid: "myDs", records: testRecords});

		detailSet = new luga.data.DetailSet({uuid: "detailTest", parentDataSet: loadedDs});
		emptyDetailSet = new luga.data.DetailSet({uuid: "emptyDetailTest", parentDataSet: emptyDs});

		testObserver = {
			onDataChangedHandler: function(){
			}
		};
		detailSet.addObserver(testObserver);
		spyOn(testObserver, "onDataChangedHandler");

	});

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
	});

	it("Is the detailSet constructor", function(){
		expect(luga.type(luga.data.DetailSet)).toEqual("function");
	});

	it("Implements the luga.Notifier interface", function(){
		var MockNotifier = function(){
			luga.extend(luga.Notifier, this);
		};
		expect(detailSet).toMatchDuckType(new MockNotifier());
	});

	describe("Accepts an Options object as single argument", function(){

		describe("options.uuid", function(){
			it("Acts as unique identifier that will be stored inside a global registry", function(){
				var ds = new luga.data.DetailSet({uuid: "uniqueId", parentDataSet: emptyDs});
				expect(luga.data.dataSourceRegistry.uniqueId).toEqual(ds);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.DetailSet({parentDataSet: emptyDs});
				}).toThrow();
			});
		});

		describe("options.parentDataSet", function(){
			it("Is the dataSource that will be used by the detailSet", function(){
				var ds = new luga.data.DetailSet({uuid: "uniqueId", parentDataSet: emptyDs});
				expect(ds.parentDataSet).toEqual(emptyDs);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.DetailSet({uuid: "uniqueId"});
				}).toThrow();
			});
		});

		describe("Once initialized:", function(){
			it("Calls luga.data.setDataSource()", function(){
				spyOn(luga.data, "setDataSource").and.callFake(function(){
				});
				var testDetailSet = new luga.data.DetailSet({uuid: "test", parentDataSet: emptyDs});
				expect(luga.data.setDataSource).toHaveBeenCalledWith("test", testDetailSet);
			});
			it("Register itself as observer of options.dataSet", function(){
				expect(emptyDs.observers[0]).toEqual(emptyDetailSet);
			});
			it("Points its .row property to options.dataSet's current row", function(){
				expect(emptyDetailSet.row).toEqual(emptyDs.getCurrentRow());
				expect(detailSet.row).toEqual(loadedDs.getCurrentRow());
			});
		});

	});

	describe(".getContext()", function(){
		it("Returns the associated detailSet's context", function(){
			var contextMaster = new luga.data.DataSet({uuid: "contextMaster"});
			contextMaster.insert(testRecords);
			var contextDetail = new luga.data.DetailSet({uuid: "contextDetail", parentDataSet: contextMaster});
			var context = contextDetail.getContext();
			expect(context.entity).toEqual(loadedDs.getCurrentRow());
		});
	});

	describe(".getState()", function(){
		it("Returns the associated dataSet's current state", function(){
			expect(detailSet.getState()).toEqual(loadedDs.getState());
		});
	});

	describe(".fetchRow()", function(){

		describe("First:", function(){
			it("Grabs the associated dataSet's current row", function(){
				spyOn(loadedDs, "getCurrentRow").and.callFake(function(){
				});
				detailSet.fetchRow();
				expect(loadedDs.getCurrentRow).toHaveBeenCalled();
				expect(loadedDs.getCurrentRow()).toEqual(detailSet.row);
			});
		});

		describe("Then:", function(){
			it("Triggers a 'dataChanged' notification", function(){
				detailSet.fetchRow();
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: detailSet});
			});
		});

	});

	describe(".onCurrentRowChangedHandler()", function(){
		it("Is invoked whenever the associated dataSet's currentRow changes", function(){
			spyOn(detailSet, "onCurrentRowChangedHandler");
			loadedDs.setCurrentRowIndex(2);
			expect(detailSet.onCurrentRowChangedHandler).toHaveBeenCalled();
		});
		it("Invokes .fetchRow()", function(){
			spyOn(detailSet, "fetchRow");
			detailSet.onCurrentRowChangedHandler();
			expect(detailSet.fetchRow).toHaveBeenCalled();
		});
	});

	describe(".onDataChangedHandler()", function(){
		it("Is invoked whenever the associated dataSet's data changes", function(){
			spyOn(emptyDetailSet, "onDataChangedHandler");
			emptyDs.insert(testRecords);
			expect(emptyDetailSet.onDataChangedHandler).toHaveBeenCalled();
		});
		it("Invokes .fetchRow()", function(){
			spyOn(emptyDetailSet, "fetchRow");
			emptyDetailSet.onDataChangedHandler();
			expect(emptyDetailSet.fetchRow).toHaveBeenCalled();
		});
	});

	describe(".onStateChangedHandler()", function(){
		it("Is invoked whenever the associated dataSet's state changes", function(){
			spyOn(emptyDetailSet, "onStateChangedHandler");
			emptyDs.insert(testRecords);
			expect(emptyDetailSet.onStateChangedHandler).toHaveBeenCalled();
		});
		it("Invokes .fetchRow()", function(){
			spyOn(emptyDetailSet, "fetchRow");
			emptyDetailSet.onStateChangedHandler();
			expect(emptyDetailSet.fetchRow).toHaveBeenCalled();
		});
	});

});