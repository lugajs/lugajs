/*
 Copyright 2013 Massimo Foti (massimo@massimocorner.com)

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.data");

	luga.data.version = 0.1;
	luga.data.datasetRegistry = {};

	luga.data.CONST = {
		PK_KEY: "rowID",
		ERROR_MESSAGES: {
			INVALID_ID_PARAMETER: "Luga.DataSet: id parameter is required",
			INVALID_ROW_ID_PARAMETER: "Luga.DataSet: invalid rowId parameter"
		}
	};

	/**
	 * Base dataSet class
	 *
	 * @param options.id:               Unique identifier. Required
	 * @param options.records:          Records to be loaded, either one single object or an array of objects.  Default to null
	 * @param options.filters:          An array of filter functions to be called once for each row in the data set. Default to null
	 */
	luga.data.DataSet = function(options){
		if(!options.id){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_ID_PARAMETER);
		}
		luga.extend(luga.Notifier, this);
		var self = this;

		this.id = options.id;
		this.records = [];
		this.recordsHash = {};
		this.filteredRecords = null;
		this.filters = null;
		this.currentRowId = 0;

		luga.data.datasetRegistry[this.id] = this;

		/**
		 * Adds rows to a dataSet
		 * Be aware that the dataSet use passed data by reference..
		 * That is, it uses those objects as its row object internally. It does not make a copy.
		 * @param  records    Either one single object or an array of objects. Required
		 */
		this.insert = function(records){
			// If we only get one record, we put it inside an array anyway,
			var recordsHolder = [];
			if(jQuery.isArray(records)){
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
			this.notifyObservers("dataChanged", this);
		};

		/**
		 * Returns the row object associated with the given rowId
		 * @param  rowId  An integer. Required
		 */
		this.getRowById = function(rowId){
			if(this.recordsHash[rowId]){
				return this.recordsHash[rowId];
			}
			return null;
		};

		/**
		 * Returns the rowId of the current row.
		 * Do not confuse the rowId of a row with the index of the row.
		 * The rowId is a column that contains a unique identifier for the row.
		 * This identifier does not change if the rows of the data set are sorted
		 */
		this.getCurrentRowId = function(){
			return this.currentRowId;
		};

		/**
		 * Sets the current row of the data set to the row with the given rowId.
		 * Throws an exception if the given rowId is invalid.
		 * Triggers a "currentRowChanged" notification.
		 * @param  rowId  An integer. Required
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

		if(options.filters){
			this.filters = options.filters;
		}
		if(options.records){
			this.insert(options.records);
		}

	};

}());