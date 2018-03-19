(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.widgets.PagingBar.options
	 *
	 * @property {luga.data.PagedView}     pagedView  Instance of a pagedView.. Required
	 * @property {Element}                 node       DOM element that will contain the widget. Required
	 * @property {luga.data.PAGING_STYLE}  style      Style to be used for the widget, either "luga-pagingBarLinks" or "luga-pagingBarPages". Default to "luga-pagingBarLinks"
	 * @property {String}                  nextText   Text to be used for "next" links. Default to ">"
	 * @property {String}                  prevText   Text to be used for "previous" links. Default to "<"
	 * @property {String}                  separator  Text to be used to separate links. Default to " | "
	 * @property {Number}                  maxLinks   Maximum number of links to show. DEfault to 10
	 */

	luga.namespace("luga.data.widgets");

	/**
	 * @typedef {String} luga.data.PAGING_STYLE
	 * @enum {String}
	 */
	luga.data.PAGING_STYLE = {
		LINKS: "luga-pagingBarLinks",
		PAGES: "luga-pagingBarPages"
	};

	/**
	 * PagingBar widget
	 * Given a pagedView, create a fully fledged pagination bar
	 *
	 * @param {luga.data.widgets.PagingBar.options} options
	 * @constructor
	 */
	luga.data.widgets.PagingBar = function(options){

		var CONST = {
			CSS_BASE_CLASS: "luga-pagingBar",
			SAFE_HREF: "javascript:;",
			LINKS_SEPARATOR: " - "
		};

		// TODO: validate options

		this.config = {
			/** @type {luga.data.PagedView} */
			pagedView: undefined,
			/** @type {Element} */
			node: undefined,
			style: luga.data.PAGING_STYLE.LINKS,
			nextText: ">",
			prevText: "<",
			separator: " | ",
			maxLinks: 10
		};
		luga.merge(this.config, options);

		/**
		 * @type {luga.data.widgets.PagingBar}
		 */
		var self = this;
		// Alias/shortcuts
		var pagedView = self.config.pagedView;
		var node = self.config.node;

		pagedView.addObserver(this);

		// Add CSS
		node.classList.add(CONST.CSS_BASE_CLASS);
		node.classList.add(self.config.style);

		var render = function(){
			// Reset UI
			node.innerHTML = "";
			var currentPageIndex = pagedView.getCurrentPageIndex();

			if(pagedView.getPagesCount() > 1){
				renderPrevLink(self.config.prevText, currentPageIndex);
				renderMainLinks(self.config.maxLinks, self.config.style);
				renderNextLink(self.config.nextText, currentPageIndex);
			}
		};

		var renderPrevLink = function(text, pageIndex){

			var textNode = document.createTextNode(text);
			var linkNode = document.createElement("a");
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			linkNode.appendChild(textNode);
			addGoToPageEvent(linkNode, pageIndex - 1);

			if(pageIndex !== 1){
				node.appendChild(linkNode);
			}
			else{
				node.appendChild(textNode);
			}

			node.appendChild(document.createTextNode(" "));
		};

		var renderNextLink = function(text, pageIndex){
			node.appendChild(document.createTextNode(" "));
			var textNode = document.createTextNode(text);
			var linkNode = document.createElement("a");
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			linkNode.appendChild(textNode);
			addGoToPageEvent(linkNode, pageIndex + 1);

			if(pageIndex !== pagedView.getPagesCount()){
				node.appendChild(linkNode);
			}
			else{
				node.appendChild(textNode);
			}
		};

		var renderMainLinks = function(maxLinks, style){
			var pageSize = pagedView.getPageSize();
			var recordsCount = pagedView.getRecordsCount();
			var pagesCount = pagedView.getPagesCount();
			var currentPageIndex = pagedView.getCurrentPageIndex();
			var endIndex = getEndIndex(currentPageIndex, maxLinks, pagesCount);

			// Page numbers are between 1 and n. So the loop start from 1
			for(var i = 1; i < (endIndex + 1); i++){

				var labelText = getLabelText(i, style, pageSize, pagesCount, recordsCount);
				if(i !== currentPageIndex){
					renderCurrentLink(i, labelText);
				}
				else{
					// No link on current page
					renderCurrentText(labelText);
				}
				// No separator on last entry
				if(i < endIndex){
					renderSeparator();
				}
			}

		};

		var renderCurrentLink = function(i, linkText){
			var textNode = document.createTextNode(linkText);
			var linkNode = document.createElement("a");
			linkNode.appendChild(textNode);
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			addGoToPageEvent(linkNode, i);
			node.appendChild(linkNode);
		};

		var renderCurrentText = function(labelText){
			var textNode = document.createTextNode(labelText);
			var strongNode = document.createElement("strong");
			strongNode.appendChild(textNode);
			node.appendChild(strongNode);
		};

		var renderSeparator = function(){
			var separatorNode = document.createTextNode(self.config.separator);
			node.appendChild(separatorNode);
		};

		var addGoToPageEvent = function(linkNode, pageNumber){
			linkNode.addEventListener("click", function(event){
				event.preventDefault();
				pagedView.goToPage(pageNumber);
			});
		};

		var getEndIndex = function(currentPageIndex, maxLinks, pagesCount){
			var startIndex = parseInt(currentPageIndex - parseInt(maxLinks / 2));
			/* istanbul ignore else */
			if(startIndex < 1){
				startIndex = 1;
			}
			var tempPos = startIndex + maxLinks - 1;
			var endIndex = pagesCount;
			if(tempPos < pagesCount){
				endIndex = tempPos;
			}
			return endIndex;
		};

		var getLabelText = function(i, style, pageSize, pagesCount, recordsCount){
			var labelText = "";

			if(style === luga.data.PAGING_STYLE.PAGES){
				labelText = i;
			}

			/* istanbul ignore else */
			if(style === luga.data.PAGING_STYLE.LINKS){
				var startText = "";
				var endText = "";
				if(i !== 1){
					startText = (pageSize * (i - 1)) + 1;
				}
				else{
					// First link
					startText = 1;
				}
				if(i < pagesCount){
					endText = startText + pageSize - 1;
				}
				else{
					// Last link
					endText = recordsCount;
				}
				labelText = startText + CONST.LINKS_SEPARATOR + endText;
			}

			return labelText;
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			render();
		};

	};

}());