(function(){
	"use strict";

	/**
	 * @typedef {object} luga.data.DetailSet.options
	 *
	 * @property {string}              id     Unique identifier. Required
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

		this.fetchRow = function(){
			self.row = self.dataSet.getCurrentRow();
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

		/* Constructor */

		this.fetchRow();

	};

}());