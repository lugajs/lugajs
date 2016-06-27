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

	describe(".evaluateXPath()", function(){

		it("Evaluate an XPath expression against a given node", function(){
			expect(luga.xml.evaluateXPath(employeesDoc, "/employees/employee").length).toEqual(3);
		});

		it("Results are returned as an array of nodes", function(){
			var result = luga.xml.evaluateXPath(employeesDoc, "//employee");
			expect(jQuery.isArray(result)).toEqual(true);
		});

		it("An empty array is returned in case there is no match", function(){
			expect(luga.xml.evaluateXPath(employeesDoc, "/missing").length).toEqual(0);
		});

	});

	describe(".nodeToObject()", function(){

		describe("Convert an XML node into a JavaScript object", function(){

			describe("Mapping:", function(){

				it("Attributes to properties. Prefixed by '_'", function(){
					var node = document.createElement("test");
					node.setAttribute("name", "Ciccio");
					node.setAttribute("lastname", "Pasticcio");
					var obj = luga.xml.nodeToObject(node);
					expect(obj["_name"]).toEqual("Ciccio");
					expect(obj["_lastname"]).toEqual("Pasticcio");
				});

				it("Child nodes to properties", function(){
					// Quite an hack to get the employees Node
					var employeesDoc = luga.xml.parseFromString(employeesStr);
					var rootNode = luga.xml.evaluateXPath(employeesDoc, "//employees");

					var obj = luga.xml.nodeToObject(rootNode[0]);
					expect(obj["employee"].length).toEqual(3);
					expect(obj["employee"][0].firstname).toEqual("Edward");
					expect(obj["employee"][0].lastname).toEqual("Smith");
					expect(obj["employee"][0].phone).toEqual("(415) 333-0235");
					expect(obj["employee"][0].username).toEqual("esmith");
				});

			});

			describe("Return an empty object if:", function(){

				it("The given node has no attributes and no children", function(){
					var node = document.createElement("test");
					var obj = luga.xml.nodeToObject(node);
					expect(obj).toEqual({});
				});

			});

		});

	});

	describe(".parseFromString()", function(){

		it("Create a DOM Document out of a string", function(){
			expect(employeesDoc.getElementsByTagName("employee").length).toEqual(3);
		});

	});

});