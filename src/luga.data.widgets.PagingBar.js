(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.widgets.PagingBar.options
	 *
	 * @property {luga.data.PagedView}     pagedView  Instance of a pagedView that will be controlled by the widget. Required
	 * @property {Element}                 node       DOM element that will contain the widget. Required
	 * @property {luga.data.PAGING_STYLE}  style      Style to be used for the widget, either "luga-pagingBarLinks" or "luga-pagingBarPages". Default to "luga-pagingBarLinks"
	 * @property {string}                  nextText   Text to be used for "next" links. Default to ">"
	 * @property {string}                  prevText   Text to be used for "previous" links. Default to "<"
	 * @property {string}                  separator  Text to be used to separate links. Default to " | "
	 * @property {number}                  maxLinks   Maximum number of links to show. Default to 10
	 */

	luga.namespace("luga.data.widgets");

	/**
	 * @typedef {string} luga.data.PAGING_STYLE
	 * @enum {string}
	 */
	luga.data.PAGING_STYLE = {
		LINKS: "luga-pagingBarLinks",
		PAGES: "luga-pagingBarPages"
	};

	/**
	 * Return true if the passed style is supported
	 * @param {string}  style
	 * @return {boolean}
	 */
	const isValidStyle = function(style){
		for(let key in luga.data.PAGING_STYLE){
			if(luga.data.PAGING_STYLE[key] === style){
				return true;
			}
		}
		return false;
	};

	/**
	 * PagingBar widget
	 * Given a pagedView, create a fully fledged pagination bar
	 *
	 * @param {luga.data.widgets.PagingBar.options} options
	 * @constructor
	 */
	luga.data.widgets.PagingBar = function(options){

		const CONST = {
			CSS_BASE_CLASS: "luga-pagingBar",
			SAFE_HREF: "javascript:;",
			LINKS_SEPARATOR: " - ",
			ERROR_MESSAGES: {
				INVALID_PAGED_VIEW_PARAMETER: "luga.data.widgets.PagingBar: pagedView parameter is required. Must be an instance of luga.data.PagedView",
				INVALID_NODE_PARAMETER: "luga.data.widgets.PagingBar: node parameter is required. Must be a DOM Element",
				INVALID_STYLE_PARAMETER: "luga.data.widgets.PagingBar: style parameter must be of type luga.data.PAGING_STYLE"
			}
		};

		if(options.pagedView === undefined || (options.pagedView.isPagedView === undefined || options.pagedView.isPagedView() === false)){
			throw(CONST.ERROR_MESSAGES.INVALID_PAGED_VIEW_PARAMETER);
		}

		if(options.node === undefined || options.node instanceof Element === false){
			throw(CONST.ERROR_MESSAGES.INVALID_NODE_PARAMETER);
		}

		if(options.style !== undefined && isValidStyle(options.style) === false){
			throw(CONST.ERROR_MESSAGES.INVALID_STYLE_PARAMETER);
		}

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
		const self = this;
		// Alias/shortcuts
		const pagedView = self.config.pagedView;
		const node = self.config.node;

		pagedView.addObserver(this);

		// Add CSS
		node.classList.add(CONST.CSS_BASE_CLASS);
		node.classList.add(self.config.style);

		const render = function(){
			// Reset UI
			node.innerHTML = "";
			const currentPageIndex = pagedView.getCurrentPageIndex();

			if(pagedView.getPagesCount() > 1){
				renderPrevLink(self.config.prevText, currentPageIndex);
				renderMainLinks(self.config.maxLinks, self.config.style);
				renderNextLink(self.config.nextText, currentPageIndex);
			}
		};

		const renderPrevLink = function(text, pageIndex){

			const textNode = document.createTextNode(text);
			const linkNode = document.createElement("a");
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

		const renderNextLink = function(text, pageIndex){
			node.appendChild(document.createTextNode(" "));
			const textNode = document.createTextNode(text);
			const linkNode = document.createElement("a");
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

		const renderMainLinks = function(maxLinks, style){
			const pageSize = pagedView.getPageSize();
			const recordsCount = pagedView.getRecordsCount();
			const pagesCount = pagedView.getPagesCount();
			const currentPageIndex = pagedView.getCurrentPageIndex();
			const endIndex = getEndIndex(currentPageIndex, maxLinks, pagesCount);

			// Page numbers are between 1 and n. So the loop start from 1
			for(let i = 1; i < (endIndex + 1); i++){

				const labelText = getLabelText(i, style, pageSize, pagesCount, recordsCount);
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

		const renderCurrentLink = function(i, linkText){
			const textNode = document.createTextNode(linkText);
			const linkNode = document.createElement("a");
			linkNode.appendChild(textNode);
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			addGoToPageEvent(linkNode, i);
			node.appendChild(linkNode);
		};

		const renderCurrentText = function(labelText){
			const textNode = document.createTextNode(labelText);
			const strongNode = document.createElement("strong");
			strongNode.appendChild(textNode);
			node.appendChild(strongNode);
		};

		const renderSeparator = function(){
			const separatorNode = document.createTextNode(self.config.separator);
			node.appendChild(separatorNode);
		};

		const addGoToPageEvent = function(linkNode, pageNumber){
			linkNode.addEventListener("click", function(event){
				event.preventDefault();
				pagedView.goToPage(pageNumber);
			});
		};

		const getEndIndex = function(currentPageIndex, maxLinks, pagesCount){
			let startIndex = parseInt(currentPageIndex - parseInt(maxLinks / 2));
			/* istanbul ignore else */
			if(startIndex < 1){
				startIndex = 1;
			}
			const tempPos = startIndex + maxLinks - 1;
			let endIndex = pagesCount;
			if(tempPos < pagesCount){
				endIndex = tempPos;
			}
			return endIndex;
		};

		const getLabelText = function(i, style, pageSize, pagesCount, recordsCount){
			let labelText = "";

			if(style === luga.data.PAGING_STYLE.PAGES){
				labelText = i;
			}

			/* istanbul ignore else */
			if(style === luga.data.PAGING_STYLE.LINKS){
				let startText = "";
				let endText = "";
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