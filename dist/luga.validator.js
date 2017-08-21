/*! 
Luga Validator 0.9.5 2017-08-21T16:11:15.994Z
Copyright 2013-2017 Massimo Foti (massimo@massimocorner.com)
Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0
 */
/* globals alert */

/* istanbul ignore if */
if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.validator");

	/* Validation handlers */

	luga.namespace("luga.validator.handlers");

	/**
	 * Display error messages inside alert
	 *
	 * @param {jquery}                                      formNode      jQuery object wrapping the form
	 * @param {array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
	 */
	luga.validator.handlers.errorAlert = function(formNode, validators){
		var errorMsg = "";
		var focusGiven = false;
		for(var i = 0; i < validators.length; i++){
			// Append to the error string
			errorMsg += validators[i].message + "\n";
			// Give focus to the first invalid text field
			/* istanbul ignore else */
			if((focusGiven === false) && (validators[i].getFocus)){
				validators[i].getFocus();
				focusGiven = true;
			}
		}
		/* istanbul ignore else */
		if(errorMsg !== ""){
			alert(errorMsg);
		}
	};

	/**
	 * Display errors inside a box above the form
	 *
	 * @param {jquery}                                      formNode      jQuery object wrapping the form
	 * @param {array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
	 */
	luga.validator.handlers.errorBox = function(formNode, validators){
		// Clean-up any existing box
		if(validators.length === 0){
			luga.utils.removeDisplayBox(formNode);
			return;
		}
		var focusGiven = false;
		var htmlStr = "<ul>";
		// Create a <ul> for each error
		for(var i = 0; i < validators.length; i++){
			htmlStr += "<li><em>" + validators[i].name + ": </em> " + validators[i].message + "</li>";
			// Give focus to the first invalid text field
			if((focusGiven === false) && (validators[i].getFocus)){
				validators[i].getFocus();
				focusGiven = true;
			}
		}
		htmlStr += "</ul>";
		luga.utils.displayErrorMessage(formNode, htmlStr);
	};

	/**
	 * Use Bootstrap validation states to display errors
	 *
	 * @param {jquery}                                      formNode      jQuery object wrapping the form
	 * @param {array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
	 */
	luga.validator.handlers.bootstrap = function(formNode, validators){
		var ERROR_SELECTOR = ".has-error";
		var ERROR_CLASS = "has-error";
		var ALERT_SELECTOR = ".alert-danger";

		var FAILED_UPDATE = "<div class=\"alert alert-danger\" role=\"alert\">" +
			"<span style=\"padding-right:10px\" class=\"glyphicon glyphicon-exclamation-sign\">" +
			"</span>{0}</div>";

		// Reset all fields in the form
		jQuery(formNode).find(ERROR_SELECTOR).removeClass(ERROR_CLASS);
		jQuery(formNode).find(ALERT_SELECTOR).remove();

		var focusGiven = false;
		for(var i = 0; i < validators.length; i++){
			var fieldNode = jQuery(validators[i].node);
			// Attach Bootstrap CSS to parent node
			fieldNode.parent().addClass(ERROR_CLASS);
			// Display alert message
			fieldNode.before(jQuery(luga.string.format(FAILED_UPDATE, [validators[i].message])));
			// Give focus to the first invalid text field
			/* istanbul ignore else */
			if((focusGiven === false) && (validators[i].getFocus)){
				validators[i].getFocus();
				focusGiven = true;
			}
		}
	};

	luga.validator.CONST = {
		FORM_SELECTOR: "form[data-lugavalidator-validate]",
		RULE_PREFIX: "data-lugavalidator-",
		DEFAULT_DATE_PATTERN: "YYYY-MM-DD",
		CUSTOM_ATTRIBUTES: {
			VALIDATE: "data-lugavalidator-validate",
			ERROR: "data-lugavalidator-error",
			BEFORE: "data-lugavalidator-before",
			AFTER: "data-lugavalidator-after",
			BLOCK_SUBMIT: "data-lugavalidator-blocksubmit",
			MESSAGE: "data-lugavalidator-message",
			ERROR_CLASS: "data-lugavalidator-errorclass",
			REQUIRED: "data-lugavalidator-required",
			PATTERN: "data-lugavalidator-pattern",
			MIN_LENGTH: "data-lugavalidator-minlength",
			MAX_LENGTH: "data-lugavalidator-maxlength",
			MIN_NUMBER: "data-lugavalidator-minnumber",
			MAX_NUMBER: "data-lugavalidator-maxnumber",
			DATE_PATTERN: "data-lugavalidator-datepattern",
			MIN_DATE: "data-lugavalidator-mindate",
			MAX_DATE: "data-lugavalidator-maxdate",
			EQUAL_TO: "data-lugavalidator-equalto",
			MIN_CHECKED: "data-lugavalidator-minchecked",
			MAX_CHECKED: "data-lugavalidator-maxchecked",
			INVALID_INDEX: "data-lugavalidator-invalidindex",
			INVALID_VALUE: "data-lugavalidator-invalidvalue",
			DISABLED_MESSAGE: "data-lugavalidator-disabledlabel"
		},
		MESSAGES: {
			MISSING_FORM: "luga.validator was unable to load form",
			MISSING_FIELD: "luga.validator was unable to load field",
			MISSING_FUNCTION: "luga.validator was unable to find a function named: {0}",
			BASE_VALIDATOR_ABSTRACT: "luga.validator.BaseFieldValidator is an abstract class",
			GROUP_VALIDATOR_ABSTRACT: "luga.validator.BaseGroupValidator is an abstract class",
			FIELD_CANT_BE_VALIDATED: "This field can't be validated",
			PATTERN_NOT_FOUND: "luga.validator failed to retrieve pattern: {0}",
			INVALID_INDEX_PARAMETER: "data-lugavalidator-invalidindex accept only numbers",
			MISSING_EQUAL_TO_FIELD: "data-lugavalidator-equalto was unable to find field with id = {0}"
		},
		HANDLERS: {
			FORM_ERROR: "luga.validator.handlers.errorAlert"
		}
	};

	/**
	 * @typedef {object} luga.validator.FormValidator.options
	 *
	 * @property {jquery}  formNode      Either a jQuery object wrapping the form or the naked DOM object. Required
	 * @property {string}  error         Name of the function to be invoked to handle/display validation messages.
	 *                                   Default to luga.validator.errorAlert
	 * @property {string}  before        Name of the function to be invoked before validation is performed. Default to null
	 * @property {string}  after         Name of the function to be invoked after validation is performed. Default to null
	 * @property {boolean} blocksubmit   Disable submit buttons if the form isn't valid
	 *                                   This prevents multiple submits but also prevents the value of the submit buttons from being passed as part of the HTTP request
	 *                                   Set this options to false to keep the submit buttons enabled
	 */

	/**
	 * Form validator class
	 *
	 * @constructor
	 * @param {luga.validator.FormValidator.options} options
	 * @throws {Exception}
	 */
	luga.validator.FormValidator = function(options){
		/** @type {luga.validator.FormValidator.options} */
		this.config = {
			// Either: custom attribute, incoming option or default
			blocksubmit: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.BLOCK_SUBMIT) || "true",
			error: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR) || luga.validator.CONST.HANDLERS.FORM_ERROR,
			// Either: custom attribute, incoming option or null
			before: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.BEFORE) || null,
			after: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.AFTER) || null
		};
		luga.merge(this.config, options);
		// Hack to ensure it's a boolean
		this.config.blocksubmit = JSON.parse(this.config.blocksubmit);

		/** @type {luga.validator.FormValidator} */
		var self = this;
		/** @type {array.<luga.validator.BaseFieldValidator>} */
		self.validators = [];
		/** @type {array.<luga.validator.BaseFieldValidator>} */
		self.dirtyValidators = [];
		// Ensure it's a jQuery object
		self.config.formNode = jQuery(self.config.formNode);

		if(jQuery(self.config.formNode).length === 0){
			throw(luga.validator.CONST.MESSAGES.MISSING_FORM);
		}

		this.init = function(){
			self.validators = [];
			self.dirtyValidators = [];
			var formDom = self.config.formNode[0];
			for(var i = 0; i < formDom.elements.length; i++){
				/* istanbul ignore else */
				if(luga.form.utils.isInputField(formDom.elements[i]) === true){
					self.validators.push(luga.validator.fieldValidatorFactory.getInstance({
						fieldNode: formDom.elements[i],
						formNode: self.config.formNode
					}));
				}
			}
		};

		/**
		 * Execute all field validators. Returns an array of field validators that are in invalid state
		 * The returned array is empty if there are no errors
		 *
		 * @param   {object} event
		 * @returns {array.<luga.validator.BaseFieldValidator>}
		 */
		this.validate = function(event){
			self.init();
			self.before(event);
			// Keep track of already validated fields (to skip already validated checkboxes or radios)
			var executedValidators = {};
			for(var i = 0; i < self.validators.length; i++){
				if((self.validators[i] !== undefined) && (self.validators[i].validate !== undefined)){
					if(executedValidators[self.validators[i].name] !== undefined){
						// Already validated checkbox or radio, skip it
						continue;
					}
					if(self.validators[i].validate() === true){
						self.dirtyValidators.push(self.validators[i]);
					}
					executedValidators[self.validators[i].name] = true;
				}
			}
			if(self.isValid() === false){
				self.error();
				if(event !== undefined){
					event.preventDefault();
				}
			}
			else{
				if(this.config.blocksubmit === true){
					// Disable submit buttons to avoid multiple submits
					self.disableSubmit();
				}
				self.after(event);
			}
			return self.dirtyValidators;
		};

		this.disableSubmit = function(){
			var buttons = jQuery("input[type=submit]", self.config.formNode);
			jQuery(buttons).each(function(index, item){
				var buttonNode = jQuery(item);
				if(buttonNode.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.DISABLED_MESSAGE) !== undefined){
					buttonNode.val(buttonNode.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.DISABLED_MESSAGE));
				}
			});
		};

		/**
		 * Returns truue if the form is valid, false otherwise
		 * @returns {boolean}
		 */
		this.isValid = function(){
			return self.dirtyValidators.length === 0;
		};

		this.before = function(event){
			if(self.config.before !== null){
				var callBack = luga.lookupFunction(self.config.before);
				if(callBack !== undefined){
					callBack.apply(null, [self.config.formNode, event]);
				}
				else{
					throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.before]));
				}
			}
		};

		this.error = function(){
			var callBack = luga.lookupFunction(self.config.error);
			if(callBack !== undefined){
				callBack.apply(null, [self.config.formNode, self.dirtyValidators]);
			}
			else{
				throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.error]));
			}
		};

		this.after = function(event){
			if(self.config.after !== null){
				var callBack = luga.lookupFunction(self.config.after);
				if(callBack !== undefined){
					callBack.apply(null, [self.config.formNode, event]);
				}
				else{
					throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.after]));
				}
			}
		};

	};

	luga.namespace("luga.validator.fieldValidatorFactory");

	/**
	 * @typedef {object} luga.validator.fieldValidatorFactory.getInstance.options
	 *
	 * @property {jquery} formNode    Either a jQuery object wrapping the form or the naked DOM object
	 *                                Required in case of radio and checkboxes (that are validated as group), optional in all other cases

	 * @property {jquery} fieldNode   Either a jQuery object wrapping the field or the naked DOM object. Required
	 *
	 * Additional options can be used, but are specific to different kind of input fields.
	 * Check their implementation for details
	 */

	/**
	 * Field validator factory. Use this to instantiate a field validator without worrying about the specific implementation
	 *
	 * @param {luga.validator.fieldValidatorFactory.getInstance.options} options
	 * @returns {luga.validator.BaseFieldValidator|luga.validator.BaseGroupValidator}
	 */
	luga.validator.fieldValidatorFactory.getInstance = function(options){
		/** @type {luga.validator.fieldValidatorFactory.getInstance.options} */
		this.config = {};
		luga.merge(this.config, options);
		var self = this;
		// Abort if the field isn't suitable to validation
		if(luga.form.utils.isInputField(self.config.fieldNode) === false){
			return null;
		}
		var fieldType = jQuery(self.config.fieldNode).prop("type");
		// Get relevant validator based on field type
		switch(fieldType){

			case "select-multiple":
				return new luga.validator.SelectValidator(this.config);

			case "select-one":
				return new luga.validator.SelectValidator(this.config);

			case "radio":
				if(jQuery(this.config.fieldNode).attr("name") !== undefined){
					return new luga.validator.RadioValidator({
						inputGroup: luga.form.utils.getFieldGroup(jQuery(this.config.fieldNode).attr("name"), this.config.formNode)
					});
				}
				break;

			case "checkbox":
				if(jQuery(this.config.fieldNode).attr("name") !== undefined){
					return new luga.validator.CheckboxValidator({
						inputGroup: luga.form.utils.getFieldGroup(jQuery(this.config.fieldNode).attr("name"), this.config.formNode)
					});
				}
				break;

			default:
				return new luga.validator.TextValidator(this.config);
		}
	};

	/**
	 * @typedef {object} luga.validator.BaseFieldValidator.options
	 *
	 * @property {jquery} fieldNode      Either a jQuery object wrapping the field or the naked DOM object. Required
	 * @property {string} message        Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {string} errorclass     CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 *
	 * Additional options can be used, but are specific to different kind of input fields.
	 * Check their implementation for details
	 */

	/**
	 * Abstract field validator class. To be extended for different kind of fields
	 *
	 * @constructor
	 * @abstract
	 * @param {luga.validator.BaseFieldValidator.options} options
	 * @throws {Exception}
	 */
	luga.validator.BaseFieldValidator = function(options){

		if(this.constructor === luga.validator.BaseFieldValidator){
			throw(luga.validator.CONST.MESSAGES.BASE_VALIDATOR_ABSTRACT);
		}

		/** @type {luga.validator.BaseFieldValidator.options} */
		this.config = {
			message: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE) || "",
			errorclass: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS) || ""
		};
		luga.merge(this.config, options);

		this.node = jQuery(options.fieldNode);
		this.message = this.config.message;
		this.name = "";

		if(this.node.attr("name") !== undefined){
			this.name = this.node.attr("name");
		}
		else if(this.node.attr("id") !== undefined){
			this.name = this.node.attr("id");
		}

		/**
		 * Return true if the field is valid. False otherwise
		 * @abstract
		 * @returns {boolean}
		 */
		/* istanbul ignore next */
		this.isValid = function(){
		};

		this.flagInvalid = function(){
			this.node.addClass(this.config.errorclass);
			// Set the title attribute in order to show a tooltip
			this.node.attr("title", this.message);
		};

		this.flagValid = function(){
			this.node.removeClass(this.config.errorclass);
			this.node.removeAttr("title");
		};

		/**
		 * Be careful, this method returns a boolean but also has side-effects
		 * @returns {boolean}
		 */
		this.validate = function(){
			// Disabled fields are always valid
			if(this.node.prop("disabled") === true){
				this.flagValid();
				return false;
			}
			if(this.isValid() === false){
				this.flagInvalid();
				return true;
			}
			else{
				this.flagValid();
				return false;
			}
		};
	};

	/**
	 * @typedef {object} luga.validator.TextValidator.options
	 *
	 * @property {jquery} fieldNode               Either a jQuery object wrapping the field or the naked DOM object. Required
	 * @property {boolean|function} required      Set it to true to flag the field as required.
	 *                                            In case you need conditional validation, set it to the name of a custom function that will handle the condition.
	 *                                            Can also be set using the "data-lugavalidator-required" attribute. Optional
	 * @property {string} pattern                 Validation pattern to be applied, either built-in or custom.
	 *                                            Can also be set using the "data-lugavalidator-pattern" attribute. Optional
	 * @property {string} minlength               Enforce a minimum text length. Can also be set using the "data-lugavalidator-minlength" attribute. Optional
	 * @property {string} maxlength               Enforce a maximum text length. Can also be set using the "data-lugavalidator-maxlength" attribute. Optional
	 * @property {string} minnumber               Enforce a minimum numeric value. Can also be set using the "data-lugavalidator-minnumber" attribute. Optional
	 * @property {string} maxnumber               Enforce a maximum numeric value. Can also be set using the "data-lugavalidator-maxnumber" attribute. Optional
	 * @property {string} datepattern             Date format pattern to be applied, either built-in or custom. Can also be set using the "data-lugavalidator-datepattern" attribute. Optional
	 * @property {string} mindate                 Enforce a minimum date. Can also be set using the "data-lugavalidator-mindate" attribute. Optional
	 * @property {string} maxdate                 Enforce a maximum date. Can also be set using the "data-lugavalidator-maxdate" attribute. Optional
	 * @property {string} equalto                 Id of another field who's values will be compared for equality. Can also be set using the "data-lugavalidator-equalto" attribute. Optional
	 * @property {string} message                 Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {string} errorclass              CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Text field validator class
	 *
	 * @constructor
	 * @extends luga.validator.BaseFieldValidator
	 * @param {luga.validator.TextValidator.options} options
	 * @throws {Exception}
	 */
	luga.validator.TextValidator = function(options){

		/** @type {luga.validator.TextValidator.options} */
		this.config = {
			required: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED),
			pattern: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.PATTERN),
			minlength: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_LENGTH),
			maxlength: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_LENGTH),
			minnumber: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_NUMBER),
			maxnumber: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_NUMBER),
			datepattern: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.DATE_PATTERN) || luga.validator.CONST.DEFAULT_DATE_PATTERN,
			mindate: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_DATE),
			maxdate: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_DATE),
			equalto: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.EQUAL_TO)
		};

		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseFieldValidator, this, [this.config]);

		if(this.config.required !== undefined){
			try{
				// Hack to ensure it's a boolean
				this.config.required = JSON.parse(this.config.required);
			}
			catch(e){
				// Unable to convert into a booolean. It must be a string referencing a function
			}
		}

		/** @type {luga.validator.TextValidator} */
		var self = this;

		self.node = jQuery(options.fieldNode);
		if(self.node.length === 0){
			throw(luga.validator.CONST.MESSAGES.MISSING_FIELD);
		}
		self.type = "text";

		// Put focus and cursor inside the field
		this.getFocus = function(){
			// This try block is required to solve an obscure issue with IE and hidden fields
			try{
				self.node.focus();
				self.node.select();
			}
			catch(e){
			}
		};

		/**
		 * @returns {boolean}
		 */
		this.isEmpty = function(){
			return self.node.val() === "";
		};

		/**
		 * @returns {boolean}
		 */
		this.isRequired = function(){
			var requiredAtt = this.config.required;
			if(requiredAtt === true){
				return true;
			}
			if(requiredAtt === false){
				return false;
			}
			// It's a conditional validation. Invoke the relevant function if available
			var functionReference = luga.lookupFunction(requiredAtt);
			if(functionReference !== undefined){
				return functionReference.apply(null, [self.node]);
			}
			else{
				throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [requiredAtt]));
			}
		};

		/**
		 * Returns true if the field satisfy the rules associated with it. False otherwise
		 * Be careful, this method contains multiple exit points!!!
		 * @override
		 * @returns {boolean}
		 */
		this.isValid = function(){
			if(self.isEmpty()){
				if(self.isRequired() === true){
					return false;
				}
				else{
					return true;
				}
			}
			else{
				// It's empty. Loop over all the available rules
				for(var rule in luga.validator.rules){
					// Check if the current rule is required for the field
					if(self.node.attr(luga.validator.CONST.RULE_PREFIX + rule) !== undefined){
						// Invoke the rule
						if(luga.validator.rules[rule].apply(null, [self.node, self]) === false){
							return false;
						}
					}
				}
			}
			return true;
		};
	};

	/**
	 * @typedef {object} luga.validator.SelectValidator.options
	 *
	 * @property {jquery} fieldNode              Either a jQuery object wrapping the field or the naked DOM object. Required
	 * @property {string|number} invalidindex    Prevents selection of an entry on a given position (zero based). Can also be set using the "data-lugavalidator-invalidindex" attribute. Optional
	 * @property {string} invalidvalue           Prevents selection of an entry with a given value. Can also be set using the "data-lugavalidator-invalidvalue" attribute. Optional
	 * @property {string} message                Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {string} errorclass             CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Select field validator class
	 *
	 * @constructor
	 * @extends luga.validator.BaseFieldValidator
	 * @param {luga.validator.SelectValidator.options} options
	 * @throws {Exception}
	 */
	luga.validator.SelectValidator = function(options){

		/** @type {luga.validator.SelectValidator.options} */
		this.config = {
			invalidindex: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.INVALID_INDEX),
			invalidvalue: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.INVALID_VALUE)
		};

		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseFieldValidator, this, [this.config]);

		/** @type {luga.validator.SelectValidator} */
		var self = this;
		self.type = "select";
		self.node = jQuery(options.fieldNode);
		if(self.node.length === 0){
			throw(luga.validator.CONST.MESSAGES.MISSING_FIELD);
		}

		// Ensure invalidindex is numeric
		if((self.config.invalidindex !== undefined) && (!jQuery.isNumeric(self.config.invalidindex))){
			throw(luga.validator.CONST.MESSAGES.INVALID_INDEX_PARAMETER);
		}

		// Whenever a "size" attribute is available, the browser reports -1 as selectedIndex
		// Fix this weirdness
		var currentIndex = self.node.prop("selectedIndex");
		if(currentIndex === -1){
			currentIndex = 0;
		}
		currentIndex = parseInt(currentIndex, 10);

		/**
		 * Returns true if the field satisfy the rules associated with it. False otherwise
		 * Be careful, this method contains multiple exit points!!!
		 * @override
		 * @returns {boolean}
		 */
		this.isValid = function(){
			// Check for index
			if(currentIndex === parseInt(self.config.invalidindex, 10)){
				return false;
			}
			// Check for value
			if(self.node.val() === self.config.invalidvalue){
				return false;
			}
			// No need to care about other rules
			return true;
		};

	};

	/**
	 * @typedef {object} luga.validator.BaseGroupValidator.options
	 *
	 * @property {jquery} inputGroup      A jQuery object wrapping input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {string} message         Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {string} errorclass      CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 *
	 * Additional options can be used, but are specific to different kind of input fields.
	 * Check their implementation for details
	 */

	/**
	 * Abstract validator class for grouped fields (checkboxes, radio buttons). To be extended for different kind of fields
	 *
	 * @constructor
	 * @abstract
	 * @param {luga.validator.BaseFieldValidator.options} options
	 * @throws {Exception}
	 */
	luga.validator.BaseGroupValidator = function(options){

		if(this.constructor === luga.validator.BaseGroupValidator){
			throw(luga.validator.CONST.MESSAGES.GROUP_VALIDATOR_ABSTRACT);
		}
		/** @type {luga.validator.BaseFieldValidator.options} */
		this.config = {};
		luga.merge(this.config, options);
		this.inputGroup = this.config.inputGroup;
		this.name = jQuery(this.config.inputGroup).attr("name");
		this.message = "";
		this.errorclass = "";

		// Since fields from the same group can have conflicting attribute values, the last one win
		for(var i = 0; i < this.inputGroup.length; i++){
			var field = jQuery(this.inputGroup[i]);
			if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE) !== undefined){
				this.message = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE);
			}
			if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS) !== undefined){
				this.errorclass = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS);
			}
		}

		/**
		 * Returns true if the field group is valid. False otherwise
		 * @abstract
		 * @returns {boolean}
		 */
		/* istanbul ignore next */
		this.isValid = function(){
		};

		this.flagInvalid = function(){
			/* istanbul ignore else */
			if(this.errorclass !== ""){
				for(var i = 0; i < this.inputGroup.length; i++){
					var field = jQuery(this.inputGroup[i]);
					field.addClass(this.errorclass);
					field.attr("title", this.message);
				}
			}
		};

		this.flagValid = function(){
			if(this.errorclass !== ""){
				for(var i = 0; i < this.inputGroup.length; i++){
					var field = jQuery(this.inputGroup[i]);
					field.removeClass(this.errorclass);
					field.removeAttr("title");
				}
			}
		};

		/**
		 * Be careful, this method returns a boolean but also has side-effects
		 * @returns {boolean}
		 */
		this.validate = function(){
			if(this.isValid() === true){
				this.flagValid();
				return false;
			}
			else{
				this.flagInvalid();
				return true;
			}
		};

	};

	/**
	 * @typedef {object} luga.validator.RadioValidator.options
	 *
	 * @property {jquery} inputGroup      A jQuery object wrapping input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {string} message         Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {string} errorclass      CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Radio button group validator class
	 *
	 * @constructor
	 * @extends luga.validator.BaseGroupValidator
	 * @param {luga.validator.RadioValidator.options} options
	 *
	 */
	luga.validator.RadioValidator = function(options){
		/** @type {luga.validator.RadioValidator.options} */
		this.config = {};
		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseGroupValidator, this, [this.config]);
		this.type = "radio";

		/**
		 * Return true if the field group is required
		 * @returns {boolean}
		 */
		this.isRequired = function(){
			var requiredFlag = false;
			var fieldGroup = this.inputGroup;
			// Since fields from the same group can have conflicting attribute values, the last one win
			for(var i = 0; i < fieldGroup.length; i++){
				var field = jQuery(fieldGroup[i]);
				if(field.prop("disabled") === false){
					if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED)){
						requiredFlag = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED);
					}
				}
			}
			return requiredFlag;
		};

		/**
		 * Returns true if the field satisfy the rules associated with it. False otherwise
		 * Be careful, this method contains multiple exit points!!!
		 * @override
		 * @returns {boolean}
		 */
		this.isValid = function(){
			if(this.isRequired() === "true"){
				var fieldGroup = this.inputGroup;
				for(var i = 0; i < fieldGroup.length; i++){
					var field = jQuery(fieldGroup[i]);
					// As long as only one is checked, we are fine
					if(field.prop("checked") === true){
						return true;
					}
				}
				return false;
			}
			return true;
		};
	};

	/**
	 * @typedef {object} luga.validator.CheckboxValidator.options
	 *
	 * @property {jquery} inputGroup      A jQuery object wrapping input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {number} minchecked      Specify a minimum number of boxes that can be checked in a group. Set it to 1 to allow only one choice. Optional
	 * @property {number} maxchecked      Specify a maximum number of boxes that can be checked within a group. Optional
	 * @property {string} message         Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {string} errorclass      CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Checkboxes group validator class
	 *
	 * @constructor
	 * @extends luga.validator.BaseGroupValidator
	 * @param {luga.validator.CheckboxValidator.options} options
	 *
	 */
	luga.validator.CheckboxValidator = function(options){
		/** @type {luga.validator.CheckboxValidator.options} */
		this.config = {};
		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseGroupValidator, this, [this.config]);
		this.type = "checkbox";
		this.minchecked = 0;
		this.maxchecked = this.config.inputGroup.length;

		// Since checkboxes from the same group can have conflicting attribute values, the last one win
		for(var i = 0; i < this.inputGroup.length; i++){
			var field = jQuery(this.inputGroup[i]);
			if(field.prop("disabled") === false){
				if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_CHECKED) !== undefined){
					this.minchecked = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_CHECKED);
				}
				if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_CHECKED) !== undefined){
					this.maxchecked = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_CHECKED);
				}
			}
		}

		/**
		 * Returns true if the field satisfy the rules associated with it. False otherwise
		 * @override
		 * @returns {boolean}
		 */
		this.isValid = function(){
			var checkCounter = 0;
			var fieldGroup = this.inputGroup;
			for(var i = 0; i < fieldGroup.length; i++){
				// For each checked box, increase the counter
				var field = jQuery(this.inputGroup[i]);
				if(field.prop("disabled") === false){
					if(field.prop("checked") === true){
						checkCounter++;
					}
				}
			}
			return ((checkCounter >= this.minchecked) && (checkCounter <= this.maxchecked));
		};

	};

	/* Rules */

	luga.namespace("luga.validator.rules");

	luga.validator.rules.email = function(fieldNode, validator){
		var fieldValue = fieldNode.val();
		var containsAt = (fieldValue.indexOf("@") !== -1);
		var containDot = (fieldValue.indexOf(".") !== -1);
		if((containsAt === true) && (containDot === true)){
			return true;
		}
		return false;
	};

	/**
	 * @throws {Exception}
	 */
	luga.validator.rules.equalto = function(fieldNode, validator){
		var secondFieldNode = jQuery("#" + validator.config.equalto);
		if(secondFieldNode.length === 0){
			throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_EQUAL_TO_FIELD, [validator.config.equalto]));
		}
		return (fieldNode.val() === secondFieldNode.val());
	};

	luga.validator.rules.datepattern = function(fieldNode, validator){
		var datObj = luga.validator.dateStrToObj(fieldNode.val(), validator.config.datepattern);
		if(datObj !== null){
			return true;
		}
		return false;
	};

	luga.validator.rules.maxdate = function(fieldNode, validator){
		var pattern = validator.config.datepattern;
		var valueDate = luga.validator.dateStrToObj(fieldNode.val(), pattern);
		var maxDate = luga.validator.dateStrToObj(validator.config.maxdate, pattern);
		if((valueDate !== null) && (maxDate !== null)){
			return valueDate <= maxDate;
		}
		return false;
	};

	luga.validator.rules.mindate = function(fieldNode, validator){
		var pattern = validator.config.datepattern;
		var valueDate = luga.validator.dateStrToObj(fieldNode.val(), pattern);
		var minDate = luga.validator.dateStrToObj(validator.config.mindate, pattern);
		if((valueDate !== null) && (minDate !== null)){
			return valueDate >= minDate;
		}
		return false;
	};

	luga.validator.rules.maxlength = function(fieldNode, validator){
		if(fieldNode.val().length > validator.config.maxlength){
			return false;
		}
		return true;
	};

	luga.validator.rules.minlength = function(fieldNode, validator){
		if(fieldNode.val().length < validator.config.minlength){
			return false;
		}
		return true;
	};

	luga.validator.rules.maxnumber = function(fieldNode, validator){
		if(jQuery.isNumeric(fieldNode.val()) === false){
			return false;
		}
		if(parseFloat(fieldNode.val()) <= parseFloat(validator.config.maxnumber)){
			return true;
		}
		return false;
	};

	luga.validator.rules.minnumber = function(fieldNode, validator){
		if(jQuery.isNumeric(fieldNode.val()) === false){
			return false;
		}
		if(parseFloat(fieldNode.val()) >= parseFloat(validator.config.minnumber)){
			return true;
		}
		return false;
	};

	/**
	 * @throws {Exception}
	 */
	luga.validator.rules.pattern = function(fieldNode, validator){
		var regExpObj = luga.validator.patterns[validator.config.pattern];
		if(regExpObj !== undefined){
			return regExpObj.test(fieldNode.val());
		}
		else{
			// The pattern is missing
			throw(luga.string.format(luga.validator.CONST.MESSAGES.PATTERN_NOT_FOUND, [validator.config.pattern]));
		}
	};

	/* Patterns */

	luga.namespace("luga.validator.patterns");

	luga.validator.patterns.lettersonly = new RegExp("^[a-zA-Z]*$");
	luga.validator.patterns.alphanumeric = new RegExp("^\\w*$");
	luga.validator.patterns.integer = new RegExp("^-?[1-9][0-9]*$");
	luga.validator.patterns.positiveinteger = new RegExp("^\\d\\d*$");
	luga.validator.patterns.number = new RegExp("^-?(\\d\\d*\\.\\d*$)|(^-?\\d\\d*$)|(^-?\\.\\d\\d*$)");
	luga.validator.patterns.filepath_pdf = new RegExp("[\\w_]*\\.([pP][dD][fF])$");
	luga.validator.patterns.filepath_jpg = new RegExp("[\\w_]*\\.([jJ][pP][eE]?[gG])$");
	luga.validator.patterns.filepath_zip = new RegExp("[\\w_]*\\.([zZ][iI][pP])$");
	luga.validator.patterns.filepath = new RegExp("[\\w_]*\\.\\w{3}$");
	luga.validator.patterns.time = new RegExp("([0-1][0-9]|2[0-3]):[0-5][0-9]$");

	/* Date specifications */

	luga.namespace("luga.validator.dateSpecs");

	/**
	 * Create an object that stores date validation's info
	 *
	 * @param rex       {regexp}
	 * @param year      {number}
	 * @param month     {number}
	 * @param day       {number}
	 * @param separator {string}
	 *
	 * @returns {object}
	 */
	luga.validator.createDateSpecObj = function(rex, year, month, day, separator){
		var infoObj = {};
		infoObj.rex = new RegExp(rex);
		infoObj.y = year;
		infoObj.m = month;
		infoObj.d = day;
		infoObj.s = separator;
		return infoObj;
	};

	/**
	 * Create a Date object out of a string, based on a given date spec key
	 *
	 * @param {string}   dateStr
	 * @param {string}   dateSpecKey
	 * @returns {date|*}
	 */
	luga.validator.dateStrToObj = function(dateStr, dateSpecKey){
		var dateSpecObj = luga.validator.dateSpecs[dateSpecKey];
		if(dateSpecObj !== undefined){

			// If it doesn't matches the RegExp, abort
			if(!dateSpecObj.rex.test(dateStr)){
				return null;
			}

			// String's value matches the pattern, check if it's a valida date
			// Split the date into 3 different bits using the separator
			var dateBits = dateStr.split(dateSpecObj.s);
			// First try to create a new date out of the bits
			var testDate = new Date(dateBits[dateSpecObj.y], (dateBits[dateSpecObj.m] - 1), dateBits[dateSpecObj.d]);
			// Make sure values match after conversion
			var yearMatches = (testDate.getFullYear() === parseInt(dateBits[dateSpecObj.y], 10));
			var monthMatches = (testDate.getMonth() === parseInt(dateBits[dateSpecObj.m] - 1, 10));
			var dayMatches = (testDate.getDate() === parseInt(dateBits[dateSpecObj.d], 10));
			if((yearMatches === true) && (monthMatches === true) && (dayMatches === true)){
				return testDate;
			}
			return null;
		}
		return null;
	};

	luga.validator.dateSpecs["YYYY-MM-DD"] = luga.validator.createDateSpecObj("^([0-9]{4})-([0-1][0-9])-([0-3][0-9])$", 0, 1, 2, "-");
	luga.validator.dateSpecs["YYYY-M-D"] = luga.validator.createDateSpecObj("^([0-9]{4})-([0-1]?[0-9])-([0-3]?[0-9])$", 0, 1, 2, "-");
	luga.validator.dateSpecs["MM.DD.YYYY"] = luga.validator.createDateSpecObj("^([0-1][0-9]).([0-3][0-9]).([0-9]{4})$", 2, 0, 1, ".");
	luga.validator.dateSpecs["M.D.YYYY"] = luga.validator.createDateSpecObj("^([0-1]?[0-9]).([0-3]?[0-9]).([0-9]{4})$", 2, 0, 1, ".");
	luga.validator.dateSpecs["MM/DD/YYYY"] = luga.validator.createDateSpecObj("^([0-1][0-9])\/([0-3][0-9])\/([0-9]{4})$", 2, 0, 1, "/");
	luga.validator.dateSpecs["M/D/YYYY"] = luga.validator.createDateSpecObj("^([0-1]?[0-9])\/([0-3]?[0-9])\/([0-9]{4})$", 2, 0, 1, "/");
	luga.validator.dateSpecs["MM-DD-YYYY"] = luga.validator.createDateSpecObj("^([0-21][0-9])-([0-3][0-9])-([0-9]{4})$", 2, 0, 1, "-");
	luga.validator.dateSpecs["M-D-YYYY"] = luga.validator.createDateSpecObj("^([0-1]?[0-9])-([0-3]?[0-9])-([0-9]{4})$", 2, 0, 1, "-");
	luga.validator.dateSpecs["DD.MM.YYYY"] = luga.validator.createDateSpecObj("^([0-3][0-9]).([0-1][0-9]).([0-9]{4})$", 2, 1, 0, ".");
	luga.validator.dateSpecs["D.M.YYYY"] = luga.validator.createDateSpecObj("^([0-3]?[0-9]).([0-1]?[0-9]).([0-9]{4})$", 2, 1, 0, ".");
	luga.validator.dateSpecs["DD/MM/YYYY"] = luga.validator.createDateSpecObj("^([0-3][0-9])\/([0-1][0-9])\/([0-9]{4})$", 2, 1, 0, "/");
	luga.validator.dateSpecs["D/M/YYYY"] = luga.validator.createDateSpecObj("^([0-3]?[0-9])\/([0-1]?[0-9])\/([0-9]{4})$", 2, 1, 0, "/");
	luga.validator.dateSpecs["DD-MM-YYYY"] = luga.validator.createDateSpecObj("^([0-3][0-9])-([0-1][0-9])-([0-9]{4})$", 2, 1, 0, "-");
	luga.validator.dateSpecs["D-M-YYYY"] = luga.validator.createDateSpecObj("^([0-3]?[0-9])-([0-1]?[0-9])-([0-9]{4})$", 2, 1, 0, "-");

	/**
	 * Attach form validators to any suitable form inside the document
	 * @param {jquery|undefined} rootNode  Optional, default to jQuery("body")
	 */
	luga.validator.initForms = function(rootNode){
		if(rootNode === undefined){
			rootNode = jQuery("body");
		}
		rootNode.find(luga.validator.CONST.FORM_SELECTOR).each(function(index, item){
			var formNode = jQuery(item);
			/* istanbul ignore else */
			if(formNode.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.VALIDATE) === "true"){
				formNode.submit(function(event){
					var formValidator = new luga.validator.FormValidator({
						formNode: formNode
					});
					formValidator.validate(event);
				});
			}
		});
	};

	/* API */

	luga.namespace("luga.validator.api");

	/**
	 * @typedef {object} luga.validator.api.validateForm.options
	 *
	 * @property {jquery} formNode       Either a jQuery object wrapping the form or the naked DOM object. Required
	 * @property {function} error        Name of the function to be invoked to handle/display validation messages.
	 *                                   Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate a form
	 * @param {luga.validator.api.validateForm.options}
	 * @returns {boolean}
	 */
	luga.validator.api.validateForm = function(options){
		var formValidator = new luga.validator.FormValidator(options);
		formValidator.validate();
		return formValidator.isValid();
	};

	/**
	 * @typedef {object} luga.validator.api.validateField.options
	 *
	 * @property {jquery} fieldNode      Either a jQuery object wrapping the field or the naked DOM object. Required
	 * @property {function} error        Function to be invoked to handle/display validation messages.
	 *                                   Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate a field
	 * @param {luga.validator.api.validateField.options}
	 * @returns {boolean}
	 * @throws {Exception}
	 */
	luga.validator.api.validateField = function(options){
		if(luga.form.utils.isInputField(options.fieldNode) === false){
			throw(luga.validator.CONST.MESSAGES.FIELD_CANT_BE_VALIDATED);
		}
		/* istanbul ignore else */
		if(options.error === undefined){
			options.error = luga.validator.CONST.HANDLERS.FORM_ERROR;
		}
		var dirtyValidators = [];
		var fieldValidator = new luga.validator.fieldValidatorFactory.getInstance(options);
		fieldValidator.validate(null);
		if(fieldValidator.isValid() !== true){
			var callBack = luga.lookupFunction(options.error);
			dirtyValidators.push(fieldValidator);
			callBack(options.fieldNode, dirtyValidators);
		}
		return fieldValidator.isValid();
	};

	/**
	 * @typedef {object} luga.validator.api.validateField.options
	 *
	 * @property {jquery} fields      A jQuery object wrapping the collection of fields. Required
	 * @property {function} error     Function to be invoked to handle/display validation messages.
	 *                                Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate a collection of fields
	 * @param {luga.validator.api.validateFields.options}
	 * @returns {boolean}
	 */
	luga.validator.api.validateFields = function(options){
		/* istanbul ignore else */
		if(!options.error){
			options.error = luga.validator.CONST.HANDLERS.FORM_ERROR;
		}
		var validators = [];
		var executedValidators = {};
		var dirtyValidators = [];

		for(var i = 0; i < options.fields.length; i++){
			/* istanbul ignore else */
			if(luga.form.utils.isInputField(options.fields[i]) === true){
				validators.push(luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: options.fields[i]
				}));
			}
		}
		for(var j = 0; j < validators.length; j++){
			/* istanbul ignore else */
			if(validators[j] && validators[j].validate){
				if(executedValidators[validators[j].name] !== undefined){
					// Already validated checkbox or radio, skip it
					continue;
				}
				if(validators[j].validate() === true){
					dirtyValidators.push(validators[j]);
				}
				executedValidators[validators[j].name] = true;
			}
		}
		if(dirtyValidators.length > 0){
			var callBack = luga.lookupFunction(options.error);
			callBack.apply(null, [options.formNode, dirtyValidators]);
		}
		return dirtyValidators.length === 0;
	};

	/**
	 * @typedef {object} luga.validator.api.validateFields.options
	 *
	 * @property {jquery} rootNode    A jQuery object wrapping the root node. Required
	 * @property {function} error     Function to be invoked to handle/display validation messages.
	 *                                Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate all fields contained inside a given node
	 * @param {luga.validator.api.validateFields.options}
	 * @returns {boolean}
	 */
	luga.validator.api.validateChildFields = function(options){
		var fields = luga.form.utils.getChildFields(options.rootNode);
		return luga.validator.api.validateFields({
			fields: fields,
			error: options.error
		});
	};

	jQuery(document).ready(function(){
		luga.validator.initForms();
	});

}());