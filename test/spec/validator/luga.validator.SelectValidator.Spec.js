describe("luga.validator.SelectValidator", function(){

	"use strict";

	it("Implements the luga.validator.BaseFieldValidator abstract class", function(){
		var validator = luga.validator.fieldValidatorFactory.getInstance({
			fieldNode: jQuery("<select></select>")
		});
		var MockValidator = function(options){
			luga.extend(luga.validator.BaseFieldValidator, this, [options]);
		};
		expect(validator).toMatchDuckType(new MockValidator({fieldNode: jQuery("<input type='text'>")}));
	});

	it("Handle select-multiple", function(){
		var validator = luga.validator.fieldValidatorFactory.getInstance({
			fieldNode: jQuery("<select multiple></select>")
		});
		var MockValidator = function(options){
			luga.extend(luga.validator.BaseFieldValidator, this, [options]);
		};
		expect(validator).toMatchDuckType(new MockValidator({fieldNode: jQuery("<input type='text'>")}));
	});

	it("Throws an exception if the associated field node does not exists", function(){
		expect(function(){
			new luga.validator.SelectValidator({
				fieldNode: jQuery("#missing")
			});
		}).toThrow();
	});

	describe("Accepts an Options object as single argument", function(){

		var basicSelectValidator, attributeSelectValidator, configSelectValidator;
		beforeEach(function(){

			basicSelectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("<select></select>")
			});

			attributeSelectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery('<select name="dish" data-lugavalidator-errorclass="invalid-select" data-lugavalidator-message="Invalid select!" data-lugavalidator-invalidindex="1" data-lugavalidator-invalidvalue="Crepes">')
			});

			configSelectValidator = new luga.validator.SelectValidator({
				fieldNode: jQuery("<select></select>"),
				errorclass: "invalid-select",
				message: "Invalid select!",
				invalidindex: 1,
				invalidvalue: "Crepes"
			});

		});

		describe("options.invalidindex either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicSelectValidator.config.invalidindex).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-invalidindex custom attribute", function(){
				expect(attributeSelectValidator.config.invalidindex).toEqual("1");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configSelectValidator.config.invalidindex).toEqual(1);
			});
		});

		describe("options.invalidvalue either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicSelectValidator.config.invalidvalue).toEqual(undefined);
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
			var selectNode = jQuery("<select data-lugavalidator-invalidindex='test'>");
			expect(function(){
				luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: selectNode
				});
			}).toThrow();
		});

		it("Prevents selection of an entry on a given position", function(){
			loadFixtures("validator/SelectValidator/invalidindex.htm");
			var selectValidator = null;

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#notSelected")
			});
			expect(selectValidator.isValid()).toEqual(false);

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#kateSelected")
			});
			expect(selectValidator.isValid()).toEqual(true);
		});

		it("Works around a weird brower bug when the size attribute is specified", function(){
			loadFixtures("validator/SelectValidator/invalidindex.htm");
			var selectValidator = null;

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#selectWithSize")
			});
			expect(selectValidator.isValid()).toEqual(false);

		});

	});

	describe("data-lugavalidator-invalidvalue", function(){

		it("Prevents selection of an entry with a given value", function(){
			loadFixtures("validator/SelectValidator/invalidvalue.htm");
			var selectValidator = null;

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#pizza")
			});
			expect(selectValidator.isValid()).toEqual(false);

			selectValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#spaghetti")
			});
			expect(selectValidator.isValid()).toEqual(true);
		});

	});

});