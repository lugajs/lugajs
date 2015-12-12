describe("luga.data.utils", function(){

	"use strict";

	it("Contains generic, static methods and utilities", function(){
		expect(luga.data.utils).toBeDefined();
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