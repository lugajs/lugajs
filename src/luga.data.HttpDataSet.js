(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DataSet.dataLoading
	 *
	 * @property {luga.data.DataSet} dataSet
	 */

	/**
	 * @typedef {object} luga.data.HttpDataSet.xhrError
	 *
	 * @property {string} message
	 * @property {object} jqXHR        jQuery wrapper around XMLHttpRequest
	 * @property {string} textStatus
	 * @property {string} errorThrown
	 */

	/**
	 * @typedef {object} luga.data.HttpDataSet.options
	 *
	 * @extends luga.data.DataSet.options
	 * @property {string}    url              URL to be fetched. Default to null
	 * @property {number}    timeout          Timeout (in milliseconds) for the HTTP request. Default to 10 seconds
	 * @property {object}    headers          A set of name/value pairs to be used as custom HTTP headers
	 * @property {boolean}   incrementalLoad  By default calling once .loadData() is called the dataSet discard all the previous records.
	 *                                        Set this to true to keep the old records. Default to false
	 * @property {boolean}   cache            If set to false, it will force requested pages not to be cached by the browser.
	 *                                        It works by appending "_={timestamp}" to the querystring. Default to true
	 */

	/**
	 * Base HttpDataSet class
	 * @param luga.data.HttpDataSet.options
	 * @constructor
	 * @extends luga.data.DataSet
	 * @abstract
	 * @fires dataLoading
	 * @fires xhrError
	 * @throws
	 */
	luga.data.HttpDataSet = function(options){
		luga.extend(luga.data.DataSet, this, [options]);
		/** @type {luga.data.HttpDataSet} */
		var self = this;

		var CONST = {
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

		this.headers = {};
		if(options.headers !== undefined){
			this.headers = options.headers;
		}

		this.incrementalLoad = false;
		if(options.incrementalLoad !== undefined){
			this.incrementalLoad = options.incrementalLoad;
		}

		// Concrete implementations can override this
		this.dataType = null;
		this.xhrRequest = null;

		/* Private methods */

		var loadUrl = function(){
			var xhrOptions = {
				url: self.url,
				success: function(response, textStatus, jqXHR){
					updateHeaders(jqXHR.getAllResponseHeaders());
					if(self.incrementalLoad === false){
						self.delete();
					}
					self.loadRecords(response, textStatus, jqXHR);
				},
				timeout: self.timeout,
				cache: self.cache,
				headers: self.headers,
				error: self.xhrError
			};
			if(self.dataType !== null){
				xhrOptions.dataType = self.dataType;
			}
			self.xhrRequest = jQuery.ajax(xhrOptions);
		};

		var updateHeaders = function(headersStr){
			self.headers = {};
			var tokens = headersStr.split("\r\n");
			for(var i = 0; i < tokens.length; i++){
				var parts = tokens[i].split(": ");
				if((parts[0] !== undefined) && (parts[1] !== undefined)){
					self.headers[parts[0]] = parts[1];
				}
			}
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
		 * @returns {string|null}
		 */
		this.getUrl = function(){
			return this.url;
		};

		/**
		 * Fires an XHR request to fetch and load the data, notify observers ("dataLoading" first, "dataChanged" after records are loaded).
		 * Throws an exception if URL is not set
		 * @fires dataLoading
		 * @throws
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
		 * @param {*}        response     Data returned from the server
		 * @param {string}   textStatus   HTTP status
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @abstract
		 */
		this.loadRecords = function(response, textStatus, jqXHR){
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
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @param {string}   textStatus   HTTP status
		 * @param {string}   errorThrown  Error message from jQuery
		 * @fires xhrError
		 */
		this.xhrError = function(jqXHR, textStatus, errorThrown){
			self.setState(luga.data.STATE.ERROR);
			self.notifyObservers(luga.data.CONST.EVENTS.XHR_ERROR, {
				dataSet: self,
				message: luga.string.format(CONST.ERROR_MESSAGES.XHR_FAILURE, [self.url, jqXHR.status, errorThrown]),
				jqXHR: jqXHR,
				textStatus: textStatus,
				errorThrown: errorThrown
			});
		};

	};

}());