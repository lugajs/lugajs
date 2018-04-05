describe("luga.data.region.Handlebars", function(){

	"use strict";

	let testRecords, loadedDs, testDiv, attributesDiv, configRegion, attributesRegion, testObserver;
	beforeEach(function(){

		jasmineFixtures.loadHTML("data/region/Handlebars/ladies.htm");

		testRecords = jasmineFixtures.read("data/ladies.json");
		loadedDs = new luga.data.DataSet({uuid: "testDs", records: testRecords});

		testDiv = document.createElement("div");
		testDiv.textContent = "Ciao Mamma";

		attributesDiv = document.createElement("div");
		attributesDiv.setAttribute("data-lugaregion", "true");
		attributesDiv.setAttribute("data-lugaregion-datasource-uuid", "testDs");
		attributesDiv.setAttribute("data-lugaregion-template-id", "ladiesTemplate");
		attributesDiv.textContent = "Test";

		configRegion = new luga.data.region.Handlebars({
			node: testDiv,
			ds: loadedDs,
			templateId: "ladiesTemplate"
		});
		attributesRegion = new luga.data.region.Handlebars({node: attributesDiv});

		testObserver = {
			onRegionRenderedHandler: function(){
			}
		};
		configRegion.addObserver(testObserver);
		spyOn(testObserver, "onRegionRenderedHandler");

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	it("Is the default region type", function(){
		expect(luga.data.region.Handlebars).toBeDefined();
		expect(luga.type(luga.data.region.Handlebars)).toEqual("function");
	});

	it("Implements the luga.data.region.Base abstract class", function(){
		expect(configRegion).toMatchDuckType(new luga.data.region.Base({node: testDiv, ds: loadedDs}));
	});

	describe("Its constructor options are the same as luga.data.region.Base and may also contains:", function(){

		describe("options.templateId either", function(){

			it("Retrieves the value from the node's data-lugaregion-template-id custom attribute", function(){
				expect(attributesRegion.config.templateId).toEqual("ladiesTemplate");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configRegion.config.templateId).toEqual("ladiesTemplate");
			});
			it("Throws an exception if unable to find an HTML element matching the given id", function(){
				expect(function(){
					new luga.data.region.Handlebars({
						node: testDiv,
						dsUuid: "testDs",
						templateId: "missing"
					});
				}).toThrow();
			});
			it("Default to null", function(){
				const testRegion = new luga.data.region.Handlebars({
					node: testDiv,
					dsUuid: "testDs"
				});
				expect(testRegion.config.templateId).toBeNull();
			});

		});

	});

	describe(".template stores the compiled Handlebars template", function(){

		describe("If options.templateId is null:", function(){
			it("Assumes the node's HTML contains the template", function(){
				spyOn(Handlebars, "compile");
				new luga.data.region.Handlebars({
					node: testDiv,
					dsUuid: "testDs"
				});
				expect(Handlebars.compile).toHaveBeenCalledWith(testDiv.innerHTML);
			});
		});

		describe("Else, assumes the HTML element matching options.templateId contains the template", function(){

			describe("If the HTML has no 'src' attribute", function(){

				it("Assumes the HTML element contains the template", function(){
					spyOn(Handlebars, "compile");
					new luga.data.region.Handlebars({
						node: testDiv,
						dsUuid: "testDs",
						templateId: "ladiesTemplate"
					});
					expect(Handlebars.compile).toHaveBeenCalledWith(document.getElementById("ladiesTemplate").innerHTML);
				});

			});
			describe("Else:", function(){

				it("Use XHR to fetch the external template", function(){

					spyOn(Handlebars, "compile").and.callThrough();
					jasmine.Ajax.install();
					jasmine.Ajax.stubRequest("mock.htm").andReturn({
						contentType: "text/html",
						status: 200,
						responseText: "stub Handlebars"
					});

					new luga.data.region.Handlebars({
						node: testDiv,
						dsUuid: "testDs",
						templateId: "mockTemplate"
					});

					expect(Handlebars.compile).toHaveBeenCalledWith("stub Handlebars");
				});

				it("Throw an error and does not compile/render if the external template is missing", function(){

					spyOn(Handlebars, "compile");
					jasmine.Ajax.install();
					jasmine.Ajax.stubRequest("missing.htm").andReturn({
						status: 404
					});

					expect(function(){
						new luga.data.region.Handlebars({
							node: testDiv,
							dsUuid: "testDs",
							templateId: "missingTemplate"
						});
					}).toThrow();
					expect(Handlebars.compile).not.toHaveBeenCalled();
				});

				afterEach(function(){
					jasmine.Ajax.uninstall();
				});

			});

		});

	});

	describe(".generateHtml()", function(){
		it("Pass the dataSource's context to the compiled template", function(){
			spyOn(configRegion, "template");
			configRegion.generateHtml();
			expect(configRegion.template).toHaveBeenCalledWith(configRegion.dataSource.getContext());
		});
	});

	describe(".render()", function(){

		let testRegion;
		beforeEach(function(){
			testRegion = new luga.data.region.Handlebars({
				node: testDiv,
				dsUuid: "testDs",
				templateId: "ladiesTemplate"
			});
		});

		describe("First:", function(){
			it("Calls .generateHtml()", function(){
				spyOn(testRegion, "generateHtml").and.callThrough();
				testRegion.render();
				expect(testRegion.generateHtml).toHaveBeenCalled();
			});
		});

		describe("Then:", function(){
			it("Injects the generated HTML inside the node", function(){
				const newHtml = testRegion.generateHtml();
				testRegion.render();
				expect(testRegion.config.node.innerHTML).toEqual(newHtml);
			});
		});

		describe("Then:", function(){
			it("Calls .applyTraits()", function(){
				spyOn(testRegion, "applyTraits").and.callThrough();
				testRegion.render();
				expect(testRegion.applyTraits).toHaveBeenCalled();
			});
		});

		describe("Finally:", function(){
			it("Triggers a 'regionRendered' notification. Passing along the region's description", function(){
				configRegion.render();
				const desc = luga.data.region.utils.assembleRegionDescription(configRegion);
				expect(testObserver.onRegionRenderedHandler).toHaveBeenCalledWith(desc);
			});
		});

	});

});