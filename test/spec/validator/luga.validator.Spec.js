describe("luga.validator", function(){

	"use strict";

	it("Lives inside its own namespace", function(){
		expect(luga.validator).toBeDefined();
	});

	describe("Uses separated namespace for storing:", function(){
		it(".rules", function(){
			expect(luga.validator.rules).toBeDefined();
		});
		it(".patterns", function(){
			expect(luga.validator.patterns).toBeDefined();
		});
		it(".dateSpecs", function(){
			expect(luga.validator.dateSpecs).toBeDefined();
		});
		it(".handlers", function(){
			expect(luga.validator.handlers).toBeDefined();
		});
	});

	describe(".CONST", function(){

		it("Contains default values used by the library", function(){
			expect(luga.validator.CONST).toBeDefined();
		});

		describe(".DEFAULT_DATE_PATTERN", function(){

			it("Default to: YYYY-MM-DD", function(){
				expect(luga.validator.CONST.DEFAULT_DATE_PATTERN).toEqual("YYYY-MM-DD");
			});
			it("It can be changed at run-time", function(){
				var node = document.createElement("input");
				node.setAttribute("type", "text");
				// Change to European style
				luga.validator.CONST.DEFAULT_DATE_PATTERN = "DD/MM/YYYY";
				var fieldValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: node
				});
				expect(fieldValidator.config.datepattern).toEqual("DD/MM/YYYY");
				luga.validator.CONST.DEFAULT_DATE_PATTERN = "YYYY-MM-DD";
			});

		});
	});
});


describe("luga.validator.initForms()", function(){

	"use strict";

	describe("Is a static utility", function(){

		it("Create Validator objects for forms available inside the document as soon as they are submitted", function(){

			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			var mockValidator = {
				validate: function(event){
					event.preventDefault();
				}
			};
			spyOn(luga.validator, "FormValidator").and.returnValues(mockValidator);

			luga.validator.initForms();
			// Simulate click/submit
			document.querySelectorAll("*[type=submit]")[0].click();

			expect(luga.validator.FormValidator).toHaveBeenCalled();
		});

		it("Accepts an optional argument as starting node", function(){

			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			var mockValidator = {
				validate: function(event){
					event.preventDefault();
				}
			};
			spyOn(luga.validator, "FormValidator").and.returnValues(mockValidator);

			luga.validator.initForms(document.querySelector(".container"));
			// Simulate click/submit
			document.querySelectorAll("*[type=submit]")[0].click();

			expect(luga.validator.FormValidator).toHaveBeenCalled();
		});

	});

});

describe("luga.validator.handlers", function(){

	"use strict";

	it("Contains handlers for form validation", function(){
		expect(luga.validator.handlers).toBeDefined();
	});

	describe("luga.validator.handlers.errorAlert", function(){
		it("Display error messages inside alert", function(){
			spyOn(window, "alert");
			spyOn(luga.validator.handlers, "errorAlert").and.callThrough();
			jasmineFixtures.loadHTML("validator/FormValidator/basic.htm");
			var formValidator = new luga.validator.FormValidator({
				formNode: document.getElementById("basic"),
				error: "luga.validator.handlers.errorAlert"
			});

			formValidator.validate();
			expect(luga.validator.handlers.errorAlert).toHaveBeenCalled();
			expect(window.alert).toHaveBeenCalled();
		});
	});

	describe("luga.validator.handlers.errorBox", function(){
		it("Invokes luga.utils.displayErrorMessage() to display errors inside a box above the form", function(){
			spyOn(luga.utils, "displayErrorMessage");
			var formStub = $("<form>");
			luga.validator.handlers.errorBox(formStub, [{name: "stub", message: "test"}]);
			expect(luga.utils.displayErrorMessage).toHaveBeenCalledWith(formStub, "<ul><li><em>stub: </em> test</li></ul>");
		});
		it("If the given form contains no validation errors, it call luga.utils.removeDisplayBox()", function(){
			spyOn(luga.utils, "removeDisplayBox");
			var formStub = $("<form>");
			luga.validator.handlers.errorBox(formStub, []);
			expect(luga.utils.removeDisplayBox).toHaveBeenCalledWith(formStub);
		});
	});

});

