"use strict";

if(typeof(luga) === "undefined") {
	throw("Unable to find luga.js");
}

luga.namespace("luga.csi");

luga.csi.CONST = {
	NODE_SELECTOR: "section[data-luga-csi]",
	URL_ATTRIBUTE: "data-luga-csi"
};

/**
 * Client-side include widget
 *
 * @param options.rootNode:          Root node for widget (DOM reference). Required
 * @param options.url:               Url to be be included. Optional. Default to the value of the "data-luga-csi" attribute inside rootNode
 * @param options.success:           Callback invoked once the url is successfully fetched. Optional, default to the internal "onSuccess" method
 * @param options.error:             Callback invoked if the url request fails. Optional, default to the internal "onError" method
 * @param options.context            Context to be used for success and error callbacks. Optional
 * @param options.xhrTimeout:        Timeout for XHR call. Optional
 */
luga.csi.include = function(options) {
	var self = this;

	this.init = function() {
		jQuery.ajax({
			url: self.options.url,
			timeout: self.options.XHR_TIMEOUT,
			success: function (response, textStatus, jqXHR) {
				self.options.success.apply(self.options.context, [response, textStatus, jqXHR]);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				self.options.error.apply(self.options.context, [jqXHR, textStatus, errorThrown]);
			}
		});
	};

	this.onSuccess = function(response, textStatus, jqXHR) {
		jQuery(options.rootNode).html(response);
	};

	this.onError = function(qXHR, textStatus, errorThrown) {
		throw("luga.csi failed to retrieve text from: " + self.options.url);
	};

	this.options = {
		url: jQuery(options.rootNode).attr(luga.csi.CONST.URL_ATTRIBUTE),
		success: this.onSuccess,
		error: this.onError,
		xhrTimeout: 5000
	};
	jQuery.extend(this.options, options);
};

luga.csi.loadIncludes = function() {
	jQuery(luga.csi.CONST.NODE_SELECTOR).each(function(index, item) {
		var includeObj = new luga.csi.include({rootNode: item});
		includeObj.init();
	});
};

jQuery(document).ready(function () {
	luga.csi.loadIncludes();
});