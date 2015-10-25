if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.csi");

	luga.csi.version = "1.0.0";

	luga.csi.CONST = {
		NODE_SELECTOR: "div[data-lugacsi]",
		URL_ATTRIBUTE: "data-lugacsi",
		AFTER_ATTRIBUTE: "data-lugacsi-after",
		MESSAGES: {
			FILE_NOT_FOUND: "luga.csi failed to retrieve text from: {0}"
		}
	};

	/**
	 * Client-side Include widget
	 *
	 * @param options.rootNode:          Root node for widget (DOM reference). Required
	 * @param options.url:               Url to be included. Optional. Default to the value of the "data-lugacsi" attribute inside rootNode
	 * @param options.success:           Function that will be invoked once the url is successfully fetched. Optional, default to the internal "onSuccess" method
	 * @param options.after  :           Function that will be invoked once the include is successfully performed.
	 *                                   It will be called with the handler(rootNode, url, response) signature. Optional, it can be set using the "data-lugacsi-after" attribute
	 * @param options.error:             Function that will be invoked if the url request fails. Optional, default to the internal "onError" method
	 * @param options.xhrTimeout:        Timeout for XHR call. Optional
	 */
	luga.csi.Include = function(options){
		var self = this;

		this.init = function(){
			jQuery.ajax({
				url: self.config.url,
				timeout: self.config.XHR_TIMEOUT,
				success: function(response, textStatus, jqXHR){
					self.config.success.apply(null, [response, textStatus, jqXHR]);
					var afterHandler = luga.lookup(self.config.after);
					if(afterHandler !== null){
						afterHandler.apply(null, [self.config.rootNode, self.config.url, response]);
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					self.config.error.apply(null, [jqXHR, textStatus, errorThrown]);
				}
			});
		};

		this.onSuccess = function(response, textStatus, jqXHR){
			jQuery(self.config.rootNode).html(response);
		};

		this.onError = function(qXHR, textStatus, errorThrown){
			throw(luga.string.format(luga.csi.CONST.MESSAGES.FILE_NOT_FOUND, [self.config.url]));
		};

		this.config = {
			url: jQuery(options.rootNode).attr(luga.csi.CONST.URL_ATTRIBUTE),
			after: jQuery(options.rootNode).attr(luga.csi.CONST.AFTER_ATTRIBUTE),
			success: this.onSuccess,
			error: this.onError,
			xhrTimeout: 5000
		};
		luga.merge(this.config, options);
	};

	luga.csi.loadIncludes = function(){
		jQuery(luga.csi.CONST.NODE_SELECTOR).each(function(index, item){
			var includeObj = new luga.csi.Include({rootNode: item});
			includeObj.init();
		});
	};

	jQuery(document).ready(function(){
		luga.csi.loadIncludes();
	});

}());