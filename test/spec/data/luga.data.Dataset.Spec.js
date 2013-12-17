/*global luga, it, describe, expect */

"use strict";

describe("luga.data.Dataset", function(){

	it("Is the base dataset class", function(){
		expect(jQuery.isFunction(luga.data.DataSet)).toBeTruthy();
	});

	it("It implements the Notifier interface", function(){
		var ds = new luga.data.DataSet({id: "myDs"});
		expect(jQuery.isFunction(ds.addObserver)).toBeTruthy();
		expect(jQuery.isFunction(ds.notifyObserver)).toBeTruthy();
		expect(jQuery.isArray(ds.observers)).toBeTruthy();
	});

	it("Throws an error if no id is passed among the parameters", function(){
		expect(function(){
			var ds = new luga.data.DataSet({});
		}).toThrow();
	});

});