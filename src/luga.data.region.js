(function(){
	"use strict";

	luga.namespace("luga.data.region");

	luga.data.region.CONST = {
		DEFAULT_REGION_TYPE: "luga.data.region.Handlebars",
		CUSTOM_ATTRIBUTES: {
			DATA_SOURCE: "data-lugads-datasource",
			REGION: "data-lugads-region",
			REGION_TYPE: "data-lugads-regiontype",
			TEMPLATE: "data-lugads-template",
			TRAITS: "data-lugads-traits"
		},
		EVENTS: {
			REGION_RENDERED: "regionRendered"
		},
		SELECTORS: {
			REGION: "*[data-lugads-region]"
		},
		ERROR_MESSAGES: {
			MISSING_DATA_SOURCE_ATTRIBUTE: "Missing required data-lugads-datasource attribute inside region",
			MISSING_DATA_SOURCE: "Unable to find datasource {0}",
			MISSING_REGION_TYPE_FUNCTION: "Failed to create region. Unable to find a constructor function named: {0}"
		}
	};

	/**
	 * Given a jQuery object wrapping an HTML node, initialize the relevant Region handler
	 * @param {jquery} node
	 * @throws
	 */
	luga.data.region.init = function(node){
		var dataSourceId = node.attr(luga.data.region.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE);
		if(dataSourceId === undefined){
			throw(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE_ATTRIBUTE);
		}
		var dataSource = luga.data.getDataSource(dataSourceId);
		if(dataSource === null){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [dataSourceId]));
		}
		var regionType = node.attr(luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_TYPE);
		if(regionType === undefined){
			regionType = luga.data.region.CONST.DEFAULT_REGION_TYPE;
		}
		var RegionClass = luga.lookupFunction(regionType);
		if(RegionClass === undefined){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_REGION_TYPE_FUNCTION, [regionType]));
		}
		new RegionClass({node: node});
	};


	jQuery(document).ready(function(){
		jQuery(luga.data.region.CONST.SELECTORS.REGION).each(function(index, item){
			luga.data.region.init(jQuery(item));
		});
	});

}());