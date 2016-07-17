(function(){
	"use strict";

	/**
	 * @typedef {object} luga.history.options
	 *
	 * @property {boolean} pushState  Determine if we use pushState or the location hash. Default to true. If pushState is not available (like in IE9) the location hash will be used anyway
	 */

	luga.namespace("luga.history");

	/**
	 * @type {luga.history.options}
	 */
	var config = {
		pushState: false
	};

	/**
	 * Change current configuration
	 * @param {luga.history.options} options
	 * @returns {luga.history.options}
	 */
	luga.history.setup = function(options){
		luga.merge(config, options);
		return config;
	};

	/**
	 * Return true if the browser supports pushState, false otherwise
	 * @returns {boolean}
	 */
	/* istanbul ignore next */
	luga.history.isPushStateSupported = function(){
		// Only IE9 should return false
		return (history.pushState !== undefined);
	};

	/**
	 * Return true if we should pushState, false otherwise
	 * The result depend on a combination of browser capabilities and current configuration
	 * @returns {boolean}
	 */
	luga.history.usePushState = function(){
		return ((config.pushState === true) && (luga.history.isPushStateSupported() === true));
	};

	/**
	 * @typedef {object} luga.history.navigate.options
	 *
	 * @property {boolean} replace  Determine if we add a new history entry or replace the current one
	 * @property {string}  title    Title to be passed to pushState. Default to empty string. Some browser don't support this yet
	 * @property {object}  state    A JavaScript object which is associated with the new history entry. DEfault to an empty object. See:
	 *                              https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
	 */

	/**
	 * Add an entry to the browser's history or modify the current entry
	 * https://developer.mozilla.org/en-US/docs/Web/API/History_API
	 * @param {string} fragment
	 * @param {luga.history.navigate.options} options
	 */
	luga.history.navigate = function(fragment, options){
		var config = {
			replace: false,
			title: "",
			state: {}
		};
		luga.merge(config, options);

		// pushState
		if(luga.history.usePushState() === true){
			var historyMethod = "pushState";
			if(config.replace === true){
				historyMethod = "replaceState";
			}
			history[historyMethod](config.state, config.title, fragment);
		}
		// location hash
		else{
			if(config.replace === true){
				var newLocation = location.href.replace(/(javascript:|#).*$/, "");
				location.replace(newLocation  + "#" + fragment);
			}
			else{
				// Some browsers require that location hash contains a leading #
				location.hash = "#" + fragment;
			}
		}
	};

}());