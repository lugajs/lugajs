(function(){
	"use strict";

	/**
	 * @typedef {Object} luga.data.PagedView.options
	 *
	 * @property {String}            uuid           Unique identifier. Required
	 * @property {luga.data.DataSet} parentDataSet  Master dataSet. Required
	 * @property {Number}            pageSize       The max number of rows in a given page. Default to 10
	 */

	/*
	 *  PagedView class
	 *  Register itself as observer of the passed dataSet and handle pagination on it
	 *
	 * @param {luga.data.PagedView.options} options
	 * @constructor
	 * @extend luga.Notifier
	 */
	luga.data.PagedView = function(options){

		var CONST = {
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
		var self = this;

		this.uuid = options.uuid;
		this.parentDataSet = options.parentDataSet;
		this.parentDataSet.addObserver(this);

		luga.data.setDataSource(this.uuid, this);

		this.pageSize = 10;
		if(options.pageSize !== undefined){
			this.pageSize = options.pageSize;
		}

		var pageOffset = 0;
		var adjustmentValue = 1;

		/**
		 * @return {luga.data.DataSet.context}
		 */
		this.getContext = function(){
			var context = self.parentDataSet.getContext();
			context.entities = context.entities.slice(0, 10);

			console.debug(context)

			return context;
		};

		/**
		 * Call the parent dataSet
		 * @return {Number}
		 */
		this.getRecordsCount = function(){
			return self.parentDataSet.getRecordsCount();
		};

		/**
		 * Call the parent dataSet
		 * @fire dataLoading
		 * @throw {Exception}
		 */
		this.loadData = function(){
			self.parentDataSet.loadData();
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
		 * @param {String|Array<String>}  columnNames             Required, either a single column name or an array of names
		 * @param {luga.data.sort.ORDER} [sortOrder="toggle"]     Either "ascending", "descending" or "toggle". Optional, default to "toggle"
		 * @fire preDataSorted
		 * @fire dataSorted
		 * @fire dataChanged
		 */
		this.sort = function(columnNames, sortOrder){
			self.parentDataSet.sort(columnNames, sortOrder);
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			self.notifyObservers(luga.data.CONST.EVENTS.CURRENT_ROW_CHANGED, data);
		};

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, data);
		};

		/**
		 * @param {luga.data.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.notifyObservers(luga.data.CONST.EVENTS.STATE_CHANGED, data);
		};

	};

}());