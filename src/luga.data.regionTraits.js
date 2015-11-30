(function(){
	"use strict";

	luga.namespace("luga.data.regionTraits");

	/**
	 * @typedef {object} luga.data.regionTraits.options
	 *
	 * @property {jquery}                                 node          A jQuery object wrapping the Region's node. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet}  dataSource    DataSource. Required
	 */

	var CONST = {
		CUSTOM_ATTRIBUTES: {
			SET_ROW_ID: "data-lugads-setrowid"
		},
		SELECTORS: {
			SET_ROW_ID: "*[data-lugads-setrowid]"
		}
	};

	/**
	 * Handles data-lugads-setrowid
	 * @param {luga.data.regionTraits.options} options
	 */
	luga.data.regionTraits.setRowId = function(options){
		options.node.find(CONST.SELECTORS.SET_ROW_ID).each(function(index, item){
			var jItem = jQuery(item);
			jItem.click(function(event){
				event.preventDefault();
				var rowId = jItem.attr(CONST.CUSTOM_ATTRIBUTES.SET_ROW_ID);
				options.dataSource.setCurrentRowId(rowId);
			});
		});
	};

}());