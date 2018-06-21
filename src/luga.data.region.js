(function(){
	"use strict";

	luga.namespace("luga.data.region");

	luga.data.region.CONST = {
		CUSTOM_ATTRIBUTES: {
			DATA_SOURCE_UUID: "data-lugaregion-datasource-uuid",
			REGION: "data-lugaregion",
			REGION_TYPE: "data-lugaregion-type",
			TEMPLATE_ID: "data-lugaregion-template-id",
			TRAITS: "data-lugaregion-traits",
			REGION_REFERENCE: "luga-region-reference"
		},
		DEFAULT_REGION_TYPE: "luga.data.region.Handlebars",
		DEFAULT_TRAITS: [
			"luga.data.region.traits.select",
			"luga.data.region.traits.setRowId",
			"luga.data.region.traits.setRowIndex",
			"luga.data.region.traits.sort"
		],
		ERROR_MESSAGES: {
			MISSING_DATA_SOURCE_ATTRIBUTE: "Missing required data-lugaregion-datasource-uuid attribute inside region",
			MISSING_DATA_SOURCE: "Unable to find datasource {0}",
			MISSING_REGION_TYPE_FUNCTION: "Failed to create region. Unable to find a constructor function named: {0}"
		},
		EVENTS: {
			REGION_RENDERED: "regionRendered"
		},
		SELECTORS: {
			REGION: "*[data-lugaregion='true']"
		}
	};

	/**
	 * @typedef {Object} luga.data.region.options
	 *
	 * @property {boolean} autoregister  Determine if we call luga.data.region.init() on luga.dom.ready()
	 */

	/**
	 * @type {luga.data.region.options}
	 */
	const config = {
		autoregister: true
	};

	/**
	 * Change current configuration
	 * @param {luga.data.region.options} options
	 * @return {luga.data.region.options}
	 */
	luga.data.region.setup = function(options){
		luga.merge(config, options);
		return config;
	};

	/**
	 * Given a DOM node, returns the region object associated to it
	 * Returns undefined if the node is not associated to a region
	 * @param {HTMLElement} node
	 * @return {undefined|luga.data.region.Base}
	 */
	luga.data.region.getReferenceFromNode = function(node){
		return node[luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_REFERENCE];
	};

	/**
	 * Given a DOM node, initialize the relevant Region handler
	 * @param {HTMLElement} node
	 * @throw {Exception}
	 */
	luga.data.region.init = function(node){
		const dataSourceId = node.getAttribute(luga.data.region.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE_UUID);
		if(dataSourceId === null){
			throw(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE_ATTRIBUTE);
		}
		const dataSource = luga.data.getDataSource(dataSourceId);
		if(dataSource === null){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [dataSourceId]));
		}
		let regionType = node.getAttribute(luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_TYPE);
		if(regionType === null){
			regionType = luga.data.region.CONST.DEFAULT_REGION_TYPE;
		}
		const RegionClass = luga.lookupFunction(regionType);
		if(RegionClass === undefined){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_REGION_TYPE_FUNCTION, [regionType]));
		}
		new RegionClass({node: node});
	};

	/**
	 * Bootstrap any region contained within the given node
	 * @param {HTMLElement|undefined} [rootNode]   Optional, default to <body>
	 */
	luga.data.region.initRegions = function(rootNode){
		if(rootNode === undefined){
			rootNode = document.querySelector("body");
		}
		/* istanbul ignore else */
		if(rootNode !== null){
			const nodes = rootNode.querySelectorAll(luga.data.region.CONST.SELECTORS.REGION);
			for(let i = 0; i < nodes.length; i++){
				luga.data.region.init(nodes[i]);
			}
		}
	};

	luga.namespace("luga.data.region.utils");

	/**
	 * @typedef {Object} luga.data.region.description
	 *
	 * @property {HTMLElement}                           node   A DOM node containing the region.
	 * @property {luga.data.DataSet|luga.data.DetailSet} ds     DataSource
	 */

	/**
	 * Given a region instance, returns an object containing its critical data
	 * @param {luga.data.region.Base} region
	 * @return {luga.data.region.description}
	 */
	luga.data.region.utils.assembleRegionDescription = function(region){
		return {
			node: region.config.node,
			ds: region.dataSource
		};
	};

	luga.dom.ready(function(){
		/* istanbul ignore else */
		if(config.autoregister === true){
			luga.data.region.initRegions();
		}
	});

}());