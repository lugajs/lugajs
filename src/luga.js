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

"use strict";
if(typeof(jQuery) === "undefined") {
	throw("Unable to find jQuery");
}
if(typeof(luga) === "undefined") {
	var luga = {};
}
luga.version = 0.1;

luga.CONST = {
	MESSAGES: {
		INVALID_EXTEND_PARAM: "luga.extend only accept functions as arguments"
	}
};

// Based on Nicholas C. Zakas's code
luga.namespace = function(ns, rootObject) {
	var parts = ns.split(".");
	if (!rootObject) {
		rootObject = window;
	}
	var len;
	for (var i = 0, len = parts.length; i < len; i++) {
		if (!rootObject[parts[i]]) {
			rootObject[parts[i]] = {};
		}
		rootObject = rootObject[parts[i]];
	}
	return rootObject;
};

luga.extend = function(func, baseFunc) {
	if((!jQuery.isFunction(func)) || (!jQuery.isFunction(baseFunc))) {
		throw(luga.CONST.MESSAGES.INVALID_EXTEND_PARAM);
	}
};

/* Utilities */

luga.namespace("luga.utils");

/**
 * Given a string containing placeholders, it assembles a new string
 * replacing the placeholders with the strings contained inside the second argument
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
luga.utils.formatString = function(str, args) {
	var pattern = null;
	if($.isArray(args)) {
		for (var i = 0; i < args.length; i++) {
			pattern = new RegExp("\\{" + i + "\\}", "g");
			str = str.replace(pattern, args[i]);
		}
	}
	if($.isPlainObject(args)) {
		for (var x in args) {
			pattern = new RegExp("\\{" + x + "\\}", "g");
			str = str.replace(pattern, args[x]);
		}
	}
	return str;
};