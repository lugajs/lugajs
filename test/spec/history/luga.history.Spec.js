/**
 * These tests assume the current browser supports pushState. Otherwise may fail
 */
describe("luga.history", function(){

	"use strict";

	beforeEach(function(){

	});

	afterEach(function(){
		luga.history.setup({
			pushState: true
		});
	});

	it("Lives inside its own namespace", function(){
		expect(luga.history).toBeDefined();
	});

	describe(".navigate()", function(){

		beforeEach(function(){
			spyOn(history, "pushState");
			spyOn(history, "replaceState");
		});

		describe("Add an history entry", function(){

			describe("Invoking history.pushState() passing:", function(){

				it("The given URL fragment and an empty string as title", function(){
					luga.history.navigate("test/route");
					expect(history.pushState).toHaveBeenCalledWith({}, "", "test/route");
				});

				it("The given URL fragment and an optional title", function(){
					luga.history.navigate("test/route", {title: "Test Title"});
					expect(history.pushState).toHaveBeenCalledWith({}, "Test Title", "test/route");
				});

			});

		});

		describe("If options.replace = true, replace the current history entry instead", function(){

			describe("Invoking history.replaceState() passing:", function(){

				it("The given URL fragment and an empty string as title", function(){
					luga.history.navigate("test/route", {replace: true});
					expect(history.replaceState).toHaveBeenCalledWith({}, "", "test/route");
				});

				it("The given URL fragment and an optional title", function(){
					luga.history.navigate("test/route", {replace: true, title: "Test Title"});
					expect(history.replaceState).toHaveBeenCalledWith({}, "Test Title", "test/route");
				});

			});

		});

		describe("If pushState is not supported or luga.history is configured to not use it", function(){

			beforeEach(function(){
				luga.history.setup({pushState: false});
			});

			describe("Add an history entry", function(){

				it("Setting location.hash", function(){
					luga.history.navigate("test/route");
					expect(location.hash).toEqual("#test/route");
				});

			});

			describe("If options.replace = true, replace the current history entry instead", function(){

				it("Invoking location.replace()", function(){
					luga.history.navigate("test/route", {replace: true});
					expect(location.hash).toEqual("#test/route");
				});

			});

		});

	});

	describe(".setup()", function(){

		describe("If called with no arguments. Return an object containing name/value pairs:", function(){

			it("pushState = true", function(){
				expect(luga.history.setup().pushState).toEqual(true);
			});

		});

		describe("If a set of name/value pairs is passed as argument. Set the following configuration options:", function(){

			it("pushState", function(){
				expect(luga.history.setup({pushState: true}).pushState).toEqual(true);
			});

		});

	});

	describe(".usePushState()", function(){

		describe("Return true:", function(){

			it("By default:", function(){
				expect(luga.history.usePushState()).toEqual(true);
			});

			it("If pushState is supported and config.pushState has been set to true", function(){
				luga.history.setup({pushState: true});
				expect(luga.history.usePushState()).toEqual(true);
			});

		});

		describe("Return false:", function(){

			it("If pushState is not supported by the current browser, not matter the value of config.pushState", function(){
				spyOn(luga.history, "isPushStateSupported").and.returnValue(false);
				luga.history.setup({pushState: true});
				expect(luga.history.usePushState()).toEqual(false);
			});

			it("If pushState is supported and config.pushState has been set to false", function(){
				luga.history.setup({pushState: false});
				expect(luga.history.usePushState()).toEqual(false);
			});

		});

	});

});