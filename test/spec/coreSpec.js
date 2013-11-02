describe("Luga core", function() {

	beforeEach(function() {
	});

	it("luga root namespace must be defined", function() {
		expect(luga).toBeDefined();
	});

	it("luga.namespace() method must be defined", function() {
		expect(luga.namespace).toBeDefined();
	});

	it("luga.namespace() method works on arbitrary root object", function() {
		var testRoot = {};
		luga.namespace("child", testRoot);
		expect(testRoot.child).toBeDefined();
	});

	it("luga.namespace() method doesn't overwrite existing namespace", function() {
		var testRoot = {};
		testRoot.child = {};
		testRoot.child.grandChild = {};
		luga.namespace("child", testRoot);
		expect(testRoot.child.grandChild).toBeDefined();
	});

});