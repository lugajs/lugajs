if(self.location.protocol === "file:"){
	alert("The documentation is not going to work properly if accessed from a file system. You should use an HTTP server instead.");
}

(function(){
	"use strict";

	var Controller = function(){

		var CONST = {
			TITLE_ROOT: "Luga JS",
			TITLE_SEPARATOR: " :: ",
			CSS_CLASSES: {
				CURRENT: "current"
			},
			SELECTORS: {
				CONTENT: "#content",
				NAVIGATION: "#navigation"
			},
			INCLUDES_PATH: "fragments/",
			INCLUDES_SUFFIX: ".htm",
			DEFAULT_INCLUDE_ID: "index",
			LOCAL_NAV_ID: "nav-local.htm"
		};

		/**
		 * @type {luga.router.Router}
		 */
		var router = new luga.router.Router();

		var init = function(){
			initRouter();
			router.resolve(router.normalizeHash(location.hash));
		};

		var initRouter = function(){
			router.add("{lib}/:section::page:", routeResolver);
			router.add(":catchall:", function(){
				loadPage(CONST.DEFAULT_INCLUDE_ID);
			});
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

			loadPage(context.fragment);
			setPageTitle(context.params.lib, context.params.section, context.params.page);

			// If it's not index, load navigation
			if(context.params.lib !== "index"){
				loadNavigation(context.params.lib, context.fragment);
			}
		};

		var setPageTitle = function(lib, section, page){
			var title = CONST.TITLE_ROOT;
			if(section !== undefined){
				title += CONST.TITLE_SEPARATOR + lib[0].toUpperCase() + lib.substring(1);
			}
			if(page !== undefined){
				title += CONST.TITLE_SEPARATOR + section;
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
					console.log("Error loading documentation fragment");
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
					console.log("Error loading navigation");
				});

		};

		var highlightNav = function(){
			jQuery(CONST.SELECTORS.NAVIGATION).find("a").each(function(index, item){
				if(isCurrentFragment(jQuery(item).attr("href"))){
					jQuery(item).parent().addClass(CONST.CSS_CLASSES.CURRENT);
				}
			});
		};

		var isCurrentFragment = function(href){
			var tokens = href.split("/");
			var destination = tokens[tokens.length - 2] + "/" + tokens[tokens.length - 1];
			return location.href.indexOf(destination) > 0;
		};

		init();

	};

	jQuery(document).ready(function(){
		new Controller();
	});

}());