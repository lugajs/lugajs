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
			INVALID_ID_PARAMETER: "DataSet: id parameter is required"
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
		this.unfilteredData = null;
		this.curRowId = 0;

		var self = this;

		luga.data.datasetRegistry[this.config.id] = self;

		/**
		 * Adds rows to a dataSet
		 * Developers should be aware that the data set takes ownership of the objects within the array that is passed in.
		 * That is, it uses those objects as its row object internally. It does not make a copy of the objects.
		 * @param  rowData   Either one single object or an array of objects
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

	};

}());