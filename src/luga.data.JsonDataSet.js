(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.JsonDataSet.options
	 *
	 * @extends luga.data.HttpDataSet.options
	 * @property {string|null}   path      Specifies the path to the data within the JSON structure. Default to null
	 */

	/**
	 * JSON dataSet class
	 * @param {luga.data.JsonDataSet.options} options
	 * @constructor
	 * @extends luga.data.HttpDataSet
	 */
	luga.data.JsonDataSet = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.JsonDataSet} */
		var self = this;
		/** @override */
		this.dataType = "json";

		this.path = null;
		if(options.path !== undefined){
			this.path = options.path;
		}

		/* Public methods */

		/**
		 * Returns the path to be used to extract data out of the JSON data structure
		 * @returns {string|null}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * Receives JSON data, either from an HTTP response or from a direct call, apply the path, if any, and loads records out of it
		 * @param {json}     json         Data returned from the server
		 * @param {string}   textStatus   HTTP status. Automatically passed by jQuery for XHR calls
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest. Automatically passed by jQuery for XHR calls
		 * @override
		 */
		this.loadRecords = function(json, textStatus, jqXHR){
			if(self.path === null){
				self.insert(json);
			}
			else{
				var records = luga.lookupProperty(json, self.path);
				if(records !== undefined){
					self.insert(records);
				}
			}
		};

		/**
		 * Set the path to be used to extract data out of the JSON data structure
		 * @param {string} path
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());