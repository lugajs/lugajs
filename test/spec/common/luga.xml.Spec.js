describe("luga.xml", function(){

	"use strict";

	var employeesStr, employeesDoc;
	beforeEach(function(){
		employeesStr = jasmineFixtures.read("xml/employees.txt");
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

	describe(".nodeToHash()", function(){

		describe("Convert an XML node into a JavaScript object", function(){

			describe("Mapping:", function(){

				it("Attributes to properties. Prefixed by '_'", function(){
					var node = document.createElement("test");
					node.setAttribute("name", "Ciccio");
					node.setAttribute("lastname", "Pasticcio");
					var obj = luga.xml.nodeToHash(node);
					expect(obj["_name"]).toEqual("Ciccio");
					expect(obj["_lastname"]).toEqual("Pasticcio");
				});

				it("Child nodes to properties", function(){
					// Quite an hack to get the employees Node
					var employeesDoc = luga.xml.parseFromString(employeesStr);
					var rootNode = luga.xml.evaluateXPath(employeesDoc, "//employees");

					var obj = luga.xml.nodeToHash(rootNode[0]);
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
					var obj = luga.xml.nodeToHash(node);
					expect(obj).toEqual({});
				});

			});

		});

	});

	describe(".nodeToString()", function(){

		it("Serialize a DOM Node into a string", function(){

			var xmlStr = "";
			xmlStr += "<artists>";
			xmlStr += "<player instrument=\"tenor sax\" name=\"Dexter Gordon\"/>";
			xmlStr += "<player instrument=\"tenor sax\" name=\"Sonny Rollins\"/>";
			xmlStr += "<player instrument=\"trumpet\" name=\"Thad Jones\"/>";
			xmlStr += "<player instrument=\"trumpet\" name=\"Lee Morgan\"/>";
			xmlStr += "<player instrument=\"piano\" name=\"Bill Evans\"/>";
			xmlStr += "</artists>";
			var xmlNode = luga.xml.parseFromString(xmlStr);

			// Need to use "toMatch" instead of "toEqual" to keep IE happy
			expect(luga.xml.nodeToString(xmlNode)).toMatch(xmlStr);
		});

	});

	describe(".parseFromString()", function(){

		it("Create a DOM Document out of a string", function(){
			expect(employeesDoc.getElementsByTagName("employee").length).toEqual(3);
		});

	});

});