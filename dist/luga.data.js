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
	luga.namespace("luga.data.region");

	luga.data.version = "0.2.1";
	/** @type {hash.<luga.data.DataSet>} */
	luga.data.dataSourceRegistry = {};

	luga.data.CONST = {
		PK_KEY: "rowId",
		COL_TYPES: ["date", "number", "string"],
		DEFAULT_REGION_TYPE: "luga.data.region.Handlebars",
		CUSTOM_ATTRIBUTES: {
			REGION: "data-lugads-region",
			REGION_TYPE: "data-lugads-regiontype",
			TEMPLATE: "data-lugads-template",
			DATA_SOURCE: "data-lugads-datasource"
		},
		EVENTS: {
			CURRENT_ROW_CHANGED: "currentRowChanged",
			DATA_CHANGED: "dataChanged",
			DATA_SORTED: "dataSorted",
			PRE_DATA_SORTED: "preDataSorted",
			LOADING: "loading",
			XHR_ERROR: "xhrError"
		},
		SELECTORS: {
			REGION: "*[data-lugads-region]"
		},
		ERROR_MESSAGES: {
			MISSING_DATA_SOURCE_ATTRIBUTE: "Missing required data-lugads-datasource attribute inside region",
			MISSING_DATA_SOURCE: "Unable to find datasource {0}",
			MISSING_REGION_TYPE_FUNCTION: "Failed to create region. Unable to find a constructor function named: {0}"
		},
		XHR_TIMEOUT: 10000 // Keep this accessible to everybody
	};
	/**
	 * Returns a dataSource from the registry
	 * Returns null if no source matches the given id
	 * @param {string} id
	 * @returns {luga.data.DataSet|luga.data.DetailSet}
	 */
	luga.data.getDataSource = function(id){
		if(luga.data.dataSourceRegistry[id] !== undefined){
			return luga.data.dataSourceRegistry[id];
		}
		return null;
	};

	/**
	 * Adds a dataSource inside the registry
	 * @param {string}                                id
	 * @param {luga.data.DataSet|luga.data.DetailSet} dataSource
	 */
	luga.data.setDataSource = function(id, dataSource){
		luga.data.dataSourceRegistry[id] = dataSource;
	};

	/**
	 * Given a jQuery object wrapping an HTML node, initialize the relevant Region handler
	 * @param {jquery} node
	 * @throws
	 */
	luga.data.initRegion = function(node){
		var dataSourceId = node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE);
		if(dataSourceId === undefined){
			throw(luga.data.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE_ATTRIBUTE);
		}
		var dataSource = luga.data.getDataSource(dataSourceId);
		if(dataSource === null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [dataSourceId]));
		}
		var regionType = node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.REGION_TYPE);
		if(regionType === undefined){
			regionType = luga.data.CONST.DEFAULT_REGION_TYPE;
		}
		var RegionClass = luga.lookup(regionType);
		if(RegionClass === null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.MISSING_REGION_TYPE_FUNCTION, [regionType]));
		}
		new RegionClass({node: node});
	};

	jQuery(document).ready(function(){
		jQuery(luga.data.CONST.SELECTORS.REGION).each(function(index, item){
			luga.data.initRegion(jQuery(item));
		});
	});

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
	 * @typedef {object} luga.data.DataSet.options
	 *
	 * @property {string}              id         Unique identifier. Required
	 * @property {array.<object>|object} records  Records to be loaded, either one single object containing value/name pairs, or an array of name/value pairs
	 * @property {function|null}       filter     A filter functions to be called once for each row in the dataSet. Default to null
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
				INVALID_ID_PARAMETER: "Luga.DataSet: id parameter is required",
				INVALID_FILTER_PARAMETER: "Luga.DataSet: invalid filter. You must use a function as filter",
				INVALID_PRIMITIVE: "Luga.DataSet: records can be either an array of objects or a single object. Primitives are not accepted",
				INVALID_PRIMITIVE_ARRAY: "Luga.DataSet: records can be either an array of name/value pairs or a single object. Array of primitives are not accepted",
				INVALID_ROW_PARAMETER: "Luga.DataSet: invalid row parameter. No available record matches the given row",
				INVALID_ROW_ID_PARAMETER: "Luga.DataSet: invalid rowId parameter",
				INVALID_ROW_INDEX_PARAMETER: "Luga.DataSet: invalid parameter. Row index is out of range",
				INVALID_SORT_COLUMNS: "Luga.DataSet.sort(): Unable to sort dataSet. You must supply one or more column name",
				INVALID_SORT_ORDER: "Luga.DataSet.sort(): Unable to sort dataSet. Invalid sort order passed {0}"
			}
		};

		if(options.id === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_ID_PARAMETER);
		}
		if((options.filter !== undefined) && (jQuery.isFunction(options.filter) === false)){
			throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
		}
		luga.extend(luga.Notifier, this);

		/** @type {luga.data.DataSet} */
		var self = this;

		this.id = options.id;
		/** @type {array.<luga.data.DataSet.row>} */
		this.records = [];
		/** @type {hash.<luga.data.DataSet.row>} */
		this.recordsHash = {};
		/** @type {null|array.<luga.data.DataSet.row>} */
		this.filteredRecords = null;
		/** @type {null|function} */
		this.filter = null;
		this.currentRowId = null;

		this.columnTypes = {};
		this.lastSortColumns = [];
		this.lastSortOrder = "";

		luga.data.setDataSource(this.id, this);

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

		var hasFilter = function(){
			return (self.filter !== null);
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
		 * @param {function|null} filter   An optional filter function. If specified only records matching the filter will be returned. Default to null
		 *                                 The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
		 * @fires currentRowChanged
		 * @fires dataChanged
		 * @throws
		 */
		this.delete = function(filter){
			if(filter === undefined){
				deleteAll();
				this.resetCurrentRow();
				this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
				return;
			}
			if(jQuery.isFunction(filter) === false){
				throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			this.records = filterRecords(selectAll(), filter);
			applyFilter();
			this.resetCurrentRow();
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
		 * @returns {{context: array.<luga.data.DataSet.row>}}
		 */
		this.getContext = function(){
			return {context: self.select()};
		};

		/**
		 * Returns the current row object
		 * By default, the current row is the first row of the dataSet, but this can be changed by calling setCurrentRow() or setCurrentRowIndex().
		 * @return {luga.data.DataSet.row}
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
		 * The rowId is a column that contains a unique identifier for the row
		 * This identifier does not change if the rows of the data set are sorted
		 * @returns {number}
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
		 * @return {number}
		 */
		this.getRecordsCount = function(){
			return selectAll().length;
		};

		/**
		 * Returns the row object associated with the given unique identifier
		 * @param {string} rowId  Required
		 * @return {luga.data.DataSet.row}
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
		 * @return {luga.data.DataSet.row}
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
		 * Adds rows to a dataSet
		 * Be aware that the dataSet use passed data by reference
		 * That is, it uses those objects as its row object internally. It does not make a copy
		 * @param  {array.<object>|object} records   Records to be loaded, either one single object containing value/name pairs, or an array of name/value pairs. Required
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
				var recordID = this.records.length;
				recordsHolder[i][luga.data.CONST.PK_KEY] = recordID;
				this.recordsHash[this.records.length] = recordsHolder[i];
				this.records.push(recordsHolder[i]);
			}
			this.setCurrentRowId(0);
			applyFilter();
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Reset the currentRowId
		 * @fires currentRowChanged
		 */
		this.resetCurrentRow = function(){
			// We have a filter
			if(hasFilter() === true){
				if(this.filteredRecords.length > 0){
					// First among the filtered records
					this.setCurrentRowId(this.filteredRecords[0][luga.data.CONST.PK_KEY]);
				}
				else{
					this.setCurrentRowId(null);
				}
				return;
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
		 *                                 The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
		 * @return {array.<luga.data.DataSet.row>}
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
		 * Set a column type for a column. Required for proper sorting of numeric data.
		 * By default data is sorted alpha-numerically, if you want it sorted numerically, set the proper columnType
		 * @param {string|array<string>} columnNames
		 * @param {string}               columnType   Either "date", "number" or "string"
		 */
		this.setColumnType = function(columnNames, columnType){
			if(jQuery.isArray(columnNames) === false){
				columnNames = [columnNames];
			}
			for(var i = 0; i < columnNames.length; i++){
				var colName = columnNames[i];
				if(luga.data.CONST.COL_TYPES.indexOf(colName) === -1){
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
			this.setCurrentRowId(fetchedRowId);
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
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
		};

		/**
		 * Sort the data
		 * @param {string|array<string>}  columnNames Required, either a single column name or an array of names
		 * @param {luga.data.sort.ORDER}  sortOrder   Either "ascending", "descending" or "toggle". Optional, default to "toggle"
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
			if(luga.data.sort.isValidOrder(sortOrder) === false){
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
			var sortFunction = luga.data.sort[sortColumnType][sortOrder](sortColumnName);

			for(var i = sortColumns.length - 2; i >= 0; i--){
				var columnToSortName = sortColumns[i];
				var columnToSortType = this.getColumnType(columnToSortName);
				sortFunction = buildSecondarySortFunction(luga.data.sort[columnToSortType][sortOrder](columnToSortName), sortFunction);
			}

			this.records.sort(sortFunction);
			applyFilter();

			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
			this.resetCurrentRow();
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_SORTED, notificationData);

			// Keep state
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
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DetailSet.options
	 *
	 * @property {string}            id       Unique identifier. Required
	 * @property {luga.data.DataSet} dataSet  Master dataSet
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
				INVALID_ID_PARAMETER: "Luga.DetailSet: id parameter is required",
				INVALID_DS_PARAMETER: "Luga.DetailSet: dataSet parameter is required"
			}
		};

		if(options.id === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_ID_PARAMETER);
		}
		if(options.dataSet === undefined){
			throw(CONST.ERROR_MESSAGES.INVALID_DS_PARAMETER);
		}

		luga.extend(luga.Notifier, this);

		/** @type {luga.data.DetailSet} */
		var self = this;

		this.id = options.id;
		this.dataSet = options.dataSet;
		this.dataSet.addObserver(this);

		/** @type {luga.data.DataSet.row} */
		this.row = null;

		luga.data.setDataSource(this.id, this);

		/**
		 * @returns {luga.data.DataSet.row}
		 */
		this.getContext = function(){
			return this.row;
		};

		this.fetchRow = function(){
			self.row = self.dataSet.getCurrentRow();
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, {dataSource: this});
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

		/* Fetch row without notifying observers */
		self.row = self.dataSet.getCurrentRow();

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DataSet.loading
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
	 * @property {string|null}   url       URL to be fetched. Default to null
	 * @property {number}        timeout   Timeout (in milliseconds) for the HTTP request. Default to 10 seconds
	 * @property {boolean}       cache     If set to false, it will force requested pages not to be cached by the browser.
	 *                                     It works by appending "_={timestamp}" to the querystring. Default to true
	 */

	/**
	 * Base HttpDataSet class
	 * @param luga.data.HttpDataSet.options
	 * @constructor
	 * @extends luga.data.DataSet
	 * @abstract
	 * @fires loading
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
				success: self.loadRecords,
				timeout: self.timeout,
				cache: self.cache,
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
		 * Fires off XHR request to fetch and load the data, notify observers ("loading" first, "dataChanged" after records are loaded).
		 * Does nothing if URL is not set
		 * @fires loading
		 * @throws
		 */
		this.loadData = function(){
			if(this.url === null){
				throw(CONST.ERROR_MESSAGES.NEED_URL_TO_LOAD);
			}
			this.notifyObservers(luga.data.CONST.EVENTS.LOADING, {dataSet: this});
			this.cancelRequest();
			this.delete();
			loadUrl();
		};

		/**
		 * Abstract method, child classes must implement it to extract records from XHR response
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
		 * Is called whenever an XHR request fails, notify observers ("xhrError")
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @param {string}   textStatus   HTTP status
		 * @param {string}   errorThrown  Error message from jQuery
		 * @fires xhrError
		 */
		this.xhrError = function(jqXHR, textStatus, errorThrown){
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
	 * @property {string|null}   path      Specifies the path to the data within the JSON structure. Default to null
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

		/* Public methods */

		/**
		 * Returns the path to be used to extract data out of the JSON data structure
		 * @returns {string|null}
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * Receives HTTP response, extracts and loads records out of it
		 * @param {*}        response     Data returned from the server
		 * @param {string}   textStatus   HTTP status
		 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
		 * @override
		 */
		this.loadRecords = function(response, textStatus, jqXHR){
			if(self.path === null){
				self.insert(response);
			}
			else{
				if(response[self.path] !== undefined){
					self.insert(response[self.path]);
				}
			}
		};

		/**
		 * Set the path to be used to extract data out of the JSON data structure
		 * @param {string} path
		 */
		this.setPath = function(path){
			this.path = path;
		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.region.options
	 *
	 * @property {jquery} node        Either a jQuery object wrapping the node or the naked DOM object that will contain the region. Required
	 * @property {string} dsId        DataSource's id. Can be specified inside the data-lugads-datasource too. Required
	 * @property {string} templateId  Id of HTML element containing the template. Can be specified inside the data-lugads-template too.
	 *                                If not available it assumes the node contains the template
	 */

	/**
	 * Data Region class
	 * @param {luga.data.Region.options} options
	 * @constructor
	 * @listens dataChanged
	 * @throws
	 */
	luga.data.region.Handlebars = function(options){

		var CONST = {
			ERROR_MESSAGES: {
				MISSING_HANDLEBARS: "Unable to find Handlebars",
				MISSING_NODE: "luga.data.region.Handlebars was unable find the region node",
				MISSING_TEMPLATE_NODE: "luga.data.region.Handlebars was unable find an HTML element with id: {0} containing an Handlebars template"
			}
		};

		if(typeof(Handlebars) === "undefined"){
			throw(CONST.ERROR_MESSAGES.MISSING_HANDLEBARS);
		}

		// Ensure it's a jQuery object
		options.node = jQuery(options.node);
		if(options.node.length === 0){
			throw(CONST.MESSAGES.MISSING_NODE);
		}

		this.config = {
			node: null, // Required
			// Either: custom attribute or incoming option
			dsId: options.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SOURCE) || null,
			templateId: options.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.TEMPLATE) || null
		};
		luga.merge(this.config, options);
		var self = this;

		/** @type {luga.data.DataSet|luga.data.DetailSet} */
		this.dataSource = luga.data.getDataSource(this.config.dsId);
		if(this.dataSource === null){
			throw(luga.string.format(luga.data.CONST.ERROR_MESSAGES.MISSING_DATA_SOURCE, [this.config.dsId]));
		}
		this.dataSource.addObserver(this);

		/**
		 * @param {jquery} node
		 * @returns {string}
		 */
		var fetchTemplate = function(node){
			if(self.config.templateId !== null){
				var templateNode = jQuery("#" + self.config.templateId);
				if(templateNode.length !== 1){
					throw(luga.string.format(CONST.ERROR_MESSAGES.MISSING_TEMPLATE_NODE, [self.config.templateId]));
				}
				return Handlebars.compile(templateNode.html());
			}
			else{
				return Handlebars.compile(node.html());
			}
		};

		this.template = fetchTemplate(this.config.node);

		this.applyTraits = function(){
			var traitData = {
				node: this.config.node,
				dataSource: this.dataSource
			};
			luga.data.region.traits.setRowId(traitData);
			luga.data.region.traits.setRowIndex(traitData);
			luga.data.region.traits.sort(traitData);
		};

		/**
		 * @returns {string}
		 */
		this.generateHtml = function(){
			return this.template(this.dataSource.getContext());
		};

		this.render = function(){
			this.config.node.html(this.generateHtml());
			this.applyTraits();
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
			SET_ROW_ID: "data-lugads-setrowid",
			SET_ROW_INDEX: "data-lugads-setrowindex",
			SORT: "data-lugads-sort"
		},
		SELECTORS: {
			SET_ROW_ID: "*[data-lugads-setrowid]",
			SET_ROW_INDEX: "*[data-lugads-setrowindex]",
			SORT: "*[data-lugads-sort]"
		}
	};

	/**
	 * Handles data-lugads-setrowid
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
	 * Handles data-lugads-setrowindex
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
	 * Handles data-lugads-sort
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

	luga.data.sort.isValidOrder = function(order){
		for(var key in luga.data.sort.ORDER){
			if(luga.data.sort.ORDER[key] === order){
				return true;
			}
		}
		return false;
	};

	/*
	 Very special thanks to Kin Blas https://github.com/jblas
	 */

	luga.namespace("luga.data.sort.date");

	luga.data.sort.date.ascending = function(prop){
		return function(a, b){
			var dA = a[prop];
			var dB = b[prop];
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dA - dB;
		};
	};

	luga.data.sort.date.descending = function(prop){
		return function(a, b){
			var dA = a[prop];
			var dB = b[prop];
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dB - dA;
		};
	};

	luga.namespace("luga.data.sort.number");

	luga.data.sort.number.ascending = function(prop){
		return function(a, b){
			a = a[prop];
			b = b[prop];
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? 1 : -1);
			}
			return a - b;
		};
	};

	luga.data.sort.number.descending = function(prop){
		return function(a, b){
			a = a[prop];
			b = b[prop];
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? -1 : 1);
			}
			return b - a;
		};
	};

	luga.namespace("luga.data.sort.string");

	luga.data.sort.string.ascending = function(prop){
		return function(a, b){

			a = a[prop];
			b = b[prop];

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
			a = a[prop];
			b = b[prop];
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