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

	const removeCssClass = function(nodeList, className){
		nodeList.forEach(function(item){
			item.classList.remove(className);
		});
	};

	/**
	 * Handles data-lugaregion-select
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.select = function(options){
		if(options.dataSource.getCurrentRowIndex === undefined){
			// It's a detailSet, abort
			return;
		}

		let nodes = options.node.querySelectorAll(CONST.SELECTORS.SELECT);
		nodes = Array.prototype.slice.call(nodes);

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
			nodes.forEach(function(item){
				item.addEventListener("click", function(event){
					event.preventDefault();
					removeCssClass(nodes, cssClass);
					item.classList.add(cssClass);
				}, false);
			});

		}
	};

	/**
	 * Handles data-lugaregion-setrowid
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowId = function(options){
		let nodes = options.node.querySelectorAll(CONST.SELECTORS.SET_ROW_ID);
		nodes = Array.prototype.slice.call(nodes);

		nodes.forEach(function(item){
			item.addEventListener("click", function(event){
				event.preventDefault();
				const rowId = item.getAttribute(CONST.CUSTOM_ATTRIBUTES.SET_ROW_ID);
				options.dataSource.setCurrentRowId(rowId);
			}, false);
		});

	};

	/**
	 * Handles data-lugaregion-setrowindex
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowIndex = function(options){
		let nodes = options.node.querySelectorAll(CONST.SELECTORS.SET_ROW_INDEX);
		nodes = Array.prototype.slice.call(nodes);

		nodes.forEach(function(item){
			item.addEventListener("click", function(event){
				event.preventDefault();
				const rowIndex = parseInt(item.getAttribute(CONST.CUSTOM_ATTRIBUTES.SET_ROW_INDEX), 10);
				options.dataSource.setCurrentRowIndex(rowIndex);
			}, false);
		});
	};

	/**
	 * Handles data-lugaregion-sort
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.sort = function(options){
		let nodes = options.node.querySelectorAll(CONST.SELECTORS.SORT);
		nodes = Array.prototype.slice.call(nodes);

		nodes.forEach(function(item){
			item.addEventListener("click", function(event){
				event.preventDefault();
				const sortCol = item.getAttribute(CONST.CUSTOM_ATTRIBUTES.SORT);
				options.dataSource.sort(sortCol);
			}, false);
		});

	};

}());