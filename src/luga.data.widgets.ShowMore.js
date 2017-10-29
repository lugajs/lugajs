(function(){
	"use strict";

	luga.namespace("luga.data.widgets");

	/**
	 * @typedef {Object} luga.data.widgets.ShowMore.options
	 *
	 * @property {luga.data.DataSet} dataSet   DataSet. Required
	 * @property {string|undefined} paramPath  Path to retrieve url template params from the JSON. Optional. If not specified the whole returned JSON will be used
	 * @property {String} url                  Url to be used by the dataSet to fetch more data. It can contain template placeholders. Required
	 */

	/**
	 * Abstract ShowMore class
	 * Concrete implementations must extend this
	 * @param {luga.data.widgets.ShowMore.options} options
	 * @constructor
	 * @abstract
	 * @listens stateChanged
	 * @throws {Exception}
	 */
	luga.data.widgets.ShowMore = function(options){

		this.CONST = {
			ERROR_MESSAGES: {
				INVALID_DATASET_PARAMETER: "luga.data.widgets.ShowMore: dataSet parameter is required",
				INVALID_URL_PARAMETER: "luga.data.widgets.ShowMore: url parameter is required"
			}
		};

		this.config = {
			/** @type {luga.data.dataSet} */
			dataSet: undefined,
			paramPath: "",
			url: undefined
		};
		luga.merge(this.config, options);

		/** @type {luga.data.widgets.ShowMore} */
		var self = this;

		if(this.config.dataSet === undefined){
			throw(this.CONST.ERROR_MESSAGES.INVALID_DATASET_PARAMETER);
		}
		if(this.config.url === undefined){
			throw(this.CONST.ERROR_MESSAGES.INVALID_URL_PARAMETER);
		}

		var isEnabled = false;
		this.config.dataSet.addObserver(this);

		this.assembleUrl = function(){
			var bindingObj = this.config.dataSet.getRawJson();
			/* istanbul ignore else */
			if(this.config.paramPath !== ""){
				bindingObj = luga.lookupProperty(bindingObj, this.config.paramPath);
			}
			return luga.string.populate(this.config.url, bindingObj);
		};

		/**
		 * @abstract
		 */
		this.disable = function(){
		};

		/**
		 * @abstract
		 */
		this.enable = function(){
		};

		this.fetch = function(){
			var newUrl = this.assembleUrl();
			if(newUrl !== this.config.url){
				this.config.dataSet.setUrl(newUrl);
				this.config.dataSet.loadData();
			}
			else{
				this.disable();
			}
		};

		this.isEnabled = function(){
			return isEnabled;
		};

		this.updateState = function(){
			if(this.config.dataSet.getState() === luga.data.STATE.READY){
				isEnabled = true;
				this.enable();
			}
			else{
				isEnabled = false;
				this.disable();
			}
		};

		/**
		 * @param {luga.data.DataSet.stateChanged} data
		 */
		this.onStateChangedHandler = function(data){
			self.updateState();
		};

		/* Constructor */
		this.updateState();

	};

	/**
	 * @typedef {Object} luga.data.ShowMoreButton.options
	 *
	 * @extends luga.data.widgets.ShowMore.options
	 * @property {jQuery}  button          Button that will trigger the showMore. Required
	 * @property {String}  disabledClass   Name of CSS class that will be applied to the button while it's disabled. Optional, default to "disabled"
	 */

	/**
	 * ShowMore button class
	 * @param {luga.data.widgets.ShowMoreButton.options} options
	 * @constructor
	 * @extends luga.data.widgets.ShowMore
	 * @listens stateChanged
	 * @throws {Exception}
	 */
	luga.data.widgets.ShowMoreButton = function(options){
		this.config = {
			/** @type {luga.data.dataSet} */
			dataSet: undefined,
			paramPath: "",
			url: undefined,
			/** @type {jQuery} */
			button: undefined,
			disabledClass: "disabled"
		};
		luga.merge(this.config, options);
		luga.extend(luga.data.widgets.ShowMore, this, [this.config]);

		/** @type {luga.data.widgets.ShowMoreButton} */
		var self = this;

		// The messages below are specific to this implementation
		self.CONST.BUTTON_ERROR_MESSAGES = {
			MISSING_BUTTON: "luga.data.widgets.ShowMoreButton was unable find the button node"
		};

		// Ensure it's a jQuery object
		this.config.button = jQuery(this.config.button);
		if(this.config.button.length === 0){
			throw(this.CONST.BUTTON_ERROR_MESSAGES.MISSING_BUTTON);
		}

		this.attachEvents = function(){
			jQuery(self.config.button).on("click", function(event){
				event.preventDefault();
				if(self.isEnabled() === true){
					self.fetch();
				}
			});
		};

		this.disable = function(){
			this.config.button.addClass(this.config.disabledClass);
		};

		this.enable = function(){
			this.config.button.removeClass(this.config.disabledClass);
		};

		/* Constructor */
		this.attachEvents();

	};

	/**
	 * @typedef {Object} luga.data.ShowMoreScrolling.options
	 *
	 * @extends luga.data.widgets.ShowMore.options
	 * @property {jQuery|undefined}  node  A jQuery object wrapping the node containing the records. It must have a scrollbar. Optional. If not specified, the whole document is assumed.
	 */

	/**
	 * ShowMore infinite scrolling class
	 * @param {luga.data.widgets.ShowMoreScrolling.options} options
	 * @constructor
	 * @extends luga.data.widgets.ShowMore
	 * @listens stateChanged
	 * @throws {Exception}
	 */
	luga.data.widgets.ShowMoreScrolling = function(options){

		this.config = {
			/** @type {luga.data.dataSet} */
			dataSet: undefined,
			paramPath: "",
			url: undefined,
			/** @type {jQuery} */
			node: undefined
		};
		luga.merge(this.config, options);
		luga.extend(luga.data.widgets.ShowMore, this, [this.config]);
		/** @type {luga.data.widgets.ShowMoreScrolling} */
		var self = this;

		var scrollBody = false;
		if(this.config.node === undefined){
			scrollBody = true;
			this.config.node = jQuery(document);
		}

		this.attachEvents = function(){
			var targetNode = self.config.node;

			jQuery(targetNode).scroll(function(){
				var scrolledToBottom = false;
				if(scrollBody === true){
					/* istanbul ignore else */
					if(jQuery(targetNode).scrollTop() === (jQuery(targetNode).height() - jQuery(window).height())){
						scrolledToBottom = true;
					}
				}
				else{
					/* istanbul ignore else */
					if(jQuery(targetNode).scrollTop() >= (targetNode[0].scrollHeight - targetNode.height())){
						scrolledToBottom = true;
					}
				}
				if((scrolledToBottom === true) && (self.isEnabled() === true)){
					self.fetch();
				}
			});

		};

		/* Constructor */
		this.attachEvents();

	};

}());