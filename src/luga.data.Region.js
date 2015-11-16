(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.Region.options
	 *
	 * @property {jquery} node     Either a jQuery object wrapping the node or the naked DOM object that will contain the region. Required
	 *
	 */

	/**
	 * Data Region class
	 * @param {luga.data.Region.options} options
	 * @throws
	 */
	luga.data.Region = function(options){
		if(typeof(Handlebars) === "undefined"){
			throw("Unable to find Handlebars");
		}

		var self = this;

		this.node = jQuery(options.node);
		this.dsId = this.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE);
		/** @type {luga.data.DataSet} */
		this.dataSet = luga.data.getDataSet(this.dsId);
		this.dataSet.addObserver(this);

		this.templateId = this.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.TEMPLATE);
		if(this.templateId !== undefined){
			this.template = Handlebars.compile(jQuery("#" + this.templateId).html());
		}
		else{
			this.template = Handlebars.compile(this.node.html());
		}

		this.generateHtml = function(){
			return this.template(this.dataSet);
		};

		this.render = function(){
			this.node.html(this.generateHtml());
		};

		/* Events Handlers */

		this.onDataChangedHandler = function(data){
			self.render();
		};
	};

	jQuery(document).ready(function(){
		jQuery(luga.data.CONST.SELECTORS.REGION).each(function(index, item){
			new luga.data.Region({
				node: jQuery(item)
			});
		});
	});

}());