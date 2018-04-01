describe("luga.data.widgets", function(){

	"use strict";

	var mockButton, mockDiv, mockDs, mockJson, baseWidget, showMoreWidget;
	beforeEach(function(){

		mockButton = document.createElement("button");

		mockDiv = document.createElement("div");
		mockDiv.setAttribute("style", "overflow-y: auto; height: 100px");

		mockDs = new luga.data.JsonDataSet({
			uuid: "masterDs",
			incrementalLoad: true
		});

		mockJson = {
			results: [],
			params: {
				nextKey: "testId"
			}
		};

		spyOn(mockDs, "getRawJson").and.returnValue(mockJson);

		baseWidget = new luga.data.widgets.ShowMore({
			dataSet: mockDs,
			url: "/fake/?key={nextKey}",
			paramPath: "params"
		});

		showMoreWidget = new luga.data.widgets.ShowMoreButton({
			button: mockButton,
			dataSet: mockDs,
			url: "",
			paramPath: "params"
		});

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	describe(".ShowMore", function(){

		it("Is an abstract widget", function(){
			expect(luga.data.widgets.ShowMore).toBeDefined();
			expect(luga.type(luga.data.widgets.ShowMore)).toEqual("function");
		});

		it("Register itself as observer of the associated dataSource", function(){
			expect(mockDs.observers[0]).toEqual(baseWidget);
		});

		describe("Accepts an Options object as single argument", function(){

			describe("options.dataSet", function(){
				it("Is the dataSet to which the widget will be associated", function(){
					expect(baseWidget.config.dataSet).toEqual(mockDs);
				});
				it("Throws an exception if not specified", function(){
					expect(function(){
						new luga.data.widgets.ShowMore({url: "test"});
					}).toThrow();
				});
			});

			describe("options.url", function(){
				it("Is a string template that will be used to assemble the url for next XHR call", function(){
					var widget = new luga.data.widgets.ShowMore({
						dataSet: mockDs,
						url: "/test/{placeHolder}"
					});
					expect(widget.config.url).toEqual("/test/{placeHolder}");
				});
				it("Throws an exception if not specified", function(){
					expect(function(){
						new luga.data.widgets.ShowMore({dataSet: mockDs});
					}).toThrow();
				});
			});

			describe("options.paramPath", function(){
				it("Is a JSON path that will be used to retrieve params from the HTTP response", function(){
					expect(baseWidget.config.paramPath).toEqual("params");
				});
				it("Default to an empty string", function(){
					var widget = new luga.data.widgets.ShowMore({
						dataSet: mockDs,
						url: "/test/{placeHolder}"
					});
					expect(widget.config.paramPath).toEqual("");
				});
			});

		});

		describe(".assembleUrl()", function(){

			describe("First:", function(){
				it("Call dataSet's .getRawJson()", function(){
					baseWidget.assembleUrl();
					expect(mockDs.getRawJson).toHaveBeenCalled();
				});
			});
			describe("Then:", function(){

				describe("If paramPath is not an empty string:", function(){

					it("Call luga.lookupProperty()", function(){
						spyOn(luga, "lookupProperty").and.callFake(function(){
						});
						baseWidget.assembleUrl();
						expect(luga.lookupProperty).toHaveBeenCalledWith(mockJson, baseWidget.config.paramPath);
					});

				});

			});
			describe("Finally:", function(){
				it("Returns the generated URL to be used for next XHR call", function(){
					expect(baseWidget.assembleUrl()).toEqual("/fake/?key=testId");
				});
			});

		});

		describe(".disable()", function(){
			it("Is an abstract method", function(){
				expect(luga.type(baseWidget.disable)).toEqual("function");
			});
		});

		describe(".enable()", function(){
			it("Is an abstract method", function(){
				expect(luga.type(baseWidget.disable)).toEqual("function");
			});
		});

		describe(".fetch()", function(){

			describe("First:", function(){

				it("Call .assembleUrl()", function(){
					spyOn(baseWidget, "assembleUrl").and.callFake(function(){
					});
					spyOn(mockDs, "loadData");
					baseWidget.fetch();
					expect(baseWidget.assembleUrl).toHaveBeenCalled();
				});

			});
			describe("Then:", function(){

				describe("If .assembleUrl() return something different than options.url:", function(){

					it("Call dataSet.setUrl(), then dataSet.loadData()", function(){
						spyOn(mockDs, "setUrl");
						spyOn(mockDs, "loadData");
						var newUrl = baseWidget.assembleUrl();
						baseWidget.fetch();
						expect(mockDs.setUrl).toHaveBeenCalledWith(newUrl);
						expect(mockDs.loadData).toHaveBeenCalled();
					});

				});

				describe("Else:", function(){

					it("Call .disable()", function(){
						spyOn(baseWidget, "assembleUrl").and.returnValue(baseWidget.config.url);
						spyOn(baseWidget, "disable");
						baseWidget.fetch();
						expect(baseWidget.disable).toHaveBeenCalled();
					});

				});

			});

		});

		describe(".isEnabled()", function(){
			it("Return false by default", function(){
				expect(baseWidget.isEnabled()).toEqual(false);
			});
			it("Return true if the dataSet is ready", function(){
				mockDs.setState(luga.data.STATE.READY);
				expect(baseWidget.isEnabled()).toEqual(true);
			});
		});

		describe(".updateState()", function(){

			describe("If the dataSet is ready:", function(){
				it("Call .enable()", function(){
					spyOn(baseWidget, "enable");
					mockDs.setState(luga.data.STATE.READY);
					baseWidget.updateState();
					expect(baseWidget.enable).toHaveBeenCalled();
				});
			});

			describe("Else:", function(){
				it("Call .disable()", function(){
					spyOn(baseWidget, "disable");
					baseWidget.updateState();
					expect(baseWidget.disable).toHaveBeenCalled();
				});
			});

		});

		describe(".onStateChangedHandler()", function(){
			it("Listen to the dataSet notification", function(){
				spyOn(baseWidget, "onStateChangedHandler");
				mockDs.setState(luga.data.STATE.READY);
				expect(baseWidget.onStateChangedHandler).toHaveBeenCalled();
			});
			it("Call .updateState()", function(){
				spyOn(baseWidget, "updateState");
				mockDs.setState(luga.data.STATE.READY);
				expect(baseWidget.updateState).toHaveBeenCalled();
			});
		});

	});

	describe(".ShowMoreButton", function(){

		it("Implements the luga.data.widgets.ShowMore abstract class", function(){
			expect(showMoreWidget).toMatchDuckType(baseWidget);
		});

		describe("Accepts an Options object as single argument", function(){

			describe("options.button", function(){
				it("Is mandatory", function(){
					expect(function(){
						new luga.data.widgets.ShowMoreButton({
							dataSet: mockDs
						});
					}).toThrow();
				});
				it("Throws an exception if the associated node does not exists", function(){
					expect(function(){
						new luga.data.widgets.ShowMoreButton({
							dataSet: mockDs,
							url: "",
							button: document.getElementById("missing")
						});
					}).toThrow();
				});
			});

			describe("options.disabledClass", function(){
				it("Is a CSS class that will be associated to the button while it's disabled", function(){
					var widget = new luga.data.widgets.ShowMore({
						dataSet: mockDs,
						url: "/test/{placeHolder}",
						disabledClass: "myCss"
					});
					expect(widget.config.disabledClass).toEqual("myCss");
				});
				it("Default to 'disabled'", function(){
					expect(showMoreWidget.config.disabledClass).toEqual("disabled");
				});
			});

		});

		describe(".attachEvents()", function(){

			describe("Attach a click event on the button", function(){

				it("If the widget is enabled. It call .fetch()", function(){
					spyOn(showMoreWidget, "fetch");
					mockDs.setState(luga.data.STATE.READY);
					mockButton.dispatchEvent(new Event("click"));
					expect(showMoreWidget.fetch).toHaveBeenCalled();
				});
				it("If the widget is disabled. Nothing happens", function(){
					spyOn(showMoreWidget, "fetch");
					mockButton.dispatchEvent(new Event("click"));
					expect(showMoreWidget.fetch).not.toHaveBeenCalled();
				});

			});

		});

		describe(".disable()", function(){

			it("Attach options.disabledClass to the button", function(){
				expect(mockButton).not.toHaveClass("disabled");
				showMoreWidget.disable();
				expect(mockButton).toHaveClass("disabled");
			});

		});

		describe(".enable()", function(){

			it("Remove options.disabledClass from the button", function(){
				showMoreWidget.disable();
				expect(mockButton).toHaveClass("disabled");
				showMoreWidget.enable();
				expect(mockButton).not.toHaveClass("disabled");
			});

		});

	});

});