describe("luga.validator.fieldValidatorFactory.getInstance()", function(){

	"use strict";

	describe("Returns either:", function(){

		beforeEach(function(){
			jasmineFixtures.loadHTML("validator/FormValidator/generic.htm");
		});

		it("null if the passed HTML field has no matching validator", function(){
			var resetNode = document.createElement("input");
			resetNode.setAttribute("type", "reset");

			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: document.createElement("div")})).toBeNull();
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: resetNode})).toBeNull();
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: document.createElement("fieldset")})).toBeNull();
		});

		it("An instance of luga.validator.TextValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: document.getElementById("age")}).constructor).toEqual(luga.validator.TextValidator);
		});

		it("An instance of luga.validator.CheckboxValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: document.getElementById("boxNicole")}).constructor).toEqual(luga.validator.CheckboxValidator);
		});

		it("An instance of luga.validator.RadioValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: document.getElementById("boxNicole")}).constructor).toEqual(luga.validator.CheckboxValidator);
		});

		it("An instance of luga.validator.SelectValidator", function(){
			expect(luga.validator.fieldValidatorFactory.getInstance({fieldNode: document.getElementById("food")}).constructor).toEqual(luga.validator.SelectValidator);
		});

	});

});

describe("luga.validator.BaseFieldValidator is an abstract class", function(){

	"use strict";

	it("Throws an exception if instantiated directly", function(){

		var node = document.createElement("input");
		node.setAttribute("type", "text");
		node.setAttribute("data-lugavalidator-required", "true");
		node.setAttribute("data-lugavalidator-errorclass", "invalid");
		node.setAttribute("disabled", "disabled");

		expect(function(){
			new luga.validator.BaseFieldValidator({
				fieldNode: node
			});
		}).toThrow();
	});

	it("Adds/remove error class and title attribute from the associated form field", function(){

		var node = document.createElement("input");
		node.setAttribute("type", "text");
		node.setAttribute("data-lugavalidator-required", "true");
		node.setAttribute("data-lugavalidator-errorclass", "invalid");
		node.setAttribute("data-lugavalidator-message", "Invalid field!");

		var fieldValidator = luga.validator.fieldValidatorFactory.getInstance({
			fieldNode: node
		});
		expect(node).not.toHaveClass("invalid");
		fieldValidator.flagInvalid();
		expect(node).toHaveClass("invalid");
		expect(node.getAttribute("title")).toEqual("Invalid field!");
		fieldValidator.flagValid();
		expect(node).not.toHaveClass("invalid");
		expect(node.getAttribute("title")).toBeNull();
	});

	it("Handle disabled fields as always valid", function(){

		var node = document.createElement("input");
		node.setAttribute("type", "text");
		node.setAttribute("data-lugavalidator-required", "true");
		node.setAttribute("data-lugavalidator-errorclass", "invalid");
		node.setAttribute("disabled", "disabled");

		var fieldValidator = luga.validator.fieldValidatorFactory.getInstance({
			fieldNode: node
		});
		expect(fieldValidator.validate()).toEqual(false);
		expect(node).not.toHaveClass("invalid");
	});

	describe(".name", function(){

		describe("Either", function(){

			it("Defaults to an empty string", function(){
				var node = document.createElement("input");
				node.setAttribute("type", "text");
				var textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: node
				});
				expect(textValidator.name).toEqual("");
			});
			it("Matches the field's name attribute", function(){
				var node = document.createElement("input");
				node.setAttribute("type", "text");
				node.setAttribute("name", "myName");
				node.setAttribute("id", "myId");
				var textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: node
				});
				expect(textValidator.name).toEqual("myName");
			});
			it("Matches the field's id attribute", function(){
				var node = document.createElement("input");
				node.setAttribute("type", "text");
				node.setAttribute("id", "myId");
				var textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: node
				});
				expect(textValidator.name).toEqual("myId");
			});

		});

	});

});

describe("luga.validator.BaseGroupValidator is an abstract class", function(){

	"use strict";

	it("Throw an exception if instantiated directly", function(){
		var boxNode = document.createElement("input");
		boxNode.setAttribute("type", "checkbox");
		expect(function(){
			new luga.validator.BaseGroupValidator({
				fieldNode: boxNode
			});
		}).toThrow();
	});

});

