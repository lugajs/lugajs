(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.Region.options
	 *
	 * @property {jquery} node  Either a jQuery object wrapping the node or the naked DOM object that will contain the region. Required
	 *
	 */

	/**
	 * Data Region class
	 * @param {luga.data.Region.options} options
	 * @listens dataChanged
	 * @throws
	 */
	luga.data.Region = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				MISSING_HANDLEBARS: "Unable to find Handlebars",
				MISSING_NODE: "luga.data.Region was unable find the region node"
			}
		}

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
			// Either: custom attribute or incoming option or default
			dsId: options.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE)
		}
		luga.merge(this.config, options);
		var self = this;

		/** @type {luga.data.DataSet|luga.data.DetailSet} */
		this.dataSource = luga.data.getDataSource(this.config.dsId);
		this.dataSource.addObserver(this);

		/**
		 * @param {jquery} node
		 * @returns {string}
		 */
		var fetchTemplate = function(node){
			var templateId = node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.TEMPLATE);
			if(templateId !== undefined){
				return Handlebars.compile(jQuery("#" + templateId).html());
			}
			else{
				return Handlebars.compile(node.html());
			}
		};

		this.template = fetchTemplate(this.config.node);

		/**
		 * @returns {string}
		 */
		this.generateHtml = function(){
			return this.template(this.dataSource.getContext());
		};

		this.render = function(){
			this.config.node.html(this.generateHtml());
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