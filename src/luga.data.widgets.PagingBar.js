(function(){
	"use strict";

	luga.namespace("luga.data.widgets");

	luga.data.widgets.PagingBar = function(options){

		var CONST = {
			SAFE_HREF: "javascript:;"
		};

		// TODO: validate options
		// TODO: enum for style

		this.config = {
			/** @type {luga.data.PagedView} */
			pagedView: undefined,
			/** @type {Element} */
			node: undefined,
			style: "links",
			nextText: ">",
			prevText: "<",
			separator: " | ",
			maxLinks: 20
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

		this.render = function(){
			// Reset UI
			node.innerHTML = "";

			var pages = pagedView.getPagesCount();
			var pageIndex = pagedView.getCurrentPageNumber();

			if(pages > 1){
				renderPrevLink(self.config.prevText, pageIndex);
				renderMainLinks(self.config.maxLinks, self.config.style, self.config.separator);
				renderNextLink(self.config.nextText, pageIndex);
			}
		};

		var renderPrevLink = function(text, pageIndex){

			var textNode = document.createTextNode(text);
			var linkNode = document.createElement("a");
			linkNode.setAttribute("href", CONST.SAFE_HREF);
			addGoToPageEvent(linkNode, pageIndex - 1);

			linkNode.appendChild(textNode);

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
			addGoToPageEvent(linkNode, pageIndex + 1);

			linkNode.appendChild(textNode);

			if(pageIndex !== pagedView.getPagesCount()){
				node.appendChild(linkNode);
			}
			else{
				node.appendChild(textNode);
			}
		};

		var renderMainLinks = function(maxLinks, style, separator){
			// TODO: Review local vars
			var pageSize = pagedView.getPageSize();
			var recordsCount = pagedView.getRecordsCount();
			var pagesCount = pagedView.getPagesCount();
			var currentPageIndex = pagedView.getCurrentPageNumber();

			var range = getIndexRange(currentPageIndex, maxLinks, pagesCount);

			// Page numbers are between 1 and n. So the loop start from 1
			for(var i = range.startIndex; i < (range.endIndex + 1); i++){

				var linkText = getLinkText(i, style, pageSize, pagesCount, recordsCount);
				var textNode = document.createTextNode(linkText);

				if(i !== currentPageIndex){
					var linkNode = document.createElement("a");
					linkNode.appendChild(textNode);
					linkNode.setAttribute("href", CONST.SAFE_HREF);
					addGoToPageEvent(linkNode, i);
					node.appendChild(linkNode);
				}
				// No link on current page
				else{
					var strongNode = document.createElement("strong");
					strongNode.appendChild(textNode);
					node.appendChild(strongNode);
				}
				// Add the separator until last page
				if(i < (range.endIndex)){
					var separatorNode = document.createTextNode(separator);
					node.appendChild(separatorNode);
				}
			}

		};

		var addGoToPageEvent = function(linkNode, pageNumber){
			linkNode.addEventListener("click", function(event){
				event.preventDefault();
				pagedView.goToPage(pageNumber);
			});
		};

		var getIndexRange = function(currentPageIndex, maxLinks, pagesCount){
			var startIndex = parseInt(currentPageIndex - parseInt(maxLinks / 2));
			if(startIndex < 1){
				startIndex = 1;
			}
			var tempPos = startIndex + maxLinks - 1;
			var endIndex = pagesCount;
			if(tempPos < pagesCount){
				endIndex = tempPos;
			}
			if(endIndex === pagesCount){
				startIndex = pagesCount - maxLinks;
			}
			if(startIndex < 1){
				startIndex = 1;
			}

			return {
				startIndex: startIndex,
				endIndex: endIndex
			};
		};

		var getLinkText = function(i, style, pageSize, pagesCount, recordsCount){

			var linkText = i;

			// It's a pagebar
			if(style === "pages"){
				//linkText = i;
			}
			// It's a linkbar
			else{
				var start = "";
				var end = "";
				if(i !== 1){
					start = (pageSize * (i - 1)) + 1;
				}
				else{
					// First link
					start = 1;
				}
				if(i < (pagesCount)){
					end = start + pageSize - 1;
				}
				else{
					// Last link
					end = recordsCount;
				}
				linkText = start + " - " + end;
			}

			return linkText;
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.render();
		};


	};

}());