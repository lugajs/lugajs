describe("luga.dom", function(){

	"use strict";

	var divNode, filterDivOnly, basicTree, spanChild, divChild;
	beforeEach(function(){
		divNode = document.createElement("div");

		filterDivOnly = function(node){
			return node.tagName === "DIV";
		};

		basicTree = document.createElement("div");
		basicTree.setAttribute("id", "root");
		spanChild = document.createElement("span");
		spanChild.setAttribute("id", "spanChild");
		basicTree.appendChild(spanChild);
		divChild = document.createElement("div");
		divChild.setAttribute("id", "divChild");
		basicTree.appendChild(divChild);

	});

	it("Contains DOM-related API", function(){
		expect(luga.dom).toBeDefined();
	});

	describe(".treeWalker.getInstance()", function(){

		describe("Is a static, factory method", function(){

			it("Return a TreeWalker object", function(){
				var awWalker = luga.dom.treeWalker.getInstance(divNode);
				var filter = {
					acceptNode: function(){
						return NodeFilter.FILTER_ACCEPT;
					}
				};
				var plainWalker = document.createTreeWalker(document.createElement("div"), NodeFilter.SHOW_ELEMENT, filter, false);
				expect(awWalker.constructor).toEqual(plainWalker.constructor);
			});

			describe("Accept a mandatory DOM Node as first argument", function(){

				it("Used as root by the TreeWalker", function(){
					var walker = luga.dom.treeWalker.getInstance(divNode);
					expect(walker.root).toEqual(divNode);
				});

			});

			describe("Accept an optional filter function as second argument", function(){

				it("Only nodes matching the filter will be accepted", function(){
					var walker = luga.dom.treeWalker.getInstance(basicTree, filterDivOnly);
					expect(walker.nextNode()).toEqual(divChild);
				});

			});

		});

	});

});