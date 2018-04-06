describe("luga.validator.utils", function(){

	"use strict";

	it("Contains generic, static methods and utilities", function(){
		expect(luga.validator).toBeDefined();
	});

	describe(".displayBox()", function(){

		it("Display a box with a message associated with a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			const formNode = jQuery("<input id='myId' name='ciccio'>");
			expect(formNode.prev().length).toEqual(0);
			luga.validator.utils.displayBox(formNode, "Error");
			const boxNode = formNode.prev();
			expect(boxNode.length).toEqual(1);
			expect(boxNode.text()).toEqual("Error");
			expect(boxNode).toHaveClass(luga.validator.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayMessage()", function(){

		it("Display a message box above a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			const formNode = jQuery("#basic");
			expect(formNode.prev().length).toEqual(0);
			luga.validator.utils.displayMessage(formNode, "Ciao");
			const boxNode = formNode.prev();
			expect(boxNode.length).toEqual(1);
			expect(boxNode.text()).toEqual("Ciao");
			expect(boxNode).toHaveClass(luga.validator.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayErrorMessage()", function(){

		it("Display an error box above a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			const formNode = jQuery("#basic");
			expect(formNode.prev().length).toEqual(0);
			luga.validator.utils.displayErrorMessage(formNode, "Error");
			const boxNode = formNode.prev();
			expect(boxNode.length).toEqual(1);
			expect(boxNode.text()).toEqual("Error");
			expect(boxNode).toHaveClass(luga.validator.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
		});

	});

	describe(".removeDisplayBox()", function(){

		it("Remove a message box (if any) associated with a given node", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			const formNode = jQuery("#basic");
			expect(formNode.prev().length).toEqual(0);
			luga.validator.utils.displayErrorMessage(formNode, "Error");
			luga.validator.utils.removeDisplayBox(formNode);
			expect(formNode.prev().length).toEqual(0);
		});

	});


});