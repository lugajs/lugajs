(function(){
	"use strict";

	luga.namespace("luga.data.widgets");

	luga.data.widgets.PagingBar = function(options){

		this.config = {
			/** @type {luga.data.PagedView} */
			pagedView: undefined,
			/** @type {Element} */
			node: undefined
		};
		luga.merge(this.config, options);

		/**
		 * @type {luga.data.widgets.PagingBar}
		 */
		var self = this;


	};

}());