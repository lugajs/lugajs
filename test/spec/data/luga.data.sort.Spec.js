describe("luga.data.sort", function(){

	"use strict";

	it("Stores a sets of static utilities that can be used to sort a dataSet", function(){
		expect(luga.data.sort).toBeDefined();
	});

	describe(".isValidSortOrder()", function(){

		describe("Returns true if the passed sortOrder is either", function(){
			it("ascending", function(){
				expect(luga.data.sort.isValidSortOrder("ascending")).toBeTruthy();
			});
			it("descending", function(){
				expect(luga.data.sort.isValidSortOrder("descending")).toBeTruthy();
			});
			it("toggle", function(){
				expect(luga.data.sort.isValidSortOrder("toggle")).toBeTruthy();
			});
		});
		describe("Otherwise", function(){
			it("Returns false", function(){
				expect(luga.data.sort.isValidSortOrder("asc")).toBeFalsy();
				expect(luga.data.sort.isValidSortOrder("test")).toBeFalsy();
				expect(luga.data.sort.isValidSortOrder(0)).toBeFalsy();
			});
		});

	});

});