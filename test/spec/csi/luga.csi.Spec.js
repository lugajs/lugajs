describe("luga.csi", function(){

	beforeEach(function(){
		spyOn(jQuery, "ajax").and.callFake(function(){
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
				var includeObj = new luga.csi.Include({rootNode: jQuery("<div></div>")});
				includeObj.load();

				expect(jQuery.ajax).toHaveBeenCalled();
			});
		});

	});

});