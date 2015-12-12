describe("luga.data.utils", function(){

	"use strict";

	it("Contains generic, static methods and utilities", function(){
		expect(luga.data.utils).toBeDefined();
	});

	describe(".assembleStateDescription()", function(){

		it("Throws an exception if the given state is not allowed", function(){
			expect(function(){
				luga.data.utils.assembleStateDescription("whatever I want");
			}).toThrow();
		});

		describe("Given a state string, returns an object containing the following fields:", function(){
			it("state", function(){
				var desc = luga.data.utils.assembleStateDescription("loading");
				expect(desc.state).toEqual("loading");
			});
			it("isStateLoading", function(){
				var pos = luga.data.utils.assembleStateDescription("loading");
				expect(pos.isStateLoading).toEqual(true);
				var neg = luga.data.utils.assembleStateDescription("ready");
				expect(neg.isStateLoading).toEqual(false);
			});
			it("isStateError", function(){
				var pos = luga.data.utils.assembleStateDescription("error");
				expect(pos.isStateError).toEqual(true);
				var neg = luga.data.utils.assembleStateDescription("ready");
				expect(neg.isStateError).toEqual(false);
			});
			it("isStateReady", function(){
				var pos = luga.data.utils.assembleStateDescription("ready");
				expect(pos.isStateReady).toEqual(true);
				var neg = luga.data.utils.assembleStateDescription("error");
				expect(neg.isStateReady).toEqual(false);
			});
		});

	});

	describe(".isValidState()", function(){

		describe("Returns true if the passed state is either", function(){
			it("loading", function(){
				expect(luga.data.utils.isValidState("loading")).toBeTruthy();
			});
			it("error", function(){
				expect(luga.data.utils.isValidState("error")).toBeTruthy();
			});
			it("toggle", function(){
				expect(luga.data.utils.isValidState("ready")).toBeTruthy();
			});
		});
		describe("Otherwise", function(){
			it("Returns false", function(){
				expect(luga.data.utils.isValidState("whatever")).toBeFalsy();
				expect(luga.data.utils.isValidState("test")).toBeFalsy();
				expect(luga.data.utils.isValidState(0)).toBeFalsy();
			});
		});

	});

});