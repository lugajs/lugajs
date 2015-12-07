if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

/**
 * @typedef {object} luga.data.dataSourceChanged
 *
 * @property {luga.data.DataSet|luga.data.DetailSet} dataSource
 */

(function(){
	"use strict";

	luga.namespace("luga.data");
	luga.namespace("luga.data.region");

	luga.data.version = "0.2.2";
	/** @type {hash.<luga.data.DataSet>} */
	luga.data.dataSourceRegistry = {};

	luga.data.CONST = {
		PK_KEY: "rowId",
		COL_TYPES: ["date", "number", "string"],
		DEFAULT_REGION_TYPE: "luga.data.region.Handlebars",
		CUSTOM_ATTRIBUTES: {
			REGION: "data-lugads-region",
			REGION_TYPE: "data-lugads-regiontype",
			TEMPLATE: "data-lugads-template",
			DATA_SOURCE: "data-lugads-datasource"
		},
		EVENTS: {
			CURRENT_ROW_CHANGED: "currentRowChanged",
			DATA_CHANGED: "dataChanged",
			DATA_SORTED: "dataSorted",
			PRE_DATA_SORTED: "preDataSorted",
			LOADING: "loading",
			XHR_ERROR: "xhrError"
		},
		SELECTORS: {
			REGION: "*[data-lugads-region]"
		},
		ERROR_MESSAGES: {
			MISSING_DATA_SOURCE_ATTRIBUTE: "Missing required data-lugads-datasource attribute inside region",
			MISSING_DATA_SOURCE: "Unable to find datasource {0}",
			MISSING_REGION_TYPE_FUNCTION: "Failed to create region. Unable to find a constructor function named: {0}"
		},
		XHR_TIMEOUT: 10000 // Keep this accessible to everybody
	};
	/**
	 * Returns a dataSource from the registry
	 * Returns null if no source matches the given id
	 * @param {string} id
	 * @returns {luga.data.DataSet|luga.data.DetailSet}
	 */
	luga.data.getDataSource = function(id){
		if(luga.data.dataSourceRegistry[id] !== undefined){
			return luga.data.dataSourceRegistry[id];
		}
		return null;
	};

	/**
	 * Adds a dataSource inside the registry
	 * @param {string}                                id
	 * @param {luga.data.DataSet|luga.data.DetailSet} dataSource
	 */
	luga.data.setDataSource = function(id, dataSource){
		luga.data.dataSourceRegistry[id] = dataSource;
	};

	/**
	 * Given a jQuery object wrapping an HTML node, initialize the relevant Region handler
	 * @param {jquery} node
	 * @throws
	 */
	luga.data.initRegion = function(node){
		var dataSourceId = node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE);
		if(dataSourceId === undefined){
			throw(luga.data.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE_ATTRIBUTE);
		}
		var dataSource = luga.data.getDataSource(dataSourceId);
		if(dataSource === null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [dataSourceId]));
		}
		var regionType = node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.REGION_TYPE);
		if(regionType === undefined){
			regionType = luga.data.CONST.DEFAULT_REGION_TYPE;
		}
		var RegionClass = luga.lookup(regionType);
		if(RegionClass === null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.MISSING_REGION_TYPE_FUNCTION, [regionType]));
		}
		new RegionClass({node: node});
	};

	jQuery(document).ready(function(){
		jQuery(luga.data.CONST.SELECTORS.REGION).each(function(index, item){
			luga.data.initRegion(jQuery(item));
		});
	});

}());