describe("luga.data.widgets.PagingBar", function(){

	"use strict";

	var pagedView, linksBarNode, linksBarWidget, pagesBarNode;
	beforeEach(function(){

		var testRecords = jasmineFixtures.read("data/usa-states.json");
		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest("data/usa-states.json").andReturn({
			contentType: "application/json",
			responseText: JSON.stringify(testRecords),
			status: 200
		});
		var jsonDs = new luga.data.JsonDataSet({uuid: "myDs", url: "data/usa-states.json"});
		pagedView = new luga.data.PagedView({uuid: "pagedViewTest", parentDataSet: jsonDs});

		linksBarNode = document.createElement("nav");
		linksBarWidget = new luga.data.widgets.PagingBar({
			pagedView: pagedView,
			node: linksBarNode
		});

		pagesBarNode = document.createElement("nav");
		new luga.data.widgets.PagingBar({
			pagedView: pagedView,
			node: pagesBarNode,
			style: luga.data.PAGING_STYLE.PAGES
		});

	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
		jasmine.Ajax.uninstall();
	});

	it("Is the pagingBar constructor", function(){
		expect(luga.type(luga.data.widgets.PagingBar)).toEqual("function");
	});

	it("If the passed pagedView is empty, does not render anything", function(){
		expect(linksBarNode.innerHTML).toEqual("");
	});

	it("Generate HTML only as soon as the pagedView loads data", function(){
		expect(linksBarNode.innerHTML).toEqual("");
		pagedView.loadData();
		expect(linksBarNode.innerHTML).not.toEqual("");
	});

	describe("Accepts an Options object as single argument", function(){

		describe("options.pagedView", function(){

			it("Instance of a pagedView that will be controlled by the widget", function(){
				expect(linksBarWidget.config.node).toEqual(linksBarNode);
			});

			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.widgets.PagingBar({
						node: pagesBarNode
					});
				}).toThrow();
			});

			it("Throws an exception if it is not of type luga.data.PagedView", function(){
				expect(function(){
					new luga.data.widgets.PagingBar({
						pagedView: "invalid",
						node: pagesBarNode
					});
				}).toThrow();
			});

		});

		describe("options.node", function(){

			it("DOM element that will contain the widget", function(){
				expect(linksBarWidget.config.pagedView).toEqual(pagedView);
			});

			it("Throws an exception if not specified", function(){
				expect(function(){
					new luga.data.widgets.PagingBar({
						pagedView: pagedView
					});
				}).toThrow();
			});

			it("Throws an exception if not of type Element", function(){
				expect(function(){
					new luga.data.widgets.PagingBar({
						pagedView: pagedView,
						node: "invalid"
					});
				}).toThrow();
			});

			it("Throws an exception if it is a jQuery object", function(){
				expect(function(){
					new luga.data.widgets.PagingBar({
						pagedView: pagedView,
						node: jQuery("nav")
					});
				}).toThrow();
			});

		});

		describe("options.style", function(){

			it("Default to luga.data.PAGING_STYLE.LINKS", function(){
				expect(linksBarWidget.config.style).toEqual(luga.data.PAGING_STYLE.LINKS);
			});

			it("Throws an exception if it is not of type luga.data.PAGING_STYLE", function(){
				expect(function(){
					new luga.data.widgets.PagingBar({
						pagedView: pagedView,
						node: pagesBarNode,
						style: "invalid"
					});
				}).toThrow();
			});

			it("It is reflected in the CSS class attached to the node", function(){
				expect(linksBarNode.classList.contains("luga-pagingBarLinks")).toEqual(true);
				expect(pagesBarNode.classList.contains("luga-pagingBarPages")).toEqual(true);
			});

		});

		describe("options.nextText", function(){

			var customBarNode, customWidget;
			beforeEach(function(){
				customBarNode = document.createElement("nav");
				customWidget = new luga.data.widgets.PagingBar({
					pagedView: pagedView,
					node: customBarNode,
					nextText: "custom"
				});
				pagedView.loadData();
			});

			it("Default to \">\"", function(){
				expect(linksBarWidget.config.nextText).toEqual(">");
				expect(customWidget.config.nextText).toEqual("custom");
			});

			it("It is used as text for the last element in the widget", function(){
				expect(linksBarNode.lastChild.textContent).toEqual(">");
				expect(customBarNode.lastChild.textContent).toEqual("custom");
			});

		});

		describe("options.prevText", function(){

			var customBarNode, customWidget;
			beforeEach(function(){
				customBarNode = document.createElement("nav");
				customWidget = new luga.data.widgets.PagingBar({
					pagedView: pagedView,
					node: customBarNode,
					prevText: "custom"
				});
				pagedView.loadData();
				pagedView.goToNextPage();
			});

			it("Default to \"<\"", function(){
				expect(linksBarWidget.config.prevText).toEqual("<");
				expect(customWidget.config.prevText).toEqual("custom");
			});

			it("It is used as text for the first element in the widget", function(){
				expect(linksBarNode.firstChild.textContent).toEqual("<");
				expect(customBarNode.firstChild.textContent).toEqual("custom");
			});

		});

		describe("options.separator", function(){

			var customBarNode, customWidget;
			beforeEach(function(){
				customBarNode = document.createElement("nav");
				customWidget = new luga.data.widgets.PagingBar({
					pagedView: pagedView,
					node: customBarNode,
					separator: "custom"
				});
				pagedView.loadData();
			});

			it("Default to \" | \"", function(){
				expect(linksBarWidget.config.separator).toEqual(" | ");
				expect(customWidget.config.separator).toEqual("custom");
			});

			it("It is used to separate the links", function(){
				expect(linksBarNode.innerHTML).toContain(" | ");
				expect(customBarNode.innerHTML).not.toContain(" | ");
				expect(customBarNode.innerHTML).toContain("custom");
			});

		});

		describe("options.maxLinks", function(){

			var customBarNode, customWidget;
			beforeEach(function(){
				customBarNode = document.createElement("nav");
				customWidget = new luga.data.widgets.PagingBar({
					pagedView: pagedView,
					node: customBarNode,
					maxLinks: 3
				});
				pagedView.loadData();
			});

			it("Default to 10", function(){
				expect(linksBarWidget.config.maxLinks).toEqual(10);
				expect(customWidget.config.maxLinks).toEqual(3);
			});

			it("Control the total amount of links inside the widget", function(){
				// We have 6 pages
				expect(linksBarNode.querySelectorAll("a").length).toEqual(6);
				// We reduced the amount of links to 3
				expect(customBarNode.querySelectorAll("a").length).toEqual(3);
			});

		});

	});

	describe("Render a paging UI", function(){

		beforeEach(function(){
			pagedView.loadData();
		});

		describe("If the current page is the first", function(){

			it("The first element is a text node", function(){
				expect(linksBarNode.firstChild.tagName).toBeUndefined();
			});

		});

		describe("Else:", function(){

			beforeEach(function(){
				pagedView.goToPage(3);
			});

			it("The first element is an <a> node", function(){
				expect(linksBarNode.firstChild.tagName).toEqual("A");
			});

			it("A click on it invokes pagedView.goToPage() to navigate to the previous page", function(){
				spyOn(pagedView, "goToPage");
				var eventToTrigger = new Event("click");
				linksBarNode.firstChild.dispatchEvent(eventToTrigger);
				expect(pagedView.goToPage).toHaveBeenCalledWith(2);
			});

		});

		describe("If the current page is the last", function(){

			it("The last element is a text node", function(){
				pagedView.goToPage(6);
				expect(linksBarNode.lastChild.tagName).toBeUndefined();
			});

		});

		describe("Else:", function(){

			it("The last element is an <a> node", function(){
				expect(linksBarNode.lastChild.tagName).toEqual("A");
			});

			it("A click on it invokes pagedView.goToPage() to navigate to the next page", function(){
				spyOn(pagedView, "goToPage");
				var eventToTrigger = new Event("click");
				linksBarNode.lastChild.dispatchEvent(eventToTrigger);
				expect(pagedView.goToPage).toHaveBeenCalledWith(2);
			});

		});

		describe("Depending on options.style", function(){

			describe("The links can be either in:", function(){

				it("1-10 format", function(){
					expect(linksBarNode.childNodes[4].textContent).toEqual("11 - 20");
				});

				it("1 format", function(){
					expect(pagesBarNode.childNodes[2].textContent).toEqual("1");
				});

			});

		});

	});

	describe(".onDataChangedHandler()", function(){

		it("It is invoked every time the pagedView loads data", function(){
			spyOn(linksBarWidget, "onDataChangedHandler");
			pagedView.loadData();
			expect(linksBarWidget.onDataChangedHandler).toHaveBeenCalled();
		});

	});

});