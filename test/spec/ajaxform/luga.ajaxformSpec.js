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
		window.ajaxFormHandlers = {};

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
				method: "POST",
				timeout: 40000,
				success: "ajaxFormHandlers.customSuccessHandler",
				successmsg: "Success",
				error: "ajaxFormHandlers.customErrorHandler",
				errormsg: "Error",
				before: "ajaxFormHandlers.customBefore",
				after: "ajaxFormHandlers.customAfter"
			});

			ajaxFormHandlers.customSuccessHandler = function(){
			};
			ajaxFormHandlers.customErrorHandler = function(){
			};
			ajaxFormHandlers.customBefore = function(){
			};
			ajaxFormHandlers.customAfter = function(){
			};

			spyOn(jQuery, "ajax").and.callFake(function(){
			});
			spyOn(ajaxFormHandlers, "customBefore").and.callFake(function(){
			});
			spyOn(ajaxFormHandlers, "customAfter").and.callFake(function(){
			});

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
					expect(configSender.config.method).toEqual("POST");
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

				it("Default to: 'luga.ajaxform.ajaxFormHandlers.replaceForm'", function(){
					expect(basicSender.config.success).toEqual('luga.ajaxform.handlers.replaceForm');
				});
				it("Retrieves the value from the form's data-lugajax-success custom attribute", function(){
					expect(customSender.config.success).toEqual("ajaxFormHandlers.customSuccessHandler");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.success).toEqual("ajaxFormHandlers.customSuccessHandler");
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

				it("Default to: 'luga.ajaxform.ajaxFormHandlers.errorAlert'", function(){
					expect(basicSender.config.error).toEqual('luga.ajaxform.handlers.errorAlert');
				});
				it("Retrieves the value from the form's data-lugajax-error custom attribute", function(){
					expect(customSender.config.error).toEqual("ajaxFormHandlers.customErrorHandler");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.error).toEqual("ajaxFormHandlers.customErrorHandler");
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
					expect(customSender.config.before).toEqual("ajaxFormHandlers.customBefore");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.before).toEqual("ajaxFormHandlers.customBefore");
				});

			});

			describe("options.after either:", function(){

				it("Default to: null", function(){
					expect(basicSender.config.after).toBeNull();
				});
				it("Retrieves the value from the form's data-lugajax-after custom attribute", function(){
					expect(customSender.config.after).toEqual("ajaxFormHandlers.customAfter");
				});
				it("Uses the value specified inside the option argument", function(){
					expect(configSender.config.after).toEqual("ajaxFormHandlers.customAfter");
				});

			});

		});

		describe(".send()", function(){

			describe("Invokes", function(){

				it("First: the options.before function (if any)", function(){
					// No options.before here
					basicSender.send();
					expect(ajaxFormHandlers.customBefore).not.toHaveBeenCalled();
					// Options.before here
					configSender.send();
					expect(ajaxFormHandlers.customBefore).toHaveBeenCalled();
				});
				it("Passing the form's DOM node as first argument", function(){
					configSender.send();
					expect(ajaxFormHandlers.customBefore).toHaveBeenCalledWith(jQuery("#basic")[0]);
				});
				it("Then: jQuery.ajax()", function(){
					configSender.send();
					expect(jQuery.ajax).toHaveBeenCalled();
				});
				it("Finally: the options.after function (if any)", function(){
					// No options.after here
					basicSender.send();
					expect(ajaxFormHandlers.customAfter).not.toHaveBeenCalled();
					// Options.after here
					configSender.send();
					expect(ajaxFormHandlers.customAfter).toHaveBeenCalled();
				});
				it("Passing the form's DOM node as first argument", function(){
					configSender.send();
					expect(ajaxFormHandlers.customAfter).toHaveBeenCalledWith(jQuery("#basic")[0]);
				});

			});

		});

	});

});