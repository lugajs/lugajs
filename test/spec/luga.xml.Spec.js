describe("luga.xml", function(){

	"use strict";

	var employeesStr, employeesDoc;
	beforeEach(function(){
		employeesStr = jasmine.getFixtures().read("xml/employees.xml");
		employeesDoc = luga.xml.parseFromString(employeesStr);
	});

	it("Contains XML-related API", function(){
		expect(luga.xml).toBeDefined();
	});

	describe(".nodeToObject()", function(){

		describe("Convert an XML node into a JavaScript object", function(){

			it("Turn attributes into properties", function(){
				var node = document.createElement("test");
				node.setAttribute("name", "Ciccio");
				node.setAttribute("lastname", "Pasticcio");
				var obj = luga.xml.nodeToObject(node);
				expect(obj.name).toEqual("Ciccio");
				expect(obj.lastname).toEqual("Pasticcio");
			});

			it("Handling all values as strings", function(){
				var node = document.createElement("test");
				node.setAttribute("id", 1);
				var obj = luga.xml.nodeToObject(node);
				expect(obj.id).toEqual("1");
			});

			it("Child nodes into properties", function(){
				var obj = luga.xml.nodeToObject(employeesDoc.firstChild);
				expect(obj["employee"].length).toEqual(3);
				expect(obj["employee"][0].firstname).toEqual("Edward");
				expect(obj["employee"][0].lastname).toEqual("Smith");
				expect(obj["employee"][0].phone).toEqual("(415) 333-0235");
				expect(obj["employee"][0].username).toEqual("esmith");
			});

		});

	});

	describe(".parseFromString()", function(){

		it("Create a DOM Document out of a string", function(){
			var doc = luga.xml.parseFromString(employeesStr);
			expect(doc.firstChild.tagName).toEqual("employees");
			expect(doc.getElementsByTagName("employee").length).toEqual(3);
		});

	});

});