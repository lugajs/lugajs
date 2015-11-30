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
			SET_ROW_ID: "data-lugads-setrowid",
			SET_ROW_INDEX: "data-lugads-setrowindex"
		},
		SELECTORS: {
			SET_ROW_ID: "*[data-lugads-setrowid]",
			SET_ROW_INDEX: "*[data-lugads-setrowindex]"
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

	/**
	 * Handles data-lugads-setrowindex
	 * @param {luga.data.regionTraits.options} options
	 */
	luga.data.regionTraits.setRowIndex = function(options){
		options.node.find(CONST.SELECTORS.SET_ROW_INDEX).each(function(index, item){
			var jItem = jQuery(item);
			jItem.click(function(event){
				event.preventDefault();
				var rowIndex = parseInt(jItem.attr(CONST.CUSTOM_ATTRIBUTES.SET_ROW_INDEX), 10);
				options.dataSource.setCurrentRowIndex(rowIndex);
			});
		});
	};

}());