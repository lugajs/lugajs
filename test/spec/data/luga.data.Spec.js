describe("luga.data", function(){

	"use strict";

	var emptyDs;
	beforeEach(function(){
		emptyDs = new luga.data.DataSet({id: "test"});
	});

	it("Lives inside its own namespace", function(){
		expect(luga.data).toBeDefined();
	});

	it("Stores a registry of dataSources available on the current page", function(){
		expect(luga.data.dataSourceRegistry).toBeDefined();
		expect(jQuery.isPlainObject(luga.data.dataSourceRegistry)).toBeTruthy();
	});

	describe("A reference is stored inside the registry for each:", function(){
		it("Newly created dataSet", function(){
			var ds = new luga.data.DataSet({id: "myDs"});
			expect(luga.data.dataSourceRegistry["myDs"]).toEqual(ds);
		});
		it("Newly created detailSet", function(){
			var ds = new luga.data.DetailSet({id: "myDs", dataSet: emptyDs});
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
			var ds = new luga.data.DataSet({id: "myDs"});
			expect(luga.data.getDataSource("myDs")).toEqual(ds);
		});
		it("Returns null if no dataSet matches the given id", function(){
			expect(luga.data.getDataSource("missing")).toBeNull();
		});
	});

	describe(".initRegion()", function(){

		describe("Given a jQuery object wrapping a DOM node", function(){

			describe("Throws an exception if:", function(){
				it("The data-lugads-datasource attribute is missing", function(){
					expect(function(){
						luga.data.initRegion(jQuery("<div data-lugads-region='test'>"));
					}).toThrow();
				});
				it("The data-lugads-datasource attribute does not matches a dataSource inside the registry", function(){
					expect(function(){
						luga.data.initRegion(jQuery("<div data-lugads-region='test' data-lugads-datasource='missing'>"));
					}).toThrow();
				});
				it("If it fails to lookup a function matching the value of the data-lugads-regiontype attribute", function(){
					var baseDs = new luga.data.DataSet({id: "testDs"});
					expect(function(){
						luga.data.initRegion(jQuery("<div data-lugads-region='test' data-lugads-datasource='testDs' data-lugads-regiontype='missing'>"));
					}).toThrow();
				});
			});

			describe("If the data-lugads-regiontype attribute is not specified:", function(){
				it("Creates a new instance of luga.data.Region. Passing the given node as options.node", function(){
					var baseDs = new luga.data.DataSet({id: "testDs"});
					var regionNode = jQuery("<div data-lugads-region='test' data-lugads-datasource='testDs'>");
					spyOn(luga.data, "Region");
					luga.data.initRegion(regionNode);
					expect(luga.data.Region).toHaveBeenCalledWith({node: regionNode});
				});
			});

			describe("Else:", function(){
				it("Creates a new instance of whatever constructor function is specified inside the data-lugads-regiontype attribute. Passing the given node as options.node", function(){
					var baseDs = new luga.data.DataSet({id: "testDs"});
					window.mock = {
						regionHandler: function(){}
					}
					var regionNode = jQuery("<div data-lugads-region='test' data-lugads-datasource='testDs' data-lugads-regiontype='window.mock.regionHandler'>");
					spyOn(window.mock, "regionHandler");
					luga.data.initRegion(regionNode);
					expect(window.mock.regionHandler).toHaveBeenCalledWith({node: regionNode});
				});
			});

		});

	});

	describe(".setDataSource()", function(){
		it("Adds a dataSource inside the registry", function(){
			var myDataSource = {type: "whatever"};
			luga.data.setDataSource("testDs", myDataSource);
			expect(luga.data.getDataSource("testDs")).toEqual(myDataSource);
		});
	});

});