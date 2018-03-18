describe("luga.data.widgets.PagingBar", function(){

	"use strict";

	var pagedView, pagingBarNode;
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

		pagingBarNode = document.createElement("nav");
		new luga.data.widgets.PagingBar({
			pagedView: pagedView,
			node: pagingBarNode
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
		expect(pagingBarNode.innerHTML).toEqual("");
	});

	it("Render something only as soon as the pagedView loads data", function(){
		expect(pagingBarNode.innerHTML).toEqual("");
		pagedView.loadData();
		expect(pagingBarNode.innerHTML).not.toEqual("");
	});

});