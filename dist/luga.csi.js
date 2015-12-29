/*! 
Luga CSI 1.1.1 2015-12-29T20:47:06.856Z
Copyright 2013-2015 Massimo Foti (massimo@massimocorner.com)
Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0
 */
if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.csi");

	luga.csi.version = "1.1.1";

	luga.csi.CONST = {
		NODE_SELECTOR: "div[data-lugacsi]",
		URL_ATTRIBUTE: "data-lugacsi",
		AFTER_ATTRIBUTE: "data-lugacsi-after",
		USER_AGENT: "luga.csi",
		MESSAGES: {
			FILE_NOT_FOUND: "luga.csi failed to retrieve text from: {0}"
		}
	};

	/**
	 * @typedef {object} luga.csi.Include.options
	 *
	 * @property {jquery}   rootNode     Root node for widget (DOM reference). Required
	 * @property {string}   url          Url to be included. Optional. Default to the value of the "data-lugacsi" attribute inside rootNode
	 * @property {function} success      Function that will be invoked once the url is successfully fetched. Optional, default to the internal "onSuccess" method
	 * @property {function} after        Function that will be invoked once the include is successfully performed.
	 *                                   It will be called with the handler(rootNode, url, response) signature. Optional, it can be set using the "data-lugacsi-after" attribute
	 * @property {function} error        Function that will be invoked if the url request fails. Optional, default to the internal "onError" method
	 * @property {int}      xhrTimeout   Timeout for XHR call (ms). Optional. Default to 5000 ms
	 */

	/**
	 * Client-side Include widget
	 *
	 * @param {luga.csi.Include.options} options
	 * @constructor
	 */
	luga.csi.Include = function(options){

		var onSuccess = function(response, textStatus, jqXHR){
			jQuery(config.rootNode).html(response);
		};

		/**
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @param {string}   textStatus   HTTP status
		 * @param {string}   errorThrown
		 * @throws
		 */
		var onError = function(qXHR, textStatus, errorThrown){
			throw(luga.string.format(luga.csi.CONST.MESSAGES.FILE_NOT_FOUND, [config.url]));
		};

		var config = {
			url: jQuery(options.rootNode).attr(luga.csi.CONST.URL_ATTRIBUTE),
			after: jQuery(options.rootNode).attr(luga.csi.CONST.AFTER_ATTRIBUTE),
			success: onSuccess,
			error: onError,
			xhrTimeout: 5000
		};
		luga.merge(config, options);

		this.load = function(){
			jQuery.ajax({
				url: config.url,
				timeout: config.XHR_TIMEOUT,
				headers: {
					"X-Requested-With": luga.csi.CONST.USER_AGENT
				},
				success: function(response, textStatus, jqXHR){
					config.success.apply(null, [response, textStatus, jqXHR]);
					var afterHandler = luga.lookupFunction(config.after);
					if(afterHandler !== undefined){
						afterHandler.apply(null, [config.rootNode, config.url, response]);
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					config.error.apply(null, [jqXHR, textStatus, errorThrown]);
				}
			});
		};

	};

	/**
	 * Invoke this to programmatically load CSI inside the current document
	 */
	luga.csi.loadIncludes = function(){
		jQuery(luga.csi.CONST.NODE_SELECTOR).each(function(index, item){
			var includeObj = new luga.csi.Include({rootNode: item});
			includeObj.load();
		});
	};

	jQuery(document).ready(function(){
		luga.csi.loadIncludes();
	});

}());