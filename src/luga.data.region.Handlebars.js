(function(){
	"use strict";

	/**
	 * Handlebars Region class
	 * @param {luga.data.Region.options} options
	 * @constructor
	 * @extend luga.data.region.Base
	 * @fire regionRendered
	 * @throw {Exception}
	 */
	luga.data.region.Handlebars = function(options){

		luga.extend(luga.data.region.Base, this, [options]);
		var self = this;

		// The messages below are specific to this implementation
		self.CONST.HANDLEBARS_ERROR_MESSAGES = {
			MISSING_HANDLEBARS: "Unable to find Handlebars",
			MISSING_TEMPLATE_FILE: "luga.data.region.Handlebars was unable to retrieve file: {0} containing an Handlebars template",
			MISSING_TEMPLATE_NODE: "luga.data.region.Handlebars was unable find an HTML element with id: {0} containing an Handlebars template"
		};

		this.template = "";

		/**
		 * @param {HTMLElement} node
		 */
		var fetchTemplate = function(node){
			// Inline template
			if(self.config.templateId === null){
				self.template = Handlebars.compile(node.innerHTML);
			}
			else{
				var templateNode = document.getElementById(self.config.templateId);
				if(templateNode === null){
					throw(luga.string.format(self.CONST.HANDLEBARS_ERROR_MESSAGES.MISSING_TEMPLATE_NODE, [self.config.templateId]));
				}
				var templateSrc = templateNode.getAttribute("src");
				if(templateSrc === null){
					// Embed template
					self.template = Handlebars.compile(templateNode.innerHTML);
				}
				else{
					// External template
					var xhrOptions = {
						success: function(response){
							self.template = Handlebars.compile(response.responseText);
							self.render();
						},
						error: function(response){
							throw(luga.string.format(self.CONST.HANDLEBARS_ERROR_MESSAGES.MISSING_TEMPLATE_FILE, [templateSrc]));
						}
					};
					var xhr = new luga.xhr.Request(xhrOptions);
					xhr.send(templateSrc);
				}
			}
		};

		/**
		 * @return {String}
		 */
		this.generateHtml = function(){
			return this.template(this.dataSource.getContext());
		};

		/*
		 @override
		 @fire regionRendered
		 */
		this.render = function(){
			/* istanbul ignore else */
			if(this.template !== ""){
				this.config.node.innerHTML = this.generateHtml();
				this.applyTraits();
				var desc = luga.data.region.utils.assembleRegionDescription(this);
				this.notifyObservers(luga.data.region.CONST.EVENTS.REGION_RENDERED, desc);
			}
		};

		/* Constructor */
		fetchTemplate(this.config.node);

	};

}());