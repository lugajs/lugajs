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
				self.filteredRecords = filterRecords(self.records, self.filter);
				self.resetCurrentRow();
			}
		};

		var applyFormatter = function(){
			if(hasFormatter() === true){
				self.records = filterRecords(self.records, self.formatter);
			}
		};

		var filterRecords = function(orig, filter){
			var filtered = [];
			for(var i = 0; i < orig.length; i++){
				var newRow = filter(orig[i], i, this);
				if(newRow){
					filtered.push(newRow);
				}
			}
			return filtered;
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
				this.records = filterRecords(selectAll(), filter);
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
			var row = this.recordsHash[this.getCurrentRowId()];
			if(row !== undefined){
				return row;
			}
			return null;
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
			return -1;
		};

		/**
		 * Returns the number of records in the dataSet
		 * If the dataSet has a filter, returns the number of filtered records
		 * @returns {number}
		 */
		this.getRecordsCount = function(){
			var allRecords = selectAll();
			if(allRecords === null){
				return 0;
			}
			return selectAll().length;
		};

		/**
		 * Returns the row object associated with the given unique identifier
		 * @param {string} rowId  Required
		 * @returns {null|luga.data.DataSet.row}
		 */
		this.getRowById = function(rowId){
			if(this.recordsHash[rowId] !== undefined){
				return this.recordsHash[rowId];
			}
			return null;
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
			this.setCurrentRowId(this.records[0][luga.data.CONST.PK_KEY]);
			applyFormatter();
			applyFilter();
			this.setState(luga.data.STATE.READY);
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Reset the currentRowId
		 * @fires currentRowChanged
		 */
		this.resetCurrentRow = function(){
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
			return;
		};

		/**
		 * Returns an array of the internal row objects that store the records in the dataSet
		 * Be aware that modifying any property of a returned object results in a modification of the internal records (since records are passed by reference)
		 * @param {function|null} filter   An optional filter function. If specified only records matching the filter will be returned. Default to null
		 *                                 The function is going to be called with this signature: myFilter(row, rowIndex, dataSet)
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
			return filterRecords(selectAll(), filter);
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
		 * @param {number} index
		 * @throws
		 */
		this.setCurrentRowIndex = function(index){
			this.setCurrentRow(this.getRowByIndex(index));
		};

		/**
		 * Replace current filter with a new filter functions and apply the new filter
		 * Triggers a "dataChanged" notification
		 * @param {function} filter   A filter functions to be called once for each row in the data set. Required
		 *                            The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
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
			this.resetCurrentRow();
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
			if(columnNames.length < 2 && columnNames[0] !== luga.data.CONST.PK_KEY){
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

		/* Constructor */

		if(options.filter !== undefined){
			this.setFilter(options.filter);
		}
		if(options.records !== undefined){
			this.insert(options.records);
		}

	};

}());