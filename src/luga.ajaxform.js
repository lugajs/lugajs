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

	/* Error handlers */
	luga.namespace("luga.ajaxform.handlers");

	/**
	 * Display error messages inside alert
	 */
	luga.ajaxform.handlers.errorAlert = function(formNode, errorMsg){
		alert(errorMsg);
	};

	/**
	 * Display errors inside a box above the form
	 */
	luga.ajaxform.handlers.errorBox = function(formNode, errorMsg){
		// Clean-up any existing box
		luga.utils.removeDisplayBox(formNode);
		luga.utils.displayErrorMessage(formNode, errorMsg);
	};

	luga.ajaxform.CONST = {
		FORM_SELECTOR: "form[data-lugajax-form]",
		USER_AGENT: "luga.ajaxform",
		CUSTOM_ATTRIBUTES: {
			AJAX: "data-lugajax-form",
			ERROR: "data-lugajax-error",
			BEFORE: "data-lugajax-before",
			AFTER: "data-lugajax-after"
		},
		MESSAGES: {
			FORM_MISSING: "luga.ajaxform was unable to load form"
		},
		HANDLERS: {
			ERROR: luga.ajaxform.handlers.errorAlert
		}
	};

	luga.ajaxform.Form = function(options){
		this.config = {
			error: jQuery(options.formNode).attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.ERROR) || luga.ajaxform.CONST.HANDLERS.ERROR,
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

	};

	/**
	 * Attach form handlers to onSubmit events
	 */
	luga.ajaxform.initForms = function(){
		jQuery(luga.validator.CONST.FORM_SELECTOR).each(function(index, item){
			var formNode = jQuery(item);
			if(formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.AJAX) === "true"){
				formNode.submit(function(event){
					var formHandler = new luga.ajaxform.Form({
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