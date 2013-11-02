describe("Luga core", function() {

	it("luga root namespace must be defined", function() {
		expect(luga).toBeDefined();
	});

	it("luga.namespace() method must be defined", function() {
		expect(luga.namespace).toBeDefined();
		expect(jQuery.isFunction(luga.namespace)).toBeTruthy();
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

	it("Use jQuery.extend() as simple/crude inheritance solution", function() {

		/* Class Person. */
		function Person(gender) {
			this.gender = gender;
			this.getGender = function() {
				return this.gender;
			};
		}
		/* Class Superstar */
		function Superstar(gender, name) {
			jQuery.extend(this, new Person());
			this.gender = gender;
			this.name = name;
			this.getName = function() {
				return this.name;
			};
		}
		var nicole = new Superstar("female", "Nicole Kidman");

		expect(nicole.getGender()).toEqual("female");
		expect(nicole.getName()).toEqual("Nicole Kidman");
	});

});