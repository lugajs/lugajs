describe("luga.data.region", function(){

	"use strict";

	it("Lives inside its own namespace", function(){
		expect(luga.data.region).toBeDefined();
	});

	describe(".getReferenceFromNode()", function(){

		var testDs, testDiv, testRegion;
		beforeEach(function(){

			testDs = new luga.data.DataSet({id: "testDs"});
			testDiv = jQuery("<div>Ciao Mamma</div>");
			testRegion = new luga.data.region.Base({
				node: testDiv,
				ds: testDs
			});

		});

		describe("Given a jQuery object wrapping an HTML node", function(){

			it("Returns the region object associated to it", function(){
				expect(luga.data.region.getReferenceFromNode(testDiv)).toEqual(testRegion);
			});
			it("Returns undefined if the node is not a region", function(){
				expect(luga.data.region.getReferenceFromNode(jQuery("<div>"))).toEqual(undefined);
			});

		});

	});

	describe(".init()", function(){

		describe("Given a jQuery object wrapping a DOM node", function(){

			describe("Throws an exception if:", function(){
				it("The data-lugads-datasource attribute is missing", function(){
					expect(function(){
						luga.data.region.init(jQuery("<div data-lugads-region='test'>"));
					}).toThrow();
				});
				it("The data-lugads-datasource attribute does not matches a dataSource inside the registry", function(){
					expect(function(){
						luga.data.region.init(jQuery("<div data-lugads-region='test' data-lugads-datasource='missing'>"));
					}).toThrow();
				});
				it("If it fails to lookup a function matching the value of the data-lugads-regiontype attribute", function(){
					new luga.data.DataSet({id: "testDs"});
					expect(function(){
						luga.data.region.init(jQuery("<div data-lugads-region='test' data-lugads-datasource='testDs' data-lugads-regiontype='missing'>"));
					}).toThrow();
				});
			});

			describe("If the data-lugads-regiontype attribute is not specified:", function(){
				it("Creates a new instance of luga.data.region.Handlebars. Passing the given node as options.node", function(){
					new luga.data.DataSet({id: "testDs"});
					var regionNode = jQuery("<div data-lugads-region='test' data-lugads-datasource='testDs'>");
					spyOn(luga.data.region, "Handlebars");
					luga.data.region.init(regionNode);
					expect(luga.data.region.Handlebars).toHaveBeenCalledWith({node: regionNode});
				});
			});

			describe("Else:", function(){
				it("Creates a new instance of whatever constructor function is specified inside the data-lugads-regiontype attribute. Passing the given node as options.node", function(){
					new luga.data.DataSet({id: "testDs"});
					window.mock = {
						regionHandler: function(){
						}
					}
					var regionNode = jQuery("<div data-lugads-region='test' data-lugads-datasource='testDs' data-lugads-regiontype='window.mock.regionHandler'>");
					spyOn(window.mock, "regionHandler");
					luga.data.region.init(regionNode);
					expect(window.mock.regionHandler).toHaveBeenCalledWith({node: regionNode});
				});
			});

		});

	});

});