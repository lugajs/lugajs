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
