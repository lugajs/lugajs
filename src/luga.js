"use strict";

if(typeof(luga) === "undefined") {
	var luga = {};
}

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
