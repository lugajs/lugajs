"use strict";

describe("luga.data", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.data).toBeDefined();
	});

	it("Stores a registry of dataSets available on the current page", function(){
		expect(luga.data.datasetRegistry).toBeDefined();
		expect(jQuery.isPlainObject(luga.data.datasetRegistry)).toBeTruthy();
	});

	it("For each dataSet created, a reference is stored inside the registry", function(){
		var ds = new luga.data.DataSet({id: "myDs"});
		expect(luga.data.datasetRegistry["myDs"]).toEqual(ds);
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.data.version).toBeDefined();
		});
	});

	describe(".getDataSet():", function(){
		it("Returns a dataSet from the registry", function(){
			var ds = new luga.data.DataSet({id: "myDs"});
			expect(luga.data.getDataSet("myDs")).toEqual(ds);
		});
		it("Returns null if no dataSet matches the given id", function(){
			expect(luga.data.getDataSet("missing")).toBeNull();
		});
	});

});