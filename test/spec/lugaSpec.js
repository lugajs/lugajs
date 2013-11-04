describe("luga js", function() {

	it("jQuery must be defined", function() {
		expect(jQuery).toBeDefined();
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

	it("Root namespaces must be defined", function() {
		expect(luga).toBeDefined();
		expect(luga.util).toBeDefined();
	});

	describe("namespace()", function() {
		it("Method must be defined", function() {
			expect(luga.namespace).toBeDefined();
			expect(jQuery.isFunction(luga.namespace)).toBeTruthy();
		});

		it("Works on arbitrary root object", function() {
			var testRoot = {};
			luga.namespace("child", testRoot);
			expect(testRoot.child).toBeDefined();
		});

		it("Doesn't overwrite existing namespace", function() {
			var testRoot = {};
			testRoot.child = {};
			testRoot.child.grandChild = {};
			luga.namespace("child", testRoot);
			expect(testRoot.child.grandChild).toBeDefined();
		});
	});

	describe("util.formatString()", function() {
		it("Given a string containing placeholders, it assembles a new string", function() {
			expect(luga.util.formatString("My name is {0} {1}", ["Ciccio", "Pasticcio"])).toEqual("My name is Ciccio Pasticcio");
			expect(luga.util.formatString("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
			expect(luga.util.formatString("My name is {firstName} {lastName}", {firstName: "Ciccio", lastName: "Pasticcio"})).toEqual("My name is Ciccio Pasticcio");
			expect(luga.util.formatString("This {str} is just a {str}", { str:"test"} )).toEqual("This test is just a test");
		});
	});

});