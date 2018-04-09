(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.PagedView.context
	 *
	 * @extend luga.data.DataSet.context
	 * @property {Number} currentPageNumber        The current page index. Starting at 1
	 * @property {Number} currentPageRecordCount   The total number of records in the current page
	 * @property {Number} pageCount                The total number of pages required to display all of the data
	 * @property {Number} pageSize                 The maximum number of items that can be in a page
	 * @property {Number} currentOffsetStart       Zero-based offset of the first record inside the current page
	 * @property {Number} currentOffsetEnd         Zero-based offset of the last record inside the current page
	 */

	/**
	 * @typedef {Object} luga.data.PagedView.options
	 *
	 * @property {String}            uuid           Unique identifier. Required
	 * @property {luga.data.DataSet} parentDataSet  Instance of a dataSet. Required
	 * @property {Number}            pageSize       The max number of rows in a given page. Default to 10
	 */

	/*
	 *  PagedView class
	 *  Works by reading a dataSet and extracting information out of it in order to generate additional information that can be used for paging
	 *
	 * @param {luga.data.PagedView.options} options
	 * @constructor
	 * @extend luga.Notifier
	 */
	luga.data.PagedView = function(options){

		const CONST = {
			ERROR_MESSAGES: {
				INVALID_UUID_PARAMETER: "luga.data.PagedView: id parameter is required",
				INVALID_DS_PARAMETER: "luga.data.PagedView: parentDataSet parameter is required"
			}
		};

		if(options.uuid === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_UUID_PARAMETER);
		}
		if(options.parentDataSet === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_DS_PARAMETER);
		}

		luga.extend(luga.Notifier, this);

		/** @type {luga.data.PagedView} */
		const self = this;

		this.uuid = options.uuid;
		this.parentDataSet = options.parentDataSet;
		this.parentDataSet.addObserver(this);

		luga.data.setDataSource(this.uuid, this);

		let pageSize = 10;
		if(options.pageSize !== undefined){
			pageSize = options.pageSize;
		}

		let currentPage = 1;
		let currentOffsetStart = 0;

		/**
		 * @return {luga.data.PagedView.context}
		 */
		this.getContext = function(){
			const context = self.parentDataSet.getContext();
			context.entities = context.entities.slice(self.getCurrentOffsetStart(), self.getCurrentOffsetEnd() + 1);
			// Additional fields
			context.currentPageNumber = self.getCurrentPageIndex();
			context.currentPageRecordCount = context.entities.length;
			context.currentOffsetEnd = self.getCurrentOffsetEnd();
			context.currentOffsetStart = self.getCurrentOffsetStart();
			context.pageSize = self.getPageSize();
			context.pageCount = self.getPagesCount();
			return context;
		};

		/**
		 * Return the zero-based offset of the last record inside the current page
		 * @return {Number}
		 */
		this.getCurrentOffsetEnd = function(){
			let offSet = self.getCurrentOffsetStart() + self.getPageSize() - 1;
			if(offSet > self.getRecordsCount()){
				offSet = self.getRecordsCount();
			}
			return offSet;
		};

		/**
		 * Return the zero-based offset of the first record inside the current page
		 * @return {Number}
		 */
		this.getCurrentOffsetStart = function(){
			return currentOffsetStart;
		};

		/**
		 * Return the current page index. Starting at 1
		 * @return {Number}
		 */
		this.getCurrentPageIndex = function(){
			return currentPage;
		};

		/**
		 * Return the total number of pages required to display all of the data
		 * @return {Number}
		 */
		this.getPagesCount = function(){
			return parseInt((self.parentDataSet.getRecordsCount() + self.getPageSize() - 1) / self.getPageSize());
		};

		/**
		 * Return the maximum number of items that can be in a page
		 * @return {Number}
		 */
		this.getPageSize = function(){
			return pageSize;
		};

		/**
		 * Navigate to the given page number
		 * Fails silently if the given page number is out of range
		 * It also change the index of the current row to match the first record in the page
		 * @param {Number} pageNumber
		 * @fire dataChanged
		 */
		this.goToPage = function(pageNumber){
			if(self.isPageInRange(pageNumber) === false){
				return;
			}
			if(pageNumber === self.getCurrentPageIndex()){
				return;
			}
			currentPage = pageNumber;
			currentOffsetStart = ((pageNumber - 1) * self.getPageSize());

			self.setCurrentRowIndex(self.getCurrentOffsetStart());
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Navigate to the next page
		 * Fails silently if the current page is the last one
		 */
		this.goToNextPage = function(){
			self.goToPage(self.getCurrentPageIndex() + 1);
		};

		/**
		 * Navigate to the previous page
		 * Fails silently if the current page is the first one
		 */
		this.goToPrevPage = function(){
			self.goToPage(self.getCurrentPageIndex() - 1);
		};

		/**
		 * Return true if the given page is within range. False otherwise
		 * @param {Number} pageNumber
		 * @return {Boolean}
		 */
		this.isPageInRange = function(pageNumber){
			if(pageNumber < 1 || pageNumber > self.getPagesCount()){
				return false;
			}
			return true;
		};

		/**
		 * To be used for type checking
		 * @return {Boolean}
		 */
		this.isPagedView = function(){
			return true;
		};

		/* Proxy methods */

		/**
		 * Call the parent dataSet
		 * @return {Number}
		 */
		this.getCurrentRowIndex = function(){
			return self.parentDataSet.getCurrentRowIndex();
		};

		/**
		 * Call the parent dataSet
		 * @return {Number}
		 */
		this.getRecordsCount = function(){
			return self.parentDataSet.getRecordsCount();
		};

		/**
		 * Call the parent dataSet .loadData() method, if any
		 * @fire dataLoading
		 * @throw {Exception}
		 */
		this.loadData = function(){
			if(self.parentDataSet.loadData !== undefined){
				self.parentDataSet.loadData();
			}
		};

		/**
		 * Call the parent dataSet
		 * @param {String|null} rowId  Required
		 * @fire currentRowChanged
		 * @throw {Exception}
		 */
		this.setCurrentRowId = function(rowId){
			self.parentDataSet.setCurrentRowId(rowId);
		};

		/**
		 * Call the parent dataSet
		 * @param {Number} index  New index. Required
		 * @fire currentRowChanged
		 * @throw {Exception}
		 */
		this.setCurrentRowIndex = function(index){
			self.parentDataSet.setCurrentRowIndex(index);
		};

		/**
		 * Call the parent dataSet
		 * @param {null|luga.data.STATE} newState
		 * @fire stateChanged
		 */
		this.setState = function(newState){
			self.parentDataSet.setState(newState);
		};

		/**
		 * Call the parent dataSet
		 * Be aware this only sort the data, it does not affects pagination
		 * @param {String|Array<String>}  columnNames             Required, either a single column name or an array of names
		 * @param {luga.data.sort.ORDER} [sortOrder="toggle"]     Either "ascending", "descending" or "toggle". Optional, default to "toggle"
		 * @fire preDataSorted
		 * @fire dataSorted
		 * @fire dataChanged
		 */
		this.sort = function(columnNames, sortOrder){
			self.parentDataSet.sort(columnNames, sortOrder);
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * @param {luga.data.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.notifyObservers(luga.data.CONST.EVENTS.STATE_CHANGED, {dataSource: this});
		};

	};

}());