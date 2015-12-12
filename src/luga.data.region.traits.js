(function(){
	"use strict";

	luga.namespace("luga.data.region.traits");

	/**
	 * @typedef {object} luga.data.region.traits.options
	 *
	 * @property {jquery}                                 node          A jQuery object wrapping the Region's node. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet}  dataSource    DataSource. Required
	 */

	var CONST = {
		CUSTOM_ATTRIBUTES: {
			SELECT: "data-lugads-select",
			SET_ROW_ID: "data-lugads-setrowid",
			SET_ROW_INDEX: "data-lugads-setrowindex",
			SORT: "data-lugads-sort"
		},
		SELECTORS: {
			SELECT: "*[data-lugads-select]",
			SET_ROW_ID: "*[data-lugads-setrowid]",
			SET_ROW_INDEX: "*[data-lugads-setrowindex]",
			SORT: "*[data-lugads-sort]"
		}
	};

	/**
	 * Handles data-lugads-select
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.select = function(options){
		var nodes = options.node.find(CONST.SELECTORS.SELECT);
		if(nodes.length > 0){

			var cssClass = nodes.attr(CONST.CUSTOM_ATTRIBUTES.SELECT);
			// Clean-up
			nodes.removeClass(cssClass);
			// Default to zero, detailSets have no setCurrentRowIndex() method
			var index = 0;
			if(options.dataSource.getCurrentRowIndex !== undefined){
				index = options.dataSource.getCurrentRowIndex();
			}
			// Apply CSS
			jQuery(nodes.get(index)).addClass(cssClass);

			// Attach click event
			nodes.each(function(index, item){
				var jItem = jQuery(item);
				jItem.click(function(event){
					event.preventDefault();
					nodes.removeClass(cssClass);
					jItem.addClass(cssClass);
				});
			});
		}
	};

	/**
	 * Handles data-lugads-setrowid
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowId = function(options){
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
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowIndex = function(options){
		options.node.find(CONST.SELECTORS.SET_ROW_INDEX).each(function(index, item){
			var jItem = jQuery(item);
			jItem.click(function(event){
				event.preventDefault();
				var rowIndex = parseInt(jItem.attr(CONST.CUSTOM_ATTRIBUTES.SET_ROW_INDEX), 10);
				options.dataSource.setCurrentRowIndex(rowIndex);
			});
		});
	};

	/**
	 * Handles data-lugads-sort
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.sort = function(options){
		options.node.find(CONST.SELECTORS.SORT).each(function(index, item){
			var jItem = jQuery(item);
			jItem.click(function(event){
				event.preventDefault();
				var sortCol = jItem.attr(CONST.CUSTOM_ATTRIBUTES.SORT);
				options.dataSource.sort(sortCol);
			});
		});
	};

}());