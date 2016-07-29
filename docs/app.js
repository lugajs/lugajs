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
			router.add("index", routeResolver);

			router.add("common/index", routeResolver);
			router.add("common/form", routeResolver);
			router.add("common/string", routeResolver);
			router.add("common/notifier", routeResolver);

			router.add("ajaxform/index", routeResolver);
			router.add("ajaxform/getting-started", routeResolver);
			router.add("ajaxform/syntax", routeResolver);
			router.add("ajaxform/samples/complete", routeResolver);
			router.add("ajaxform/samples/success-handler", routeResolver);
			router.add("ajaxform/samples/error-handler", routeResolver);
			router.add("ajaxform/samples/before-after", routeResolver);
			router.add("ajaxform/samples/validator", routeResolver);
			router.add("ajaxform/api/syntax", routeResolver);
			router.add("ajaxform/api/samples", routeResolver);
			router.add("ajaxform/api/raw-json", routeResolver);

			router.add("data/index", routeResolver);
			router.add("data/getting-started", routeResolver);
			router.add("data/faq", routeResolver);
			router.add("data/debugging", routeResolver);

			router.add("data/dataset/getting-started", routeResolver);
			router.add("data/dataset/databinding", routeResolver);
			router.add("data/dataset/filter", routeResolver);
			router.add("data/dataset/formatter", routeResolver);
			router.add("data/dataset/sort", routeResolver);
			router.add("data/dataset/api", routeResolver);

			router.add("data/json-dataset/getting-started", routeResolver);
			router.add("data/json-dataset/path", routeResolver);
			router.add("data/json-dataset/master-details", routeResolver);
			router.add("data/json-dataset/showmore-scrolling-body", routeResolver);
			router.add("data/json-dataset/showmore-scrolling-div", routeResolver);
			router.add("data/json-dataset/showmore-button", routeResolver);
			router.add("data/json-dataset/api", routeResolver);

			router.add("data/xml-dataset/getting-started", routeResolver);
			router.add("data/xml-dataset/path", routeResolver);
			router.add("data/xml-dataset/master-details", routeResolver);
			router.add("data/xml-dataset/api", routeResolver);

			router.add("data/detailset/master-details", routeResolver);
			router.add("data/detailset/api", routeResolver);

			router.add("data/region/getting-started", routeResolver);
			router.add("data/region/handlebars", routeResolver);
			router.add("data/region/context", routeResolver);
			router.add("data/region/state", routeResolver);
			router.add("data/region/traits", routeResolver);
			router.add("data/region/syntax", routeResolver);
			router.add("data/region/scripting", routeResolver);

			router.add("data/extensibility/custom-dataset", routeResolver);
			router.add("data/extensibility/custom-region-type", routeResolver);
			router.add("data/extensibility/custom-trait", routeResolver);

			router.add("validator/index", routeResolver);
			router.add("validator/getting-started", routeResolver);
			router.add("validator/syntax", routeResolver);
			router.add("validator/faq", routeResolver);

			router.add("validator/samples/complete", routeResolver);
			router.add("validator/samples/registration", routeResolver);
			router.add("validator/samples/date", routeResolver);
			router.add("validator/samples/checkboxes", routeResolver);
			router.add("validator/samples/radio", routeResolver);
			router.add("validator/samples/select", routeResolver);
			router.add("validator/samples/conditional-validation", routeResolver);
			router.add("validator/samples/handlers-errorbox", routeResolver);
			router.add("validator/samples/dom-changes", routeResolver);
			router.add("validator/samples/html5", routeResolver);

			router.add("validator/extensibility/custom-patterns", routeResolver);
			router.add("validator/extensibility/custom-date-patterns", routeResolver);
			router.add("validator/extensibility/custom-validation", routeResolver);
			router.add("validator/extensibility/handlers-custom", routeResolver);
			router.add("validator/extensibility/custom-error", routeResolver);

			router.add("validator/bootstrap/samples", routeResolver);

			router.add("validator/api/syntax", routeResolver);
			router.add("validator/api/samples", routeResolver);

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
						jQuery(luga.data.region.CONST.SELECTORS.REGION).each(function(index, item){
							luga.data.region.init(jQuery(item));
						});
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