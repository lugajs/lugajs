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
		const parts = ns.split(".");
		if(rootObject === undefined){
			rootObject = window;
		}
		for(let i = 0; i < parts.length; i++){
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
	 * @param {Function} baseFunc  Parent constructor function. Required
	 * @param {Function} func      Child constructor function. Required
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

		const proto = Object.getPrototypeOf(obj);

		// Objects with no prototype (e.g., Object.create(null)) are plain
		if(proto === null){
			return true;
		}

		// Objects with prototype are plain if they were constructed by a global Object function
		const constructor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
		if(constructor === false){
			return false;
		}
		return typeof (constructor === "function") && (Function.toString.call(constructor) === Function.toString.call(Object));
	};

	/**
	 * Given the name of a function as a string, return the relevant function, if any
	 * Returns undefined, if the reference has not been found
	 * Supports namespaces (if the fully qualified path is passed)
	 * @param {String} path            Fully qualified name of a function
	 * @return {Function|undefined}    The javascript reference to the function, undefined if nothing is fund or if it's not a function
	 */
	luga.lookupFunction = function(path){
		if(!path){
			return undefined;
		}
		const reference = luga.lookupProperty(window, path);
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
		let parts = path.split(".");
		while(parts.length > 0){
			const part = parts.shift();
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
		for(let x in source){
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
		const parts = path.split(".");
		if(parts.length === 1){
			object[path] = value;
		}
		while(parts.length > 0){
			let part = parts.shift();
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

	luga.TO_QUERY_STRING_CONST = {
		ERROR_INPUT: "luga.toQueryString: Can serialize only plain objects"
	};

	/**
	 * Create a query string out of a plain object containing name/value pairs
	 * @param {Object} input
	 * @return {String}
	 */
	luga.toQueryString = function(input){
		if(luga.isPlainObject(input) === false){
			throw(luga.TO_QUERY_STRING_CONST.ERROR_INPUT);
		}
		let str = "";
		for(let x in input){
			// Assume is just an array of simple values
			if(Array.isArray(input[x]) === true){
				input[x].forEach(function(element){
					str = appendQueryString(str, x, element);
				});
			}
			else{
				// Assume it is just name/value pair
				str = appendQueryString(str, x, input[x]);
			}
		}
		return str;
	};

	const class2type = {};
	["Array", "Boolean", "Date", "Error", "Function", "Number", "Object", "RegExp", "String", "Symbol"].forEach(function(element){
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
		const rawType = typeof obj;
		if((rawType === "object") || (rawType === "function")){
			/* http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/ */
			const stringType = Object.prototype.toString.call(obj);
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

		const prefix = "on";
		const suffix = "Handler";

		// Turns "complete" into "onComplete"
		const generateGenericMethodName = function(eventName){
			let str = prefix;
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
				const eventMap = {
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
		const findObserverIndex = function(eventArray, eventMap){
			for(let i = 0; i < eventArray.length; i++){
				/**
				 * @type {luga.eventObserverMap}
				 */
				const currentMap = eventArray[i];
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
			const genericMethod = generateGenericMethodName(eventName);
			this.observers.forEach(function(element){
				if((element[genericMethod] !== undefined) && (luga.type(element[genericMethod]) === "function")){
					element[genericMethod](payload);
				}
			});
			// "Event" observers
			const eventObservers = this.eventObservers[eventName];
			if(eventObservers !== undefined){
				eventObservers.forEach(function(element){
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
				for(let i = 0; i < this.observers.length; i++){
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
					const eventMap = {
						observer: observer,
						methodName: methodName
					};
					const index = findObserverIndex(this.eventObservers[eventName], eventMap);
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
	 * Attach a single event listener, to a parent element, that will fire for all descendants matching a selector
	 * No matter whether those descendants exist now or are added in the future
	 * @param {HTMLElement} node
	 * @param {String} eventType
	 * @param {String} selector
	 * @param {Function} callback
	 */
	luga.dom.delegateEvent = function(node, eventType, selector, callback){
		node.addEventListener(eventType, function(/** @type {Event} */ event){
			/** @type {Element} */
			const currentElement = event.target;
			if(luga.dom.nodeMatches(currentElement, selector) === true){
				callback(event, currentElement);
			}
		});
	};

	/**
	 * Equalize element.matches across browsers
	 * @param {HTMLElement} node
	 * @param {String} selector
	 * @return {Boolean}
	 */
	luga.dom.nodeMatches = function(node, selector){
		let methodName = "matches";
		// Deal with IE11 without polyfills
		/* istanbul ignore next IE-only */
		if(node.matches === undefined && node.msMatchesSelector !== undefined){
			methodName = "msMatchesSelector";
		}
		return node[methodName](selector);
	};

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
	 * @param {Function} [filterFunc]    filterFunc  Optional filter function. If specified only nodes matching the filter will be accepted
	 *                                               The function will be invoked with this signature: filterFunc(node). Must return true|false
	 * @return {NodeIterator|TreeWalker}
	 */
	const getIteratorInstance = function(type, rootNode, filterFunc){

		const filter = {
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
		const safeFilter = filter.acceptNode;
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
	 * @param {Function} [filterFunc]    filterFunc  Optional filter function. If specified only nodes matching the filter will be accepted
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
	 * @param {Function} [filterFunc]    filterFunc  Optional filter function. If specified only nodes matching the filter will be accepted
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
		const map = {};
		const fields = luga.form.utils.getChildFields(rootNode);

		for(let i = 0; i < fields.length; i++){
			const element = fields[i];
			if(luga.form.utils.isSuccessfulField(element) === true){
				const fieldName = element.getAttribute("name");
				let fieldValue = null;
				const fieldType = element.type;
				switch(fieldType){

					case "select-multiple":
						fieldValue = getMultiSelectValue(element);
						break;

					case "checkbox":
					case "radio":
						if(element.checked === true){
							fieldValue = element.value;
						}
						break;

					default:
						fieldValue = element.value;
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
		}
		return map;
	};

	/**
	 * @param {HTMLElement} node
	 * @return {Array.<String>}
	 */
	const getMultiSelectValue = function(node){
		const fieldValue = [];
		const options = node.querySelectorAll("option:checked");
		for(let i = 0; i < options.length; i++){
			fieldValue.push(options[i].value);
		}
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
		const flatData = luga.form.toMap(rootNode);
		const jsonData = {};
		for(let x in flatData){
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
		let str = "";
		const fields = luga.form.utils.getChildFields(rootNode);

		for(let i = 0; i < fields.length; i++){
			const element = fields[i];
			if(luga.form.utils.isSuccessfulField(element) === true){
				const fieldName = element.getAttribute("name");
				const fieldType = element.type;
				switch(fieldType){

					/* eslint-disable no-case-declarations */
					case "select-multiple":
						const multiValues = getMultiSelectValue(element);
						for(let j = 0; j < multiValues.length; j++){
							str = appendQueryString(str, fieldName, multiValues[i], demoronize);
						}
						break;

					case "checkbox":
					case "radio":
						if(element.checked === true){
							str = appendQueryString(str, fieldName, element.value, demoronize);
						}
						break;

					default:
						str = appendQueryString(str, fieldName, element.value, demoronize);
				}
			}
		}
		return str;
	};

	const appendQueryString = function(str, fieldName, fieldValue, demoronize){
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
	 * @param {HTMLElement}  fieldNode
	 * @return {Boolean}
	 */
	luga.form.utils.isInputField = function(fieldNode){
		if(fieldNode.type === undefined){
			return false;
		}
		// It belongs to the kind of nodes that are considered form fields, but we don't care about
		if(luga.form.CONST.FAKE_INPUT_TYPES[fieldNode.type] === true){
			return false;
		}
		return true;
	};

	/**
	 * Extracts group of fields that share the same name from a given root node
	 * Or the whole document if the second argument is not passed
	 *
	 * @param {String} name              Name of the field. Mandatory
	 * @param {HTMLElement} [rootNode]   Root node, optional, default to document
	 * @return {Array.<HTMLElement>}
	 */
	luga.form.utils.getFieldGroup = function(name, rootNode){
		if(rootNode === undefined){
			rootNode = document;
		}
		const selector = "input[name='" + name + "']";
		const nodes = rootNode.querySelectorAll(selector);
		// Turn nodelist into an array to be consistent with .getChildFields()
		return Array.prototype.slice.call(nodes);
	};

	/**
	 * Returns an array of input fields contained inside a given root node
	 *
	 * @param {HTMLElement}  rootNode   Root node
	 * @return {Array.<HTMLElement>}
	 */
	luga.form.utils.getChildFields = function(rootNode){
		const fields = [];
		const nodes = rootNode.querySelectorAll(luga.form.CONST.FIELD_SELECTOR);
		for(let i = 0; i < nodes.length; i++){
			const element = nodes[i];
			if(luga.form.utils.isInputField(element) === true){
				fields.push(element);
			}
		}
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
		const json = getRootState(root);
		luga.setProperty(json, path.toString(), value);
		setRootState(root, json);
	};

	const setRootState = function(root, json){
		localStorage.setItem(root, JSON.stringify(json));
	};

	const getRootState = function(root){
		const rootJson = localStorage.getItem(root);
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
		let pattern = null;
		if(Array.isArray(args) === true){
			for(let i = 0; i < args.length; i++){
				pattern = new RegExp("\\{" + i + "\\}", "g");
				str = str.replace(pattern, args[i]);
			}
		}
		if(luga.isPlainObject(args) === true){
			for(let x in args){
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
		const map = {};
		if(str.charAt(0) === "?"){
			str = str.substring(1);
		}
		if(str.length === 0){
			return map;
		}
		const parts = str.split("&");

		for(let i = 0; i < parts.length; i++){
			const tokens = parts[i].split("=");
			const fieldName = decodeURIComponent(tokens[0]);
			let fieldValue = "";
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

	const propertyPattern = new RegExp("\\{([^}]*)}", "g");

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
	 * const nestedObj = { type: "people", person: { firstName: "Ciccio", lastName: "Pasticcio" } };
	 * luga.string.populate("My name is {person.firstName} {person.lastName}", nestedObj)
	 * => "My name is Ciccio Pasticcio"
	 *
	 * @param  {String} str   String containing placeholders
	 * @param  {Object} obj   An objects containing name/value pairs in string format
	 * @return {String} The newly assembled string
	 */
	luga.string.populate = function(str, obj){
		if(luga.isPlainObject(obj) === true){
			let results;
			while((results = propertyPattern.exec(str)) !== null){
				const property = luga.lookupProperty(obj, results[1]);
				if(property !== undefined){
					const pattern = new RegExp(results[0], "g");
					str = str.replace(pattern, property);
					// Keep searching
					propertyPattern.test(str);
				}
			}
		}
		return str;
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
		const config = {
			/* eslint-disable no-console */
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

		const self = this;
		self.xhr = new XMLHttpRequest();

		/**
		 * Turn the string containing HTTP headers into an array of objects
		 * @param {String} str
		 * @return {Array.<luga.xhr.header>}
		 */
		const headersToArray = function(str){
			const headers = str.split("\r\n");
			// Remove the last element since it's empty
			headers.pop();
			return headers.map(function(item){
				const tokens = item.split(":");
				const ret = {
					header: tokens[0]
				};
				/* istanbul ignore else */
				if(tokens[1] !== undefined){
					ret.value = tokens[1].substring(1);
				}
				return ret;
			});
		};

		/**
		 * @return {luga.xhr.response}
		 */
		const assembleResponse = function(){
			return {
				status: self.xhr.status,
				statusText: self.xhr.statusText,
				responseText: self.xhr.responseText,
				responseType: self.xhr.responseType,
				responseXML: self.xhr.responseXML,
				headers: headersToArray(self.xhr.getAllResponseHeaders())
			};
		};

		const checkReadyState = function(){
			if(self.xhr.readyState === 4){
				const httpStatus = self.xhr.status;
				if((httpStatus >= 200 && httpStatus <= 300) || (httpStatus === 304)){
					config.success(assembleResponse());
				}
				else{
					config.error(assembleResponse());
				}
			}
		};

		const finalizeRequest = function(url){
			self.xhr.onreadystatechange = checkReadyState;
			self.xhr.timeout = config.timeout;
			self.xhr.setRequestHeader("Content-Type", config.contentType);
			/* istanbul ignore else */
			if(url.substring(0, 4) !== "http"){
				// This may cause issue with CORS so better to avoid on cross-site requests
				self.xhr.setRequestHeader("X-Requested-With", config.requestedWith);
			}
			config.headers.forEach(function(element){
				self.xhr.setRequestHeader(element.name, element.value);
			});
		};

		const finalizeUrl = function(url, params){
			let suffix = "";
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