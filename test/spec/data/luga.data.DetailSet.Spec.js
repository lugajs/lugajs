describe("luga.data.DetailSet", function(){

	"use strict";

	var emptyDs, loadedDs, testRecords, detailSet, emptyDetailSet;
	beforeEach(function(){

		testRecords = getJSONFixture("data/ladies.json");
		emptyDs = new luga.data.DataSet({id: "test"});
		loadedDs = new luga.data.DataSet({id: "myDs", records: testRecords});


		detailSet = new luga.data.DetailSet({id: "detailTest", dataSet: loadedDs});
		emptyDetailSet = new luga.data.DetailSet({id: "detailTest", dataSet: emptyDs});

	});

	it("Is the detailSet class", function(){
		expect(jQuery.isFunction(luga.data.DetailSet)).toBeTruthy();
	});

	it("Implements the Notifier interface", function(){
		expect(jQuery.isFunction(detailSet.addObserver)).toBeTruthy();
		expect(jQuery.isFunction(detailSet.notifyObservers)).toBeTruthy();
		expect(jQuery.isArray(detailSet.observers)).toBeTruthy();
	});

	describe("Accepts an Options object as single argument", function(){

		describe("options.id", function(){
			it("Acts as unique identifier that will be stored inside a global registry", function(){
				var ds = new luga.data.DetailSet({id: "uniqueId", dataSet: emptyDs});
				expect(luga.data.dataSourceRegistry.uniqueId).toEqual(ds);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.DetailSet({dataSet: emptyDs});
				}).toThrow();
			});
		});

		describe("options.dataSet", function(){
			it("Is the dataSource that will be used by the detailSet", function(){
				var ds = new luga.data.DetailSet({id: "uniqueId", dataSet: emptyDs});
				expect(ds.dataSet).toEqual(emptyDs);
			});
			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.DetailSet({id: "uniqueId"});
				}).toThrow();
			});
		});

		describe("Once initialized", function(){
			it("Calls luga.data.setDataSource()", function(){
				spyOn(luga.data, "setDataSource").and.callFake(function() {
				});
				var testDetailSet = new luga.data.DetailSet({id: "test", dataSet: emptyDs});
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

});