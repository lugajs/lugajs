(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.RemoteJsonDataSet.options
	 *
	 * @extends luga.data.JsonDataSet.options
	 * @property {luga.data.JsonDataSet}   dataSet
	 * @property {string}                  urlPattern
	 *
	 */

	/**
	 * Binded JSON dataSet class
	 * @param {luga.data.RemoteJsonDataSet.options} options
	 * @constructor
	 * @extends luga.data.JsonDataSet
	 */
	luga.data.RemoteJsonDataSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				MISSING_MASTER_DS: "luga.data.RemoteJsonDataSet: dataSet parameter is required",
				MISSING_URL_PATTERN: "luga.data.RemoteJsonDataSet: urlPattern parameter is required"
			}
		};

		if(options.dataSet === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_MASTER_DS);
		}

		if(options.urlPattern === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_URL_PATTERN);
		}

		luga.extend(luga.data.JsonDataSet, this, [options]);

		/** @type {luga.data.RemoteJsonDataSet} */
		var self = this;

		/** @type {luga.data.JsonDataSet} */
		this.dataSet = options.dataSet;
		this.dataSet.addObserver(this);
		this.urlPattern = options.urlPattern;

		/**
		 * @param {luga.data.DataSet.row} row
		 */
		this.fetchData = function(row){
			var bindUrl = luga.string.replaceProperty(self.urlPattern, row);
			self.setUrl(bindUrl);
			self.loadData();
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			self.fetchData(data.currentRow);
		};

	};

}());