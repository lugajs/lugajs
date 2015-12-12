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
		 * @returns {luga.data.DataSet.context}
		 */
		this.getContext = function(){
			var stateDesc = luga.data.utils.assembleStateDescription(self.getState());
			var rsData = {
				context: self.row,
				recordCount: 1
			};
			if(self.row === null){
				rsData.recordCount = 0;
			}
			luga.merge(stateDesc, rsData);
			return stateDesc;
		};

		/**
		 * Returns the detailSet's current state
		 * @return {null|luga.data.STATE}
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