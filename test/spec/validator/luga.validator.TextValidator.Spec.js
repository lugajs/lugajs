"use strict";

function mocktruthyfunction(fieldNode) {
	return true;
}

function mockfalsyfunction(fieldNode) {
	return false;
}

var mock = {};
mock.mocktruthyfunction = mocktruthyfunction;
mock.mockfalsyfunction = mockfalsyfunction;

describe("luga.validator.TextValidator", function() {

	it("If not specified, uses a default date pattern", function() {
		var textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: jQuery("<input type='text'>")
		});
		expect(textValidator.options.datepattern).toEqual(luga.validator.CONST.DEFAULT_DATE_PATTERN);
	});

	it("Allows options to be set programmatically", function() {
		var textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: jQuery("<input type='text'>"),
			required: "true",
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
		expect(textValidator.options.required).toBeTruthy();
		expect(textValidator.options.pattern).toEqual("lettersonly");
		expect(textValidator.options.minlength).toEqual("4");
		expect(textValidator.options.maxlength).toEqual("10");
		expect(textValidator.options.minnumber).toEqual("5");
		expect(textValidator.options.maxnumber).toEqual("20");
		expect(textValidator.options.datepattern).toEqual("YYYY-MM-DD");
		expect(textValidator.options.mindate).toEqual("2000-01-01");
		expect(textValidator.options.maxdate).toEqual("2009-12-31");
		expect(textValidator.options.equalto).toEqual("seconField");
		expect(textValidator.options.message).toEqual("Invalid field!");
		expect(textValidator.options.errorclass).toEqual("invalid");
	});

	it("Or using custom HTML attributes", function() {
		var textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: jQuery('' +
				'<input type="text" ' +
				'data-luga-required="true"' +
				'data-luga-pattern="lettersonly"' +
				'data-luga-minlength="4"' +
				'data-luga-maxlength="10"' +
				'data-luga-minnumber="5"' +
				'data-luga-maxnumber="20"' +
				'data-luga-datepattern="YYYY-MM-DD"' +
				'data-luga-mindate="2000-01-01"' +
				'data-luga-maxdate="2009-12-31"' +
				'data-luga-equalto="seconField"' +
				'data-luga-message="Invalid field!"' +
				'data-luga-errorclass="invalid"' +
				'>')
		});
		expect(textValidator.options.required).toBeTruthy();
		expect(textValidator.options.pattern).toEqual("lettersonly");
		expect(textValidator.options.minlength).toEqual("4");
		expect(textValidator.options.maxlength).toEqual("10");
		expect(textValidator.options.minnumber).toEqual("5");
		expect(textValidator.options.maxnumber).toEqual("20");
		expect(textValidator.options.datepattern).toEqual("YYYY-MM-DD");
		expect(textValidator.options.mindate).toEqual("2000-01-01");
		expect(textValidator.options.maxdate).toEqual("2009-12-31");
		expect(textValidator.options.equalto).toEqual("seconField");
		expect(textValidator.options.message).toEqual("Invalid field!");
		expect(textValidator.options.errorclass).toEqual("invalid");
	});

	it("Name property maps to either name or id. If none is passed, it's empty by default", function() {
		var textValidator;

		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: jQuery("<input type='text'>")
		});
		expect(textValidator.name).toEqual("");

		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: jQuery("<input type='text' name='myName'>")
		});
		expect(textValidator.name).toEqual("myName");

		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: jQuery("<input type='text' id='myId'>")
		});
		expect(textValidator.name).toEqual("myId");
	});

	it("Detects empty field", function() {
		var textNode, textValidator;

		textNode = jQuery('<input type="text" data-luga-required="true">');
		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: textNode
		});
		expect(textValidator.isEmpty()).toBeTruthy();
	});

	it("Detects if field is required on simple validation", function() {
		var textNode, textValidator;

		textNode = jQuery('<input type="text" data-luga-required="true">');
		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: textNode
		});
		expect(textValidator.isRequired()).toBeTruthy();

		textNode = jQuery('<input type="text" data-luga-required="false">');
		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: textNode
		});
		expect(textValidator.isRequired()).toBeFalsy();

	});

	it("Detects if field is required on conditional validation. Even if conditional validation functions are inside namespace", function() {
		var textNode, textValidator;

		textNode = jQuery('<input type="text" data-luga-required="mocktruthyfunction">');
		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: textNode
		});
		expect(textValidator.isRequired()).toBeTruthy();

		textNode = jQuery('<input type="text" data-luga-required="mockfalsyfunction">');
		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: textNode
		});
		expect(textValidator.isRequired()).toBeFalsy();

		textNode = jQuery('<input type="text" data-luga-required="mock.mocktruthyfunction">');
		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: textNode
		});
		expect(textValidator.isRequired()).toBeTruthy();

		textNode = jQuery('<input type="text" data-luga-required="mock.mockfalsyfunction">');
		textValidator = new luga.validator.FieldValidatorGetInstance({
			fieldNode: textNode
		});
		expect(textValidator.isRequired()).toBeFalsy();

	});

	describe("Trying to validate email address with RegExp these days makes very little sense (too many variations and silly domain names)", function() {
		var textNode, textValidator;

		it("So data-luga-email only check that one @ and a dot are there", function() {
			textNode = jQuery('<input type="text" value="4" data-luga-required="true" data-luga-email="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name" data-luga-required="true" data-luga-email="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name@" data-luga-required="true" data-luga-email="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name." data-luga-required="true" data-luga-email="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="name@ciccio.pasticcio" data-luga-required="true" data-luga-email="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="ciccio@pasticcio.com" data-luga-required="true" data-luga-email="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("Please keep in mind this simplistic approach is not fool-proof", function() {
			textNode = jQuery('<input type="text" value="ciccio@more@pasticcio.com" data-luga-required="true" data-luga-email="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-luga-equalto:", function() {
		var textNode, textValidator;

		it("Throws an exception if the second field does not exists", function() {
			textNode = jQuery('<input type="text" value="myStr" data-luga-required="true" data-luga-equalto="missing">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(function(){
				textValidator.isValid();
			}).toThrow();
		});

		it("Validates if the two fields are the same", function() {
			loadFixtures("validator/TextValidator/equalto.htm");
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#password3")
			});
			textValidator.validate();
			expect(textValidator.isValid()).toBeTruthy();
			expect(jQuery("#password3")).not.toHaveClass("invalid");
		});

		it("Fails if they are not", function() {
			loadFixtures("validator/TextValidator/equalto.htm");
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#password1")
			});
			textValidator.validate();
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#password1")).toHaveClass("invalid");
		});

		it("Works on whole form too", function() {
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

	describe("data-luga-pattern enforces input matches the following patterns:", function() {
		var textNode, textValidator;

		it("lettersonly", function() {
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-pattern="lettersonly">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test123" data-luga-required="true" data-luga-pattern="lettersonly">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("alphanumeric", function() {
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-pattern="alphanumeric">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test123" data-luga-required="true" data-luga-pattern="alphanumeric">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test-123" data-luga-required="true" data-luga-pattern="alphanumeric">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("integer", function() {
			textNode = jQuery('<input type="text" value="1" data-luga-required="true" data-luga-pattern="integer">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="-1" data-luga-required="true" data-luga-pattern="integer">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test123" data-luga-required="true" data-luga-pattern="integer">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="1.5" data-luga-required="true" data-luga-pattern="integer">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("positiveinteger", function() {
			textNode = jQuery('<input type="text" value="1" data-luga-required="true" data-luga-pattern="positiveinteger">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="-1" data-luga-required="true" data-luga-pattern="positiveinteger">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="test123" data-luga-required="true" data-luga-pattern="positiveinteger">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="1.5" data-luga-required="true" data-luga-pattern="positiveinteger">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("number", function() {
			textNode = jQuery('<input type="text" value="1" data-luga-required="true" data-luga-pattern="number">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="-1" data-luga-required="true" data-luga-pattern="number">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test123" data-luga-required="true" data-luga-pattern="number">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="1.5" data-luga-required="true" data-luga-pattern="number">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("filepath_pdf", function() {
			textNode = jQuery('<input type="text" value="/file.pdf" data-luga-required="true" data-luga-pattern="filepath_pdf">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-luga-required="true" data-luga-pattern="filepath_pdf">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.zip" data-luga-required="true" data-luga-pattern="filepath_pdf">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.doc" data-luga-required="true" data-luga-pattern="filepath_pdf">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("filepath_jpg", function() {
			textNode = jQuery('<input type="text" value="/file.pdf" data-luga-required="true" data-luga-pattern="filepath_jpg">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-luga-required="true" data-luga-pattern="filepath_jpg">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.zip" data-luga-required="true" data-luga-pattern="filepath_jpg">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.doc" data-luga-required="true" data-luga-pattern="filepath_jpg">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("filepath_zip", function() {
			textNode = jQuery('<input type="text" value="/file.pdf" data-luga-required="true" data-luga-pattern="filepath_zip">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-luga-required="true" data-luga-pattern="filepath_zip">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
			textNode = jQuery('<input type="text" value="/file.zip" data-luga-required="true" data-luga-pattern="filepath_zip">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.doc" data-luga-required="true" data-luga-pattern="filepath_zip">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("filepath", function() {
			textNode = jQuery('<input type="text" value="/file.pdf" data-luga-required="true" data-luga-pattern="filepath">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.jpg" data-luga-required="true" data-luga-pattern="filepath">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.zip" data-luga-required="true" data-luga-pattern="filepath">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="/file.doc" data-luga-required="true" data-luga-pattern="filepath">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-pattern="filepath">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

	});

	describe("data-luga-minnumber:", function() {
		var textNode, textValidator;

		it("Enforces a minimum numeric value", function() {
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-minnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="5" data-luga-required="true" data-luga-minnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="20" data-luga-required="true" data-luga-minnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="-25" data-luga-required="true" data-luga-minnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

	});

	describe("data-luga-maxnumber:", function() {
		var textNode, textValidator;

		it("Enforces a maximum numeric value", function() {
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-maxnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="5" data-luga-required="true" data-luga-maxnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="20" data-luga-required="true" data-luga-maxnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="-25" data-luga-required="true" data-luga-maxnumber="18">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-luga-minlength:", function() {
		var textNode, textValidator;

		it("Enforces a minimum string length", function() {
			textNode = jQuery('<input type="text" value="4" data-luga-required="true" data-luga-minlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="long string" data-luga-required="true" data-luga-minlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="st" data-luga-required="true" data-luga-minlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="str" data-luga-required="true" data-luga-minlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-luga-maxlength:", function() {
		var textNode, textValidator;

		it("Enforces a maximum string length", function() {
			textNode = jQuery('<input type="text" value="4" data-luga-required="true" data-luga-maxlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="long string" data-luga-required="true" data-luga-maxlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="st" data-luga-required="true" data-luga-maxlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="str" data-luga-required="true" data-luga-maxlength="3">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-luga-datepattern can, out of the box, validate dates in the following formats:", function() {
		var textNode, textValidator;

		it("YYYY-MM-DD", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="YYYY-MM-DD">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2005-02-31" data-luga-required="true" data-luga-datepattern="YYYY-MM-DD">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-12-31" data-luga-required="true" data-luga-datepattern="YYYY-MM-DD">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-05-09" data-luga-required="true" data-luga-datepattern="YYYY-MM-DD">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-5-9" data-luga-required="true" data-luga-datepattern="YYYY-MM-DD">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("YYYY-M-D", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="YYYY-M-D">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2005-02-31" data-luga-required="true" data-luga-datepattern="YYYY-M-D">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-12-31" data-luga-required="true" data-luga-datepattern="YYYY-M-D">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-05-09" data-luga-required="true" data-luga-datepattern="YYYY-M-D">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="2005-5-9" data-luga-required="true" data-luga-datepattern="YYYY-M-D">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("MM/DD/YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="MM/DD/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02/31/2005" data-luga-required="true" data-luga-datepattern="MM/DD/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12/31/2005" data-luga-required="true" data-luga-datepattern="MM/DD/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09/05/2005" data-luga-required="true" data-luga-datepattern="MM/DD/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9/5/2005" data-luga-required="true" data-luga-datepattern="MM/DD/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("M/D/YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="M/D/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02/31/2005" data-luga-required="true" data-luga-datepattern="M/D/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12/31/2005" data-luga-required="true" data-luga-datepattern="M/D/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09/05/2005" data-luga-required="true" data-luga-datepattern="M/D/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9/5/2005" data-luga-required="true" data-luga-datepattern="M/D/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("MM.DD.YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="MM.DD.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02.31.2005" data-luga-required="true" data-luga-datepattern="MM.DD.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12.31.2005" data-luga-required="true" data-luga-datepattern="MM.DD.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09.05.2005" data-luga-required="true" data-luga-datepattern="MM.DD.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9.5.2005" data-luga-required="true" data-luga-datepattern="MM.DD.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("M.D.YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="M.D.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02.31.2005" data-luga-required="true" data-luga-datepattern="M.D.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12.31.2005" data-luga-required="true" data-luga-datepattern="M.D.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09.05.2005" data-luga-required="true" data-luga-datepattern="M.D.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9.5.2005" data-luga-required="true" data-luga-datepattern="M.D.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("MM-DD-YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="MM-DD-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02-31-2005" data-luga-required="true" data-luga-datepattern="MM-DD-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12-31-2005" data-luga-required="true" data-luga-datepattern="MM-DD-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09-05-2005" data-luga-required="true" data-luga-datepattern="MM-DD-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9-5-2005" data-luga-required="true" data-luga-datepattern="MM-DD-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("M-D-YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="M-D-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="02-31-2005" data-luga-required="true" data-luga-datepattern="M-D-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="12-31-2005" data-luga-required="true" data-luga-datepattern="M-D-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="09-05-2005" data-luga-required="true" data-luga-datepattern="M-D-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="9-5-2005" data-luga-required="true" data-luga-datepattern="M-D-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("DD.MM.YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="DD.MM.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31.02.2005" data-luga-required="true" data-luga-datepattern="DD.MM.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31.12.2005" data-luga-required="true" data-luga-datepattern="DD.MM.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05.09.2005" data-luga-required="true" data-luga-datepattern="DD.MM.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5.9.2005" data-luga-required="true" data-luga-datepattern="DD.MM.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("D.M.YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="D.M.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31.02.2005" data-luga-required="true" data-luga-datepattern="D.M.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31.12.2005" data-luga-required="true" data-luga-datepattern="D.M.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05.09.2005" data-luga-required="true" data-luga-datepattern="D.M.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5.9.2005" data-luga-required="true" data-luga-datepattern="D.M.YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("DD/MM/YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2005" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31/12/2005" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05/09/2005" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5/9/2005" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("D/M/YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="D/M/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2005" data-luga-required="true" data-luga-datepattern="D/M/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31/12/2005" data-luga-required="true" data-luga-datepattern="D/M/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05/09/2005" data-luga-required="true" data-luga-datepattern="D/M/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5/9/2005" data-luga-required="true" data-luga-datepattern="D/M/YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("DD-MM-YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="DD-MM-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31-02-2005" data-luga-required="true" data-luga-datepattern="DD-MM-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31-12-2005" data-luga-required="true" data-luga-datepattern="DD-MM-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05-09-2005" data-luga-required="true" data-luga-datepattern="DD-MM-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5-9-2005" data-luga-required="true" data-luga-datepattern="DD-MM-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("D-M-YYYY", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="D-M-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31-02-2005" data-luga-required="true" data-luga-datepattern="D-M-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31-12-2005" data-luga-required="true" data-luga-datepattern="D-M-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05-09-2005" data-luga-required="true" data-luga-datepattern="D-M-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5-9-2005" data-luga-required="true" data-luga-datepattern="D-M-YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("data-luga-mindate enforces a minimum date", function() {
		var textNode, textValidator;

		it("If no data-luga-datepattern is specified, default pattern (YYYY-MM-DD) will be used to parse and compare dates", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-mindate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2011-02-31" data-luga-required="true" data-luga-mindate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2010-01-02" data-luga-required="true" data-luga-mindate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-1-1" data-luga-required="true" data-luga-mindate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-01-01" data-luga-required="true" data-luga-mindate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

		it("Using data-luga-datepattern override default", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-mindate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2011" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-mindate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2010" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-mindate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-01-01" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-mindate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2005" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-mindate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();
		});

	});

	describe("data-luga-maxdate enforces a maximum date", function() {
		var textNode, textValidator;

		it("If no data-luga-datepattern is specified, default pattern (YYYY-MM-DD) will be used to parse and compare dates", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-maxdate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="2011-02-31" data-luga-required="true" data-luga-maxdate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2010-01-02" data-luga-required="true" data-luga-maxdate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-1-1" data-luga-required="true" data-luga-maxdate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="2005-01-01" data-luga-required="true" data-luga-maxdate="2010-01-01">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

		it("Using data-luga-datepattern override default", function() {
			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-maxdate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31/02/2011" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-maxdate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2010" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-maxdate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// valid, but date pattern doesn't match
			textNode = jQuery('<input type="text" value="2011-01-01" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-maxdate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="02/02/2005" data-luga-required="true" data-luga-datepattern="DD/MM/YYYY" data-luga-maxdate="01/01/2010">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();
		});

	});

	describe("Rules can be mixed", function() {

		it("Like data-luga-minlength and data-luga-maxlength", function() {
			loadFixtures("validator/FormValidator/generic.htm");
			var textValidator;
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: jQuery("#comments")
			});

			textValidator.validate();
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#comments")).toHaveClass("invalid");

			jQuery("#comments").val("x");
			textValidator.validate()
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#comments")).toHaveClass("invalid");

			jQuery("#comments").val("Very long piece of text");
			textValidator.validate()
			expect(textValidator.isValid()).toBeFalsy();
			expect(jQuery("#comments")).toHaveClass("invalid");

			jQuery("#comments").val("five");
			textValidator.validate()
			expect(textValidator.isValid()).toBeTruthy();
			expect(jQuery("#comments")).not.toHaveClass("invalid");

		});

	});

	describe("Custom rules can be defined", function() {
		var textNode, textValidator;

		it("By adding them to luga.validator.rules", function() {

			luga.validator.rules.lowercase = function(fieldNode, validator) {
				var lowerStr = fieldNode.val().toLowerCase();
				return (lowerStr === fieldNode.val());
			};

			textNode = jQuery('<input type="text" value="all lower" data-luga-required="true" data-luga-lowercase="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="Mixed Case" data-luga-required="true" data-luga-lowercase="true">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});

		});

	});

	describe("Custom patterns can be defined", function() {
		var textNode, textValidator;

		it("By adding them to luga.validator.patterns", function() {

			luga.validator.patterns.httpstart = new RegExp("^http://");

			textNode = jQuery('<input type="text" value="http://www.lugajs.org" data-luga-required="true" data-luga-pattern="httpstart">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="www.lugajs.org" data-luga-required="true" data-luga-pattern="httpstart">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});

		});

	});

	describe("Custom date patterns can be defined", function() {
		var textNode, textValidator;

		it("By adding them to luga.validator.dateSpecs using the luga.validator.createDateSpecObj() utility", function() {

			luga.validator.dateSpecs["D M YYYY"] = luga.validator.createDateSpecObj("^\([0-3]?[0-9]\)\\s\([0-2]?[0-9]\)\\s\([0-9]{4}\)$", 2, 1, 0, " ");

			// Not a date
			textNode = jQuery('<input type="text" value="test" data-luga-required="true" data-luga-datepattern="D M YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			// Matches pattern, but it's not a date
			textNode = jQuery('<input type="text" value="31 2 2005" data-luga-required="true" data-luga-datepattern="D M YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeFalsy();

			textNode = jQuery('<input type="text" value="31 12 2005" data-luga-required="true" data-luga-datepattern="D M YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="5 9 2005" data-luga-required="true" data-luga-datepattern="D M YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

			textNode = jQuery('<input type="text" value="05 09 2005" data-luga-required="true" data-luga-datepattern="D M YYYY">');
			textValidator = new luga.validator.FieldValidatorGetInstance({
				fieldNode: textNode
			});
			expect(textValidator.isValid()).toBeTruthy();

		});

	});

});