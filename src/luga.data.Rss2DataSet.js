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
		var self = this;

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
		var itemToHash = function(item){
			var rec = {};
			for(var i = 0; i < self.itemElements.length; i++){
				var element = self.itemElements[i];
				var nodes = luga.data.xml.evaluateXPath(item, element);
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
		var setChannelMeta = function(channel){
			for(var i = 0; i < self.channelElements.length; i++){
				var element = self.channelElements[i];
				var nodes = luga.data.xml.evaluateXPath(channel, element);
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
		var extractRecords = function(nodes){
			var records = [];
			nodes.forEach(function(element){
				records.push(itemToHash(element));
			});
			return records;
		};

		/* Utilities */

		/**
		 * Extract text out of a TEXT or CDATA node
		 * @param {Node} node
		 * @return {String}
		 */
		function getTextValue(node){
			var child = node.childNodes[0];
			/* istanbul ignore else */
			if((child.nodeType === 3) /* TEXT_NODE */ || (child.nodeType === 4) /* CDATA_SECTION_NODE */){
				return child.data;
			}
		}

		/* Public methods */

		/**
		 * @return {luga.data.Rss2Dataset.context}
		 * @override
		 */
		this.getContext = function(){
			var context = {
				items: self.select(),
				recordCount: self.getRecordsCount()
			};
			var stateDesc = luga.data.utils.assembleStateDescription(self.getState());
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
			var xmlDoc = luga.data.xml.parseFromString(response.responseText);
			self.rawXml = xmlDoc;
			// Extract metadata
			var channelNodes = luga.data.xml.evaluateXPath(xmlDoc, "//channel");
			setChannelMeta(channelNodes[0]);
			// Insert all records
			var items = luga.data.xml.evaluateXPath(xmlDoc, "//item");
			var records = extractRecords(items);
			self.insert(records);
		};

	};

}());