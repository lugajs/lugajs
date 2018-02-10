describe("luga.data.Rss2Dataset", function(){

	"use strict";

	var xmlStr, noUrlDs;
	beforeEach(function(){

		xmlStr = jasmineFixtures.read("data/rss2.txt");

		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest("mock/rss2.xml").andReturn({
			contentType: "application/xml",
			responseText: xmlStr,
			status: 200
		});

		noUrlDs = new luga.data.Rss2Dataset({uuid: "noUrlDs"});

	});

	afterEach(function() {
		luga.data.dataSourceRegistry = {};
		jasmine.Ajax.uninstall();
	});

	it("Is the RSS2 dataset class", function(){
		expect(jQuery.isFunction(luga.data.Rss2Dataset)).toEqual(true);
	});

	it("Implements the luga.data.HttpDataSet abstract class", function(){
		var MockDs = function(options){
			luga.extend(luga.data.Rss2Dataset, this, [options]);
		};
		expect(noUrlDs).toMatchDuckType(new MockDs({uuid: "duck"}, false));
	});

	it("Can retrieve XML using XHR or consume XML as string", function(){
		noUrlDs.loadRecords(xmlStr);
		var testDs = new luga.data.Rss2Dataset({uuid: "rssDs", url: "mock/rss2.xml"});
		testDs.loadData();
		expect(testDs.getRecordsCount()).toEqual(testDs.getRecordsCount());
		expect(testDs.getContext()).toEqual(testDs.getContext());
	});

	describe(".version", function(){
		it("Reports the current version number", function(){
			expect(luga.data.Rss2Dataset.version).toBeDefined();
		});
	});


	describe(".getContext()", function(){

		it("Returns the RSS's context, containing .items and one property for each tag allowed inside <channel>", function(){
			noUrlDs.loadRecords(xmlStr);
			var context = noUrlDs.getContext();
			expect(context.items).toEqual(noUrlDs.select());
			expect(context.recordCount).toEqual(noUrlDs.getRecordsCount());
			expect(context).toMatchDuckType(noUrlDs.channelMeta);
		});

	});

	describe(".getRawXml()", function(){
		it("Returns the raw XML string", function(){
			noUrlDs.loadRecords(xmlStr);
			expect(noUrlDs.getRawXml()).toEqual(xmlStr);
		});
		it("Returns null if no data has been loaded yet", function(){
			expect(noUrlDs.getRawXml()).toBeNull();
		});
	});

	describe(".loadRawXml()", function(){

		describe("Given an XML string", function(){

			it("First calls .delete()", function(){
				spyOn(noUrlDs, "delete");
				noUrlDs.loadRawXml(xmlStr);
				expect(noUrlDs.delete).toHaveBeenCalled();
			});
			it("Then calls .loadRecords()", function(){
				spyOn(noUrlDs, "loadRecords");
				noUrlDs.loadRawXml(xmlStr);
				expect(noUrlDs.loadRecords).toHaveBeenCalledWith(xmlStr);
			});

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

				it("Calls .insert() to insert one record for each <item> inside the XML", function(){
					spyOn(noUrlDs, "insert").and.callThrough();
					noUrlDs.loadRecords(xmlStr);
					expect(noUrlDs.insert).toHaveBeenCalled();
					expect(noUrlDs.getRecordsCount(9)).toEqual(9);
				});

				it("Each record contains a property for each tag allowed inside <item>", function(){
					noUrlDs.loadRecords(xmlStr);
					var item = noUrlDs.records[0];
					expect(item.title).toBeDefined();
					expect(item.link).toBeDefined();
					expect(item.description).toBeDefined();
					expect(item.author).toBeDefined();
					expect(item.category).toBeDefined();
					expect(item.comments).toBeDefined();
					expect(item.enclosure).toBeDefined();
					expect(item.guid).toBeDefined();
					expect(item.pubDate).toBeDefined();
					expect(item.source).toBeDefined();
				});

			});

			describe("Finally", function(){

				it("Populate .channelMeta with one property for each tag allowed inside <channel>", function(){
					noUrlDs.loadRecords(xmlStr);
					expect(noUrlDs.channelMeta.title).toBeDefined();
					expect(noUrlDs.channelMeta.link).toBeDefined();
					expect(noUrlDs.channelMeta.description).toBeDefined();
					expect(noUrlDs.channelMeta.language).toBeDefined();
					expect(noUrlDs.channelMeta.copyright).toBeDefined();
					expect(noUrlDs.channelMeta.managingEditor).toBeDefined();
					expect(noUrlDs.channelMeta.webMaster).toBeDefined();
					expect(noUrlDs.channelMeta.pubDate).toBeDefined();
					expect(noUrlDs.channelMeta.lastBuildDate).toBeDefined();
					expect(noUrlDs.channelMeta.generator).toBeDefined();
					expect(noUrlDs.channelMeta.docs).toBeDefined();
					expect(noUrlDs.channelMeta.cloud).toBeDefined();
					expect(noUrlDs.channelMeta.ttl).toBeDefined();
					expect(noUrlDs.channelMeta.image).toBeDefined();
					expect(noUrlDs.channelMeta.textInput).toBeDefined();
					expect(noUrlDs.channelMeta.skipHours).toBeDefined();
					expect(noUrlDs.channelMeta.skipDays).toBeDefined();
				});

			});

		});

	});

});