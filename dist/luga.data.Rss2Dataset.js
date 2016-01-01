/*! 
Luga Data - RSS 2.0 DataSet 0.6.0 2016-01-01T09:48:22.398Z
Copyright 2013-2016 Massimo Foti (massimo@massimocorner.com)
Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0
 */
if(typeof(luga.data) === "undefined"){
	throw("Unable to find Luga Data");
}

/**
 * @typedef {object} luga.data.DataSet.context
 * @extends luga.data.stateDescription
 *
 * @property {number}                         recordCount
 * @property {array.<luga.data.DataSet.row>}  items
 */

(function(){
	"use strict";

	/**
	 * RSS 2.0 dataSet class
	 * @param {luga.data.HttpDataSet.options} options
	 * @constructor
	 * @extends luga.data.HttpDataSet
	 */
	luga.data.Rss2Dataset = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.Rss2Dataset} */
		var self = this;
		/** @override */
		this.dataType = "text";

		/** @type {null|string} */
		this.rawXml = null;

		/** @type {array.<string>} */
		this.channelElements = ["title", "link", "description", "language", "copyright", "managingEditor", "webMaster", "pubDate", "lastBuildDate", "category", "generator", "docs", "cloud", "ttl", "image", "textInput", "skipHours", "skipDays"];

		/** @type {array.<string>} */
		this.itemElements = ["title", "link", "description", "author", "category", "comments", "enclosure", "guid", "pubDate", "source"];

		// Store metadata extracted from <channel>
		this.channelMeta = {};

		/**
		 * Given
		 * @param {jquery} item  A jQuery wrapper around an <item>
		 * @returns {object}
		 */
		var itemToHash = function(item){
			var rec = {};
			for(var i = 0; i < self.itemElements.length; i++){
				rec[self.itemElements[i]] = jQuery(item).find(self.itemElements[i]).text();
			}
			return rec;
		};

		/**
		 * Extract metadata from <channel>
		 * @param {jquery} $channel A jQuery wrapper around the <channel> tag
		 */
		var setChannelMeta = function($channel){
			for(var i = 0; i < self.channelElements.length; i++){
				self.channelMeta[self.channelElements[i]] = $channel.find(">" + self.channelElements[i]).text();
			}
		};

		/* Public methods */

		/**
		 * @returns {luga.data.Rss2Dataset.context}
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
		 * Returns the raw XML document
		 * @returns {null|string}
		 */
		this.getRawXml = function(){
			return this.rawXml;
		};

		/**
		 * First delete any existing records, then load data from the given XML, without XHR calls
		 * @param {string} xmlStr  XML document as string
		 */
		this.loadRawXml = function(xmlStr){
			self.delete();
			self.loadRecords(xmlStr);
		};

		/**
		 * Retrieves XML data, either from an HTTP response or from a direct call
		 * @param {string}   xmlStr       XML document as string. Either returned from the server or passed directly
		 * @param {string}   textStatus   HTTP status. Automatically passed by jQuery for XHR calls
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest. Automatically passed by jQuery for XHR calls
		 * @override
		 */
		this.loadRecords = function(xmlStr, textStatus, jqXHR){
			self.rawXml = xmlStr;
			var $xml = jQuery(jQuery.parseXML(xmlStr));
			var items = [];
			// Collect data from each <item>
			$xml.find("item").each(function(index, element){
				items.push(itemToHash(jQuery(this)));
			});
			setChannelMeta($xml.find("channel"));
			// Insert all records
			self.insert(items);
		};

	};

	luga.data.Rss2Dataset.version = "0.6.0";

}());