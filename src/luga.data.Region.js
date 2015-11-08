if(typeof(Handlebars) === "undefined"){
	throw("Unable to find Handlebars");
}

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
	 */
	luga.data.Region = function(options){
		var self = this;

		this.node = jQuery(options.node);
		this.dsId = this.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SET);
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

		this.onDataChangedHandler = function(data){
			self.render();
		};
	};

	jQuery(document).ready(function(){
		jQuery(luga.data.CONST.REGION_SELECTOR).each(function(index, item){
			new luga.data.Region({
				node: jQuery(item)
			});
		});
	});

}());