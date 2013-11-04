/**
 * Copyright 2013 massimocorner.com
 * @author      Massimo Foti (massimo@massimocorner.com)
 * @require     jQuery
 */

"use strict";
if(typeof(jQuery) === "undefined") {
	throw("Unable to find jQuery");
}
if(typeof(luga) === "undefined") {
	var luga = {};
}
luga.version = 0.1;

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

/* Utilities */

luga.namespace("luga.util");

/**
 * Given a string containing placeholders, it assembles a new string
 * replacing the placeholders with the strings contained inside the second argument
 * Loosely based on the .NET implementation: http://msdn.microsoft.com/en-us/library/system.string.format.aspx
 *
 * Example passing strings inside an array:
 * luga.util.formatString("My name is {0} {1}", ["Ciccio", "Pasticcio"]); // "My name is Ciccio Pasticcio"
 *
 * Example passing strings inside an object:
 * luga.util.formatString("My name is {firstName} {lastName}", {firstName: "Ciccio", lastName: "Pasticcio"}); // "My name is Ciccio Pasticcio"
 *
 * @param  str        String containing placeholders
 * @param  args       Either an array of strings or an objects containing name/value pairs in string format
 * @return            The newly assembled string
 */
luga.util.formatString = function(str, args) {
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
