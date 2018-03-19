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
		expect(jQuery.isFunction(luga.data.widgets.PagingBar)).toEqual(true);
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

			it("Throws an exception if it is a jQuery", function(){
				expect(function(){
					new luga.data.widgets.PagingBar({
						pagedView: pagedView,
						node: jQuery("nav")
					});
				}).toThrow();
			});

		});

		describe("options.pagedView", function(){

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

		});


	});

});