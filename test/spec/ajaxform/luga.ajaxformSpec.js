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
				method: "PUT"
			});

		});


		describe("Accepts an Options object as single arguments", function(){

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

				it("Retrieves the value from the option argument", function(){
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

				it("Retrieves the value from the option argument", function(){
					expect(configSender.config.method).toEqual("PUT");
				});

			});

		});

	});

});