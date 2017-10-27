(function(){
	"use strict";

	luga.namespace("luga.data.region.traits");

	/**
	 * @typedef {Object} luga.data.region.traits.options
	 *
	 * @property {jQuery}                                 node          A jQuery object wrapping the Region's node. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet}  dataSource    DataSource. Required
	 */

	var CONST = {
		CUSTOM_ATTRIBUTES: {
			SELECT: "data-lugaregion-select",
			SET_ROW_ID: "data-lugaregion-setrowid",
			SET_ROW_INDEX: "data-lugaregion-setrowindex",
			SORT: "data-lugaregion-sort"
		},
		SELECTORS: {
			SELECT: "*[data-lugaregion-select]",
			SET_ROW_ID: "*[data-lugaregion-setrowid]",
			SET_ROW_INDEX: "*[data-lugaregion-setrowindex]",
			SORT: "*[data-lugaregion-sort]"
		}
	};

	/**
	 * Handles data-lugaregion-select
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.select = function(options){
		var nodes = options.node.find(CONST.SELECTORS.SELECT);
		if(nodes.length > 0){
			if(options.dataSource.getCurrentRowIndex === undefined){
				// It's a detailSet, abort
				return;
			}
			var cssClass = nodes.attr(CONST.CUSTOM_ATTRIBUTES.SELECT);
			// Clean-up
			nodes.removeClass(cssClass);
			// Default to zero
			var index = 0;

			if(options.dataSource.getCurrentRowIndex() === -1){
				 // Remove class from everyone
				nodes.removeClass(cssClass);
			}
			else {
				index = options.dataSource.getCurrentRowIndex();
				// Apply CSS
				jQuery(nodes.get(index)).addClass(cssClass);
			}

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
	 * Handles data-lugaregion-setrowid
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
	 * Handles data-lugaregion-setrowindex
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
	 * Handles data-lugaregion-sort
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