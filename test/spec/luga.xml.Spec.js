describe("luga.xml", function(){

	"use strict";

	var employeesStr, employeesDoc;
	beforeEach(function(){
		employeesStr = jasmine.getFixtures().read("xml/employees.xml");

		employeesDoc = new DOMParser().parseFromString("<employees></employees>",  "application/xml");
		var rootNode = employeesDoc.firstChild;
		rootNode.appendChild(createEmployeeNode("123456", "Smith", "Edward", "(415) 333-0235", employeesDoc.createCDATASection("esmith")));
		rootNode.appendChild(createEmployeeNode("127937", "Johnson", "Neil", "(415) 333-9475", employeesDoc.createCDATASection("njohnson")));
		rootNode.appendChild(createEmployeeNode("126474", "Williams", "Steve", "(415) 333-4573", employeesDoc.createCDATASection("swilliams")));

	});

	function createEmployeeNode(id, lastname, firstname, phone, userCDATA){
		var rootNode = document.createElement("employee");
		rootNode.setAttribute("id", id);

		var lastNameNode = document.createElement("lastname");
		lastNameNode.textContent = lastname;
		rootNode.appendChild(lastNameNode);

		var firstNameNode = document.createElement("firstname");
		firstNameNode.textContent = firstname;
		rootNode.appendChild(firstNameNode);

		var phoneNode = document.createElement("phone");
		phoneNode.textContent = phone;
		rootNode.appendChild(phoneNode);

		var usernameNode = document.createElement("username");
		usernameNode.appendChild(userCDATA);
		rootNode.appendChild(usernameNode);

		return rootNode;
	}

	it("Contains XML-related API", function(){
		expect(luga.xml).toBeDefined();
	});

	describe(".evaluateXPath()", function(){

		it("Evaluate an XPath expression against a given node", function(){
			var doc = luga.xml.parseFromString(employeesStr);
			expect(luga.xml.evaluateXPath(doc, "/employees/employee").length).toEqual(3);
		});

		it("Results are returned as an array of nodes", function(){
			var doc = luga.xml.parseFromString(employeesStr);
			var result = luga.xml.evaluateXPath(doc, "//employee")
			expect(jQuery.isArray(result)).toEqual(true);
		});

		it("An empty array is returned in case there is no match", function(){
			var doc = luga.xml.parseFromString(employeesStr);
			expect(luga.xml.evaluateXPath(doc, "/missing").length).toEqual(0);
		});

	});

	describe(".nodeToObject()", function(){

		describe("Convert an XML node into a JavaScript object", function(){

			describe("Mapping:", function(){

				it("Attributes to properties. Prefixed by '@'", function(){
					var node = document.createElement("test");
					node.setAttribute("name", "Ciccio");
					node.setAttribute("lastname", "Pasticcio");
					var obj = luga.xml.nodeToObject(node);
					expect(obj["@name"]).toEqual("Ciccio");
					expect(obj["@lastname"]).toEqual("Pasticcio");
				});

				it("Child nodes to properties", function(){
					var obj = luga.xml.nodeToObject(employeesDoc.firstChild);
					expect(obj["employee"].length).toEqual(3);
					expect(obj["employee"][0].firstname).toEqual("Edward");
					expect(obj["employee"][0].lastname).toEqual("Smith");
					expect(obj["employee"][0].phone).toEqual("(415) 333-0235");
					expect(obj["employee"][0].username).toEqual("esmith");
				});

			});

		});

	});

	describe(".parseFromString()", function(){

		it("Create a DOM Document out of a string", function(){
			var doc = luga.xml.parseFromString(employeesStr);
			expect(employeesDoc.getElementsByTagName("employee").length).toEqual(3);
		});

	});

});