(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.XmlDataSet.options
	 *
	 * @extend luga.data.HttpDataSet.options
	 * @property {String} path  Specifies the XPath expression to be used to extract nodes from the XML document. Default to: "/"
	 */

	/**
	 * XML dataSet class
	 * @param {luga.data.XmlDataSet.options} options
	 * @constructor
	 * @extend luga.data.HttpDataSet
	 */
	luga.data.XmlDataSet = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.XmlDataSet} */
		var self = this;
		/** @override */
		this.contentType = "application/xml";

		this.path = "/";
		if(options.path !== undefined){
			this.path = options.path;
		}

		/** @type {null|Node} */
		this.rawXml = null;

		/* Public methods */

		/**
		 * Returns the raw XML data
		 * @return {null|Node}
		 */
		this.getRawXml = function(){
			return this.rawXml;
		};

		/**
		 * Returns the XPath expression to be used to extract data out of the XML
		 * @return {null|String}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * First delete any existing records, then load data from the given XML, without XHR calls
		 * @param {String} xmlStr
		 */
		this.loadRawXml = function(xmlStr){
			self.delete();
			self.loadRecords({
				responseText: xmlStr
			});
		};

		/**
		 * Retrieves XML data from an HTTP response, apply the path, if any, extract and load records out of it
		 * @param {luga.xhr.response} response
		 * @override
		 */
		this.loadRecords = function(response){
			var xmlDoc = luga.data.xml.parseFromString(response.responseText);
			self.rawXml = xmlDoc;
			var nodes = luga.data.xml.evaluateXPath(xmlDoc, self.path);
			var records = [];
			for(var i = 0; i < nodes.length; i++){
				records.push(luga.data.xml.nodeToHash(nodes[i]));
			}
			self.insert(records);
		};

		/**
		 * Set the the XPath expression to be used to extract data out of the XML
		 * @param {String} path   XPath expression. Required
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());