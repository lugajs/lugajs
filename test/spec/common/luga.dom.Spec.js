describe("luga.dom", function(){

	"use strict";

	let divNode, filterDivOnly, basicTree, spanChild, divChild;
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

	describe(".delegateEvent()", function(){

		let mockCallback, container, nestedButton, neutralButton;
		beforeEach(function(){
			jasmineFixtures.loadHTML("dom/generic.htm");

			mockCallback = jasmine.createSpy("mockCallback");

			container = document.getElementById("container");
			nestedButton = document.getElementById("nestedButton");
			neutralButton = document.getElementById("neutralButton");
		});

		describe("Attach a single event listener, to a parent element", function(){

			it("The event will fire only for descendants matching a given selector", function(){
				luga.dom.delegateEvent(container, "click", "button.clickable", mockCallback);

				neutralButton.click();
				expect(mockCallback).not.toHaveBeenCalled();
				nestedButton.click();
				expect(mockCallback).toHaveBeenCalled();
			});

			it("Works even if the descendants are added after .delegateEvent() is invoked", function(){
				luga.dom.delegateEvent(container, "click", "button.clickable", mockCallback);
				const newButton = document.createElement("button");
				newButton.classList.add("clickable");
				document.getElementById("nestedContainer").appendChild(newButton);

				newButton.click();
				expect(mockCallback).toHaveBeenCalled();
			});

			it("The callback is invoked passing two arguments: event and node", function(){
				luga.dom.delegateEvent(container, "click", "button.clickable", mockCallback);

				nestedButton.click();
				expect(mockCallback).toHaveBeenCalledWith(jasmine.any(Event), nestedButton);
			});

		});

	});

	describe(".nodeMatches()", function(){

		let container, nestedButton;
		beforeEach(function(){
			jasmineFixtures.loadHTML("dom/generic.htm");

			container = document.getElementById("container");
			nestedButton = document.getElementById("nestedButton");
		});

		it("Return true if the given node matches the given selector", function(){
			expect(luga.dom.nodeMatches(container, "div")).toBeTrue();
			expect(luga.dom.nodeMatches(container, "#container")).toBeTrue();
			expect(luga.dom.nodeMatches(nestedButton, "button")).toBeTrue();
			expect(luga.dom.nodeMatches(nestedButton, ".clickable")).toBeTrue();
		});

		it("False otherwise", function(){
			expect(luga.dom.nodeMatches(container, "span")).toBeFalse();
			expect(luga.dom.nodeMatches(container, "#missing")).toBeFalse();
			expect(luga.dom.nodeMatches(nestedButton, "input")).toBeFalse();
			expect(luga.dom.nodeMatches(nestedButton, ".whatever")).toBeFalse();
		});

	});

	describe(".ready()", function(){

		it("Invoke the given function as soon as the DOM is loaded", function(){
			const mock = {
				callBack: function(){
				}
			};
			spyOn(mock, "callBack");
			luga.dom.ready(mock.callBack);

			// Use old syntax for IE11: https://stackoverflow.com/questions/27176983/dispatchevent-not-working-in-ie11
			const eventToTrigger = document.createEvent("Event");
			eventToTrigger.initEvent("DOMContentLoaded", false, true);
			document.dispatchEvent(eventToTrigger);

			expect(mock.callBack).toHaveBeenCalled();
		});

	});

	describe(".nodeIterator.getInstance()", function(){

		describe("Is a static, factory method", function(){

			it("Return a NodeIterator object", function(){
				const lugaIterator = luga.dom.nodeIterator.getInstance(divNode);
				const filter = {
					acceptNode: function(){
						return NodeFilter.FILTER_ACCEPT;
					}
				};
				const plainIterator = document.createNodeIterator(document.createElement("div"), NodeFilter.SHOW_ELEMENT, filter, false);
				expect(lugaIterator.constructor).toEqual(plainIterator.constructor);
			});

			describe("Accept a mandatory DOM Node as first argument", function(){

				it("Used as root by the NodeIterator", function(){
					const iterator = luga.dom.nodeIterator.getInstance(divNode);
					expect(iterator.root).toEqual(divNode);
				});

			});

			describe("Accept an optional filter function as second argument", function(){

				it("Only nodes matching the filter will be accepted", function(){
					const iterator = luga.dom.nodeIterator.getInstance(basicTree, filterDivOnly);
					iterator.nextNode();
					expect(iterator.nextNode()).toEqual(divChild);
				});

			});

		});

	});

	describe(".treeWalker.getInstance()", function(){

		describe("Is a static, factory method", function(){

			it("Return a TreeWalker object", function(){
				const lugaWalker = luga.dom.treeWalker.getInstance(divNode);
				const filter = {
					acceptNode: function(){
						return NodeFilter.FILTER_ACCEPT;
					}
				};
				const plainWalker = document.createTreeWalker(document.createElement("div"), NodeFilter.SHOW_ELEMENT, filter, false);
				expect(lugaWalker.constructor).toEqual(plainWalker.constructor);
			});

			describe("Accept a mandatory DOM Node as first argument", function(){

				it("Used as root by the TreeWalker", function(){
					const walker = luga.dom.treeWalker.getInstance(divNode);
					expect(walker.root).toEqual(divNode);
				});

			});

			describe("Accept an optional filter function as second argument", function(){

				it("Only nodes matching the filter will be accepted", function(){
					const walker = luga.dom.treeWalker.getInstance(basicTree, filterDivOnly);
					expect(walker.nextNode()).toEqual(divChild);
				});

			});

		});

	});

});