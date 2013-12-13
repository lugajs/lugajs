/*
 Copyright 2013 Massimo Foti (massimo@massimocorner.com)

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

	luga.version = "0.2.1";

	luga.CONST = {
		ERROR_MESSAGES: {
			NOTIFIER_ABSTRACT: "It's forbidden to use luga.Notifier directly, it must be used as a base class instead",
			OBSERVER_MUST_BE_OBJECT: "addObserver(): observer parameter must be an object",
			DATA_PARAMETER_REQUIRED: "notifyObserver(): data parameter is required and must be an object"
		}
	};

	/**
	 * Creates namespaces to be used for scoping variables and classes so that they are not global.
	 * Specifying the last node of a namespace implicitly creates all other nodes.
	 * Based on Nicholas C. Zakas's code
	 * @param  ns           Namespace as string
	 * @param  rootObject   Optional root object. Default to window
	 */
	luga.namespace = function(ns, rootObject){
		var parts = ns.split(".");
		if(!rootObject){
			rootObject = window;
		}
		var len;
		for(var i = 0, len = parts.length; i < len; i++){
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
	 */
	luga.merge = function(target, obj){
		jQuery.extend(target, obj);
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
				throw(luga.CONST.ERROR_MESSAGES.OBSERVER_MUST_BE_OBJECT);
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
		this.notifyObserver = function(eventName, data){
			if(jQuery.type(data) !== "object"){
				throw(luga.CONST.ERROR_MESSAGES.DATA_PARAMETER_REQUIRED);
			}
			var method = generateMethodName(eventName);
			for(var i = 0; i < this.observers.length; i++){
				var observer = this.observers[i];
				if(observer[method] && jQuery.isFunction(observer[method])){
					observer[method](data);
				}
			}
		};

	};

	/* Utilities */

	luga.namespace("luga.utils");

	luga.utils.CONST = {
		CSS_CLASSES: {
			MESSAGE: "luga_message",
			ERROR_MESSAGE: "luga_error_message"
		},
		MSG_BOX_ID: "lugaMessageBox"
	};

	/**
	 * Given a string containing placeholders, it assembles a new string
	 * replacing the placeholders with the strings contained inside the second argument (either an object or an array)
	 * Loosely based on the .NET implementation: http://msdn.microsoft.com/en-us/library/system.string.format.aspx
	 *
	 * Example passing strings inside an array:
	 * luga.utils.formatString("My name is {0} {1}", ["Ciccio", "Pasticcio"]); // "My name is Ciccio Pasticcio"
	 *
	 * Example passing strings inside an object:
	 * luga.utils.formatString("My name is {firstName} {lastName}", {firstName: "Ciccio", lastName: "Pasticcio"}); // "My name is Ciccio Pasticcio"
	 *
	 * @param  str        String containing placeholders
	 * @param  args       Either an array of strings or an objects containing name/value pairs in string format
	 * @return            The newly assembled string
	 */
	luga.utils.formatString = function(str, args){
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
	 * @param  str   String containing MS Word's garbage
	 */
	luga.utils.demoronizeString = function(str){
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

	/**
	 * Given the name of a function as a string, return the relevant function, if any
	 */
	luga.utils.stringToFunction = function(str){
		if(jQuery.isFunction(str)){
			return str;
		}
		// It may be a global function
		if(window[str] && jQuery.isFunction(window[str])){
			return window[str];
		}
		// If it lives inside a namespace, try to eval it
		try{
			var evaluated = eval(str);
			if(evaluated && jQuery.isFunction(evaluated)){
				return evaluated;
			}
		}
		catch(e){
		}
		return null;
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
	 * Private helper function
	 * Remove a message box (if any) associated with a given node
	 */
	var removeDisplayBox = function(node){
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

	/* Validation handlers */

	luga.namespace("luga.validationHandlers");

	/**
	 * Display error messages inside alert
	 */
	luga.validationHandlers.errorAlert = function(formNode, validators){
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
	luga.validationHandlers.errorBox = function(formNode, validators){
		// Clean-up any existing box
		if(validators.length === 0){
			removeDisplayBox(formNode);
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

}());