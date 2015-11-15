if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.data");

	luga.data.version = "0.1.3";
	/** @type {hash.<luga.data.DataSet>} */
	luga.data.datasetRegistry = {};

	luga.data.CONST = {
		PK_KEY: "rowID",
		CUSTOM_ATTRIBUTES: {
			REGION: "data-lugads-region",
			TEMPLATE: "data-lugads-template",
			DATA_SET: "data-lugads-dataset"
		},
		ERROR_MESSAGES: {
			INVALID_ID_PARAMETER: "Luga.DataSet: id parameter is required"
		},
		EVENTS: {
			CURRENT_ROW_CHANGED: "currentRowChanged",
			DATA_CHANGED: "dataChanged",
			LOADING: "loading",
			XHR_ERROR: "xhrError"
		},
		SELECTORS: {
			REGION: "*[data-lugads-region]"
		},
		XHR_TIMEOUT: 10000 // Keep this accessible to everybody
	};

	/**
	 * Returns a dataSet from the registry
	 * Returns null if no dataSet matches the given id
	 * @param {string} id
	 * @returns {luga.data.DataSet}
	 */
	luga.data.getDataSet = function(id){
		if(luga.data.datasetRegistry[id] !== undefined){
			return luga.data.datasetRegistry[id];
		}
		return null;
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
	 * @typedef {object} luga.data.DataSet.options
	 *
	 * @property {string}              id         Unique identifier. Required
	 * @property {array.<object>|object} records  Records to be loaded, either one single object containing value/name pairs, or an array of name/value pairs
	 * @property {function|null}       filter     A filter functions to be called once for each row in the dataSet. Default to null
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

		var CONST = {
			ERROR_MESSAGES: {
				INVALID_PRIMITIVE: "Luga.DataSet: records can be either an array of objects or a single object. Primitives are not accepted",
				INVALID_PRIMITIVE_ARRAY: "Luga.DataSet: records can be either an array of name/value pairs or a single object. Array of primitives are not accepted",
				INVALID_ROW_PARAMETER: "Luga.DataSet: invalid row parameter. No available record matches the given row",
				INVALID_ROW_ID_PARAMETER: "Luga.DataSet: invalid rowId parameter",
				INVALID_ROW_INDEX_PARAMETER: "Luga.DataSet: invalid parameter. Row index is out of range",
				INVALID_FILTER_PARAMETER: "Luga.DataSet: invalid filter. You must use a function as filter"
			}
		};

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

		luga.data.datasetRegistry[this.id] = this;

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
		 * Delete records matching the given filter
		 * If no filter is passed, delete all records
		 * @param {function|null} filter   An optional filter function. If specified only records matching the filter will be returned. Default to null
		 *                                 The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
		 * @fires currentRowChanged
		 * @fires dataChanged
		 */
		this.delete = function(filter){
			if(filter === undefined){
				deleteAll();
				this.resetCurrentRow();
				return;
			}
			if(jQuery.isFunction(filter) === false){
				throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			this.records = filterRecords(selectAll(), filter);
			applyFilter();
			this.resetCurrentRow();
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, this);
		};

		/**
		 * Remove the current filter function
		 * Triggers a "dataChanged" notification
		 * @fires dataChanged
		 */
		this.deleteFilter = function(){
			this.filter = null;
			this.filteredRecords = null;
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, this);
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
		 * Adds rows to a dataSet
		 * Be aware that the dataSet use passed data by reference
		 * That is, it uses those objects as its row object internally. It does not make a copy
		 * @param  {array.<object>|object} records   Records to be loaded, either one single object containing value/name pairs, or an array of name/value pairs. Required
		 * @fires dataChanged
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
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, this);
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
		 * Sets the current row of the data set to the row matching the given rowId
		 * Throws an exception if the given rowId is invalid
		 * Triggers a "currentRowChanged" notification
		 * @param {number|null} rowId  Required
		 * @fires currentRowChanged
		 */
		this.setCurrentRowId = function(rowId){
			// No need to do anything
			if(this.currentRowId === rowId){
				return;
			}
			var notificationData = { oldRowId: this.currentRowId, newRowId: rowId, dataSet: this };
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
		 */
		this.setCurrentRowByIndex = function(index){
			this.setCurrentRow(this.getRowByIndex(index));
		};

		/**
		 * Replace current filter with a new filter functions and apply the new filter
		 * Triggers a "dataChanged" notification
		 * @param {function} filter   A filter functions to be called once for each row in the data set. Required
		 *                            The function is going to be called with this signature: myFilter(dataSet, row, rowIndex)
		 * @fires currentRowChanged
		 * @fires dataChanged
		 */
		this.setFilter = function(filter){
			if(jQuery.isFunction(filter) === false){
				throw(CONST.ERROR_MESSAGES.INVALID_FILTER_PARAMETER);
			}
			this.filter = filter;
			applyFilter();
			this.notifyObservers(luga.data.CONST.EVENTS.DATA_CHANGED, this);
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
		 */
		this.loadData = function(){
			if(this.url === null){
				throw(CONST.ERROR_MESSAGES.NEED_URL_TO_LOAD);
			}
			this.notifyObservers(luga.data.CONST.EVENTS.LOADING, this);
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
		 * @param {string} newPath
		 */
		this.setPath = function(newPath){
			this.path = newPath;
		};

	};

}());
(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.Region.options
	 *
	 * @property {jquery} node     Either a jQuery object wrapping the node or the naked DOM object that will contain the region. Required
	 *
	 */

	/**
	 * Data Region class
	 * @param {luga.data.Region.options} options
	 */
	luga.data.Region = function(options){
		if(typeof(Handlebars) === "undefined"){
			throw("Unable to find Handlebars");
		}

		var self = this;

		this.node = jQuery(options.node);
		this.dsId = this.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.DATA_SET);
		/** @type {luga.data.DataSet} */
		this.dataSet = luga.data.getDataSet(this.dsId);
		this.dataSet.addObserver(this);

		this.templateId = this.node.attr(luga.data.CONST.CUSTOM_ATTRIBUTES.TEMPLATE);
		if(this.templateId !== undefined){
			this.template = Handlebars.compile(jQuery("#" + this.templateId).html());
		}
		else{
			this.template = Handlebars.compile(this.node.html());
		}

		this.generateHtml = function(){
			return this.template(this.dataSet);
		};

		this.render = function(){
			this.node.html(this.generateHtml());
		};


		/* Events Handlers */

		this.onDataChangedHandler = function(data){
			self.render();
		};
	};

	jQuery(document).ready(function(){
		jQuery(luga.data.CONST.SELECTORS.REGION).each(function(index, item){
			new luga.data.Region({
				node: jQuery(item)
			});
		});
	});

}());