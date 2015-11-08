if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.data");

	luga.data.version = "0.1";
	/** @type {hash.<luga.data.DataSet>} */
	luga.data.datasetRegistry = {};

	luga.data.CONST = {
		PK_KEY: "rowID",
		REGION_SELECTOR: "*[data-lugads-region]",
		CUSTOM_ATTRIBUTES: {
			REGION: "data-lugads-region",
			TEMPLATE: "data-lugads-template",
			DATA_SET: "data-lugads-dataset"
		},
		ERROR_MESSAGES: {
			INVALID_ID_PARAMETER: "Luga.DataSet: id parameter is required",
			INVALID_ROW_ID_PARAMETER: "Luga.DataSet: invalid rowId parameter",
			INVALID_FILTER_PARAMETER: "Luga.DataSet: invalid filter. You must use a function as filter",
			HTTP_DATA_SET_ABSTRACT: "luga.data.HttpDataSet is an abstract class",
			XHR_FAILURE: "Failed to retrieve: {0}. HTTP status: {1}. Error: {2}"
		},
		XHR_TIMEOUT: 10000
	};

	/**
	 * Returns a dataSet from the registry
	 * Returns null if no dataSet matches the given id
	 * @param {string} id
	 * @returns {luga.data.DataSet}
	 */
	luga.data.getDataSet = function(id){
		if(luga.data.datasetRegistry[id] !== undefined){
			return luga.data.datasetRegistry[id];
		}
		return null;
	};

}());