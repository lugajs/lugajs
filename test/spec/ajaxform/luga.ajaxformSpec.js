describe("luga.ajaxform", function(){

	it("Lives inside its own namespace", function(){
		expect(luga.ajaxform).toBeDefined();
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.ajaxform.version).toBeDefined();
		});
	});

	describe(".Sender", function(){

		var basicSender, attributesSender, customSender, configSender;

		beforeEach(function(){
			loadFixtures("ajaxform/form.htm");

			basicSender = new luga.ajaxform.Sender({
				formNode: jQuery("#basic")
			});

			attributesSender = new luga.ajaxform.Sender({
				formNode: jQuery("#attributes")
			});

			customSender = new luga.ajaxform.Sender({
				formNode: jQuery("#customAttributes")
			});

			configSender = new luga.ajaxform.Sender({
				formNode: jQuery("#basic"),
				action: "configAction",
				method: "PUT",
				timeout: 40000,
				successmsg: "Success",
				errormsg: "Error"
			});

		});


		describe("Accepts an Options object as single argument", function(){

			describe("options.formNode", function(){

				it("Is mandatory", function(){
					expect(function(){
						var formHandler = new luga.ajaxform.Sender({});
					}).toThrow();
				});

				it("Throws an exception if the associated form node does not exists", function(){
					expect(function(){
						var formHandler = new luga.ajaxform.Sender({
							formNode: jQuery("#missing")
						});
					}).toThrow();
				});

			});

			describe("options.action either:", function(){

				it("Default to the current URL", function(){
					expect(basicSender.config.action).toEqual(document.location.href);
				});
				it("Retrieves the value from the form's action attribute", function(){
					expect(attributesSender.config.action).toEqual("attributeAction");
				});
				it("Retrieves the value from the form's data-lugajax-action custom attribute", function(){
					expect(customSender.config.action).toEqual("customAction");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.action).toEqual("configAction");
				});

			});

			describe("options.method either:", function(){

				it("Default to GET", function(){
					expect(basicSender.config.method).toEqual("GET");
				});
				it("Retrieves the value from the form's method attribute", function(){
					expect(attributesSender.config.method).toEqual("POST");
				});

				it("Retrieves the value from the form's data-lugajax-method custom attribute", function(){
					expect(customSender.config.method).toEqual("DELETE");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.method).toEqual("PUT");
				});

			});

			describe("options.timeout either:", function(){

				it("Default to 30s", function(){
					expect(basicSender.config.timeout).toEqual(30000);
				});
				it("Retrieves the value from the form's data-lugajax-timeout custom attribute", function(){
					expect(customSender.config.timeout).toEqual(20000);
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.timeout).toEqual(40000);
				});

			});

			describe("options.successmsg either:", function(){

				it("Default to: " + luga.ajaxform.CONST.MESSAGES.SUCCESS, function(){
					expect(basicSender.config.successmsg).toEqual(luga.ajaxform.CONST.MESSAGES.SUCCESS);
				});
				it("Retrieves the value from the form's data-lugajax-successmsg custom attribute", function(){
					expect(customSender.config.successmsg).toEqual("Test success");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.successmsg).toEqual("Success");
				});

			});

			describe("options.errormsg either:", function(){

				it("Default to: " + luga.ajaxform.CONST.MESSAGES.ERROR, function(){
					expect(basicSender.config.errormsg).toEqual(luga.ajaxform.CONST.MESSAGES.ERROR);
				});
				it("Retrieves the value from the form's data-lugajax-errormsg custom attribute", function(){
					expect(customSender.config.errormsg).toEqual("Test error");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.errormsg).toEqual("Error");
				});

			});

		});

	});

});