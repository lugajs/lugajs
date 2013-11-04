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
	RULE_PREFIX: "data-luga-",
	CUSTOM_ATTRIBUTES: {
		VALIDATE: "data-luga-validate",
		BLOCK_SUBMIT: "data-luga-blocksubmit",
		MESSAGE: "data-luga-message",
		ERROR_CLASS: "data-luga-errorclass",
		REQUIRED: "data-luga-required",
		PATTERN: "data-luga-pattern",
		MIN_LENGTH: "data-luga-minlength",
		MAX_LENGTH: "data-luga-maxlength",
		MIN_NUMBER: "data-luga-minnumber",
		MAX_NUMBER: "data-luga-maxnumber",
		DATE_PATTERN: "data-luga-datepattern",
		MIN_DATE: "data-luga-mindate",
		MAX_DATE: "data-luga-maxdate",
		EQUAL_TO: "data-luga-equalto"
	},
	MESSAGES: {
		ABSTRACT_IS_VALID: "luga.validator.baseFieldValidator.isValid() is an abstract method",
		PATTERN_NOT_FOUND: "luga.validator failed to retrieve pattern: {0}"
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
 * Field validator factory. Use this to instantiate a field validator without worrying about the specific implementation
 *
 * @param options.fieldNode:          Root node for widget (DOM reference). Required
 * @param.options                     Additional options can be used, but are specific to different kind of input fields. Check their implementation for details
 */
luga.validator.getFieldValidatorInstance = function(options) {
	this.options = {};
	jQuery.extend(this.options, options);
	var self = this;
	// Abort if the field isn't suitable to validation
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
 * @param options.message:            Error message. Can also be set using the "data-luga-message" attribute. Optional
 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-luga-errorclass" attribute. Optional
 * @param.options                     Additional options can be used, but are specific to certain kind of input fields. Check their implementation for details
 */
luga.validator.baseFieldValidator = function(options) {
	this.options = {
		message: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE) || "",
		errorclass: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS) || ""
	};
	jQuery.extend(this.options, options);
	var self = this;
	self.node = jQuery(options.fieldNode);
	self.message = self.options.message;

	this.isValid = function() {
		throw(luga.validator.CONST.MESSAGES.ABSTRACT_IS_VALID);
	};

	this.flagInvalid = function(){
		self.node.addClass(self.options.errorclass);
		// Set the title attribute in order to show a tooltip
		self.node.attr("title", self.message);
	};

	this.flagValid = function() {
		self.node.removeClass(self.options.errorclass);
		self.node.removeAttr("title");
	};

	// Be careful, this method returns a boolean but also has side-effects
	this.validate = function() {
		// Disabled fields are always valid
		if(self.node.prop("disabled")) {
			self.flagValid();
			return false;
		}
		if(!self.isValid()) {
			self.flagInvalid();
			return true;
		}
		else{
			self.flagValid();
			return false;
		}
	};
};

/**
 * Text field validator class
 *
 * @param options.fieldNode:          Root node for widget (DOM reference). Required
 * @param options.required:           Set it to true to flag the field as required.
 *                                    In case you need conditional validation, set it to the name of a custom function that will handle the condition.
 *                                    Can also be set using the "data-luga-required" attribute. Optional
 * @param options.pattern:            Validation pattern to be applied, either built-in or custom.
 *                                    Can also be set using the "data-luga-pattern" attribute. Optional
 * @param options.minlength:          Enforce a minimum length. Can also be set using the "data-luga-minlength" attribute. Optional
 * @param options.maxlength:          Enforce a maximum length. Can also be set using the "data-luga-maxlength" attribute. Optional
 * @param options.minnumber:          Enforce a minimum numeric value. Can also be set using the "data-luga-minnumber" attribute. Optional
 * @param options.maxnumber:          Enforce a maximum numeric value. Can also be set using the "data-luga-maxnumber" attribute. Optional
 * @param options.datepattern:        Date format pattern to be applied, either built-in or custom.. Can also be set using the "data-luga-datepattern" attribute. Optional
 * @param options.mindate:            Enforce a minimum date. Can also be set using the "data-luga-mindate" attribute. Optional
 * @param options.maxdate:            Enforce a maximum date. Can also be set using the "data-luga-maxdate" attribute. Optional
 * @param options.equalto:            Id of another field who's values will be compared for equality. Can also be set using the "data-luga-equalto" attribute. Optional
 * @param options.message:            Error message. Can also be set using the "data-luga-message" attribute. Optional
 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-luga-errorclass" attribute. Optional

 */
