if(self.location.protocol === "file:"){
	alert("The documentation is not going to work properly if accessed from a file system. You should use an HTTP server instead.");
}

luga.namespace("luga.docs");

(function(){
	"use strict";

	var Controller = function(){

		var CONST = {
			TITLE_ROOT: "Luga",
			TITLE_SEPARATOR : " :: ",
			CSS_CLASSES: {
				CURRENT: "current"
			},
			SELECTORS: {
				CONTENT: "#content",
				NAVIGATION: "#navigation"
			},
			INCLUDES_PATH: "fragments/",
			INCLUDES_SUFFIX: ".inc",
			DEFAULT_INCLUDE_ID: "index",
			LOCAL_NAV_ID: "nav-local.inc"
		};

		/**
		 * @type {luga.router.Router}
		 */
		var router = new luga.router.Router();

		var init = function(){
			initRouter();
			if(router.resolve(router.normalizeHash(location.hash)) === false){
				// Current hash is not resolved, load default content
				loadPage(CONST.DEFAULT_INCLUDE_ID);
			}
		};

		var initRouter = function(){
			router.add("{lib}/:section::page:", routeResolver);
			router.start();
		};

		/**
		 * Execute registered enter callbacks, if any
		 * @param {luga.router.routeContext} context
		 */
		var routeResolver = function(context){

			luga.data.dataSourceRegistry = {};

			jQuery(CONST.SELECTORS.CONTENT).empty();
			jQuery(CONST.SELECTORS.NAVIGATION).empty();

			var tokens = context.fragment.split("/");
			loadPage(context.fragment);
			setPageTitle(tokens);

			// Needs navigation
			if(tokens.length > 1){
				loadNavigation(tokens[0], context.fragment);
			}
		};

		var setPageTitle = function(tokens){
			var title = CONST.TITLE_ROOT;
			if(tokens[1] !== undefined){
				title += CONST.TITLE_SEPARATOR + tokens[0][0].toUpperCase() + tokens[0].substring(1);
			}
			if(tokens[2] !== undefined){
				title += CONST.TITLE_SEPARATOR + tokens[1];
			}
			document.title = title;
		};

		var loadPage = function(id){
			var fragmentUrl = CONST.INCLUDES_PATH + id + CONST.INCLUDES_SUFFIX;

			jQuery.ajax(fragmentUrl)
					.done(function(response, textStatus, jqXHR){
						// Read include and inject content
						jQuery(CONST.SELECTORS.CONTENT).html(jqXHR.responseText);

						// Bootstrap libs
						luga.ajaxform.initForms();
						luga.data.region.initRegions();
						luga.validator.initForms();
						Prism.highlightAll();

					})
					.fail(function(){
						// TODO: implement error handling
						console.log("Error loading fragment");
					});

		};

		var loadNavigation = function(id, fragment){
			var fragmentUrl = CONST.INCLUDES_PATH + id + "/" + CONST.LOCAL_NAV_ID;
			jQuery.ajax(fragmentUrl)
					.done(function(response, textStatus, jqXHR){
						// Read include and inject content
						jQuery(CONST.SELECTORS.NAVIGATION).html(jqXHR.responseText);
						highlightNav(fragment);
					})
					.fail(function(){
						// TODO: implement error handling
						console.log("Error loading fragment");
					});

		};

		var highlightNav = function(fragment){
			jQuery(CONST.SELECTORS.NAVIGATION).find("a").each(function(index, item){
				if(isCurrentFragment(jQuery(item).attr("href"))){
					jQuery(item).parent().addClass(CONST.CSS_CLASSES.CURRENT);
				}
			});
		};

		var isCurrentFragment = function(href){
			var tokens = href.split("/");
			var destination = tokens[tokens.length -2] + "/" + tokens[tokens.length -1];
			return location.href.indexOf(destination) > 0;
		};

		init();

	};

	jQuery(document).ready(function(){
		luga.docs.controller = new Controller();
	});

}());