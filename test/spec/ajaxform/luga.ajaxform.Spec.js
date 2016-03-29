/* globals ajaxFormHandlers */

describe("luga.ajaxform", function(){

	"use strict";

	var mockJson, basicSender, attributesSender, customSender, configSender;
	window.ajaxFormHandlers = {};

	beforeEach(function(){

		loadFixtures("ajaxform/form.htm");

		mockJson = getJSONFixture("ajaxform/action.json");

		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest("mock/missing.json").andReturn({
			status: 404
		});
		jasmine.Ajax.stubRequest("mock/action.json").andReturn({
			contentType: "application/json",
			responseText:  JSON.stringify(mockJson),
			status: 200
		});

		luga.ajaxform.handlers.errorAlert = function(msg, formNode, textStatus, errorThrown, jqXHR){
			 // Override default handler
		};

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
			action: "mock/action.json",
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

		spyOn(luga.form, "toQueryString").and.callThrough(function(){
		});
		spyOn(luga.form, "toHash").and.callThrough(function(){
		});
		spyOn(luga.form, "toJson").and.callThrough(function(){
		});
		spyOn(jQuery, "ajax").and.callThrough(function(){
		});
		spyOn(ajaxFormHandlers, "customSuccessHandler").and.callFake(function(){
		});
		spyOn(ajaxFormHandlers, "customErrorHandler").and.callFake(function(){
		});
		spyOn(ajaxFormHandlers, "customBefore").and.callFake(function(){
		});
		spyOn(ajaxFormHandlers, "customAfter").and.callFake(function(){
		});

	});

	afterEach(function() {
		jasmine.Ajax.uninstall();
	});

	it("Lives inside its own namespace", function(){
		expect(luga.ajaxform).toBeDefined();
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.ajaxform.version).toBeDefined();
		});
	});

	describe(".CONST", function(){

		it("Contains default values used by the library", function(){
			expect(luga.ajaxform.CONST).toBeDefined();
		});

		describe(".DEFAULT_METHOD", function(){

			it("Default to: " + luga.ajaxform.CONST.DEFAULT_METHOD, function(){
				expect(luga.ajaxform.CONST.DEFAULT_METHOD).toEqual("GET");
			});
			it("It can be changed at run-time", function(){
				luga.ajaxform.CONST.DEFAULT_METHOD = "POST";
				var sender = new luga.ajaxform.Sender({
					formNode: jQuery("#basic")
				});
				expect(sender.config.method).toEqual("POST");
				// Reset
				luga.ajaxform.CONST.DEFAULT_METHOD = "GET";
			});

		});

		describe(".DEFAULT_TIME_OUT", function(){

			it("Default to: " + luga.ajaxform.CONST.DEFAULT_TIME_OUT, function(){
				expect(luga.ajaxform.CONST.DEFAULT_TIME_OUT).toEqual(30000);
			});
			it("It can be changed at run-time", function(){
				luga.ajaxform.CONST.DEFAULT_TIME_OUT = 20000;
				var sender = new luga.ajaxform.Sender({
					formNode: jQuery("#basic")
				});
				expect(sender.config.timeout).toEqual(20000);
				// Reset
				luga.ajaxform.CONST.DEFAULT_TIME_OUT = 30000;
			});

		});

		describe(".HANDLERS", function(){

			describe(".ERROR", function(){

				it("Default to: " + luga.ajaxform.CONST.HANDLERS.ERROR, function(){
					expect(luga.ajaxform.CONST.HANDLERS.ERROR).toEqual("luga.ajaxform.handlers.errorAlert");
				});
				it("It can be changed at run-time", function(){
					luga.ajaxform.CONST.HANDLERS.ERROR = "myErrorHandler";
					var sender = new luga.ajaxform.Sender({
						formNode: jQuery("#basic")
					});
					expect(sender.config.error).toEqual("myErrorHandler");
					// Reset
					luga.ajaxform.CONST.HANDLERS.ERROR = "luga.ajaxform.handlers.errorAlert";
				});

			});

			describe(".SUCCESS", function(){

				it("Default to: " + luga.ajaxform.CONST.HANDLERS.SUCCESS, function(){
					expect(luga.ajaxform.CONST.HANDLERS.SUCCESS).toEqual("luga.ajaxform.handlers.replaceForm");
				});
				it("It can be changed at run-time", function(){
					luga.ajaxform.CONST.HANDLERS.SUCCESS = "mySuccessHandler";
					var sender = new luga.ajaxform.Sender({
						formNode: jQuery("#basic")
					});
					expect(sender.config.success).toEqual("mySuccessHandler");
					// Reset
					luga.ajaxform.CONST.HANDLERS.SUCCESS = "luga.ajaxform.handlers.replaceForm";
				});

			});

		});

		describe(".MESSAGES", function(){

			describe(".ERROR", function(){

				it("Default to: " + luga.ajaxform.CONST.MESSAGES.ERROR, function(){
					expect(luga.ajaxform.CONST.MESSAGES.ERROR).toEqual("Failed to submit the form");
				});
				it("It can be changed at run-time", function(){
					luga.ajaxform.CONST.MESSAGES.ERROR = "x";
					var sender = new luga.ajaxform.Sender({
						formNode: jQuery("#basic")
					});
					expect(sender.config.errormsg).toEqual("x");
					// Reset
					luga.ajaxform.CONST.MESSAGES.ERROR = "Failed to submit the form";
				});

			});

			describe(".SUCCESS", function(){

				it("Default to: " + luga.ajaxform.CONST.MESSAGES.SUCCESS, function(){
					expect(luga.ajaxform.CONST.MESSAGES.SUCCESS).toEqual("Thanks for submitting the form");
				});
				it("It can be changed at run-time", function(){
					luga.ajaxform.CONST.MESSAGES.SUCCESS = "xxx";
					var sender = new luga.ajaxform.Sender({
						formNode: jQuery("#basic")
					});
					expect(sender.config.successmsg).toEqual("xxx");
					// Reset
					luga.ajaxform.CONST.MESSAGES.SUCCESS = "Thanks for submitting the form";
				});

			});

		});

	});

	describe(".handlers", function(){

		it("Contains default and ready available success/error handlers", function(){
			expect(luga.ajaxform.handlers).toBeDefined();
		});

		describe(".afterValidation ()", function(){

			it("Should be used as after handler by Luga Validator", function(){
				expect(luga.ajaxform.handlers.afterValidation).toBeDefined();
			});
			it("Block the passed submite event", function(){
				var mockForm = jQuery("<form>");
				var mockEvent = {
					preventDefault: function(){}
				};
				spyOn(mockEvent, "preventDefault");

				luga.ajaxform.handlers.afterValidation(mockForm,mockEvent);
				expect(mockEvent.preventDefault).toHaveBeenCalled();
			});

		});

		describe(".errorAlert()", function(){

			it("Is the default error handler", function(){
				expect(luga.ajaxform.handlers.errorAlert).toBeDefined();
				expect(basicSender.config.error).toEqual("luga.ajaxform.handlers.errorAlert");
			});

		});

		describe(".errorBox()", function(){

			it("Is a ready available error handler", function(){
				expect(luga.ajaxform.handlers.errorBox).toBeDefined();
				expect(basicSender.config.error).not.toEqual("luga.ajaxform.handlers.errorBox");
			});

			it("It calls luga.utils.removeDisplayBox() and luga.utils.displayErrorMessage()", function(){
				spyOn(luga.utils, "removeDisplayBox").and.callFake(function(){
				});
				spyOn(luga.utils, "displayErrorMessage").and.callFake(function(){
				});
				luga.ajaxform.handlers.errorBox("test", jQuery("<form>"));
				expect(luga.utils.removeDisplayBox).toHaveBeenCalled();
				expect(luga.utils.displayErrorMessage).toHaveBeenCalled();
			});

		});

		describe(".replaceForm()", function(){

			it("Is the default success handler", function(){
				expect(luga.ajaxform.handlers.replaceForm).toBeDefined();
				expect(basicSender.config.success).toEqual("luga.ajaxform.handlers.replaceForm");
			});
			it("Replace the form's content with the given message", function(){
				var formNode = jQuery("form");
				luga.ajaxform.handlers.replaceForm("done", formNode[0]);
				expect(formNode.html()).toEqual("done");
			});

		});

	});

	describe(".Sender", function(){

		describe("Accepts an Options object as single argument", function(){

			describe("options.formNode", function(){

				it("Is mandatory", function(){
					expect(function(){
						new luga.ajaxform.Sender({});
					}).toThrow();
				});
				it("Throws an exception if the associated form node does not exists", function(){
					expect(function(){
						new luga.ajaxform.Sender({
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
					expect(configSender.config.action).toEqual("mock/action.json");
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
					expect(basicSender.config.success).toEqual("luga.ajaxform.handlers.replaceForm");
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
					expect(basicSender.config.error).toEqual("luga.ajaxform.handlers.errorAlert");
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
				it("Throws an exception if it fails to lookup the function", function(){
					var formHandler = new luga.ajaxform.Sender({
						formNode: jQuery("#basic"),
						before: "missing"
					});
					expect(function(){
						formHandler.send();
					}).toThrow();
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
				it("Throws an exception if it fails to lookup the function", function(){
					var formHandler = new luga.ajaxform.Sender({
						formNode: jQuery("#basic"),
						after: "missing"
					});
					expect(function(){
						formHandler.send();
					}).toThrow();
				});

			});

		});

		describe(".send()", function(){

			describe("First", function(){

				it("Serializes the form using luga.form.toQueryString()", function(){
					basicSender.send();
					expect(luga.form.toQueryString).toHaveBeenCalled();
				});

			});

			describe("Then: if options.before is defined:", function(){

				it("Calls it", function(){
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

			});

			describe("Then:", function(){

				it("Send the serialize form's data using jQuery.ajax()", function(){
					configSender.send();
					expect(jQuery.ajax).toHaveBeenCalled();
				});

			});

			describe("Then either:", function(){

				it("Invokes its success handler", function(){
					configSender.send();
					expect(ajaxFormHandlers.customSuccessHandler).toHaveBeenCalled();

				});

				it("Invokes its error handler", function(){
					configSender.config.action = "mock/missing.json";
					configSender.send();
					expect(ajaxFormHandlers.customErrorHandler).toHaveBeenCalled();
				});

			});

			describe("Finally: if options.after is defined:", function(){

				it("Calls it", function(){
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

		describe(".sendJson()", function(){

			describe("First", function(){

				it("Convert the form into JSON using luga.form.toJson()", function(){
					basicSender.sendJson();
					expect(luga.form.toJson).toHaveBeenCalled();
				});

			});

			describe("Then: if options.before is defined:", function(){

				it("Calls it", function(){
					// No options.before here
					basicSender.sendJson();
					expect(ajaxFormHandlers.customBefore).not.toHaveBeenCalled();
					// Options.before here
					configSender.sendJson();
					expect(ajaxFormHandlers.customBefore).toHaveBeenCalled();
				});

				it("Passing the form's DOM node as first argument", function(){
					configSender.sendJson();
					expect(ajaxFormHandlers.customBefore).toHaveBeenCalledWith(jQuery("#basic")[0]);
				});

			});

			describe("Then:", function(){

				it("Send the serialize form's data using jQuery.ajax()", function(){
					configSender.sendJson();
					expect(jQuery.ajax).toHaveBeenCalled();
				});

			});

			describe("Finally: if options.after is defined:", function(){

				it("Calls it", function(){
					// No options.after here
					basicSender.sendJson();
					expect(ajaxFormHandlers.customAfter).not.toHaveBeenCalled();
					// Options.after here
					configSender.sendJson();
					expect(ajaxFormHandlers.customAfter).toHaveBeenCalled();
				});

				it("Passing the form's DOM node as first argument", function(){
					configSender.sendJson();
					expect(ajaxFormHandlers.customAfter).toHaveBeenCalledWith(jQuery("#basic")[0]);
				});

			});

		});

	});

});