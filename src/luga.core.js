if(typeof(jQuery) === "undefined"){
	throw("Unable to find jQuery");
}
if(typeof(luga) === "undefined"){
	var luga = {};
}

(function(){
	"use strict";

	luga.version = "0.4.4";

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
		if(rootObject === undefined){
			rootObject = window;
		}
		for(var i = 0; i < parts.length; i++){
			if(rootObject[parts[i]] === undefined){
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
	 * Given the name of a function as a string, return the relevant function, if any
	 * Returns undefined, if the reference has not been found
	 * Supports namespaces (if the fully qualified path is passed)
	 * @param {string} path            Fully qualified name of a function
	 * @returns {function|undefined}   The javascript reference to the function, undefined if nothing is fund or if it's not a function
	 */
	luga.lookupFunction = function(path){
		if(!path){
			return undefined;
		}
		var reference = luga.lookupProperty(window, path)
		if(jQuery.isFunction(reference) === true){
			return reference;
		}
		return undefined;
	};

	/**
	 * Given an object and a path, returns the property located at the given path
	 * If nothing exists at that location, returns undefined
	 * Supports unlimited nesting levels (if the fully qualified path is passed)
	 * @param {object} object  Target object
	 * @param {string} path    Dot-delimited string
	 * @returns {*|undefined}
	 */
	luga.lookupProperty = function(object, path){
		// Either of the two params is invalid
		if(!object || !path){
			return undefined;
		}
		// Property live at the first level
		if(object[path] !== undefined){
			return object[path];
		}
		var parts = path.split(".");
		while(parts.length > 0){
			var part = parts.shift();
			if(object[part] !== undefined){
				if(parts.length === 0){
					// We got it
					return object[part];
				}
				else{
					// Keep looping
					object = object[part];
				}
			}
		}
		return undefined;
	};

	/**
	 * Shallow-merge the contents of two objects together into the first object
	 * It wraps jQuery's extend to make names less ambiguous
	 *
	 * @param {object} target  An object that will receive the new properties
	 * @param {object} obj     An object containing additional properties to merge in
	 */
	luga.merge = function(target, obj){
		jQuery.extend(target, obj);
	};

	/**
	 * Given an object, a path and a value, set the property located at the given path to the given value
	 * If the path does not exists, it creates it
	 * @param {object} object  Target object
	 * @param {string} path    Dot-delimited string
	 * @param {*}      value
	 */
	luga.setProperty = function(object, path, value){
		var parts = path.split(".");
		while(parts.length > 0){
			var part = parts.shift();
			if(object[part] !== undefined){
				// Keep looping
				object = object[part];
			}
			else if(parts.length > 0){
				// Create the missing element and keep looping
				object[part] = {};
				object = object[part];
			}
			else{
				object[part] = value;
			}
		}
	};

	/**
	 * Provides the base functionality necessary to maintain a list of observers and send notifications to them.
	 * It's forbidden to use this class directly, it can only be used as a base class.
	 * The Notifier class does not define any notification messages, so it is up to the developer to define the notifications sent via the Notifier.
	 * @throws
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
		 * @throws
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
		 * @param {string}  eventName  Name of the event
		 * @param {object}  data       Object containing data to be passed from the point of notification to all interested observers.
		 *                             If there is no relevant data to pass, use an empty object.
		 * @throws
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

	luga.form.CONST = {
		FIELD_SELECTOR: "input,select,textarea",
		FAKE_INPUT_TYPES: {
			fieldset: true,
			reset: true
		},
		MESSAGES: {
			MISSING_FORM: "Unable to load form"
		}
	};

	/**
	 * Returns a JavaScript object containing name/value pairs from fields contained inside a given root node
	 * Only fields considered successful are returned:
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 * Values of multiple checked checkboxes and multiple select are included as a single entry, with array value
	 *
	 * @param {jquery}   rootNode     jQuery object wrapping the root node
	 * @param {boolean}  demoronize   MS Word's special chars are replaced with plausible substitutes. Default to false
	 * @return {object}               A JavaScript object containing name/value pairs
	 * @throws
	 */
	luga.form.toHash = function(rootNode, demoronize){

		if(rootNode.length === 0){
			throw(luga.form.CONST.MESSAGES.MISSING_FORM);
		}

		var map = {};
		var fields = luga.form.utils.getChildFields(rootNode);
		for(var i = 0; i < fields.length; i++){
			if(luga.form.utils.isSuccessfulField(fields[i]) === true){
				var fieldName = jQuery(fields[i]).attr("name");
				var fieldValue = null;
				var fieldType = jQuery(fields[i]).prop("type");
				switch(fieldType){

					case "select-multiple":
						fieldValue = jQuery(fields[i]).val();
						break;

					case "checkbox":
					case "radio":
						if(jQuery(fields[i]).prop("checked") === true){
							fieldValue = jQuery(fields[i]).val();
						}
						break;

					default:
						fieldValue = jQuery(fields[i]).val();
				}

				if(fieldValue !== null){
					if(demoronize === true){
						fieldValue = luga.string.demoronize(fieldValue);
					}
					if(map[fieldName] === undefined){
						map[fieldName] = fieldValue;
					}
					else{
						map[fieldName] = [map[fieldName], fieldValue];
					}
				}

			}
		}
		return map;
	};

	/**
	 * Given a form tag or another element wrapping input fields, serialize their value into JSON data
	 * If fields names contains dots, their are handled as nested properties
	 * Only fields considered successful are returned:
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 * @param {jquery} rootNode  jQuery object wrapping the form fields
	 * @returns {json}
	 */
	luga.form.toJson = function(rootNode){
		var flatData = luga.form.toHash(rootNode);
		var jsonData = {};
		for(var x in flatData){
			luga.setProperty(jsonData, x, flatData[x]);
		}
		return jsonData;
	};

	/**
	 * Returns a URI encoded string of name/value pairs from fields contained inside a given root node
	 * Only fields considered successful are returned:
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 *
	 * @param {jquery}   rootNode     jQuery object wrapping the root node
	 * @param {boolean}  demoronize   If set to true, MS Word's special chars are replaced with plausible substitutes. Default to false
	 * @return {string}               A URI encoded string
	 * @throws
	 */
	luga.form.toQueryString = function(rootNode, demoronize){

		if(rootNode.length === 0){
			throw(luga.form.CONST.MESSAGES.MISSING_FORM);
		}

		var str = "";
		var fields = luga.form.utils.getChildFields(rootNode);
		for(var i = 0; i < fields.length; i++){
			if(luga.form.utils.isSuccessfulField(fields[i]) === true){
				var fieldName = jQuery(fields[i]).attr("name");
				var fieldValue = jQuery(fields[i]).val();
				var fieldType = jQuery(fields[i]).prop("type");
				switch(fieldType){

					case "select-multiple":
						for(var j = 0; j < fieldValue.length; j++){
							str = appendQueryString(str, fieldName, fieldValue[j], demoronize);
						}
						break;

					case "checkbox":
					case "radio":
						if(jQuery(fields[i]).prop("checked") === true){
							str = appendQueryString(str, fieldName, fieldValue, demoronize);
						}
						break;

					default:
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

	luga.namespace("luga.form.utils");

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
		if(jQuery(fieldNode).prop("disabled") === true){
			return false;
		}
		if(jQuery(fieldNode).attr("name") === undefined){
			return false;
		}
		return true;
	};

	/**
	 * Returns true if the passed node is a form field that we care about
	 *
	 * @param {jquery}  fieldNode
	 * @return {boolean}
	 */
	luga.form.utils.isInputField = function(fieldNode){
		if(jQuery(fieldNode).prop("type") === undefined){
			return false;
		}
		// It belongs to the kind of nodes that are considered form fields, but we don't care about
		if(luga.form.CONST.FAKE_INPUT_TYPES[jQuery(fieldNode).prop("type")] === true){
			return false;
		}
		return true;
	};

	/**
	 * Extracts group of fields that share the same name from a given root node
	 * Or the whole document if the second argument is not passed
	 *
	 * @param {string}  name       Name of the field. Mandatory
	 * @param {jquery}  rootNode   Root node, optional, default to document
	 * @return {jquery}
	 */
	luga.form.utils.getFieldGroup = function(name, rootNode){
		var selector = "input[name=" + name + "]";
		return jQuery(selector, rootNode);
	};

	/**
	 * Returns an array of input fields contained inside a given root node
	 *
	 * @param {jquery}  rootNode   Root node
	 * @return {Array.<jquery>}
	 */
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
	 * @param  {string}  str                   String containing placeholders
	 * @param  {object|array.<string>} args    Either an array of strings or an objects containing name/value pairs in string format
	 * @return {string} The newly assembled string
	 */
	luga.string.format = function(str, args){
		var pattern = null;
		if($.isArray(args) === true){
			for(var i = 0; i < args.length; i++){
				pattern = new RegExp("\\{" + i + "\\}", "g");
				str = str.replace(pattern, args[i]);
			}
		}
		if($.isPlainObject(args) === true){
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
		str = str.replace(new RegExp(String.fromCharCode(8220), "g"), "\"");
		str = str.replace(new RegExp(String.fromCharCode(8221), "g"), "\"");
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
		if(node.attr("id") === undefined){
			boxId += node.attr("id");
		}
		else if(node.attr("name") !== undefined){
			boxId += node.attr("name");
		}
		return boxId;
	};

	/**
	 * Remove a message box (if any) associated with a given node
	 * @param {jquery}  node   Target node
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
	 * @param {jquery}  node   Target node
	 * @param {string}  html   HTML/Text code to inject
	 */
	luga.utils.displayMessage = function(node, html){
		return luga.utils.displayBox(node, html, luga.utils.CONST.CSS_CLASSES.MESSAGE);
	};

	/**
	 * Display an error box above a given node
	 * @param {jquery}  node   Target node
	 * @param {string}  html   HTML/Text code to inject
	 */
	luga.utils.displayErrorMessage = function(node, html){
		return luga.utils.displayBox(node, html, luga.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
	};

	/**
	 * Display a box with a message associated with a given node
	 * Overwrite this method if you want to change the way luga.utils.displayMessage and luga.utils.displayErrorMessage behaves
	 * @param {jquery}  node      Target node
	 * @param {string}  html      HTML/Text code to inject
	 * @param {string}  cssClass  CSS class attached to the box. Default to "luga_message"
	 */
	luga.utils.displayBox = function(node, html, cssClass){
		if(cssClass === undefined){
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