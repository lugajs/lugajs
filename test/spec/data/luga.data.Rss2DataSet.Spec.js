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

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
		jasmine.Ajax.uninstall();
	});

	it("Is the Rss2Dataset constructor", function(){
		expect(luga.type(luga.data.Rss2Dataset)).toEqual("function");
	});

	it("Extend the luga.data.XmlDataSet class", function(){
		var xmlDs = new luga.data.XmlDataSet({uuid: "myXmlDs"});
		expect(noUrlDs).toMatchDuckType(xmlDs);
	});

	it("Can retrieve XML using XHR", function(){
		var testDs = new luga.data.Rss2Dataset({uuid: "rssDs", url: "mock/rss2.xml"});
		testDs.loadData();
		expect(testDs.getRecordsCount()).toEqual(testDs.getRecordsCount());
		expect(testDs.getContext()).toEqual(testDs.getContext());
	});

	describe(".getContext()", function(){

		it("Returns the RSS's context, containing .items and one property for each tag allowed inside <channel>", function(){
			noUrlDs.loadRecords({responseText: xmlStr});
			var context = noUrlDs.getContext();
			expect(context.items).toEqual(noUrlDs.select());
			expect(context.recordCount).toEqual(noUrlDs.getRecordsCount());
			expect(context).toMatchDuckType(noUrlDs.channelMeta);
		});

	});

	describe(".loadRecords()", function(){

		describe("Given an XHR response", function(){

			describe("First:", function(){

				it("Set the .rawXml property", function(){
					expect(noUrlDs.rawXml).toBeNull();
					noUrlDs.loadRecords({responseText: xmlStr});
					expect(noUrlDs.rawXml).not.toBeNull();
				});

			});

			describe("Then", function(){

				it("Calls .insert() to insert one record for each <item> inside the XML", function(){
					spyOn(noUrlDs, "insert").and.callThrough();
					noUrlDs.loadRecords({responseText: xmlStr});
					expect(noUrlDs.insert).toHaveBeenCalled();
					expect(noUrlDs.getRecordsCount(9)).toEqual(9);
				});

				it("Each record contains a property for each tag allowed inside <item>", function(){
					noUrlDs.loadRecords({responseText: xmlStr});
					var item = noUrlDs.records[0];
					expect(item.title).toBeUndefined();
					expect(item.link).toBeUndefined();
					expect(item.description).toBeDefined();
					expect(item.author).toBeUndefined();
					expect(item.category).toBeUndefined();
					expect(item.comments).toBeUndefined();
					expect(item.enclosure).toBeUndefined();
					expect(item.guid).toBeDefined();
					expect(item.pubDate).toBeDefined();
					expect(item.source).toBeUndefined();
				});

			});

			describe("Finally", function(){

				it("Populate .channelMeta with one property for each tag allowed inside <channel>", function(){
					noUrlDs.loadRecords({responseText: xmlStr});
					expect(noUrlDs.channelMeta.title).toBeDefined();
					expect(noUrlDs.channelMeta.link).toBeDefined();
					expect(noUrlDs.channelMeta.description).toBeDefined();
					expect(noUrlDs.channelMeta.language).toBeDefined();
					expect(noUrlDs.channelMeta.copyright).toBeDefined();
					expect(noUrlDs.channelMeta.managingEditor).toBeDefined();
					expect(noUrlDs.channelMeta.webMaster).toBeDefined();
					expect(noUrlDs.channelMeta.pubDate).toBeUndefined();
					expect(noUrlDs.channelMeta.lastBuildDate).toBeDefined();
					expect(noUrlDs.channelMeta.generator).toBeDefined();
					expect(noUrlDs.channelMeta.docs).toBeDefined();
					expect(noUrlDs.channelMeta.cloud).toBeUndefined();
					expect(noUrlDs.channelMeta.ttl).toBeDefined();
					expect(noUrlDs.channelMeta.image).toBeUndefined();
					expect(noUrlDs.channelMeta.textInput).toBeUndefined();
					expect(noUrlDs.channelMeta.skipHours).toBeUndefined();
					expect(noUrlDs.channelMeta.skipDays).toBeUndefined();
				});

			});

		});

	});

});