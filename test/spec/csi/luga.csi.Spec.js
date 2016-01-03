/* global LUGA_TEST_XHR_BASE, csiHandlers */

describe("luga.csi", function(){

	"use strict";

	var plainDiv, DEFAULT_TIMEOUT;
	window.csiHandlers = {};

	beforeEach(function(){
		plainDiv = jQuery("<div></div>");
		DEFAULT_TIMEOUT = 2000;

		csiHandlers.customError = function(){
		};
		csiHandlers.customAfter = function(){
		};
		spyOn(csiHandlers, "customError").and.callFake(function(){
		});
		spyOn(csiHandlers, "customAfter").and.callFake(function(){
		});
	});

	it("Lives inside its own namespace", function(){
		expect(luga.csi).toBeDefined();
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

			it("Calls its error handler if the file to include does not exists", function(done){

				var includeObj = new luga.csi.Include({
					rootNode: plainDiv,
					url: "missing.htm",
					error: csiHandlers.customError
				});
				includeObj.load();

				setTimeout(function(){
					expect(csiHandlers.customError).toHaveBeenCalled();
					done();
				}, DEFAULT_TIMEOUT);

			});

			describe("First:", function(){

				it("Include the content of the given url inside the given node", function(done){
					var includeObj = new luga.csi.Include({
						rootNode: plainDiv,
						url: LUGA_TEST_XHR_BASE + "fixtures/csi/include1.htm"
					});
					expect(plainDiv).toBeEmpty();
					includeObj.load();
					setTimeout(function(){
						expect(plainDiv).toContainText("Test luga.csi");
						done();
					}, DEFAULT_TIMEOUT);
				});

			});

			describe("Then:", function(){

				it("Calls its after function", function(done){
					var includeObj = new luga.csi.Include({
						rootNode: plainDiv,
						url: LUGA_TEST_XHR_BASE + "fixtures/csi/include1.htm",
						after: "csiHandlers.customError"
					});
					includeObj.load();
					setTimeout(function(){
						expect(csiHandlers.customError).toHaveBeenCalled();
						done();
					}, DEFAULT_TIMEOUT);
				});

			});

		});

	});

});