(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.region.options
	 *
	 * @property {jquery} node        Either a jQuery object wrapping the node or the naked DOM object that will contain the region. Required
	 * @property {string} dsId        DataSource's id. Can be specified inside the data-lugads-datasource too. Required
	 * @property {string} templateId  Id of HTML element containing the template. Can be specified inside the data-lugads-template too.
	 *                                If not available it assumes the node contains the template
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
				MISSING_HANDLEBARS: "Unable to find Handlebars",
				MISSING_NODE: "luga.data.region.Handlebars was unable find the region node",
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
			templateId: options.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.TEMPLATE) || null
		};
		luga.merge(this.config, options);
		var self = this;

		/** @type {luga.data.DataSet|luga.data.DetailSet} */
		this.dataSource = luga.data.getDataSource(this.config.dsId);
		if(this.dataSource === null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [this.config.dsId]));
		}
		this.dataSource.addObserver(this);

		/**
		 * @param {jquery} node
		 * @returns {string}
		 */
		var fetchTemplate = function(node){
			if(self.config.templateId !== null){
				var templateNode = jQuery("#" + self.config.templateId);
				if(templateNode.length !== 1){
					throw(luga.string.format(CONST.ERROR_MESSAGES.MISSING_TEMPLATE_NODE, [self.config.templateId]));
				}
				return Handlebars.compile(templateNode.html());
			}
			else{
				return Handlebars.compile(node.html());
			}
		};

		this.template = fetchTemplate(this.config.node);

		this.applyTraits = function(){
			var traitData = {
				node: this.config.node,
				dataSource: this.dataSource
			};
			luga.data.region.traits.setRowId(traitData);
			luga.data.region.traits.setRowIndex(traitData);
			luga.data.region.traits.sort(traitData);
		};

		/**
		 * @returns {string}
		 */
		this.generateHtml = function(){
			return this.template(this.dataSource.getContext());
		};

		this.render = function(){
			this.config.node.html(this.generateHtml());
			this.applyTraits();
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.render();
		};
	};

}());