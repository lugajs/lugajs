describe("luga.ajaxform", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.ajaxform).toBeDefined();
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.ajaxform.version).toBeDefined();
		});
	});

	describe(".Sender", function(){

		it("Throws an exception if the associated form node does not exists", function(){
			expect(function(){
				var formHandler = new luga.ajaxform.Sender({
					formNode: jQuery("#missing")
				});
			}).toThrow();
		});

	});

});