describe("luga.utils", function(){

	"use strict";

	it("Contains generic, static methods and utilities", function(){
		expect(luga.utils).toBeDefined();
	});

	describe(".displayBox()", function(){

		it("Display a box with a message associated with a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			var formNode = jQuery("<input id='myId' name='ciccio'>");
			expect(formNode.prev().length).toEqual(0);
			luga.utils.displayBox(formNode, "Error");
			var boxNode = formNode.prev();
			expect(boxNode.length).toEqual(1);
			expect(boxNode.text()).toEqual("Error");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayMessage()", function(){

		it("Display a message box above a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(formNode.prev().length).toEqual(0);
			luga.utils.displayMessage(formNode, "Ciao");
			var boxNode = formNode.prev();
			expect(boxNode.length).toEqual(1);
			expect(boxNode.text()).toEqual("Ciao");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayErrorMessage()", function(){

		it("Display an error box above a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(formNode.prev().length).toEqual(0);
			luga.utils.displayErrorMessage(formNode, "Error");
			var boxNode = formNode.prev();
			expect(boxNode.length).toEqual(1);
			expect(boxNode.text()).toEqual("Error");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
		});

	});

	describe(".removeDisplayBox()", function(){

		it("Remove a message box (if any) associated with a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(formNode.prev().length).toEqual(0);
			luga.utils.displayErrorMessage(formNode, "Error");
			luga.utils.removeDisplayBox(formNode);
			expect(formNode.prev().length).toEqual(0);
		});

	});


});