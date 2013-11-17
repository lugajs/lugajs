"use strict";

describe("luga", function() {

	it("Requires jQuery in order to work", function() {
		expect(jQuery).toBeDefined();
	});

	it("Uses jQuery.extend() as simple/crude inheritance solution", function() {

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

	it("Lives inside its own namespace", function() {
		expect(luga).toBeDefined();
	});

	it("Uses a separated namespace to store utility methods", function() {
		expect(luga).toBeDefined();
		expect(luga.utils).toBeDefined();
	});

	describe("namespace()", function() {

		it("Must be defined", function() {
			expect(luga.namespace).toBeDefined();
			expect(jQuery.isFunction(luga.namespace)).toBeTruthy();
		});

		it("Does not overwrite existing namespaces", function() {
			var testRoot = {};
			testRoot.child = {};
			testRoot.child.grandChild = {};
			luga.namespace("child", testRoot);
			expect(testRoot.child.grandChild).toBeDefined();
		});

		it("By default uses window as root object", function() {
			luga.namespace("ciccio");
			expect(ciccio).toBeDefined();
		});

		it("But works on any arbitrary root object", function() {
			var testRoot = {};
			luga.namespace("child", testRoot);
			expect(testRoot.child).toBeDefined();
		});

	});

	describe("utils.formatString()", function() {
		it("Given a string containing placeholders, assembles a new string", function() {
			expect(luga.utils.formatString("My name is {0} {1}", ["Ciccio", "Pasticcio"])).toEqual("My name is Ciccio Pasticcio");
			expect(luga.utils.formatString("This {0} is just a {0}", ["test"])).toEqual("This test is just a test");
			expect(luga.utils.formatString("My name is {firstName} {lastName}", {firstName: "Ciccio", lastName: "Pasticcio"})).toEqual("My name is Ciccio Pasticcio");
			expect(luga.utils.formatString("This {str} is just a {str}", { str:"test"} )).toEqual("This test is just a test");
		});
	});

});