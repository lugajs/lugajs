describe("luga.data.region.traits", function(){

	"use strict";

	let CONST, ladiesRecords, ladiesDs;
	beforeEach(function(){

		CONST = {
			LINK_LI_SELECTOR: "li a"
		};

		jasmineFixtures.loadHTML("data/region/traits/generic.htm");

		ladiesRecords = jasmineFixtures.read("data/ladies.json");
		ladiesDs = new luga.data.DataSet({uuid: "testDs", records: ladiesRecords});



	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	it("Stores a sets of traits that can be used to extend the functionality of a region", function(){
		expect(luga.data.region.traits).toBeDefined();
	});

	describe(".select()", function(){

		describe("Handles the data-lugaregion-select custom attribute", function(){

			it("Attach the specified CSS class to the current row inside the region", function(){
				const testDiv = document.getElementById("select");
				luga.data.region.traits.select({
					node: testDiv,
					dataSource: ladiesDs
				});
				const firstItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[0];
				expect(firstItem).toHaveClass("selectedRow");
			});

			it("Remove the specified CSS class if the current row is null", function(){
				ladiesDs.setCurrentRowId(null);
				const testDiv = document.getElementById("select");
				luga.data.region.traits.select({
					node: testDiv,
					dataSource: ladiesDs
				});
				expect(testDiv.querySelector(CONST.LINK_LI_SELECTOR)).not.toHaveClass("selectedRow");
			});

			it("Attach an onclick event to each HTML tag containing it. Once clicked, the element will be the only one using the CSS class", function(){
				const testDiv = document.getElementById("select");
				luga.data.region.traits.select({
					node: testDiv,
					dataSource: ladiesDs
				});
				const firstItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[0];
				const secondItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[1];

				// Simulate click
				secondItem.click();

				expect(firstItem).not.toHaveClass("selectedRow");
				expect(secondItem).toHaveClass("selectedRow");
			});

			it("Does nothing if the dataSource is a detailSet", function(){
				const testDiv = document.createElement("div");
				testDiv.setAttribute("data-lugaregion-select", "selectedRow");
				testDiv.setAttribute("href", "#");
				testDiv.textContent = "Test";

				const detailSet = new luga.data.DetailSet({uuid: "detailTest", parentDataSet: ladiesDs});
				luga.data.region.traits.select({
					node: testDiv,
					dataSource: detailSet
				});
				const firstItem = testDiv.querySelectorAll("a")[0];
				expect(firstItem).not.toHaveClass("selectedRow");
			});

		});

	});

	describe(".setRowId()", function(){

		describe("Handles the data-lugaregion-setrowid custom attribute", function(){

			it("Attach a onclick='dataSource.setCurrentRowId(rowId)' event to each HTML tag containing it", function(){
				spyOn(ladiesDs, "setCurrentRowId");

				const testDiv = document.getElementById("setrowid");
				luga.data.region.traits.setRowId({
					node: testDiv,
					dataSource: ladiesDs
				});
				const firstItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[0];
				const secondItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[1];

				firstItem.click();
				expect(ladiesDs.setCurrentRowId).toHaveBeenCalledWith("0");
				secondItem.click();
				expect(ladiesDs.setCurrentRowId).toHaveBeenCalledWith("1");
			});

		});

	});

	describe(".setRowIndex()", function(){

		describe("Handles the data-lugaregion-setrowid custom attribute", function(){

			it("Attach a onclick='dataSource.setCurrentRowIndex(rowIndex)' event to each HTML tag containing it", function(){
				spyOn(ladiesDs, "setCurrentRowIndex");

				const testDiv = document.getElementById("setrowindex");
				luga.data.region.traits.setRowIndex({
					node: testDiv,
					dataSource: ladiesDs
				});
				const firstItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[0];
				const secondItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[1];

				firstItem.click();
				expect(ladiesDs.setCurrentRowIndex).toHaveBeenCalledWith(0);
				secondItem.click();
				expect(ladiesDs.setCurrentRowIndex).toHaveBeenCalledWith(1);
			});

		});

	});

	describe(".sort()", function(){

		describe("Handles the data-lugaregion-sort custom attribute", function(){

			it("Attach a onclick='dataSource.sort(columnName)' event to each HTML tag containing it", function(){
				spyOn(ladiesDs, "sort");

				const testDiv = document.getElementById("sort");
				luga.data.region.traits.sort({
					node: testDiv,
					dataSource: ladiesDs
				});
				const firstItem = testDiv.querySelectorAll(CONST.LINK_LI_SELECTOR)[0];

				firstItem.click();
				expect(ladiesDs.sort).toHaveBeenCalledWith("lastName");
			});

		});

	});

});