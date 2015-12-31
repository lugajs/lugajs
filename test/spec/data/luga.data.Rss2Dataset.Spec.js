describe("luga.data.Rss2Dataset", function(){

	"use strict";

	var xmlStr, noUrlDs, testDs, DEFAULT_TIMEOUT;
	beforeEach(function(){

		var response = jQuery.ajax({
			url: "fixtures/data/rss2.xml",
			async: false,
			dataType: "xml"
		});
		xmlStr = response.responseText;

		noUrlDs = new luga.data.Rss2Dataset({uuid: "noUrlDs"});
		testDs = new luga.data.Rss2Dataset({uuid: "rssDs", url: "fixtures/data/rss2.xml"});
		DEFAULT_TIMEOUT = 2000;
	});

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
	});

	it("Is the RSS2 dataset class", function(){
		expect(jQuery.isFunction(luga.data.Rss2Dataset)).toBeTruthy();
	});

	it("Implements the luga.data.HttpDataSet abstract class", function(){
		var MockDs = function(options){
			luga.extend(luga.data.Rss2Dataset, this, [options]);
		}
		expect(noUrlDs).toMatchDuckType(new MockDs({uuid: "duck"}, false));
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.data.Rss2Dataset.version).toBeDefined();
		});
	});

	describe(".loadRecords()", function(){

		describe("Given an XML string", function(){

			describe("First:", function(){

				it("Set the .rawXml property", function(){
					noUrlDs.loadRecords(xmlStr);
					expect(noUrlDs.rawXml).toEqual(xmlStr);
				});

			});

			describe("Then", function(){

				it("Calls .itemToRecord()", function(){
					spyOn(noUrlDs, "itemToRecord").and.callThrough();
					noUrlDs.loadRecords(xmlStr);
					expect(noUrlDs.itemToRecord).toHaveBeenCalled();
				});

			});

			describe("Then", function(){

				it("Calls .insert() to insert one record for each <item> inside the XML", function(){
					spyOn(noUrlDs, "insert").and.callThrough();
					noUrlDs.loadRecords(xmlStr);
					expect(noUrlDs.insert).toHaveBeenCalled();
					expect(noUrlDs.getRecordsCount(9)).toEqual(9);
				});

			});

		});

	});

});