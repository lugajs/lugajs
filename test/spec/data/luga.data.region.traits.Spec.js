describe("luga.data.region.traits", function(){

	"use strict";

	var CONST, ladiesRecords, ladiesDs;
	beforeEach(function(){

		CONST = {
			LINK_LI_SELECTOR: "li a"
		};

		loadFixtures("data/region/traits/generic.htm");

		ladiesRecords = getJSONFixture("data/ladies.json");
		ladiesDs = new luga.data.DataSet({id: "testDs", records: ladiesRecords});

	});

	it("Stores a sets of traits that can be used to extend the functionality of a region", function(){
		expect(luga.data.region.traits).toBeDefined();
	});

	describe(".setRowId()", function(){

		describe("Handles the data-lugads-setrowid custom attribute", function(){

			it("Attach a onclick='dataSource.setCurrentRowId(rowId)' event to each HTML tag containing it", function(){
				spyOn(ladiesDs, "setCurrentRowId");

				var testDiv = jQuery("#setrowid");
				luga.data.region.traits.setRowId({
					node: testDiv,
					dataSource: ladiesDs
				});
				var firstItem = jQuery(testDiv.find(CONST.LINK_LI_SELECTOR)[0]);
				var secondItem = jQuery(testDiv.find(CONST.LINK_LI_SELECTOR)[1]);

				firstItem.click();
				expect(ladiesDs.setCurrentRowId).toHaveBeenCalledWith("0");
				secondItem.click();
				expect(ladiesDs.setCurrentRowId).toHaveBeenCalledWith("1");
			});

		});

	});

	describe(".setRowIndex()", function(){

		describe("Handles the data-lugads-setrowid custom attribute", function(){

			it("Attach a onclick='dataSource.setCurrentRowIndex(rowIndex)' event to each HTML tag containing it", function(){
				spyOn(ladiesDs, "setCurrentRowIndex");

				var testDiv = jQuery("#setrowindex");
				luga.data.region.traits.setRowIndex({
					node: testDiv,
					dataSource: ladiesDs
				});
				var firstItem = jQuery(testDiv.find(CONST.LINK_LI_SELECTOR)[0]);
				var secondItem = jQuery(testDiv.find(CONST.LINK_LI_SELECTOR)[1]);

				firstItem.click();
				expect(ladiesDs.setCurrentRowIndex).toHaveBeenCalledWith(0);
				secondItem.click();
				expect(ladiesDs.setCurrentRowIndex).toHaveBeenCalledWith(1);
			});

		});

	});

	describe(".sort()", function(){

		describe("Handles the data-lugads-sort custom attribute", function(){

			it("Attach a onclick='dataSource.sort(columnName)' event to each HTML tag containing it", function(){
				spyOn(ladiesDs, "sort");

				var testDiv = jQuery("#sort");
				luga.data.region.traits.sort({
					node: testDiv,
					dataSource: ladiesDs
				});
				var firstItem = jQuery(testDiv.find(CONST.LINK_LI_SELECTOR)[0]);

				firstItem.click();
				expect(ladiesDs.sort).toHaveBeenCalledWith("lastName");
			});

		});

	});

});