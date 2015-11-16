if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.data");

	luga.data.version = "0.1.5";
	/** @type {hash.<luga.data.DataSet>} */
	luga.data.datasetRegistry = {};

	luga.data.CONST = {
		PK_KEY: "rowID",
		CUSTOM_ATTRIBUTES: {
			REGION: "data-lugads-region",
			TEMPLATE: "data-lugads-template",
			DATA_SOURCE: "data-lugads-datasource"
		},
		ERROR_MESSAGES: {
			INVALID_ID_PARAMETER: "Luga.DataSet: id parameter is required"
		},
		EVENTS: {
			CURRENT_ROW_CHANGED: "currentRowChanged",
			DATA_CHANGED: "dataChanged",
			LOADING: "loading",
			XHR_ERROR: "xhrError"
		},
		SELECTORS: {
			REGION: "*[data-lugads-region]"
		},
		XHR_TIMEOUT: 10000 // Keep this accessible to everybody
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