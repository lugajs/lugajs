(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.ChildJsonDataSet.options
	 *
	 * @extends luga.data.JsonDataSet.options
	 * @property {luga.data.DataSet}  parentDataSet   Parent dataSet to be used in a master-detail scenario
	 * @property {string}             url             Unlike JsonDataSet the url here is required and is expected to be a string template like:
	 *                                                http://www.ciccio.com/api/products/{uuid}
	 *
	 */

	/**
	 * Binded JSON dataSet class
	 * @param {luga.data.ChildJsonDataSet.options} options
	 * @constructor
	 * @extends luga.data.JsonDataSet
	 */
	luga.data.ChildJsonDataSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				MISSING_PARENT_DS: "luga.data.ChildJsonDataSet: parentDataSet parameter is required",
				MISSING_URL: "luga.data.ChildJsonDataSet: url parameter is required",
				FAILED_URL_BINDING: "luga.data.ChildJsonDataSet: unable to generate valid URL: {0}"
			}
		};

		if(options.parentDataSet === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_PARENT_DS);
		}

		if(options.url === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_URL);
		}

		luga.extend(luga.data.JsonDataSet, this, [options]);

		/** @type {luga.data.ChildJsonDataSet} */
		var self = this;

		/** @type {luga.data.JsonDataSet} */
		this.parentDataSet = options.parentDataSet;
		this.parentDataSet.addObserver(this);
		this.url = null;
		this.urlPattern = options.url;

		/**
		 * @param {luga.data.DataSet.row} row
		 */
		this.fetchData = function(row){
			var bindUrl = luga.string.replaceProperty(self.urlPattern, row);
			if(bindUrl === self.urlPattern){
				throw(luga.string.format(CONST.ERROR_MESSAGES.FAILED_URL_BINDING, [bindUrl]));
			}
			self.setUrl(bindUrl);
			self.loadData();
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			if(data.currentRow !== null){
				self.fetchData(data.currentRow);
			}
			else{
				self.delete();
			}

		};

	};

}());