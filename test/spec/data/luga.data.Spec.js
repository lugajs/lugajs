describe("luga.data", function(){

	"use strict";

	var emptyDs;
	beforeEach(function(){
		emptyDs = new luga.data.DataSet({uuid: "test"});
	});

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
	});

	it("Lives inside its own namespace", function(){
		expect(luga.data).toBeDefined();
	});

	it("Stores a registry of dataSources available on the current page", function(){
		expect(luga.data.dataSourceRegistry).toBeDefined();
		expect(jQuery.isPlainObject(luga.data.dataSourceRegistry)).toEqual(true);
	});

	describe("A reference is stored inside the registry for each:", function(){
		it("Newly created dataSet", function(){
			var ds = new luga.data.DataSet({uuid: "myDs"});
			expect(luga.data.dataSourceRegistry["myDs"]).toEqual(ds);
		});
		it("Newly created detailSet", function(){
			var ds = new luga.data.DetailSet({uuid: "myDs", parentDataSet: emptyDs});
			expect(luga.data.dataSourceRegistry["myDs"]).toEqual(ds);
		});
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.data.version).toBeDefined();
		});
	});

	describe(".getDataSource()", function(){
		it("Returns a dataSet from the registry", function(){
			var ds = new luga.data.DataSet({uuid: "myDs"});
			expect(luga.data.getDataSource("myDs")).toEqual(ds);
		});
		it("Returns null if no dataSet matches the given uuid", function(){
			expect(luga.data.getDataSource("missing")).toBeNull();
		});
	});

	describe(".setDataSource()", function(){
		it("Adds a dataSource inside the registry, using the given uuid", function(){
			var myDataSource = {type: "whatever"};
			luga.data.setDataSource("testDs", myDataSource);
			expect(luga.data.getDataSource("testDs")).toEqual(myDataSource);
		});
		it("Throws an exception if the the given uuid already exists inside the registry", function(){
			expect(function(){
				luga.data.setDataSource("test", {type: "whatever"});
				luga.data.setDataSource("sameId", {});
			}).toThrow();
		});
	});

});