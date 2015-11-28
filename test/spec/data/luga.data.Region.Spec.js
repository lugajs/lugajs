describe("luga.data.Region", function(){

	"use strict";

	var testRecords, loadedDs, testDiv, attributesDiv, configRegion, attributesRegion;
	beforeEach(function(){

		testRecords = getJSONFixture("data/ladies.json");
		loadedDs = new luga.data.DataSet({id: "testDs", records: testRecords});
		testDiv = jQuery("<div></div>");
		attributesDiv = jQuery("<div data-lugads-datasource='testDs'></div>");

		configRegion = new luga.data.Region({node: testDiv, dsId: "testDs"});
		attributesRegion = new luga.data.Region({node: attributesDiv});

	});

	describe("Accepts an Options object as single argument", function(){

		describe("options.node", function(){
			it("Is mandatory", function(){
				expect(function(){
					new luga.data.Region({dsId: "testDs"});
				}).toThrow();
			});
			it("Throws an exception if the associated node does not exists", function(){
				expect(function(){
					new luga.data.Region({
						node: jQuery("#missing")
					});
				}).toThrow();
			});
		});

		describe("options.dsId", function(){

			it("Is mandatory", function(){
				expect(function(){
					new luga.data.Region({node: testDiv});
				}).toThrow();
			});
			it("Throws an exception if the associated dataSource does not exists", function(){
				expect(function(){
					new luga.data.Region({node: testDiv, dsId: "missing"});
				}).toThrow();
			});

			describe("either:", function(){
				it("Retrieves the value from the node's data-lugads-datasource custom attribute", function(){
					expect(attributesRegion.config.dsId).toEqual("testDs");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configRegion.config.dsId).toEqual("testDs");
				});
			});

		});

		describe("Once initialized:", function(){
			it("Register itself as observer of the associated dataSource", function(){
				expect(loadedDs.observers[0]).toEqual(configRegion);
			});
		});

	});
});