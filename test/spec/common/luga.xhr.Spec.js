describe("luga.xhr", function(){

	"use strict";

	it("Contains XHR-related API", function(){
		expect(luga.xhr).toBeDefined();
	});

	describe("luga.xhr.Request", function(){

		var mockJson, req, mockObj;
		beforeEach(function(){

			mockJson = jasmineFixtures.read("data/people.json");

			jasmine.Ajax.install();

			jasmine.Ajax.stubRequest("mock/missing.json?").andReturn({
				status: 404
			});
			jasmine.Ajax.stubRequest("mock/people.json").andReturn({
				contentType: "application/json",
				responseText: JSON.stringify(mockJson),
				status: 200
			});
			jasmine.Ajax.stubRequest("mock/people.txt?").andReturn({
				contentType: "text/plain",
				responseText: JSON.stringify(mockJson),
				status: 200
			});

			req = new luga.xhr.Request();

			mockObj = {
				error: function(){
				},
				success: function(){
				}
			};
			spyOn(mockObj, "error");
			spyOn(mockObj, "success");

		});

		afterEach(function(){
			jasmine.Ajax.uninstall();
		});

		it("Is the xhr request constructor", function(){
			expect(luga.type(luga.xhr.Request)).toEqual("function");
		});

		describe("Accepts an Options object as single argument", function(){

			describe("options.method", function(){

				it("Default to: GET", function(){
					spyOn(req.xhr, "open");
					spyOn(req.xhr, "send");
					req.send("mock/people.json");
					expect(req.xhr.open).toHaveBeenCalledWith("GET", "mock/people.json", true);
				});

				it("Affect the HTTP method used", function(){
					var customReq = new luga.xhr.Request({
						method: "POST"
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					customReq.send("mock/people.json");
					expect(customReq.xhr.open).toHaveBeenCalledWith("POST", "mock/people.json", true);
				});

			});

			describe("options.success", function(){

				it("Default to: console.debug", function(){
					spyOn(console, "debug");
					req.send("mock/people.json");
					expect(console.debug).toHaveBeenCalled();
				});

				it("Is the function to be invoked if the request succeeds", function(){
					var customReq = new luga.xhr.Request({
						success: mockObj.success
					});
					customReq.send("mock/people.json");
					expect(mockObj.success).toHaveBeenCalled();
				});

			});

			describe("options.error", function(){

				it("Default to: console.debug", function(){
					spyOn(console, "debug");
					req.send("mock/missing.json");
					expect(console.debug).toHaveBeenCalled();
				});

				it("Is the function to be invoked if the request fails", function(){
					var customReq = new luga.xhr.Request({
						error: mockObj.error
					});
					customReq.send("mock/missing.json");
					expect(mockObj.error).toHaveBeenCalled();
				});

			});

			describe("options.timeout", function(){

				it("Default to: 5000 ms", function(){
					spyOn(req.xhr, "open");
					spyOn(req.xhr, "send");
					req.send("mock/people.json");
					expect(req.xhr.timeout).toEqual(5000);
				});

				it("Set the timeout on XHR", function(){
					var customReq = new luga.xhr.Request({
						timeout: 100
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					customReq.send("mock/people.json");
					expect(customReq.xhr.timeout).toEqual(100);
				});

			});

			describe("options.async", function(){

				it("Default to: true", function(){
					spyOn(req.xhr, "open");
					spyOn(req.xhr, "send");
					req.send("mock/people.json");
					expect(req.xhr.open).toHaveBeenCalledWith("GET", "mock/people.json", true);
				});

				it("Indicate that the request should be handled asynchronously", function(){
					var customReq = new luga.xhr.Request({
						async: false
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					customReq.send("mock/people.json");
					expect(customReq.xhr.open).toHaveBeenCalledWith("GET", "mock/people.json", false);
				});

			});

			describe("options.cache", function(){

				it("Default to: true", function(){
					spyOn(req.xhr, "open");
					spyOn(req.xhr, "send");
					req.send("mock/people.json");
					expect(req.xhr.open).toHaveBeenCalledWith("GET", "mock/people.json", true);
				});

				it("If set to false, a timestamp will be appended to the querystring of the requested URL", function(){
					var customReq = new luga.xhr.Request({
						cache: false
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					customReq.send("mock/people.json");

					// Timestamp vary, so we just look for a partial match
					var calledUrl = customReq.xhr.open.calls.argsFor(0)[1];
					expect(calledUrl.substring(0, 29)).toEqual("mock/people.json?_anti-cache=");
				});

			});

			describe("options.headers", function(){

				it("Default to: an empty array", function(){
					spyOn(req.xhr, "open");
					spyOn(req.xhr, "send");
					spyOn(req.xhr, "setRequestHeader");
					req.send("mock/people.json");
					// One call is made for Content-Type, another for requestedWith
					expect(req.xhr.setRequestHeader).toHaveBeenCalledTimes(2);
				});

				it("Is an array of name/value pairs to be used for custom HTTP headers", function(){
					var customReq = new luga.xhr.Request({
						headers: [{
							name: "X-test",
							value: "Testing"
						}]
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					spyOn(customReq.xhr, "setRequestHeader");
					customReq.send("mock/people.json");

					// One call is made for Content-Type, another for requestedWith
					expect(customReq.xhr.setRequestHeader).toHaveBeenCalledTimes(3);
					// Inspect the third call
					expect(customReq.xhr.setRequestHeader.calls.argsFor(2)[0]).toEqual("X-test");
					expect(customReq.xhr.setRequestHeader.calls.argsFor(2)[1]).toEqual("Testing");
				});

			});

			describe("options.requestedWith", function(){

				it("Default to: XMLHttpRequest", function(){
					spyOn(req.xhr, "open");
					spyOn(req.xhr, "send");
					spyOn(req.xhr, "setRequestHeader");
					req.send("mock/people.json");
					// Inspect the second call
					expect(req.xhr.setRequestHeader.calls.argsFor(1)[0]).toEqual("X-Requested-With");
					expect(req.xhr.setRequestHeader.calls.argsFor(1)[1]).toEqual("XMLHttpRequest");
				});

				it("Is the value used for the X-Requested-With custom HTTP header", function(){
					var customReq = new luga.xhr.Request({
						requestedWith: "XHRtesting"
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					spyOn(customReq.xhr, "setRequestHeader");
					customReq.send("mock/people.json");

					// Inspect the second call
					expect(customReq.xhr.setRequestHeader.calls.argsFor(1)[0]).toEqual("X-Requested-With");
					expect(customReq.xhr.setRequestHeader.calls.argsFor(1)[1]).toEqual("XHRtesting");
				});

				it("The X-Requested-With custom HTTP header is not set for cross-site requests", function(){
					var customReq = new luga.xhr.Request({
						requestedWith: "XHRtesting"
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					spyOn(customReq.xhr, "setRequestHeader");
					customReq.send("http://massimocorner.com/people.json");

					// Only one call is made for Content-Type, nothing else
					expect(customReq.xhr.setRequestHeader).toHaveBeenCalledTimes(1);
				});

			});

			describe("options.contentType", function(){

				it("Default to: text/plain", function(){
					spyOn(req.xhr, "open");
					spyOn(req.xhr, "send");
					spyOn(req.xhr, "setRequestHeader");
					req.send("mock/people.json");
					// Inspect the first call
					expect(req.xhr.setRequestHeader.calls.argsFor(0)[0]).toEqual("Content-Type");
					expect(req.xhr.setRequestHeader.calls.argsFor(0)[1]).toEqual("text/plain");
				});

				it("Default to: application/x-www-form-urlencoded for POST requests", function(){
					var customReq = new luga.xhr.Request({
						method: "POST"
					});
					spyOn(customReq.xhr, "open");
					spyOn(customReq.xhr, "send");
					spyOn(customReq.xhr, "setRequestHeader");
					customReq.send("mock/people.json");
					// Inspect the first call
					expect(customReq.xhr.setRequestHeader.calls.argsFor(0)[0]).toEqual("Content-Type");
					expect(customReq.xhr.setRequestHeader.calls.argsFor(0)[1]).toEqual("application/x-www-form-urlencoded");
				});

			});

		});

		describe(".xhr", function(){

			it("Is an instance of XMLHttpRequest", function(){
				expect(req.xhr).toBeInstanceOf(XMLHttpRequest);
			});

		});

		describe(".abort()", function(){

			it("Invoke .xhr.abort()", function(){
				spyOn(req.xhr, "abort");
				req.abort();
				expect(req.xhr.abort).toHaveBeenCalled();
			});

		});

		describe(".isRequestPending()", function(){

			it("Return true on a newly initialize request", function(){
				expect(req.isRequestPending()).toEqual(true);
			});

			it("Return false if .xhr.readyState is 4", function(){
				req.xhr.readyState = 4;
				expect(req.isRequestPending()).toEqual(false);
			});

			it("False otherwise", function(){
				req.xhr.readyState = 1;
				expect(req.isRequestPending()).toEqual(true);
				req.xhr.readyState = 2;
				expect(req.isRequestPending()).toEqual(true);
				req.xhr.readyState = 3;
				expect(req.isRequestPending()).toEqual(true);
			});

		});

		describe(".send()", function(){

			describe("Accept two arguments:", function(){

				describe("The first is a mandatory URL", function(){

					it("To be called", function(){
						spyOn(req.xhr, "open");
						spyOn(req.xhr, "send");
						req.send("mock/people.json");
						expect(req.xhr.open).toHaveBeenCalledWith("GET", "mock/people.json", true);
					});

				});

				describe("The second is an Optional parameter which lets you specify the request's body", function(){

					it("If specified, it is send to the server", function(){
						var customReq = new luga.xhr.Request({
							method: "POST"
						});
						spyOn(customReq.xhr, "open");
						spyOn(customReq.xhr, "send");
						customReq.send("mock/people.json", "test=true&riTest=veryTrue");
						expect(customReq.xhr.send).toHaveBeenCalledWith("test=true&riTest=veryTrue");
					});

					it("Else: null is send to the server", function(){
						spyOn(req.xhr, "open");
						spyOn(req.xhr, "send");
						req.send("mock/people.json");
						expect(req.xhr.send).toHaveBeenCalledWith(null);
					});

					describe("If method is GET:", function(){

						it("It is also used as querystring", function(){
							var customReq = new luga.xhr.Request({
								method: "GET"
							});
							spyOn(customReq.xhr, "open");
							spyOn(customReq.xhr, "send");
							customReq.send("mock/people.json", "test=true&riTest=veryTrue");
							expect(customReq.xhr.open).toHaveBeenCalledWith("GET", "mock/people.json?test=true&riTest=veryTrue", true);
							expect(customReq.xhr.send).toHaveBeenCalledWith("test=true&riTest=veryTrue");
						});

						it("If the URL already contains a querystring, it is appended", function(){
							var customReq = new luga.xhr.Request({
								method: "GET"
							});
							spyOn(customReq.xhr, "open");
							spyOn(customReq.xhr, "send");
							customReq.send("mock/people.json?query=true", "test=true&riTest=veryTrue");
							expect(customReq.xhr.open).toHaveBeenCalledWith("GET", "mock/people.json?query=true&test=true&riTest=veryTrue", true);
							expect(customReq.xhr.send).toHaveBeenCalledWith("test=true&riTest=veryTrue");
						});

					});

				});

			});

		});

	});

});