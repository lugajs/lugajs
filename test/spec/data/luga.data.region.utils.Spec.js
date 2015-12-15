describe("luga.data.region.utils", function(){

	"use strict";

	it("Contains generic, static methods and utilities for regions", function(){
		expect(luga.data.region.utils).toBeDefined();
	});

	describe(".assembleRegionDescription()", function(){

		var testDs, testDiv, testRegion;
		beforeEach(function(){

			testDs = new luga.data.DataSet({id: "testDs"});
			testDiv = jQuery("<div>Ciao Mamma</div>");
			testRegion = new luga.data.region.Base({
				node: testDiv,
				ds: testDs
			});

		});

		describe("Given a region instance,, returns an object containing the following fields:", function(){
			it("node (a jQuery object wrapping the node containing the region)", function(){
				var desc = luga.data.region.utils.assembleRegionDescription(testRegion);
				expect(desc.node).toEqual(testDiv);
			});
			it("ds (the associated dataSource)", function(){
				var desc = luga.data.region.utils.assembleRegionDescription(testRegion);
				expect(desc.ds).toEqual(testDs);
			});
		});

	});

});