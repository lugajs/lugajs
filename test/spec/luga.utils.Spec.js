describe("luga.utils", function(){

	"use strict";

	it("Contains generic, static methods and utilities", function(){
		expect(luga.utils).toBeDefined();
	});

	describe(".displayBox()", function(){

		it("Display a box with a message associated with a given node", function(){
			loadFixtures("validator/FormValidator/basic.htm");
			var formNode = jQuery("<input id='myId' name='ciccio'>");
			expect(boxNode).not.toExist();
			luga.utils.displayBox(formNode, "Error");
			var boxNode = formNode.prev();
			expect(boxNode).toExist();
			expect(boxNode).toHaveText("Error");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayMessage()", function(){

		it("Display a message box above a given node", function(){
			loadFixtures("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(boxNode).not.toExist();
			luga.utils.displayMessage(formNode, "Ciao");
			var boxNode = formNode.prev();
			expect(boxNode).toExist();
			expect(boxNode).toHaveText("Ciao");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayErrorMessage()", function(){

		it("Display an error box above a given node", function(){
			loadFixtures("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(boxNode).not.toExist();
			luga.utils.displayErrorMessage(formNode, "Error");
			var boxNode = formNode.prev();
			expect(boxNode).toExist();
			expect(boxNode).toHaveText("Error");
			expect(boxNode).toHaveClass(luga.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
		});

	});

	describe(".removeDisplayBox()", function(){

		it("Remove a message box (if any) associated with a given nod", function(){
			loadFixtures("validator/FormValidator/basic.htm");
			var formNode = jQuery("#basic");
			expect(boxNode).not.toExist();
			luga.utils.displayErrorMessage(formNode, "Error");
			luga.utils.removeDisplayBox(formNode);
			var boxNode = formNode.prev();
			expect(boxNode).not.toExist();
		});

	});


});