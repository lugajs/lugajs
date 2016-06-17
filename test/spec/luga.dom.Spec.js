describe("luga.dom", function(){

	"use strict";

	var plainDiv, basicTree, filterDivOnly;
	beforeEach(function(){
		plainDiv = jQuery("<div>");
		basicTree = jQuery("<div id='root'><span id='spanChild'></span><div id='divChild'></div></div>>");
		filterDivOnly = function(node){
			return node.prop("tagName") === "DIV";
		};
	});

	it("Contains DOM-related API", function(){
		expect(luga.dom).toBeDefined();
	});

	describe(".treeWalker.getInstance()", function(){

		describe("Is a static, factory method", function(){

			it("Return a TreeWalker object", function(){
				var awWalker = luga.dom.treeWalker.getInstance(plainDiv);
				var filter = {
					acceptNode: function(){
						return NodeFilter.FILTER_ACCEPT;
					}
				};
				var plainWalker = document.createTreeWalker(document.createElement("div"), NodeFilter.SHOW_ELEMENT, filter, false);
				expect(awWalker.constructor).toEqual(plainWalker.constructor);
			});

			describe("Accept a jQuery object as first argument", function(){

				it("Used as root by the TreeWalker", function(){
					var divNode = document.createElement("div");
					var walker = luga.dom.treeWalker.getInstance(jQuery(divNode));
					expect(walker.root).toEqual(divNode);
				});

				it("If not provided, default to jQuery('body')", function(){
					var walker = luga.dom.treeWalker.getInstance();
					expect(walker.root).toEqual(document.body);
				});

			});

			describe("Accept a filter function as second argument", function(){

				it("Only nodes matching the filter will be accepted", function(){
					var walker = luga.dom.treeWalker.getInstance(basicTree, filterDivOnly);
					expect(jQuery(walker.nextNode())).toEqual(basicTree.find("#divChild"));
				});

			});

		});

	});

});