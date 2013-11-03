describe("luga validator", function() {

	it("luga.validator namespaces must be defined", function() {
		expect(luga.validator).toBeDefined();
		expect(luga.validator.util).toBeDefined();
	});

	it("Empty form must be valid", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form></form>')
		});
		expect(formObj.isValid()).toBeTruthy();
	});

	it("Form validator blocksubmit option true by default", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form></form>')
		});
		expect(formObj.options.blocksubmit).toBeTruthy();
	});

	it("Form validator blocksubmit option can be set with dedicated attribute", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form data-luga-blocksubmit="false"></form>')
		});
		expect(formObj.options.blocksubmit).toEqual("false");
	});

	it("Form validator blocksubmit option can be set as an option", function() {
		var formObj = new luga.validator.formValidator({
			formNode: jQuery('<form></form>'),
			blocksubmit: false
		});
		expect(formObj.options.blocksubmit).toEqual(false);
	});

	it("luga.validator.util.isInputField accepts nodes that can be validated", function() {
		expect(luga.validator.util.isInputField(jQuery("<textarea>"))).toBeTruthy();
		expect(luga.validator.util.isInputField(jQuery("<input type='text'>"))).toBeTruthy();
		expect(luga.validator.util.isInputField(jQuery("<input type='radio'>"))).toBeTruthy();
		expect(luga.validator.util.isInputField(jQuery("<input type='checkbox'>"))).toBeTruthy();
		expect(luga.validator.util.isInputField(jQuery("<input type='email'>"))).toBeTruthy();
		expect(luga.validator.util.isInputField(jQuery("<input type='date'>"))).toBeTruthy();
		expect(luga.validator.util.isInputField(jQuery("<select>"))).toBeTruthy();
	});

	it("luga.validator.util.isInputField refuses nodes that can't be validated", function() {
		expect(luga.validator.util.isInputField(jQuery("<div>"))).toBeFalsy();
		expect(luga.validator.util.isInputField(jQuery("<form>"))).toBeFalsy();
		expect(luga.validator.util.isInputField(jQuery("<button>"))).toBeFalsy();
		expect(luga.validator.util.isInputField(jQuery("<input type='submit'>"))).toBeFalsy();
		expect(luga.validator.util.isInputField(jQuery("<input type='reset'>"))).toBeFalsy();
		expect(luga.validator.util.isInputField(jQuery("<input type='button'>"))).toBeFalsy();
		expect(luga.validator.util.isInputField(jQuery("<fieldset>"))).toBeFalsy();
	});

});