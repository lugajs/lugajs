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

	luga.data.DataSet = function(options){
		if(!options.id){
			throw(luga.data.CONST.ERROR_MESSAGES.INVALID_ID_PARAMETER);
		}
		this.config = {};
		luga.merge(this.config, options);
		luga.extend(luga.Notifier, this);

		this.data = [];
		this.dataHash = {};
		this.filteredData = null;
		this.currentRowId = 0;

		var self = this;

		luga.data.datasetRegistry[this.config.id] = self;

		/**
		 * Adds rows to a dataSet
		 * Be aware that the dataSet use passed data by reference..
		 * That is, it uses those objects as its row object internally. It does not make a copy.
		 * @param  rowData Either one single object or an array of objects. Required
		 */
		this.insert = function(rowData){
			// If we only get one record, we put it inside an array anyway,
			var recordsHolder = [];
			if(jQuery.isArray(rowData)){
				recordsHolder = rowData;
			}
			else{
				recordsHolder.push(rowData);
			}
			for(var i = 0; i < recordsHolder.length; i++){
				// Create new PK
				var recordID = this.data.length;
				recordsHolder[i][luga.data.CONST.PK_KEY] = recordID;
				this.dataHash[this.data.length] = recordsHolder[i];
				this.data.push(recordsHolder[i]);
			}
			this.notifyObservers("dataChanged", this);
		};

		/**
		 * Returns the row object associated with the given rowId
		 * @param  rowId  An integer. Required
		 */
		this.getRowById = function(rowId){
			if(this.dataHash[rowId]){
				return this.dataHash[rowId];
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
		this.setCurrentRowById = function(rowId){
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

	};

}());