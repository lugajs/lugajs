/*! 
Luga Data 0.3.10 2016-01-10T18:13:33.947Z
Copyright 2013-2016 Massimo Foti (massimo@massimocorner.com)
Licensed under the Apache License, Version 2.0 | http://www.apache.org/licenses/LICENSE-2.0
 */
if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

/**
 * @typedef {object} luga.data.dataSourceChanged
 *
 * @property {luga.data.DataSet|luga.data.DetailSet} dataSource
 */

(function(){
	"use strict";

	luga.namespace("luga.data");

	luga.data.version = "0.3.10";
	/** @type {hash.<luga.data.DataSet>} */
	luga.data.dataSourceRegistry = {};

	luga.data.CONST = {
		COL_TYPES: ["date", "number", "string"],
		EVENTS: {
			CURRENT_ROW_CHANGED: "currentRowChanged",
			DATA_CHANGED: "dataChanged",
			DATA_SORTED: "dataSorted",
			DATA_LOADING: "dataLoading",
			PRE_DATA_SORTED: "preDataSorted",
			STATE_CHANGED: "stateChanged",
			XHR_ERROR: "xhrError"
		},
		ERROR_MESSAGES: {
			DUPLICATED_UUID: "Unable to register dataSource. The uuuid was already used: {0}",
			INVALID_FILTER_PARAMETER: "Invalid filter. You must use a function as filter",
			INVALID_FILTER_ACTION: "Invalid action from a filter function. A filter must return either a plain object or null (undefined, primitives etc are not valid return values)",
			INVALID_UPDATER_PARAMETER: "Invalid updater. You must use a function as updater",
			INVALID_UPDATER_ACTION: "Invalid action from an updater function. An updater must return a plain object (null, undefined, primitives etc are not valid return values)",
			INVALID_STATE: "luga.data.utils.assembleStateDescription: Unsupported state: {0}"
		},
		PK_KEY: "lugaRowId",
		PK_KEY_PREFIX: "lugaPk_",
		USER_AGENT: "luga.data",
		XHR_TIMEOUT: 10000 // Keep this accessible to everybody
	};

	/**
	 * Returns a dataSource from the registry
	 * Returns null if no source matches the given id
	 * @param {string} uuid
	 * @returns {luga.data.DataSet|luga.data.DetailSet}
	 */
	luga.data.getDataSource = function(uuid){
		if(luga.data.dataSourceRegistry[uuid] !== undefined){
			return luga.data.dataSourceRegistry[uuid];
		}
		return null;
	};

	/**
	 * Adds a dataSource inside the registry
	 * @param {string}                                uuid
	 * @param {luga.data.DataSet|luga.data.DetailSet} dataSource
	 * @throws
	 */
	luga.data.setDataSource = function(uuid, dataSource){
		if(luga.data.getDataSource(uuid) !== null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.DUPLICATED_UUID, [uuid]));
		}
		luga.data.dataSourceRegistry[uuid] = dataSource;
	};

	/**
	 * @typedef {string} luga.data.STATE
	 * @enum {string}
	 */
	luga.data.STATE = {
		ERROR: "error",
		LOADING: "loading",
		READY: "ready"
	};

	luga.namespace("luga.data.utils");

	/**
	 * @typedef {object} luga.data.stateDescription
	 *
	 * @property {null|luga.data.STATE}  state
	 * @property {boolean}          isStateLoading
	 * @property {boolean}          isStateError
	 * @property {boolean}          isStateReady
	 */

	/**
	 * Given a state string, returns an object containing a boolean field for each possible state
	 * @param {null|luga.data.STATE} state
	 * @throws
	 * @returns {luga.data.stateDescription}
	 */
	luga.data.utils.assembleStateDescription = function(state){
		if((state !== null) && (luga.data.utils.isValidState(state) === false)){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.INVALID_STATE, [state]));
		}
		return {
			state: state,
			isStateError: (state === luga.data.STATE.ERROR),
			isStateLoading: (state === luga.data.STATE.LOADING),
			isStateReady: (state === luga.data.STATE.READY)
		};
	};

	/**
	 * Apply the given filter function to each passed row
	 * Return an array of filtered rows
	 * @param {array.<luga.data.DataSet.row>} rows. Required
	 * @param {function}                      filter. Required
	 * @param {luga.data.DataSet}             dataset. Required
	 * @returns {array.<luga.data.DataSet.row>}
	 * @throws
	 */
	luga.data.utils.filter = function(rows, filter, dataset){
		if(jQuery.isFunction(filter) === false){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
		}
		var retRows = [];
		for(var i = 0; i < rows.length; i++){
			var filteredRow = filter(rows[i], i, dataset);
			// Row to be removed
			if(filteredRow === null){
				continue;
			}
			// Invalid row
			if(jQuery.isPlainObject(filteredRow) === false){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_FORMATTER_ACTION);
			}
			// Valid row
			retRows.push(filteredRow);
		}
		return retRows;
	};

	/**
	 * Apply the given updater function to each passed row
	 * @param {array.<luga.data.DataSet.row>} rows. Required
	 * @param {function}                      updater. Required
	 * @param {luga.data.DataSet}             dataset. Required
	 * @throws
	 */
	luga.data.utils.update = function(rows, formatter, dataset){
		if(jQuery.isFunction(formatter) === false){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_UPDATER_ACTION);
		}
		for(var i = 0; i < rows.length; i++){
			var formattedRow = formatter(rows[i], i, dataset);
			if(jQuery.isPlainObject(formattedRow) === false){
				throw(luga.data.CONST.ERROR_MESSAGES.INVALID_UPDATER_ACTION);
			}
		}
	};

	/**
	 * Return true if the passed state is supported
	 * @param {string}  state
	 * @returns {boolean}
	 */
	luga.data.utils.isValidState = function(state){
		for(var key in luga.data.STATE){
			if(luga.data.STATE[key] === state){
				return true;
			}
		}
		return false;
	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DataSet.row
	 *
	 * @property {string} rowID  Artificial PK
	 */

	/**
	 * @typedef {object} luga.data.DataSet.currentRowChanged
	 *
	 * @property {string}                oldRowId
	 * @property {luga.data.DataSet.row} oldRow
	 * @property {string}                currentRowId
	 * @property {luga.data.DataSet.row} currentRow
	 * @property {luga.data.DataSet}     dataSet
	 */

	/**
	 * @typedef {object} luga.data.DataSet.dataSorted
	 *
	 * @property {luga.data.DataSet}    dataSet
	 * @property {array<string>}        oldSortColumns
	 * @property {luga.data.sort.ORDER} oldSortOrder
	 * @property {array<string>}        newSortColumns
	 * @property {luga.data.sort.ORDER} newSortOrder
	 */

	/**
	 * @typedef {object} luga.data.DataSet.stateChanged
	 *
	 * @property {luga.data.DataSet}     dataSet
	 * @property {null|luga.data.STATE}  currentState
	 * @property {null|luga.data.STATE}  oldState
	 */

	/**
	 * @typedef {object} luga.data.DataSet.context
	 * @extends luga.data.stateDescription
	 *
	 * @property {number}                         recordCount
	 * @property {array.<luga.data.DataSet.row>}  entities
	 */

	/**
	 * @typedef {object} luga.data.DataSet.options
	 *
	 * @property {string}                uuid       Unique identifier. Required
	 * @property {array.<object>|object} records    Records to be loaded, either one single object containing value/name pairs, or an array of name/value pairs
	 * @property {function}              formatter  A formatting functions to be called once for each row in the dataSet. Default to null
	 * @property {function}              filter     A filter functions to be called once for each row in the dataSet. Default to null
	 */

	/**
	 * Base DataSet class
	 *
	 * @param {luga.data.DataSet.options} options
	 * @constructor
	 * @extends luga.Notifier
	 * @fires dataChanged
	 * @fires currentRowChanged
	 * @fires dataSorted
	 * @fires preDataSorted
	 * @throws
	 */
	luga.data.DataSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				INVALID_COL_TYPE: "Luga.DataSet.setColumnType(): Invalid type passed {0}",
				INVALID_UUID_PARAMETER: "Luga.DataSet: uuid parameter is required",
				INVALID_FORMATTER_PARAMETER: "Luga.DataSet: invalid formatter. You must use a function as formatter",
				INVALID_FILTER_PARAMETER: "Luga.DataSet: invalid filter. You must use a function as filter",
				INVALID_PRIMITIVE: "Luga.DataSet: records can be either an array of objects or a single object. Primitives are not accepted",
				INVALID_PRIMITIVE_ARRAY: "Luga.DataSet: records can be either an array of name/value pairs or a single object. Array of primitives are not accepted",
				INVALID_ROW_PARAMETER: "Luga.DataSet: invalid row parameter. No available record matches the given row",
				INVALID_ROW_ID_PARAMETER: "Luga.DataSet: invalid rowId parameter",
				INVALID_ROW_INDEX_PARAMETER: "Luga.DataSet: invalid parameter. Row index is out of range",
				INVALID_SORT_COLUMNS: "Luga.DataSet.sort(): Unable to sort dataSet. You must supply one or more column name",
				INVALID_SORT_ORDER: "Luga.DataSet.sort(): Unable to sort dataSet. Invalid sort order passed {0}",
				INVALID_STATE: "Luga.DataSet: Unsupported state: {0}"
			}
		};

		if(options.uuid === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_UUID_PARAMETER);
		}
		if((options.formatter !== undefined) && (jQuery.isFunction(options.formatter) === false)){
			throw(CONST.ERROR_MESSAGES.INVALID_FORMATTER_PARAMETER);
		}
		if((options.filter !== undefined) && (jQuery.isFunction(options.filter) === false)){
			throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
		}
		luga.extend(luga.Notifier, this);

		/** @type {luga.data.DataSet} */
		var self = this;

		this.uuid = options.uuid;

		/** @type {array.<luga.data.DataSet.row>} */
		this.records = [];

		/** @type {hash.<luga.data.DataSet.row>} */
		this.recordsHash = {};

		/** @type {null|function} */
		this.formatter = null;
		if(options.formatter !== undefined){
			this.formatter = options.formatter;
		}

		/** @type {null|array.<luga.data.DataSet.row>} */
		this.filteredRecords = null;

		/** @type {null|function} */
		this.filter = null;

		/** @type {null|luga.data.STATE} */
		this.state = null;

		this.currentRowId = null;
		this.columnTypes = {};
		this.lastSortColumns = [];
		this.lastSortOrder = "";

		luga.data.setDataSource(this.uuid, this);

		/* Private methods */

		var deleteAll = function(){
			self.filteredRecords = null;
			self.records = [];
			self.recordsHash = {};
		};

		var applyFilter = function(){
			if(hasFilter() === true){
				self.filteredRecords = luga.data.utils.filter(self.records, self.filter, self);
				self.resetCurrentRow();
			}
		};

		var applyFormatter = function(){
			if(hasFormatter() === true){
				luga.data.utils.update(self.records, self.formatter, self);
			}
		};

		var hasFilter = function(){
			return (self.filter !== null);
		};

		var hasFormatter = function(){
			return (self.formatter !== null);
		};

		var selectAll = function(){
			if(hasFilter() === true){
				return self.filteredRecords;
			}
			return self.records;
		};

		/* Public methods */

		/**
		 * Remove the current filter function
		 * Triggers a "dataChanged" notification
		 * @fires dataChanged
		 */
		this.clearFilter = function(){
			this.filter = null;
			this.filteredRecords = null;
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Delete records matching the given filter
		 * If no filter is passed, delete all records
		 * @param {function} filter   A filter function. If specified only records matching the filter will be returned. Optional
		 *                            The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @fires currentRowChanged
		 * @fires stateChanged
		 * @fires dataChanged
		 * @throws
		 */
		this.delete = function(filter){
			if(filter === undefined){
				deleteAll();
			}
			else{
				if(jQuery.isFunction(filter) === false){
					throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
				}
				var orig = this.records;
				for(var i = 0; i < orig.length; i++){
					if(filter(orig[i], i, this) === null){
						// If matches, delete from array and hash
						var rowToDelete = orig[i];
						this.records.splice(i, 1);
						delete this.recordsHash[rowToDelete[luga.data.CONST.PK_KEY]];
					}
				}
				applyFilter();
			}
			this.resetCurrentRow();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Returns the column type of the specified column. Either "date", "number" or "string"
		 * @param {string} columnName
		 * @returns {string}
		 */
		this.getColumnType = function(columnName){
			if(this.columnTypes[columnName] !== undefined){
				return this.columnTypes[columnName];
			}
			return "string";
		};

		/**
		 * @returns {luga.data.DataSet.context}
		 */
		this.getContext = function(){
			var context = {
				entities: self.select(),
				recordCount: self.getRecordsCount()
			};
			var stateDesc = luga.data.utils.assembleStateDescription(self.getState());
			luga.merge(context, stateDesc);
			return context;
		};

		/**
		 * Returns the current row object
		 * By default, the current row is the first row of the dataSet, but this can be changed by calling setCurrentRow() or setCurrentRowIndex().
		 * @returns {luga.data.DataSet.row}
		 */
		this.getCurrentRow = function(){
			return this.getRowById(this.getCurrentRowId());
		};

		/**
		 * Returns the rowId of the current row
		 * Do not confuse the rowId of a row with the index of the row
		 * RowId is a column that contains a unique identifier for the row
		 * This identifier does not change if the rows of the dataSet are sorted
		 * @returns {string}
		 */
		this.getCurrentRowId = function(){
			return this.currentRowId;
		};

		/**
		 * Returns a zero-based index at which the current row can be found, or -1 if the dataSet is empty
		 * @returns {number}
		 */
		this.getCurrentRowIndex = function(){
			var row = this.getCurrentRow();
			if(row !== undefined){
				return this.getRowIndex(row);
			}
		};

		/**
		 * Returns the number of records in the dataSet
		 * If the dataSet has a filter, returns the number of filtered records
		 * @returns {number}
		 */
		this.getRecordsCount = function(){
			return selectAll().length;
		};

		/**
		 * Returns the row object associated with the given unique identifier
		 * @param {string} rowId  Required
		 * @returns {null|luga.data.DataSet.row}
		 */
		this.getRowById = function(rowId){
			var targetRow = this.recordsHash[rowId];
			if(targetRow === undefined){
				// Nothing matches
				return null;
			}
			if(hasFilter() === true){
				if(this.filteredRecords.indexOf(targetRow) !== -1){
					return targetRow;
				}
				return null;
			}
			// No filter, return the matching row
			return targetRow;
		};

		/**
		 * Returns the row object associated with the given index
		 * Throws an exception if the index is out of range
		 * @param {number} index  Required
		 * @returns {luga.data.DataSet.row}
		 * @throws
		 */
		this.getRowByIndex = function(index){
			var fetchedRow;
			if(hasFilter() === true){
				fetchedRow = this.filteredRecords[index];
			}
			else{
				fetchedRow = this.records[index];
			}
			if(fetchedRow === undefined){
				throw(CONST.ERROR_MESSAGES.INVALID_ROW_INDEX_PARAMETER);
			}
			return fetchedRow;
		};

		/**
		 * Returns the index at which a row can be found in the dataSet, or -1 if no available record matches the given row
		 * @param {luga.data.DataSet.row} row
		 */
		this.getRowIndex = function(row){
			if(hasFilter() === true){
				return this.filteredRecords.indexOf(row);
			}
			return this.records.indexOf(row);
		};

		/**
		 * Returns the name of the column used for the most recent sort
		 * Returns an empty string if no sort has been performed yet
		 * @returns {string}
		 */
		this.getSortColumn = function(){
			return (this.lastSortColumns && this.lastSortColumns.length > 0) ? this.lastSortColumns[0] : "";
		};

		/**
		 * Returns the order used for the most recent sort
		 * Returns an empty string if no sort has been performed yet
		 * @returns {string}
		 */
		this.getSortOrder = function(){
			return this.lastSortOrder ? this.lastSortOrder : "";
		};

		/**
		 * Returns the dataSet's current state
		 * @returns {null|luga.data.STATE}
		 */
		this.getState = function(){
			return this.state;
		};

		/**
		 * Adds rows to a dataSet
		 * Be aware that the dataSet use passed data by reference
		 * That is, it uses those objects as its row object internally. It does not make a copy
		 * @param  {array.<object>|object} records   Records to be loaded, either one single object containing value/name pairs, or an array of objects. Required
		 * @fires stateChanged
		 * @fires dataChanged
		 * @throws
		 */
		this.insert = function(records){
			// If we only get one record, we put it inside an array anyway,
			var recordsHolder = [];
			if(jQuery.isArray(records) === true){
				recordsHolder = records;
			}
			else{
				// Ensure we don't have primitive values
				if(jQuery.isPlainObject(records) === false){
					throw(CONST.ERROR_MESSAGES.INVALID_PRIMITIVE);
				}
				recordsHolder.push(records);
			}
			for(var i = 0; i < recordsHolder.length; i++){
				// Ensure we don't have primitive values
				if(jQuery.isPlainObject(recordsHolder[i]) === false){
					throw(CONST.ERROR_MESSAGES.INVALID_PRIMITIVE_ARRAY);
				}
				// Create new PK
				var recordID = luga.data.CONST.PK_KEY_PREFIX + this.records.length;
				recordsHolder[i][luga.data.CONST.PK_KEY] = recordID;
				this.recordsHash[recordID] = recordsHolder[i];
				this.records.push(recordsHolder[i]);
			}
			applyFormatter();
			applyFilter();
			this.resetCurrentRow();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Reset the currentRowId. Persist previous selection if possible
		 * @fires currentRowChanged
		 */
		this.resetCurrentRow = function(){
			// If we have previous selection
			if(this.currentRowId !== null){
				// Try to persist
				var targetRow = this.getRowById(this.currentRowId);
				if(targetRow !== null){
					this.setCurrentRowId(this.currentRowId);
					return;
				}
			}
			// No previous selection
			this.resetCurrentRowToFirst();
		};

		/**
		 * Reset the currentRowId to the first record available
		 * @fires currentRowChanged
		 */
		this.resetCurrentRowToFirst = function(){
			// We have a filter
			if(hasFilter() === true){
				if((this.filteredRecords === null) || (this.filteredRecords.length === 0)){
					this.setCurrentRowId(null);
					return;
				}
				if(this.filteredRecords.length > 0){
					// First among the filtered records
					this.setCurrentRowId(this.filteredRecords[0][luga.data.CONST.PK_KEY]);
					return;
				}
			}
			// No filter
			if(this.records.length > 0){
				// First record
				this.setCurrentRowId(this.records[0][luga.data.CONST.PK_KEY]);
			}
			else{
				this.setCurrentRowId(null);
			}
		};

		/**
		 * Returns an array of the internal row objects that store the records in the dataSet
		 * Be aware that modifying any property of a returned object results in a modification of the internal records (since records are passed by reference)
		 * @param {function} filter   An optional filter function. If specified only records matching the filter will be returned. Optional
		 *                            The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @returns {array.<luga.data.DataSet.row>}
		 * @throws
		 */
		this.select = function(filter){
			if(filter === undefined){
				return selectAll();
			}
			if(jQuery.isFunction(filter) === false){
				throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			return luga.data.utils.filter(selectAll(), filter, self);
		};

		/**
		 * Set a column type for a column. Required for proper sorting of numeric or date data.
		 * By default data is sorted alpha-numerically, if you want it sorted numerically or by date, set the proper columnType
		 * @param {string|array<string>} columnNames
		 * @param {string}               columnType   Either "date", "number" or "string"
		 */
		this.setColumnType = function(columnNames, columnType){
			if(jQuery.isArray(columnNames) === false){
				columnNames = [columnNames];
			}
			for(var i = 0; i < columnNames.length; i++){
				var colName = columnNames[i];
				if(luga.data.CONST.COL_TYPES.indexOf(columnType) === -1){
					throw(luga.string.format(CONST.ERROR_MESSAGES.INVALID_COL_TYPE, [colName]));
				}
				this.columnTypes[colName] = columnType;
			}
		};

		/**
		 * Sets the current row of the data set to the row matching the given rowId
		 * Throws an exception if the given rowId is invalid
		 * If null is passed, no row is selected
		 * Triggers a "currentRowChanged" notification
		 * @param {string|null} rowId  Required
		 * @fires currentRowChanged
		 * @throws
		 */
		this.setCurrentRowId = function(rowId){
			// No need to do anything
			if(this.currentRowId === rowId){
				return;
			}
			/**
			 * @type {luga.data.DataSet.currentRowChanged}
			 */
			var notificationData = {
				oldRowId: this.getCurrentRowId(),
				oldRow: this.getRowById(this.currentRowId),
				currentRowId: rowId,
				currentRow: this.getRowById(rowId),
				dataSet: this
			};
			// Set to null
			if((rowId === null) && (this.currentRowId !== null)){
				this.currentRowId = null;
				this.notifyObservers(luga.data.CONST.EVENTS.CURRENT_ROW_CHANGED, notificationData);
				return;
			}
			// Validate input
			if(this.getRowById(rowId) === null){
				throw(CONST.ERROR_MESSAGES.INVALID_ROW_ID_PARAMETER);
			}
			this.currentRowId = rowId;
			this.notifyObservers(luga.data.CONST.EVENTS.CURRENT_ROW_CHANGED, notificationData);
		};

		/**
		 * Set the passed row as currentRow
		 * Throws an exception if no available record matches the given row
		 * @param {luga.data.DataSet.row} row
		 * @fires currentRowChanged
		 * @throws
		 */
		this.setCurrentRow = function(row){
			var fetchedRowId = this.getRowIndex(row);
			if(fetchedRowId === -1){
				throw(CONST.ERROR_MESSAGES.INVALID_ROW_PARAMETER);
			}
			this.setCurrentRowId(luga.data.CONST.PK_KEY_PREFIX + fetchedRowId);
		};

		/**
		 * Sets the current row of the dataSet to the one matching the given index
		 * Throws an exception if the index is out of range
		 * @param {number} index  New index. Required
		 * @fires currentRowChanged
		 * @throws
		 */
		this.setCurrentRowIndex = function(index){
			this.setCurrentRow(this.getRowByIndex(index));
		};

		/**
		 * Replace current filter with a new filter functions and apply the new filter
		 * Triggers a "dataChanged" notification
		 * @param {function} filter   A filter functions to be called once for each row in the data set. Required
		 *                            The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @fires currentRowChanged
		 * @fires dataChanged
		 * @throws
		 */
		this.setFilter = function(filter){
			if(jQuery.isFunction(filter) === false){
				throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			this.filter = filter;
			applyFilter();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Set current state
		 * This method is not intended to be called outside the dataSet. It's public only to be accessible to subclasses
		 * @param {null|luga.data.STATE} newState
		 * @fires stateChanged
		 */
		this.setState = function(newState){
			if(luga.data.utils.isValidState(newState) === false){
				throw(luga.string.format(CONST.ERROR_MESSAGES.INVALID_STATE, [newState]));
			}
			var oldState = this.state;
			this.state = newState;

			/** @type {luga.data.DataSet.stateChanged} */
			var notificationData = {
				oldState: oldState,
				currentState: this.state,
				dataSet: this
			};

			this.notifyObservers(luga.data.CONST.EVENTS.STATE_CHANGED, notificationData);
		};

		/**
		 * Sorts the dataSet using the given column(s) and sort order
		 * @param {string|array<string>}  columnNames Required, either a single column name or an array of names
		 * @param {luga.data.sort.ORDER}  sortOrder   Either "ascending", "descending" or "toggle". Optional, default to "toggle"
		 * @fires preDataSorted
		 * @fires dataSorted
		 * @fires dataChanged
		 */
		this.sort = function(columnNames, sortOrder){
			/*
			 Very special thanks to Kin Blas https://github.com/jblas
			 */
			if((columnNames === undefined) || (columnNames === null)){
				throw(CONST.ERROR_MESSAGES.INVALID_SORT_COLUMNS);
			}
			if(sortOrder === undefined){
				sortOrder = luga.data.sort.ORDER.TOG;
			}
			if(luga.data.sort.isValidSortOrder(sortOrder) === false){
				throw(luga.string.format(CONST.ERROR_MESSAGES.INVALID_SORT_ORDER, [sortOrder]));
			}

			var sortColumns = assembleSortColumns(columnNames);

			if(sortOrder === luga.data.sort.ORDER.TOG){
				sortOrder = defineToggleSortOrder(sortColumns);
			}

			/** @type {luga.data.DataSet.dataSorted} */
			var notificationData = {
				dataSet: this,
				oldSortColumns: this.lastSortColumns,
				oldSortOrder: this.lastSortOrder,
				newSortColumns: sortColumns,
				newSortOrder: sortOrder
			};

			this.notifyObservers(luga.data.CONST.EVENTS.PRE_DATA_SORTED, notificationData);

			var sortColumnName = sortColumns[sortColumns.length - 1];
			var sortColumnType = this.getColumnType(sortColumnName);
			var sortFunction = luga.data.sort.getSortStrategy(sortColumnType, sortOrder);

			for(var i = sortColumns.length - 2; i >= 0; i--){
				var columnToSortName = sortColumns[i];
				var columnToSortType = this.getColumnType(columnToSortName);
				var sortStrategy = luga.data.sort.getSortStrategy(columnToSortType, sortOrder);
				sortFunction = buildSecondarySortFunction(sortStrategy(columnToSortName), sortFunction);
			}

			this.records.sort(sortFunction);
			applyFilter();
			this.resetCurrentRowToFirst();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_SORTED, notificationData);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});

			// Keep track of sorting criteria
			this.lastSortColumns = sortColumns.slice(0); // Copy the array.
			this.lastSortOrder = sortOrder;

		};

		var buildSecondarySortFunction = function(funcA, funcB){
			return function(a, b){
				var ret = funcA(a, b);
				if(ret === 0){
					ret = funcB(a, b);
				}
				return ret;
			};
		};

		var assembleSortColumns = function(columnNames){
			// If only one column name was specified for sorting
			// Do a secondary sort on PK so we get a stable sort order
			if(jQuery.isArray(columnNames) === false){
				return [columnNames, luga.data.CONST.PK_KEY];
			}
			else if(columnNames.length < 2 && columnNames[0] !== luga.data.CONST.PK_KEY){
				columnNames.push(luga.data.CONST.PK_KEY);
				return columnNames;
			}
			return columnNames;
		};

		var defineToggleSortOrder = function(sortColumns){
			if((self.lastSortColumns.length > 0) && (self.lastSortColumns[0] === sortColumns[0]) && (self.lastSortOrder === luga.data.sort.ORDER.ASC)){
				return luga.data.sort.ORDER.DESC;
			}
			else{
				return luga.data.sort.ORDER.ASC;
			}
		};

		/**
		 * Updates rows inside the dataSet
		 * @param {function} filter.  Filter function to be used as search criteria. Required
		 *                            The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
		 * @param {function} updater. Updater function. Required
		 *                            The function is going to be called with this signature: myUpdater(row, rowIndex, dataSet)
		 * @fires stateChanged
		 * @fires dataChanged
		 * @throws
		 */
		this.update = function(filter, updater){
			/** @type {array.<luga.data.DataSet.row>} */
			var filteredRecords = luga.data.utils.filter(this.records, filter, this);
			luga.data.utils.update(filteredRecords, updater, this);
			this.resetCurrentRow();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/* Constructor */

		if(options.filter !== undefined){
			this.setFilter(options.filter);
		}
		if(options.records !== undefined){
			this.insert(options.records);
		}

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DetailSet.context
	 * @extends luga.data.stateDescription
	 *
	 * @property {null|luga.data.DataSet.row} entity
	 */

	/**
	 * @typedef {object} luga.data.DetailSet.options
	 *
	 * @property {string}            uuid     Unique identifier. Required
	 * @property {luga.data.DataSet} dataSet  Master dataSet. Required
	 */

	/**
	 * DetailSet class
	 * Register itself as observer of the passed dataSet and act as the details in a master/details scenario
	 *
	 * @param {luga.data.DetailSet.options} options
	 * @constructor
	 * @extends luga.Notifier
	 * @fires dataChanged
	 * @listens dataChanged
	 * @listens currentRowChanged
	 */
	luga.data.DetailSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				INVALID_UUID_PARAMETER: "Luga.DetailSet: id parameter is required",
				INVALID_DS_PARAMETER: "Luga.DetailSet: dataSet parameter is required"
			}
		};

		if(options.uuid === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_UUID_PARAMETER);
		}
		if(options.dataSet === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_DS_PARAMETER);
		}

		luga.extend(luga.Notifier, this);

		/** @type {luga.data.DetailSet} */
		var self = this;

		this.uuid = options.uuid;
		this.dataSet = options.dataSet;
		this.dataSet.addObserver(this);

		/** @type {luga.data.DataSet.row} */
		this.row = null;

		luga.data.setDataSource(this.uuid, this);

		/**
		 * @returns {luga.data.DetailSet.context}
		 */
		this.getContext = function(){
			var context = {
				entity: self.row
			};
			var stateDesc = luga.data.utils.assembleStateDescription(self.getState());
			luga.merge(context, stateDesc);
			return context;
		};

		/**
		 * Returns the detailSet's current state
		 * @returns {null|luga.data.STATE}
		 */
		this.getState = function(){
			return self.dataSet.getState();
		};

		this.fetchRow = function(){
			self.row = self.dataSet.getCurrentRow();
			self.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.fetchRow();
		};

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			self.fetchRow();
		};

		/**
		 * @param {luga.data.DataSet.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.fetchRow();
		};

		/* Fetch row without notifying observers */
		self.row = self.dataSet.getCurrentRow();

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DataSet.dataLoading
	 *
	 * @property {luga.data.DataSet} dataSet
	 */

	/**
	 * @typedef {object} luga.data.HttpDataSet.xhrError
	 *
	 * @property {string} message
	 * @property {object} jqXHR        jQuery wrapper around XMLHttpRequest
	 * @property {string} textStatus
	 * @property {string} errorThrown
	 */

	/**
	 * @typedef {object} luga.data.HttpDataSet.options
	 *
	 * @extends luga.data.DataSet.options
	 * @property {string}    url       URL to be fetched. Default to null
	 * @property {number}    timeout   Timeout (in milliseconds) for the HTTP request. Default to 10 seconds
	 * @property {boolean}   cache     If set to false, it will force requested pages not to be cached by the browser.
	 *                                 It works by appending "_={timestamp}" to the querystring. Default to true
	 */

	/**
	 * Base HttpDataSet class
	 * @param luga.data.HttpDataSet.options
	 * @constructor
	 * @extends luga.data.DataSet
	 * @abstract
	 * @fires dataLoading
	 * @fires xhrError
	 * @throws
	 */
	luga.data.HttpDataSet = function(options){
		luga.extend(luga.data.DataSet, this, [options]);
		/** @type {luga.data.HttpDataSet} */
		var self = this;

		var CONST = {
			ERROR_MESSAGES: {
				HTTP_DATA_SET_ABSTRACT: "luga.data.HttpDataSet is an abstract class",
				XHR_FAILURE: "Failed to retrieve: {0}. HTTP status: {1}. Error: {2}",
				NEED_URL_TO_LOAD: "Unable to call loadData(). DataSet is missing a URL"
			}
		};

		if(this.constructor === luga.data.HttpDataSet){
			throw(CONST.ERROR_MESSAGES.HTTP_DATA_SET_ABSTRACT);
		}

		this.url = null;
		if(options.url !== undefined){
			this.url = options.url;
		}

		this.timeout = luga.data.CONST.XHR_TIMEOUT;
		if(options.timeout !== undefined){
			this.timeout = options.timeout;
		}

		this.cache = true;
		if(options.cache !== undefined){
			this.cache = options.cache;
		}
		// Concrete implementations can override this
		this.dataType = null;
		this.xhrRequest = null;

		/* Private methods */

		var loadUrl = function(){
			var xhrOptions = {
				url: self.url,
				success: function(response, textStatus, jqXHR){
					self.delete();
					self.loadRecords(response, textStatus, jqXHR);
				},
				timeout: self.timeout,
				cache: self.cache,
				headers: {
					"X-Requested-With": luga.data.CONST.USER_AGENT
				},
				error: self.xhrError
			};
			if(self.dataType !== null){
				xhrOptions.dataType = self.dataType;
			}
			self.xhrRequest = jQuery.ajax(xhrOptions);
		};

		/* Public methods */

		/**
		 * Abort any pending XHR request
		 */
		this.cancelRequest = function(){
			if(this.xhrRequest !== null){
				this.xhrRequest.abort();
				this.xhrRequest = null;
			}
		};

		/**
		 * Returns the URL that will be used to fetch the data. Returns null if URL is not set
		 * @returns {string|null}
		 */
		this.getUrl = function(){
			return this.url;
		};

		/**
		 * Fires off XHR request to fetch and load the data, notify observers ("dataLoading" first, "dataChanged" after records are loaded).
		 * Throws an exception if URL is not set
		 * @fires dataLoading
		 * @throws
		 */
		this.loadData = function(){
			if(this.url === null){
				throw(CONST.ERROR_MESSAGES.NEED_URL_TO_LOAD);
			}
			this.setState(luga.data.STATE.LOADING);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_LOADING, {dataSet: this});
			this.cancelRequest();
			loadUrl();
		};

		/**
		 * Abstract method, concrete classes must implement it to extract records from XHR response
		 * @param {*}        response     Data returned from the server
		 * @param {string}   textStatus   HTTP status
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @abstract
		 */
		this.loadRecords = function(response, textStatus, jqXHR){
		};

		/**
		 * Set the URL that will be used to fetch the data.
		 * This method does not load the data into the data set, it merely sets the internal URL.
		 * The developer must call loadData() to actually trigger the data loading
		 * @param {string} newUrl
		 */
		this.setUrl = function(newUrl){
			this.url = newUrl;
		};

		/**
		 * Is called whenever an XHR request fails, set state to error, notify observers ("xhrError")
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @param {string}   textStatus   HTTP status
		 * @param {string}   errorThrown  Error message from jQuery
		 * @fires xhrError
		 */
		this.xhrError = function(jqXHR, textStatus, errorThrown){
			self.setState(luga.data.STATE.ERROR);
			self.notifyObservers(luga.data.CONST.EVENTS.XHR_ERROR, {
				dataSet: self,
				message: luga.string.format(CONST.ERROR_MESSAGES.XHR_FAILURE, [self.url, jqXHR.status, errorThrown]),
				jqXHR: jqXHR,
				textStatus: textStatus,
				errorThrown: errorThrown
			});
		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.JsonDataSet.options
	 *
	 * @extends luga.data.HttpDataSet.options
	 * @property {string|null}   path      Specifies the path to the data within the JSON structure.
	 *                                     The path is expressed as a set of property names on the objects, separated by dots. Default to null
	 */

	/**
	 * JSON dataSet class
	 * @param {luga.data.JsonDataSet.options} options
	 * @constructor
	 * @extends luga.data.HttpDataSet
	 */
	luga.data.JsonDataSet = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.JsonDataSet} */
		var self = this;
		/** @override */
		this.dataType = "json";

		this.path = null;
		if(options.path !== undefined){
			this.path = options.path;
		}

		/** @type {null|json} */
		this.rawJson = null;

		/* Public methods */

		/**
		 * Returns the raw JSON data structure
		 * @returns {null|json}
		 */
		this.getRawJson = function(){
			return this.rawJson;
		};

		/**
		 * Returns the path to be used to extract data out of the JSON data structure
		 * @returns {null|string}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * First delete any existing records, then load data from the given JSON, without XHR calls
		 * @param {json} json
		 */
		this.loadRawJson = function(json){
			self.delete();
			self.loadRecords(json);
		};

		/**
		 * Retrieves JSON data, either from an HTTP response or from a direct call, apply the path, if any, extract and load records out of it
		 * @param {json}     json         JSON data. Either returned from the server or passed directly
		 * @param {string}   textStatus   HTTP status. Automatically passed by jQuery for XHR calls
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest. Automatically passed by jQuery for XHR calls
		 * @override
		 */
		this.loadRecords = function(json, textStatus, jqXHR){
			self.rawJson = json;
			if(self.path === null){
				self.insert(json);
			}
			else{
				var records = luga.lookupProperty(json, self.path);
				if(records !== undefined){
					self.insert(records);
				}
			}
		};

		/**
		 * Set the path to be used to extract data out of the JSON data structure
		 * @param {string} path   Data path, expressed as a set of property names on the objects, separated by dots. Required
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.RemoteJsonDataSet.options
	 *
	 * @extends luga.data.JsonDataSet.options
	 * @property {luga.data.JsonDataSet}   dataSet
	 * @property {string}                  urlPattern
	 *
	 */

	/**
	 * Binded JSON dataSet class
	 * @param {luga.data.RemoteJsonDataSet.options} options
	 * @constructor
	 * @extends luga.data.JsonDataSet
	 */
	luga.data.RemoteJsonDataSet = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				MISSING_MASTER_DS: "luga.data.RemoteJsonDataSet: dataSet parameter is required",
				MISSING_URL_PATTERN: "luga.data.RemoteJsonDataSet: urlPattern parameter is required"
			}
		};

		if(options.dataSet === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_MASTER_DS);
		}

		if(options.urlPattern === undefined){
			throw(CONST.ERROR_MESSAGES.MISSING_URL_PATTERN);
		}

		luga.extend(luga.data.JsonDataSet, this, [options]);

		/** @type {luga.data.RemoteJsonDataSet} */
		var self = this;

		/** @type {luga.data.JsonDataSet} */
		this.dataSet = options.dataSet;
		this.dataSet.addObserver(this);
		this.urlPattern = options.urlPattern;

		/**
		 * @param {luga.data.DataSet.row} row
		 */
		this.fetchData = function(row){
			var bindUrl = luga.string.replaceProperty(self.urlPattern, row);
			self.setUrl(bindUrl);
			self.loadData();
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.DataSet.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			if(data.currentRow !== null){
				self.fetchData(data.currentRow);
			}
			else{
				self.delete();
			}

		};

	};

}());
(function(){
	"use strict";

	luga.namespace("luga.data.region");

	luga.data.region.CONST = {
		CUSTOM_ATTRIBUTES: {
			DATA_SOURCE_UUID: "data-lugaregion-datasource-uuid",
			REGION: "data-lugaregion",
			REGION_TYPE: "data-lugaregion-type",
			TEMPLATE_ID: "data-lugaregion-template-id",
			TRAITS: "data-lugaregion-traits",
			REGION_REFERENCE: "luga-region-reference"
		},
		DEFAULT_REGION_TYPE: "luga.data.region.Handlebars",
		DEFAULT_TRAITS: [
			"luga.data.region.traits.select",
			"luga.data.region.traits.setRowId",
			"luga.data.region.traits.setRowIndex",
			"luga.data.region.traits.sort"
		],
		ERROR_MESSAGES: {
			MISSING_DATA_SOURCE_ATTRIBUTE: "Missing required data-lugaregion-datasource-uuid attribute inside region",
			MISSING_DATA_SOURCE: "Unable to find datasource {0}",
			MISSING_REGION_TYPE_FUNCTION: "Failed to create region. Unable to find a constructor function named: {0}"
		},
		EVENTS: {
			REGION_RENDERED: "regionRendered"
		},
		SELECTORS: {
			REGION: "*[data-lugaregion='true']"
		}
	};

	/**
	 * Given a jQuery object wrapping an HTML node, returns the region object associated to it
	 * Returns undefined if the node is not associated to a region
	 * @param {jquery} node
	 * @returns {undefined|luga.data.region.Base}
	 */
	luga.data.region.getReferenceFromNode = function(node){
		return node.data(luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_REFERENCE);
	};

	/**
	 * Given a jQuery object wrapping an HTML node, initialize the relevant Region handler
	 * @param {jquery} node
	 * @throws
	 */
	luga.data.region.init = function(node){
		var dataSourceId = node.attr(luga.data.region.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE_UUID);
		if(dataSourceId === undefined){
			throw(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE_ATTRIBUTE);
		}
		var dataSource = luga.data.getDataSource(dataSourceId);
		if(dataSource === null){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [dataSourceId]));
		}
		var regionType = node.attr(luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_TYPE);
		if(regionType === undefined){
			regionType = luga.data.region.CONST.DEFAULT_REGION_TYPE;
		}
		var RegionClass = luga.lookupFunction(regionType);
		if(RegionClass === undefined){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_REGION_TYPE_FUNCTION, [regionType]));
		}
		new RegionClass({node: node});
	};

	luga.namespace("luga.data.region.utils");

	/**
	 * @typedef {object} luga.data.region.description
	 *
	 * @property {jquery}                                node   A jQuery object wrapping the node containing the region.
	 * @property {luga.data.DataSet|luga.data.DetailSet} ds     DataSource
	 */

	/**
	 * Given a region instance, returns an object containing its critical data
	 * @param {luga.data.region.Base} region
	 * @returns {luga.data.region.description}
	 */
	luga.data.region.utils.assembleRegionDescription = function(region){
		return {
			node: region.config.node,
			ds: region.dataSource
		};
	};

	jQuery(document).ready(function(){
		jQuery(luga.data.region.CONST.SELECTORS.REGION).each(function(index, item){
			luga.data.region.init(jQuery(item));
		});
	});

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.region.options
	 *
	 * @property {jquery} node                                Either a jQuery object wrapping the node or the naked DOM object that will contain the region. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet} ds   DataSource. Required if dsUuid is not specified
	 * @property {string} dsUuid                              DataSource's uuid. Can be specified inside the data-lugaregion-datasource attribute too. Required if ds is not specified
	 * @property {array.<string>} traits                      An array of function names that will be called every time the Region is rendered. Optional
	 * @property {string} templateId                          Id of HTML element containing the template. Can be specified inside the data-lugaregion-template attribute too.
	 *                                                        If not available it assumes the node contains the template
	 */

	/**
	 * Abstract Region class
	 * Concrete implementations must extend this and implement the .render() method
	 * @param {luga.data.Region.options} options
	 * @constructor
	 * @abstract
	 * @fires regionRendered
	 * @listens dataChanged
	 * @listens stateChanged
	 * @throws
	 */
	luga.data.region.Base = function(options){

		luga.extend(luga.Notifier, this);

		this.CONST = {
			ERROR_MESSAGES: {
				INVALID_TRAIT: "luga.data.region invalid trait: {0} is not a function",
				MISSING_NODE: "luga.data.region was unable find the region node"
			}
		};

		// Ensure it's a jQuery object
		options.node = jQuery(options.node);
		if(options.node.length === 0){
			throw(this.CONST.ERROR_MESSAGES.MISSING_NODE);
		}

		this.config = {
			node: null, // Required
			// Either: custom attribute or incoming option
			dsUuid: options.node.attr(luga.data.region.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE_UUID) || null,
			templateId: options.node.attr(luga.data.region.CONST.CUSTOM_ATTRIBUTES.TEMPLATE_ID) || null,
			// Either: incoming option or null
			traits: options.traits || null,
			ds: null
		};
		luga.merge(this.config, options);
		var self = this;

		/** @type {luga.data.DataSet|luga.data.DetailSet} */
		this.dataSource = null;
		if(this.config.ds !== null){
			// We've got a direct reference from the options
			this.dataSource = this.config.ds;
		}
		else{
			// We've got a dataSource Id
			this.dataSource = luga.data.getDataSource(this.config.dsUuid);
		}
		if(this.dataSource === null){
			throw(luga.string.format(luga.data.region.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [this.config.dsId]));
		}
		this.dataSource.addObserver(this);

		/** @type {array.<string>} */
		this.traits = luga.data.region.CONST.DEFAULT_TRAITS;
		// Extract traits from custom attribute, if any
		var attrTraits = this.config.node.attr(luga.data.region.CONST.CUSTOM_ATTRIBUTES.TRAITS);
		if(attrTraits !== undefined){
			this.traits = this.traits.concat(attrTraits.split(","));
		}
		if(this.config.traits !== null){
			this.traits = this.traits.concat(this.config.traits);
		}

		// Store reference inside node
		this.config.node.data(luga.data.region.CONST.CUSTOM_ATTRIBUTES.REGION_REFERENCE, this);

		this.applyTraits = function(){
			var traitData = {
				node: this.config.node,
				dataSource: this.dataSource
			};
			for(var i = 0; i < this.traits.length; i++){
				var func = luga.lookupFunction(this.traits[i]);
				if(func !== undefined){
					func(traitData);
				}
				else{
					throw(luga.string.format(this.CONST.ERROR_MESSAGES.INVALID_TRAIT, [this.traits[i]]));
				}
			}
		};

		/**
		 * @abstract
		 * @fires regionRendered
		 */
		this.render = function(){
			// Concrete implementations must overwrite this
			var desc = luga.data.region.utils.assembleRegionDescription(this);
			this.notifyObservers(luga.data.region.CONST.EVENTS.REGION_RENDERED, desc);
		};

		/* Events Handlers */

		/**
		 * @param {luga.data.currentRowChanged} data
		 */
		this.onCurrentRowChangedHandler = function(data){
			self.applyTraits();
		};

		/**
		 * @param {luga.data.dataSourceChanged} data
		 */
		this.onDataChangedHandler = function(data){
			self.render();
		};

		/**
		 * @param {luga.data.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.render();
		};

	};

}());
(function(){
	"use strict";

	/**
	 * Handlebars Region class
	 * @param {luga.data.Region.options} options
	 * @constructor
	 * @extends luga.data.region.Base
	 * @fires regionRendered
	 * @throws
	 */
	luga.data.region.Handlebars = function(options){

		luga.extend(luga.data.region.Base, this, [options]);
		var self = this;

		// The messages below are specific to this implementation
		self.CONST.HANDLEBARS_ERROR_MESSAGES = {
			MISSING_HANDLEBARS: "Unable to find Handlebars",
			MISSING_TEMPLATE_FILE: "luga.data.region.Handlebars was unable to retrieve file: {0} containing an Handlebars template",
			MISSING_TEMPLATE_NODE: "luga.data.region.Handlebars was unable find an HTML element with id: {0} containing an Handlebars template"
		};

		this.template = "";

		/**
		 * @param {jquery} node
		 * @returns {string}
		 */
		var fetchTemplate = function(node){
			// Inline template
			if(self.config.templateId === null){
				self.template = Handlebars.compile(node.html());
			}
			else{
				var templateNode = jQuery("#" + self.config.templateId);
				if(templateNode.length !== 1){
					throw(luga.string.format(self.CONST.HANDLEBARS_ERROR_MESSAGES.MISSING_TEMPLATE_NODE, [self.config.templateId]));
				}
				var templateSrc = templateNode.attr("src");
				if(templateSrc === undefined){
					// Embed template
					self.template = Handlebars.compile(templateNode.html());
				}
				else{
					// External template
					var xhrOptions = {
						url: templateSrc,
						dataType: "text",
						headers: {
							"X-Requested-With": luga.data.CONST.USER_AGENT
						},
						success: function(response, textStatus, jqXHR){
							self.template = Handlebars.compile(response);
							self.render();
						},
						error: function(jqXHR, textStatus, errorThrown){
							throw(luga.string.format(self.CONST.HANDLEBARS_ERROR_MESSAGES.MISSING_TEMPLATE_FILE, [templateSrc]));
						}
					};
					jQuery.ajax(xhrOptions);
				}
			}
		};

		/**
		 * @returns {string}
		 */
		this.generateHtml = function(){
			return this.template(this.dataSource.getContext());
		};

		/*
		 @override
		 @fires regionRendered
		 */
		this.render = function(){
			if(this.template !== ""){
				this.config.node.html(this.generateHtml());
				this.applyTraits();
				var desc = luga.data.region.utils.assembleRegionDescription(this);
				this.notifyObservers(luga.data.region.CONST.EVENTS.REGION_RENDERED, desc);
			}
		};

		/* Constructor */
		fetchTemplate(this.config.node);

	};

}());
(function(){
	"use strict";

	luga.namespace("luga.data.region.traits");

	/**
	 * @typedef {object} luga.data.region.traits.options
	 *
	 * @property {jquery}                                 node          A jQuery object wrapping the Region's node. Required
	 * @property {luga.data.DataSet|luga.data.DetailSet}  dataSource    DataSource. Required
	 */

	var CONST = {
		CUSTOM_ATTRIBUTES: {
			SELECT: "data-lugaregion-select",
			SET_ROW_ID: "data-lugaregion-setrowid",
			SET_ROW_INDEX: "data-lugaregion-setrowindex",
			SORT: "data-lugaregion-sort"
		},
		SELECTORS: {
			SELECT: "*[data-lugaregion-select]",
			SET_ROW_ID: "*[data-lugaregion-setrowid]",
			SET_ROW_INDEX: "*[data-lugaregion-setrowindex]",
			SORT: "*[data-lugaregion-sort]"
		}
	};

	/**
	 * Handles data-lugaregion-select
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.select = function(options){
		var nodes = options.node.find(CONST.SELECTORS.SELECT);
		if(nodes.length > 0){
			if(options.dataSource.getCurrentRowIndex === undefined){
				// It's a detailSet, abort
				return;
			}
			var cssClass = nodes.attr(CONST.CUSTOM_ATTRIBUTES.SELECT);
			// Clean-up
			nodes.removeClass(cssClass);
			// Default to zero
			var index = 0;
			if(options.dataSource.getCurrentRowIndex() !== -1){
				index = options.dataSource.getCurrentRowIndex();
			}
			// Apply CSS
			jQuery(nodes.get(index)).addClass(cssClass);

			// Attach click event
			nodes.each(function(index, item){
				var jItem = jQuery(item);
				jItem.click(function(event){
					event.preventDefault();
					nodes.removeClass(cssClass);
					jItem.addClass(cssClass);
				});
			});
		}
	};

	/**
	 * Handles data-lugaregion-setrowid
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowId = function(options){
		options.node.find(CONST.SELECTORS.SET_ROW_ID).each(function(index, item){
			var jItem = jQuery(item);
			jItem.click(function(event){
				event.preventDefault();
				var rowId = jItem.attr(CONST.CUSTOM_ATTRIBUTES.SET_ROW_ID);
				options.dataSource.setCurrentRowId(rowId);
			});
		});
	};

	/**
	 * Handles data-lugaregion-setrowindex
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.setRowIndex = function(options){
		options.node.find(CONST.SELECTORS.SET_ROW_INDEX).each(function(index, item){
			var jItem = jQuery(item);
			jItem.click(function(event){
				event.preventDefault();
				var rowIndex = parseInt(jItem.attr(CONST.CUSTOM_ATTRIBUTES.SET_ROW_INDEX), 10);
				options.dataSource.setCurrentRowIndex(rowIndex);
			});
		});
	};

	/**
	 * Handles data-lugaregion-sort
	 * @param {luga.data.region.traits.options} options
	 */
	luga.data.region.traits.sort = function(options){
		options.node.find(CONST.SELECTORS.SORT).each(function(index, item){
			var jItem = jQuery(item);
			jItem.click(function(event){
				event.preventDefault();
				var sortCol = jItem.attr(CONST.CUSTOM_ATTRIBUTES.SORT);
				options.dataSource.sort(sortCol);
			});
		});
	};

}());
(function(){
	"use strict";

	luga.namespace("luga.data.sort");

	/**
	 * @typedef {string} luga.data.sort.ORDER
	 * @enum {string}
	 */
	luga.data.sort.ORDER = {
		ASC: "ascending",
		DESC: "descending",
		TOG: "toggle"
	};

	var CONST = {
		ERROR_MESSAGES: {
			UNSUPPORTED_DATA_TYPE: "luga.data.sort. Unsupported dataType: {0",
			UNSUPPORTED_SORT_ORDER: "luga.data.sort. Unsupported sortOrder: {0}"
		}
	};

	/**
	 * Return true if the passed order is supported
	 * @param {string}  sortOrder
	 * @returns {boolean}
	 */
	luga.data.sort.isValidSortOrder = function(sortOrder){
		for(var key in luga.data.sort.ORDER){
			if(luga.data.sort.ORDER[key] === sortOrder){
				return true;
			}
		}
		return false;
	};

	/**
	 * Retrieve the relevant sort function matching the given combination of dataType and sortOrder
	 * @param {string}               dataType
	 * @param {luga.data.sort.ORDER} sortOrder
	 * @returns {function}
	 */
	luga.data.sort.getSortStrategy = function(dataType, sortOrder){
		if(luga.data.sort[dataType] === undefined){
			throw(luga.string.format(CONST.ERROR_MESSAGES.UNSUPPORTED_DATA_TYPE, [dataType]));
		}
		if(luga.data.sort[dataType][sortOrder] === undefined){
			throw(luga.string.format(CONST.ERROR_MESSAGES.UNSUPPORTED_SORT_ORDER, [sortOrder]));
		}
		return luga.data.sort[dataType][sortOrder];
	};

	/*
	 Lovingly adapted from Spry
	 Very special thanks to Kin Blas https://github.com/jblas
	 */

	luga.namespace("luga.data.sort.date");

	luga.data.sort.date.ascending = function(prop){
		return function(a, b){
			var dA = luga.lookupProperty(a, prop);
			var dB = luga.lookupProperty(b, prop);
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dA - dB;
		};
	};

	luga.data.sort.date.descending = function(prop){
		return function(a, b){
			var dA = luga.lookupProperty(a, prop);
			var dB = luga.lookupProperty(b, prop);
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dB - dA;
		};
	};

	luga.namespace("luga.data.sort.number");

	luga.data.sort.number.ascending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? 1 : -1);
			}
			return a - b;
		};
	};

	luga.data.sort.number.descending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? -1 : 1);
			}
			return b - a;
		};
	};

	luga.namespace("luga.data.sort.string");

	luga.data.sort.string.ascending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? 1 : -1);
			}
			var tA = a.toString();
			var tB = b.toString();
			var tAlower = tA.toLowerCase();
			var tBlower = tB.toLowerCase();
			var minLen = tA.length > tB.length ? tB.length : tA.length;

			for(var i = 0; i < minLen; i++){
				var aLowerChar = tAlower.charAt(i);
				var bLowerChar = tBlower.charAt(i);
				var aChar = tA.charAt(i);
				var bChar = tB.charAt(i);
				if(aLowerChar > bLowerChar){
					return 1;
				}
				else if(aLowerChar < bLowerChar){
					return -1;
				}
				else if(aChar > bChar){
					return 1;
				}
				else if(aChar < bChar){
					return -1;
				}
			}
			if(tA.length === tB.length){
				return 0;
			}
			else if(tA.length > tB.length){
				return 1;
			}
			return -1;
		};
	};

	luga.data.sort.string.descending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? -1 : 1);
			}
			var tA = a.toString();
			var tB = b.toString();
			var tAlower = tA.toLowerCase();
			var tBlower = tB.toLowerCase();
			var minLen = tA.length > tB.length ? tB.length : tA.length;
			for(var i = 0; i < minLen; i++){
				var aLowerChar = tAlower.charAt(i);
				var bLowerChar = tBlower.charAt(i);
				var aChar = tA.charAt(i);
				var bChar = tB.charAt(i);
				if(aLowerChar > bLowerChar){
					return -1;
				}
				else if(aLowerChar < bLowerChar){
					return 1;
				}
				else if(aChar > bChar){
					return -1;
				}
				else if(aChar < bChar){
					return 1;
				}
			}
			if(tA.length === tB.length){
				return 0;
			}
			else if(tA.length > tB.length){
				return -1;
			}
			return 1;
		};
	};

}());