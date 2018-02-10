describe("luga.localStorage", function(){

	"use strict";

	afterEach(function(){
		// Clean-up localStorage
		for(var x in localStorage){
			delete localStorage[x];
		}
	});

	it("Contains localStorage-related API", function(){
		expect(luga.localStorage).toBeDefined();
	});

	describe(".persist()", function(){

		it("Persist the given string inside localStorage, under the given combination of root and path", function(){
			luga.localStorage.persist("myRoot", "test", "Xx");
			expect(localStorage.getItem("myRoot")).toEqual('{"test":"Xx"}');
			luga.localStorage.persist("myRoot", "test", "Yy");
			expect(luga.localStorage.retrieve("myRoot", "test")).toEqual("Yy");

			luga.localStorage.persist("myRoot", "path.subpath", "x");
			expect(luga.localStorage.retrieve("myRoot", "path.subpath")).toEqual("x");

			luga.localStorage.persist("myRoot", "path.subpath", "y");
			expect(luga.localStorage.retrieve("myRoot", "path.subpath")).toEqual("y");
		});

		it("Works even if the path is not a string", function(){
			luga.localStorage.persist("myRoot", 1, "Xx");
			expect(localStorage.getItem("myRoot")).toEqual('{"1":"Xx"}');
		});

	});

	describe(".retrieve()", function(){

		it("Retrieve from localStorage the string corresponding to the given combination of root and path", function(){
			luga.localStorage.persist("myRoot", "test.name", "Ciccio");
			expect(luga.localStorage.retrieve("myRoot", "test.name")).toEqual("Ciccio");
		});

		it("Works even if the path is not a string", function(){
			luga.localStorage.persist("myRoot", 3, "Ciccio");
			expect(luga.localStorage.retrieve("myRoot", 3)).toEqual("Ciccio");
		});

		it("Returns undefined if nothing matches the given combination of root and path", function(){
			luga.localStorage.persist("myRoot", "test.name", "Ciccio");
			expect(luga.localStorage.retrieve("myRoot", "test.missing")).toBeUndefined();
			expect(luga.localStorage.retrieve("missingRoot", "test.name")).toBeUndefined();
		});

	});

});