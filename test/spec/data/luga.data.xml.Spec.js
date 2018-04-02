describe("luga.data.xml", function(){

	"use strict";

	var employeesStr, employeesDoc;
	beforeEach(function(){
		employeesStr = jasmineFixtures.read("xml/employees.txt");
		employeesDoc = luga.data.xml.parseFromString(employeesStr);
	});

	it("Contains XML-related API", function(){
		expect(luga.data.xml).toBeDefined();
	});

	describe(".evaluateXPath()", function(){

		it("Evaluate an XPath expression against a given node", function(){
			expect(luga.data.xml.evaluateXPath(employeesDoc, "/employees/employee").length).toEqual(3);
		});

		it("Results are returned as an array of nodes", function(){
			var result = luga.data.xml.evaluateXPath(employeesDoc, "//employee");
			expect(luga.type(result)).toEqual("array");
		});

		it("An empty array is returned in case there is no match", function(){
			expect(luga.data.xml.evaluateXPath(employeesDoc, "/missing").length).toEqual(0);
		});

	});

	describe(".nodeToHash()", function(){

		describe("Convert an XML node into a JavaScript object", function(){

			describe("Mapping:", function(){

				it("Attributes to properties. Prefixed by '_'", function(){
					var node = document.createElement("test");
					node.setAttribute("name", "Ciccio");
					node.setAttribute("lastname", "Pasticcio");
					var obj = luga.data.xml.nodeToHash(node);
					expect(obj["_name"]).toEqual("Ciccio");
					expect(obj["_lastname"]).toEqual("Pasticcio");
				});

				it("Child nodes to properties", function(){
					// Quite an hack to get the employees Node
					var employeesDoc = luga.data.xml.parseFromString(employeesStr);
					var rootNode = luga.data.xml.evaluateXPath(employeesDoc, "//employees");

					var obj = luga.data.xml.nodeToHash(rootNode[0]);
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
					var obj = luga.data.xml.nodeToHash(node);
					expect(obj).toEqual({});
				});

			});

		});

	});

	describe(".nodeToString()", function(){

		it("Serialize a DOM Node into a string", function(){

			/**
			 * Remove whitespace to equalize serialized XML across browsers
			 * @param {String} str
			 * @return {String}
			 */
			var equalizeXmlString = function(str){
				return str.replace(/\s/g, "");
			};

			var xmlStr = "";
			xmlStr += "<artists>";
			xmlStr += "<player name=\"Dexter Gordon\" instrument=\"tenor sax\" />";
			xmlStr += "<player name=\"Sonny Rollins\" instrument=\"tenor sax\" />";
			xmlStr += "<player name=\"Thad Jones\" instrument=\"trumpet\" />";
			xmlStr += "<player name=\"Lee Morgan\" instrument=\"trumpet\" />";
			xmlStr += "<player name=\"Bill Evans\" instrument=\"piano\" />";
			xmlStr += "</artists>";
			var xmlNode = luga.data.xml.parseFromString(xmlStr);
			
			expect(equalizeXmlString(luga.data.xml.nodeToString(xmlNode))).toEqual(equalizeXmlString(xmlStr));
		});

	});

	describe(".parseFromString()", function(){

		it("Create a DOM Document out of a string", function(){
			expect(employeesDoc.getElementsByTagName("employee").length).toEqual(3);
		});

	});

});