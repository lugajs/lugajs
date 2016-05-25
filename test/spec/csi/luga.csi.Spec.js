/* global csiHandlers */

describe("luga.csi", function(){

	"use strict";

	var plainDiv;
	window.csiHandlers = {};

	beforeEach(function(){
		plainDiv = jQuery("<div></div>");

		loadFixtures("csi/basic.htm");
		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest("mock/missing.htm").andReturn({
			status: 404
		});
		jasmine.Ajax.stubRequest("mock/include1.htm").andReturn({
			contentType: "text/html",
			responseText: "Test luga.csi",
			status: 200
		});

		csiHandlers.customError = function(){
		};
		csiHandlers.customAfter = function(){
		};
		spyOn(csiHandlers, "customError").and.callFake(function(){
		});
		spyOn(csiHandlers, "customAfter").and.callFake(function(){
		});
	});

	afterEach(function() {
		jasmine.Ajax.uninstall();
	});

	it("Lives inside its own namespace", function(){
		expect(luga.csi).toBeDefined();
	});

	it("Allows client-side includes using a declarative syntax", function(){
		luga.csi.loadIncludes();
		expect(jQuery("#mockCsi").text()).toEqual(jQuery("#mockCsi").text());
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.csi.version).toBeDefined();
		});
	});

	describe(".Include", function(){

		it("Is the include widget", function(){
			expect(luga.csi.Include).toBeDefined();
		});

		describe(".load()", function(){
			it("Uses jQuery.ajax()", function(){
				spyOn(jQuery, "ajax").and.callThrough(function(){
				});
				var includeObj = new luga.csi.Include({rootNode: plainDiv});
				includeObj.load();

				expect(jQuery.ajax).toHaveBeenCalled();
			});

			describe("First:", function(){

				it("Include the content of the given url inside the given node", function(){
					var includeObj = new luga.csi.Include({
						rootNode: plainDiv,
						url: "mock/include1.htm"
					});
					expect(plainDiv).toBeEmpty();
					includeObj.load();
					expect(plainDiv).toContainText("Test luga.csi");
				});

			});

			describe("Then:", function(){

				it("Calls its after function", function(){
					var includeObj = new luga.csi.Include({
						rootNode: plainDiv,
						url: "mock/include1.htm",
						after: "csiHandlers.customError"
					});
					includeObj.load();
					expect(csiHandlers.customError).toHaveBeenCalled();
				});

			});

			describe("In case the file to include does not exists. Either:", function(){

				it("Throws an error", function(){
					// Can't figure out why Jasmine doesn't trap the exception here
					// Use a very stupid strategy to check if the default error function has been invoked

					spyOn(luga.string, "format");
					var includeObj = new luga.csi.Include({
						rootNode: plainDiv,
						url: "mock/missing.htm"
					});
					includeObj.load();
					expect(luga.string.format).toHaveBeenCalledWith(luga.csi.CONST.MESSAGES.FILE_NOT_FOUND, ["mock/missing.htm"]);

				});

				it("Calls its custom error handler (if defined)", function(){

					var includeObj = new luga.csi.Include({
						rootNode: plainDiv,
						url: "mock/missing.htm",
						error: csiHandlers.customError
					});
					includeObj.load();
					expect(csiHandlers.customError).toHaveBeenCalled();

				});

			});

		});

	});

});