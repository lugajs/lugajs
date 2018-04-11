if(self.location.protocol === "file:"){
	alert("The documentation is not going to work properly if accessed from a file system. You should use an HTTP server instead.");
}

(function(){
	"use strict";

	const Controller = function(){

		const CONST = {
			TITLE_ROOT: "Luga JS",
			TITLE_SEPARATOR: " :: ",
			CSS_CLASSES: {
				CURRENT: "current"
			},
			ID: {
				CONTENT: "content",
				NAVIGATION: "navigation"
			},
			INCLUDES_PATH: "fragments/",
			INCLUDES_SUFFIX: ".htm",
			DEFAULT_INCLUDE_ID: "index",
			LOCAL_NAV_ID: "nav-local.htm"
		};

		/**
		 * @type {luga.router.Router}
		 */
		const router = new luga.router.Router();

		const init = function(){
			initRouter();
			router.resolve(router.normalizeHash(location.hash));
		};

		const initRouter = function(){
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
		const routeResolver = function(context){

			luga.data.dataSourceRegistry = {};

			document.getElementById(CONST.ID.CONTENT).innerText = "";
			document.getElementById(CONST.ID.NAVIGATION).innerText = "";

			loadPage(context.fragment);
			setPageTitle(context.params.lib, context.params.section, context.params.page);

			// If it's not index, load navigation
			if(context.params.lib !== "index"){
				loadNavigation(context.params.lib, context.fragment);
			}
		};

		const setPageTitle = function(lib, section, page){
			let title = CONST.TITLE_ROOT;
			if(section !== undefined){
				title += CONST.TITLE_SEPARATOR + lib[0].toUpperCase() + lib.substring(1);
			}
			if(page !== undefined){
				title += CONST.TITLE_SEPARATOR + section;
			}
			document.title = title;
		};

		const loadPage = function(id){
			const fragmentUrl = CONST.INCLUDES_PATH + id + CONST.INCLUDES_SUFFIX;

			const xhrOptions = {
				success: function(response){
					injectPage(response.responseText);
					triggerDOMready();
				},
				error: function(response){
					// TODO: implement error handling
					console.log("Error loading documentation fragment");
				}
			};
			const xhr = new luga.xhr.Request(xhrOptions);
			xhr.send(fragmentUrl);
		};

		const injectPage = function(html){
			const container = document.getElementById(CONST.ID.CONTENT);
			container.innerHTML = html;
			evalScripts(container);
		};

		const loadNavigation = function(id, fragment){
			const fragmentUrl = CONST.INCLUDES_PATH + id + "/" + CONST.LOCAL_NAV_ID;

			const xhrOptions = {
				success: function(response){
					// Read include and inject content
					injectNav(response.responseText);
					highlightNav(fragment);
				},
				error: function(response){
					// TODO: implement error handling
					console.log("Error loading navigation");
				}
			};
			const xhr = new luga.xhr.Request(xhrOptions);
			xhr.send(fragmentUrl);

		};

		const injectNav = function(html){
			const container = document.getElementById(CONST.ID.NAVIGATION);
			container.innerHTML = html;
		};

		const highlightNav = function(){
			const links = document.getElementById(CONST.ID.NAVIGATION).querySelectorAll("a");

			for(let i = 0; i < links.length; i++){
				const item = links[i];
				if(isCurrentFragment(item.getAttribute("href")) === true){
					item.parentNode.classList.add(CONST.CSS_CLASSES.CURRENT);
				}
			}
		};

		const isCurrentFragment = function(href){
			const tokens = href.split("/");
			const destination = tokens[tokens.length - 2] + "/" + tokens[tokens.length - 1];
			return location.href.indexOf(destination) > 0;
		};

		// Utils

		const triggerDOMready = function(){
			// Programmatically trigger "DOMContentLoaded" with IE11 compatible syntax
			const eventToTrigger = document.createEvent("Event");
			eventToTrigger.initEvent("DOMContentLoaded", false, true);
			document.dispatchEvent(eventToTrigger);
		};

		const evalScripts = function(node){
			const scripts = node.querySelectorAll("script");

			for(let i = 0; i < scripts.length; i++){
				const script = scripts[i];
				if(script.getAttribute("type") === null){
					eval(script.innerHTML);
				}
			}

		};

		init();

	};

	// Bootstrap the app
	new Controller();

}());