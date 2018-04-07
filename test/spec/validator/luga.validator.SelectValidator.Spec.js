describe("luga.validator.SelectValidator", function(){

	"use strict";

	it("Implements the luga.validator.BaseFieldValidator abstract class", function(){
		const validator = luga.validator.fieldValidatorFactory.getInstance({
			fieldNode: document.createElement("select")
		});
		const MockValidator = function(options){
			luga.extend(luga.validator.BaseFieldValidator, this, [options]);
		};
		const node = document.createElement("input");
		node.setAttribute("type", "text");
		expect(validator).toMatchDuckType(new MockValidator({
			fieldNode: node
		}));
	});

	it("Handle select-multiple", function(){
		const selectNode = document.createElement("select");
		selectNode.setAttribute("multiple", "multiple");
		const validator = luga.validator.fieldValidatorFactory.getInstance({
			fieldNode: selectNode
		});
		const MockValidator = function(options){
			luga.extend(luga.validator.BaseFieldValidator, this, [options]);
		};
		const node = document.createElement("input");
		node.setAttribute("type", "text");
		expect(validator).toMatchDuckType(new MockValidator({
			fieldNode: node
		}));
	});

	it("Throws an exception if the associated field node does not exists", function(){
		expect(function(){
			new luga.validator.SelectValidator({
				fieldNode: document.getElementById("missing")
			});
		}).toThrow();
	});

	describe("Accepts an Options object as single argument", function(){

		let basicSelectValidator, attributeSelectValidator, configSelectValidator;
		beforeEach(function(){

			basicSelectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.createElement("select")
			});

			const selectNode = document.createElement("select");
			selectNode.setAttribute("name", "dish");
			selectNode.setAttribute("data-lugavalidator-errorclass", "invalid-select");
			selectNode.setAttribute("data-lugavalidator-message", "Invalid select!");
			selectNode.setAttribute("data-lugavalidator-invalidindex", "1");
			selectNode.setAttribute("data-lugavalidator-invalidvalue", "Crepes");

			attributeSelectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: selectNode
			});

			configSelectValidator = new luga.validator.SelectValidator({
				fieldNode: document.createElement("select"),
				errorclass: "invalid-select",
				message: "Invalid select!",
				invalidindex: 1,
				invalidvalue: "Crepes"
			});

		});

		describe("options.invalidindex either:", function(){

			it("Default to 'null'", function(){
				expect(basicSelectValidator.config.invalidindex).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-invalidindex custom attribute", function(){
				expect(attributeSelectValidator.config.invalidindex).toEqual("1");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configSelectValidator.config.invalidindex).toEqual(1);
			});
		});

		describe("options.invalidvalue either:", function(){

			it("Default to 'null'", function(){
				expect(basicSelectValidator.config.invalidvalue).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-invalidvalue custom attribute", function(){
				expect(attributeSelectValidator.config.invalidvalue).toEqual("Crepes");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configSelectValidator.config.invalidvalue).toEqual("Crepes");
			});
		});

		describe("options.errorclass either:", function(){
			it("Default to an empty string", function(){
				expect(basicSelectValidator.config.errorclass).toEqual("");
			});
			it("Retrieves the value from the field's data-lugavalidator-errorclass custom attribute", function(){
				expect(attributeSelectValidator.config.errorclass).toEqual("invalid-select");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configSelectValidator.config.errorclass).toEqual("invalid-select");
			});
		});

		describe("options.message either:", function(){
			it("Default to an empty string", function(){
				expect(basicSelectValidator.config.message).toEqual("");
			});
			it("Retrieves the value from the field's data-lugavalidator-message custom attribute", function(){
				expect(attributeSelectValidator.config.message).toEqual("Invalid select!");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configSelectValidator.config.message).toEqual("Invalid select!");
			});
		});

	});

	describe("data-lugavalidator-invalidindex", function(){

		it("Accepts only numbers", function(){
			const selectNode = document.createElement("select");
			selectNode.setAttribute("data-lugavalidator-invalidindex", "test");
			expect(function(){
				luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: selectNode
				});
			}).toThrow();
		});

		it("Prevents selection of an entry on a given position", function(){
			jasmineFixtures.loadHTML("validator/SelectValidator/invalidindex.htm");
			let selectValidator = null;

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("notSelected")
			});
			expect(selectValidator.isValid()).toEqual(false);

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("kateSelected")
			});
			expect(selectValidator.isValid()).toEqual(true);
		});

		it("Works around a weird brower bug when the size attribute is specified", function(){
			jasmineFixtures.loadHTML("validator/SelectValidator/invalidindex.htm");
			let selectValidator = null;

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("selectWithSize")
			});
			expect(selectValidator.isValid()).toEqual(false);

		});

	});

	describe("data-lugavalidator-invalidvalue", function(){

		it("Prevents selection of an entry with a given value", function(){
			jasmineFixtures.loadHTML("validator/SelectValidator/invalidvalue.htm");
			let selectValidator = null;

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("pizza")
			});
			expect(selectValidator.isValid()).toEqual(false);

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("spaghetti")
			});
			expect(selectValidator.isValid()).toEqual(true);
		});

	});

});