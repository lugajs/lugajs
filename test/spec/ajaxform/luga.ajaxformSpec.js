describe("luga.ajax.Form", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.ajax.Form).toBeDefined();
	});

	it("Throws an exception if the form node does not exists", function(){
		expect(function(){
			var formHandler = new luga.ajax.Form({
				formNode: jQuery("#missing")
			});
		}).toThrow();
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.ajax.Form.version).toBeDefined();
		});
	});


});