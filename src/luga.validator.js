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
	CUSTOM_ATTRIBUTES: {
		VALIDATE: "data-luga-validate",
		BLOCK_SUBMIT: "data-luga-blocksubmit",
		MESSAGE: "data-luga-message",
		ERROR_CLASS: "data-luga-errorclass",
		REQUIRED: "data-luga-required"
	},
	FAKE_INPUT_TYPES: {
		fieldset: true,
		reset: true,
		button: true,
		submit: true
	}
};

/**
 * Form validator class
 *
 * @param options.formNode:          Root node for widget (DOM reference). Required
 * @param options.blocksubmit:       Disable submit buttons if the form isn't valid.
 *                                   This prevents multiple submits but also prevents the value of the submit buttons from being passed as part of the HTTP request.
 *                                   Set this options to false to keep the submit buttons enabled.
 *                                   Value can also be set using the "data-luga-blocksubmit" attribute. Optional
 */
luga.validator.formValidator = function(options) {

	this.options = {
		blocksubmit: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.BLOCK_SUBMIT) || true
	};
	jQuery.extend(this.options, options);
	var self = this;
	self.validators = [];

	// Execute all field validators. Returns an array of field validators that are in invalid state
	// Returns and empty array if no errors
	this.executeValidators = function() {
		// Keep track of already validated fields (to skip already validated checkboxes or radios)
		var validatedFields = {};
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

/**
 * Field validator factory
 *
 * @param options.fieldNode:          Root node for widget (DOM reference). Required
 * @param.options                     Additional options can be used, but are specific to different kind of input fields. Check their implementation for details
 */
luga.validator.getFieldValidatorInstance = function(options) {
	this.options = {};
	jQuery.extend(this.options, options);
	var self = this;
	// Early exit point
	if(!luga.validator.util.isInputField(self.options.fieldNode)) {
		return null;
	}
	var fieldType = jQuery(self.options.fieldNode).prop("type");
	// Get relevant validator based on field type
	switch(fieldType){
		case "select-multiple":
			return new luga.validator.selectValidator(options);
		case "select-one":
			return new luga.validator.selectValidator(options);
		case "radio":
			return new luga.validator.radioValidator(options);
		case "checkbox":
			return new luga.validator.checkboxValidator(options);
		// Default. Handle anything else as text field
		default:
			return new luga.validator.textValidator(options);
	}
};

/**
 * Abstract field validator class. To be extended for different kind of fields
 *
 * @param options.fieldNode:          Root node for widget (DOM reference). Required
 * @param options.message:            Error message. Value can also be set using the "data-luga-message" attribute. Optional
 * @param options.errorclass:         CSS class to apply for invalid state. Value can also be set using the "data-luga-errorclass" attribute. Optional
 * @param.options                     Additional options can be used, but are specific to certain kind of input fields. Check their implementation for details
 */
luga.validator.baseFieldValidator = function(options) {
	this.options = {
		message: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE) || "",
		errorclass: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS) || ""
	};
	jQuery.extend(this.options, options);
	var self = this;
};

luga.validator.textValidator = function(options) {
	this.options = {
		required: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED)
	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(options));
	var self = this;
};

luga.validator.selectValidator = function(options) {
	this.options = {

	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(options));
	var self = this;
};

luga.validator.radioValidator = function(options) {
	this.options = {

	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(options));
	var self = this;
};

luga.validator.checkboxValidator = function(options) {
	this.options = {

	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(options));
	var self = this;
};

/* Utilities */

luga.namespace("luga.validator.util");

luga.validator.util.isInputField = function(fieldNode) {
	if(!jQuery(fieldNode).prop("type")) {
		return false;
	}
	// It belongs to the kind of nodes that are considered form fields, but can't be validated
	if(luga.validator.CONST.FAKE_INPUT_TYPES[jQuery(fieldNode).prop("type")] === true) {
		return false;
	}
	return true;
};