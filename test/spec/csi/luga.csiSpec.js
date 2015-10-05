describe("luga.csi", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.csi).toBeDefined();
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.csi.version).toBeDefined();
		});
	});

});