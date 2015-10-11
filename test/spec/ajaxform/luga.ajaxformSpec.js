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

		var basicSender, attributesSender, customSender, configSender, customSuccessHandler, customErrorHandler, customBefore, customAfter;

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
				success: "customSuccessHandler",
				successmsg: "Success",
				error: "customErrorHandler",
				errormsg: "Error",
				before: "customBefore",
				after: "customAfter"
			});

			customSuccessHandler = function(){
			};
			customErrorHandler = function(){
			};
			customBefore = function(){
			};
			customAfter = function(){
			};

		});

		it("Throws an exception if the associated form node does not exists", function(){
			expect(function(){
				var formHandler = new luga.ajaxform.Sender({
					formNode: jQuery("#missing")
				});
			}).toThrow();
		});

		describe("Accepts an Options object as single argument", function(){

			describe("options.formNode", function(){

				it("Is mandatory", function(){
					expect(function(){
						var formHandler = new luga.ajaxform.Sender({});
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

			describe("options.success either:", function(){

				it("Default to: 'luga.ajaxform.handlers.replaceForm'", function(){
					expect(basicSender.config.success).toEqual('luga.ajaxform.handlers.replaceForm');
				});
				it("Retrieves the value from the form's data-lugajax-success custom attribute", function(){
					expect(customSender.config.success).toEqual("customSuccessHandler");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.success).toEqual("customSuccessHandler");
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

			describe("options.error either:", function(){

				it("Default to: 'luga.ajaxform.handlers.errorAlert'", function(){
					expect(basicSender.config.error).toEqual('luga.ajaxform.handlers.errorAlert');
				});
				it("Retrieves the value from the form's data-lugajax-error custom attribute", function(){
					expect(customSender.config.error).toEqual("customErrorHandler");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.error).toEqual("customErrorHandler");
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

			describe("options.before either:", function(){

				it("Default to: null", function(){
					expect(basicSender.config.before).toBeNull();
				});
				it("Retrieves the value from the form's data-lugajax-before custom attribute", function(){
					expect(customSender.config.before).toEqual("customBefore");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.before).toEqual("customBefore");
				});

			});

			describe("options.after either:", function(){

				it("Default to: null", function(){
					expect(basicSender.config.after).toBeNull();
				});
				it("Retrieves the value from the form's data-lugajax-after custom attribute", function(){
					expect(customSender.config.after).toEqual("customAfter");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.after).toEqual("customAfter");
				});

			});

		});

		describe(".send()", function(){

		});

	});

});