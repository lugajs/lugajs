(function(){
	"use strict";

	luga.namespace("luga.data.region.traits");

	/**
	 * @typedef {Object} luga.data.region.traits.options
	 *
	 * @property {HTMLElement}                            node          A DOM node. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet}  dataSource    DataSource. Required
	 */

	const CONST = {
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

	const removeCssClass = function(nodes, className){
		for(let i = 0; i < nodes.length; i++){
			nodes[i].classList.remove(className);
		}
	};

	/**
	 * Handles data-lugaregion-select
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.select = function(options){
		const nodes = options.node.querySelectorAll(CONST.SELECTORS.SELECT);
		if(options.dataSource.getCurrentRowIndex === undefined){
			// It's a detailSet, abort
			return;
		}

		if(nodes.length > 0){
			const cssClass = nodes[0].getAttribute(CONST.CUSTOM_ATTRIBUTES.SELECT);
			nodes[0].classList.remove(cssClass);
			// Default to first row
			let index = 0;

			if(options.dataSource.getCurrentRowIndex() === -1){
				// Remove class from everyone
				removeCssClass(nodes, cssClass);
			}
			else{
				index = options.dataSource.getCurrentRowIndex();
				// Apply CSS
				nodes[index].classList.add(cssClass);
			}

			// Attach click event to all nodes
			for(let i = 0; i < nodes.length; i++){
				const element = nodes[i];
				addSelectEvent(element, cssClass, nodes);
			}
		}
	};

	const addSelectEvent = function(element, cssClass, nodes){
		element.addEventListener("click", function(event){
			event.preventDefault();
			removeCssClass(nodes, cssClass);
			element.classList.add(cssClass);
		}, false);
	};

	/**
	 * Handles data-lugaregion-setrowid
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowId = function(options){
		const nodes = options.node.querySelectorAll(CONST.SELECTORS.SET_ROW_ID);
		for(let i = 0; i < nodes.length; i++){
			const element = nodes[i];
			const rowId = element.getAttribute(CONST.CUSTOM_ATTRIBUTES.SET_ROW_ID);
			addRowIdEvent(element, rowId, options.dataSource);
		}
	};

	const addRowIdEvent = function(element, rowId, dataSource){
		element.addEventListener("click", function(event){
			event.preventDefault();
			dataSource.setCurrentRowId(rowId);
		}, false);
	};

	/**
	 * Handles data-lugaregion-setrowindex
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowIndex = function(options){
		const nodes = options.node.querySelectorAll(CONST.SELECTORS.SET_ROW_INDEX);
		for(let i = 0; i < nodes.length; i++){
			const element = nodes[i];
			const rowIndex = parseInt(element.getAttribute(CONST.CUSTOM_ATTRIBUTES.SET_ROW_INDEX), 10);
			addRowIndexEvent(element, rowIndex, options.dataSource);
		}
	};

	const addRowIndexEvent = function(element, rowIndex, dataSource){
		element.addEventListener("click", function(event){
			event.preventDefault();
			dataSource.setCurrentRowIndex(rowIndex);
		}, false);
	};

	/**
	 * Handles data-lugaregion-sort
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.sort = function(options){
		const nodes = options.node.querySelectorAll(CONST.SELECTORS.SORT);
		for(let i = 0; i < nodes.length; i++){
			const element = nodes[i];
			element.addEventListener("click", function(event){
				event.preventDefault();
				const sortCol = element.getAttribute(CONST.CUSTOM_ATTRIBUTES.SORT);
				options.dataSource.sort(sortCol);
			}, false);
		}
	};

}());