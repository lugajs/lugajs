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
});