window.textValidatorHandlers = {};

describe("luga.validator.TextValidator", function(){

	"use strict";

	it("Implements the luga.validator.BaseFieldValidator abstract class", function(){
		const node = document.createElement("input");
		node.setAttribute("type", "text");
		const validator = luga.validator.fieldValidatorFactory.getInstance({
			fieldNode: node
		});
		const MockValidator = function(options){
			luga.extend(luga.validator.BaseFieldValidator, this, [options]);
		};
		expect(validator).toMatchDuckType(new MockValidator({
			fieldNode: node
		}));
	});

	it("Throws an exception if the associated field node does not exists", function(){
		expect(function(){
			new luga.validator.TextValidator({
				fieldNode: document.getElementById("missing")
			});
		}).toThrow();
	});

	describe("Accepts an Options object as single argument", function(){

		let basicTextValidator, attributeTextValidator, configTextValidator;
		beforeEach(function(){
			jasmineFixtures.loadHTML("validator/TextValidator/config.htm");

			const node = document.createElement("input");
			node.setAttribute("type", "text");
			basicTextValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: node
			});

			attributeTextValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("textValidatorconfig")
			});

			configTextValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: node,
				required: true,
				pattern: "lettersonly",
				minlength: "4",
				maxlength: "10",
				minnumber: "5",
				maxnumber: "20",
				datepattern: "YYYY-MM-DD",
				mindate: "2000-01-01",
				maxdate: "2009-12-31",
				equalto: "seconField",
				message: "Invalid field!",
				errorclass: "invalid"
			});

		});

		describe("options.required either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.required).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-required custom attribute", function(){
				expect(attributeTextValidator.config.required).toEqual(true);
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.required).toEqual(true);
			});
		});

		describe("options.pattern either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.pattern).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-pattern custom attribute", function(){
				expect(attributeTextValidator.config.pattern).toEqual("lettersonly");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.pattern).toEqual("lettersonly");
			});
		});

		describe("options.minlength either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.minlength).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-minlength custom attribute", function(){
				expect(attributeTextValidator.config.minlength).toEqual("4");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.minlength).toEqual("4");
			});
		});

		describe("options.maxlength either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.maxlength).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-maxlength custom attribute", function(){
				expect(attributeTextValidator.config.maxlength).toEqual("10");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.maxlength).toEqual("10");
			});

		});

		describe("options.minnumber either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.minnumber).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-minnumber custom attribute", function(){
				expect(attributeTextValidator.config.minnumber).toEqual("5");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.minnumber).toEqual("5");
			});

		});

		describe("options.maxnumber either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.maxnumber).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-maxnumber custom attribute", function(){
				expect(attributeTextValidator.config.maxnumber).toEqual("20");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.maxnumber).toEqual("20");
			});

		});

		describe("options.datepattern either:", function(){
			it("Default to the value specified in 'luga.validator.CONST.DEFAULT_DATE_PATTERN'", function(){
				expect(basicTextValidator.config.datepattern).toEqual(luga.validator.CONST.DEFAULT_DATE_PATTERN);
			});
			it("Retrieves the value from the field's data-lugavalidator-datepattern custom attribute", function(){
				expect(attributeTextValidator.config.datepattern).toEqual("YYYY-MM-DD");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.datepattern).toEqual("YYYY-MM-DD");
			});
		});

		describe("options.mindate either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.mindate).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-mindate custom attribute", function(){
				expect(attributeTextValidator.config.mindate).toEqual("2000-01-01");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.mindate).toEqual("2000-01-01");
			});
		});

		describe("options.maxdate either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.maxdate).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-maxdate custom attribute", function(){
				expect(attributeTextValidator.config.maxdate).toEqual("2009-12-31");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.maxdate).toEqual("2009-12-31");
			});
		});

		describe("options.equalto either:", function(){

			it("Default to 'null'", function(){
				expect(basicTextValidator.config.equalto).toEqual(null);
			});

			it("Retrieves the value from the field's data-lugavalidator-equalto custom attribute", function(){
				expect(attributeTextValidator.config.equalto).toEqual("seconField");
			});

			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.equalto).toEqual("seconField");
			});
		});

		describe("options.errorclass either:", function(){
			it("Default to an empty string", function(){
				expect(basicTextValidator.config.errorclass).toEqual("");
			});
			it("Retrieves the value from the field's data-lugavalidator-errorclass custom attribute", function(){
				expect(attributeTextValidator.config.errorclass).toEqual("invalid");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.errorclass).toEqual("invalid");
			});
		});

		describe("options.message either:", function(){
			it("Default to an empty string", function(){
				expect(basicTextValidator.config.message).toEqual("");
			});
			it("Retrieves the value from the field's data-lugavalidator-message custom attribute", function(){
				expect(attributeTextValidator.config.message).toEqual("Invalid field!");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.message).toEqual("Invalid field!");
			});
		});

	});

	describe("data-lugavalidator-required:", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createRequiredField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", value);
			return node;
		};


		it("If set to true. Requires the field to contain a value", function(){
			const textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createRequiredField("true")
			});
			expect(textValidator.isRequired()).toEqual(true);
		});

		it("If set to false. Does not requires the field to contain anything", function(){
			const textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createRequiredField("false")
			});
			expect(textValidator.isRequired()).toEqual(false);
			expect(textValidator.isValid()).toEqual(true);
		});

		it("Detect if field is required on conditional validation. Executing the function whose name is specified inside the data-lugavalidator-required custom attribute", function(){

			window.textValidatorHandlers.returnTrue = function(){
				return true;
			};
			window.textValidatorHandlers.returnFalse = function(){
				return false;
			};

			let textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createRequiredField("textValidatorHandlers.returnTrue")
			});
			expect(textValidator.isRequired()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createRequiredField("textValidatorHandlers.returnFalse")
			});
			expect(textValidator.isRequired()).toEqual(false);

		});

		it("Throw an exception if data-lugavalidator-required point to a non existing funtion", function(){

			const textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createRequiredField("missingFunction")
			});

			expect(function(){
				textValidator.isRequired();
			}).toThrow();

		});

	});

	describe("Since trying to validate email address with RegExp these days makes very little sense (too many variations and silly domain names)", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createEmailField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-email", "true");
			node.value = value;
			return node;
		};

		let textValidator;

		it("data-lugavalidator-email only check that one @ and a dot are there", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createEmailField("4")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createEmailField("name")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createEmailField("name@")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createEmailField("name.")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createEmailField("name@ciccio.pasticcio")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createEmailField("ciccio@pasticcio.com")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

		it("Please keep in mind this simplistic approach is not fool-proof", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createEmailField("ciccio@more@pasticcio.com")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

	});

	describe("data-lugavalidator-equalto:", function(){
		let textValidator;

		it("Throws an exception if the second field does not exists", function(){

			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-equalto", "missing");
			node.value = "myStr";

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: node
			});

			console.debug(textValidator)

			expect(function(){
				textValidator.isValid();
			}).toThrow();
		});

		it("Validates if the two fields are the same", function(){
			jasmineFixtures.loadHTML("validator/TextValidator/equalto.htm");
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("password3")
			});
			textValidator.validate();
			expect(textValidator.isValid()).toEqual(true);
			expect(document.getElementById("password3")).not.toHaveClass("invalid");
		});

		it("Fails if they are not", function(){
			jasmineFixtures.loadHTML("validator/TextValidator/equalto.htm");
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("password1")
			});
			textValidator.validate();
			expect(textValidator.isValid()).toEqual(false);
			expect(document.getElementById("password1")).toHaveClass("invalid");
		});

		it("Works on whole form too", function(){
			jasmineFixtures.loadHTML("validator/TextValidator/equalto.htm");
			const formValidator = new luga.validator.FormValidator({
				formNode: document.getElementById("equal")
			});
			expect(formValidator.validate().length).toEqual(0);
			expect(formValidator.isValid()).toEqual(true);
			expect(document.getElementById("password3")).not.toHaveClass("invalid");
			document.getElementById("password4").value = "Kate";
			expect(formValidator.validate().length).toEqual(1);
			expect(formValidator.isValid()).toEqual(false);
			expect(document.getElementById("password3")).toHaveClass("invalid");

		});

	});

	describe("data-lugavalidator-pattern enforces input matches the following patterns:", function(){

		/**
		 * @param {String} pattern
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createPatternField = function(pattern, value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-pattern", pattern);
			node.value = value;
			return node;
		};

		let textValidator;

		it("Throws an exception if the corresponding pattern does not exist", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("missing", "test")
			});
			expect(function(){
				textValidator.isValid();
			}).toThrow();
		});

		it("lettersonly", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("lettersonly", "test")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("lettersonly", "test123")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("alphanumeric", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("alphanumeric", "test")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("alphanumeric", "test123")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("alphanumeric", "test-123")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("integer", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("integer", "1")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("integer", "10")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("integer", "-1")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("integer", "0")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("integer", "test123")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("integer", "1.5")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("positiveinteger", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("positiveinteger", "1")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("positiveinteger", "-1")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("positiveinteger", "test123")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("positiveinteger", "1.5")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("number", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("number", "1")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("number", "-1")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("number", "test123")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("number", "1.5")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

		it("filepath_pdf", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_pdf", "/file.pdf")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_pdf", "/file.jpg")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_pdf", "/file.zip")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_pdf", "/file.doc")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("filepath_jpg", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_jpg", "/file.pdf")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_jpg", "/file.jpg")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_jpg", "/file.zip")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_jpg", "/file.doc")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("filepath_zip", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_zip", "/file.pdf")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_zip", "/file.jpg")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_zip", "/file.zip")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath_zip", "/file.doc")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("filepath", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath", "/file.pdf")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath", "/file.jpg")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath", "/file.zip")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath", "/file.doc")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("filepath", "test")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("time", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("time", "09:10")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("time", "22:45")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("time", "00:00")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("time", "9:09")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("time", "24:10")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("time", "25:10")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createPatternField("time", "22:61")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

	});

	describe("Custom patterns can be added to", function(){
		it("luga.validator.patterns", function(){

			luga.validator.patterns.httpstart = new RegExp("^http://");

			const textNode = document.createElement("input");
			textNode.setAttribute("type", "text");
			textNode.setAttribute("data-lugavalidator-required", "true");
			textNode.setAttribute("data-lugavalidator-pattern", "httpstart");
			textNode.value = "test";

			const textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toEqual(false);
			textNode.value = "http://www.massimocorner.com";
			expect(textValidator.isValid()).toEqual(true);
		});
	});

	describe("data-lugavalidator-minnumber:", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createMinNumberField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-minnumber", 18);
			node.value = value;
			return node;
		};

		let textValidator;

		it("Enforces a minimum numeric value", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinNumberField("test")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinNumberField("5")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinNumberField("20")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinNumberField("-25")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

	});

	describe("data-lugavalidator-maxnumber:", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createMaxNumberField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-maxnumber", 18);
			node.value = value;
			return node;
		};

		let textValidator;

		it("Enforces a maximum numeric value", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxNumberField("test")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxNumberField("5")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxNumberField("20")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxNumberField("-25")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

	});

	describe("data-lugavalidator-minlength:", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createMinLenField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-minlength", 3);
			node.value = value;
			return node;
		};

		let textValidator;

		it("Enforces a minimum string length", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinLenField("4")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinLenField("long string")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinLenField("st")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinLenField("str")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

	});

	describe("data-lugavalidator-maxlength:", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createMaxLenField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-maxlength", 3);
			node.value = value;
			return node;
		};

		let textValidator;

		it("Enforces a maximum string length", function(){
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxLenField("4")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxLenField("long string")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxLenField("st")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxLenField("str")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

	});

	describe("data-lugavalidator-datepattern", function(){

		/**
		 * @param {String} pattern
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createDateField = function(pattern, value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-datepattern", pattern);
			node.value = value;
			return node;
		};

		it("Ignore unrecognized patterns", function(){
			// Pattern not available
			const textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createDateField("XXX-XX", "test")
			});
			expect(textValidator.isValid()).toEqual(false);

		});

		describe("Out of the box, validate dates in the following formats:", function(){

			let textValidator;

			it("YYYY-MM-DD", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-MM-DD", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-MM-DD", "2005-02-31")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-MM-DD", "2005-12-31")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-MM-DD", "2005-05-09")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-MM-DD", "2005-5-9")
				});
				expect(textValidator.isValid()).toEqual(false);
			});

			it("YYYY-M-D", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-M-D", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-M-D", "2005-02-31")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-M-D", "2005-12-31")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-M-D", "2005-05-09")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("YYYY-M-D", "2005-5-9")
				});
				expect(textValidator.isValid()).toEqual(true);
			});

			it("MM/DD/YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM/DD/YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM/DD/YYYY", "02/31/2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM/DD/YYYY", "12/31/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM/DD/YYYY", "09/05/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM/DD/YYYY", "9/5/2005")
				});
				expect(textValidator.isValid()).toEqual(false);
			});

			it("M/D/YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M/D/YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M/D/YYYY", "02/31/2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M/D/YYYY", "12/31/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M/D/YYYY", "09/05/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M/D/YYYY", "9/5/2005")
				});
				expect(textValidator.isValid()).toEqual(true);
			});

			it("MM.DD.YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM.DD.YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM.DD.YYYY", "02.31.2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM.DD.YYYY", "12.31.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM.DD.YYYY", "09.05.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM.DD.YYYY", "9.5.2005")
				});
				expect(textValidator.isValid()).toEqual(false);
			});

			it("M.D.YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M.D.YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M.D.YYYY", "02.31.2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M.D.YYYY", "12.31.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M.D.YYYY", "09.05.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M.D.YYYY", "9.5.2005")
				});
				expect(textValidator.isValid()).toEqual(true);
			});

			it("MM-DD-YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM-DD-YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM-DD-YYYY", "02-31-2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM-DD-YYYY", "12-31-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM-DD-YYYY", "09-05-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("MM-DD-YYYY", "9-5-2005")
				});
				expect(textValidator.isValid()).toEqual(false);
			});

			it("M-D-YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M-D-YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M-D-YYYY", "02-31-2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M-D-YYYY", "12-31-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M-D-YYYY", "09-05-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("M-D-YYYY", "9-5-2005")
				});
				expect(textValidator.isValid()).toEqual(true);
			});

			it("DD.MM.YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD.MM.YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD.MM.YYYY", "31.02.2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD.MM.YYYY", "31.12.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD.MM.YYYY", "05.09.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD.MM.YYYY", "5.9.2005")
				});
				expect(textValidator.isValid()).toEqual(false);
			});

			it("D.M.YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D.M.YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D.M.YYYY", "31.02.2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D.M.YYYY", "31.12.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D.M.YYYY", "05.09.2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D.M.YYYY", "5.9.2005")
				});
				expect(textValidator.isValid()).toEqual(true);
			});

			it("DD/MM/YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD/MM/YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD/MM/YYYY", "31/02/2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD/MM/YYYY", "31/12/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD/MM/YYYY", "05/09/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD/MM/YYYY", "5/9/2005")
				});
				expect(textValidator.isValid()).toEqual(false);
			});

			it("D/M/YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D/M/YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D/M/YYYY", "31/02/2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D/M/YYYY", "31/12/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D/M/YYYY", "05/09/2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D/M/YYYY", "5/9/2005")
				});
				expect(textValidator.isValid()).toEqual(true);
			});

			it("DD-MM-YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD-MM-YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD-MM-YYYY", "31-02-2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD-MM-YYYY", "31-12-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD-MM-YYYY", "05-09-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("DD-MM-YYYY", "5-9-2005")
				});
				expect(textValidator.isValid()).toEqual(false);
			});

			it("D-M-YYYY", function(){
				// Not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D-M-YYYY", "test")
				});
				expect(textValidator.isValid()).toEqual(false);

				// Matches pattern, but it's not a date
				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D-M-YYYY", "31-02-2005")
				});
				expect(textValidator.isValid()).toEqual(false);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D-M-YYYY", "31-12-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D-M-YYYY", "05-09-2005")
				});
				expect(textValidator.isValid()).toEqual(true);

				textValidator = luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: createDateField("D-M-YYYY", "5-9-2005")
				});
				expect(textValidator.isValid()).toEqual(true);
			});

		});

	});

	describe("data-lugavalidator-mindate enforces a minimum date", function(){

		/**
		 * @param {String} mindate
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createMinDateField = function(mindate, value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-mindate", mindate);
			node.value = value;
			return node;
		};

		let textValidator;

		it("If no data-lugavalidator-datepattern is specified, default pattern (YYYY-MM-DD) will be used to parse and compare dates", function(){
			// Not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateField("2010-01-01", "test")
			});
			expect(textValidator.isValid()).toEqual(false);

			// Matches pattern, but it's not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateField("2010-01-01", "2011-02-31")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateField("2010-01-01", "2010-01-02")
			});
			expect(textValidator.isValid()).toEqual(true);

			// valid, but date pattern doesn't match
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateField("2010-01-01", "2011-1-1")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateField("2010-01-01", "2005-01-01")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

		it("Using data-lugavalidator-datepattern override default", function(){

			/**
			 * @param {String} value
			 * @return {HTMLInputElement}
			 */
			const createMinDateWithPatternField = function(value){
				const node = document.createElement("input");
				node.setAttribute("type", "text");
				node.setAttribute("data-lugavalidator-required", "true");
				node.setAttribute("data-lugavalidator-mindate", "01/01/2010");
				node.setAttribute("data-lugavalidator-datepattern", "DD/MM/YYYY");
				node.value = value;
				return node;
			};

			// Not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateWithPatternField("test")
			});
			expect(textValidator.isValid()).toEqual(false);

			// Matches pattern, but it's not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateWithPatternField("31/02/2011")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateWithPatternField("02/02/2010")
			});
			expect(textValidator.isValid()).toEqual(true);

			// valid, but date pattern doesn't match
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateWithPatternField("2011-01-01")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMinDateWithPatternField("02/02/2005")
			});
			expect(textValidator.isValid()).toEqual(false);
		});

	});

	describe("data-lugavalidator-maxdate enforces a maximum date", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createMaxDateField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-maxdate", "2010-01-01");
			node.value = value;
			return node;
		};

		let textValidator;

		it("If no data-lugavalidator-datepattern is specified, default pattern (YYYY-MM-DD) will be used to parse and compare dates", function(){

			// Not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("test")
			});
			expect(textValidator.isValid()).toEqual(false);

			// Matches pattern, but it's not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("2011-02-31")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("2010-01-02")
			});
			expect(textValidator.isValid()).toEqual(false);

			// valid, but date pattern doesn't match
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("2011-1-1")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("2005-01-01")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

		it("Using data-lugavalidator-datepattern override default", function(){

			/**
			 * @param {String} value
			 * @return {HTMLInputElement}
			 */
			const createMaxDateWithPatternField = function(value){
				const node = document.createElement("input");
				node.setAttribute("type", "text");
				node.setAttribute("data-lugavalidator-required", "true");
				node.setAttribute("data-lugavalidator-maxdate", "01/01/2010");
				node.setAttribute("data-lugavalidator-datepattern", "DD/MM/YYYY");
				node.value = value;
				return node;
			};

			// Not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateWithPatternField("test")
			});
			expect(textValidator.isValid()).toEqual(false);

			// Matches pattern, but it's not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateWithPatternField("31/02/2011")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateWithPatternField("02/02/2010")
			});
			expect(textValidator.isValid()).toEqual(false);

			// valid, but date pattern doesn't match
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateWithPatternField("2011-01-01")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateWithPatternField("02/02/2005")
			});
			expect(textValidator.isValid()).toEqual(true);
		});

	});

	describe("The default date pattern can be changed at run-time", function(){

		/**
		 * @param {String} value
		 * @return {HTMLInputElement}
		 */
		const createMaxDateField = function(value){
			const node = document.createElement("input");
			node.setAttribute("type", "text");
			node.setAttribute("data-lugavalidator-required", "true");
			node.setAttribute("data-lugavalidator-maxdate", "01/01/2010");
			node.value = value;
			return node;
		};

		let textValidator;

		it("By changing the value of luga.validator.CONST.DEFAULT_DATE_PATTERN", function(){
			// Override const
			luga.validator.CONST.DEFAULT_DATE_PATTERN = "DD/MM/YYYY";

			// Not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("test")
			});
			expect(textValidator.isValid()).toEqual(false);

			// Matches pattern, but it's not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("31/02/2011")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("02/02/2010")
			});
			expect(textValidator.isValid()).toEqual(false);

			// valid, but date pattern doesn't match
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("2011-01-01")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createMaxDateField("02/02/2005")
			});
			expect(textValidator.isValid()).toEqual(true);
			luga.validator.CONST.DEFAULT_DATE_PATTERN = "YYYY-MM-DD";
		});
	});

	describe("Multiple rules can be used on the same field", function(){

		it("Like data-lugavalidator-minlength and data-lugavalidator-maxlength", function(){
			jasmineFixtures.loadHTML("validator/FormValidator/generic.htm");
			let textValidator;
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: document.getElementById("comments")
			});

			textValidator.validate();
			expect(textValidator.isValid()).toEqual(false);
			expect(document.getElementById("comments")).toHaveClass("invalid");

			document.getElementById("comments").value = "x";
			textValidator.validate();
			expect(textValidator.isValid()).toEqual(false);
			expect(document.getElementById("comments")).toHaveClass("invalid");

			document.getElementById("comments").value = "Very long piece of text";
			textValidator.validate();
			expect(textValidator.isValid()).toEqual(false);
			expect(document.getElementById("comments")).toHaveClass("invalid");

			document.getElementById("comments").value = "five";
			textValidator.validate();
			expect(textValidator.isValid()).toEqual(true);
			expect(document.getElementById("comments")).not.toHaveClass("invalid");

		});

	});

	describe("Custom rules can be added", function(){
		let textValidator;

		it("By adding them to luga.validator.rules", function(){

			/**
			 * @param {String} value
			 * @return {HTMLInputElement}
			 */
			const createLowercaseField = function(value){
				const node = document.createElement("input");
				node.setAttribute("type", "text");
				node.setAttribute("data-lugavalidator-required", "true");
				node.setAttribute("data-lugavalidator-lowercase", "true");
				node.value = value;
				return node;
			};

			luga.validator.rules.lowercase = function(fieldNode, validator){
				const lowerStr = fieldNode.value.toLowerCase();
				return (lowerStr === fieldNode.value);
			};

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createLowercaseField("all lower")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createLowercaseField("Mixed Case")
			});

		});

	});

	describe("Custom patterns can be added", function(){
		let textValidator;

		it("By adding them to luga.validator.patterns", function(){

			/**
			 * @param {String} value
			 * @return {HTMLInputElement}
			 */
			const createHttpstartField = function(value){
				const node = document.createElement("input");
				node.setAttribute("type", "text");
				node.setAttribute("data-lugavalidator-required", "true");
				node.setAttribute("data-lugavalidator-pattern", "httpstart");
				node.value = value;
				return node;
			};

			luga.validator.patterns.httpstart = new RegExp("^http://");

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createHttpstartField("http://www.lugajs.org")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createHttpstartField("www.lugajs.org")
			});

		});

	});

	describe("Custom date patterns can be added", function(){
		let textValidator;

		it("By adding them to luga.validator.dateSpecs using the luga.validator.createDateSpecObj() utility", function(){

			/**
			 * @param {String} value
			 * @return {HTMLInputElement}
			 */
			const createDatePatternField = function(value){
				const node = document.createElement("input");
				node.setAttribute("type", "text");
				node.setAttribute("data-lugavalidator-required", "true");
				node.setAttribute("data-lugavalidator-datepattern", "D M YYYY");
				node.value = value;
				return node;
			};

			luga.validator.dateSpecs["D M YYYY"] = luga.validator.createDateSpecObj("^\([0-3]?[0-9]\)\\s\([0-2]?[0-9]\)\\s\([0-9]{4}\)$", 2, 1, 0, " ");

			// Not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createDatePatternField("test")
			});
			expect(textValidator.isValid()).toEqual(false);

			// Matches pattern, but it's not a date
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createDatePatternField("31 2 2005")
			});
			expect(textValidator.isValid()).toEqual(false);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createDatePatternField("31 12 2005")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createDatePatternField("5 9 2005")
			});
			expect(textValidator.isValid()).toEqual(true);

			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: createDatePatternField("05 09 2005")
			});
			expect(textValidator.isValid()).toEqual(true);

		});

	});

});