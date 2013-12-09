/*global luga, it, describe, expect */

"use strict";

describe("luga.data", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.data).toBeDefined();
	});

	it("Stores a registry of datasets available on the current page", function(){
		expect(luga.data.datasetRegistry).toBeDefined();
		expect(jQuery.isPlainObject(luga.data.datasetRegistry)).toBeTruthy();
	});

});