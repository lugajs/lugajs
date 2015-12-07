(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.region.options
	 *
	 * @property {jquery} node             Either a jQuery object wrapping the node or the naked DOM object that will contain the region. Required
	 * @property {string} dsId             DataSource's id. Can be specified inside the data-lugads-datasource too. Required
	 * @property {{array.<string>} traits  An array of function names that will be called every time the Region is rendered. Optional
	 * @property {string} templateId       Id of HTML element containing the template. Can be specified inside the data-lugads-template too.
	 *                                     If not available it assumes the node contains the template
	 */

	/**
	 * Data Region class
	 * @param {luga.data.Region.options} options
	 * @constructor
	 * @listens dataChanged
	 * @throws
	 */
	luga.data.region.Handlebars = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				INVALID_TRAIT: "luga.data.region.Handlebars invalid trait: {0} is not a function",
				MISSING_HANDLEBARS: "Unable to find Handlebars",
				MISSING_NODE: "luga.data.region.Handlebars was unable find the region node",
				MISSING_TEMPLATE_FILE: "luga.data.region.Handlebars was unable to retrieve file: {0} containing an Handlebars template",
				MISSING_TEMPLATE_NODE: "luga.data.region.Handlebars was unable find an HTML element with id: {0} containing an Handlebars template"
			}
		};

		if(typeof(Handlebars) === "undefined"){
			throw(CONST.ERROR_MESSAGES.MISSING_HANDLEBARS);
		}

		// Ensure it's a jQuery object
		options.node = jQuery(options.node);
		if(options.node.length === 0){
			throw(CONST.MESSAGES.MISSING_NODE);
		}

		this.config = {
			node: null, // Required
			// Either: custom attribute or incoming option
			dsId: options.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE) || null,
			templateId: options.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.TEMPLATE) || null,
			traits: options.traits || []
		};
		luga.merge(this.config, options);
		var self = this;

		/** @type {luga.data.DataSet|luga.data.DetailSet} */
		this.dataSource = luga.data.getDataSource(this.config.dsId);
		if(this.dataSource === null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [this.config.dsId]));
		}
		this.dataSource.addObserver(this);

		this.template = "";

		/** @type {array.<string>} */
		this.traits = [
			"luga.data.region.traits.setRowId",
			"luga.data.region.traits.setRowIndex",
			"luga.data.region.traits.sort"
		];
		if(self.config.traits.length > 0){
			this.traits = this.traits.concat(options.traits);
		}

		/**
		 * @param {jquery} node
		 * @returns {string}
		 */
		var fetchTemplate = function(node){
			// Inline template
			if(self.config.templateId === null){
				self.template = Handlebars.compile(node.html());
			}
			else{
				var templateNode = jQuery("#" + self.config.templateId);
				if(templateNode.length !== 1){
					throw(luga.string.format(CONST.ERROR_MESSAGES.MISSING_TEMPLATE_NODE, [self.config.templateId]));
				}
				var templateSrc = templateNode.attr("src");
				if(templateSrc === undefined){
					// Embed template
					self.template = Handlebars.compile(templateNode.html());
				}
				else{
					// External template
					var xhrOptions = {
						url: templateSrc,
						dataType: "text",
						success: function(response, textStatus, jqXHR){
							self.template = Handlebars.compile(response);
							self.render();
						},
						error: function(jqXHR, textStatus, errorThrown){
							throw(luga.string.format(CONST.ERROR_MESSAGES.MISSING_TEMPLATE_FILE, [templateSrc]));
						}
					};
					jQuery.ajax(xhrOptions);
				}
			}
		};

		this.applyTraits = function(){
			var traitData = {
				node: this.config.node,
				dataSource: this.dataSource
			};
			for(var i = 0; i < this.traits.length; i++){
				var func = luga.lookup(this.traits[i]);
				if(jQuery.isFunction(func) === true){
					func(traitData);
				}
				else{
					throw(luga.string.format(CONST.ERROR_MESSAGES.INVALID_TRAIT, [func]));
				}
			}
		};

		/**
		 * @returns {string}
		 */
		this.generateHtml = function(){
			return this.template(this.dataSource.getContext());
		};

		this.render = function(){
			if(this.template !== ""){
				this.config.node.html(this.generateHtml());
				this.applyTraits();
			}
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.render();
		};

		/* Constructor */
		fetchTemplate(this.config.node);

	};

}());