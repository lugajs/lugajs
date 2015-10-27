/* globals alert */

if(typeof(luga) === "undefined"){
	throw("Unable to find Luga JS Core");
}

(function(){
	"use strict";

	luga.namespace("luga.ajaxform");
	luga.ajaxform.version = "0.6";

	/* Success and error handlers */
	luga.namespace("luga.ajaxform.handlers");

	/**
	 * Replace form with message
	 *
	 * @param {string}   msg          Message to display in the GUI
	 * @param {jquery}   formNode     jQuery object wrapping the form
	 * @param {string}   textStatus   HTTP status
	 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
	 */
	luga.ajaxform.handlers.replaceForm = function(msg, formNode, textStatus, jqXHR){
		jQuery(formNode).empty();
		jQuery(formNode).html(msg);
	};

	/**
	 * Display error message inside alert
	 *
	 * @param {string}   msg          Message to display in the GUI
	 * @param {jquery}   formNode     jQuery object wrapping the form
	 * @param {string}   textStatus   HTTP status
	 * @param {string}   errorThrown  Error message from jQuery
	 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
	 */
	luga.ajaxform.handlers.errorAlert = function(msg, formNode, textStatus, errorThrown, jqXHR){
		alert(msg);
	};

	/**
	 * Display errors inside a box above the form
	 *
	 * @param {string}   msg          Message to display in the GUI
	 * @param {jquery}   formNode     jQuery object wrapping the form
	 * @param {string}   textStatus   HTTP status
	 * @param {string}   errorThrown  Error message from jQuery
	 * @param {object}   jqXHR        jQuery wrapper around XMLHttpRequest
	 */
	luga.ajaxform.handlers.errorBox = function(msg, formNode, textStatus, errorThrown, jqXHR){
		// Clean-up any existing box
		luga.utils.removeDisplayBox(formNode);
		luga.utils.displayErrorMessage(formNode, msg);
	};

	luga.ajaxform.CONST = {
		FORM_SELECTOR: "form[data-lugajax-form='true']",
		USER_AGENT: "luga.ajaxform",
		DEFAULT_METHOD: "GET",
		DEFAULT_TIME_OUT: 30000, // ms
		CUSTOM_ATTRIBUTES: {
			AJAX: "data-lugajax-form",
			ACTION: "data-lugajax-action",
			METHOD: "data-lugajax-method",
			TIME_OUT: "data-lugajax-timeout",
			SUCCESS: "data-lugajax-success",
			SUCCESS_MSG: "data-lugajax-successmsg",
			ERROR: "data-lugajax-error",
			ERROR_MSG: "data-lugajax-errormsg",
			BEFORE: "data-lugajax-before",
			AFTER: "data-lugajax-after"
		},
		MESSAGES: {
			SUCCESS: "Thanks for submitting the form",
			ERROR: "Failed to submit the form",
			MISSING_FORM: "luga.ajaxform was unable to load form",
			MISSING_FUNCTION: "luga.ajaxform was unable to find a function named: {0}"
		},
		HANDLERS: {
			SUCCESS: "luga.ajaxform.handlers.replaceForm",
			ERROR: "luga.ajaxform.handlers.errorAlert"
		}
	};

	/**
	 * @typedef {object} luga.ajaxform.Sender.options
	 *
	 * @property formNode    {jquery}  Either a jQuery object wrapping the form or the naked DOM object. Required
	 * @property action      {string}  URL to where the form will be send. Default to the current URL
	 * @property method      {string}  HTTP method to be used. Default to GET
	 * @property timeout     {integer} Timeout to be used during the HTTP call (milliseconds). Default to 30000
	 * @property success     {string}  Name of the function to be invoked if the form is successfully submitted. Default to luga.ajaxform.handlers.replaceForm
	 * @property error       {string}  Name of the function to be invoked if the HTTP call failed. Default to luga.ajaxform.handlers.errorAlert
	 * @property successmsg  {string}  Message that will be displayed to the user if the form is successfully submitted. Default to "Thanks for submitting the form"
	 * @property errormsg    {string}  Message that will be displayed to the user if the HTTP call failed. Default to "Failed to submit the form"
	 * @property before      {string}  Name of the function to be invoked before the form is send. Default to null
	 * @property after       {string}  Name of the function to be invoked after the form is send. Default to null
	 */

	/**
	 * Form handler. Invoke its sender() method to serialize the form and send its contents using XHR
	 * @param options {luga.ajaxform.Sender.options}
	 * @constructor
	 */
	luga.ajaxform.Sender = function(options){
		// Ensure it's a jQuery object
		options.formNode = jQuery(options.formNode);
		this.config = {
			// Either: form attribute, custom attribute, incoming option or current URL
			action: options.formNode.attr("action") || options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.ACTION) || document.location.href,
			// Either: form attribute, custom attribute, incoming option or default
			method: options.formNode.attr("method") || options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.METHOD) || luga.ajaxform.CONST.DEFAULT_METHOD,
			// Either: custom attribute, incoming option or default
			timeout: options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.TIME_OUT) || luga.ajaxform.CONST.DEFAULT_TIME_OUT,
			success: options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.SUCCESS) || luga.ajaxform.CONST.HANDLERS.SUCCESS,
			error: options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.ERROR) || luga.ajaxform.CONST.HANDLERS.ERROR,
			successmsg: options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.SUCCESS_MSG) || luga.ajaxform.CONST.MESSAGES.SUCCESS,
			errormsg: options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.ERROR_MSG) || luga.ajaxform.CONST.MESSAGES.ERROR,
			// Either: custom attribute, incoming option or null
			before: options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.BEFORE) || null,
			after: options.formNode.attr(luga.ajaxform.CONST.CUSTOM_ATTRIBUTES.AFTER) || null
		};
		luga.merge(this.config, options);
		this.config.timeout = parseInt(this.config.timeout, 10);
		var self = this;

		if(self.config.formNode.length === 0){
			throw(luga.ajaxform.CONST.MESSAGES.MISSING_FORM);
		}

		var handleAfter = function(){
			if(self.config.after !== null){
				var callBack = luga.lookup(self.config.after);
				if(callBack === null){
					throw(luga.string.format(luga.ajaxform.CONST.MESSAGES.MISSING_FUNCTION, [self.config.after]));
				}
				callBack.apply(null, [self.config.formNode]);
			}
		};

		var handleBefore = function(){
			if(self.config.before !== null){
				var callBack = luga.lookup(self.config.before);
				if(callBack === null){
					throw(luga.string.format(luga.ajaxform.CONST.MESSAGES.MISSING_FUNCTION, [self.config.before]));
				}
				callBack.apply(null, [self.config.formNode]);
			}
		};

		var handleError = function(textStatus, jqXHR, errorThrown){
			var callBack = luga.lookup(self.config.error);
			if(callBack === null){
				throw(luga.string.format(luga.ajaxform.CONST.MESSAGES.MISSING_FUNCTION, [self.config.error]));
			}
			callBack.apply(null, [self.config.errormsg, self.config.formNode, textStatus, errorThrown, jqXHR]);
		};

		var handleSuccess = function(textStatus, jqXHR){
			var callBack = luga.lookup(self.config.success);
			if(callBack === null){
				throw(luga.string.format(luga.ajaxform.CONST.MESSAGES.MISSING_FUNCTION, [self.config.success]));
			}
			callBack.apply(null, [self.config.successmsg, self.config.formNode, textStatus, jqXHR]);
		};

		/**
		 * Perform the following actions:
		 * 1) Invoke the before handler, if any
		 * 2) Make the HTTP call, sending along the serialized form's content
		 * 3) Invoke either the success or error handler
		 * 4) Invoke the after handler, if any
		 */
		this.send = function(){

			if(self.config.before !== null){
				handleBefore();
			}

			jQuery.ajax({
				data: luga.form.toQueryString(self.config.formNode, true),
				headers: {
					"X-Requested-With": luga.ajaxform.CONST.USER_AGENT
				},
				error: function(jqXHR, textStatus, errorThrown){
					handleError(textStatus, jqXHR, errorThrown);
				},
				method: self.config.method,
				success: function(response, textStatus, jqXHR){
					handleSuccess(textStatus, jqXHR);
				},
				timeout: self.config.timeout,
				url: self.config.action
			});

			if(self.config.after !== null){
				handleAfter();
			}

		};

	};

	/**
	 * Attach form handlers to onSubmit events
	 */
	luga.ajaxform.initForms = function(){
		jQuery(luga.ajaxform.CONST.FORM_SELECTOR).each(function(index, item){
			var formNode = jQuery(item);
			formNode.submit(function(event){
				event.preventDefault();
				var formHandler = new luga.ajaxform.Sender({
					formNode: formNode
				});
				formHandler.send();
			});
		});
	};

	jQuery(document).ready(function(){
		luga.ajaxform.initForms();
	});

}());