/*! 
Luga JS 0.9.7 2018-04-01T14:57:36.048Z
http://www.lugajs.org
Copyright 2013-2018 Massimo Foti (massimo@massimocorner.com)
Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0
 */
/* globals ActiveXObject */

/* istanbul ignore if */
if(typeof(jQuery) === "undefined"){
	throw("Unable to find jQuery");
}
/* istanbul ignore else */
if(typeof(luga) === "undefined"){
	window.luga = {};
}

(function(){
	"use strict";

	/**
	 * Creates namespaces to be used for scoping variables and classes so that they are not global.
	 * Specifying the last node of a namespace implicitly creates all other nodes.
	 * Based on Nicholas C. Zakas's code
	 * @param {String} ns                   Namespace as dot-delimited string
	 * @param {Object} [rootObject=window]  Optional root object. Default to window
	 * @return {Object}
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

	luga.namespace("luga.common");
	luga.common.version = "0.9.7";

	/**
	 * Offers a simple solution for inheritance among classes
	 *
	 * @param {function} baseFunc  Parent constructor function. Required
	 * @param {function} func      Child constructor function. Required
	 * @param {Array}    [args]    An array of arguments that will be passed to the parent's constructor. Optional
	 */
	luga.extend = function(baseFunc, func, args){
		baseFunc.apply(func, args);
	};

	/**
	 * Return true if an object is a plain object (created using "{}" or "new Object"). False otherwise
	 * Based on jQuery.isPlainObject()
	 * @param {*} obj
	 * @return {Boolean}
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
	 * @param {String} path            Fully qualified name of a function
	 * @return {function|undefined}   The javascript reference to the function, undefined if nothing is fund or if it's not a function
	 */
	luga.lookupFunction = function(path){
		if(!path){
			return undefined;
		}
		var reference = luga.lookupProperty(window, path);
		if(luga.type(reference) === "function"){
			return reference;
		}
		return undefined;
	};

	/**
	 * Given an object and a path, returns the property located at the given path
	 * If nothing exists at that location, returns undefined
	 * Supports unlimited nesting levels (if the fully qualified path is passed)
	 * @param {Object} object  Target object
	 * @param {String} path    Dot-delimited string
	 * @return {*|undefined}
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
	 * @param {Object} target     An object that will receive the new properties
	 * @param {Object} source     An object containing additional properties to merge in
	 */
	luga.merge = function(target, source){
		for(var x in source){
			if(source.hasOwnProperty(x) === true){
				target[x] = source[x];
			}
		}
	};

	/**
	 * Given an object, a path and a value, set the property located at the given path to the given value
	 * If the path does not exists, it creates it
	 * @param {Object} object  Target object
	 * @param {String} path    Fully qualified property name
	 * @param {*}      value
	 */
	luga.setProperty = function(object, path, value){
		var parts = path.split(".");
		if(parts.length === 1){
			object[path] = value;
		}
		while(parts.length > 0){
			var part = parts.shift();
			if(object[part] !== undefined){
				if(parts.length === 0){
					// Update
					object[part] = value;
					break;
				}
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

	var class2type = {};
	["Array", "Boolean", "Date", "Error", "Function", "Number", "Object", "RegExp", "String", "Symbol"].forEach(function(element, i, collection){
		class2type["[object " + element + "]"] = element.toLowerCase();
	});

	/**
	 * Determine the internal JavaScript [[Class]] of an object
	 * Based on jQuery.type()
	 * @param {*} obj
	 * @return {String}
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

	/**
	 * @typedef {Object} luga.eventObserverMap
	 *
	 * @property {Object} observer
	 * @property {String} methodName
	 */

	luga.NOTIFIER_CONST = {
		ERROR_MESSAGES: {
			NOTIFIER_ABSTRACT: "It's forbidden to use luga.Notifier directly, it must be used as a base class instead",
			INVALID_GENERIC_OBSERVER_PARAMETER: "addObserver(): observer parameter must be an object",
			INVALID_EVENT_OBSERVER_PARAMETER: "addObserver(): eventName and methodName must be strings",
			INVALID_DATA_PARAMETER: "notifyObserver(): data parameter is required and must be an object"
		}
	};

	/**
	 * Provides the base functionality necessary to maintain a list of observers and send notifications to them.
	 * It's forbidden to use this class directly, it can only be used as a base class.
	 * The Notifier class does not define any notification messages, so it is up to the developer to define the notifications sent via the Notifier.
	 * @throw {Exception}
	 */
	luga.Notifier = function(){
		if(this.constructor === luga.Notifier){
			throw(luga.NOTIFIER_CONST.ERROR_MESSAGES.NOTIFIER_ABSTRACT);
		}

		/**
		 * @type {Array.<Object>}
		 */
		this.observers = [];

		/**
		 * @type {Object.<String, Array.<luga.eventObserverMap>>}
		 */
		this.eventObservers = {};

		var prefix = "on";
		var suffix = "Handler";

		// Turns "complete" into "onComplete"
		var generateGenericMethodName = function(eventName){
			var str = prefix;
			str += eventName.charAt(0).toUpperCase();
			str += eventName.substring(1);
			str += suffix;
			return str;
		};

		/**
		 * Register an observer object.
		 * This method is overloaded. You can either invoke it with one or three arguments
		 *
		 * If you only pass one argument, the given object will be registered as "generic" observer
		 * "Generic" observer objects should implement a method that matches a naming convention for the events they are interested in.
		 * For an event named "complete" they must implement a method named: "onCompleteHandler"
		 * The interface for this methods is as follows:
		 * observer.onCompleteHandler = function(data){};
		 *
		 * If you pass three arguments, the first is the object that will be registered as "event" observer
		 * The second argument is the event name
		 * The third argument is the method of the object that will be invoked once the given event is triggered
		 *
		 * The interface for this methods is as follows:
		 * observer[methodName] = function(data){};
		 *
		 * @param  {Object} observer  Observer object
		 * @param {String} [eventName]
		 * @param {String} [methodName]
		 * @throw {Exception}
		 */
		this.addObserver = function(observer, eventName, methodName){
			if(luga.type(observer) !== "object"){
				throw(luga.NOTIFIER_CONST.ERROR_MESSAGES.INVALID_GENERIC_OBSERVER_PARAMETER);
			}
			if(arguments.length === 1){
				this.observers.push(observer);
			}
			if(arguments.length === 3){
				if(luga.type(eventName) !== "string" || luga.type(methodName) !== "string"){
					throw(luga.NOTIFIER_CONST.ERROR_MESSAGES.INVALID_EVENT_OBSERVER_PARAMETER);
				}
				/**
				 * @type {luga.eventObserverMap}
				 */
				var eventMap = {
					observer: observer,
					methodName: methodName
				};
				// First entry for the given event
				if(this.eventObservers[eventName] === undefined){
					this.eventObservers[eventName] = [eventMap];
				}
				else{
					if(findObserverIndex(this.eventObservers[eventName], eventMap) === -1){
						this.eventObservers[eventName].push(eventMap);
					}
				}
			}
		};

		/**
		 * @param {Array.<luga.eventObserverMap>} eventArray
		 * @param {luga.eventObserverMap} eventMap
		 * @return {Number}
		 */
		var findObserverIndex = function(eventArray, eventMap){
			for(var i = 0; i < eventArray.length; i++){
				/**
				 * @type {luga.eventObserverMap}
				 */
				var currentMap = eventArray[i];
				if(currentMap.observer === eventMap.observer && currentMap.methodName === eventMap.methodName){
					return i;
				}
			}
			return -1;
		};

		/**
		 * Sends a notification to all relevant observers
		 *
		 * @method
		 * @param {String}  eventName  Name of the event
		 * @param {Object}  payload    Object containing data to be passed from the point of notification to all interested observers.
		 *                             If there is no relevant data to pass, use an empty object.
		 * @throw {Exception}
		 */
		this.notifyObservers = function(eventName, payload){
			if(luga.type(payload) !== "object"){
				throw(luga.NOTIFIER_CONST.ERROR_MESSAGES.INVALID_DATA_PARAMETER);
			}
			// "Generic" observers
			var genericMethod = generateGenericMethodName(eventName);
			this.observers.forEach(function(element, i, collection){
				if((element[genericMethod] !== undefined) && (luga.type(element[genericMethod]) === "function")){
					element[genericMethod](payload);
				}
			});
			// "Event" observers
			var eventObservers = this.eventObservers[eventName];
			if(eventObservers !== undefined){
				eventObservers.forEach(function(element, i, collection){
					if(luga.type(element.observer[element.methodName]) === "function"){
						element.observer[element.methodName](payload);
					}
				});
			}
		};

		/**
		 * Removes the given observer object.
		 * This method is overloaded. You can either invoke it with one or three arguments
		 *
		 * If you only pass one argument, the given observer will be removed as "generic" observer
		 *
		 * If you pass three arguments, the given observer will be removed as "event" observer associated with the given event and method
		 *
		 * @method
		 * @param {Object} observer
		 * @param {String} [eventName]
		 * @param {String} [methodName]
		 */
		this.removeObserver = function(observer, eventName, methodName){
			if(arguments.length === 1){
				for(var i = 0; i < this.observers.length; i++){
					if(this.observers[i] === observer){
						this.observers.splice(i, 1);
						break;
					}
				}
			}
			if(arguments.length === 3){
				if(this.eventObservers[eventName] !== undefined){
					/**
					 * @type {luga.eventObserverMap}
					 */
					var eventMap = {
						observer: observer,
						methodName: methodName
					};
					var index = findObserverIndex(this.eventObservers[eventName], eventMap);
					// We have a matching entry
					/* istanbul ignore else */
					if(index !== -1){
						this.eventObservers[eventName].splice(index, 1);
						// Delete empty entries
						if(this.eventObservers[eventName].length === 0){
							delete this.eventObservers[eventName];
						}
					}
				}
			}
		};
	};

	/* DOM */

	luga.namespace("luga.dom");

	/**
	 * Invoke a function as soon as the DOM is loaded
	 * @param {Function} fn
	 */
	luga.dom.ready = function(fn){
		document.addEventListener("DOMContentLoaded", fn);
	};

	/**
	 * Static factory to create a cross-browser either DOM NodeIterator or TreeWalker
	 *
	 * @param {String}                   type        Either "NodeIterator" or "TreeWalker"
	 * @param {HTMLElement}              rootNode    Start node. Required
	 * @param {function} [filterFunc]    filterFunc  Optional filter function. If specified only nodes matching the filter will be accepted
	 *                                               The function will be invoked with this signature: filterFunc(node). Must return true|false
	 * @return {NodeIterator|TreeWalker}
	 */
	var getIteratorInstance = function(type, rootNode, filterFunc){

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
		if(type === "TreeWalker"){
			return document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, safeFilter, false);
		}
		else{
			return document.createNodeIterator(rootNode, NodeFilter.SHOW_ELEMENT, safeFilter, false);
		}

	};

	luga.namespace("luga.dom.nodeIterator");

	/**
	 * Static factory to create a cross-browser DOM NodeIterator
	 * https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator
	 *
	 * @param {HTMLElement}              rootNode    Start node. Required
	 * @param {function} [filterFunc]    filterFunc  Optional filter function. If specified only nodes matching the filter will be accepted
	 *                                               The function will be invoked with this signature: filterFunc(node). Must return true|false
	 * @return {NodeIterator}
	 */
	luga.dom.nodeIterator.getInstance = function(rootNode, filterFunc){
		return getIteratorInstance("NodeIterator", rootNode, filterFunc);
	};

	luga.namespace("luga.dom.treeWalker");

	/**
	 * Static factory to create a cross-browser DOM TreeWalker
	 * https://developer.mozilla.org/en/docs/Web/API/TreeWalker
	 *
	 * @param {HTMLElement}              rootNode    Start node. Required
	 * @param {function} [filterFunc]    filterFunc  Optional filter function. If specified only nodes matching the filter will be accepted
	 *                                   The function will be invoked with this signature: filterFunc(node). Must return true|false
	 * @return {TreeWalker}
	 */
	luga.dom.treeWalker.getInstance = function(rootNode, filterFunc){
		return getIteratorInstance("TreeWalker", rootNode, filterFunc);
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
	 * @param {HTMLElement} rootNode     DOM node wrapping the form fields. Required
	 * @param {Boolean}     demoronize   If true, MS Word's special chars are replaced with plausible substitutes. Default to false
	 * @return {Object}                  A JavaScript object containing name/value pairs
	 * @throw {Exception}
	 */
	luga.form.toMap = function(rootNode, demoronize){
		if(rootNode === null){
			throw(luga.form.CONST.MESSAGES.MISSING_FORM);
		}
		var map = {};
		var fields = luga.form.utils.getChildFields(rootNode);
		fields.forEach(function(item){
			if(luga.form.utils.isSuccessfulField(item) === true){
				var fieldName = item.getAttribute("name");
				var fieldValue = null;
				var fieldType = item.type;
				switch(fieldType){

					case "select-multiple":
						fieldValue = getMultiSelectValue(item);
						break;

					case "checkbox":
					case "radio":
						if(item.checked === true){
							fieldValue = item.value;
						}
						break;

					default:
						fieldValue = item.value;
				}

				if(fieldValue !== null){
					if(demoronize === true){
						fieldValue = luga.string.demoronize(fieldValue);
					}
					if(map[fieldName] === undefined){
						map[fieldName] = fieldValue;
					}
					else if(Array.isArray(map[fieldName]) === true){
						map[fieldName].push(fieldValue);
					}
					else{
						map[fieldName] = [map[fieldName], fieldValue];
					}
				}

			}
		});
		return map;
	};

	/**
	 * @param {HTMLElement} node
	 * @return {Array.<String>}
	 */
	var getMultiSelectValue = function(node){
		var fieldValue = [];
		var options = node.querySelectorAll("option:checked");
		options.forEach(function(item){
			fieldValue.push(item.value);
		});
		return fieldValue;
	};

	/**
	 * Given a form node or another element wrapping input fields, serialize their value into JSON data
	 * If fields names contains dots, their are handled as nested properties
	 * Only fields considered successful are returned:
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 * @param {HTMLElement} rootNode  DOM node wrapping the form fields
	 * @return {json}
	 */
	luga.form.toJson = function(rootNode){
		var flatData = luga.form.toMap(rootNode);
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
	 * @param {HTMLElement} rootNode    DOM node wrapping the form fields. Required
	 * @param {Boolean}     demoronize  If set to true, MS Word's special chars are replaced with plausible substitutes. Default to false
	 * @return {String}                 A URI encoded string
	 * @throw {Exception}
	 */
	luga.form.toQueryString = function(rootNode, demoronize){
		if(rootNode === null){
			throw(luga.form.CONST.MESSAGES.MISSING_FORM);
		}
		var str = "";
		var fields = luga.form.utils.getChildFields(rootNode);

		fields.forEach(function(item){
			if(luga.form.utils.isSuccessfulField(item) === true){
				var fieldName = item.getAttribute("name");
				var fieldType = item.type;
				switch(fieldType){

					case "select-multiple":

						var multiValue = getMultiSelectValue(item);
						multiValue.forEach(function(value){
							str = appendQueryString(str, fieldName, value, demoronize);
						});
						break;

					case "checkbox":
					case "radio":
						if(item.checked === true){
							str = appendQueryString(str, fieldName, item.value, demoronize);
						}
						break;

					default:
						str = appendQueryString(str, fieldName, item.value, demoronize);
				}
			}
		});
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
	 * Returns true if the given DOM field is successful, false otherwise
	 * http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.2
	 *
	 * @param {HTMLElement}  fieldNode
	 * @return {Boolean}
	 */
	luga.form.utils.isSuccessfulField = function(fieldNode){
		if(luga.form.utils.isInputField(fieldNode) === false){
			return false;
		}
		if(fieldNode.disabled === true){
			return false;
		}
		if(fieldNode.getAttribute("name") === null){
			return false;
		}
		return true;
	};

	/**
	 * Returns true if the passed node is a form field that we care about
	 *
	 * @param {jQuery}  fieldNode
	 * @return {Boolean}
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
	 * @param {String} name         Name of the field. Mandatory
	 * @param {jQuery} [rootNode]   Root node, optional, default to document
	 * @return {jQuery}
	 */
	luga.form.utils.getFieldGroup = function(name, rootNode){
		var selector = "input[name='" + name + "']";
		return jQuery(selector, rootNode);
	};

	/**
	 * Returns an array of input fields contained inside a given root node
	 *
	 * @param {HTMLElement}  rootNode   Root node
	 * @return {Array.<HTMLElement>}
	 */
	luga.form.utils.getChildFields = function(rootNode){
		var fields = [];
		rootNode.querySelectorAll(luga.form.CONST.FIELD_SELECTOR).forEach(function(item){
			if(luga.form.utils.isInputField(item) === true){
				fields.push(item);
			}
		});
		return fields;
	};

	luga.namespace("luga.localStorage");

	/**
	 * Retrieve from localStorage the string corresponding to the given combination of root and path
	 * Returns undefined if nothing matches the given root/path
	 * @param {String} root    Top-level key inside localStorage
	 * @param {String} path    Dot-delimited string
	 * @return {*|undefined}
	 */
	luga.localStorage.retrieve = function(root, path){
		return luga.lookupProperty(getRootState(root), path.toString());
	};

	/**
	 * Persist the given string inside localStorage, under the given combination of root and path
	 * The ability to pass a dot-delimited path allow to protect the information from name clashes
	 * @param {String} root    Top-level key inside localStorage
	 * @param {String} path    Dot-delimited string
	 * @param {String} value   String to be persisted
	 */
	luga.localStorage.persist = function(root, path, value){
		var json = getRootState(root);
		luga.setProperty(json, path.toString(), value);
		setRootState(root, json);
	};

	var setRootState = function(root, json){
		localStorage.setItem(root, JSON.stringify(json));
	};

	var getRootState = function(root){
		var rootJson = localStorage.getItem(root);
		if(rootJson === null){
			return {};
		}
		return JSON.parse(rootJson);
	};

	luga.namespace("luga.string");

	/**
	 * Replace MS Word's non-ISO characters with plausible substitutes
	 *
	 * @param {String} str   String containing MS Word's garbage
	 * @return {String}      The de-moronized string
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
	 * @param  {String}  str                   String containing placeholders
	 * @param  {Object|Array.<String>} args    Either an array of strings or an objects containing name/value pairs in string format
	 * @return {String} The newly assembled string
	 */
	luga.string.format = function(str, args){
		var pattern = null;
		if(Array.isArray(args) === true){
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
	 * @param {String} str  The querystring
	 * @return {Object}
	 */
	luga.string.queryToMap = function(str){
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
			else if(Array.isArray(map[fieldName]) === true){
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
	 * @param  {String} str   String containing placeholders
	 * @param  {Object} obj   An objects containing name/value pairs in string format
	 * @return {String} The newly assembled string
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
	 * @param {jQuery} node
	 * @return {String}
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
	 * @param {jQuery}  node   Target node
	 */
	luga.utils.removeDisplayBox = function(node){
		var boxId = generateBoxId(jQuery(node));
		var oldBox = jQuery("#" + boxId);
		// If an error display is already there, get rid of it
		/* istanbul ignore else */
		if(oldBox.length > 0){
			oldBox.remove();
		}
	};

	/**
	 * Display a message box above a given node
	 * @param {jQuery}  node   Target node
	 * @param {String}  html   HTML/Text code to inject
	 * @return {jQuery}
	 */
	luga.utils.displayMessage = function(node, html){
		return luga.utils.displayBox(node, html, luga.utils.CONST.CSS_CLASSES.MESSAGE);
	};

	/**
	 * Display an error box above a given node
	 * @param {jQuery}  node   Target node
	 * @param {String}  html   HTML/Text code to inject
	 * @return {jQuery}
	 */
	luga.utils.displayErrorMessage = function(node, html){
		return luga.utils.displayBox(node, html, luga.utils.CONST.CSS_CLASSES.ERROR_MESSAGE);
	};

	/**
	 * Display a box with a message associated with a given node
	 * Overwrite this method if you want to change the way luga.utils.displayMessage and luga.utils.displayErrorMessage behaves
	 * @param {jQuery}  node                       Target node
	 * @param {String}  html                       HTML/Text code to inject
	 * @param {String}  [cssClass="luga_message"]  CSS class attached to the box. Default to "luga_message"
	 * @return {jQuery}
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

	/* XHR */

	luga.namespace("luga.xhr");

	/**
	 * @typedef {Object} luga.xhr.header
	 *
	 * @property {String}  name       Name of the HTTP header
	 * @property {String}  value      Value to be used
	 */

	/**
	 * @typedef {Object} luga.xhr.options
	 *
	 * @property {String}   method                   HTTP method. Default to GET
	 * @property {Function} success                  Function to be invoked if the request succeeds. It will receive a single argument of type luga.xhr.response
	 * @property {Function} error                    Function to be invoked if the request fails. It will receive a single argument of type luga.xhr.response
	 * @property {Number}   timeout                  The number of milliseconds a request can take before automatically being terminated
	 * @property {Boolean}  async                    Indicate that the request should be handled asynchronously. Default to true
	 * @property {Boolean}  cache                    If set to false, it will force requested pages not to be cached by the browser. Will only work correctly with HEAD and GET requests
	 *                                               It works by appending "_={timestamp}" to the GET parameters. Default to true
	 * @property {Array.<luga.xhr.header>} headers   An array of name/value pairs to be used for custom HTTP headers. Default to an empty array
	 * @property {String}   requestedWith            Value to be used for the "X-Requested-With" request header. Default to "XMLHttpRequest"
	 * @property {String}   contentType              MIME type to use instead of the one specified by the server. Default to "text/plain"
	 *                                               See also: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType
	 */

	/**
	 * @typedef {Object} luga.xhr.response
	 *
	 * @property {Number}       status              Status code returned by the HTTP server
	 * @property {String}       statusText          The response string returned by the HTTP server
	 * @property {String|null}  responseText        The response as text, null if the request was unsuccessful
	 * @property {String}       responseType        A string which specifies what type of data the response contains. See: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
	 * @property {String|null}  responseXML         The response as text, null if the request was unsuccessful or cannot be parsed as XML or HTML
	 * @property {Array.<luga.xhr.header>} headers  An array of header/value pairs returned by the server
	 */

	luga.XHR_CONST = {
		POST_CONTENT_TYPE: "application/x-www-form-urlencoded"
	};

	luga.xhr.Request = function(options){
		var config = {
			method: "GET",
			success: function(res){
				console.debug(res);
			},
			error: function(res){
				console.debug(res);
			},
			timeout: 5000,
			async: true,
			cache: true,
			headers: [],
			requestedWith: "XMLHttpRequest",
			contentType: "text/plain"
		};
		if(options !== undefined){
			luga.merge(config, options);
		}
		if(config.method.toUpperCase() === "POST"){
			config.contentType = luga.XHR_CONST.POST_CONTENT_TYPE;
		}

		var self = this;
		self.xhr = new XMLHttpRequest();

		/**
		 * Turn the string containing HTTP headers into an array of objects
		 * @param {String} str
		 * @return {Array.<luga.xhr.header>}
		 */
		var headersToArray = function(str){
			var headers = str.split("\r\n");
			// Remove the last element since it's empty
			headers.pop();
			return headers.map(function(item){
				var tokens = item.split(":");
				return {
					header: tokens[0],
					value: tokens[1].substring(1)
				};
			});
		};

		/**
		 * @return {luga.xhr.response}
		 */
		var assembleResponse = function(){
			return {
				status: self.xhr.status,
				statusText: self.xhr.statusText,
				responseText: self.xhr.responseText,
				responseType: self.xhr.responseType,
				responseXML: self.xhr.responseXML,
				headers: headersToArray(self.xhr.getAllResponseHeaders())
			};
		};

		var checkReadyState = function(){
			if(self.xhr.readyState === 4){
				var httpStatus = self.xhr.status;
				if((httpStatus >= 200 && httpStatus <= 300) || (httpStatus === 304)){
					config.success(assembleResponse());
				}
				else{
					config.error(assembleResponse());
				}
			}
		};

		var finalizeRequest = function(url){
			self.xhr.onreadystatechange = checkReadyState;
			self.xhr.timeout = config.timeout;
			self.xhr.setRequestHeader("Content-Type", config.contentType);
			/* istanbul ignore else */
			if(url.substring(0, 4) !== "http"){
				// This may cause issue with CORS so better to avoid on cross-site requests
				self.xhr.setRequestHeader("X-Requested-With", config.requestedWith);
			}
			config.headers.forEach(function(item){
				self.xhr.setRequestHeader(item.name, item.value);
			});
		};

		var finalizeUrl = function(url, params){
			var suffix = "";
			if(config.cache === false){
				suffix += "_anti-cache=" + Date.now() + "&";
			}
			if(params !== null && config.method.toUpperCase() === "GET"){
				suffix += params;
			}
			if(suffix !== ""){
				if(url.indexOf("?") !== -1){
					url += "&";
				}
				else{
					url += "?";
				}
			}
			return url + suffix;
		};

		/**
		 * Aborts the request if it has already been sent
		 */
		this.abort = function(){
			self.xhr.abort();
		};

		/**
		 * Return true if the request is pending. False otherwise
		 * @return {Boolean}
		 */
		this.isRequestPending = function(){
			return self.xhr.readyState !== 4;
		};

		/**
		 * @param {String} url
		 * @param {String} [params] Optional parameter which lets you specify the request's body
		 *                          See: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
		 */
		this.send = function(url, params){
			/* istanbul ignore else */
			if(params === undefined){
				params = null;
			}
			url = finalizeUrl(url, params);
			self.xhr.open(config.method, url, config.async);
			finalizeRequest(url);
			self.xhr.send(params);
		};

	};

}());
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
	 * @param {jQuery}                                      formNode      jQuery object wrapping the form
	 * @param {Array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
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
	 * @param {jQuery}                                      formNode      jQuery object wrapping the form
	 * @param {Array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
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
	 * @param {jQuery}                                      formNode      jQuery object wrapping the form
	 * @param {Array.<luga.validator.BaseFieldValidator>}   validators    Array of field validators
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
	 * @typedef {Object} luga.validator.FormValidator.options
	 *
	 * @property {jQuery}  formNode      Either a jQuery object wrapping the form or the naked DOM object. Required
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
		/** @type {Array.<luga.validator.BaseFieldValidator>} */
		self.validators = [];
		/** @type {Array.<luga.validator.BaseFieldValidator>} */
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
		 * @param   {Object} event
		 * @return {Array.<luga.validator.BaseFieldValidator>}
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
		 * @return {Boolean}
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
	 * @typedef {Object} luga.validator.fieldValidatorFactory.getInstance.options
	 *
	 * @property {jquery|undefined} formNode    Either a jQuery object wrapping the form or the naked DOM object
	 *                                          Required in case of radio and checkboxes (that are validated as group), optional in all other cases

	 * @property {jQuery} fieldNode   Either a jQuery object wrapping the field or the naked DOM object. Required
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
	 * @typedef {Object} luga.validator.BaseFieldValidator.options
	 *
	 * @property {jQuery} fieldNode      Either a jQuery object wrapping the field or the naked DOM object. Required
	 * @property {String} message        Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass     CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
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
		 * @return {Boolean}
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
		 * @return {Boolean}
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
	 * @typedef {Object} luga.validator.TextValidator.options
	 *
	 * @property {jQuery} fieldNode               Either a jQuery object wrapping the field or the naked DOM object. Required
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
		 * @return {Boolean}
		 */
		this.isEmpty = function(){
			return self.node.val() === "";
		};

		/**
		 * @return {Boolean}
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
	 * @typedef {Object} luga.validator.SelectValidator.options
	 *
	 * @property {jQuery} fieldNode              Either a jQuery object wrapping the field or the naked DOM object. Required
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
		 * @return {Boolean}
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
	 * @typedef {Object} luga.validator.BaseGroupValidator.options
	 *
	 * @property {jQuery} inputGroup      A jQuery object wrapping input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {String} message         Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass      CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
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
		 * @return {Boolean}
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
	 * @property {jQuery} inputGroup      A jQuery object wrapping input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {String} message         Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass      CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
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
		 * @return {Boolean}
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
	 * @typedef {Object} luga.validator.CheckboxValidator.options
	 *
	 * @property {jQuery} inputGroup      A jQuery object wrapping input fields that share the same name. Use luga.form.utils.getFieldGroup() to obtain it. Required
	 * @property {Number} minchecked      Specify a minimum number of boxes that can be checked in a group. Set it to 1 to allow only one choice. Optional
	 * @property {Number} maxchecked      Specify a maximum number of boxes that can be checked within a group. Optional
	 * @property {String} message         Error message. Can also be set using the "data-lugavalidator-message" attribute. Optional
	 * @property {String} errorclass      CSS class to apply for invalid state. Can also be set using the "data-lugavalidator-errorclass" attribute. Optional
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
		 * @return {Boolean}
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

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
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
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 * @throw {Exception}
	 */
	luga.validator.rules.equalto = function(fieldNode, validator){
		var secondFieldNode = jQuery("#" + validator.config.equalto);
		if(secondFieldNode.length === 0){
			throw(luga.string.format(luga.validator.CONST.MESSAGES.MISSING_EQUAL_TO_FIELD, [validator.config.equalto]));
		}
		return (fieldNode.val() === secondFieldNode.val());
	};

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.datepattern = function(fieldNode, validator){
		var datObj = luga.validator.dateStrToObj(fieldNode.val(), validator.config.datepattern);
		if(datObj !== null){
			return true;
		}
		return false;
	};

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.maxdate = function(fieldNode, validator){
		var pattern = validator.config.datepattern;
		var valueDate = luga.validator.dateStrToObj(fieldNode.val(), pattern);
		var maxDate = luga.validator.dateStrToObj(validator.config.maxdate, pattern);
		if((valueDate !== null) && (maxDate !== null)){
			return valueDate <= maxDate;
		}
		return false;
	};

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.mindate = function(fieldNode, validator){
		var pattern = validator.config.datepattern;
		var valueDate = luga.validator.dateStrToObj(fieldNode.val(), pattern);
		var minDate = luga.validator.dateStrToObj(validator.config.mindate, pattern);
		if((valueDate !== null) && (minDate !== null)){
			return valueDate >= minDate;
		}
		return false;
	};

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.maxlength = function(fieldNode, validator){
		if(fieldNode.val().length > validator.config.maxlength){
			return false;
		}
		return true;
	};

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.minlength = function(fieldNode, validator){
		if(fieldNode.val().length < validator.config.minlength){
			return false;
		}
		return true;
	};

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
	luga.validator.rules.maxnumber = function(fieldNode, validator){
		if(jQuery.isNumeric(fieldNode.val()) === false){
			return false;
		}
		if(parseFloat(fieldNode.val()) <= parseFloat(validator.config.maxnumber)){
			return true;
		}
		return false;
	};

	/**
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 */
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
	 * @param {jQuery} fieldNode
	 * @param {luga.validator.FormValidator} validator
	 * @return {Boolean}
	 * @throw {Exception}
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
	 * @param {regexp} rex
	 * @param {Number} year
	 * @param {Number} month
	 * @param {Number} day
	 * @param {String} separator
	 *
	 * @return {Object}
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
	 * @param {String}   dateStr
	 * @param {String}   dateSpecKey
	 * @return {date|*}
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
	 * Attach form validators to any suitable form inside the document
	 * @param {jQuery} [rootNode=jQuery("body")]  Optional, default to jQuery("body")
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
	 * @typedef {Object} luga.validator.api.validateForm.options
	 *
	 * @property {jQuery} formNode       Either a jQuery object wrapping the form or the naked DOM object. Required
	 * @property {function} error        Name of the function to be invoked to handle/display validation messages.
	 *                                   Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate a form
	 * @param {luga.validator.api.validateForm.options} options
	 * @return {Boolean}
	 */
	luga.validator.api.validateForm = function(options){
		var formValidator = new luga.validator.FormValidator(options);
		formValidator.validate();
		return formValidator.isValid();
	};

	/**
	 * @typedef {Object} luga.validator.api.validateField.options
	 *
	 * @property {jQuery} fieldNode      Either a jQuery object wrapping the field or the naked DOM object. Required
	 * @property {function} error        Function to be invoked to handle/display validation messages.
	 *                                   Default to luga.validator.errorAlert
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
		var dirtyValidators = [];
		var fieldValidator = luga.validator.fieldValidatorFactory.getInstance(options);
		fieldValidator.validate(null);
		if(fieldValidator.isValid() !== true){
			var callBack = luga.lookupFunction(options.error);
			dirtyValidators.push(fieldValidator);
			callBack(options.fieldNode, dirtyValidators);
		}
		return fieldValidator.isValid();
	};

	/**
	 * @typedef {Object} luga.validator.api.validateField.options
	 *
	 * @property {jQuery} fields      A jQuery object wrapping the collection of fields. Required
	 * @property {function} error     Function to be invoked to handle/display validation messages.
	 *                                Default to luga.validator.errorAlert
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
	 * @typedef {Object} luga.validator.api.validateFields.options
	 *
	 * @property {jQuery} rootNode    A jQuery object wrapping the root node. Required
	 * @property {function} error     Function to be invoked to handle/display validation messages.
	 *                                Default to luga.validator.errorAlert
	 */

	/**
	 * Programmatically validate all fields contained inside a given node
	 * @param {luga.validator.api.validateFields.options} options
	 * @return {Boolean}
	 */
	luga.validator.api.validateChildFields = function(options){
		var fields = luga.form.utils.getChildFields(options.rootNode);
		return luga.validator.api.validateFields({
			fields: fields,
			error: options.error
		});
	};

	luga.dom.ready(function(){
		luga.validator.initForms();
	});

}());
/*! 
Luga Data 0.9.7 2018-04-01T11:36:01.087Z
http://www.lugajs.org
Copyright 2013-2018 Massimo Foti (massimo@massimocorner.com)
Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0
 */
/* istanbul ignore if */
if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

/**
 * @typedef {Object} luga.data.dataSourceChanged
 *
 * @property {luga.data.DataSet|luga.data.DetailSet} dataSource
 */

(function(){
	"use strict";

	luga.namespace("luga.data");

	/** @type {hash.<luga.data.DataSet>} */
	luga.data.dataSourceRegistry = {};

	luga.data.CONST = {
		COL_TYPES: ["date", "number", "string"],
		EVENTS: {
			CURRENT_ROW_CHANGED: "currentRowChanged",
			DATA_CHANGED: "dataChanged",
			DATA_SORTED: "dataSorted",
			DATA_LOADING: "dataLoading",
			PRE_DATA_SORTED: "preDataSorted",
			STATE_CHANGED: "stateChanged",
			XHR_ERROR: "xhrError"
		},
		ERROR_MESSAGES: {
			DUPLICATED_UUID: "Unable to register dataSource. The uuuid was already used: {0}",
			INVALID_FILTER_PARAMETER: "Invalid filter. You must use a function as filter",
			INVALID_FILTER_ACTION: "Invalid action from a filter function. A filter must return either a plain object or null (undefined, primitives etc are not valid return values)",
			INVALID_UPDATER_PARAMETER: "Invalid updater. You must use a function as updater",
			INVALID_UPDATER_ACTION: "Invalid action from an updater function. An updater must return a plain object (null, undefined, primitives etc are not valid return values)",
			INVALID_STATE: "luga.data.utils.assembleStateDescription: Unsupported state: {0}"
		},
		PK_KEY: "lugaRowId",
		PK_KEY_PREFIX: "lugaPk_",
		XHR_TIMEOUT: 10000 // Keep this accessible to everybody
	};

	/**
	 * Returns a dataSource from the registry
	 * Returns null if no source matches the given id
	 * @param {String} uuid
	 * @return {luga.data.DataSet|luga.data.DetailSet}
	 */
	luga.data.getDataSource = function(uuid){
		if(luga.data.dataSourceRegistry[uuid] !== undefined){
			return luga.data.dataSourceRegistry[uuid];
		}
		return null;
	};

	/**
	 * Adds a dataSource inside the registry
	 * @param {String}                                uuid
	 * @param {luga.data.DataSet|luga.data.DetailSet} dataSource
	 * @throw {Exception}
	 */
	luga.data.setDataSource = function(uuid, dataSource){
		if(luga.data.getDataSource(uuid) !== null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.DUPLICATED_UUID, [uuid]));
		}
		luga.data.dataSourceRegistry[uuid] = dataSource;
	};

	/**
	 * @typedef {String} luga.data.STATE
	 * @enum {String}
	 */
	luga.data.STATE = {
		ERROR: "error",
		LOADING: "loading",
		READY: "ready"
	};

	luga.namespace("luga.data.utils");

	/**
	 * @typedef {Object} luga.data.stateDescription
	 *
	 * @property {null|luga.data.STATE}  state
	 * @property {Boolean}          isStateLoading
	 * @property {Boolean}          isStateError
	 * @property {Boolean}          isStateReady
	 */

	/**
	 * Given a state string, returns an object containing a boolean field for each possible state
	 * @param {null|luga.data.STATE} state
	 * @throw {Exception}
	 * @return {luga.data.stateDescription}
	 */
	luga.data.utils.assembleStateDescription = function(state){
		if((state !== null) && (luga.data.utils.isValidState(state) === false)){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.INVALID_STATE, [state]));
		}
		return {
			state: state,
			isStateError: (state === luga.data.STATE.ERROR),
			isStateLoading: (state === luga.data.STATE.LOADING),
			isStateReady: (state === luga.data.STATE.READY)
		};
	};

	/**
	 * Apply the given filter function to each passed row
	 * Return an array of filtered rows
	 * @param {Array.<luga.data.DataSet.row>} rows    Required
	 * @param {function}                      filter  Required
	 * @param {luga.data.DataSet}             dataset Required
	 * @return {Array.<luga.data.DataSet.row>}
	 * @throw {Exception}
	 */
	luga.data.utils.filter = function(rows, filter, dataset){
		if(luga.type(filter) !== "function"){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
		}
		var retRows = [];
		for(var i = 0; i < rows.length; i++){
			var filteredRow = filter(rows[i], i, dataset);
			// Row to be removed
			if(filteredRow === null){
				continue;
			}
			// Invalid row
			if(luga.isPlainObject(filteredRow) === false){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FILTER_ACTION);
			}
			// Valid row
			retRows.push(filteredRow);
		}
		return retRows;
	};

	/**
	 * Apply the given updater function to each passed row
	 * @param {Array.<luga.data.DataSet.row>} rows      Required
	 * @param {function}                      formatter Required
	 * @param {luga.data.DataSet}             dataset   Required
	 * @throw {Exception}
	 */
	luga.data.utils.update = function(rows, formatter, dataset){
		if(luga.type(formatter) !== "function"){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_UPDATER_ACTION);
		}
		for(var i = 0; i < rows.length; i++){
			var formattedRow = formatter(rows[i], i, dataset);
			if(luga.isPlainObject(formattedRow) === false){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_UPDATER_ACTION);
			}
		}
	};

	/**
	 * Return true if the passed state is supported
	 * @param {String}  state
	 * @return {Boolean}
	 */
	luga.data.utils.isValidState = function(state){
		for(var key in luga.data.STATE){
			if(luga.data.STATE[key] === state){
				return true;
			}
		}
		return false;
	};

}());
/* global ActiveXObject */

(function(){
	"use strict";

	luga.namespace("luga.data.xml");

	luga.data.xml.MIME_TYPE = "application/xml";
	luga.data.xml.ATTRIBUTE_PREFIX = "_";
	luga.data.xml.DOM_ACTIVEX_NAME = "MSXML2.DOMDocument.4.0";

	/**
	 * Given a DOM node, evaluate an XPath expression against it
	 * Results are returned as an array of nodes. An empty array is returned in case there is no match
	 * @param {Node} node
	 * @param {String} path
	 * @return {Array<Node>}
	 */
	luga.data.xml.evaluateXPath = function(node, path){
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
	 * @return {Object}
	 */
	luga.data.xml.nodeToHash = function(node){
		var obj = {};
		attributesToProperties(node, obj);
		childrenToProperties(node, obj);
		return obj;
	};

	/**
	 * Map attributes to properties
	 * @param {Node}   node
	 * @param {Object} obj
	 */
	function attributesToProperties(node, obj){
		if((node.attributes === null) || (node.attributes === undefined)){
			return;
		}
		for(var i = 0; i < node.attributes.length; i++){
			var attr = node.attributes[i];
			obj[luga.data.xml.ATTRIBUTE_PREFIX + attr.name] = attr.value;
		}
	}

	/**
	 * Map child nodes to properties
	 * @param {Node}   node
	 * @param {Object} obj
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
					var childObj = luga.data.xml.nodeToHash(child);
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
	 * @return {String}
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
	 * @return {Boolean}
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
	 * @return {String}
	 */
	luga.data.xml.nodeToString = function(node){
		/* istanbul ignore if IE-only */
		if(window.ActiveXObject !== undefined){
			return node.xml;
		}
		else{
			var serializer = new XMLSerializer();
			return serializer.serializeToString(node, luga.data.xml.MIME_TYPE);
		}
	};

	/**
	 * Create a DOM Document out of a string
	 * @param {String} xmlStr
	 * @return {Document}
	 */
	luga.data.xml.parseFromString = function(xmlStr){
		var xmlParser;
		/* istanbul ignore if IE-only */
		if(window.ActiveXObject !== undefined){
			var xmlDOMObj = new ActiveXObject(luga.data.xml.DOM_ACTIVEX_NAME);
			xmlDOMObj.async = false;
			xmlDOMObj.loadXML(xmlStr);
			return xmlDOMObj;
		}
		else{
			xmlParser = new DOMParser();
			var domDoc = xmlParser.parseFromString(xmlStr, luga.data.xml.MIME_TYPE);
			return domDoc;
		}
	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.DataSet.row
	 *
	 * @property {String} rowID  Artificial PK
	 */

	/**
	 * @typedef {Object} luga.data.DataSet.currentRowChanged
	 *
	 * @property {String}                oldRowId
	 * @property {luga.data.DataSet.row} oldRow
	 * @property {String}                currentRowId
	 * @property {luga.data.DataSet.row} currentRow
	 * @property {luga.data.DataSet}     dataSet
	 */

	/**
	 * @typedef {Object} luga.data.DataSet.dataSorted
	 *
	 * @property {luga.data.DataSet}    dataSet
	 * @property {Array<String>}        oldSortColumns
	 * @property {luga.data.sort.ORDER} oldSortOrder
	 * @property {Array<String>}        newSortColumns
	 * @property {luga.data.sort.ORDER} newSortOrder
	 */

	/**
	 * @typedef {Object} luga.data.DataSet.stateChanged
	 *
	 * @property {luga.data.DataSet}     dataSet
	 * @property {null|luga.data.STATE}  currentState
	 * @property {null|luga.data.STATE}  oldState
	 */

	/**
	 * @typedef {Object} luga.data.DataSet.context
	 * @extend luga.data.stateDescription
	 *
	 * @property {Number}                         recordCount
	 * @property {Array.<luga.data.DataSet.row>}  entities
	 */

	/**
	 * @typedef {Object} luga.data.DataSet.options
	 *
	 * @property {String}                uuid       Unique identifier. Required
	 * @property {Array.<object>|object} records    Records to be loaded, either one single object containing value/name pairs, or an array of name/value pairs
	 * @property {function}              formatter  A formatting functions to be called once for each row in the dataSet. Default to null
	 * @property {function}              filter     A filter functions to be called once for each row in the dataSet. Default to null
	 */

	/**
	 * Base DataSet class
	 *
	 * @param {luga.data.DataSet.options} options
	 * @constructor
	 * @extend luga.Notifier
	 * @fire dataChanged
	 * @fire currentRowChanged
	 * @fire dataSorted
	 * @fire preDataSorted
	 * @throw {Exception}
	 */
	luga.data.DataSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				INVALID_COL_TYPE: "luga.DataSet.setColumnType(): Invalid type passed {0}",
				INVALID_UUID_PARAMETER: "luga.DataSet: uuid parameter is required",
				INVALID_FORMATTER_PARAMETER: "luga.DataSet: invalid formatter. You must use a function as formatter",
				INVALID_FILTER_PARAMETER: "luga.DataSet: invalid filter. You must use a function as filter",
				INVALID_PRIMITIVE: "luga.DataSet: records can be either an array of objects or a single object. Primitives are not accepted",
				INVALID_PRIMITIVE_ARRAY: "luga.DataSet: records can be either an array of name/value pairs or a single object. Array of primitives are not accepted",
				INVALID_ROW_PARAMETER: "luga.DataSet: invalid row parameter. No available record matches the given row",
				INVALID_ROW_ID_PARAMETER: "luga.DataSet: invalid rowId parameter",
				INVALID_ROW_INDEX_PARAMETER: "luga.DataSet: invalid parameter. Row index is out of range",
				INVALID_SORT_COLUMNS: "luga.DataSet.sort(): Unable to sort dataSet. You must supply one or more column name",
				INVALID_SORT_ORDER: "luga.DataSet.sort(): Unable to sort dataSet. Invalid sort order passed {0}",
				INVALID_STATE: "luga.DataSet: Unsupported state: {0}"
			}
		};

		if(options.uuid === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_UUID_PARAMETER);
		}
		if((options.formatter !== undefined) && (luga.type(options.formatter) !== "function")){
			throw(CONST.ERROR_MESSAGES.INVALID_FORMATTER_PARAMETER);
		}
		if((options.filter !== undefined) && (luga.type(options.filter) !== "function")){
			throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
		}
		luga.extend(luga.Notifier, this);

		/** @type {luga.data.DataSet} */
		var self = this;

		this.uuid = options.uuid;

		/** @type {Array.<luga.data.DataSet.row>} */
		this.records = [];

		/** @type {hash.<luga.data.DataSet.row>} */
		this.recordsHash = {};

		/** @type {null|function} */
		this.formatter = null;
		if(options.formatter !== undefined){
			this.formatter = options.formatter;
		}

		/** @type {null|Array.<luga.data.DataSet.row>} */
		this.filteredRecords = null;

		/** @type {null|function} */
		this.filter = null;

		/** @type {null|luga.data.STATE} */
		this.state = null;

		this.currentRowId = null;
		this.columnTypes = {};
		this.lastSortColumns = [];
		this.lastSortOrder = "";

		luga.data.setDataSource(this.uuid, this);

		/* Private methods */

		var deleteAll = function(){
			self.filteredRecords = null;
			self.records = [];
			self.recordsHash = {};
		};

		var applyFilter = function(){
			if(hasFilter() === true){
				self.filteredRecords = luga.data.utils.filter(self.records, self.filter, self);
				self.resetCurrentRow();
			}
		};

		var applyFormatter = function(){
			if(hasFormatter() === true){
				luga.data.utils.update(self.records, self.formatter, self);
			}
		};

		var hasFilter = function(){
			return (self.filter !== null);
		};

		var hasFormatter = function(){
			return (self.formatter !== null);
		};

		var selectAll = function(){
			if(hasFilter() === true){
				return self.filteredRecords;
			}
			return self.records;
		};

		/* Public methods */

		/**
		 * Remove the current filter function
		 * Triggers a "dataChanged" notification
		 * @fire dataChanged
		 */
		this.clearFilter = function(){
			this.filter = null;
			this.filteredRecords = null;
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Delete records matching the given filter
		 * If no filter is passed, delete all records
		 * @param {function} [filter]    A filter function. If specified only records matching the filter will be returned. Optional
		 *                               The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @fire currentRowChanged
		 * @fire stateChanged
		 * @fire dataChanged
		 * @throw {Exception}
		 */
		this.delete = function(filter){
			if(filter === undefined){
				deleteAll();
			}
			else{
				if(luga.type(filter) !== "function"){
					throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
				}
				var orig = this.records;
				for(var i = 0; i < orig.length; i++){
					if(filter(orig[i], i, this) === null){
						// If matches, delete from array and hash
						var rowToDelete = orig[i];
						this.records.splice(i, 1);
						delete this.recordsHash[rowToDelete[luga.data.CONST.PK_KEY]];
					}
				}
				applyFilter();
			}
			this.resetCurrentRow();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Returns the column type of the specified column. Either "date", "number" or "string"
		 * @param {String} columnName
		 * @return {String}
		 */
		this.getColumnType = function(columnName){
			if(this.columnTypes[columnName] !== undefined){
				return this.columnTypes[columnName];
			}
			return "string";
		};

		/**
		 * @return {luga.data.DataSet.context}
		 */
		this.getContext = function(){
			var context = {
				entities: self.select(),
				recordCount: self.getRecordsCount()
			};
			var stateDesc = luga.data.utils.assembleStateDescription(self.getState());
			luga.merge(context, stateDesc);
			return context;
		};

		/**
		 * Returns the current row object
		 * By default, the current row is the first row of the dataSet, but this can be changed by calling setCurrentRow() or setCurrentRowIndex().
		 * @return {luga.data.DataSet.row|null}
		 */
		this.getCurrentRow = function(){
			return this.getRowById(this.getCurrentRowId());
		};

		/**
		 * Returns the rowId of the current row
		 * Do not confuse the rowId of a row with the index of the row
		 * RowId is a column that contains a unique identifier for the row
		 * This identifier does not change if the rows of the dataSet are sorted
		 * @return {String}
		 */
		this.getCurrentRowId = function(){
			return this.currentRowId;
		};

		/**
		 * Returns a zero-based index at which the current row can be found, or -1 if the dataSet is empty
		 * @return {Number}
		 */
		this.getCurrentRowIndex = function(){
			var row = this.getCurrentRow();
			return this.getRowIndex(row);
		};

		/**
		 * Returns the number of records in the dataSet
		 * If the dataSet has a filter, returns the number of filtered records
		 * @return {Number}
		 */
		this.getRecordsCount = function(){
			return selectAll().length;
		};

		/**
		 * Returns the row object associated with the given unique identifier
		 * @param {String} rowId  Required
		 * @return {null|luga.data.DataSet.row}
		 */
		this.getRowById = function(rowId){
			var targetRow = this.recordsHash[rowId];
			if(targetRow === undefined){
				// Nothing matches
				return null;
			}
			if(hasFilter() === true){
				if(this.filteredRecords.indexOf(targetRow) !== -1){
					return targetRow;
				}
				return null;
			}
			// No filter, return the matching row
			return targetRow;
		};

		/**
		 * Returns the row object associated with the given index
		 * Throws an exception if the index is out of range
		 * @param {Number} index  Required
		 * @return {luga.data.DataSet.row}
		 * @throw {Exception}
		 */
		this.getRowByIndex = function(index){
			var fetchedRow;
			if(hasFilter() === true){
				fetchedRow = this.filteredRecords[index];
			}
			else{
				fetchedRow = this.records[index];
			}
			if(fetchedRow === undefined){
				throw(CONST.ERROR_MESSAGES.INVALID_ROW_INDEX_PARAMETER);
			}
			return fetchedRow;
		};

		/**
		 * Returns the index at which a row can be found in the dataSet, or -1 if no available record matches the given row
		 * @param {luga.data.DataSet.row} row
		 * @return {Number}
		 */
		this.getRowIndex = function(row){
			if(hasFilter() === true){
				return this.filteredRecords.indexOf(row);
			}
			return this.records.indexOf(row);
		};

		/**
		 * Returns the name of the column used for the most recent sort
		 * Returns an empty string if no sort has been performed yet
		 * @return {String}
		 */
		this.getSortColumn = function(){
			return (this.lastSortColumns && this.lastSortColumns.length > 0) ? this.lastSortColumns[0] : "";
		};

		/**
		 * Returns the order used for the most recent sort
		 * Returns an empty string if no sort has been performed yet
		 * @return {String}
		 */
		this.getSortOrder = function(){
			return this.lastSortOrder ? this.lastSortOrder : "";
		};

		/**
		 * Returns the dataSet's current state
		 * @return {null|luga.data.STATE}
		 */
		this.getState = function(){
			return this.state;
		};

		/**
		 * Adds rows to a dataSet
		 * Be aware that the dataSet use passed data by reference
		 * That is, it uses those objects as its row object internally. It does not make a copy
		 * @param  {Array.<Object>|Object} records   Records to be loaded, either one single object containing value/name pairs, or an array of objects. Required
		 * @fire stateChanged
		 * @fire dataChanged
		 * @throw {Exception}
		 */
		this.insert = function(records){
			// If we only get one record, we put it inside an array anyway,
			var recordsHolder = [];
			if(Array.isArray(records) === true){
				recordsHolder = records;
			}
			else{
				// Ensure we don't have primitive values
				if(luga.isPlainObject(records) === false){
					throw(CONST.ERROR_MESSAGES.INVALID_PRIMITIVE);
				}
				recordsHolder.push(records);
			}
			for(var i = 0; i < recordsHolder.length; i++){
				// Ensure we don't have primitive values
				if(luga.isPlainObject(recordsHolder[i]) === false){
					throw(CONST.ERROR_MESSAGES.INVALID_PRIMITIVE_ARRAY);
				}
				// Create new PK
				var recordID = luga.data.CONST.PK_KEY_PREFIX + this.records.length;
				recordsHolder[i][luga.data.CONST.PK_KEY] = recordID;
				this.recordsHash[recordID] = recordsHolder[i];
				this.records.push(recordsHolder[i]);
			}
			applyFormatter();
			applyFilter();
			this.resetCurrentRow();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Reset the currentRowId. Persist previous selection if possible
		 * @fire currentRowChanged
		 */
		this.resetCurrentRow = function(){
			// If we have previous selection
			if(this.currentRowId !== null){
				// Try to persist
				var targetRow = this.getRowById(this.currentRowId);
				if(targetRow !== null){
					this.setCurrentRowId(this.currentRowId);
					return;
				}
			}
			// No previous selection
			this.resetCurrentRowToFirst();
		};

		/**
		 * Reset the currentRowId to the first record available
		 * @fire currentRowChanged
		 */
		this.resetCurrentRowToFirst = function(){
			// We have a filter
			if(hasFilter() === true){
				if((this.filteredRecords === null) || (this.filteredRecords.length === 0)){
					this.setCurrentRowId(null);
					return;
				}
				else {
					// First among the filtered records
					this.setCurrentRowId(this.filteredRecords[0][luga.data.CONST.PK_KEY]);
					return;
				}
			}
			// No filter
			if(this.records.length > 0){
				// First record
				this.setCurrentRowId(this.records[0][luga.data.CONST.PK_KEY]);
			}
			else{
				this.setCurrentRowId(null);
			}
		};

		/**
		 * Returns an array of the internal row objects that store the records in the dataSet
		 * Be aware that modifying any property of a returned object results in a modification of the internal records (since records are passed by reference)
		 * @param {function} [filter]    An optional filter function. If specified only records matching the filter will be returned. Optional
		 *                               The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @return {Array.<luga.data.DataSet.row>}
		 * @throw {Exception}
		 */
		this.select = function(filter){
			if(filter === undefined){
				return selectAll();
			}
			if(luga.type(filter) !== "function"){
				throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			return luga.data.utils.filter(selectAll(), filter, self);
		};

		/**
		 * Set a column type for a column. Required for proper sorting of numeric or date data.
		 * By default data is sorted alpha-numerically, if you want it sorted numerically or by date, set the proper columnType
		 * @param {String|Array<String>} columnNames
		 * @param {String}               columnType   Either "date", "number" or "string"
		 */
		this.setColumnType = function(columnNames, columnType){
			if(Array.isArray(columnNames) === false){
				columnNames = [columnNames];
			}
			for(var i = 0; i < columnNames.length; i++){
				var colName = columnNames[i];
				if(luga.data.CONST.COL_TYPES.indexOf(columnType) === -1){
					throw(luga.string.format(CONST.ERROR_MESSAGES.INVALID_COL_TYPE, [colName]));
				}
				this.columnTypes[colName] = columnType;
			}
		};

		/**
		 * Sets the current row of the data set to the row matching the given rowId
		 * Throws an exception if the given rowId is invalid
		 * If null is passed, no row is selected
		 * Triggers a "currentRowChanged" notification
		 * @param {String|null} rowId  Required
		 * @fire currentRowChanged
		 * @throw {Exception}
		 */
		this.setCurrentRowId = function(rowId){
			// No need to do anything
			if(this.currentRowId === rowId){
				return;
			}
			/**
			 * @type {luga.data.DataSet.currentRowChanged}
			 */
			var notificationData = {
				oldRowId: this.getCurrentRowId(),
				oldRow: this.getRowById(this.currentRowId),
				currentRowId: rowId,
				currentRow: this.getRowById(rowId),
				dataSet: this
			};
			// Set to null
			if((rowId === null) && (this.currentRowId !== null)){
				this.currentRowId = null;
				this.notifyObservers(luga.data.CONST.EVENTS.CURRENT_ROW_CHANGED, notificationData);
				return;
			}
			// Validate input
			if(this.getRowById(rowId) === null){
				throw(CONST.ERROR_MESSAGES.INVALID_ROW_ID_PARAMETER);
			}
			this.currentRowId = rowId;
			this.notifyObservers(luga.data.CONST.EVENTS.CURRENT_ROW_CHANGED, notificationData);
		};

		/**
		 * Set the passed row as currentRow
		 * Throws an exception if no available record matches the given row
		 * @param {luga.data.DataSet.row} row
		 * @fire currentRowChanged
		 * @throw {Exception}
		 */
		this.setCurrentRow = function(row){
			var fetchedRowId = this.getRowIndex(row);
			if(fetchedRowId === -1){
				throw(CONST.ERROR_MESSAGES.INVALID_ROW_PARAMETER);
			}
			this.setCurrentRowId(luga.data.CONST.PK_KEY_PREFIX + fetchedRowId);
		};

		/**
		 * Sets the current row of the dataSet to the one matching the given index
		 * Throws an exception if the index is out of range
		 * @param {Number} index  New index. Required
		 * @fire currentRowChanged
		 * @throw {Exception}
		 */
		this.setCurrentRowIndex = function(index){
			this.setCurrentRow(this.getRowByIndex(index));
		};

		/**
		 * Replace current filter with a new filter functions and apply the new filter
		 * Triggers a "dataChanged" notification
		 * @param {function} filter   A filter functions to be called once for each row in the data set. Required
		 *                            The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @fire currentRowChanged
		 * @fire dataChanged
		 * @throw {Exception}
		 */
		this.setFilter = function(filter){
			if(luga.type(filter) !== "function"){
				throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			this.filter = filter;
			applyFilter();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Set current state
		 * This method is not intended to be called outside the dataSet. It's public only to be accessible to subclasses
		 * @param {null|luga.data.STATE} newState
		 * @fire stateChanged
		 */
		this.setState = function(newState){
			if(luga.data.utils.isValidState(newState) === false){
				throw(luga.string.format(CONST.ERROR_MESSAGES.INVALID_STATE, [newState]));
			}
			var oldState = this.state;
			this.state = newState;

			/** @type {luga.data.DataSet.stateChanged} */
			var notificationData = {
				oldState: oldState,
				currentState: this.state,
				dataSet: this
			};

			this.notifyObservers(luga.data.CONST.EVENTS.STATE_CHANGED, notificationData);
		};

		/**
		 * Sorts the dataSet using the given column(s) and sort order
		 * @param {String|Array<String>}  columnNames             Required, either a single column name or an array of names
		 * @param {luga.data.sort.ORDER} [sortOrder="toggle"]     Either "ascending", "descending" or "toggle". Optional, default to "toggle"
		 * @fire preDataSorted
		 * @fire dataSorted
		 * @fire dataChanged
		 */
		this.sort = function(columnNames, sortOrder){
			/*
			 Very special thanks to Kin Blas https://github.com/jblas
			 */
			if((columnNames === undefined) || (columnNames === null)){
				throw(CONST.ERROR_MESSAGES.INVALID_SORT_COLUMNS);
			}
			if(sortOrder === undefined){
				sortOrder = luga.data.sort.ORDER.TOG;
			}
			if(luga.data.sort.isValidSortOrder(sortOrder) === false){
				throw(luga.string.format(CONST.ERROR_MESSAGES.INVALID_SORT_ORDER, [sortOrder]));
			}

			var sortColumns = assembleSortColumns(columnNames);

			if(sortOrder === luga.data.sort.ORDER.TOG){
				sortOrder = defineToggleSortOrder(sortColumns);
			}

			/** @type {luga.data.DataSet.dataSorted} */
			var notificationData = {
				dataSet: this,
				oldSortColumns: this.lastSortColumns,
				oldSortOrder: this.lastSortOrder,
				newSortColumns: sortColumns,
				newSortOrder: sortOrder
			};

			this.notifyObservers(luga.data.CONST.EVENTS.PRE_DATA_SORTED, notificationData);

			var sortColumnName = sortColumns[sortColumns.length - 1];
			var sortColumnType = this.getColumnType(sortColumnName);
			var sortFunction = luga.data.sort.getSortStrategy(sortColumnType, sortOrder);

			for(var i = sortColumns.length - 2; i >= 0; i--){
				var columnToSortName = sortColumns[i];
				var columnToSortType = this.getColumnType(columnToSortName);
				var sortStrategy = luga.data.sort.getSortStrategy(columnToSortType, sortOrder);
				sortFunction = buildSecondarySortFunction(sortStrategy(columnToSortName), sortFunction);
			}

			this.records.sort(sortFunction);
			applyFilter();
			this.resetCurrentRowToFirst();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_SORTED, notificationData);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});

			// Keep track of sorting criteria
			this.lastSortColumns = sortColumns.slice(0); // Copy the array.
			this.lastSortOrder = sortOrder;

		};

		var buildSecondarySortFunction = function(funcA, funcB){
			return function(a, b){
				var ret = funcA(a, b);
				if(ret === 0){
					ret = funcB(a, b);
				}
				return ret;
			};
		};

		var assembleSortColumns = function(columnNames){
			// If only one column name was specified for sorting
			// Do a secondary sort on PK so we get a stable sort order
			if(Array.isArray(columnNames) === false){
				return [columnNames, luga.data.CONST.PK_KEY];
			}
			else if(columnNames.length < 2 && columnNames[0] !== luga.data.CONST.PK_KEY){
				columnNames.push(luga.data.CONST.PK_KEY);
				return columnNames;
			}
			return columnNames;
		};

		var defineToggleSortOrder = function(sortColumns){
			if((self.lastSortColumns.length > 0) && (self.lastSortColumns[0] === sortColumns[0]) && (self.lastSortOrder === luga.data.sort.ORDER.ASC)){
				return luga.data.sort.ORDER.DESC;
			}
			else{
				return luga.data.sort.ORDER.ASC;
			}
		};

		/**
		 * Updates rows inside the dataSet
		 * @param {function} filter   Filter function to be used as search criteria. Required
		 *                            The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @param {function} updater  Updater function. Required
		 *                            The function is going to be called with this signature: myUpdater(row, rowIndex, dataSet)
		 * @fire stateChanged
		 * @fire dataChanged
		 * @throw {Exception}
		 */
		this.update = function(filter, updater){
			/** @type {Array.<luga.data.DataSet.row>} */
			var filteredRecords = luga.data.utils.filter(this.records, filter, this);
			luga.data.utils.update(filteredRecords, updater, this);
			this.resetCurrentRow();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/* Constructor */

		if(options.filter !== undefined){
			this.setFilter(options.filter);
		}
		if(options.records !== undefined){
			this.insert(options.records);
		}

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.DetailSet.context
	 * @extend luga.data.stateDescription
	 *
	 * @property {null|luga.data.DataSet.row} entity
	 */

	/**
	 * @typedef {Object} luga.data.DetailSet.options
	 *
	 * @property {String}            uuid           Unique identifier. Required
	 * @property {luga.data.DataSet} parentDataSet  Master dataSet. Required
	 */

	/**
	 * DetailSet class
	 * Register itself as observer of the passed dataSet and act as the details in a master/details scenario
	 *
	 * @param {luga.data.DetailSet.options} options
	 * @constructor
	 * @extend luga.Notifier
	 * @fire dataChanged
	 * @listen dataChanged
	 * @listen currentRowChanged
	 */
	luga.data.DetailSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				INVALID_UUID_PARAMETER: "luga.data.DetailSet: id parameter is required",
				INVALID_DS_PARAMETER: "luga.data.DetailSet: parentDataSet parameter is required"
			}
		};

		if(options.uuid === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_UUID_PARAMETER);
		}
		if(options.parentDataSet === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_DS_PARAMETER);
		}

		luga.extend(luga.Notifier, this);

		/** @type {luga.data.DetailSet} */
		var self = this;

		this.uuid = options.uuid;
		this.parentDataSet = options.parentDataSet;
		this.parentDataSet.addObserver(this);

		/** @type {luga.data.DataSet.row} */
		this.row = null;

		luga.data.setDataSource(this.uuid, this);

		/**
		 * @return {luga.data.DetailSet.context}
		 */
		this.getContext = function(){
			var context = {
				entity: self.row
			};
			var stateDesc = luga.data.utils.assembleStateDescription(self.getState());
			luga.merge(context, stateDesc);
			return context;
		};

		/**
		 * Returns the detailSet's current state
		 * @return {null|luga.data.STATE}
		 */
		this.getState = function(){
			return self.parentDataSet.getState();
		};

		this.fetchRow = function(){
			self.row = self.parentDataSet.getCurrentRow();
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.fetchRow();
		};

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			self.fetchRow();
		};

		/**
		 * @param {luga.data.DataSet.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.fetchRow();
		};

		/* Fetch row without notifying observers */
		self.row = self.parentDataSet.getCurrentRow();

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.DataSet.dataLoading
	 *
	 * @property {luga.data.DataSet} dataSet
	 */

	/**
	 * @typedef {Object} luga.data.HttpDataSet.options
	 *
	 * @extend luga.data.DataSet.options
	 * @property {String}    url              URL to be fetched. Default to null
	 * @property {Number}    timeout          Timeout (in milliseconds) for the HTTP request. Default to 10 seconds
	 * @property {Object}    headers          A set of name/value pairs to be used as custom HTTP headers
	 * @property {Boolean}   incrementalLoad  By default calling once .loadData() is called the dataSet discard all the previous records.
	 *                                        Set this to true to keep the old records. Default to false
	 * @property {Boolean}   cache            If set to false, it will force requested pages not to be cached by the browser.
	 *                                        It works by appending "_={timestamp}" to the querystring. Default to true
	 */

	/**
	 * Base HttpDataSet class
	 * @param {luga.data.HttpDataSet.options} options
	 * @constructor
	 * @extend luga.data.DataSet
	 * @abstract
	 * @fire dataLoading
	 * @fire xhrError
	 * @throw {Exception}
	 */
	luga.data.HttpDataSet = function(options){
		luga.extend(luga.data.DataSet, this, [options]);
		/** @type {luga.data.HttpDataSet} */
		var self = this;

		var CONST = {
			ERROR_MESSAGES: {
				HTTP_DATA_SET_ABSTRACT: "luga.data.HttpDataSet is an abstract class",
				XHR_FAILURE: "Failed to retrieve: {0}. HTTP status: {1}. Error: {2}",
				NEED_URL_TO_LOAD: "Unable to call loadData(). DataSet is missing a URL"
			}
		};

		if(this.constructor === luga.data.HttpDataSet){
			throw(CONST.ERROR_MESSAGES.HTTP_DATA_SET_ABSTRACT);
		}

		this.url = null;
		if(options.url !== undefined){
			this.url = options.url;
		}

		this.timeout = luga.data.CONST.XHR_TIMEOUT;
		if(options.timeout !== undefined){
			this.timeout = options.timeout;
		}

		this.cache = true;
		if(options.cache !== undefined){
			this.cache = options.cache;
		}

		this.headers = [];
		if(options.headers !== undefined){
			this.headers = options.headers;
		}

		this.incrementalLoad = false;
		if(options.incrementalLoad !== undefined){
			this.incrementalLoad = options.incrementalLoad;
		}

		// Concrete implementations can override this
		this.contentType = "text/plain";
		this.xhrRequest = null;

		/* Private methods */

		var loadUrl = function(){
			var xhrOptions = {
				url: self.url,
				success: function(response){
					if(self.incrementalLoad === false){
						self.delete();
					}
					self.loadRecords(response);
				},
				contentType: self.contentType,
				timeout: self.timeout,
				cache: self.cache,
				headers: self.headers,
				error: self.xhrError
			};
			self.xhrRequest = new luga.xhr.Request(xhrOptions);
			self.xhrRequest.send(self.url);
		};

		/* Public methods */

		/**
		 * Abort any pending XHR request
		 */
		this.cancelRequest = function(){
			if(this.xhrRequest !== null){
				this.xhrRequest.abort();
				this.xhrRequest = null;
			}
		};

		/**
		 * Returns the URL that will be used to fetch the data. Returns null if URL is not set
		 * @return {String|null}
		 */
		this.getUrl = function(){
			return this.url;
		};

		/**
		 * Fires an XHR request to fetch and load the data, notify observers ("dataLoading" first, "dataChanged" after records are loaded).
		 * Throws an exception if URL is not set
		 * @fire dataLoading
		 * @throw {Exception}
		 */
		this.loadData = function(){
			if(this.url === null){
				throw(CONST.ERROR_MESSAGES.NEED_URL_TO_LOAD);
			}
			this.setState(luga.data.STATE.LOADING);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_LOADING, {dataSet: this});
			this.cancelRequest();
			loadUrl();
		};

		/**
		 * Abstract method, concrete classes must implement it to extract records from XHR response
		 * @param {luga.xhr.response} response
		 * @abstract
		 */
		/* istanbul ignore next */
		this.loadRecords = function(response){
		};

		/**
		 * Set the URL that will be used to fetch the data.
		 * This method does not load the data into the data set, it merely sets the internal URL.
		 * The developer must call loadData() to actually trigger the data loading
		 * @param {String} newUrl
		 */
		this.setUrl = function(newUrl){
			this.url = newUrl;
		};

		/**
		 * Is called whenever an XHR request fails, set state to error, notify observers ("xhrError")
		 * @param {luga.xhr.response} response
		 * @fire xhrError
		 */
		this.xhrError = function(response){
			self.setState(luga.data.STATE.ERROR);
			self.notifyObservers(luga.data.CONST.EVENTS.XHR_ERROR, {
				dataSet: self,
				message: luga.string.format(CONST.ERROR_MESSAGES.XHR_FAILURE, [self.url, response.status]),
				response: response
			});
		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.JsonDataSet.options
	 *
	 * @extend luga.data.HttpDataSet.options
	 * @property {String|null}   path      Specifies the path to the data within the JSON structure.
	 *                                     The path is expressed as a set of property names on the objects, separated by dots. Default to null
	 */

	/**
	 * JSON dataSet class
	 * @param {luga.data.JsonDataSet.options} options
	 * @constructor
	 * @extend luga.data.HttpDataSet
	 */
	luga.data.JsonDataSet = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.JsonDataSet} */
		var self = this;
		/** @override */
		this.contentType = "application/json";

		this.path = null;
		if(options.path !== undefined){
			this.path = options.path;
		}

		/** @type {null|json} */
		this.rawJson = null;

		/* Public methods */

		/**
		 * Returns the raw JSON data structure
		 * @return {null|json}
		 */
		this.getRawJson = function(){
			return this.rawJson;
		};

		/**
		 * Returns the path to be used to extract data out of the JSON data structure
		 * @return {null|String}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * First delete any existing records, then load data from the given JSON, without XHR calls
		 * @param {json} json
		 */
		this.loadRawJson = function(json){
			self.delete();
			loadFromJson(json);
		};

		/**
		 * Retrieves JSON data from an HTTP response, apply the path, if any, extract and load records out of it
		 * @param {luga.xhr.response} response
		 * @override
		 */
		this.loadRecords = function(response){
			loadFromJson(JSON.parse(response.responseText));
		};

		var loadFromJson = function(json){
			self.rawJson = json;
			if(self.path === null){
				self.insert(json);
			}
			else{
				var records = luga.lookupProperty(json, self.path);
				if(records !== undefined){
					self.insert(records);
				}
			}
		};

		/**
		 * Set the path to be used to extract data out of the JSON data structure
		 * @param {String} path   Data path, expressed as a set of property names on the objects, separated by dots. Required
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.XmlDataSet.options
	 *
	 * @extend luga.data.HttpDataSet.options
	 * @property {String} path  Specifies the XPath expression to be used to extract nodes from the XML document. Default to: "/"
	 */

	/**
	 * XML dataSet class
	 * @param {luga.data.XmlDataSet.options} options
	 * @constructor
	 * @extend luga.data.HttpDataSet
	 */
	luga.data.XmlDataSet = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.XmlDataSet} */
		var self = this;
		/** @override */
		this.contentType = "text/xml";

		this.path = "/";
		if(options.path !== undefined){
			this.path = options.path;
		}

		/** @type {null|Node} */
		this.rawXml = null;

		/* Public methods */

		/**
		 * Returns the raw XML data
		 * @return {null|Node}
		 */
		this.getRawXml = function(){
			return this.rawXml;
		};

		/**
		 * Returns the XPath expression to be used to extract data out of the XML
		 * @return {null|String}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * First delete any existing records, then load data from the given XML, without XHR calls
		 * @param {String} xmlStr
		 */
		this.loadRawXml = function(xmlStr){
			self.delete();
			self.loadRecords({
				responseText: xmlStr
			});
		};

		/**
		 * Retrieves XML data from an HTTP response, apply the path, if any, extract and load records out of it
		 * @param {luga.xhr.response} response
		 * @override
		 */
		this.loadRecords = function(response){
			var xmlDoc = luga.data.xml.parseFromString(response.responseText);
			self.rawXml = xmlDoc;
			var nodes = luga.data.xml.evaluateXPath(xmlDoc, self.path);
			var records = [];
			for(var i = 0; i < nodes.length; i++){
				records.push(luga.data.xml.nodeToHash(nodes[i]));
			}
			self.insert(records);
		};

		/**
		 * Set the the XPath expression to be used to extract data out of the XML
		 * @param {String} path   XPath expression. Required
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());
/**
 * @typedef {Object} luga.data.DataSet.context
 * @extend luga.data.stateDescription
 *
 * @property {Number}                         recordCount
 * @property {Array.<luga.data.DataSet.row>}  items
 */

(function(){
	"use strict";

	/**
	 * RSS 2.0 dataSet class
	 * @param {luga.data.HttpDataSet.options} options
	 * @constructor
	 * @extend luga.data.HttpDataSet
	 */
	luga.data.Rss2Dataset = function(options){
		luga.extend(luga.data.XmlDataSet, this, [options]);
		/** @type {luga.data.Rss2Dataset} */
		var self = this;

		/** @type {null|string} */
		this.rawXml = null;

		/** @type {Array.<String>} */
		this.channelElements = ["title", "link", "description", "language", "copyright", "managingEditor", "webMaster", "pubDate", "lastBuildDate", "category", "generator", "docs", "cloud", "ttl", "image", "textInput", "skipHours", "skipDays"];

		/** @type {Array.<String>} */
		this.itemElements = ["title", "link", "description", "author", "category", "comments", "enclosure", "guid", "pubDate", "source"];

		// Store metadata extracted from <channel>
		this.channelMeta = {};

		/**
		 * Given an <item> node, extract its content inside a JavaScript object
		 * @param {Node} item
		 * @return {Object}
		 */
		var itemToHash = function(item){
			var rec = {};
			self.itemElements.forEach(function(element){
				var nodes = luga.data.xml.evaluateXPath(item, element);
				if(nodes.length > 0){
					rec[element] = nodes[0].innerHTML;
				}
			});
			return rec;
		};

		/**
		 * Extract metadata from <channel>
		 * @param {Node} channel
		 */
		var setChannelMeta = function(channel){
			self.channelElements.forEach(function(element){
				var nodes = luga.data.xml.evaluateXPath(channel, element);
				if(nodes.length > 0){
					self.channelMeta[element] = nodes[0].innerHTML;
				}
			});
		};

		/**
		 * Turn an array of <items> nodes into an array of records
		 * @param {Array.<Node>} nodes
		 * @return {Array.<Object>|Object}
		 */
		var extractRecords = function(nodes){
			var records = [];
			nodes.forEach(function(element){
				records.push(itemToHash(element));
			});
			return records;
		};

		/* Public methods */

		/**
		 * @return {luga.data.Rss2Dataset.context}
		 * @override
		 */
		this.getContext = function(){
			var context = {
				items: self.select(),
				recordCount: self.getRecordsCount()
			};
			var stateDesc = luga.data.utils.assembleStateDescription(self.getState());
			luga.merge(context, stateDesc);
			luga.merge(context, self.channelMeta);
			return context;
		};

		/**
		 * Retrieves XML data, either from an HTTP response
		 * @param {luga.xhr.response} response
		 * @override
		 */
		this.loadRecords = function(response){
			var xmlDoc = luga.data.xml.parseFromString(response.responseText);
			self.rawXml = xmlDoc;
			// Extract metadata
			var channelNodes = luga.data.xml.evaluateXPath(xmlDoc, "//channel");
			setChannelMeta(channelNodes[0]);
			// Insert all records
			var items = luga.data.xml.evaluateXPath(xmlDoc, "//item");
			var records = extractRecords(items);
			self.insert(records);
		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.ChildJsonDataSet.options
	 *
	 * @extend luga.data.JsonDataSet.options
	 * @property {luga.data.DataSet}  parentDataSet   Parent dataSet to be used in a master-detail scenario
	 * @property {String}             url             Unlike JsonDataSet the url here is required and is expected to be a string template like:
	 *                                                http://www.ciccio.com/api/products/{uuid}
	 *
	 */

	/**
	 * Binded JSON dataSet class
	 * @param {luga.data.ChildJsonDataSet.options} options
	 * @constructor
	 * @extend luga.data.JsonDataSet
	 */
	luga.data.ChildJsonDataSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				MISSING_PARENT_DS: "luga.data.ChildJsonDataSet: parentDataSet parameter is required",
				MISSING_URL: "luga.data.ChildJsonDataSet: url parameter is required",
				FAILED_URL_BINDING: "luga.data.ChildJsonDataSet: unable to generate valid URL: {0}"
			}
		};

		if(options.parentDataSet === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_PARENT_DS);
		}

		if(options.url === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_URL);
		}

		luga.extend(luga.data.JsonDataSet, this, [options]);

		/** @type {luga.data.ChildJsonDataSet} */
		var self = this;

		/** @type {luga.data.JsonDataSet} */
		this.parentDataSet = options.parentDataSet;
		this.parentDataSet.addObserver(this);
		this.url = null;
		this.urlPattern = options.url;

		/**
		 * @param {luga.data.DataSet.row} row
		 */
		this.fetchData = function(row){
			var bindUrl = luga.string.populate(self.urlPattern, row);
			if(bindUrl === self.urlPattern){
				throw(luga.string.format(CONST.ERROR_MESSAGES.FAILED_URL_BINDING, [bindUrl]));
			}
			self.setUrl(bindUrl);
			self.loadData();
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			if(data.currentRow !== null){
				self.fetchData(data.currentRow);
			}
			else{
				self.delete();
			}

		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.ChildXmlDataSet.options
	 *
	 * @extend luga.data.XmlDataSet.options
	 * @property {luga.data.DataSet}  parentDataSet   Parent dataSet to be used in a master-detail scenario
	 * @property {String}             url             Unlike XmlDataSet the url here is required and is expected to be a string template like:
	 *                                                http://www.ciccio.com/api/products/{uuid}
	 *
	 */

	/**
	 * Binded XML dataSet class
	 * @param {luga.data.ChildXmlDataSet.options} options
	 * @constructor
	 * @extend luga.data.XmlDataSet
	 */
	luga.data.ChildXmlDataSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				MISSING_PARENT_DS: "luga.data.ChildXmlDataSet: parentDataSet parameter is required",
				MISSING_URL: "luga.data.ChildXmlDataSet: url parameter is required",
				FAILED_URL_BINDING: "luga.data.ChildXmlDataSet: unable to generate valid URL: {0}"
			}
		};

		if(options.parentDataSet === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_PARENT_DS);
		}

		if(options.url === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_URL);
		}

		luga.extend(luga.data.XmlDataSet, this, [options]);

		/** @type {luga.data.ChildXmlDataSet} */
		var self = this;

		/** @type {luga.data.XmlDataSet} */
		this.parentDataSet = options.parentDataSet;
		this.parentDataSet.addObserver(this);
		this.url = null;
		this.urlPattern = options.url;

		/**
		 * @param {luga.data.DataSet.row} row
		 */
		this.fetchData = function(row){
			var bindUrl = luga.string.populate(self.urlPattern, row);
			if(bindUrl === self.urlPattern){
				throw(luga.string.format(CONST.ERROR_MESSAGES.FAILED_URL_BINDING, [bindUrl]));
			}
			self.setUrl(bindUrl);
			self.loadData();
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			if(data.currentRow !== null){
				self.fetchData(data.currentRow);
			}
			else{
				self.delete();
			}

		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.PagedView.context
	 *
	 * @extend luga.data.DataSet.context
	 * @property {Number} currentPageNumber        The current page index. Starting at 1
	 * @property {Number} currentPageRecordCount   The total number of records in the current page
	 * @property {Number} pageCount                The total number of pages required to display all of the data
	 * @property {Number} pageSize                 The maximum number of items that can be in a page
	 * @property {Number} currentOffsetStart       Zero-based offset of the first record inside the current page
	 * @property {Number} currentOffsetEnd         Zero-based offset of the last record inside the current page
	 */

	/**
	 * @typedef {Object} luga.data.PagedView.options
	 *
	 * @property {String}            uuid           Unique identifier. Required
	 * @property {luga.data.DataSet} parentDataSet  Instance of a dataSet. Required
	 * @property {Number}            pageSize       The max number of rows in a given page. Default to 10
	 */

	/*
	 *  PagedView class
	 *  Works by reading a dataSet and extracting information out of it in order to generate additional information that can be used for paging
	 *
	 * @param {luga.data.PagedView.options} options
	 * @constructor
	 * @extend luga.Notifier
	 */
	luga.data.PagedView = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				INVALID_UUID_PARAMETER: "luga.data.PagedView: id parameter is required",
				INVALID_DS_PARAMETER: "luga.data.PagedView: parentDataSet parameter is required"
			}
		};

		if(options.uuid === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_UUID_PARAMETER);
		}
		if(options.parentDataSet === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_DS_PARAMETER);
		}

		luga.extend(luga.Notifier, this);

		/** @type {luga.data.PagedView} */
		var self = this;

		this.uuid = options.uuid;
		this.parentDataSet = options.parentDataSet;
		this.parentDataSet.addObserver(this);

		luga.data.setDataSource(this.uuid, this);

		var pageSize = 10;
		if(options.pageSize !== undefined){
			pageSize = options.pageSize;
		}

		var currentPage = 1;
		var currentOffsetStart = 0;

		/**
		 * @return {luga.data.PagedView.context}
		 */
		this.getContext = function(){
			var context = self.parentDataSet.getContext();
			context.entities = context.entities.slice(self.getCurrentOffsetStart(), self.getCurrentOffsetEnd() + 1);
			// Additional fields
			context.currentPageNumber = self.getCurrentPageIndex();
			context.currentPageRecordCount = context.entities.length;
			context.currentOffsetEnd = self.getCurrentOffsetEnd();
			context.currentOffsetStart = self.getCurrentOffsetStart();
			context.pageSize = self.getPageSize();
			context.pageCount = self.getPagesCount();
			return context;
		};

		/**
		 * Return the zero-based offset of the last record inside the current page
		 * @return {Number}
		 */
		this.getCurrentOffsetEnd = function(){
			var offSet = self.getCurrentOffsetStart() + self.getPageSize() - 1;
			if(offSet > self.getRecordsCount()){
				offSet = self.getRecordsCount();
			}
			return offSet;
		};

		/**
		 * Return the zero-based offset of the first record inside the current page
		 * @return {Number}
		 */
		this.getCurrentOffsetStart = function(){
			return currentOffsetStart;
		};

		/**
		 * Return the current page index. Starting at 1
		 * @return {Number}
		 */
		this.getCurrentPageIndex = function(){
			return currentPage;
		};

		/**
		 * Return the total number of pages required to display all of the data
		 * @return {Number}
		 */
		this.getPagesCount = function(){
			return parseInt((self.parentDataSet.getRecordsCount() + self.getPageSize() - 1) / self.getPageSize());
		};

		/**
		 * Return the maximum number of items that can be in a page
		 * @return {Number}
		 */
		this.getPageSize = function(){
			return pageSize;
		};

		/**
		 * Navigate to the given page number
		 * Fails silently if the given page number is out of range
		 * It also change the index of the current row to match the first record in the page
		 * @param {Number} pageNumber
		 * @fire dataChanged
		 */
		this.goToPage = function(pageNumber){
			if(self.isPageInRange(pageNumber) === false){
				return;
			}
			if(pageNumber === self.getCurrentPageIndex()){
				return;
			}
			currentPage = pageNumber;
			currentOffsetStart = ((pageNumber - 1) * self.getPageSize());

			self.setCurrentRowIndex(self.getCurrentOffsetStart());
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Navigate to the next page
		 * Fails silently if the current page is the last one
		 */
		this.goToNextPage = function(){
			self.goToPage(self.getCurrentPageIndex() + 1);
		};

		/**
		 * Navigate to the previous page
		 * Fails silently if the current page is the first one
		 */
		this.goToPrevPage = function(){
			self.goToPage(self.getCurrentPageIndex() - 1);
		};

		/**
		 * Return true if the given page is within range. False otherwise
		 * @param {Number} pageNumber
		 * @return {Boolean}
		 */
		this.isPageInRange = function(pageNumber){
			if(pageNumber < 1 || pageNumber > self.getPagesCount()){
				return false;
			}
			return true;
		};

		/**
		 * To be used for type checking
		 * @return {Boolean}
		 */
		this.isPagedView = function(){
			return true;
		};

		/* Proxy methods */

		/**
		 * Call the parent dataSet
		 * @return {Number}
		 */
		this.getCurrentRowIndex = function(){
			return self.parentDataSet.getCurrentRowIndex();
		};

		/**
		 * Call the parent dataSet
		 * @return {Number}
		 */
		this.getRecordsCount = function(){
			return self.parentDataSet.getRecordsCount();
		};

		/**
		 * Call the parent dataSet .loadData() method, if any
		 * @fire dataLoading
		 * @throw {Exception}
		 */
		this.loadData = function(){
			if(self.parentDataSet.loadData !== undefined){
				self.parentDataSet.loadData();
			}
		};

		/**
		 * Call the parent dataSet
		 * @param {String|null} rowId  Required
		 * @fire currentRowChanged
		 * @throw {Exception}
		 */
		this.setCurrentRowId = function(rowId){
			self.parentDataSet.setCurrentRowId(rowId);
		};

		/**
		 * Call the parent dataSet
		 * @param {Number} index  New index. Required
		 * @fire currentRowChanged
		 * @throw {Exception}
		 */
		this.setCurrentRowIndex = function(index){
			self.parentDataSet.setCurrentRowIndex(index);
		};

		/**
		 * Call the parent dataSet
		 * @param {null|luga.data.STATE} newState
		 * @fire stateChanged
		 */
		this.setState = function(newState){
			self.parentDataSet.setState(newState);
		};

		/**
		 * Call the parent dataSet
		 * Be aware this only sort the data, it does not affects pagination
		 * @param {String|Array<String>}  columnNames             Required, either a single column name or an array of names
		 * @param {luga.data.sort.ORDER} [sortOrder="toggle"]     Either "ascending", "descending" or "toggle". Optional, default to "toggle"
		 * @fire preDataSorted
		 * @fire dataSorted
		 * @fire dataChanged
		 */
		this.sort = function(columnNames, sortOrder){
			self.parentDataSet.sort(columnNames, sortOrder);
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * @param {luga.data.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.notifyObservers(luga.data.CONST.EVENTS.STATE_CHANGED, {dataSource: this});
		};

	};

}());
(function(){
	"use strict";

	luga.namespace("luga.data.region");

	luga.data.region.CONST = {
		CUSTOM_ATTRIBUTES: {
			DATA_SOURCE_UUID: "data-lugaregion-datasource-uuid",
			REGION: "data-lugaregion",
			REGION_TYPE: "data-lugaregion-type",
			TEMPLATE_ID: "data-lugaregion-template-id",
			TRAITS: "data-lugaregion-traits",
			REGION_REFERENCE: "luga-region-reference"
		},
		DEFAULT_REGION_TYPE: "luga.data.region.Handlebars",
		DEFAULT_TRAITS: [
			"luga.data.region.traits.select",
			"luga.data.region.traits.setRowId",
			"luga.data.region.traits.setRowIndex",
			"luga.data.region.traits.sort"
		],
		ERROR_MESSAGES: {
			MISSING_DATA_SOURCE_ATTRIBUTE: "Missing required data-lugaregion-datasource-uuid attribute inside region",
			MISSING_DATA_SOURCE: "Unable to find datasource {0}",
			MISSING_REGION_TYPE_FUNCTION: "Failed to create region. Unable to find a constructor function named: {0}"
		},
		EVENTS: {
			REGION_RENDERED: "regionRendered"
		},
		SELECTORS: {
			REGION: "*[data-lugaregion='true']"
		}
	};

	/**
	 * @typedef {Object} luga.data.region.options
	 *
	 * @property {Boolean} autoregister  Determine if we call luga.data.region.init() on luga.dom.ready()
	 */

	/**
	 * @type {luga.data.region.options}
	 */
	var config = {
		autoregister: true
	};

	/**
	 * Change current configuration
	 * @param {luga.data.region.options} options
	 * @return {luga.data.region.options}
	 */
	luga.data.region.setup = function(options){
		luga.merge(config, options);
		return config;
	};

	/**
	 * Given a DOM node, returns the region object associated to it
	 * Returns undefined if the node is not associated to a region
	 * @param {HTMLElement} node
	 * @return {undefined|luga.data.region.Base}
	 */
	luga.data.region.getReferenceFromNode = function(node){
		return node[luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_REFERENCE];
	};

	/**
	 * Given a DOM node, initialize the relevant Region handler
	 * @param {HTMLElement} node
	 * @throw {Exception}
	 */
	luga.data.region.init = function(node){
		var dataSourceId = node.getAttribute(luga.data.region.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE_UUID);
		if(dataSourceId === null){
			throw(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE_ATTRIBUTE);
		}
		var dataSource = luga.data.getDataSource(dataSourceId);
		if(dataSource === null){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [dataSourceId]));
		}
		var regionType = node.getAttribute(luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_TYPE);
		if(regionType === null){
			regionType = luga.data.region.CONST.DEFAULT_REGION_TYPE;
		}
		var RegionClass = luga.lookupFunction(regionType);
		if(RegionClass === undefined){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_REGION_TYPE_FUNCTION, [regionType]));
		}
		new RegionClass({node: node});
	};

	/**
	 * Bootstrap any region contained within the given node
	 * @param {HTMLElement|undefined} [rootNode]   Optional, default to <body>
	 */
	luga.data.region.initRegions = function(rootNode){
		if(rootNode === undefined){
			rootNode = document.querySelector("body");
		}
		/* istanbul ignore else */
		if(rootNode !== null){
			var nodes = rootNode.querySelectorAll(luga.data.region.CONST.SELECTORS.REGION);
			nodes.forEach(function(item){
				luga.data.region.init(item);
			});
		}
	};

	luga.namespace("luga.data.region.utils");

	/**
	 * @typedef {Object} luga.data.region.description
	 *
	 * @property {HTMLElement}                                node   A DOM node containing the region.
	 * @property {luga.data.DataSet|luga.data.DetailSet} ds     DataSource
	 */

	/**
	 * Given a region instance, returns an object containing its critical data
	 * @param {luga.data.region.Base} region
	 * @return {luga.data.region.description}
	 */
	luga.data.region.utils.assembleRegionDescription = function(region){
		return {
			node: region.config.node,
			ds: region.dataSource
		};
	};

	luga.dom.ready(function(){
		/* istanbul ignore else */
		if(config.autoregister === true){
			luga.data.region.initRegions();
		}
	});

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.region.options
	 *
	 * @property {HTMLElement } node                          The DOM node that will contain the region. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet} ds   DataSource. Required if dsUuid is not specified
	 * @property {String} dsUuid                              DataSource's uuid. Can be specified inside the data-lugaregion-datasource attribute too. Required if ds is not specified
	 * @property {Array.<String>} [undefined]  traits         An array of function names that will be called every time the Region is rendered. Optional
	 * @property {String} templateId                          Id of HTML element containing the template. Can be specified inside the data-lugaregion-template attribute too.
	 *                                                        If not available it assumes the node contains the template
	 */

	/**
	 * Abstract Region class
	 * Concrete implementations must extend this and implement the .render() method
	 * @param {luga.data.Region.options} options
	 * @constructor
	 * @abstract
	 * @extend luga.Notifier
	 * @fire regionRendered
	 * @listen dataChanged
	 * @listen stateChanged
	 * @throw {Exception}
	 */
	luga.data.region.Base = function(options){

		luga.extend(luga.Notifier, this);

		this.CONST = {
			ERROR_MESSAGES: {
				INVALID_TRAIT: "luga.data.region invalid trait: {0} is not a function",
				MISSING_NODE: "luga.data.region was unable find the region node"
			}
		};

		if(options.node === undefined){
			throw(this.CONST.ERROR_MESSAGES.MISSING_NODE);
		}

		this.config = {
			node: null, // Required
			// Either: custom attribute or incoming option
			dsUuid: options.node.getAttribute(luga.data.region.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE_UUID) || null,
			templateId: options.node.getAttribute(luga.data.region.CONST.CUSTOM_ATTRIBUTES.TEMPLATE_ID) || null,
			// Either: incoming option or null
			traits: options.traits || null,
			ds: null
		};
		luga.merge(this.config, options);
		var self = this;

		/** @type {luga.data.DataSet|luga.data.DetailSet} */
		this.dataSource = null;
		if(this.config.ds !== null){
			// We've got a direct reference from the options
			this.dataSource = this.config.ds;
		}
		else{
			// We've got a dataSource Id
			this.dataSource = luga.data.getDataSource(this.config.dsUuid);
		}
		if(this.dataSource === null){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [this.config.dsId]));
		}
		this.dataSource.addObserver(this);

		/** @type {Array.<String>} */
		this.traits = luga.data.region.CONST.DEFAULT_TRAITS;
		// Extract traits from custom attribute, if any
		var attrTraits = this.config.node.getAttribute(luga.data.region.CONST.CUSTOM_ATTRIBUTES.TRAITS);
		if(attrTraits !== null){
			this.traits = this.traits.concat(attrTraits.split(","));
		}
		if(this.config.traits !== null){
			this.traits = this.traits.concat(this.config.traits);
		}

		// Store reference inside node
		this.config.node[luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_REFERENCE] = this;

		this.applyTraits = function(){
			var traitData = {
				node: this.config.node,
				dataSource: this.dataSource
			};
			for(var i = 0; i < this.traits.length; i++){
				var func = luga.lookupFunction(this.traits[i]);
				if(func !== undefined){
					func(traitData);
				}
				else{
					throw(luga.string.format(this.CONST.ERROR_MESSAGES.INVALID_TRAIT, [this.traits[i]]));
				}
			}
		};

		/**
		 * @abstract
		 * @fire regionRendered
		 */
		this.render = function(){
			// Concrete implementations must overwrite this
			var desc = luga.data.region.utils.assembleRegionDescription(this);
			this.notifyObservers(luga.data.region.CONST.EVENTS.REGION_RENDERED, desc);
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			self.applyTraits();
		};

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.render();
		};

		/**
		 * @param {luga.data.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.render();
		};

	};

}());
(function(){
	"use strict";

	/**
	 * Handlebars Region class
	 * @param {luga.data.Region.options} options
	 * @constructor
	 * @extend luga.data.region.Base
	 * @fire regionRendered
	 * @throw {Exception}
	 */
	luga.data.region.Handlebars = function(options){

		luga.extend(luga.data.region.Base, this, [options]);
		var self = this;

		// The messages below are specific to this implementation
		self.CONST.HANDLEBARS_ERROR_MESSAGES = {
			MISSING_HANDLEBARS: "Unable to find Handlebars",
			MISSING_TEMPLATE_FILE: "luga.data.region.Handlebars was unable to retrieve file: {0} containing an Handlebars template",
			MISSING_TEMPLATE_NODE: "luga.data.region.Handlebars was unable find an HTML element with id: {0} containing an Handlebars template"
		};

		this.template = "";

		/**
		 * @param {HTMLElement} node
		 */
		var fetchTemplate = function(node){
			// Inline template
			if(self.config.templateId === null){
				self.template = Handlebars.compile(node.innerHTML);
			}
			else{
				var templateNode = document.getElementById(self.config.templateId);
				if(templateNode === null){
					throw(luga.string.format(self.CONST.HANDLEBARS_ERROR_MESSAGES.MISSING_TEMPLATE_NODE, [self.config.templateId]));
				}
				var templateSrc = templateNode.getAttribute("src");
				if(templateSrc === null){
					// Embed template
					self.template = Handlebars.compile(templateNode.innerHTML);
				}
				else{
					// External template
					var xhrOptions = {
						success: function(response){
							self.template = Handlebars.compile(response.responseText);
							self.render();
						},
						error: function(response){
							throw(luga.string.format(self.CONST.HANDLEBARS_ERROR_MESSAGES.MISSING_TEMPLATE_FILE, [templateSrc]));
						}
					};
					var xhr = new luga.xhr.Request(xhrOptions);
					xhr.send(templateSrc);
				}
			}
		};

		/**
		 * @return {String}
		 */
		this.generateHtml = function(){
			return this.template(this.dataSource.getContext());
		};

		/*
		 @override
		 @fire regionRendered
		 */
		this.render = function(){
			/* istanbul ignore else */
			if(this.template !== ""){
				this.config.node.innerHTML = this.generateHtml();
				this.applyTraits();
				var desc = luga.data.region.utils.assembleRegionDescription(this);
				this.notifyObservers(luga.data.region.CONST.EVENTS.REGION_RENDERED, desc);
			}
		};

		/* Constructor */
		fetchTemplate(this.config.node);

	};

}());
(function(){
	"use strict";

	luga.namespace("luga.data.region.traits");

	/**
	 * @typedef {Object} luga.data.region.traits.options
	 *
	 * @property {HTMLElement}                            node          A DOM node. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet}  dataSource    DataSource. Required
	 */

	var CONST = {
		CUSTOM_ATTRIBUTES: {
			SELECT: "data-lugaregion-select",
			SET_ROW_ID: "data-lugaregion-setrowid",
			SET_ROW_INDEX: "data-lugaregion-setrowindex",
			SORT: "data-lugaregion-sort"
		},
		SELECTORS: {
			SELECT: "*[data-lugaregion-select]",
			SET_ROW_ID: "*[data-lugaregion-setrowid]",
			SET_ROW_INDEX: "*[data-lugaregion-setrowindex]",
			SORT: "*[data-lugaregion-sort]"
		}
	};

	var removeCssClass = function(nodeList, className){
		nodeList.forEach(function(item){
			item.classList.remove(className);
		});
	};

	/**
	 * Handles data-lugaregion-select
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.select = function(options){
		var nodes = options.node.querySelectorAll(CONST.SELECTORS.SELECT);
		if(options.dataSource.getCurrentRowIndex === undefined){
			// It's a detailSet, abort
			return;
		}

		if(nodes.length > 0){
			var cssClass = nodes[0].getAttribute(CONST.CUSTOM_ATTRIBUTES.SELECT);
			nodes[0].classList.remove(cssClass);
			// Default to first row
			var index = 0;

			if(options.dataSource.getCurrentRowIndex() === -1){
				// Remove class from everyone
				removeCssClass(nodes, cssClass);
			}
			else{
				index = options.dataSource.getCurrentRowIndex();
				// Apply CSS
				nodes[index].classList.add(cssClass);
			}

			// Attach click event to all nodes
			nodes.forEach(function(item){
				item.addEventListener("click", function(event){
					event.preventDefault();
					removeCssClass(nodes, cssClass);
					item.classList.add(cssClass);
				}, false);
			});

		}
	};

	/**
	 * Handles data-lugaregion-setrowid
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowId = function(options){

		var nodes = options.node.querySelectorAll(CONST.SELECTORS.SET_ROW_ID);
		nodes.forEach(function(item){
			item.addEventListener("click", function(event){
				event.preventDefault();
				var rowId = item.getAttribute(CONST.CUSTOM_ATTRIBUTES.SET_ROW_ID);
				options.dataSource.setCurrentRowId(rowId);
			}, false);
		});

	};

	/**
	 * Handles data-lugaregion-setrowindex
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowIndex = function(options){

		var nodes = options.node.querySelectorAll(CONST.SELECTORS.SET_ROW_INDEX);
		nodes.forEach(function(item){
			item.addEventListener("click", function(event){
				event.preventDefault();
				var rowIndex = parseInt(item.getAttribute(CONST.CUSTOM_ATTRIBUTES.SET_ROW_INDEX), 10);
				options.dataSource.setCurrentRowIndex(rowIndex);
			}, false);
		});
	};

	/**
	 * Handles data-lugaregion-sort
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.sort = function(options){

		var nodes = options.node.querySelectorAll(CONST.SELECTORS.SORT);
		nodes.forEach(function(item){
			item.addEventListener("click", function(event){
				event.preventDefault();
				var sortCol = item.getAttribute(CONST.CUSTOM_ATTRIBUTES.SORT);
				options.dataSource.sort(sortCol);
			}, false);
		});

	};

}());
(function(){
	"use strict";

	luga.namespace("luga.data.sort");

	/**
	 * @typedef {String} luga.data.sort.ORDER
	 * @enum {String}
	 */
	luga.data.sort.ORDER = {
		ASC: "ascending",
		DESC: "descending",
		TOG: "toggle"
	};

	var CONST = {
		ERROR_MESSAGES: {
			UNSUPPORTED_DATA_TYPE: "luga.data.sort. Unsupported dataType: {0",
			UNSUPPORTED_SORT_ORDER: "luga.data.sort. Unsupported sortOrder: {0}"
		}
	};

	/**
	 * Return true if the passed order is supported
	 * @param {String}  sortOrder
	 * @return {Boolean}
	 */
	luga.data.sort.isValidSortOrder = function(sortOrder){
		for(var key in luga.data.sort.ORDER){
			if(luga.data.sort.ORDER[key] === sortOrder){
				return true;
			}
		}
		return false;
	};

	/**
	 * Retrieve the relevant sort function matching the given combination of dataType and sortOrder
	 * @param {String}               dataType
	 * @param {luga.data.sort.ORDER} sortOrder
	 * @return {function}
	 */
	luga.data.sort.getSortStrategy = function(dataType, sortOrder){
		if(luga.data.sort[dataType] === undefined){
			throw(luga.string.format(CONST.ERROR_MESSAGES.UNSUPPORTED_DATA_TYPE, [dataType]));
		}
		if(luga.data.sort[dataType][sortOrder] === undefined){
			throw(luga.string.format(CONST.ERROR_MESSAGES.UNSUPPORTED_SORT_ORDER, [sortOrder]));
		}
		return luga.data.sort[dataType][sortOrder];
	};

	/*
	 Lovingly adapted from Spry
	 Very special thanks to Kin Blas https://github.com/jblas
	 */

	luga.namespace("luga.data.sort.date");

	luga.data.sort.date.ascending = function(prop){
		return function(a, b){
			var dA = luga.lookupProperty(a, prop);
			var dB = luga.lookupProperty(b, prop);
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dA - dB;
		};
	};

	luga.data.sort.date.descending = function(prop){
		return function(a, b){
			var dA = luga.lookupProperty(a, prop);
			var dB = luga.lookupProperty(b, prop);
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dB - dA;
		};
	};

	luga.namespace("luga.data.sort.number");

	luga.data.sort.number.ascending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? 1 : -1);
			}
			return a - b;
		};
	};

	luga.data.sort.number.descending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? -1 : 1);
			}
			return b - a;
		};
	};

	luga.namespace("luga.data.sort.string");

	luga.data.sort.string.ascending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? 1 : -1);
			}
			var tA = a.toString();
			var tB = b.toString();
			var tAlower = tA.toLowerCase();
			var tBlower = tB.toLowerCase();
			var minLen = tA.length > tB.length ? tB.length : tA.length;

			for(var i = 0; i < minLen; i++){
				var aLowerChar = tAlower.charAt(i);
				var bLowerChar = tBlower.charAt(i);
				var aChar = tA.charAt(i);
				var bChar = tB.charAt(i);
				if(aLowerChar > bLowerChar){
					return 1;
				}
				else if(aLowerChar < bLowerChar){
					return -1;
				}
				else if(aChar > bChar){
					return 1;
				}
				else if(aChar < bChar){
					return -1;
				}
			}
			if(tA.length === tB.length){
				return 0;
			}
			else if(tA.length > tB.length){
				return 1;
			}
			return -1;
		};
	};

	luga.data.sort.string.descending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? -1 : 1);
			}
			var tA = a.toString();
			var tB = b.toString();
			var tAlower = tA.toLowerCase();
			var tBlower = tB.toLowerCase();
			var minLen = tA.length > tB.length ? tB.length : tA.length;
			for(var i = 0; i < minLen; i++){
				var aLowerChar = tAlower.charAt(i);
				var bLowerChar = tBlower.charAt(i);
				var aChar = tA.charAt(i);
				var bChar = tB.charAt(i);
				if(aLowerChar > bLowerChar){
					return -1;
				}
				else if(aLowerChar < bLowerChar){
					return 1;
				}
				else if(aChar > bChar){
					return -1;
				}
				else if(aChar < bChar){
					return 1;
				}
			}
			if(tA.length === tB.length){
				return 0;
			}
			else if(tA.length > tB.length){
				return -1;
			}
			return 1;
		};
	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.widgets.PagingBar.options
	 *
	 * @property {luga.data.PagedView}     pagedView  Instance of a pagedView that will be controlled by the widget. Required
	 * @property {Element}                 node       DOM element that will contain the widget. Required
	 * @property {luga.data.PAGING_STYLE}  style      Style to be used for the widget, either "luga-pagingBarLinks" or "luga-pagingBarPages". Default to "luga-pagingBarLinks"
	 * @property {String}                  nextText   Text to be used for "next" links. Default to ">"
	 * @property {String}                  prevText   Text to be used for "previous" links. Default to "<"
	 * @property {String}                  separator  Text to be used to separate links. Default to " | "
	 * @property {Number}                  maxLinks   Maximum number of links to show. Default to 10
	 */

	luga.namespace("luga.data.widgets");

	/**
	 * @typedef {String} luga.data.PAGING_STYLE
	 * @enum {String}
	 */
	luga.data.PAGING_STYLE = {
		LINKS: "luga-pagingBarLinks",
		PAGES: "luga-pagingBarPages"
	};

	/**
	 * Return true if the passed style is supported
	 * @param {String}  style
	 * @return {Boolean}
	 */
	var isValidStyle = function(style){
		for(var key in luga.data.PAGING_STYLE){
			if(luga.data.PAGING_STYLE[key] === style){
				return true;
			}
		}
		return false;
	};

	/**
	 * PagingBar widget
	 * Given a pagedView, create a fully fledged pagination bar
	 *
	 * @param {luga.data.widgets.PagingBar.options} options
	 * @constructor
	 */
	luga.data.widgets.PagingBar = function(options){

		var CONST = {
			CSS_BASE_CLASS: "luga-pagingBar",
			SAFE_HREF: "javascript:;",
			LINKS_SEPARATOR: " - ",
			ERROR_MESSAGES: {
				INVALID_PAGED_VIEW_PARAMETER: "luga.data.widgets.PagingBar: pagedView parameter is required. Must be an instance of luga.data.PagedView",
				INVALID_NODE_PARAMETER: "luga.data.widgets.PagingBar: node parameter is required. Must be a DOM Element",
				INVALID_STYLE_PARAMETER: "luga.data.widgets.PagingBar: style parameter must be of type luga.data.PAGING_STYLE"
			}
		};

		if(options.pagedView === undefined || (options.pagedView.isPagedView === undefined || options.pagedView.isPagedView() === false)){
			throw(CONST.ERROR_MESSAGES.INVALID_PAGED_VIEW_PARAMETER);
		}

		if(options.node === undefined || options.node instanceof Element === false){
			throw(CONST.ERROR_MESSAGES.INVALID_NODE_PARAMETER);
		}

		if(options.style !== undefined && isValidStyle(options.style) === false){
			throw(CONST.ERROR_MESSAGES.INVALID_STYLE_PARAMETER);
		}

		this.config = {
			/** @type {luga.data.PagedView} */
			pagedView: undefined,
			/** @type {Element} */
			node: undefined,
			style: luga.data.PAGING_STYLE.LINKS,
			nextText: ">",
			prevText: "<",
			separator: " | ",
			maxLinks: 10
		};
		luga.merge(this.config, options);

		/**
		 * @type {luga.data.widgets.PagingBar}
		 */
		var self = this;
		// Alias/shortcuts
		var pagedView = self.config.pagedView;
		var node = self.config.node;

		pagedView.addObserver(this);

		// Add CSS
		node.classList.add(CONST.CSS_BASE_CLASS);
		node.classList.add(self.config.style);

		var render = function(){
			// Reset UI
			node.innerHTML = "";
			var currentPageIndex = pagedView.getCurrentPageIndex();

			if(pagedView.getPagesCount() > 1){
				renderPrevLink(self.config.prevText, currentPageIndex);
				renderMainLinks(self.config.maxLinks, self.config.style);
				renderNextLink(self.config.nextText, currentPageIndex);
			}
		};

		var renderPrevLink = function(text, pageIndex){

			var textNode = document.createTextNode(text);
			var linkNode = document.createElement("a");
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			linkNode.appendChild(textNode);
			addGoToPageEvent(linkNode, pageIndex - 1);

			if(pageIndex !== 1){
				node.appendChild(linkNode);
			}
			else{
				node.appendChild(textNode);
			}

			node.appendChild(document.createTextNode(" "));
		};

		var renderNextLink = function(text, pageIndex){
			node.appendChild(document.createTextNode(" "));
			var textNode = document.createTextNode(text);
			var linkNode = document.createElement("a");
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			linkNode.appendChild(textNode);
			addGoToPageEvent(linkNode, pageIndex + 1);

			if(pageIndex !== pagedView.getPagesCount()){
				node.appendChild(linkNode);
			}
			else{
				node.appendChild(textNode);
			}
		};

		var renderMainLinks = function(maxLinks, style){
			var pageSize = pagedView.getPageSize();
			var recordsCount = pagedView.getRecordsCount();
			var pagesCount = pagedView.getPagesCount();
			var currentPageIndex = pagedView.getCurrentPageIndex();
			var endIndex = getEndIndex(currentPageIndex, maxLinks, pagesCount);

			// Page numbers are between 1 and n. So the loop start from 1
			for(var i = 1; i < (endIndex + 1); i++){

				var labelText = getLabelText(i, style, pageSize, pagesCount, recordsCount);
				if(i !== currentPageIndex){
					renderCurrentLink(i, labelText);
				}
				else{
					// No link on current page
					renderCurrentText(labelText);
				}
				// No separator on last entry
				if(i < endIndex){
					renderSeparator();
				}
			}

		};

		var renderCurrentLink = function(i, linkText){
			var textNode = document.createTextNode(linkText);
			var linkNode = document.createElement("a");
			linkNode.appendChild(textNode);
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			addGoToPageEvent(linkNode, i);
			node.appendChild(linkNode);
		};

		var renderCurrentText = function(labelText){
			var textNode = document.createTextNode(labelText);
			var strongNode = document.createElement("strong");
			strongNode.appendChild(textNode);
			node.appendChild(strongNode);
		};

		var renderSeparator = function(){
			var separatorNode = document.createTextNode(self.config.separator);
			node.appendChild(separatorNode);
		};

		var addGoToPageEvent = function(linkNode, pageNumber){
			linkNode.addEventListener("click", function(event){
				event.preventDefault();
				pagedView.goToPage(pageNumber);
			});
		};

		var getEndIndex = function(currentPageIndex, maxLinks, pagesCount){
			var startIndex = parseInt(currentPageIndex - parseInt(maxLinks / 2));
			/* istanbul ignore else */
			if(startIndex < 1){
				startIndex = 1;
			}
			var tempPos = startIndex + maxLinks - 1;
			var endIndex = pagesCount;
			if(tempPos < pagesCount){
				endIndex = tempPos;
			}
			return endIndex;
		};

		var getLabelText = function(i, style, pageSize, pagesCount, recordsCount){
			var labelText = "";

			if(style === luga.data.PAGING_STYLE.PAGES){
				labelText = i;
			}

			/* istanbul ignore else */
			if(style === luga.data.PAGING_STYLE.LINKS){
				var startText = "";
				var endText = "";
				if(i !== 1){
					startText = (pageSize * (i - 1)) + 1;
				}
				else{
					// First link
					startText = 1;
				}
				if(i < pagesCount){
					endText = startText + pageSize - 1;
				}
				else{
					// Last link
					endText = recordsCount;
				}
				labelText = startText + CONST.LINKS_SEPARATOR + endText;
			}

			return labelText;
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			render();
		};

	};

}());
(function(){
	"use strict";

	luga.namespace("luga.data.widgets");

	/**
	 * @typedef {Object} luga.data.widgets.ShowMore.options
	 *
	 * @property {luga.data.DataSet} dataSet   DataSet. Required
	 * @property {String|undefined} paramPath  Path to retrieve url template params from the JSON. Optional. If not specified the whole returned JSON will be used
	 * @property {String} url                  Url to be used by the dataSet to fetch more data. It can contain template placeholders. Required
	 */

	/**
	 * Abstract ShowMore class
	 * Concrete implementations must extend this
	 * @param {luga.data.widgets.ShowMore.options} options
	 * @constructor
	 * @abstract
	 * @listen stateChanged
	 * @throw {Exception}
	 */
	luga.data.widgets.ShowMore = function(options){

		this.CONST = {
			ERROR_MESSAGES: {
				INVALID_DATASET_PARAMETER: "luga.data.widgets.ShowMore: dataSet parameter is required",
				INVALID_URL_PARAMETER: "luga.data.widgets.ShowMore: url parameter is required"
			}
		};

		this.config = {
			/** @type {luga.data.dataSet} */
			dataSet: undefined,
			paramPath: "",
			url: undefined
		};
		luga.merge(this.config, options);

		/** @type {luga.data.widgets.ShowMore} */
		var self = this;

		if(this.config.dataSet === undefined){
			throw(this.CONST.ERROR_MESSAGES.INVALID_DATASET_PARAMETER);
		}
		if(this.config.url === undefined){
			throw(this.CONST.ERROR_MESSAGES.INVALID_URL_PARAMETER);
		}

		var isEnabled = false;
		this.config.dataSet.addObserver(this);

		this.assembleUrl = function(){
			var bindingObj = this.config.dataSet.getRawJson();
			/* istanbul ignore else */
			if(this.config.paramPath !== ""){
				bindingObj = luga.lookupProperty(bindingObj, this.config.paramPath);
			}
			return luga.string.populate(this.config.url, bindingObj);
		};

		/**
		 * @abstract
		 */
		this.disable = function(){
		};

		/**
		 * @abstract
		 */
		this.enable = function(){
		};

		this.fetch = function(){
			var newUrl = this.assembleUrl();
			if(newUrl !== this.config.url){
				this.config.dataSet.setUrl(newUrl);
				this.config.dataSet.loadData();
			}
			else{
				this.disable();
			}
		};

		this.isEnabled = function(){
			return isEnabled;
		};

		this.updateState = function(){
			if(this.config.dataSet.getState() === luga.data.STATE.READY){
				isEnabled = true;
				this.enable();
			}
			else{
				isEnabled = false;
				this.disable();
			}
		};

		/**
		 * @param {luga.data.DataSet.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.updateState();
		};

		/* Constructor */
		this.updateState();

	};

	/**
	 * @typedef {Object} luga.data.ShowMoreButton.options
	 *
	 * @extend luga.data.widgets.ShowMore.options
	 * @property {HTMLElement}  button     Button that will trigger the showMore. Required
	 * @property {String}  disabledClass   Name of CSS class that will be applied to the button while it's disabled. Optional, default to "disabled"
	 */

	/**
	 * ShowMore button class
	 * @param {luga.data.widgets.ShowMoreButton.options} options
	 * @constructor
	 * @extend luga.data.widgets.ShowMore
	 * @listen stateChanged
	 * @throw {Exception}
	 */
	luga.data.widgets.ShowMoreButton = function(options){
		this.config = {
			/** @type {luga.data.dataSet} */
			dataSet: undefined,
			paramPath: "",
			url: undefined,
			/** @type {HTMLElement} */
			button: undefined,
			disabledClass: "disabled"
		};
		luga.merge(this.config, options);
		luga.extend(luga.data.widgets.ShowMore, this, [this.config]);

		/** @type {luga.data.widgets.ShowMoreButton} */
		var self = this;

		// The messages below are specific to this implementation
		self.CONST.BUTTON_ERROR_MESSAGES = {
			MISSING_BUTTON: "luga.data.widgets.ShowMoreButton was unable find the button node"
		};

		if(this.config.button === null){
			throw(this.CONST.BUTTON_ERROR_MESSAGES.MISSING_BUTTON);
		}

		this.attachEvents = function(){

			self.config.button.addEventListener("click", function(event){
				event.preventDefault();
				if(self.isEnabled() === true){
					self.fetch();
				}
			}, false);

		};

		this.disable = function(){
			this.config.button.classList.add(this.config.disabledClass);
		};

		this.enable = function(){
			this.config.button.classList.remove(this.config.disabledClass);
		};

		/* Constructor */
		this.attachEvents();

	};

}());