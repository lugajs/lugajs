describe("luga.xml", function(){

	"use strict";

	var employeesStr;
	beforeEach(function(){
		employeesStr = jasmine.getFixtures().read("xml/employees.xml");
	});

	it("Contains XML-related API", function(){
		expect(luga.xml).toBeDefined();
	});

	describe(".parseFromString()", function(){

		it("Create a DOM document out of a string", function(){
			var employeesDom = luga.xml.parseFromString(employeesStr);
			expect(employeesDom.getElementsByTagName("employee").length).toEqual(5);
		});

	});

});