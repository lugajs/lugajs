describe("luga validator", function() {

	it("luga.validator namespace must be defined", function() {
		expect(luga.validator).toBeDefined();
	});

	it("Empty form must be valid", function() {
		var formObj = new luga.validator.form(jQuery("<form></form>"));
		expect(formObj.isValid()).toBeTruthy();
	});

});