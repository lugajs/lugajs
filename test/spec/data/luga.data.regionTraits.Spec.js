describe("luga.data.regionTraits", function(){

	"use strict";

	var CONST, ladiesRecords, ladiesDs, ladiesDiv, ladiesRegion;
	beforeEach(function(){

		CONST = {
			LINK_LI_SELECTOR: "li a"
		};

		loadFixtures("data/regionTraits/generic.htm");

		ladiesRecords = getJSONFixture("data/ladies.json");
		ladiesDs = new luga.data.DataSet({id: "testDs", records: ladiesRecords});
		ladiesDiv = jQuery("#ladies");

		ladiesRegion = new luga.data.Region({
			node: ladiesDiv,
			dsId: "testDs"
		});

	});

	it("Stores a sets of traits that can be used to extend the functionality of a region", function(){
		expect(luga.data.regionTraits).toBeDefined();
	});

	describe(".setRowId()", function(){

		describe("Handles the data-lugads-setrowid custom attribute", function(){

			it("Attach a onclick='dataSource.setCurrentRowId(rowId)' event to each HTML tag using it", function(){
				spyOn(ladiesDs, "setCurrentRowId");
				luga.data.regionTraits.setRowId({
					node: ladiesDiv,
					dataSource: ladiesDs
				});
				var firstItem = jQuery(ladiesDiv.find(CONST.LINK_LI_SELECTOR)[0]);
				var secondItem = jQuery(ladiesDiv.find(CONST.LINK_LI_SELECTOR)[1]);
				firstItem.click();
				expect(ladiesDs.setCurrentRowId).toHaveBeenCalledWith("0");
				secondItem.click();
				expect(ladiesDs.setCurrentRowId).toHaveBeenCalledWith("1");
			});

		});

	});

});