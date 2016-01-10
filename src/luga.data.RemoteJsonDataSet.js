(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.RemoteJsonDataSet.options
	 *
	 * @extends luga.data.JsonDataSet.options
	 * @property {luga.data.JsonDataSet}   masterDataSet
	 *
	 */

	/**
	 * Binded JSON dataSet class
	 * @param {luga.data.RemoteJsonDataSet.options} options
	 * @constructor
	 * @extends luga.data.JsonDataSet
	 */
	luga.data.RemoteJsonDataSet = function(options){
		luga.extend(luga.data.JsonDataSet, this, [options]);
		/** @type {luga.data.RemoteJsonDataSet} */
		var self = this;

	};

}());