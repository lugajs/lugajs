describe("luga.data.sort", function(){

	"use strict";

	it("Stores a sets of static utilities that can be used to sort a dataSet", function(){
		expect(luga.data.sort).toBeDefined();
	});

	describe(".getSortStrategy()", function(){

		describe("Returns a relevant sort function giving the following combinations of dataType and sortOrder", function(){
			it("date/ascending", function(){
				expect(luga.data.sort.getSortStrategy("date", "ascending")).toEqual(luga.data.sort.date.ascending);
			});
			it("date/ascending", function(){
				expect(luga.data.sort.getSortStrategy("date", "descending")).toEqual(luga.data.sort.date.descending);
			});
			it("number/ascending", function(){
				expect(luga.data.sort.getSortStrategy("number", "ascending")).toEqual(luga.data.sort.number.ascending);
			});
			it("number/ascending", function(){
				expect(luga.data.sort.getSortStrategy("number", "descending")).toEqual(luga.data.sort.number.descending);
			});
			it("string/ascending", function(){
				expect(luga.data.sort.getSortStrategy("string", "ascending")).toEqual(luga.data.sort.string.ascending);
			});
			it("string/ascending", function(){
				expect(luga.data.sort.getSortStrategy("string", "descending")).toEqual(luga.data.sort.string.descending);
			});
		});

		describe("Throws an exception if:", function(){
			it("An unsupported combination is passed", function(){
				expect(function(){
					luga.data.sort.getSortStrategy("number", "desc");
				}).toThrow();
			});
			it("The datatype is undefined", function(){
				expect(function(){
					luga.data.sort.getSortStrategy();
				}).toThrow();
			});
		});

	});

	describe(".isValidSortOrder()", function(){

		describe("Returns true if the given sortOrder is either", function(){
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