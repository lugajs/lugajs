(function(){
	"use strict";

	/**
	 * Base HTTP dataSet class
	 *
	 * @param options:                  Same as luga.data.DataSet plus:
	 * @param options.url:              URL to be fetched. Default to null
	 * @param options.timeout:          Timeout (in milliseconds) for the HTTP request. Default to 10 seconds
	 * @param options.cache:            If set to false, it will force requested pages not to be cached by the browser.
	 *                                  It works by appending "_={timestamp}" to the querystring. Default to true
	 */
	luga.data.HttpDataSet = function(options){
		if(this.constructor === luga.data.HttpDataSet){
			throw(luga.data.CONST.ERROR_MESSAGES.HTTP_DATA_SET_ABSTRACT);
		}
		luga.extend(luga.data.DataSet, this, [options]);
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
		 */
		this.getUrl = function(){
			return this.url;
		};

		/**
		 * Set the URL that will be used to fetch the data.
		 * This method does not load the data into the data set, it merely sets the internal URL.
		 * The developer must call loadData() to actually trigger the data loading
		 */
		this.setUrl = function(newUrl){
			this.url = newUrl;
		};

		/**
		 * Fires off XHR request to fetch and load the data, notify observers ("loading" first, "dataChanged" after records are loaded).
		 * Does nothing if URL is not set
		 */
		this.loadData = function(){
			if(this.url === null){
				return;
			}
			this.notifyObservers("loading", this);
			this.cancelRequest();
			this.delete();
			loadUrl();
		};

		/**
		 * It will be called whenever an XHR request fails, notify observers ("error")
		 */
		this.xhrError = function(jqXHR, textStatus, errorThrown){
			self.notifyObservers("error", {
				dataSet: self,
				message: luga.string.format(luga.data.CONST.ERROR_MESSAGES.XHR_FAILURE, [self.url, jqXHR.status, errorThrown])
			});
		};

		/**
		 * Abstract method, child classes must implement it to extract records from XHR response
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