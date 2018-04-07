/* globals alert */

/* istanbul ignore if */
if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Common");
}

(function(){
	"use strict";

	/**
	 * Helper function
	 * @param {*} input
	 * @returns {Boolean}
	 */
	const isNumeric = function(input){
		return (isNaN(parseFloat(input)) === false) && (isFinite(input) === true);
	};

	luga.namespace("luga.validator");

	/* Validation handlers */

	luga.namespace("luga.validator.handlers");

	/**
	 * Display error messages inside alert
	 *
	 * @param {HTMLElement}                                 formNode      DOM node
	 * @param {Array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
	 */
	luga.validator.handlers.errorAlert = function(formNode, validators){
		let errorMsg = "";
		let focusGiven = false;
		for(let i = 0; i < validators.length; i++){
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
	 * @param {HTMLElement}                                 formNode      DOM node
	 * @param {Array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
	 */
	luga.validator.handlers.errorBox = function(formNode, validators){
		// Clean-up any existing box
		if(validators.length === 0){
			luga.validator.utils.removeDisplayBox(formNode);
			return;
		}
		let focusGiven = false;
		let htmlStr = "<ul>";
		// Create a <ul> for each error
		for(let i = 0; i < validators.length; i++){
			htmlStr += "<li><em>" + validators[i].name + ": </em> " + validators[i].message + "</li>";
			// Give focus to the first invalid text field
			if((focusGiven === false) && (validators[i].getFocus)){
				validators[i].getFocus();
				focusGiven = true;
			}
		}
		htmlStr += "</ul>";
		luga.validator.utils.displayErrorMessage(formNode, htmlStr);
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
	 * @typedef {Object} luga.validator.FormValidator.options
	 *
	 * @property {HTMLElement}  formNode      DOM node. Required
	 * @property {String}  error         Name of the function to be invoked to handle/display validation messages.
	 *                                   Default to luga.validator.errorAlert
	 * @property {String}  before        Name of the function to be invoked before validation is performed. Default to null
	 * @property {String}  after         Name of the function to be invoked after validation is performed. Default to null
	 * @property {Boolean} blocksubmit   Disable submit buttons if the form isn't valid
	 *                                   This prevents multiple submits but also prevents the value of the submit buttons from being passed as part of the HTTP request
	 *                                   Set this options to false to keep the submit buttons enabled
	 */

	/**
	 * Form validator class
	 *
	 * @constructor
	 * @param {luga.validator.FormValidator.options} options
	 * @throw {Exception}
	 */
	luga.validator.FormValidator = function(options){

		if(options.formNode === null){
			throw(luga.validator.CONST.MESSAGES.MISSING_FORM);
		}

		/** @type {luga.validator.FormValidator.options} */
		this.config = {
			// Either: custom attribute, incoming option or default
			blocksubmit: options.formNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.BLOCK_SUBMIT) || "true",
			error: options.formNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR) || luga.validator.CONST.HANDLERS.FORM_ERROR,
			// Either: custom attribute, incoming option or null
			before: options.formNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.BEFORE) || null,
			after: options.formNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.AFTER) || null
		};
		luga.merge(this.config, options);
		// Hack to ensure it's a boolean
		this.config.blocksubmit = JSON.parse(this.config.blocksubmit);

		/** @type {luga.validator.FormValidator} */
		const self = this;
		/** @type {Array.<luga.validator.BaseFieldValidator>} */
		self.validators = [];
		/** @type {Array.<luga.validator.BaseFieldValidator>} */
		self.dirtyValidators = [];

		this.init = function(){
			self.validators = [];
			self.dirtyValidators = [];
			const formDom = self.config.formNode;
			for(let i = 0; i < formDom.elements.length; i++){
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
		 * @param   {Event} event
		 * @return {Array.<luga.validator.BaseFieldValidator>}
		 */
		this.validate = function(event){
			self.init();
			self.before(self.config.formNode, event);
			// Keep track of already validated fields (to skip already validated checkboxes or radios)
			const executedValidators = {};
			for(let i = 0; i < self.validators.length; i++){
				/* istanbul ignore else */
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
				self.after(self.config.formNode, event);
			}
			return self.dirtyValidators;
		};

		this.disableSubmit = function(){
			const buttons = self.config.formNode.querySelectorAll("input[type=submit]");
			for(let i = 0; i < buttons.length; i++){
				const buttonNode = buttons[i];
				if(buttonNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.DISABLED_MESSAGE) !== null){
					buttonNode.value = buttonNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.DISABLED_MESSAGE);
				}
			}
		};

		/**
		 * Returns truue if the form is valid, false otherwise
		 * @return {Boolean}
		 */
		this.isValid = function(){
			return self.dirtyValidators.length === 0;
		};

		this.before = function(formNode, event){
			if(self.config.before !== null){
				const callBack = luga.lookupFunction(self.config.before);
				if(callBack !== undefined){
					callBack.apply(null, [self.config.formNode, event]);
				}
				else{
					throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.before]));
				}
			}
		};

		this.error = function(){
			const callBack = luga.lookupFunction(self.config.error);
			if(callBack !== undefined){
				callBack.apply(null, [self.config.formNode, self.dirtyValidators]);
			}
			else{
				throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.error]));
			}
		};

		this.after = function(formNode, event){
			if(self.config.after !== null){
				const callBack = luga.lookupFunction(self.config.after);
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
	 * @typedef {Object} luga.validator.fieldValidatorFactory.getInstance.options
	 *
	 * @property {HTMLElement|undefined} formNode    The form DOM object
	 *                                               Required in case of radio and checkboxes (that are validated as group), optional in all other cases

	 * @property {HTMLElement} fieldNode             The field DOM object. Required
	 *
	 * Additional options can be used, but are specific to different kind of input fields.
	 * Check their implementation for details
	 */

	/**
	 * Field validator factory. Use this to instantiate a field validator without worrying about the specific implementation
	 *
	 * @param {luga.validator.fieldValidatorFactory.getInstance.options} options
	 * @return {luga.validator.BaseFieldValidator|luga.validator.BaseGroupValidator}
	 */
	luga.validator.fieldValidatorFactory.getInstance = function(options){
		/** @type {luga.validator.fieldValidatorFactory.getInstance.options} */
		this.config = {};
		luga.merge(this.config, options);
		const self = this;
		// Abort if the field isn't suitable to validation
		if(luga.form.utils.isInputField(self.config.fieldNode) === false){
			return null;
		}
		const fieldType = this.config.fieldNode.type;
		// Get relevant validator based on field type
		switch(fieldType){

			case "select-multiple":
				return new luga.validator.SelectValidator(this.config);

			case "select-one":
				return new luga.validator.SelectValidator(this.config);

			case "radio":
				return new luga.validator.RadioValidator({
					inputGroup: luga.form.utils.getFieldGroup(this.config.fieldNode.name, this.config.formNode)
				});

			case "checkbox":
				return new luga.validator.CheckboxValidator({
					inputGroup: luga.form.utils.getFieldGroup(this.config.fieldNode.name, this.config.formNode)
				});

			default:
				return new luga.validator.TextValidator(this.config);
		}
	};

	/**
	 * @typedef {Object} luga.validator.BaseFieldValidator.options
	 *
	 * @property {HTMLElement} fieldNode    Field DOM object. Required
	 * @property {String} message           Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass        CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
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
	 * @throw {Exception}
	 */
	luga.validator.BaseFieldValidator = function(options){

		if(this.constructor === luga.validator.BaseFieldValidator){
			throw(luga.validator.CONST.MESSAGES.BASE_VALIDATOR_ABSTRACT);
		}

		/** @type {luga.validator.BaseFieldValidator.options} */
		this.config = {
			message: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE) || "",
			errorclass: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS) || ""
		};
		luga.merge(this.config, options);

		this.node = options.fieldNode;
		this.message = this.config.message;
		this.name = "";

		if(this.node.getAttribute("name") !== null){
			this.name = this.node.getAttribute("name");
		}
		else if(this.node.getAttribute("id") !== null){
			this.name = this.node.getAttribute("id");
		}

		/**
		 * Return true if the field is valid. False otherwise
		 * @abstract
		 * @return {Boolean}
		 */
		/* istanbul ignore next */
		this.isValid = function(){
		};

		this.flagInvalid = function(){
			this.node.classList.add(this.config.errorclass);
			// Set the title attribute in order to show a tooltip
			this.node.setAttribute("title", this.message);
		};

		this.flagValid = function(){
			if(this.config.errorclass !== ""){
				this.node.classList.remove(this.config.errorclass);
			}
			this.node.removeAttribute("title");
		};

		/**
		 * Be careful, this method returns a boolean but also has side-effects
		 * @return {Boolean}
		 */
		this.validate = function(){
			// Disabled fields are always valid
			if(this.node.disabled === true){
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
	 * @typedef {Object} luga.validator.TextValidator.options
	 *
	 * @property {HTMLElement} fieldNode          DOM object. Required
	 * @property {boolean|function} required      Set it to true to flag the field as required.
	 *                                            In case you need conditional validation, set it to the name of a custom function that will handle the condition.
	 *                                            Can also be set using the "data-lugavalidator-required" attribute. Optional
	 * @property {String} pattern                 Validation pattern to be applied, either built-in or custom.
	 *                                            Can also be set using the "data-lugavalidator-pattern" attribute. Optional
	 * @property {String} minlength               Enforce a minimum text length. Can also be set using the "data-lugavalidator-minlength" attribute. Optional
	 * @property {String} maxlength               Enforce a maximum text length. Can also be set using the "data-lugavalidator-maxlength" attribute. Optional
	 * @property {String} minnumber               Enforce a minimum numeric value. Can also be set using the "data-lugavalidator-minnumber" attribute. Optional
	 * @property {String} maxnumber               Enforce a maximum numeric value. Can also be set using the "data-lugavalidator-maxnumber" attribute. Optional
	 * @property {String} datepattern             Date format pattern to be applied, either built-in or custom. Can also be set using the "data-lugavalidator-datepattern" attribute. Optional
	 * @property {String} mindate                 Enforce a minimum date. Can also be set using the "data-lugavalidator-mindate" attribute. Optional
	 * @property {String} maxdate                 Enforce a maximum date. Can also be set using the "data-lugavalidator-maxdate" attribute. Optional
	 * @property {String} equalto                 Id of another field who's values will be compared for equality. Can also be set using the "data-lugavalidator-equalto" attribute. Optional
	 * @property {String} message                 Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass              CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Text field validator class
	 *
	 * @constructor
	 * @extend luga.validator.BaseFieldValidator
	 * @param {luga.validator.TextValidator.options} options
	 * @throw {Exception}
	 */
	luga.validator.TextValidator = function(options){

		if(options.fieldNode === null){
			throw(luga.validator.CONST.MESSAGES.MISSING_FIELD);
		}

		/** @type {luga.validator.TextValidator.options} */
		this.config = {
			required: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED),
			pattern: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.PATTERN),
			minlength: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_LENGTH),
			maxlength: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_LENGTH),
			minnumber: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_NUMBER),
			maxnumber: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_NUMBER),
			datepattern: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.DATE_PATTERN) || luga.validator.CONST.DEFAULT_DATE_PATTERN,
			mindate: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_DATE),
			maxdate: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_DATE),
			equalto: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.EQUAL_TO)
		};

		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseFieldValidator, this, [this.config]);

		/* istanbul ignore else */
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
		const self = this;

		self.node = options.fieldNode;
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
		 * @return {Boolean}
		 */
		this.isEmpty = function(){
			return self.node.value === "";
		};

		/**
		 * @return {Boolean}
		 */
		this.isRequired = function(){
			const requiredAtt = this.config.required;
			if(requiredAtt === true){
				return true;
			}
			if(requiredAtt === false){
				return false;
			}
			// It's a conditional validation. Invoke the relevant function if available
			const functionReference = luga.lookupFunction(requiredAtt);
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
		 * @return {Boolean}
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
				for(let rule in luga.validator.rules){
					// Check if the current rule is required for the field
					if(self.node.getAttribute(luga.validator.CONST.RULE_PREFIX + rule) !== null){
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
	 * @typedef {Object} luga.validator.SelectValidator.options
	 *
	 * @property {HTMLElement} fieldNode         DOM object. Required
	 * @property {String|number} invalidindex    Prevents selection of an entry on a given position (zero based). Can also be set using the "data-lugavalidator-invalidindex" attribute. Optional
	 * @property {String} invalidvalue           Prevents selection of an entry with a given value. Can also be set using the "data-lugavalidator-invalidvalue" attribute. Optional
	 * @property {String} message                Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass             CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Select field validator class
	 *
	 * @constructor
	 * @extend luga.validator.BaseFieldValidator
	 * @param {luga.validator.SelectValidator.options} options
	 * @throw {Exception}
	 */
	luga.validator.SelectValidator = function(options){

		if(options.fieldNode === null){
			throw(luga.validator.CONST.MESSAGES.MISSING_FIELD);
		}

		/** @type {luga.validator.SelectValidator.options} */
		this.config = {
			invalidindex: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.INVALID_INDEX),
			invalidvalue: options.fieldNode.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.INVALID_VALUE)
		};

		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseFieldValidator, this, [this.config]);

		/** @type {luga.validator.SelectValidator} */
		const self = this;
		self.type = "select";
		self.node = options.fieldNode;

		// Ensure invalidindex is numeric
		if((self.config.invalidindex !== null) && (isNumeric(self.config.invalidindex) === false)){
			throw(luga.validator.CONST.MESSAGES.INVALID_INDEX_PARAMETER);
		}

		// Whenever a "size" attribute is available, the browser reports -1 as selectedIndex
		// Fix this weirdness
		let currentIndex = self.node.selectedIndex;
		if(currentIndex === -1){
			currentIndex = 0;
		}
		currentIndex = parseInt(currentIndex, 10);

		/**
		 * Returns true if the field satisfy the rules associated with it. False otherwise
		 * Be careful, this method contains multiple exit points!!!
		 * @override
		 * @return {Boolean}
		 */
		this.isValid = function(){
			// Check for index
			if(currentIndex === parseInt(self.config.invalidindex, 10)){
				return false;
			}
			// Check for value
			if(self.node.value === self.config.invalidvalue){
				return false;
			}
			// No need to care about other rules
			return true;
		};

	};

	/**
	 * @typedef {Object} luga.validator.BaseGroupValidator.options
	 *
	 * @property @property {Array.<HTMLElement>} inputGroup      An array of DOM nodes that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {String} message                                Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass                             CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
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
	 * @throw {Exception}
	 */
	luga.validator.BaseGroupValidator = function(options){

		if(this.constructor === luga.validator.BaseGroupValidator){
			throw(luga.validator.CONST.MESSAGES.GROUP_VALIDATOR_ABSTRACT);
		}
		/** @type {luga.validator.BaseFieldValidator.options} */
		this.config = {};
		luga.merge(this.config, options);
		this.inputGroup = this.config.inputGroup;

		if(this.config.inputGroup.length > 0 && this.config.inputGroup[0].getAttribute("name") !== null){
			// Get the name of the first node
			this.name = this.config.inputGroup[0].getAttribute("name");
		}

		this.message = "";
		this.errorclass = "";

		// Since fields from the same group can have conflicting attribute values, the last one win
		for(let i = 0; i < this.inputGroup.length; i++){
			const field = this.inputGroup[i];
			if(field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE) !== null){
				this.message = field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE);
			}
			if(field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS) !== null){
				this.errorclass = field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS);
			}
		}

		/**
		 * Returns true if the field group is valid. False otherwise
		 * @abstract
		 * @return {Boolean}
		 */
		/* istanbul ignore next */
		this.isValid = function(){
		};

		this.flagInvalid = function(){
			/* istanbul ignore else */
			if(this.errorclass !== ""){
				for(let i = 0; i < this.inputGroup.length; i++){
					const field = this.inputGroup[i];
					field.classList.add(this.errorclass);
					field.setAttribute("title", this.message);
				}
			}
		};

		this.flagValid = function(){
			if(this.errorclass !== ""){
				for(let i = 0; i < this.inputGroup.length; i++){
					const field = this.inputGroup[i];
					field.classList.remove(this.errorclass);
					field.removeAttribute("title");
				}
			}
		};

		/**
		 * Be careful, this method returns a boolean but also has side-effects
		 * @return {Boolean}
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
	 * @typedef {Object} luga.validator.RadioValidator.options
	 *
	 * @property {Array.<HTMLElement>} inputGroup      An array of DOM nodes that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {String} message                      Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass                   CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Radio button group validator class
	 *
	 * @constructor
	 * @extend luga.validator.BaseGroupValidator
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
		 * @return {Boolean}
		 */
		this.isRequired = function(){
			let requiredFlag = false;
			const fieldGroup = this.inputGroup;
			// Since fields from the same group can have conflicting attribute values, the last one win
			for(let i = 0; i < fieldGroup.length; i++){
				const field = fieldGroup[i];
				if(field.disabled === false){
					if(field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED) !== null){
						requiredFlag = field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.REQUIRED);
					}
				}
			}
			return requiredFlag;
		};

		/**
		 * Returns true if the field satisfy the rules associated with it. False otherwise
		 * Be careful, this method contains multiple exit points!!!
		 * @override
		 * @return {Boolean}
		 */
		this.isValid = function(){
			if(this.isRequired() === "true"){
				const fieldGroup = this.inputGroup;
				for(let i = 0; i < fieldGroup.length; i++){
					const field = fieldGroup[i];
					// As long as only one is checked, we are fine
					if(field.checked === true){
						return true;
					}
				}
				return false;
			}
			return true;
		};
	};

	/**
	 * @typedef {Object} luga.validator.CheckboxValidator.options
	 *
	 * @property @property {Array.<HTMLElement>} inputGroup      An array of DOM nodes that share the same name.  Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {Number} minchecked                             Specify a minimum number of boxes that can be checked in a group. Set it to 1 to allow only one choice. Optional
	 * @property {Number} maxchecked                             Specify a maximum number of boxes that can be checked within a group. Optional
	 * @property {String} message                                Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass                             CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 */

	/**
	 * Checkboxes group validator class
	 *
	 * @constructor
	 * @extend luga.validator.BaseGroupValidator
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
		for(let i = 0; i < this.inputGroup.length; i++){
			const field = this.inputGroup[i];
			if(field.disabled === false){
				if(field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_CHECKED) !== null){
					this.minchecked = field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_CHECKED);
				}
				if(field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_CHECKED) !== null){
					this.maxchecked = field.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_CHECKED);
				}
			}
		}

		/**
		 * Returns true if the field satisfy the rules associated with it. False otherwise
		 * @override
		 * @return {Boolean}
		 */
		this.isValid = function(){
			let checkCounter = 0;
			const fieldGroup = this.inputGroup;
			for(let i = 0; i < fieldGroup.length; i++){
				// For each checked box, increase the counter
				const field = this.inputGroup[i];
				if(field.disabled === false){
					if(field.checked === true){
						checkCounter++;
					}
				}
			}
			return ((checkCounter >= this.minchecked) && (checkCounter <= this.maxchecked));
		};

	};

	/* Rules */

	luga.namespace("luga.validator.rules");

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.email = function(fieldNode, validator){
		const fieldValue = fieldNode.value;
		const containsAt = (fieldValue.indexOf("@") !== -1);
		const containDot = (fieldValue.indexOf(".") !== -1);
		if((containsAt === true) && (containDot === true)){
			return true;
		}
		return false;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 * @throw {Exception}
	 */
	luga.validator.rules.equalto = function(fieldNode, validator){
		const secondFieldNode = document.getElementById(validator.config.equalto);
		if(secondFieldNode === null){
			throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_EQUAL_TO_FIELD, [validator.config.equalto]));
		}
		return (fieldNode.value === secondFieldNode.value);
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.datepattern = function(fieldNode, validator){
		const datObj = luga.validator.dateStrToObj(fieldNode.value, validator.config.datepattern);
		if(datObj !== null){
			return true;
		}
		return false;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.maxdate = function(fieldNode, validator){
		const pattern = validator.config.datepattern;
		const valueDate = luga.validator.dateStrToObj(fieldNode.value, pattern);
		const maxDate = luga.validator.dateStrToObj(validator.config.maxdate, pattern);
		if((valueDate !== null) && (maxDate !== null)){
			return valueDate <= maxDate;
		}
		return false;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.mindate = function(fieldNode, validator){
		const pattern = validator.config.datepattern;
		const valueDate = luga.validator.dateStrToObj(fieldNode.value, pattern);
		const minDate = luga.validator.dateStrToObj(validator.config.mindate, pattern);
		if((valueDate !== null) && (minDate !== null)){
			return valueDate >= minDate;
		}
		return false;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.maxlength = function(fieldNode, validator){
		if(fieldNode.value.length > validator.config.maxlength){
			return false;
		}
		return true;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.minlength = function(fieldNode, validator){
		if(fieldNode.value.length < validator.config.minlength){
			return false;
		}
		return true;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.maxnumber = function(fieldNode, validator){
		if(isNumeric(fieldNode.value) === false){
			return false;
		}
		if(parseFloat(fieldNode.value) <= parseFloat(validator.config.maxnumber)){
			return true;
		}
		return false;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.minnumber = function(fieldNode, validator){
		if(isNumeric(fieldNode.value) === false){
			return false;
		}
		if(parseFloat(fieldNode.value) >= parseFloat(validator.config.minnumber)){
			return true;
		}
		return false;
	};

	/**
	 * @param {HTMLElement} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 * @throw {Exception}
	 */
	luga.validator.rules.pattern = function(fieldNode, validator){
		const regExpObj = luga.validator.patterns[validator.config.pattern];
		if(regExpObj !== undefined){
			return regExpObj.test(fieldNode.value);
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
	 * @param {regexp} rex
	 * @param {Number} year
	 * @param {Number} month
	 * @param {Number} day
	 * @param {String} separator
	 *
	 * @return {Object}
	 */
	luga.validator.createDateSpecObj = function(rex, year, month, day, separator){
		const infoObj = {};
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
	 * @param {String}   dateStr
	 * @param {String}   dateSpecKey
	 * @return {date|*}
	 */
	luga.validator.dateStrToObj = function(dateStr, dateSpecKey){
		const dateSpecObj = luga.validator.dateSpecs[dateSpecKey];
		if(dateSpecObj !== undefined){

			// If it doesn't matches the RegExp, abort
			if(!dateSpecObj.rex.test(dateStr)){
				return null;
			}

			// String's value matches the pattern, check if it's a valida date
			// Split the date into 3 different bits using the separator
			const dateBits = dateStr.split(dateSpecObj.s);
			// First try to create a new date out of the bits
			const testDate = new Date(dateBits[dateSpecObj.y], (dateBits[dateSpecObj.m] - 1), dateBits[dateSpecObj.d]);
			// Make sure values match after conversion
			const yearMatches = (testDate.getFullYear() === parseInt(dateBits[dateSpecObj.y], 10));
			const monthMatches = (testDate.getMonth() === parseInt(dateBits[dateSpecObj.m] - 1, 10));
			const dayMatches = (testDate.getDate() === parseInt(dateBits[dateSpecObj.d], 10));
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
	luga.validator.dateSpecs["MM/DD/YYYY"] = luga.validator.createDateSpecObj("^([0-1][0-9])/([0-3][0-9])/([0-9]{4})$", 2, 0, 1, "/");
	luga.validator.dateSpecs["M/D/YYYY"] = luga.validator.createDateSpecObj("^([0-1]?[0-9])/([0-3]?[0-9])/([0-9]{4})$", 2, 0, 1, "/");
	luga.validator.dateSpecs["MM-DD-YYYY"] = luga.validator.createDateSpecObj("^([0-21][0-9])-([0-3][0-9])-([0-9]{4})$", 2, 0, 1, "-");
	luga.validator.dateSpecs["M-D-YYYY"] = luga.validator.createDateSpecObj("^([0-1]?[0-9])-([0-3]?[0-9])-([0-9]{4})$", 2, 0, 1, "-");
	luga.validator.dateSpecs["DD.MM.YYYY"] = luga.validator.createDateSpecObj("^([0-3][0-9]).([0-1][0-9]).([0-9]{4})$", 2, 1, 0, ".");
	luga.validator.dateSpecs["D.M.YYYY"] = luga.validator.createDateSpecObj("^([0-3]?[0-9]).([0-1]?[0-9]).([0-9]{4})$", 2, 1, 0, ".");
	luga.validator.dateSpecs["DD/MM/YYYY"] = luga.validator.createDateSpecObj("^([0-3][0-9])/([0-1][0-9])/([0-9]{4})$", 2, 1, 0, "/");
	luga.validator.dateSpecs["D/M/YYYY"] = luga.validator.createDateSpecObj("^([0-3]?[0-9])/([0-1]?[0-9])/([0-9]{4})$", 2, 1, 0, "/");
	luga.validator.dateSpecs["DD-MM-YYYY"] = luga.validator.createDateSpecObj("^([0-3][0-9])-([0-1][0-9])-([0-9]{4})$", 2, 1, 0, "-");
	luga.validator.dateSpecs["D-M-YYYY"] = luga.validator.createDateSpecObj("^([0-3]?[0-9])-([0-1]?[0-9])-([0-9]{4})$", 2, 1, 0, "-");

	/**
	 * Attach form validators to any suitable form inside the given DOM node
	 * @param {HTMLElement} [rootNode]  Optional, default to document.body
	 */
	luga.validator.initForms = function(rootNode){
		if(rootNode === undefined){
			rootNode = document.body;
		}
		const nodes = rootNode.querySelectorAll(luga.validator.CONST.FORM_SELECTOR);
		for(let i = 0; i < nodes.length; i++){
			const element = nodes[i];
			/* istanbul ignore else */
			if(element.getAttribute(luga.validator.CONST.CUSTOM_ATTRIBUTES.VALIDATE) === "true"){
				element.addEventListener("submit", function(event){
					const formValidator = new luga.validator.FormValidator({
						formNode: element
					});
					formValidator.validate(event);
				}, false);
			}
		}
	};

	luga.namespace("luga.validator.utils");

	luga.validator.utils.CONST = {
		CSS_CLASSES: {
			MESSAGE: "luga-message",
			ERROR_MESSAGE: "luga-error-message"
		},
		MSG_BOX_ID: "lugaMessageBox"
	};

	/**
	 * Private helper function
	 * Generate node's id
	 * @param {HTMLElement} node
	 * @return {String}
	 */
	const generateBoxId = function(node){
		let boxId = luga.validator.utils.CONST.MSG_BOX_ID;
		/* istanbul ignore else */
		if(node !== undefined){
			if(node.getAttribute("id") === null){
				boxId += node.getAttribute("id");
			}
			else if(node.getAttribute("name") !== null){
				boxId += node.getAttribute("name");
			}
		}
		return boxId;
	};

	/**
	 * Remove a message box (if any) associated with a given node
	 * @param {HTMLElement}  node   Target node
	 */
	luga.validator.utils.removeDisplayBox = function(node){
		const boxId = generateBoxId(node);
		const oldBox = document.getElementById(boxId);
		// If an error display is already there, get rid of it
		/* istanbul ignore else */
		if(oldBox !== null){
			oldBox.outerHTML = "";
		}
	};

	/**
	 * Display a message box above a given node
	 * @param {HTMLElement}  node   Target node
	 * @param {String}       html   HTML/Text code to inject
	 * @return {HTMLElement}
	 */
	luga.validator.utils.displayMessage = function(node, html){
		return luga.validator.utils.displayBox(node, html, luga.validator.utils.CONST.CSS_CLASSES.MESSAGE);
	};

	/**
	 * Display an error box above a given node
	 * @param {HTMLElement}  node   Target node
	 * @param {String}       html   HTML/Text code to inject
	 * @return {HTMLElement}
	 */
	luga.validator.utils.displayErrorMessage = function(node, html){
		return luga.validator.utils.displayBox(node, html, luga.validator.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
	};

	/**
	 * Display a box with a message associated with a given node
	 * Overwrite this method if you want to change the way luga.validator.utils.displayMessage and luga.validator.utils.displayErrorMessage behaves
	 * @param {HTMLElement}  node                  Target node
	 * @param {String}  html                       HTML/Text code to inject
	 * @param {String}  [cssClass="luga_message"]  CSS class attached to the box. Default to "luga_message"
	 * @return {HTMLElement}
	 */
	luga.validator.utils.displayBox = function(node, html, cssClass){
		if(node === undefined){
			return;
		}
		if(cssClass === undefined){
			cssClass = luga.validator.utils.CONST.CSS_CLASSES.MESSAGE;
		}
		const boxId = generateBoxId(node);
		const box = document.createElement("div");
		box.setAttribute("id", boxId);
		box.classList.add(cssClass);
		box.innerHTML = html;

		const oldBox = document.getElementById(boxId);
		// If a box display is already there, replace it, if not, we create one from scratch
		if(oldBox !== null){
			// A bit brutal, but does the job
			oldBox.outerHTML = box.outerHTML
		}
		else{
			node.insertBefore(box, null);
		}
		return box;
	};

	/* API */

	luga.namespace("luga.validator.api");

	/**
	 * @typedef {Object} luga.validator.api.validateForm.options
	 *
	 * @property {HTMLElement} formNode     DOM node. Required
	 * @property {Function}        error        Name of the function to be invoked to handle/display validation messages.
	 *                                      Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate a form
	 * @param {luga.validator.api.validateForm.options} options
	 * @return {Boolean}
	 */
	luga.validator.api.validateForm = function(options){
		const formValidator = new luga.validator.FormValidator(options);
		formValidator.validate();
		return formValidator.isValid();
	};

	/**
	 * @typedef {Object} luga.validator.api.validateField.options
	 *
	 * @property {HTMLElement} fieldNode    DOM node. Required
	 * @property {Function}      error      Function to be invoked to handle/display validation messages.
	 *                                      Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate a field
	 * @param {luga.validator.api.validateField.options} options
	 * @return {Boolean}
	 * @throw {Exception}
	 */
	luga.validator.api.validateField = function(options){
		if(luga.form.utils.isInputField(options.fieldNode) === false){
			throw(luga.validator.CONST.MESSAGES.FIELD_CANT_BE_VALIDATED);
		}
		/* istanbul ignore else */
		if(options.error === undefined){
			options.error = luga.validator.CONST.HANDLERS.FORM_ERROR;
		}
		const dirtyValidators = [];
		const fieldValidator = luga.validator.fieldValidatorFactory.getInstance(options);
		fieldValidator.validate(null);
		if(fieldValidator.isValid() !== true){
			const callBack = luga.lookupFunction(options.error);
			dirtyValidators.push(fieldValidator);
			callBack(options.fieldNode, dirtyValidators);
		}
		return fieldValidator.isValid();
	};

	/**
	 * @typedef {Object} luga.validator.api.validateField.options
	 *
	 * @property {Nodelist} fields     Nodelist. Required
	 * @property {Function}  error     Function to be invoked to handle/display validation messages.
	 *                                 Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate a collection of fields
	 * @param {luga.validator.api.validateFields.options} options
	 * @return {Boolean}
	 */
	luga.validator.api.validateFields = function(options){
		/* istanbul ignore else */
		if(!options.error){
			options.error = luga.validator.CONST.HANDLERS.FORM_ERROR;
		}
		const validators = [];
		const executedValidators = {};
		const dirtyValidators = [];

		for(let i = 0; i < options.fields.length; i++){
			/* istanbul ignore else */
			if(luga.form.utils.isInputField(options.fields[i]) === true){
				validators.push(luga.validator.fieldValidatorFactory.getInstance({
					fieldNode: options.fields[i]
				}));
			}
		}

		for(let j = 0; j < validators.length; j++){
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
			const callBack = luga.lookupFunction(options.error);
			callBack.apply(null, [options.formNode, dirtyValidators]);
		}
		return dirtyValidators.length === 0;
	};

	/**
	 * @typedef {Object} luga.validator.api.validateFields.options
	 *
	 * @property {HTMLElement} rootNode    DOM node. Required
	 * @property {Function} error          Function to be invoked to handle/display validation messages.
	 *                                     Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate all fields contained inside a given node
	 * @param {luga.validator.api.validateFields.options} options
	 * @return {Boolean}
	 */
	luga.validator.api.validateChildFields = function(options){
		const fields = luga.form.utils.getChildFields(options.rootNode);
		return luga.validator.api.validateFields({
			fields: fields,
			error: options.error
		});
	};

	luga.dom.ready(function(){
		luga.validator.initForms();
	});

}());