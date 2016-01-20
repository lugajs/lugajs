(function(){
	"use strict";

	luga.namespace("luga.data.widgets");

	luga.data.widgets.ShowMore = function(options){

		this.config = {
			disabledClass: "disabled",
			placeholderName: "jsonPath",
			/** @type {jQuery} */
			button: undefined,
			/** @type {luga.data.dataSet} */
			dataSet: undefined,
			jsonPath: undefined,
			url: undefined
		};
		luga.merge(this.config, options);

		/** @type {luga.data.widgets.ShowMore} */
		var self = this;

		var isEnabled = false;

		this.init = function(){
			this.config.dataSet.addObserver(this);
			this.updateState();
			this.attachEvents();
		};

		this.updateState = function(){
			if(this.config.dataSet.getState() === luga.data.STATE.READY){
				isEnabled = true;
				this.enableGui();
			}
			else{
				isEnabled = false;
				this.disableGui();
			}
		};

		this.attachEvents = function(){
			jQuery(self.config.button).on("click", function(event){
				event.preventDefault();
				if(isEnabled === true){
					self.fetch();
				}
			});
		};

		this.enableGui = function(){
			this.config.button.removeClass(this.config.disabledClass);
		};

		this.disableGui = function(){
			this.config.button.addClass(this.config.disabledClass);
		};

		this.fetch = function(){
			var nextKey = this.getNextKey();
			if(nextKey !== null){
				this.config.dataSet.setUrl(this.assembleUrl(nextKey));
				this.config.dataSet.loadData();
			}
			else{
				this.disable();
			}
		};

		this.getNextKey = function(){
			return luga.lookupProperty(this.config.dataSet.getRawJson(), this.config.jsonPath);
		};

		this.assembleUrl = function(replaceValue){
			var replaceObj = {};
			replaceObj[this.config.placeholderName] = replaceValue;
			return luga.string.format(this.config.url, replaceObj);
		};

		/**
		 * @param {luga.data.DataSet.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.updateState();
		};

		this.init();

	};

}());