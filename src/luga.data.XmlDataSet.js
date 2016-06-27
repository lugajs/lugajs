(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.XmlDataSet.options
	 *
	 * @extends luga.data.HttpDataSet.options
	 * @property {string} path  Specifies the XPath expression to be used to extract nodes from the XML document. Default to: "/"
	 */

	/**
	 * XML dataSet class
	 * @param {luga.data.XmlDataSet.options} options
	 * @constructor
	 * @extends luga.data.HttpDataSet
	 */
	luga.data.XmlDataSet = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.XmlDataSet} */
		var self = this;
		/** @override */
		this.dataType = "xml";

		this.path = "/";
		if(options.path !== undefined){
			this.path = options.path;
		}

		/** @type {null|Node} */
		this.rawXml = null;

		/* Public methods */

		/**
		 * Returns the raw XML data
		 * @returns {null|Node}
		 */
		this.getRawXml = function(){
			return this.rawXml;
		};

		/**
		 * Returns the XPath expression to be used to extract data out of the XML
		 * @returns {null|string}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * First delete any existing records, then load data from the given XML, without XHR calls
		 * @param {Node} Node
		 */
		this.loadRawXml = function(node){
			self.delete();
			self.loadRecords(node);
		};

		/**
		 * Retrieves XML data, either from an HTTP response or from a direct call, apply the path, if any, extract and load records out of it
		 * @param {Node}     xmlDoc       XML data. Either returned from the server or passed directly
		 * @param {string}   textStatus   HTTP status. Automatically passed by jQuery for XHR calls
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest. Automatically passed by jQuery for XHR calls
		 * @override
		 */
		this.loadRecords = function(xmlDoc, textStatus, jqXHR){
			self.rawXml = xmlDoc;
			var nodes = luga.xml.evaluateXPath(xmlDoc, self.path);
			var records = [];
			for(var i = 0; i < nodes.length; i++){
				records.push(luga.xml.nodeToObject(nodes[i]));
			}
			self.insert(records);

		};

		/**
		 * Set the the XPath expression to be used to extract data out of the XML
		 * @param {string} path   XPath expression. Required
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());