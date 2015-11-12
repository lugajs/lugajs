(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DataSet.row
	 *
	 * @property {string} rowID  Artificial PK
	 */

	/**
	 * @typedef {object} luga.data.DataSet.options
	 *
	 * @property {string}              id        Unique identifier. Required
	 * @property {array|object|null}   records   Records to be loaded, either one single object or an array of objects.  Default to null
	 * @property {function|null}       filter    A filter functions to be called once for each row in the dataSet. Default to null
	 */

	/**
	 * Base Dataset class
	 *
	 * @param {luga.data.DataSet.options} options
	 * @constructor
	 * @extends luga.Notifier
	 * @fires dataChanged
	 * @fires currentRowChanged
	 */
	luga.data.DataSet = function(options){
		if(options.id === undefined){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_ID_PARAMETER);
		}
		if((options.filter !== undefined) && (jQuery.isFunction(options.filter) === false)){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
		}
		luga.extend(luga.Notifier, this);
		/** @type {luga.data.DataSet} */
		var self = this;

		this.id = options.id;
		/** @type {array.<luga.data.DataSet.row>} */
		this.records = [];
		/** @type {hash.<luga.data.DataSet.row>} */
		this.recordsHash = {};
		this.filteredRecords = null;
		this.filter = null;
		this.currentRowId = 0;

		luga.data.datasetRegistry[this.id] = this;

		/**
		 * Adds rows to a dataSet
		 * Be aware that the dataSet use passed data by reference
		 * That is, it uses those objects as its row object internally. It does not make a copy
		 * @param  {array|object|null} records    Either one single object or an array of objects. Required
		 * @fires dataChanged
		 */
		this.insert = function(records){
			// If we only get one record, we put it inside an array anyway,
			var recordsHolder = [];
			if(jQuery.isArray(records) === true){
				recordsHolder = records;
			}
			else{
				recordsHolder.push(records);
			}
			for(var i = 0; i < recordsHolder.length; i++){
				// Create new PK
				var recordID = this.records.length;
				recordsHolder[i][luga.data.CONST.PK_KEY] = recordID;
				this.recordsHash[this.records.length] = recordsHolder[i];
				this.records.push(recordsHolder[i]);
			}
			applyFilter();
			this.notifyObservers("dataChanged", this);
		};

		/**
		 * Returns an array of the internal row objects that store the records in the dataSet
		 * Be aware that modifying any property of a returned object results in a modification of the internal records (since records are passed by reference)
		 * @param {function|null} filter   An optional filter function. If specified only records matching the filter will be returned. Default to null
		 *                                 The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
		 * @return {object}
		 */
		this.select = function(filter){
			if(filter === undefined){
				return selectAll();
			}
			if(jQuery.isFunction(filter) === false){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			return filterRecords(selectAll(), filter);
		};

		/**
		 * Delete records matching the given filter
		 * If no filter is passed, delete all records
		 * @param {function|null} filter   An optional filter function. If specified only records matching the filter will be returned. Default to null
		 *                                 The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
		 * @fires dataChanged
		 */
		this.delete = function(filter){
			if(filter === undefined){
				deleteAll();
				return;
			}
			if(jQuery.isFunction(filter) === false){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			this.records = filterRecords(selectAll(), filter);
			applyFilter();
			this.notifyObservers("dataChanged", this);
		};

		/**
		 * Returns the number of records in the dataSet
		 * If the dataSet has a filter, returns the number of filtered records
		 * @return {number}
		 */
		this.getRecordsCount = function(){
			return selectAll().length;
		};

		/**
		 * Returns the row object associated with the given uniqe identifier
		 * @param {string} rowId  Required
		 * @return {object}
		 */
		this.getRowById = function(rowId){
			if(this.recordsHash[rowId] !== undefined){
				return this.recordsHash[rowId];
			}
			return null;
		};

		/**
		 * Returns the rowId of the current row
		 * Do not confuse the rowId of a row with the index of the row
		 * The rowId is a column that contains a unique identifier for the row
		 * This identifier does not change if the rows of the data set are sorted
		 * @returns {number}
		 */
		this.getCurrentRowId = function(){
			return this.currentRowId;
		};

		/**
		 * Sets the current row of the data set to the row matching the given rowId
		 * Throws an exception if the given rowId is invalid
		 * Triggers a "currentRowChanged" notification
		 * @param {number} rowId  Required
		 * @fires currentRowChanged
		 */
		this.setCurrentRowId = function(rowId){
			if(this.currentRowId === rowId){
				return;
			}
			if(this.getRowById(rowId) === null){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_ROW_ID_PARAMETER);
			}
			var notificationData = { oldRowId: this.currentRowId, newRowId: rowId, dataSet: this };
			this.currentRowId = rowId;
			this.notifyObservers("currentRowChanged", notificationData);
		};

		/**
		 * Replace current filter with a new filter functions and apply the new filter
		 * Triggers a "dataChanged" notification
		 * @param {function} filter   A filter functions to be called once for each row in the data set. Required
		 *                            The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
		 * @fires dataChanged
		 */
		this.setFilter = function(filter){
			if(jQuery.isFunction(filter) === false){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			this.filter = filter;
			applyFilter();
			this.notifyObservers("dataChanged", this);
		};

		/**
		 * Remove the current filter function
		 * Triggers a "dataChanged" notification
		 * @fires dataChanged
		 */
		this.deleteFilter = function(){
			this.filter = null;
			this.filteredRecords = null;
			this.notifyObservers("dataChanged", this);
		};

		var selectAll = function(){
			if(self.filteredRecords !== null){
				return self.filteredRecords;
			}
			return self.records;
		};

		var deleteAll = function(){
			self.filteredRecords = null;
			self.records = [];
			self.recordsHash = {};
		};

		var applyFilter = function(){
			if(self.filter !== null){
				self.filteredRecords = filterRecords(self.records, self.filter);
			}
		};

		var filterRecords = function(orig, filter){
			var filtered = [];
			for(var i = 0; i < orig.length; i++){
				var newRow = filter(this, orig[i], i);
				if(newRow){
					filtered.push(newRow);
				}
			}
			return filtered;
		};

		if(options.filter !== undefined){
			this.setFilter(options.filter);
		}
		if(options.records !== undefined){
			this.insert(options.records);
		}

	};

}());