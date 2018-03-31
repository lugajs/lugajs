describe("luga.data.region.utils", function(){

	"use strict";

	var testDs, testDiv, testRegion;
	beforeEach(function(){

		testDs = new luga.data.DataSet({uuid: "testDs"});
		testDiv = document.createElement("div");
		testDiv.textContent = "Ciao Mamma";
		testRegion = new luga.data.region.Base({
			node: testDiv,
			ds: testDs
		});

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	it("Contains generic, static methods and utilities for regions", function(){
		expect(luga.data.region.utils).toBeDefined();
	});

	describe(".assembleRegionDescription()", function(){

		describe("Given a region instance,, returns an object containing the following fields:", function(){
			it("node (a DOM node containing the region)", function(){
				var desc = luga.data.region.utils.assembleRegionDescription(testRegion);
				expect(desc.node.textContent).toEqual(testDiv.textContent);
			});
			it("ds (the associated dataSource)", function(){
				var desc = luga.data.region.utils.assembleRegionDescription(testRegion);
				expect(desc.ds).toEqual(testDs);
			});
		});

	});

});