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
			TRIGGER: "luga-jasmine-trigger",
			TOOLBAR: "luga-jasmine-toolbar",
			BUTTON: "luga-jasmine-button"
		},
		SELECTORS: {
			FIRST_CHILD: ":first-child",
			SUMMARY: ".summary",
			ROOT_SUITE: ".summary > .suite",
			NODE_TITLE: "> li.suite-detail",
			NODE_SPECS: "> ul.specs",
			NODE_SUITES: "> ul.suite"
		},
		TEXT: {
			COLLAPSE: "Collapse All",
			EXPAND: "Expand All",
			SEPARATOR: " | ",
			PLUS: "+",
			MINUS: "-"
		}
	};

	/**
	 * Insert toolbar with expand/collapse all buttons
	 * @param {array.<luga.jasmine.Suite>} rootSuites
	 */
	luga.jasmine.addToolbar = function(rootSuites){

		var toolbar = jQuery("<div></div>").addClass(CONST.CSS_CLASSES.TOOLBAR);
		var collapse = jQuery("<span></span>").addClass(CONST.CSS_CLASSES.BUTTON).text(CONST.TEXT.COLLAPSE);
		toolbar.append(collapse);
		var separator = jQuery("<span></span>").text(CONST.TEXT.SEPARATOR);
		toolbar.append(separator);
		var expand = jQuery("<span></span>").addClass(CONST.CSS_CLASSES.BUTTON).text(CONST.TEXT.EXPAND);
		toolbar.append(expand);

		collapse.click(function(event){
			event.preventDefault();
			for(var i = 0; i < rootSuites.length; i++){
				rootSuites[i].collapse();
			}
		});

		expand.click(function(event){
			event.preventDefault();
			for(var i = 0; i < rootSuites.length; i++){
				rootSuites[i].expand();
			}
		});

		toolbar.insertBefore(jQuery(CONST.SELECTORS.SUMMARY));
	};

	/**
	 * Wrapper around a suite's HTML node. Adds expand/collapse capabilities
	 * @param {jquery} options.rootNode
	 * @constructor
	 */
	luga.jasmine.Suite = function(options){
		var config = {
			rootNode: null
		};
		jQuery.extend(config, options);

		/** @type  {luga.jasmine.Suite} */
		var self = this;

		/** @type {array.<luga.jasmine.Suite>} */
		var suites = [];
		/** @type {array.<jQuery>} */
		var specs = [];

		var expanded = true;
		var triggerNode = jQuery("<a></a>").text(CONST.TEXT.MINUS).addClass(CONST.CSS_CLASSES.TRIGGER);

		var init = function(){
			var titleNode = config.rootNode.find(CONST.SELECTORS.NODE_TITLE);
			triggerNode.insertBefore(titleNode.find(CONST.SELECTORS.FIRST_CHILD));

			config.rootNode.find(CONST.SELECTORS.NODE_SPECS).each(function(index, item){
				specs.push(jQuery(item));
			});
			config.rootNode.find(CONST.SELECTORS.NODE_SUITES).each(function(index, item){
				var childSuite = new luga.jasmine.Suite({
					rootNode: jQuery(item)
				});
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
			config.rootNode.show();
		};

		this.hide = function(){
			config.rootNode.hide();
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

	/**
	 * This must be invoked after Jasmine finished executing
	 */
	luga.jasmine.init = function(){
		/** @type {array.<luga.jasmine.Suite>} */
		var rootSuites = [];
		jQuery(CONST.SELECTORS.ROOT_SUITE).each(function(index, item){
			var suite = new luga.jasmine.Suite({
					rootNode: jQuery(item)
				}
			);
			rootSuites.push(suite);
		});
		luga.jasmine.addToolbar(rootSuites);
	};

}());