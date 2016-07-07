/*! 
Luga Common 0.5.0 2016-07-07T20:03:38.716Z
Copyright 2013-2016 Massimo Foti (massimo@massimocorner.com)
Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0
 */
/* globals ActiveXObject */

/* istanbul ignore if */
if(typeof(jQuery) === "undefined"){
	throw("Unable to find jQuery");
}
/* istanbul ignore else */
if(typeof(luga) === "undefined"){
	var luga = {};
}

(function(){
	"use strict";

	luga.version = "0.5.0";

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
	 *
	 * @param {function} baseFunc  Parent constructor function. Required
	 * @param {function} func      Child constructor function. Required
	 * @param {array}    args      An array of arguments that will be passed to the parent's constructor. Optional
	 */
	luga.extend = function(baseFunc, func, args){
		baseFunc.apply(func, args);
	};

	/**
	 * Return true if an object is an array. False otherwise
	 * @param {*} obj
	 * @returns {boolean}
	 */
	luga.isArray = function(obj){
		return Array.isArray(obj);
	};

	/**
	 * Return true if an object is a function. False otherwise
	 * @param {*} obj
	 * @returns {boolean}
	 */
	luga.isFunction = function(obj){
		return luga.type(obj) === "function";
	};

	/**
	 * Return true if an object is a plain object (created using "{}" or "new Object"). False otherwise
	 * Based on jQuery.isPlainObject()
	 * @param {*} obj
	 * @returns {boolean}
	 */
	luga.isPlainObject = function(obj){
		// Detect obvious negatives
		// Use Object.prototype.toString to catch host objects
		if(Object.prototype.toString.call(obj) !== "[object Object]"){
			return false;
		}

		var proto = Object.getPrototypeOf(obj);

		// Objects with no prototype (e.g., Object.create(null)) are plain
		if(proto === null){
			return true;
		}

		// Objects with prototype are plain if they were constructed by a global Object function
		var constructor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
		return typeof (constructor === "function") && (Function.toString.call(constructor) === Function.toString.call(Object));
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
		var reference = luga.lookupProperty(window, path);
		if(luga.isFunction(reference) === true){
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
	 *
	 * @param {object} target  An object that will receive the new properties
	 * @param {object} source     An object containing additional properties to merge in
	 */
	luga.merge = function(target, source){
		for(var x in source){
			target[x] = source[x];
		}
	};

	/**
	 * Given an object, a path and a value, set the property located at the given path to the given value
	 * If the path does not exists, it creates it
	 * @param {object} object  Target object
	 * @param {string} path    Fully qualified property name
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

	luga.NOTIFIER_CONST = {
		ERROR_MESSAGES: {
			NOTIFIER_ABSTRACT: "It's forbidden to use luga.Notifier directly, it must be used as a base class instead",
			INVALID_OBSERVER_PARAMETER: "addObserver(): observer parameter must be an object",
			INVALID_DATA_PARAMETER: "notifyObserver(): data parameter is required and must be an object"
		}
	};

	/**
	 * Provides the base functionality necessary to maintain a list of observers and send notifications to them.
	 * It's forbidden to use this class directly, it can only be used as a base class.
	 * The Notifier class does not define any notification messages, so it is up to the developer to define the notifications sent via the Notifier.
	 * @throws {Exception}
	 */
	luga.Notifier = function(){
		if(this.constructor === luga.Notifier){
			throw(luga.NOTIFIER_CONST.ERROR_MESSAGES.NOTIFIER_ABSTRACT);
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
		 * @param  {object} observer  Observer object
		 * @throws {Exception}
		 */
		this.addObserver = function(observer){
			if(luga.type(observer) !== "object"){
				throw(luga.NOTIFIER_CONST.ERROR_MESSAGES.INVALID_OBSERVER_PARAMETER);
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
		 * @throws {Exception}
		 */
		this.notifyObservers = function(eventName, data){
			if(luga.type(data) !== "object"){
				throw(luga.NOTIFIER_CONST.ERROR_MESSAGES.INVALID_DATA_PARAMETER);
			}
			var method = generateMethodName(eventName);
			for(var i = 0; i < this.observers.length; i++){
				var observer = this.observers[i];
				if(observer[method] && luga.isFunction(observer[method])){
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

	var class2type = {};
	["Array", "Boolean", "Date", "Error", "Function", "Number", "Object", "RegExp", "String", "Symbol"].forEach(function(element, i, collection){
		class2type["[object " + element + "]"] = element.toLowerCase();
	});

	/**
	 * Determine the internal JavaScript [[Class]] of an object
	 * Based on jQuery.type()
	 * @param {*} obj
	 * @returns {string}
	 */
	luga.type = function(obj){
		if(obj === null){
			return "null";
		}
		var rawType = typeof obj;
		if((rawType === "object") || (rawType === "function")){
			/* http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/ */
			var stringType = Object.prototype.toString.call(obj);
			return class2type[stringType];
		}
		return rawType;
	};

	/* DOM */

	luga.namespace("luga.dom.treeWalker");

	/**
	 * Static factory to create a cross-browser DOM TreeWalker
	 * https://developer.mozilla.org/en/docs/Web/API/TreeWalker
	 *
	 * @param {Node}         rootNode    Start node. Required
	 * @param {function}     filterFunc  Optional filter function. If specified only nodes matching the filter will be accepted
	 *                                   The function will be invoked with this signature: filterFunc(node). Must return true|false
	 * @returns {TreeWalker}
	 */
	luga.dom.treeWalker.getInstance = function(rootNode, filterFunc){

		var filter = {
			acceptNode: function(node){
				/* istanbul ignore else */
				if(filterFunc !== undefined){
					if(filterFunc(node) === false){
						return NodeFilter.FILTER_SKIP;
					}
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		};

		// http://stackoverflow.com/questions/5982648/recommendations-for-working-around-ie9-treewalker-filter-bug
		// A true W3C-compliant nodeFilter object isn't passed, and instead a "safe" one _based_ off of the real one.
		var safeFilter = filter.acceptNode;
		safeFilter.acceptNode = filter.acceptNode;
		return document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, safeFilter, false);
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
	 * @returns {object}              A JavaScript object containing name/value pairs
	 * @throws {Exception}
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
					else if(luga.isArray(map[fieldName]) === true){
						map[fieldName].push(fieldValue);
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
	 * @returns {string}               A URI encoded string
	 * @throws {Exception}
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
	 * @returns {boolean}
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
	 * @returns {boolean}
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
	 * @returns {jquery}
	 */
	luga.form.utils.getFieldGroup = function(name, rootNode){
		var selector = "input[name=" + name + "]";
		return jQuery(selector, rootNode);
	};

	/**
	 * Returns an array of input fields contained inside a given root node
	 *
	 * @param {jquery}  rootNode   Root node
	 * @returns {Array.<jquery>}
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
	 * Replace MS Word's non-ISO characters with plausible substitutes
	 *
	 * @param {string} str   String containing MS Word's garbage
	 * @returns {string}      The de-moronized string
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
	 * @returns {string} The newly assembled string
	 */
	luga.string.format = function(str, args){
		var pattern = null;
		if(luga.isArray(args) === true){
			for(var i = 0; i < args.length; i++){
				pattern = new RegExp("\\{" + i + "\\}", "g");
				str = str.replace(pattern, args[i]);
			}
		}
		if(luga.isPlainObject(args) === true){
			for(var x in args){
				pattern = new RegExp("\\{" + x + "\\}", "g");
				str = str.replace(pattern, args[x]);
			}
		}
		return str;
	};

	/**
	 * Given a string in querystring format, return a JavaScript object containing name/value pairs
	 * @param {string} str  The querystring
	 * @returns {object}
	 */
	luga.string.queryToHash = function(str){
		var map = {};
		if(str.charAt(0) === "?"){
			str = str.substring(1);
		}
		if(str.length === 0){
			return map;
		}
		var parts = str.split("&");

		for(var i = 0; i < parts.length; i++){
			var tokens = parts[i].split("=");
			var fieldName = decodeURIComponent(tokens[0]);
			var fieldValue = "";
			if(tokens.length === 2){
				fieldValue = decodeURIComponent(tokens[1]);
			}
			if(map[fieldName] === undefined){
				map[fieldName] = fieldValue;
			}
			else if(luga.isArray(map[fieldName]) === true){
				map[fieldName].push(fieldValue);
			}
			else{
				map[fieldName] = [map[fieldName], fieldValue];
			}
		}
		return map;
	};

	var propertyPattern = new RegExp("\\{([^}]*)}", "g");

	/**
	 * Given a string containing placeholders in {key} format, it assembles a new string
	 * populating the placeholders with the strings contained inside the second argument keys
	 * Unlike luga.string.format, placeholders can match nested properties too. But it's slower
	 *
	 * Example:
	 * luga.string.format("My name is {firstName} {lastName}", {firstName: "Ciccio", lastName: "Pasticcio"});
	 * => "My name is Ciccio Pasticcio"
	 *
	 * Example with nested properties:
	 * var nestedObj = { type: "people", person: { firstName: "Ciccio", lastName: "Pasticcio" } };
	 * luga.string.populate("My name is {person.firstName} {person.lastName}", nestedObj)
	 * => "My name is Ciccio Pasticcio"
	 *
	 * @param   {string} str   String containing placeholders
	 * @param   {object} obj   An objects containing name/value pairs in string format
	 * @returns {string} The newly assembled string
	 */
	luga.string.populate = function(str, obj){
		if(luga.isPlainObject(obj) === true){
			var results;
			while((results = propertyPattern.exec(str)) !== null){
				var property = luga.lookupProperty(obj, results[1]);
				if(property !== undefined){
					var pattern = new RegExp(results[0], "g");
					str = str.replace(pattern, property);
					// Keep searching
					propertyPattern.test(str);
				}
			}
		}
		return str;
	};

	luga.namespace("luga.utils");

	luga.utils.CONST = {
		CSS_CLASSES: {
			MESSAGE: "luga-message",
			ERROR_MESSAGE: "luga-error-message"
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

	/* XML */

	luga.namespace("luga.xml");

	luga.xml.MIME_TYPE = "application/xml";
	luga.xml.ATTRIBUTE_PREFIX = "_";
	luga.xml.DOM_ACTIVEX_NAME = "MSXML2.DOMDocument.4.0";

	/**
	 * Given a DOM node, evaluate an XPath expression against it
	 * Results are returned as an array of nodes. An empty array is returned in case there is no match
	 * @param {Node} node
	 * @param {string} path
	 * @returns {Array<Node>}
	 */
	luga.xml.evaluateXPath = function(node, path){
		var retArray = [];
		/* istanbul ignore if IE-only */
		if(window.ActiveXObject !== undefined){
			var selectedNodes = node.selectNodes(path);
			// Extract the nodes out of the nodeList returned by selectNodes and put them into an array
			// We could directly use the nodeList returned by selectNodes, but this would cause inconsistencies across browsers
			for(var i = 0; i < selectedNodes.length; i++){
				retArray.push(selectedNodes[i]);
			}
			return retArray;
		}
		else{
			var evaluator = new XPathEvaluator();
			var result = evaluator.evaluate(path, node, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
			var currentNode = result.iterateNext();
			// Iterate and populate the array
			while(currentNode !== null){
				retArray.push(currentNode);
				currentNode = result.iterateNext();
			}
			return retArray;
		}
	};

	/**
	 * Convert an XML node into a JavaScript object
	 * @param {Node} node
	 * @returns {object}
	 */
	luga.xml.nodeToHash = function(node){
		var obj = {};
		attributesToProperties(node, obj);
		childrenToProperties(node, obj);
		return obj;
	};

	/**
	 * Map attributes to properties
	 * @param {Node}   node
	 * @param {object} obj
	 */
	function attributesToProperties(node, obj){
		if((node.attributes === null) || (node.attributes === undefined)){
			return;
		}
		for(var i = 0; i < node.attributes.length; i++){
			var attr = node.attributes[i];
			obj[luga.xml.ATTRIBUTE_PREFIX + attr.name] = attr.value;
		}
	}

	/**
	 * Map child nodes to properties
	 * @param {Node}   node
	 * @param {object} obj
	 */
	function childrenToProperties(node, obj){
		for(var i = 0; i < node.childNodes.length; i++){
			var child = node.childNodes[i];

			if(child.nodeType === 1 /* Node.ELEMENT_NODE */){
				var isArray = false;
				var tagName = child.nodeName;

				if(obj[tagName] !== undefined){
					// If the property exists already, turn it into an array
					if(obj[tagName].constructor !== Array){
						var curValue = obj[tagName];
						obj[tagName] = [];
						obj[tagName].push(curValue);
					}
					isArray = true;
				}

				if(nodeHasText(child) === true){
					// This may potentially override an existing property
					obj[child.nodeName] = getTextValue(child);
				}
				else{
					var childObj = luga.xml.nodeToHash(child);
					if(isArray === true){
						obj[tagName].push(childObj);
					}
					else{
						obj[tagName] = childObj;
					}
				}
			}
		}
	}

	/**
	 * Extract text out of a TEXT or CDATA node
	 * @param {Node} node
	 * @returns {string}
	 */
	function getTextValue(node){
		var child = node.childNodes[0];
		/* istanbul ignore else */
		if((child.nodeType === 3) /* TEXT_NODE */ || (child.nodeType === 4) /* CDATA_SECTION_NODE */){
			return child.data;
		}
	}

	/**
	 * Return true if a node contains value, false otherwise
	 * @param {Node}   node
	 * @returns {boolean}
	 */
	function nodeHasText(node){
		var child = node.childNodes[0];
		if((child !== null) && (child.nextSibling === null) && (child.nodeType === 3 /* Node.TEXT_NODE */ || child.nodeType === 4 /* CDATA_SECTION_NODE */)){
			return true;
		}
		return false;
	}

	/**
	 * Serialize a DOM node into a string
	 * @param {Node}   node
	 * @returns {string}
	 */
	luga.xml.nodeToString = function(node){
		/* istanbul ignore if IE-only */
		if(window.ActiveXObject !== undefined){
			return node.xml;
		}
		else{
			var serializer = new XMLSerializer();
			return serializer.serializeToString(node, luga.xml.MIME_TYPE);
		}
	}

	/**
	 * Create a DOM Document out of a string
	 * @param {string} xmlStr
	 * @returns {Document}
	 */
	luga.xml.parseFromString = function(xmlStr){
		var xmlParser;
		/* istanbul ignore if IE-only */
		if(window.ActiveXObject !== undefined){
			var xmlDOMObj = new ActiveXObject(luga.xml.DOM_ACTIVEX_NAME);
			xmlDOMObj.async = false;
			xmlDOMObj.loadXML(xmlStr);
			return xmlDOMObj;
		}
		else{
			xmlParser = new DOMParser();
			var domDoc = xmlParser.parseFromString(xmlStr, luga.xml.MIME_TYPE);
			return domDoc;
		}
	};


}());