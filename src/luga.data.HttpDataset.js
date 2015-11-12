(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.HttpDataSet.options
	 *
	 * @extends luga.data.DataSet.options
	 * @property {string|null}   url       URL to be fetched. Default to null
	 * @property {number}        timeout   Timeout (in milliseconds) for the HTTP request. Default to 10 seconds
	 * @property {boolean}       cache     If set to false, it will force requested pages not to be cached by the browser.
	 *                                     It works by appending "_={timestamp}" to the querystring. Default to true
	 */

	/**
	 * Base HttpDataSet class
	 * @param luga.data.HttpDataSet.options
	 * @constructor
	 * @extends luga.data.DataSet
	 * @abstract
	 * @fires loading
	 * @fires xhrError
	 */
	luga.data.HttpDataSet = function(options){
		if(this.constructor === luga.data.HttpDataSet){
			throw(luga.data.CONST.ERROR_MESSAGES.HTTP_DATA_SET_ABSTRACT);
		}
		luga.extend(luga.data.DataSet, this, [options]);
		/** @type {luga.data.HttpDataSet} */
		var self = this;

		this.url = null;
		if(options.url !== undefined){
			this.url = options.url;
		}

		this.timeout = luga.data.CONST.XHR_TIMEOUT;
		if(options.timeout !== undefined){
			this.timeout = options.timeout;
		}

		this.cache = true;
		if(options.cache !== undefined){
			this.cache = options.cache;
		}

		this.xhrRequest = null;

		this.cancelRequest = function(){
			if(this.xhrRequest !== null){
				this.xhrRequest.abort();
				this.xhrRequest = null;
			}
		};

		/**
		 * Returns the URL that will be used to fetch the data. Returns null if URL is not set
		 * @returns {string|null}
		 */
		this.getUrl = function(){
			return this.url;
		};

		/**
		 * Set the URL that will be used to fetch the data.
		 * This method does not load the data into the data set, it merely sets the internal URL.
		 * The developer must call loadData() to actually trigger the data loading
		 * @param {string} newUrl
		 */
		this.setUrl = function(newUrl){
			this.url = newUrl;
		};

		/**
		 * Fires off XHR request to fetch and load the data, notify observers ("loading" first, "dataChanged" after records are loaded).
		 * Does nothing if URL is not set
		 * @fires loading
		 */
		this.loadData = function(){
			if(this.url === null){
				return;
			}
			this.notifyObservers(luga.data.CONST.EVENTS.LOADING, this);
			this.cancelRequest();
			this.delete();
			loadUrl();
		};

		/**
		 * Will be called whenever an XHR request fails, notify observers ("xhrError")
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @param {string}   textStatus   HTTP status
		 * @param {string}   errorThrown  Error message from jQuery
		 * @fires xhrError
		 */
		this.xhrError = function(jqXHR, textStatus, errorThrown){
			self.notifyObservers(luga.data.CONST.EVENTS.XHR_ERROR, {
				dataSet: self,
				message: luga.string.format(luga.data.CONST.ERROR_MESSAGES.XHR_FAILURE, [self.url, jqXHR.status, errorThrown])
			});
		};

		/**
		 * Abstract method, child classes must implement it to extract records from XHR response
		 * @param {*}        response     Data returned from the server
		 * @param {string}   textStatus   HTTP status
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @abstract
		 */
		this.loadRecords = function(response, textStatus, jqXHR){
		};

		var loadUrl = function(){
			self.xhrRequest = jQuery.ajax({
				url: self.url,
				success: self.loadRecords,
				timeout: self.timeout,
				cache: self.cache,
				error: self.xhrError
			});
		};

	};

}());