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

if(typeof(jQuery) === "undefined"){
	throw("Unable to find jQuery");
}
if(typeof(luga) === "undefined"){
	var luga = {};
}

(function(){
	"use strict";

	luga.version = "0.4.0";

	luga.CONST = {
		ERROR_MESSAGES: {
			NOTIFIER_ABSTRACT: "It's forbidden to use luga.Notifier directly, it must be used as a base class instead",
			INVALID_OBSERVER_PARAMETER: "addObserver(): observer parameter must be an object",
			INVALID_DATA_PARAMETER: "notifyObserver(): data parameter is required and must be an object"
		}
	};

	/**
	 * Creates namespaces to be used for scoping variables and classes so that they are not global.
	 * Specifying the last node of a namespace implicitly creates all other nodes.
	 * Based on Nicholas C. Zakas's code
	 * @param {string} ns           Namespace as string
	 * @param {object} rootObject   Optional root object. Default to window
	 */
	luga.namespace = function(ns, rootObject){
		var parts = ns.split(".");
		if(!rootObject){
			rootObject = window;
		}
		for(var i = 0; i < parts.length; i++){
			if(!rootObject[parts[i]]){
				rootObject[parts[i]] = {};
			}
			rootObject = rootObject[parts[i]];
		}
		return rootObject;
	};

	/**
	 * Offers a simple solution for inheritance among classes
	 */
	luga.extend = function(baseFunc, func, args){
		baseFunc.apply(func, args);
	};

	/**
	 * Merge the contents of two objects together into the first object
	 * It wraps jQuery's extend to make names less ambiguous
	 *
	 * @param {object} target
	 * @param {object} obj
	 */
	luga.merge = function(target, obj){
		jQuery.extend(target, obj);
	};

	/**
	 * Given the name of a function as a string, return the relevant function, if any
	 * Returns null, if the reference has not been found.
	 * @param {string} reference   Fully qualified name of a function
	 * @returns {*}                The javascript reference to the function
	 */
	luga.lookup = function(reference){
		if(!reference){
			return null;
		}
		if(jQuery.isFunction(reference)){
			return reference;
		}
		var object = window;
		var parts = reference.split('.');
		while(parts.length > 0){
			var part = parts.shift();
			if(part in object){
				object = object[part];
			}
			else{
				return null;
			}
		}
		if(jQuery.isFunction(object)){
			return object;
		}
		return null;
	};

	/**
	 * Provides the base functionality necessary to maintain a list of observers and send notifications to them.
	 * It's forbidden to use this class directly, it can only be used as a base class.
	 * The Notifier class does not define any notification messages, so it is up to the developer to define the notifications sent via the Notifier.
	 */
	luga.Notifier = function(){
		if(this.constructor === luga.Notifier){
			throw(luga.CONST.ERROR_MESSAGES.NOTIFIER_ABSTRACT);
		}
		this.observers = [];
		var prefix = "on";
		var suffix = "Handler";

		// Turns "complete" into "onComplete"
		var generateMethodName = function(eventName){
			var str = prefix;
			str += eventName.charAt(0).toUpperCase();
			str += eventName.substring(1);
			str += suffix;
			return str;
		};

		/**
		 * Adds an observer object to the list of observers.
		 * Observer objects should implement a method that matches a naming convention for the events they are interested in.
		 * For an event named "complete" they must implement a method named: "onCompleteHandler"
		 * The interface for this methods is as follows:
		 * observer.onCompleteHandler = function(data){};
		 * @param  observer  Observer object
		 */
		this.addObserver = function(observer){
			if(jQuery.type(observer) !== "object"){
				throw(luga.CONST.ERROR_MESSAGES.INVALID_OBSERVER_PARAMETER);
			}
			this.observers.push(observer);
		};

		/**
		 * Sends a notification to all interested observers registered with the notifier.
		 *
		 * @method
		 * @param eventName  Name of the event
		 * @param data       Object containing data to be passed from the point of notification to all interested observers.
		 *                   If there is no relevant data to pass, use an empty object.
		 */
		this.notifyObservers = function(eventName, data){
			if(jQuery.type(data) !== "object"){
				throw(luga.CONST.ERROR_MESSAGES.INVALID_DATA_PARAMETER);
			}
			var method = generateMethodName(eventName);
			for(var i = 0; i < this.observers.length; i++){
				var observer = this.observers[i];
				if(observer[method] && jQuery.isFunction(observer[method])){
					observer[method](data);
				}
			}
		};

		/**
		 * Removes the given observer object.
		 *
		 * @method
		 * @param {Object} observer
		 */
		this.removeObserver = function(observer){
			for(var i = 0; i < this.observers.length; i++){
				if(this.observers[i] === observer){
					this.observers.splice(i, 1);
					break;
				}
			}
		};

	};

	/* Form */

	luga.namespace("luga.form");
	luga.namespace("luga.form.utils");

	luga.form.CONST = {
		FIELD_SELECTOR: "input,select,textarea",
		FAKE_INPUT_TYPES: {
			fieldset: true,
			reset: true
		},
		MESSAGES: {
			MISSING_FORM: "Unable to load form"
		},
		HASH_DELIMITER: ","
	};

	/**
	 * Returns a URI encoded string of field name/value pairs from a given form
	 * Only fields considered successful are returned:
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 *
	 * @param {jquery}   formNode     jQuery object wrapping the form
	 * @param {boolean}  demoronize   MS Word's special chars are replaced with plausible substitutes. Default to false
	 * @return {string}               A URI encoded string
	 */
	luga.form.toQueryString = function(formNode, demoronize){

		if(formNode.length === 0){
			throw(luga.form.CONST.MESSAGES.MISSING_FORM);
		}

		var str = "";
		var fields = luga.form.utils.getChildFields(formNode);
		for(var i = 0; i < fields.length; i++){
			if(luga.form.utils.isSuccessfulField(fields[i]) === true){
				var fieldName = jQuery(fields[i]).attr("name");
				var fieldValue = jQuery(fields[i]).val();
				if(jQuery.isArray(fieldValue) === true){
					// Handle multi-select
					for(var j = 0; j < fieldValue.length; j++){
						str = appendQueryString(str, fieldName, fieldValue[j], demoronize);
					}
				}
				else{
					str = appendQueryString(str, fieldName, fieldValue, demoronize);
				}
			}
		}
		return str;
	};

	var appendQueryString = function(str, fieldName, fieldValue, demoronize){
		if(str !== ""){
			str += "&";
		}
		str += encodeURIComponent(fieldName);
		str += "=";
		if(demoronize === true){
			str += encodeURIComponent(luga.string.demoronize(fieldValue));
		}
		else{
			str += encodeURIComponent(fieldValue);
		}
		return str;
	};

	/**
	 * Returns a JavaScript object containing name/value pairs from a given form
	 * Only fields considered successful are returned:
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 * Values of multiple checked checkboxes and multiple select are included as a single entry, comma-delimited value
	 * You can change the delimiter by setting the value of luga.form.CONST.HASH_DELIMITER
	 *
	 * @param {jquery}   formNode     jQuery object wrapping the form
	 * @param {boolean}  demoronize   MS Word's special chars are replaced with plausible substitutes. Default to false
	 * @return {object}               A JavaScript object containing name/value pairs
	 */
	luga.form.toHash = function(formNode, demoronize){

		if(formNode.length === 0){
			throw(luga.form.CONST.MESSAGES.MISSING_FORM);
		}

		var map = {};
		var fields = luga.form.utils.getChildFields(formNode);
		for(var i = 0; i < fields.length; i++){
			if(luga.form.utils.isSuccessfulField(fields[i]) === true){
				var fieldName = jQuery(fields[i]).attr("name");
				var fieldValue = jQuery(fields[i]).val();
				// Handle multi-select
				if(jQuery.isArray(fieldValue) === true){
					fieldValue = fieldValue.join(luga.form.CONST.HASH_DELIMITER);
				}
				if(demoronize === true){
					fieldValue = luga.string.demoronize(fieldValue);
				}
				if(map[fieldName] === undefined){
					map[fieldName] = fieldValue;
				}
				else{
					map[fieldName] += luga.form.CONST.HASH_DELIMITER + fieldValue;
				}
			}
		}
		return map;
	};

	/**
	 * Returns true if the given field is successful, false otherwise
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 *
	 * @param {jquery}  fieldNode
	 * @return {boolean}
	 */
	luga.form.utils.isSuccessfulField = function(fieldNode){
		if(luga.form.utils.isInputField(fieldNode) === false){
			return false;
		}
		if(jQuery(fieldNode).attr("name") === undefined){
			return false;
		}
		return true;
	};

	luga.form.utils.isInputField = function(fieldNode){
		if(!jQuery(fieldNode).prop("type")){
			return false;
		}
		// It belongs to the kind of nodes that are considered form fields, but we don't care about
		if(luga.form.CONST.FAKE_INPUT_TYPES[jQuery(fieldNode).prop("type")] === true){
			return false;
		}
		return true;
	};

	luga.form.utils.getFieldGroup = function(name, formNode){
		var selector = "input[name=" + name + "]";
		return jQuery(selector, formNode);
	};

	luga.form.utils.getChildFields = function(rootNode){
		var fields = [];
		jQuery(rootNode).find(luga.form.CONST.FIELD_SELECTOR).each(function(index, item){
			if(luga.form.utils.isInputField(item)){
				fields.push(item);
			}
		});

		return fields;
	};

	/* Utilities */

	luga.namespace("luga.string");

	/**
	 * Given a string containing placeholders, it assembles a new string
	 * replacing the placeholders with the strings contained inside the second argument (either an object or an array)
	 * Loosely based on the .NET implementation: http://msdn.microsoft.com/en-us/library/system.string.format.aspx
	 *
	 * Example passing strings inside an array:
	 * luga.string.format("My name is {0} {1}", ["Ciccio", "Pasticcio"]);
	 * => "My name is Ciccio Pasticcio"
	 *
	 * Example passing strings inside an object:
	 * luga.string.format("My name is {firstName} {lastName}", {firstName: "Ciccio", lastName: "Pasticcio"});
	 * => "My name is Ciccio Pasticcio"
	 *
	 * @param  {string}  str     String containing placeholders
	 * @param  {*}       args    Either an array of strings or an objects containing name/value pairs in string format
	 * @return {string}          The newly assembled string
	 */
	luga.string.format = function(str, args){
		var pattern = null;
		if($.isArray(args)){
			for(var i = 0; i < args.length; i++){
				pattern = new RegExp("\\{" + i + "\\}", "g");
				str = str.replace(pattern, args[i]);
			}
		}
		if($.isPlainObject(args)){
			for(var x in args){
				pattern = new RegExp("\\{" + x + "\\}", "g");
				str = str.replace(pattern, args[x]);
			}
		}
		return str;
	};

	/**
	 * Replace MS Word's non-ISO characters with plausible substitutes
	 *
	 * @param {string} str   String containing MS Word's garbage
	 * @return {string}      The de-moronized string
	 */
	luga.string.demoronize = function(str){
		str = str.replace(new RegExp(String.fromCharCode(710), "g"), "^");
		str = str.replace(new RegExp(String.fromCharCode(732), "g"), "~");
		// Evil "smarty" quotes
		str = str.replace(new RegExp(String.fromCharCode(8216), "g"), "'");
		str = str.replace(new RegExp(String.fromCharCode(8217), "g"), "'");
		str = str.replace(new RegExp(String.fromCharCode(8220), "g"), '"');
		str = str.replace(new RegExp(String.fromCharCode(8221), "g"), '"');
		// More garbage
		str = str.replace(new RegExp(String.fromCharCode(8211), "g"), "-");
		str = str.replace(new RegExp(String.fromCharCode(8212), "g"), "--");
		str = str.replace(new RegExp(String.fromCharCode(8218), "g"), ",");
		str = str.replace(new RegExp(String.fromCharCode(8222), "g"), ",,");
		str = str.replace(new RegExp(String.fromCharCode(8226), "g"), "*");
		str = str.replace(new RegExp(String.fromCharCode(8230), "g"), "...");
		return str;
	};

	luga.namespace("luga.utils");

	luga.utils.CONST = {
		CSS_CLASSES: {
			MESSAGE: "luga_message",
			ERROR_MESSAGE: "luga_error_message"
		},
		MSG_BOX_ID: "lugaMessageBox"
	};

	/**
	 * Private helper function
	 * Generate node's id
	 */
	var generateBoxId = function(node){
		var boxId = luga.utils.CONST.MSG_BOX_ID;
		if(node.attr("id")){
			boxId += node.attr("id");
		}
		else if(node.attr("name")){
			boxId += node.attr("name");
		}
		return boxId;
	};

	/**
	 * Remove a message box (if any) associated with a given node
	 */
	luga.utils.removeDisplayBox = function(node){
		var boxId = generateBoxId(jQuery(node));
		var oldBox = jQuery("#" + boxId);
		// If an error display is already there, get rid of it
		if(oldBox.length > 0){
			oldBox.remove();
		}
	};

	/**
	 * Display a message box above a given node
	 */
	luga.utils.displayMessage = function(node, html){
		return luga.utils.displayBox(node, html, luga.utils.CONST.CSS_CLASSES.MESSAGE);
	};

	/**
	 * Display an error box above a given node
	 */
	luga.utils.displayErrorMessage = function(node, html){
		return luga.utils.displayBox(node, html, luga.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
	};

	/**
	 * Display a box with a message associated with a given node
	 * Overwrite this method if you want to change the way luga.utils.displayMessage and luga.utils.displayErrorMessage behaves
	 */
	luga.utils.displayBox = function(node, html, cssClass){
		if(!cssClass){
			cssClass = luga.utils.CONST.CSS_CLASSES.MESSAGE;
		}
		var boxId = generateBoxId(jQuery(node));
		var box = jQuery("<div></div>");
		box.attr("id", boxId);
		box.addClass(cssClass);
		box.html(html);
		var oldBox = jQuery("#" + boxId);
		// If a box display is already there, replace it, if not, we create one from scratch
		if(oldBox.length > 0){
			oldBox.replaceWith(box);
		}
		else{
			jQuery(node).before(box);
		}
		return box;
	};

}());

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
/* global luga */

if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.csi");

	luga.csi.version = 1.0;

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

	luga.namespace("luga.validator");

	luga.validator.version = "0.9.5";

	/* Validation handlers */

	luga.namespace("luga.validator.handlers");

	/**
	 * Display error messages inside alert
	 */
	luga.validator.handlers.errorAlert = function(formNode, validators){
		var errorMsg = "";
		var focusGiven = false;
		for(var i = 0; i < validators.length; i++){
			// Append to the error string
			errorMsg += validators[i].message + "\n";
			// Give focus to the first invalid text field
			if(!focusGiven && (validators[i].getFocus)){
				validators[i].getFocus();
				focusGiven = true;
			}
		}
		if(errorMsg !== ""){
			alert(errorMsg);
		}
	};

	/**
	 * Display errors inside a box above the form
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
			if(!focusGiven && (validators[i].getFocus)){
				validators[i].getFocus();
				focusGiven = true;
			}
		}
		htmlStr += "</ul>";
		luga.utils.displayErrorMessage(formNode, htmlStr);
	};

	/**
	 * Use Bootstrap validation states to display errors
	 */
	luga.validator.handlers.bootstrap = function(formNode, validators){
		var ERROR_SELECTOR = ".has-error";
		var ERROR_CLASS = "has-error";

		// Reset all parents
		jQuery(formNode).find(ERROR_SELECTOR).removeClass(ERROR_CLASS);
		var focusGiven = false;
		for(var i = 0; i < validators.length; i++){
			// Attach Bootstrap CSS to parent node
			var parentNode = jQuery(validators[i].node).parent().addClass(ERROR_CLASS);
			// Give focus to the first invalid text field
			if(!focusGiven && (validators[i].getFocus)){
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
			AFTER: "data-lugacsi-after",
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
			MISSING_FUNCTION: "luga.validator was unable to find a function named: {0}",
			BASE_VALIDATOR_ABSTRACT: "luga.validator.BaseFieldValidator is an abstract class",
			GROUP_VALIDATOR_ABSTRACT: "luga.validator.BaseGroupValidator is an abstract class",
			FIELD_CANT_BE_VALIDATED: "This field can't be validated",
			PATTERN_NOT_FOUND: "luga.validator failed to retrieve pattern: {0}",
			INVALID_INDEX_PARAMETER: "data-lugavalidator-invalidindex accept only numbers",
			MISSING_EQUAL_TO_FIELD: "data-lugavalidator-equalto was unable to find field with id = {0}"
		},
		HANDLERS: {
			FORM_ERROR: luga.validator.handlers.errorAlert
		}
	};

	/**
	 * Form validator class
	 *
	 * @param options.formNode:          Root node for widget (DOM reference). Required
	 * @param options.error:             Function that will be invoked to handle/display validation messages.
	 *                                   Default to luga.validator.errorAlert (display plain alert messages)
	 * @param options.before:            Function that will be invoked before validation is performed. Default to none
	 * @param options.after:             Function that will be invoked after the form is successfully validated. Default to none
	 * @param options.blocksubmit:       Disable submit buttons if the form isn't valid
	 *                                   This prevents multiple submits but also prevents the value of the submit buttons from being passed as part of the HTTP request.
	 *                                   Set this options to false to keep the submit buttons enabled.
	 *                                   Value can also be set using the "data-lugavalidator-blocksubmit" attribute. Optional
	 */
	luga.validator.FormValidator = function(options){
		this.config = {
			// Either: custom attribute, incoming option or default
			blocksubmit: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.BLOCK_SUBMIT) || "true",
			error: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR) || luga.validator.CONST.HANDLERS.FORM_ERROR,
			// Either: custom attribute, incoming option or null
			before: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.BEFORE) || null,
			after: jQuery(options.formNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.AFTER) || null
		};
		luga.merge(this.config, options);
		var self = this;
		self.validators = [];
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
				if(luga.form.utils.isInputField(formDom.elements[i])){
					self.validators.push(luga.validator.FieldValidatorGetInstance({
						fieldNode: formDom.elements[i],
						formNode: self.config.formNode
					}));
				}
			}
		};

		// Execute all field validators. Returns an array of field validators that are in invalid state
		// Returns array is empty if there are no errors
		this.validate = function(event){
			self.init();
			self.before();
			// Keep track of already validated fields (to skip already validated checkboxes or radios)
			var executedValidators = {};
			for(var i = 0; i < self.validators.length; i++){
				if(self.validators[i] && self.validators[i].validate){
					if(executedValidators[self.validators[i].name]){
						// Already validated checkbox or radio, skip it
						continue;
					}
					if(self.validators[i].validate()){
						self.dirtyValidators.push(self.validators[i]);
					}
					executedValidators[self.validators[i].name] = true;
				}
			}
			if(!self.isValid()){
				self.error();
				if(event){
					event.preventDefault();
				}
			}
			else{
				if(this.config.blocksubmit === "true"){
					// Disable submit buttons to avoid multiple submits
					self.disableSubmit();
				}
				self.after();
			}
			return self.dirtyValidators;
		};

		this.disableSubmit = function(){
			var buttons = jQuery("input[type=submit]", self.config.formNode);
			jQuery(buttons).each(function(index, item){
				var buttonNode = jQuery(item);
				if(buttonNode.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.DISABLED_MESSAGE)){
					buttonNode.val(buttonNode.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.DISABLED_MESSAGE));
				}
			});
		};

		this.isValid = function(){
			return self.dirtyValidators.length === 0;
		};

		this.before = function(){
			var callBack = luga.lookup(self.config.before);
			if(callBack !== null){
				callBack.apply(null, [self.config.formNode[0]]);
			}
			else if(self.config.before){
				alert(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.before]));
			}
		};

		this.error = function(){
			var callBack = luga.lookup(self.config.error);
			if(callBack !== null){
				callBack.apply(null, [self.config.formNode[0], self.dirtyValidators]);
			}
			else if(self.config.error){
				alert(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.error]));
			}
		};

		this.after = function(){
			var callBack = luga.lookup(self.config.after);
			if(callBack !== null){
				callBack.apply(null, [self.config.formNode[0]]);
			}
			else if(self.config.after){
				alert(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_FUNCTION, [self.config.after]));
			}
		};

	};

	/**
	 * Field validator factory. Use this to instantiate a field validator without worrying about the specific implementation
	 *
	 * @param options.fieldNode:          Root node for widget (DOM reference). Required
	 * @param options.formNode:           Form node containing the field (DOM reference).
	 *                                    Required in case of radio and checkboxes (that are validated as group), optional in all other cases
	 * @param.options                     Additional options can be used, but are specific to different kind of input fields.
	 *                                    Check their implementation for details
	 */
	luga.validator.FieldValidatorGetInstance = function(options){
		this.config = {};
		luga.merge(this.config, options);
		var self = this;
		// Abort if the field isn't suitable to validation
		if(!luga.form.utils.isInputField(self.config.fieldNode)){
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
				if(jQuery(this.config.fieldNode).attr("name")){
					return new luga.validator.RadioValidator({
						inputGroup: luga.form.utils.getFieldGroup(jQuery(this.config.fieldNode).attr("name"), this.config.formNode)
					});
				}
				break;

			case "checkbox":
				if(jQuery(this.config.fieldNode).attr("name")){
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
	 * Abstract field validator class. To be extended for different kind of fields
	 *
	 * @param options.fieldNode:          Root node for widget (DOM reference). Required
	 * @param options.message:            Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 * @param.options                     Additional options can be used, but are specific to certain kind of input fields. Check their implementation for details
	 */
	luga.validator.BaseFieldValidator = function(options){

		if(this.constructor === luga.validator.BaseFieldValidator){
			throw(luga.validator.CONST.MESSAGES.BASE_VALIDATOR_ABSTRACT);
		}

		this.config = {
			message: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE) || "",
			errorclass: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS) || ""
		};
		luga.merge(this.config, options);
		this.node = jQuery(options.fieldNode);
		this.message = this.config.message;
		this.name = "";

		if(this.node.attr("name")){
			this.name = this.node.attr("name");
		}
		else if(this.node.attr("id")){
			this.name = this.node.attr("id");
		}

		this.isValid = function(){
			// Abstract method. Must return a boolean
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

		// Be careful, this method returns a boolean but also has side-effects
		this.validate = function(){
			// Disabled fields are always valid
			if(this.node.prop("disabled")){
				this.flagValid();
				return false;
			}
			if(!this.isValid()){
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
	 * Text field validator class
	 *
	 * @param options.fieldNode:          Root node for widget (DOM reference). Required
	 * @param options.required:           Set it to true to flag the field as required.
	 *                                    In case you need conditional validation, set it to the name of a custom function that will handle the condition.
	 *                                    Can also be set using the "data-lugavalidator-required" attribute. Optional
	 * @param options.pattern:            Validation pattern to be applied, either built-in or custom.
	 *                                    Can also be set using the "data-lugavalidator-pattern" attribute. Optional
	 * @param options.minlength:          Enforce a minimum text length. Can also be set using the "data-lugavalidator-minlength" attribute. Optional
	 * @param options.maxlength:          Enforce a maximum text length. Can also be set using the "data-lugavalidator-maxlength" attribute. Optional
	 * @param options.minnumber:          Enforce a minimum numeric value. Can also be set using the "data-lugavalidator-minnumber" attribute. Optional
	 * @param options.maxnumber:          Enforce a maximum numeric value. Can also be set using the "data-lugavalidator-maxnumber" attribute. Optional
	 * @param options.datepattern:        Date format pattern to be applied, either built-in or custom. Can also be set using the "data-lugavalidator-datepattern" attribute. Optional
	 * @param options.mindate:            Enforce a minimum date. Can also be set using the "data-lugavalidator-mindate" attribute. Optional
	 * @param options.maxdate:            Enforce a maximum date. Can also be set using the "data-lugavalidator-maxdate" attribute. Optional
	 * @param options.equalto:            Id of another field who's values will be compared for equality. Can also be set using the "data-lugavalidator-equalto" attribute. Optional
	 * @param options.message:            Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional

	 */
	luga.validator.TextValidator = function(options){

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
		var self = this;

		self.node = jQuery(options.fieldNode);
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

		this.isEmpty = function(){
			return self.node.val() === "";
		};

		this.isRequired = function(){
			var requiredAtt = this.config.required;
			if(requiredAtt){
				if(requiredAtt === "true"){
					return true;
				}
				if(requiredAtt === "false"){
					return false;
				}
				// It's a conditional validation. Invoke the relevant function if available
				var functionReference = luga.lookup(requiredAtt);
				if(functionReference){
					return functionReference.apply(null, [self.node]);
				}
			}
			return false;
		};

		// Check if the field satisfy the rules associated with it
		// Be careful, this method contains multiple exit points!!!
		this.isValid = function(){
			if(self.isEmpty()){
				if(self.isRequired()){
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
					if(self.node.attr(luga.validator.CONST.RULE_PREFIX + rule)){
						// Invoke the rule
						if(!luga.validator.rules[rule].apply(null, [self.node, self])){
							return false;
						}
					}
				}
			}
			return true;
		};
	};

	/**
	 * Select field validator class
	 *
	 * @param options.fieldNode:          Root node for widget (DOM reference). Required
	 * @param options.invalidindex:       Prevents selection of an entry on a given position (zero based). Can also be set using the "data-lugavalidator-invalidindex" attribute. Optional
	 * @param options.invalidvalue:       Prevents selection of an entry with a given value. Can also be set using the "data-lugavalidator-invalidvalue" attribute. Optional
	 * @param options.message:            Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 * @param.options                     Additional options can be used, but are specific to certain kind of input fields. Check their implementation for details
	 */
	luga.validator.SelectValidator = function(options){
		this.config = {
			invalidindex: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.INVALID_INDEX),
			invalidvalue: jQuery(options.fieldNode).attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.INVALID_VALUE)
		};
		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseFieldValidator, this, [this.config]);
		var self = this;
		self.type = "select";
		self.node = jQuery(options.fieldNode);

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

		this.isValid = function(){
			// Check for index
			if(currentIndex === parseInt(self.config.invalidindex, 10)){
				return false;
			}
			// Check for value
			if(self.node.val() === self.config.invalidvalue){
				return false;
			}
			// Loop over all the available rules
			for(var rule in luga.validator.rules){
				// Check if the current rule is required for the field
				if(self.node.attr(luga.validator.CONST.RULE_PREFIX + rule)){
					// Invoke the rule
					if(!luga.validator.rules[rule].apply(null, [self.node, self])){
						return false;
					}
				}
			}
			return true;
		};

	};

	/**
	 * Abstract validator class for grouped fields (checkboxes, radio buttons). To be extended for different kind of fields
	 *
	 * @param options.inputGroup:         A group of input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @param options.message:            Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 * @param.options                     Additional options can be used, but are specific to certain kind of input fields. Check their implementation for details
	 */
	luga.validator.BaseGroupValidator = function(options){

		if(this.constructor === luga.validator.BaseFieldValidator){
			throw(luga.validator.CONST.MESSAGES.GROUP_VALIDATOR_ABSTRACT);
		}

		this.config = {};
		luga.merge(this.config, options);
		this.inputGroup = this.config.inputGroup;
		this.name = jQuery(this.config.inputGroup).attr("name");
		this.message = "";
		this.errorclass = "";

		// Since fields from the same group can have conflicting attribute values, the last one win
		for(var i = 0; i < this.inputGroup.length; i++){
			var field = jQuery(this.inputGroup[i]);
			if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE)){
				this.message = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MESSAGE);
			}
			if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS)){
				this.errorclass = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.ERROR_CLASS);
			}
		}

		this.isValid = function(){
			// Abstract method. Must return a boolean
		};

		this.flagInvalid = function(){
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

		// Be careful, this method returns a boolean but also has side-effects
		this.validate = function(){
			if(this.isValid()){
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
	 * Validator class for radio buttons
	 *
	 * @param options.inputGroup:         A group of input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @param options.message:            Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 * @param.options                     Additional options can be used, but are specific to certain kind of input fields. Check their implementation for details
	 */
	luga.validator.RadioValidator = function(options){
		this.config = {};
		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseGroupValidator, this, [this.config]);
		this.type = "radio";
		var self = this;

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
	 * Validator class for checkboxes
	 *
	 * @param options.inputGroup:         A group of input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @param options.message:            Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @param options.errorclass:         CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
	 * @param.options                     Additional options can be used, but are specific to certain kind of input fields. Check their implementation for details
	 */
	luga.validator.CheckboxValidator = function(options){
		this.config = {};
		luga.merge(this.config, options);
		luga.extend(luga.validator.BaseGroupValidator, this, [this.config]);
		this.type = "checkbox";
		this.minchecked = 0;
		this.maxchecked = this.config.inputGroup.length;
		var self = this;

		// Since checkboxes from the same group can have conflicting attribute values, the last one win
		for(var i = 0; i < this.inputGroup.length; i++){
			var field = jQuery(this.inputGroup[i]);
			if(field.prop("disabled") === false){
				if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_CHECKED)){
					this.minchecked = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MIN_CHECKED);
				}
				if(field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_CHECKED)){
					this.maxchecked = field.attr(luga.validator.CONST.CUSTOM_ATTRIBUTES.MAX_CHECKED);
				}
			}
		}

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
		if(containsAt && containDot){
			return true;
		}
		return false;
	};

	luga.validator.rules.equalto = function(fieldNode, validator){
		var secondFieldNode = jQuery("#" + validator.config.equalto);
		if(secondFieldNode.length === 0){
			throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_EQUAL_TO_FIELD, [validator.config.equalto]));
		}
		return (fieldNode.val() === secondFieldNode.val());
	};

	luga.validator.rules.datepattern = function(fieldNode, validator){
		var datObj = luga.validator.dateStrToObj(fieldNode.val(), validator.config.datepattern);
		if(datObj){
			return true;
		}
		return false;
	};

	luga.validator.rules.maxdate = function(fieldNode, validator){
		var pattern = validator.config.datepattern;
		var valueDate = luga.validator.dateStrToObj(fieldNode.val(), pattern);
		var maxDate = luga.validator.dateStrToObj(validator.config.maxdate, pattern);
		if(valueDate && maxDate){
			return valueDate <= maxDate;
		}
		return false;
	};

	luga.validator.rules.mindate = function(fieldNode, validator){
		var pattern = validator.config.datepattern;
		var valueDate = luga.validator.dateStrToObj(fieldNode.val(), pattern);
		var minDate = luga.validator.dateStrToObj(validator.config.mindate, pattern);
		if(valueDate && minDate){
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
		if(!jQuery.isNumeric(fieldNode.val())){
			return false;
		}
		if(parseFloat(fieldNode.val()) <= parseFloat(validator.config.maxnumber)){
			return true;
		}
		return false;
	};

	luga.validator.rules.minnumber = function(fieldNode, validator){
		if(!jQuery.isNumeric(fieldNode.val())){
			return false;
		}
		if(parseFloat(fieldNode.val()) >= parseFloat(validator.config.minnumber)){
			return true;
		}
		return false;
	};

	luga.validator.rules.pattern = function(fieldNode, validator){
		var regExpObj = luga.validator.patterns[validator.config.pattern];
		if(regExpObj){
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
	luga.validator.patterns.time = new RegExp('([0-1][0-9]|2[0-3]):[0-5][0-9]$');

	/* Date specifications */

	luga.namespace("luga.validator.dateSpecs");

	// Create an object that stores date validation's info
	luga.validator.createDateSpecObj = function(rex, year, month, day, separator){
		var infoObj = {};
		infoObj.rex = new RegExp(rex);
		infoObj.y = year;
		infoObj.m = month;
		infoObj.d = day;
		infoObj.s = separator;
		return infoObj;
	};

	// Create a Date object out of a string, based on a given date spec
	luga.validator.dateStrToObj = function(dateStr, dateSpecName){
		var dateSpecObj = luga.validator.dateSpecs[dateSpecName];
		if(dateSpecObj){

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
			var yearMatches = testDate.getFullYear() === parseInt(dateBits[dateSpecObj.y], 10);
			var monthMatches = testDate.getMonth() === parseInt(dateBits[dateSpecObj.m] - 1, 10);
			var dayMatches = testDate.getDate() === parseInt(dateBits[dateSpecObj.d], 10);
			if(yearMatches && monthMatches && dayMatches){
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
	 * Attach form validators to onSubmit events
	 */
	luga.validator.initForms = function(){
		jQuery(luga.validator.CONST.FORM_SELECTOR).each(function(index, item){
			var formNode = jQuery(item);
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
	 * Programmatically validate a form
	 * @param options.formNode:        Form (DOM reference). Required
	 * @param options.error:           Function that will be invoked to handle/display validation messages.
	 *                                 Default to luga.validator.errorAlert (display plain alert messages)
	 */
	luga.validator.api.validateForm = function(options){
		if(!options.error){
			options.error = luga.validator.CONST.HANDLERS.FORM_ERROR;
		}
		var formValidator = new luga.validator.FormValidator(options);
		var dirtyValidators = formValidator.validate(null);
		if(dirtyValidators.length > 0){
			options.error.apply(null, [options.formNode, dirtyValidators]);
		}
		return formValidator.isValid();
	};

	/**
	 * Programmatically validate a field
	 * @param options.fieldNode:       Input field (DOM reference). Required
	 * @param options.error:           Function that will be invoked to handle/display validation messages.
	 *                                 Default to luga.validator.errorAlert (display plain alert messages)
	 */
	luga.validator.api.validateField = function(options){
		if(!luga.form.utils.isInputField(options.fieldNode)){
			throw(luga.validator.CONST.MESSAGES.FIELD_CANT_BE_VALIDATED);
		}
		if(!options.error){
			options.error = luga.validator.CONST.HANDLERS.FORM_ERROR;
		}
		var fieldValidator = new luga.validator.FieldValidatorGetInstance(options);
		fieldValidator.validate(null);
		if(!fieldValidator.isValid()){
			options.error.apply(null, [null, [fieldValidator]]);
		}
		return fieldValidator.isValid();
	};

	/**
	 * Programmatically validate a collection of fields
	 * @param options.fields:          A collection of input fields (DOM references). Required
	 * @param options.error:           Function that will be invoked to handle/display validation messages.
	 *                                 Default to luga.validator.errorAlert (display plain alert messages)
	 */
	luga.validator.api.validateFields = function(options){
		if(!options.error){
			options.error = luga.validator.CONST.HANDLERS.FORM_ERROR;
		}
		var validators = [];
		var executedValidators = [];
		var dirtyValidators = [];

		for(var i = 0; i < options.fields.length; i++){
			if(luga.form.utils.isInputField(options.fields[i])){
				validators.push(luga.validator.FieldValidatorGetInstance({
					fieldNode: options.fields[i]
				}));
			}
		}
		for(var j = 0; j < validators.length; j++){
			if(validators[j] && validators[j].validate){
				if(executedValidators[validators[j].name]){
					// Already validated checkbox or radio, skip it
					continue;
				}
				if(validators[j].validate()){
					dirtyValidators.push(validators[j]);
				}
				executedValidators[validators[j].name] = true;
			}
		}
		if(dirtyValidators.length > 0){
			options.error.apply(null, [null, dirtyValidators]);
		}
		return dirtyValidators.length === 0;
	};

	/**
	 * Programmatically validate all fields contained inside a given node
	 * @param options.rootNode:        Container node (DOM references). Required
	 * @param options.error:           Function that will be invoked to handle/display validation messages.
	 *                                 Default to luga.validator.errorAlert (display plain alert messages)
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