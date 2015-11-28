window.textValidatorHandlers = {};

describe("luga.validator.TextValidator", function(){

	"use strict";

	it("Throws an exception if the associated field node does not exists", function(){
		expect(function(){
			new luga.validator.TextValidator({
				fieldNode: jQuery("#missing")
			});
		}).toThrow();
	});

	describe("Accepts an Options object as single argument", function(){

		var basicTextValidator, attributeTextValidator, configTextValidator;
		beforeEach(function(){
			loadFixtures("validator/TextValidator/config.htm");

			basicTextValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("<input type='text'>")
			});

			attributeTextValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#textValidatorconfig")
			});

			configTextValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("<input type='text'>"),
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
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.required).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-required custom attribute", function(){
				expect(attributeTextValidator.config.required).toEqual(true);
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.required).toEqual(true);
			});
		});

		describe("options.pattern either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.pattern).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-pattern custom attribute", function(){
				expect(attributeTextValidator.config.pattern).toEqual("lettersonly");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.pattern).toEqual("lettersonly");
			});
		});

		describe("options.minlength either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.minlength).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-minlength custom attribute", function(){
				expect(attributeTextValidator.config.minlength).toEqual("4");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.minlength).toEqual("4");
			});
		});

		describe("options.maxlength either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.maxlength).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-maxlength custom attribute", function(){
				expect(attributeTextValidator.config.maxlength).toEqual("10");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.maxlength).toEqual("10");
			});
		});

		describe("options.minnumber either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.minnumber).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-minnumber custom attribute", function(){
				expect(attributeTextValidator.config.minnumber).toEqual("5");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.minnumber).toEqual("5");
			});
		});

		describe("options.maxnumber either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.maxnumber).toEqual(undefined);
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
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.mindate).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-mindate custom attribute", function(){
				expect(attributeTextValidator.config.mindate).toEqual("2000-01-01");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.mindate).toEqual("2000-01-01");
			});
		});

		describe("options.maxdate either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.maxdate).toEqual(undefined);
			});
			it("Retrieves the value from the field's data-lugavalidator-maxdate custom attribute", function(){
				expect(attributeTextValidator.config.maxdate).toEqual("2009-12-31");
			});
			it("Uses the value specified inside the option argument", function(){
				expect(configTextValidator.config.maxdate).toEqual("2009-12-31");
			});
		});

		describe("options.equalto either:", function(){
			it("Default to 'undefined'", function(){
				expect(basicTextValidator.config.equalto).toEqual(undefined);
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

		it("If set to true. Requires the field to contain a value", function(){
			var textNode = jQuery('<input type="text" data-lugavalidator-required="true">');
			var textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isRequired()).toBeTruthy();
		});

		it("If set to false. Does not requires the field to contain anything", function(){
			var textNode = jQuery('<input type="text" data-lugavalidator-required="false">');
			var textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isRequired()).toBeFalsy();
		});

		it("Detects if field is required on conditional validation. Executing the function whose name is specified inside the data-lugavalidator-required custom attribute", function(){

			window.textValidatorHandlers.returnTrue = function(){
				return true;
			};
			window.textValidatorHandlers.returnFalse = function(){
				return false;
			};

			var textNode = jQuery('<input type="text" data-lugavalidator-required="textValidatorHandlers.returnTrue">');
			var textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isRequired()).toBeTruthy();

			textNode = jQuery('<input type="text" data-lugavalidator-required="textValidatorHandlers.returnFalse">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isRequired()).toBeFalsy();

		});

	});

	describe("Since trying to validate email address with RegExp these days makes very little sense (too many variations and silly domain names)", function(){
		var textNode, textValidator;

		it("data-lugavalidator-email only check that one @ and a dot are there", function(){
			textNode = jQuery('<input type="text" value="4" data-lugavalidator-required="true" data-lugavalidator-email="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name" data-lugavalidator-required="true" data-lugavalidator-email="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name@" data-lugavalidator-required="true" data-lugavalidator-email="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name." data-lugavalidator-required="true" data-lugavalidator-email="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name@ciccio.pasticcio" data-lugavalidator-required="true" data-lugavalidator-email="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="ciccio@pasticcio.com" data-lugavalidator-required="true" data-lugavalidator-email="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("Please keep in mind this simplistic approach is not fool-proof", function(){
			textNode = jQuery('<input type="text" value="ciccio@more@pasticcio.com" data-lugavalidator-required="true" data-lugavalidator-email="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-lugavalidator-equalto:", function(){
		var textNode, textValidator;

		it("Throws an exception if the second field does not exists", function(){
			textNode = jQuery('<input type="text" value="myStr" data-lugavalidator-required="true" data-lugavalidator-equalto="missing">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(function(){
				textValidator.isValid();
			}).toThrow();
		});

		it("Validates if the two fields are the same", function(){
			loadFixtures("validator/TextValidator/equalto.htm");
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#password3")
			});
			textValidator.validate();
			expect(textValidator.isValid()).toBeTruthy();
			expect(jQuery("#password3")).not.toHaveClass("invalid");
		});

		it("Fails if they are not", function(){
			loadFixtures("validator/TextValidator/equalto.htm");
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#password1")
			});
			textValidator.validate();
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#password1")).toHaveClass("invalid");
		});

		it("Works on whole form too", function(){
			loadFixtures("validator/TextValidator/equalto.htm");
			var formValidator = new luga.validator.FormValidator({
				formNode: jQuery("#equal")
			});
			expect(formValidator.validate().length).toEqual(0);
			expect(formValidator.isValid()).toBeTruthy();
			expect(jQuery("#password3")).not.toHaveClass("invalid");
			jQuery("#password4").val("Kate");
			expect(formValidator.validate().length).toEqual(1);
			expect(formValidator.isValid()).toBeFalsy();
			expect(jQuery("#password3")).toHaveClass("invalid");

		});

	});

	describe("data-lugavalidator-pattern enforces input matches the following patterns:", function(){
		var textNode, textValidator;

		it("lettersonly", function(){
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-pattern="lettersonly">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test123" data-lugavalidator-required="true" data-lugavalidator-pattern="lettersonly">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("alphanumeric", function(){
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-pattern="alphanumeric">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test123" data-lugavalidator-required="true" data-lugavalidator-pattern="alphanumeric">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test-123" data-lugavalidator-required="true" data-lugavalidator-pattern="alphanumeric">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("integer", function(){
			textNode = jQuery('<input type="text" value="1" data-lugavalidator-required="true" data-lugavalidator-pattern="integer">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="10" data-lugavalidator-required="true" data-lugavalidator-pattern="integer">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="-1" data-lugavalidator-required="true" data-lugavalidator-pattern="integer">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="0" data-lugavalidator-required="true" data-lugavalidator-pattern="integer">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="test123" data-lugavalidator-required="true" data-lugavalidator-pattern="integer">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="1.5" data-lugavalidator-required="true" data-lugavalidator-pattern="integer">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("positiveinteger", function(){
			textNode = jQuery('<input type="text" value="1" data-lugavalidator-required="true" data-lugavalidator-pattern="positiveinteger">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="-1" data-lugavalidator-required="true" data-lugavalidator-pattern="positiveinteger">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="test123" data-lugavalidator-required="true" data-lugavalidator-pattern="positiveinteger">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="1.5" data-lugavalidator-required="true" data-lugavalidator-pattern="positiveinteger">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("number", function(){
			textNode = jQuery('<input type="text" value="1" data-lugavalidator-required="true" data-lugavalidator-pattern="number">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="-1" data-lugavalidator-required="true" data-lugavalidator-pattern="number">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test123" data-lugavalidator-required="true" data-lugavalidator-pattern="number">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="1.5" data-lugavalidator-required="true" data-lugavalidator-pattern="number">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("filepath_pdf", function(){
			textNode = jQuery('<input type="text" value="/file.pdf" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_pdf">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_pdf">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.zip" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_pdf">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.doc" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_pdf">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("filepath_jpg", function(){
			textNode = jQuery('<input type="text" value="/file.pdf" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_jpg">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_jpg">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.zip" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_jpg">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.doc" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_jpg">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("filepath_zip", function(){
			textNode = jQuery('<input type="text" value="/file.pdf" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_zip">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_zip">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.zip" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_zip">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.doc" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath_zip">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("filepath", function(){
			textNode = jQuery('<input type="text" value="/file.pdf" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.zip" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.doc" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-pattern="filepath">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("time", function(){
			textNode = jQuery('<input type="text" value="09:10" data-lugavalidator-required="true" data-lugavalidator-pattern="time">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="22:45" data-lugavalidator-required="true" data-lugavalidator-pattern="time">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="00:00" data-lugavalidator-required="true" data-lugavalidator-pattern="time">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="9:09" data-lugavalidator-required="true" data-lugavalidator-pattern="time">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="24:10" data-lugavalidator-required="true" data-lugavalidator-pattern="time">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="25:10" data-lugavalidator-required="true" data-lugavalidator-pattern="time">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="22:61" data-lugavalidator-required="true" data-lugavalidator-pattern="time">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

	});

	describe("Custom patterns can be added to", function(){
		it("luga.validator.patterns", function(){

			luga.validator.patterns.httpstart = new RegExp("^http://");
			var textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-pattern="httpstart">');
			var textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode.val("http://www.massimocorner.com");
			expect(textValidator.isValid()).toBeTruthy();
		});
	});

	describe("data-lugavalidator-minnumber:", function(){
		var textNode, textValidator;

		it("Enforces a minimum numeric value", function(){
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-minnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="5" data-lugavalidator-required="true" data-lugavalidator-minnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="20" data-lugavalidator-required="true" data-lugavalidator-minnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="-25" data-lugavalidator-required="true" data-lugavalidator-minnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

	});

	describe("data-lugavalidator-maxnumber:", function(){
		var textNode, textValidator;

		it("Enforces a maximum numeric value", function(){
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-maxnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="5" data-lugavalidator-required="true" data-lugavalidator-maxnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="20" data-lugavalidator-required="true" data-lugavalidator-maxnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="-25" data-lugavalidator-required="true" data-lugavalidator-maxnumber="18">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-lugavalidator-minlength:", function(){
		var textNode, textValidator;

		it("Enforces a minimum string length", function(){
			textNode = jQuery('<input type="text" value="4" data-lugavalidator-required="true" data-lugavalidator-minlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="long string" data-lugavalidator-required="true" data-lugavalidator-minlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="st" data-lugavalidator-required="true" data-lugavalidator-minlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="str" data-lugavalidator-required="true" data-lugavalidator-minlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-lugavalidator-maxlength:", function(){
		var textNode, textValidator;

		it("Enforces a maximum string length", function(){
			textNode = jQuery('<input type="text" value="4" data-lugavalidator-required="true" data-lugavalidator-maxlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="long string" data-lugavalidator-required="true" data-lugavalidator-maxlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="st" data-lugavalidator-required="true" data-lugavalidator-maxlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="str" data-lugavalidator-required="true" data-lugavalidator-maxlength="3">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-lugavalidator-datepattern can, out of the box, validate dates in the following formats:", function(){
		var textNode, textValidator;

		it("YYYY-MM-DD", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-MM-DD">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2005-02-31" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-MM-DD">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-12-31" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-MM-DD">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-05-09" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-MM-DD">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-5-9" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-MM-DD">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("YYYY-M-D", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-M-D">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2005-02-31" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-M-D">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-12-31" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-M-D">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-05-09" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-M-D">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-5-9" data-lugavalidator-required="true" data-lugavalidator-datepattern="YYYY-M-D">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("MM/DD/YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM/DD/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02/31/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM/DD/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12/31/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM/DD/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09/05/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM/DD/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9/5/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM/DD/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("M/D/YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="M/D/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02/31/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M/D/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12/31/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M/D/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09/05/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M/D/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9/5/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M/D/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("MM.DD.YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM.DD.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02.31.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM.DD.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12.31.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM.DD.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09.05.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM.DD.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9.5.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM.DD.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("M.D.YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="M.D.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02.31.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M.D.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12.31.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M.D.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09.05.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M.D.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9.5.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M.D.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("MM-DD-YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM-DD-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02-31-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM-DD-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12-31-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM-DD-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09-05-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM-DD-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9-5-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="MM-DD-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("M-D-YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="M-D-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02-31-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M-D-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12-31-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M-D-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09-05-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M-D-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9-5-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="M-D-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("DD.MM.YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD.MM.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31.02.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD.MM.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31.12.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD.MM.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05.09.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD.MM.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5.9.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD.MM.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("D.M.YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="D.M.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31.02.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D.M.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31.12.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D.M.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05.09.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D.M.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5.9.2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D.M.YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("DD/MM/YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31/12/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05/09/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5/9/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("D/M/YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="D/M/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D/M/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31/12/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D/M/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05/09/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D/M/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5/9/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D/M/YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("DD-MM-YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD-MM-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31-02-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD-MM-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31-12-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD-MM-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05-09-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD-MM-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5-9-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD-MM-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("D-M-YYYY", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="D-M-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31-02-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D-M-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31-12-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D-M-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05-09-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D-M-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5-9-2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D-M-YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-lugavalidator-mindate enforces a minimum date", function(){
		var textNode, textValidator;

		it("If no data-lugavalidator-datepattern is specified, default pattern (YYYY-MM-DD) will be used to parse and compare dates", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-mindate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2011-02-31" data-lugavalidator-required="true" data-lugavalidator-mindate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2010-01-02" data-lugavalidator-required="true" data-lugavalidator-mindate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-1-1" data-lugavalidator-required="true" data-lugavalidator-mindate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-01-01" data-lugavalidator-required="true" data-lugavalidator-mindate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("Using data-lugavalidator-datepattern override default", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-mindate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2011" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-mindate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2010" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-mindate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-01-01" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-mindate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-mindate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

	});

	describe("data-lugavalidator-maxdate enforces a maximum date", function(){
		var textNode, textValidator;

		it("If no data-lugavalidator-datepattern is specified, default pattern (YYYY-MM-DD) will be used to parse and compare dates", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-maxdate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2011-02-31" data-lugavalidator-required="true" data-lugavalidator-maxdate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2010-01-02" data-lugavalidator-required="true" data-lugavalidator-maxdate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-1-1" data-lugavalidator-required="true" data-lugavalidator-maxdate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-01-01" data-lugavalidator-required="true" data-lugavalidator-maxdate="2010-01-01">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("Using data-lugavalidator-datepattern override default", function(){
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2011" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2010" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-01-01" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="DD/MM/YYYY" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("The default date pattern can be changed at run-time", function(){
		var textNode, textValidator;
		it("By changing the value of luga.validator.CONST.DEFAULT_DATE_PATTERN", function(){
			// Override const
			luga.validator.CONST.DEFAULT_DATE_PATTERN = "DD/MM/YYYY";

			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2011" data-lugavalidator-required="true" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2010" data-lugavalidator-required="true" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-01-01" data-lugavalidator-required="true" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2005" data-lugavalidator-required="true" data-lugavalidator-maxdate="01/01/2010">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			luga.validator.CONST.DEFAULT_DATE_PATTERN = "YYYY-MM-DD";
		});
	});

	describe("Multiple rules can be used on the same field", function(){

		it("Like data-lugavalidator-minlength and data-lugavalidator-maxlength", function(){
			loadFixtures("validator/FormValidator/generic.htm");
			var textValidator;
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: jQuery("#comments")
			});

			textValidator.validate();
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#comments")).toHaveClass("invalid");

			jQuery("#comments").val("x");
			textValidator.validate();
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#comments")).toHaveClass("invalid");

			jQuery("#comments").val("Very long piece of text");
			textValidator.validate();
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#comments")).toHaveClass("invalid");

			jQuery("#comments").val("five");
			textValidator.validate();
			expect(textValidator.isValid()).toBeTruthy();
			expect(jQuery("#comments")).not.toHaveClass("invalid");

		});

	});

	describe("Custom rules can be added", function(){
		var textNode, textValidator;

		it("By adding them to luga.validator.rules", function(){

			luga.validator.rules.lowercase = function(fieldNode, validator){
				var lowerStr = fieldNode.val().toLowerCase();
				return (lowerStr === fieldNode.val());
			};

			textNode = jQuery('<input type="text" value="all lower" data-lugavalidator-required="true" data-lugavalidator-lowercase="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="Mixed Case" data-lugavalidator-required="true" data-lugavalidator-lowercase="true">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});

		});

	});

	describe("Custom patterns can be added", function(){
		var textNode, textValidator;

		it("By adding them to luga.validator.patterns", function(){

			luga.validator.patterns.httpstart = new RegExp("^http://");

			textNode = jQuery('<input type="text" value="http://www.lugajs.org" data-lugavalidator-required="true" data-lugavalidator-pattern="httpstart">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="www.lugajs.org" data-lugavalidator-required="true" data-lugavalidator-pattern="httpstart">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});

		});

	});

	describe("Custom date patterns can be added", function(){
		var textNode, textValidator;

		it("By adding them to luga.validator.dateSpecs using the luga.validator.createDateSpecObj() utility", function(){

			luga.validator.dateSpecs["D M YYYY"] = luga.validator.createDateSpecObj("^\([0-3]?[0-9]\)\\s\([0-2]?[0-9]\)\\s\([0-9]{4}\)$", 2, 1, 0, " ");

			// Not a date
			textNode = jQuery('<input type="text" value="test" data-lugavalidator-required="true" data-lugavalidator-datepattern="D M YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31 2 2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D M YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31 12 2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D M YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5 9 2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D M YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05 09 2005" data-lugavalidator-required="true" data-lugavalidator-datepattern="D M YYYY">');
			textValidator = luga.validator.fieldValidatorFactory.getInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

		});

	});

});