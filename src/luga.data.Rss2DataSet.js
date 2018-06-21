/**
 * @typedef {Object} luga.data.DataSet.context
 * @extend luga.data.stateDescription
 *
 * @property {Number}                         recordCount
 * @property {Array.<luga.data.DataSet.row>}  items
 */

(function(){
	"use strict";

	/**
	 * RSS 2.0 dataSet class
	 * @param {luga.data.HttpDataSet.options} options
	 * @constructor
	 * @extend luga.data.HttpDataSet
	 */
	luga.data.Rss2Dataset = function(options){
		luga.extend(luga.data.XmlDataSet, this, [options]);
		/** @type {luga.data.Rss2Dataset} */
		const self = this;

		/** @type {null|string} */
		this.rawXml = null;

		/** @type {Array.<String>} */
		this.channelElements = ["title", "link", "description", "language", "copyright", "managingEditor", "webMaster", "pubDate", "lastBuildDate", "category", "generator", "docs", "cloud", "ttl", "image", "textInput", "skipHours", "skipDays"];

		/** @type {Array.<String>} */
		this.itemElements = ["title", "link", "description", "author", "category", "comments", "enclosure", "guid", "pubDate", "source"];

		// Store metadata extracted from <channel>
		this.channelMeta = {};

		/**
		 * Given an <item> node, extract its content inside a JavaScript object
		 * @param {Node} item
		 * @return {Object}
		 */
		const itemToHash = function(item){
			const rec = {};
			for(let i = 0; i < self.itemElements.length; i++){
				const element = self.itemElements[i];
				const nodes = luga.data.xml.evaluateXPath(item, element);
				if(nodes.length > 0){
					rec[element] = getTextValue(nodes[0]);
				}

			}
			return rec;
		};

		/**
		 * Extract metadata from <channel>
		 * @param {Node} channel
		 */
		const setChannelMeta = function(channel){
			for(let i = 0; i < self.channelElements.length; i++){
				const element = self.channelElements[i];
				const nodes = luga.data.xml.evaluateXPath(channel, element);
				if(nodes.length > 0){
					self.channelMeta[element] = getTextValue(nodes[0]);
				}
			}
		};

		/**
		 * Turn an array of <items> nodes into an array of records
		 * @param {Array.<Node>} nodes
		 * @return {Array.<Object>}
		 */
		const extractRecords = function(nodes){
			const records = [];
			nodes.forEach(function(element){
				records.push(itemToHash(element));
			});
			return records;
		};

		/* Utilities */

		/**
		 * Extract text out of a TEXT or CDATA node
		 * @param {HTMLElement} node
		 * @return {string}
		 */
		function getTextValue(node){
			const child = node.childNodes[0];
			/* istanbul ignore else */
			if((child.nodeType === 3) /* TEXT_NODE */){
				return child.data;
			}
		}

		/* Public methods */

		/**
		 * @return {luga.data.Rss2Dataset.context}
		 * @override
		 */
		this.getContext = function(){
			const context = {
				items: self.select(),
				recordCount: self.getRecordsCount()
			};
			const stateDesc = luga.data.utils.assembleStateDescription(self.getState());
			luga.merge(context, stateDesc);
			luga.merge(context, self.channelMeta);
			return context;
		};

		/**
		 * Retrieves XML data from an HTTP response
		 * @param {luga.xhr.response} response
		 * @override
		 */
		this.loadRecords = function(response){
			const xmlDoc = luga.data.xml.parseFromString(response.responseText);
			self.rawXml = xmlDoc;
			// Extract metadata
			const channelNodes = luga.data.xml.evaluateXPath(xmlDoc, "//channel");
			setChannelMeta(channelNodes[0]);
			// Insert all records
			const items = luga.data.xml.evaluateXPath(xmlDoc, "//item");
			const records = extractRecords(items);
			self.insert(records);
		};

	};

}());