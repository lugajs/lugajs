(function(){
	"use strict";

	/**
	 * JSON dataSet class
	 *
	 * @param options:                  Same as luga.data.HttpDataSet plus:
	 * @param options.path:             Specifies the path to the data within the JSON structure. Default to null
	 */
	luga.data.JsonDataSet = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		var self = this;

		this.path = null;
		if(options.path !== undefined){
			this.path = options.path;
		}

		/**
		 * Returns the path to be used to extract data out of the JSON data structure
		 */
		this.getPath = function(){
			return this.path;
		};

		/**
		 * Set the path to be used to extract data out of the JSON data structure
		 */
		this.setPath = function(newPath){
			this.path = newPath;
		};

		/**
		 * Receives HTTP response, extracts and loads records out of it
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

	};

}());