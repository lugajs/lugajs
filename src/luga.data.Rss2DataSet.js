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
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.Rss2Dataset} */
		var self = this;
		/** @override */
		this.dataType = "text";

		/** @type {null|string} */
		this.rawXml = null;

		/** @type {Array.<String>} */
		this.channelElements = ["title", "link", "description", "language", "copyright", "managingEditor", "webMaster", "pubDate", "lastBuildDate", "category", "generator", "docs", "cloud", "ttl", "image", "textInput", "skipHours", "skipDays"];

		/** @type {Array.<String>} */
		this.itemElements = ["title", "link", "description", "author", "category", "comments", "enclosure", "guid", "pubDate", "source"];

		// Store metadata extracted from <channel>
		this.channelMeta = {};

		/**
		 * Given
		 * @param {jQuery} item  A jQuery wrapper around an <item>
		 * @return {Object}
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
		 * @param {jQuery} $channel A jQuery wrapper around the <channel> tag
		 */
		var setChannelMeta = function($channel){
			for(var i = 0; i < self.channelElements.length; i++){
				self.channelMeta[self.channelElements[i]] = $channel.find(">" + self.channelElements[i]).text();
			}
		};

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
		 * Returns the raw XML document
		 * @return {null|String}
		 */
		this.getRawXml = function(){
			return this.rawXml;
		};

		/**
		 * First delete any existing records, then load data from the given XML, without XHR calls
		 * @param {String} xmlStr  XML document as string
		 */
		this.loadRawXml = function(xmlStr){
			self.delete();
			self.loadRecords(xmlStr);
		};

		/**
		 * Retrieves XML data, either from an HTTP response or from a direct call
		 * @param {String}   xmlStr       XML document as string. Either returned from the server or passed directly
		 * @param {String}   textStatus   HTTP status. Automatically passed by jQuery for XHR calls
		 * @param {Object}   jqXHR        jQuery wrapper around XMLHttpRequest. Automatically passed by jQuery for XHR calls
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