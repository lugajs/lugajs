(function(){
	"use strict";

	/**
	 * TSV dataSet class
	 * @param {luga.data.HttpDataSet.options} options
	 * @constructor
	 * @extend luga.data.HttpDataSet
	 */
	luga.data.TsvDataset = function(options){
		luga.extend(luga.data.HttpDataSet, this, [options]);
		/** @type {luga.data.TsvDataset} */
		const self = this;

		const delimiter = "\t";
		this.columnNames = [];

		/** @type {null|string} */
		this.rawTsv = null;

		/**
		 * Returns the raw TSV data
		 * @return {null|string}
		 */
		this.getRawTsv = function(){
			return self.rawTsv;
		};

		/**
		 * First delete any existing records, then load data from the given TSV, without XHR calls
		 * @param {string} rawTsv
		 */
		this.loadRawTsv = function(rawTsv){
			self.delete();
			self.loadRecords({
				responseText: rawTsv
			});
		};

		/**
		 * Get TSV as string and turn it into an array of records
		 * @param {string} rawTsv
		 * @return {Array}
		 */
		const extractRecords = function(rawTsv){
			// Reset column name
			self.columnNames = [];

			const records = [];
			const pattern = /[^\r\n]+|(\r\n|\r|\n)/mg;

			let columnsLoaded = false;
			let results = pattern.exec(rawTsv);

			// Look at one row at time
			while(results !== null && results[0] !== null){
				const row = results[0];
				// Skip new lines
				if(row !== "\r\n" && row !== "\r" && row !== "\n"){
					const fields = row.split(delimiter);
					// First valid row contains column names
					if(columnsLoaded === false){
						self.columnNames = fields;
						columnsLoaded = true;
					}
					else{
						const rec = {};
						fields.forEach(function(element, index){
							rec[self.columnNames[index]] = element;
						});
						records.push(rec);
					}
				}
				// Move to next row
				results = pattern.exec(rawTsv);
			}

			return records;
		};

		/**
		 * Retrieve TSV data from an HTTP response
		 * @param {luga.xhr.response} response
		 * @override
		 */
		this.loadRecords = function(response){
			self.rawTsv = response.responseText;
			const records = extractRecords(response.responseText);
			self.insert(records);
		};

	};

}());