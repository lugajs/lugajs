describe("luga.data.region.Handlebars", function(){

	"use strict";

	var testRecords, loadedDs, testDiv, attributesDiv, configRegion, attributesRegion, testObserver;

	beforeEach(function(){

		loadFixtures("data/region/Handlebars/ladies.htm");

		testRecords = getJSONFixture("data/ladies.json");
		loadedDs = new luga.data.DataSet({uuid: "testDs", records: testRecords});
		testDiv = jQuery("<div>Ciao Mamma</div>");
		attributesDiv = jQuery("<div data-lugaregion='true' data-lugaregion-datasource-uuid='testDs' data-lugaregion-template-id='ladiesTemplate' ></div>");

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

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
	});

	it("Is the default region type", function(){
		expect(luga.data.region.Handlebars).toBeDefined();
		expect(jQuery.isFunction(luga.data.region.Handlebars)).toBeTruthy();
	});

	it("Implements the luga.data.region.Base abstract class", function(){
		expect(configRegion).toMatchDuckType(new luga.data.region.Base({node: testDiv, ds: loadedDs}));
	});

	describe("Its constructor options are the same as luga.data.region.Base and may also contains:", function(){

		describe("options.templateId either", function(){

			it("Retrieves the value from the node's data-lugaregion-template custom attribute", function(){
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
				var testRegion = new luga.data.region.Handlebars({
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
				expect(Handlebars.compile).toHaveBeenCalledWith(testDiv.html());
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
					expect(Handlebars.compile).toHaveBeenCalledWith(jQuery("#ladiesTemplate").html());
				});

			});
			describe("Else:", function(){

				it("Use jQuery.ajax() to fetch the external template", function(){
					spyOn(jQuery, "ajax");
					new luga.data.region.Handlebars({
						node: testDiv,
						dsUuid: "testDs",
						templateId: "missingTemplate"
					});
					expect(jQuery.ajax).toHaveBeenCalled();
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

		var testRegion;
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
				var newHtml = testRegion.generateHtml();
				testRegion.render();
				expect(testRegion.config.node.html()).toEqual(newHtml);
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
				var desc = luga.data.region.utils.assembleRegionDescription(configRegion);
				expect(testObserver.onRegionRenderedHandler).toHaveBeenCalledWith(desc);
			});
		});

	});

});