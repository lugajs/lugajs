/*
 Copyright 2013-15 Massimo Foti (massimo@massimocorner.com)

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

if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.ajaxform");
	luga.ajaxform.version = "0.1";

	/* Success and error handlers */
	luga.namespace("luga.ajaxform.handlers");

	/**
	 * Replace form with message
	 */
	luga.ajaxform.handlers.replaceForm = function(formNode, msg){
		// TODO: implement
		alert(msg);
	};

	/**
	 * Display error message inside alert
	 */
	luga.ajaxform.handlers.errorAlert = function(formNode, msg){
		alert(msg);
	};

	/**
	 * Display error message inside a box above the form
	 */
	luga.ajaxform.handlers.errorBox = function(formNode, msg){
		// Clean-up any existing box
		luga.utils.removeDisplayBox(formNode);
		luga.utils.displayErrorMessage(formNode, msg);
	};

	luga.ajaxform.CONST = {
		FORM_SELECTOR: "form[data-lugajax-form]",
		USER_AGENT: "luga.ajaxform",
		DEFAULT_METHOD: "GET",
		DEFAULT_TIME_OUT: 60000, // ms
		CUSTOM_ATTRIBUTES: {
			AJAX: "data-lugajax-form",
			ACTION: "data-lugajax-action",
			METHOD: "data-lugajax-method",
			TIME_OUT: "data-lugajax-timeout",
			SUCCESS: "data-lugajax-success",
			ERROR: "data-lugajax-error",
			BEFORE: "data-lugajax-before",
			AFTER: "data-lugajax-after"
		},
		MESSAGES: {
			FORM_MISSING: "luga.ajaxform was unable to load form",
			MISSING_FUNCTION: "luga.ajaxform was unable to find a function named: {0}"
		},
		HANDLERS: {
			SUCCESS: luga.ajaxform.handlers.replaceForm,
			ERROR: luga.ajaxform.handlers.errorAlert
		}
	};

	luga.ajaxform.Sender = function(options){
		this.config = {
			// Either: form attribute, custom attribute, incoming option or current URL
			action: jQuery(options.formNode).attr("action") || jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.ACTION) || self.location.href,
			// Either: form attribute, custom attribute, incoming option or default
			method: jQuery(options.formNode).attr("method") || jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.METHOD) || luga.ajaxform.CONST.DEFAULT_METHOD,
			// Either: custom attribute, incoming option or default
			timeout: jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.TIME_OUT) || luga.ajaxform.CONST.DEFAULT_TIME_OUT,
			success: jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.SUCCESS) || luga.ajaxform.CONST.HANDLERS.SUCCESS,
			error: jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.ERROR) || luga.ajaxform.CONST.HANDLERS.ERROR,
			// Either: custom attribute, incoming option or null
			before: jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.BEFORE) || null,
			after: jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.AFTER) || null
		};
		luga.merge(this.config, options);
		var self = this;
		// Ensure it's a jQuery object
		self.config.formNode = jQuery(self.config.formNode);

		if(jQuery(self.config.formNode).length === 0){
			throw(luga.ajaxform.CONST.MESSAGES.FORM_MISSING);
		}

		this.send = function(event){
			event.preventDefault();
			// TODO: implement
		};

		this.before = function(){
			var callBack = luga.lookup(self.config.before);
			if(callBack !== null){
				callBack.apply(null, [self.config.formNode[0]]);
			}
			else if(self.config.before){
				alert(luga.string.format(luga.ajaxform.CONST.MESSAGES.MISSING_FUNCTION, [self.config.before]));
			}
		};

		this.error = function(){
			var callBack = luga.lookup(self.config.error);
			if(callBack !== null){
				// TODO: pass more info to error handler
				callBack.apply(null, [self.config.formNode[0]]);
			}
			else if(self.config.error){
				alert(luga.string.format(luga.ajaxform.CONST.MESSAGES.MISSING_FUNCTION, [self.config.error]));
			}
		};

		this.after = function(){
			var callBack = luga.lookup(self.config.after);
			if(callBack !== null){
				callBack.apply(null, [self.config.formNode[0]]);
			}
			else if(self.config.after){
				alert(luga.string.format(luga.ajaxform.CONST.MESSAGES.MISSING_FUNCTION, [self.config.after]));
			}
		};

	};

	/**
	 * Attach form handlers to onSubmit events
	 */
	luga.ajaxform.initForms = function(){
		jQuery(luga.validator.CONST.FORM_SELECTOR).each(function(index, item){
			var formNode = jQuery(item);
			if(formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.AJAX) === "true"){
				formNode.submit(function(event){
					var formHandler = new luga.ajaxform.Sender({
						formNode: formNode
					});
					formHandler.send(event);
				});
			}
		});
	};

	jQuery(document).ready(function(){
		luga.ajaxform.initForms();
	});

}());