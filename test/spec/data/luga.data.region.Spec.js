describe("luga.data.region", function(){

	"use strict";

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
		// Reset to default
		luga.data.region.setup({autoregister: true});
	});

	it("Lives inside its own namespace", function(){
		expect(luga.data.region).toBeDefined();
	});

	describe(".getReferenceFromNode()", function(){

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

		describe("Given a jQuery object wrapping an HTML node", function(){

			it("Returns the region object associated to it", function(){
				expect(luga.data.region.getReferenceFromNode(testDiv)).toEqual(testRegion);
			});
			it("Returns undefined if the node is not a region", function(){
				expect(luga.data.region.getReferenceFromNode(document.createElement("div"))).toEqual(undefined);
			});

		});

	});

	describe(".init()", function(){

		describe("Given a DOM node", function(){

			describe("Throws an exception if:", function(){
				it("The data-lugaregion-datasource attribute is missing", function(){
					expect(function(){
						luga.data.region.init(jQuery("<div data-lugaregion='true'>")[0]);
					}).toThrow();
				});
				it("The data-lugaregion-datasource-uuid attribute does not matches a dataSource inside the registry", function(){
					expect(function(){
						luga.data.region.init(jQuery("<div data-lugaregion='true' data-lugaregion-datasource-uuid='missing'>"));
					}).toThrow();
				});
				it("If it fails to lookup a function matching the value of the data-lugaregion-type attribute", function(){
					new luga.data.DataSet({uuid: "testDs"});
					expect(function(){
						luga.data.region.init(jQuery("<div data-lugaregion='true' data-lugaregion-datasource-uuid='testDs' data-lugaregion-type='missing'>"));
					}).toThrow();
				});
			});

			describe("If the data-lugaregion-type attribute is not specified:", function(){
				it("Creates a new instance of luga.data.region.Handlebars. Passing the given node as options.node", function(){
					new luga.data.DataSet({uuid: "testDs"});
					var regionNode = document.createElement("div");
					regionNode.setAttribute("data-lugaregion", "true");
					regionNode.setAttribute("data-lugaregion-datasource-uuid", "testDs");

					spyOn(luga.data.region, "Handlebars");
					luga.data.region.init(regionNode);
					expect(luga.data.region.Handlebars).toHaveBeenCalledWith({node: regionNode});
				});
			});

			describe("Else:", function(){
				it("Creates a new instance of whatever constructor function is specified inside the data-lugaregion-type attribute. Passing the given node as options.node", function(){
					new luga.data.DataSet({uuid: "testDs"});
					window.mock = {
						regionHandler: function(){
						}
					};
					var regionNode = document.createElement("div");
					regionNode.setAttribute("data-lugaregion", "true");
					regionNode.setAttribute("data-lugaregion-datasource-uuid", "testDs");
					regionNode.setAttribute("data-lugaregion-type", "window.mock.regionHandler");

					spyOn(window.mock, "regionHandler");
					luga.data.region.init(regionNode);
					expect(window.mock.regionHandler).toHaveBeenCalledWith({node: regionNode});
				});
			});

		});

	});

	describe(".initRegions()", function(){

		describe("Is a static utility", function(){

			it("Init all the regions contained inside the <body>", function(){
				jasmineFixtures.loadHTML("data/region/Handlebars/ladies.htm");
				spyOn(luga.data.region, "init");
				luga.data.region.initRegions();
				expect(luga.data.region.init).toHaveBeenCalledTimes(2);
			});

			it("Accepts an optional argument as starting node", function(){
				jasmineFixtures.loadHTML("data/region/Handlebars/ladies.htm");
				spyOn(luga.data.region, "init");
				luga.data.region.initRegions(document.querySelectorAll(".container")[0]);
				expect(luga.data.region.init).toHaveBeenCalledTimes(1);
			});

		});

	});

	describe(".setup()", function(){

		describe("If called with no arguments. Return an object containing name/value pairs:", function(){

			it("autoregister = true", function(){
				expect(luga.data.region.setup().autoregister).toEqual(true);
			});

		});

		describe("If a set of name/value pairs is passed as argument. Set the following configuration options:", function(){

			it("autoregister", function(){
				expect(luga.data.region.setup({autoregister: false}).autoregister).toEqual(false);
			});

		});

	});

});