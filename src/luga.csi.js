/*
 Copyright 2013 Massimo Foti (massimo@massimocorner.com)

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

if(typeof(luga) === "undefined") {
	throw("Unable to find luga.js");
}

(function() {
	"use strict";

	luga.namespace("luga.csi");

	luga.csi.CONST = {
		NODE_SELECTOR: "section[data-luga-csi]",
		URL_ATTRIBUTE: "data-luga-csi",
		MESSAGES: {
			FILE_NOT_FOUND: "luga.csi failed to retrieve text from: {0}"
		}
	};

	/**
	 * Client-side Include widget
	 *
	 * @param options.rootNode:          Root node for widget (DOM reference). Required
	 * @param options.url:               Url to be included. Optional. Default to the value of the "data-luga-csi" attribute inside rootNode
	 * @param options.success:           Callback invoked once the url is successfully fetched. Optional, default to the internal "onSuccess" method
	 * @param options.error:             Callback invoked if the url request fails. Optional, default to the internal "onError" method
	 * @param options.context            Context to be used for success and error callbacks. Optional
	 * @param options.xhrTimeout:        Timeout for XHR call. Optional
	 */
	luga.csi.Include = function(options) {
		var self = this;

		this.init = function() {
			jQuery.ajax({
				url: self.config.url,
				timeout: self.config.XHR_TIMEOUT,
				success: function (response, textStatus, jqXHR) {
					self.config.success.apply(self.config.context, [response, textStatus, jqXHR]);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					self.config.error.apply(self.config.context, [jqXHR, textStatus, errorThrown]);
				}
			});
		};

		this.onSuccess = function(response, textStatus, jqXHR) {
			jQuery(options.rootNode).replaceWith(response);
		};

		this.onError = function(qXHR, textStatus, errorThrown) {
			throw(luga.utils.formatString(luga.csi.CONST.MESSAGES.FILE_NOT_FOUND, [self.config.url]));
		};

		this.config = {
			url: jQuery(options.rootNode).attr(luga.csi.CONST.URL_ATTRIBUTE),
			success: this.onSuccess,
			error: this.onError,
			xhrTimeout: 5000
		};
		luga.merge(this.config, options);
	};

	luga.csi.loadIncludes = function() {
		jQuery(luga.csi.CONST.NODE_SELECTOR).each(function(index, item) {
			var includeObj = new luga.csi.Include({rootNode: item});
			includeObj.init();
		});
	};

	jQuery(document).ready(function () {
		luga.csi.loadIncludes();
	});

}());