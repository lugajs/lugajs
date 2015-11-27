describe("luga.data.Region", function(){

	describe("Accepts an Options object as single argument", function(){

		describe("options.node", function(){

			it("Is mandatory", function(){
				expect(function(){
					new luga.data.Region({});
				}).toThrow();
			});
			it("Throws an exception if the associated node does not exists", function(){
				expect(function(){
					new luga.data.Region({
						node: jQuery("#missing")
					});
				}).toThrow();
			});

		});
	});
});