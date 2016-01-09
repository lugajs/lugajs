(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.BindedJsonDataSet.options
	 *
	 * @extends luga.data.JsonDataSet.options
	 * @property {luga.data.JsonDataSet}   masterDataSet
	 *
	 */

	/**
	 * Binded JSON dataSet class
	 * @param {luga.data.BindedJsonDataSet.options} options
	 * @constructor
	 * @extends luga.data.JsonDataSet
	 */
	luga.data.BindedJsonDataSet = function(options){
		luga.extend(luga.data.JsonDataSet, this, [options]);
		/** @type {luga.data.BindedJsonDataSet} */
		var self = this;

	};

}());