luga.validator.textValidator = function(options) {
	this.options = {
		required: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED),
		pattern: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.PATTERN),
		minlength: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_LENGTH),
		maxlength: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_LENGTH),
		minnumber: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_NUMBER),
		maxnumber: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_NUMBER),
		datepattern: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.DATE_PATTERN),
		mindate: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_DATE),
		maxdate: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_DATE),
		equalto: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.EQUAL_TO)
	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(this.options));
	var self = this;
	self.node = jQuery(options.fieldNode);
	self.name = "";

	if(self.node.attr("name")) {
		self.name = self.node.attr("name");
	}
	else if(self.node.attr("id")) {
		self.name = self.node.attr("id");
	}

	this.isEmpty = function() {
		return self.node.val() === "";
	};

	this.isRequired = function() {
		var requiredAtt = this.options.required;
		if(requiredAtt){
			if(requiredAtt === "true") {
				return true;
			}
			if(requiredAtt === "false") {
				return false;
			}
			// It's a conditional validation. Invoke the relevant function if available
			var functionReference = eval(requiredAtt);
			if(jQuery.isFunction(functionReference)) {
				return functionReference.apply(null, [self.node]);
			}
		}
		return false;
	};

	// Check if the field satisfy the rules associated with it
	// Be careful, this method contains multiple exit points!!!
	this.isValid = function() {
		if(self.isEmpty()) {
			if(self.isRequired()) {
				return false;
			}
			else{
				return true;
			}
		}
		else{
			// It's empty. Loop over all the available rules
			for(var rule in luga.validator.rules) {
				// Check if the current rule is required for the field
				if(self.node.attr(luga.validator.CONST.RULE_PREFIX + rule)) {
					// Invoke the rule
					return luga.validator.rules[rule].apply(null, [self.node, self]);
				}
			}
		}
		return true;
	};
};

luga.validator.selectValidator = function(options) {
	this.options = {

	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(this.options));
	var self = this;
	self.node = jQuery(options.fieldNode);
};

luga.validator.radioValidator = function(options) {
	this.options = {

	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(this.options));
	var self = this;
};

luga.validator.checkboxValidator = function(options) {
	this.options = {

	};
	jQuery.extend(this.options, options);
	jQuery.extend(this, new luga.validator.baseFieldValidator(this.options));
	var self = this;
};

/* Rules */

luga.namespace("luga.validator.rules");

luga.validator.rules.maxlength = function(fieldNode, validator) {
	if(fieldNode.val().length > validator.options.maxlength) {
		return false;
	}
	return true;
};

luga.validator.rules.minlength = function(fieldNode, validator) {
	if(fieldNode.val().length < validator.options.minlength) {
		return false;
	}
	return true;
};

luga.validator.rules.maxnumber = function(fieldNode, validator) {
	if(!jQuery.isNumeric(fieldNode.val())) {
		return false;
	}
	if(parseFloat(fieldNode.val()) < parseFloat(validator.options.maxnumber)) {
		return true;
	}
	return false;
};

luga.validator.rules.minnumber = function(fieldNode, validator) {
	if(!jQuery.isNumeric(fieldNode.val())) {
		return false;
	}
	if(parseFloat(fieldNode.val()) > parseFloat(validator.options.minnumber)) {
		return true;
	}
	return false;
};

luga.validator.rules.pattern = function(fieldNode, validator) {
	var regExpObj = luga.validator.patterns[validator.options.pattern];
	if(regExpObj) {
		return regExpObj.test(fieldNode.val());
	}
	else{
		// The pattern is missing
		throw(luga.util.formatString(luga.validator.CONST.MESSAGES.PATTERN_NOT_FOUND, [validator.options.pattern]));
	}
};

/* Patterns */

luga.namespace("luga.validator.patterns");

luga.validator.patterns.lettersonly = new RegExp("^[a-zA-Z]*$");
luga.validator.patterns.alphanumeric = new RegExp("^\\w*$");
luga.validator.patterns.integer = new RegExp("^-?\\d\\d*$");
luga.validator.patterns.positiveinteger = new RegExp("^\\d\\d*$");
luga.validator.patterns.number = new RegExp("^-?(\\d\\d*\\.\\d*$)|(^-?\\d\\d*$)|(^-?\\.\\d\\d*$)");
luga.validator.patterns.filepath_pdf = new RegExp("[\\w_]*\\.([pP][dD][fF])$");
luga.validator.patterns.filepath_jpg = new RegExp("[\\w_]*\\.([jJ][pP][eE]?[gG])$");
luga.validator.patterns.filepath_zip = new RegExp("[\\w_]*\\.([zZ][iI][pP])$");
luga.validator.patterns.filepath = new RegExp("[\\w_]*\\.\\w{3}$");

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