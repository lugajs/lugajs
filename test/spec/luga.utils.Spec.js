"use strict";

describe("luga.utils contains generic, static methods and utilities", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.utils).toBeDefined();
	});

	describe(".displayMessage()", function(){

		it("Displays a message box above a given node", function(){
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

		it("Displays an error box above a given node", function(){
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

});