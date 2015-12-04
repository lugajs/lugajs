describe("luga.data.region.Handlebars", function(){

	"use strict";

	var testRecords, loadedDs, testDiv, attributesDiv, configRegion, attributesRegion;
	beforeEach(function(){

		loadFixtures("data/region/Handlebars/ladies.htm");

		testRecords = getJSONFixture("data/ladies.json");
		loadedDs = new luga.data.DataSet({id: "testDs", records: testRecords});
		testDiv = jQuery("<div>Ciao Mamma</div>");
		attributesDiv = jQuery("<div data-lugads-datasource='testDs' data-lugads-template='ladiesTemplate'></div>");

		configRegion = new luga.data.region.Handlebars({
			node: testDiv,
			dsId: "testDs",
			templateId: "ladiesTemplate"
		});
		attributesRegion = new luga.data.region.Handlebars({node: attributesDiv});

	});

	it("Is the default region type", function(){
		expect(luga.data.region.Handlebars).toBeDefined();
		expect(jQuery.isFunction(luga.data.region.Handlebars)).toBeTruthy();
	});

	describe("Accepts an Options object as single argument", function(){

		describe("options.node", function(){
			it("Is mandatory", function(){
				expect(function(){
					new luga.data.region.Handlebars({dsId: "testDs"});
				}).toThrow();
			});
			it("Throws an exception if the associated node does not exists", function(){
				expect(function(){
					new luga.data.region.Handlebars({
						node: jQuery("#missing")
					});
				}).toThrow();
			});
		});

		describe("options.dsId", function(){

			it("Is mandatory", function(){
				expect(function(){
					new luga.data.region.Handlebars({node: testDiv});
				}).toThrow();
			});
			it("Throws an exception if the associated dataSource does not exists", function(){
				expect(function(){
					new luga.data.region.Handlebars({node: testDiv, dsId: "missing"});
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

		describe("options.templateId", function(){

			describe("either:", function(){
				it("Retrieves the value from the node's data-lugads-template custom attribute", function(){
					expect(attributesRegion.config.templateId).toEqual("ladiesTemplate");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configRegion.config.templateId).toEqual("ladiesTemplate");
				});
				it("Throws an exception if unable to find an HTML element matching the given id", function(){
					expect(function(){
						new luga.data.region.Handlebars({
							node: testDiv,
							dsId: "testDs",
							templateId: "missing"
						});
					}).toThrow();
				});
				it("Default to null", function(){
					var testRegion = new luga.data.region.Handlebars({
						node: testDiv,
						dsId: "testDs"
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
						dsId: "testDs"
					});
					expect(Handlebars.compile).toHaveBeenCalledWith(testDiv.html());
				});
			});

			describe("Else:", function(){
				it("Assumes the HTML element matching options.templateId contains the template", function(){
					spyOn(Handlebars, "compile");
					new luga.data.region.Handlebars({
						node: testDiv,
						dsId: "testDs",
						templateId: "ladiesTemplate"
					});
					expect(Handlebars.compile).toHaveBeenCalledWith(jQuery("#ladiesTemplate").html());
				});
			});

		});

		describe("Once initialized:", function(){
			it("Register itself as observer of the associated dataSource", function(){
				expect(loadedDs.observers[0]).toEqual(configRegion);
			});
		});

		describe(".applyTraits()", function(){

			describe("Calls the following traits (passing {node: config.node, dataSource: this.dataSource}):", function(){

				var testRegion, optionsObj;
				beforeEach(function(){
					testRegion = new luga.data.region.Handlebars({
						node: testDiv,
						dsId: "testDs",
						templateId: "ladiesTemplate"
					});
					optionsObj = {node: testDiv, dataSource: loadedDs};
				});

				it("luga.data.region.traits.setRowId()", function(){
					spyOn(luga.data.region.traits, "setRowId");
					configRegion.applyTraits();
					expect(luga.data.region.traits.setRowId).toHaveBeenCalledWith(optionsObj);
				});

				it("luga.data.region.traits.setRowIndex()", function(){
					spyOn(luga.data.region.traits, "setRowIndex");
					configRegion.applyTraits();
					expect(luga.data.region.traits.setRowIndex).toHaveBeenCalledWith(optionsObj);
				});

				it("luga.data.region.traits.sort()", function(){
					spyOn(luga.data.region.traits, "sort");
					configRegion.applyTraits();
					expect(luga.data.region.traits.sort).toHaveBeenCalledWith(optionsObj);
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
					dsId: "testDs",
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

			describe("Finally:", function(){
				it("Calls .applyTraits()", function(){
					spyOn(testRegion, "applyTraits").and.callThrough();
					testRegion.render();
					expect(testRegion.applyTraits).toHaveBeenCalled();
				});
			});

		});

		describe(".onDataChangedHandler()", function(){
			it("Calls .render() whenever the associated dataSource triggers a 'dataChanged' event", function(){
				spyOn(configRegion, "onDataChangedHandler").and.callThrough();
				spyOn(configRegion, "render");
				loadedDs.delete(); // Removes all records, triggers a 'dataChanged' event
				expect(configRegion.onDataChangedHandler).toHaveBeenCalled();
				expect(configRegion.render).toHaveBeenCalled();
			});
		});

	});
});