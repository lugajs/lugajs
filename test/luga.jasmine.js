if(typeof(jQuery) === "undefined"){
	throw("Unable to find jQuery");
}

if(typeof(luga) === "undefined"){
	luga = {};
}

(function(){
	"use strict";

	luga.jasmine = {};

	luga.jasmine.version = "0.1";

	var CONST = {
		CSS_CLASSES: {
			TRIGGER: "luga-jasmine-trigger"
		},
		SELECTORS: {
			FIRST_CHILD: ":first-child",
			ROOT_SUITE: ".summary > .suite",
			NODE_TITLE: "> li.suite-detail",
			NODE_SPECS: "> ul.specs",
			NODE_SUITES: "> ul.suite"
		},
		TEXT: {
			PLUS: "+",
			MINUS: "-"
		}
	};

	luga.jasmine.Suite = function(root){
		var rootNode = null;
		var titleNode = null;

		var self = this;

		var specs = [];
		var suites = [];
		var expanded = true;
		var triggerNode = jQuery("<a></a>").text(CONST.TEXT.MINUS).addClass(CONST.CSS_CLASSES.TRIGGER);

		var init = function(){
			rootNode = root;
			titleNode = rootNode.find(CONST.SELECTORS.NODE_TITLE);
			triggerNode.insertBefore(titleNode.find(CONST.SELECTORS.FIRST_CHILD));

			rootNode.find(CONST.SELECTORS.NODE_SPECS).each(function(index, item){
				specs.push(jQuery(item));
			});
			rootNode.find(CONST.SELECTORS.NODE_SUITES).each(function(index, item){
				var childSuite = new luga.jasmine.Suite(jQuery(item));
				suites.push(childSuite);
			});

			attachEvents();
		};

		var attachEvents = function(){
			triggerNode.click(function(event){
				event.preventDefault();
				if(expanded === true){
					self.collapse();
				}
				else{
					self.expand();
				}
			});
		};

		this.show = function(){
			rootNode.show();
		};

		this.hide = function(){
			rootNode.hide();
		};

		this.collapse = function(){
			triggerNode.text(CONST.TEXT.PLUS);
			for(var i = 0; i < suites.length; i++){
				suites[i].collapse();
				suites[i].hide();
			}
			for(var j = 0; j < specs.length; j++){
				specs[j].hide();
			}
			expanded = false;
		};

		this.expand = function(){
			triggerNode.text(CONST.TEXT.MINUS);
			for(var i = 0; i < suites.length; i++){
				suites[i].expand();
				suites[i].show();
			}
			for(var j = 0; j < specs.length; j++){
				specs[j].show();
			}
			expanded = true;
		};

		init();
	};

	luga.jasmine.init = function(){
		var rootNodes = jQuery(CONST.SELECTORS.ROOT_SUITE);
		for(var i = 0; i < rootNodes.length; i++){
			new luga.jasmine.Suite(jQuery(rootNodes[i]));
		}
	};

}());