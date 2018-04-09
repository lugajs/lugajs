describe("luga.validator.utils", function(){

	"use strict";

	beforeEach(function(){
		jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
	});

	it("Contains generic, static methods and utilities", function(){
		expect(luga.validator).toBeDefined();
	});

	describe(".displayBox()", function(){

		it("Display a box with a message associated with a given node", function(){
			const rootNode = document.querySelector(".container");
			const formNode = document.querySelector(".noName");
			expect(rootNode.querySelectorAll(".luga-message").length).toEqual(0);

			luga.validator.utils.displayBox(formNode, "Error");
			const boxes = rootNode.querySelectorAll(".luga-message");
			expect(boxes.length).toEqual(1);
			expect(boxes[0].textContent).toEqual("Error");
			expect(boxes).toHaveClass(luga.validator.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayMessage()", function(){

		it("Display a message box above a given node", function(){
			const rootNode = document.querySelector(".container");
			const formNode = document.getElementById("basic");
			expect(rootNode.querySelectorAll(".luga-message").length).toEqual(0);

			luga.validator.utils.displayMessage(formNode, "Ciao");
			const boxes = rootNode.querySelectorAll(".luga-message");
			expect(boxes.length).toEqual(1);
			expect(boxes[0].textContent).toEqual("Ciao");
			expect(boxes).toHaveClass(luga.validator.utils.CONST.CSS_CLASSES.MESSAGE);
		});

	});

	describe(".displayErrorMessage()", function(){

		it("Display an error box above a given node", function(){
			const rootNode = document.querySelector(".container");
			const formNode = document.getElementById("basic");
			expect(rootNode.querySelectorAll(".luga-message").length).toEqual(0);

			luga.validator.utils.displayErrorMessage(formNode, "Error");
			const boxes = rootNode.querySelectorAll(".luga-error-message");
			expect(boxes.length).toEqual(1);
			expect(boxes[0].textContent).toEqual("Error");
			expect(boxes).toHaveClass(luga.validator.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
		});

	});

	describe(".removeDisplayBox()", function(){

		it("Remove a message box (if any) associated with a given node", function(){
			const rootNode = document.querySelector(".container");
			const formNode = document.getElementById("basic");
			expect(rootNode.querySelectorAll(".luga-error-message").length).toEqual(0);

			luga.validator.utils.displayErrorMessage(formNode, "Error");
			expect(rootNode.querySelectorAll(".luga-error-message").length).toEqual(1);

			luga.validator.utils.removeDisplayBox(formNode);
			expect(rootNode.querySelectorAll(".luga-error-message").length).toEqual(0);
		});

	});


});