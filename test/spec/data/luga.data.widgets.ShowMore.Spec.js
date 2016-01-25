describe("luga.data.widgets", function(){

	"use strict";

	var mockButton, mockDiv, mockDs, mockJson, showMoreBase, showMoreButton, showMoreScrollBody, showMoreScrollDiv;
	beforeEach(function(){

		mockButton = jQuery("<button>");
		mockDiv = jQuery("<div style='overflow-y: auto; height: 100px'>");

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

		showMoreBase = new luga.data.widgets.ShowMore({
			dataSet: mockDs,
			url: "/fake/?key={nextKey}",
			paramPath: "params"
		});

		showMoreButton = new luga.data.widgets.ShowMoreButton({
			button: mockButton,
			dataSet: mockDs,
			url: "",
			paramPath: "params"
		});

		showMoreScrollBody = new luga.data.widgets.ShowMoreScrolling({
			dataSet: mockDs,
			url: ""
		});

		showMoreScrollDiv = new luga.data.widgets.ShowMoreScrolling({
			dataSet: mockDs,
			url: "",
			node: mockDiv
		});

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	describe(".ShowMore", function(){

		it("Is an abstract widget", function(){
			expect(luga.data.widgets.ShowMore).toBeDefined();
			expect(jQuery.isFunction(luga.data.widgets.ShowMore)).toBeTruthy();
		});

		it("Register itself as observer of the associated dataSource", function(){
			expect(mockDs.observers[0]).toEqual(showMoreBase);
		});

		describe("Accepts an Options object as single argument", function(){

			describe("options.dataSet", function(){
				it("Is the dataSet to which the widget will be associated", function(){
					expect(showMoreBase.config.dataSet).toEqual(mockDs);
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
					expect(showMoreBase.config.paramPath).toEqual("params");
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
					showMoreBase.assembleUrl();
					expect(mockDs.getRawJson).toHaveBeenCalled();
				});
			});
			describe("Then:", function(){

				describe("If paramPath is not an empty string:", function(){

					it("Call luga.lookupProperty()", function(){
						spyOn(luga, "lookupProperty").and.callFake(function(){
						});
						showMoreBase.assembleUrl();
						expect(luga.lookupProperty).toHaveBeenCalledWith(mockJson, showMoreBase.config.paramPath);
					});

				});

			});
			describe("Finally:", function(){
				it("Returns the generated URL to be used for next XHR call", function(){
					expect(showMoreBase.assembleUrl()).toEqual("/fake/?key=testId");
				});
			});

		});

		describe(".disable()", function(){
			it("Is an abstract method", function(){
				expect(jQuery.isFunction(showMoreBase.disable)).toBeTruthy();
			});
		});

		describe(".enable()", function(){
			it("Is an abstract method", function(){
				expect(jQuery.isFunction(showMoreBase.disable)).toBeTruthy();
			});
		});

		describe(".fetch()", function(){

			describe("First:", function(){

				it("Call .assembleUrl()", function(){
					spyOn(showMoreBase, "assembleUrl").and.callFake(function(){
					});
					showMoreBase.fetch();
					expect(showMoreBase.assembleUrl).toHaveBeenCalled();
				});

			});
			describe("Then:", function(){

				describe("If .assembleUrl() return something different than options.url:", function(){

					it("Call dataSet.setUrl(), then dataSet.loadData()", function(){
						spyOn(mockDs, "setUrl");
						spyOn(mockDs, "loadData");
						var newUrl = showMoreBase.assembleUrl();
						showMoreBase.fetch();
						expect(mockDs.setUrl).toHaveBeenCalledWith(newUrl);
						expect(mockDs.loadData).toHaveBeenCalled();
					});

				});

				describe("Else:", function(){

					it("Call .disable()", function(){
						spyOn(showMoreBase, "assembleUrl").and.returnValue(showMoreBase.config.url);
						spyOn(showMoreBase, "disable");
						showMoreBase.fetch();
						expect(showMoreBase.disable).toHaveBeenCalled();
					});

				});

			});

		});

		describe(".isEnabled()", function(){
			it("Return false by default", function(){
				expect(showMoreBase.isEnabled()).toBeFalsy();
			});
			it("Return true if the dataSet is ready", function(){
				mockDs.setState(luga.data.STATE.READY);
				expect(showMoreBase.isEnabled()).toBeTruthy();
			});
		});

		describe(".updateState()", function(){

			describe("If the dataSet is ready:", function(){
				it("Call .enable()", function(){
					spyOn(showMoreBase, "enable");
					mockDs.setState(luga.data.STATE.READY);
					showMoreBase.updateState();
					expect(showMoreBase.enable).toHaveBeenCalled();
				});
			});

			describe("Else:", function(){
				it("Call .disable()", function(){
					spyOn(showMoreBase, "disable");
					showMoreBase.updateState();
					expect(showMoreBase.disable).toHaveBeenCalled();
				});
			});

		});

		describe(".onStateChangedHandler()", function(){
			it("Listen to the dataSet notification", function(){
				spyOn(showMoreBase, "onStateChangedHandler");
				mockDs.setState(luga.data.STATE.READY);
				expect(showMoreBase.onStateChangedHandler).toHaveBeenCalled();
			});
			it("Call .updateState()", function(){
				spyOn(showMoreBase, "updateState");
				mockDs.setState(luga.data.STATE.READY);
				expect(showMoreBase.updateState).toHaveBeenCalled();
			});
		});

	});

	describe(".ShowMoreButton", function(){

		it("Implements the luga.data.region.Base abstract class", function(){
			expect(showMoreButton).toMatchDuckType(showMoreBase);
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
							button: jQuery("#missing")
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
					expect(showMoreButton.config.disabledClass).toEqual("disabled");
				});
			});

		});

		describe(".attachEvents()", function(){

			describe("Attach a click event on the button", function(){

				it("If the widget is enabled. It call .fetch()", function(){
					spyOn(showMoreButton, "fetch");
					mockDs.setState(luga.data.STATE.READY);
					mockButton.click();
					expect(showMoreButton.fetch).toHaveBeenCalled();
				});
				it("If the widget is disabled. Nothing happens", function(){
					spyOn(showMoreButton, "fetch");
					mockButton.click();
					expect(showMoreButton.fetch).not.toHaveBeenCalled();
				});

			});

		});

	});

	describe(".ShowMoreScrolling", function(){

		it("Implements the luga.data.region.Base abstract class", function(){
			expect(showMoreScrollBody).toMatchDuckType(showMoreBase);
		});

		describe("Accepts an Options object as single argument", function(){

			describe("options.node", function(){
				it("Is a jQuery element containing the records", function(){
					expect(showMoreScrollDiv.config.node).toEqual(mockDiv);
				});
				it("Default to the current document to handle infinite scrolling for the current window", function(){
					expect(showMoreScrollBody.config.node).toEqual(jQuery(document));
				});
			});

		});

		describe(".attachEvents()", function(){

			describe("Attach a scroll event either:", function(){

				describe("To the document:", function(){

					it("If the widget is enabled and the document scrolls. It call .fetch()", function(){
						spyOn(showMoreScrollBody, "fetch");
						mockDs.setState(luga.data.STATE.READY);
						jQuery(document).scroll();
						expect(showMoreScrollBody.fetch).toHaveBeenCalled();
					});

					it("If the widget is disabled. Nothing happens", function(){
						spyOn(showMoreScrollBody, "fetch");
						jQuery(document).scroll();
						expect(showMoreScrollBody.fetch).not.toHaveBeenCalled();
					});

				});

				describe("To the node:", function(){

					it("If the widget is enabled and the node scrolls. It call .fetch()", function(){
						spyOn(showMoreScrollDiv, "fetch");
						mockDs.setState(luga.data.STATE.READY);
						mockDiv.scroll();
						expect(showMoreScrollDiv.fetch).toHaveBeenCalled();
					});

					it("If the widget is disabled. Nothing happens", function(){
						spyOn(showMoreScrollDiv, "fetch");
						mockDiv.scroll();
						expect(showMoreScrollDiv.fetch).not.toHaveBeenCalled();
					});

				});

			});

		});

	});

});