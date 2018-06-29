(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.DataSet.dataLoading
	 *
	 * @property {luga.data.DataSet} dataSet
	 */

	/**
	 * @typedef {Object} luga.data.HttpDataSet.options
	 *
	 * @extend luga.data.DataSet.options
	 * @property {string}    url              URL to be fetched. Default to null
	 * @property {number}    timeout          Timeout (in milliseconds) for the HTTP request. Default to 10 seconds
	 * @property {Object}    headers          A set of name/value pairs to be used as custom HTTP headers
	 * @property {boolean}   incrementalLoad  By default calling once .loadData() is called the dataSet discard all the previous records.
	 *                                        Set this to true to keep the old records. Default to false
	 * @property {boolean}   cache            If set to false, it will force requested pages not to be cached by the browser.
	 *                                        It works by appending "_={timestamp}" to the querystring. Default to true
	 */

	/**
	 * Base HttpDataSet class
	 * @param {luga.data.HttpDataSet.options} options
	 * @constructor
	 * @extend luga.data.DataSet
	 * @abstract
	 * @fire dataLoading
	 * @fire xhrError
	 * @throw {Exception}
	 */
	luga.data.HttpDataSet = function(options){
		luga.extend(luga.data.DataSet, this, [options]);
		/** @type {luga.data.HttpDataSet} */
		const self = this;

		const CONST = {
			ERROR_MESSAGES: {
				HTTP_DATA_SET_ABSTRACT: "luga.data.HttpDataSet is an abstract class",
				XHR_FAILURE: "Failed to retrieve: {0}. HTTP status: {1}. Error: {2}",
				NEED_URL_TO_LOAD: "Unable to call loadData(). DataSet is missing a URL"
			}
		};

		if(this.constructor === luga.data.HttpDataSet){
			throw(CONST.ERROR_MESSAGES.HTTP_DATA_SET_ABSTRACT);
		}

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

		this.headers = [];
		if(options.headers !== undefined){
			this.headers = options.headers;
		}

		this.incrementalLoad = false;
		if(options.incrementalLoad !== undefined){
			this.incrementalLoad = options.incrementalLoad;
		}

		// Concrete implementations can override this
		this.contentType = "text/plain";
		this.xhrRequest = null;

		/* Private methods */

		const loadUrl = function(){
			const xhrOptions = {
				url: self.url,
				success: function(response){
					if(self.incrementalLoad === false){
						self.delete();
					}
					self.loadRecords(response);
				},
				contentType: self.contentType,
				timeout: self.timeout,
				cache: self.cache,
				headers: self.headers,
				error: self.xhrError
			};
			self.xhrRequest = new luga.xhr.Request(xhrOptions);
			self.xhrRequest.send(self.url);
		};

		/* Public methods */

		/**
		 * Abort any pending XHR request
		 */
		this.cancelRequest = function(){
			if(this.xhrRequest !== null){
				this.xhrRequest.abort();
				this.xhrRequest = null;
			}
		};

		/**
		 * Returns the URL that will be used to fetch the data. Returns null if URL is not set
		 * @return {string|null}
		 */
		this.getUrl = function(){
			return this.url;
		};

		/**
		 * Fires an XHR request to fetch and load the data, notify observers ("dataLoading" first, "dataChanged" after records are loaded).
		 * Throws an exception if URL is not set
		 * @fire dataLoading
		 * @throw {Exception}
		 */
		this.loadData = function(){
			if(this.url === null){
				throw(CONST.ERROR_MESSAGES.NEED_URL_TO_LOAD);
			}
			this.setState(luga.data.STATE.LOADING);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_LOADING, {dataSet: this});
			this.cancelRequest();
			loadUrl();
		};

		/**
		 * Abstract method, concrete classes must implement it to extract records from XHR response
		 * @param {luga.xhr.response} response
		 * @abstract
		 */
		/* istanbul ignore next */
		this.loadRecords = function(response){
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
		 * Is called whenever an XHR request fails, set state to error, notify observers ("xhrError")
		 * @param {luga.xhr.response} response
		 * @fire xhrError
		 */
		this.xhrError = function(response){
			self.setState(luga.data.STATE.ERROR);
			self.notifyObservers(luga.data.CONST.EVENTS.XHR_ERROR, {
				dataSet: self,
				message: luga.string.format(CONST.ERROR_MESSAGES.XHR_FAILURE, [self.url, response.status]),
				response: response
			});
		};

	};

}());