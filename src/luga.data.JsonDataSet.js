(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.JsonDataSet.options
	 *
	 * @extends luga.data.HttpDataSet.options
	 * @property {string|null}   path      Specifies the path to the data within the JSON structure.
	 *                                     The path is expressed as a set of property names on the objects, separated by dots. Default to null
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

		/** @type {null|json} */
		this.rawJson = null;

		/* Public methods */

		/**
		 * Returns the raw JSON data structure
		 * @return {null|json}
		 */
		this.getRawJson = function(){
			return this.rawJson;
		};

		/**
		 * Returns the path to be used to extract data out of the JSON data structure
		 * @return {null|string}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * First delete any existing records, then load data from the given JSON, without XHR calls
		 * @param {json} json
		 */
		this.loadRawJson = function(json){
			self.delete();
			self.loadRecords(json);
		};

		/**
		 * Retrieves JSON data, either from an HTTP response or from a direct call, apply the path, if any, extract and load records out of it
		 * @param {json}     json         JSON data. Either returned from the server or passed directly
		 * @param {String}   textStatus   HTTP status. Automatically passed by jQuery for XHR calls
		 * @param {Object}   jqXHR        jQuery wrapper around XMLHttpRequest. Automatically passed by jQuery for XHR calls
		 * @override
		 */
		this.loadRecords = function(json, textStatus, jqXHR){
			self.rawJson = json;
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
		 * @param {String} path   Data path, expressed as a set of property names on the objects, separated by dots. Required
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());