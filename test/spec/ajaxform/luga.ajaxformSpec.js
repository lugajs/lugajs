describe("luga.ajaxform", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.ajaxform).toBeDefined();
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.ajaxform.version).toBeDefined();
		});
	});

	describe(".formHandler", function(){

		it("Throws an exception if the form node does not exists", function(){
			expect(function(){
				var formHandler = new luga.ajaxform.formHandler({
					formNode: jQuery("#missing")
				});
			}).toThrow();
		});

	});

});