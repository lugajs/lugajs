/**
 * Copyright 2013 massimocorner.com
 * @author      Massimo Foti (massimo@massimocorner.com)
 * @require     luga.js
 */

"use strict";
if(typeof(luga) === "undefined") {
	throw("Unable to find luga.js");
}
luga.namespace("luga.validator");

luga.validator.CONST = {
	FORM_SELECTOR: "form[data-luga-validate]",
	ATTRIBUTES: {
		VALIDATE: "data-luga-validate",
		BLOCK_SUBMIT: "data-luga-blocksubmit"
	}
};

/**
 * Form validator widget
 *
 * @param options.formNode:          Root node for widget (DOM reference). Required
 * @param options.blocksubmit:       Disable submit buttons if the form isn't valid.
 *                                   This prevents multiple submits but also prevents the value of the submit buttons from being passed as part of the HTTP request.
 *                                   Set this options to false to keep the submit buttons enabled. Optional
 */
luga.validator.form = function(options) {

	this.options = {
		blocksubmit: jQuery(options.formNode).attr(luga.validator.CONST.ATTRIBUTES.BLOCK_SUBMIT) || true
	};
	jQuery.extend(this.options, options);
	var self = this;
	self.validators = [];

	// Execute multiple validators. Returns an array of field validators that are in invalid state
	// Returns and empty array if no errors
	this.executeValidators = function() {
		// Keep track of already validated fields (to skip already validated checkboxes or radios)
		var validatedFields = {};
		// Store all the invalid field validators
		var activeValidators = [];
		// Validate all the fields
		for(var i=0; i<self.validators.length; i++) {
			if(self.validators[i].validate) {
				if(validatedFields[self.validators[i].name]) {
					// Already validated checkbox or radio, skip it
					continue;
				}
				if(self.validators[i].validate()) {
					activeValidators[activeValidators.length] = self.validators[i];
				}
				validatedFields[self.validators[i].name] = true;
			}
		}
		return activeValidators;
	};

	this.isValid = function() {
		var activeValidators = this.executeValidators();
		return activeValidators.length === 0;
	};

};