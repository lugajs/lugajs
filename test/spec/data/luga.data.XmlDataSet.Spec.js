describe("luga.data.XmlDataSet", function(){

	"use strict";

	var testRecordsStr, noUrlDs;
	beforeEach(function(){
		testRecordsStr = jasmineFixtures.read("data/peopleXml.txt");
		noUrlDs = new luga.data.XmlDataSet({uuid: "noUrlDs"});
	});

	afterEach(function(){
		luga.data.dataSourceRegistry = {};
	});

	it("Is the XML dataset class", function(){
		expect(jQuery.isFunction(luga.data.XmlDataSet)).toEqual(true);
	});

	it("Implements the luga.data.HttpDataSet abstract class", function(){
		var MockDs = function(options){
			luga.extend(luga.data.HttpDataSet, this, [options]);
		};
		expect(noUrlDs).toMatchDuckType(new MockDs({uuid: "duck"}));
	});

	describe("Its constructor options are the same as luga.data.HttpDataSet and also contains:", function(){
		it("options.path", function(){
			var ds = new luga.data.XmlDataSet({uuid: "myDs", path: "myPath"});
			expect(ds.path).toEqual("myPath");
		});
		it("options.path default value is: '/'", function(){
			expect(noUrlDs.getPath()).toEqual("/");
		});
	});

	describe(".contentType", function(){
		it("Is: text/xml", function(){
			var xmlDs = new luga.data.XmlDataSet({uuid: "myXmlDs"});
			expect(xmlDs.contentType).toEqual("text/xml");
		});
	});

	describe(".getPath()", function(){
		it("Returns the XPath expression to be used to extract data out of the XML", function(){
			var ds = new luga.data.XmlDataSet({uuid: "myDs", path: "test"});
			expect(ds.getPath()).toEqual("test");
		});
	});

	describe(".getRawXml()", function(){
		it("Returns the raw XML data", function(){
			noUrlDs.loadRecords({
				responseText: testRecordsStr
			});
			expect(noUrlDs.getRawXml()).toEqual(luga.data.xml.parseFromString(testRecordsStr));
		});
		it("Returns null if no data has been loaded yet", function(){
			expect(noUrlDs.getRawXml()).toBeNull();
		});
	});

	describe(".loadData()", function(){

		var peopleDs, peopleObserver;
		beforeEach(function(){

			jasmine.Ajax.install();
			jasmine.Ajax.stubRequest("mock/people.xml").andReturn({
				contentType: "xml",
				responseText: testRecordsStr,
				status: 200
			});
			jasmine.Ajax.stubRequest("mock/people.txt").andReturn({
				contentType: "text/plain",
				responseText: testRecordsStr,
				status: 200
			});

			peopleDs = new luga.data.XmlDataSet({
				uuid: "loadDataUniqueDs",
				url: "mock/people.xml",
				path: "//ladies/person"
			});

			var ObserverClass = function(){
				this.onDataChangedHandler = function(data){
				};
			};
			peopleObserver = new ObserverClass();
			peopleDs.addObserver(peopleObserver);
			spyOn(peopleObserver, "onDataChangedHandler");
		});

		afterEach(function(){
			jasmine.Ajax.uninstall();
		});

		describe("First:", function(){
			it("Populate .rawXml", function(){
				expect(peopleDs.rawXml).toBeNull();
				peopleDs.loadData();
				expect(peopleDs.rawXml).not.toBeNull();
			});
			it("Extract records out of the fetched XML data based on the current path", function(){
				peopleDs.loadData();
				expect(peopleDs.getRecordsCount()).toEqual(7);
			});
			it("Records are extracted even if the HTTP's Content-Type is not text/xml (as long as it contains an XML document)", function(){
				var txtDs = new luga.data.XmlDataSet({
					uuid: "uniqueDs",
					url: "mock/people.txt",
					path: "//ladies/person"
				});
				txtDs.loadData();
				expect(txtDs.getRecordsCount()).toEqual(7);
			});
			it("The nature and amount of records may vary depending on the path", function(){
				peopleDs.setPath("//jazzPlayers/person");
				peopleDs.loadData();
				expect(peopleDs.getRecordsCount()).toEqual(4);
			});
		});

		describe("Then:", function(){
			it("Triggers a 'dataChange' notification", function(){
				peopleDs.loadData();
				expect(peopleObserver.onDataChangedHandler).toHaveBeenCalledWith({dataSource: peopleDs});
			});
		});

		describe("If the path has no matches inside the XML data:", function(){
			it("No record will be added to the dataSet", function(){
				peopleDs.setPath("invalid");
				peopleDs.loadData();
				expect(peopleDs.getRecordsCount()).toEqual(0);
			});
			it("The 'dataChanged' event will not be triggered", function(){
				peopleDs.setPath("invalid");
				peopleDs.loadData();
				expect(peopleObserver.onDataChangedHandler).not.toHaveBeenCalledWith(peopleDs);
			});
		});


	});

	describe(".loadRawXml()", function(){

		describe("Given a string", function(){

			it("First calls .delete()", function(){
				spyOn(noUrlDs, "delete");
				noUrlDs.loadRawXml(testRecordsStr);
				expect(noUrlDs.delete).toHaveBeenCalled();
			});
			it("Then calls .loadRecords()", function(){
				spyOn(noUrlDs, "loadRecords");
				noUrlDs.loadRawXml(testRecordsStr);
				expect(noUrlDs.loadRecords).toHaveBeenCalledWith({
					responseText: testRecordsStr
				});
			});

		});

	});

	describe(".loadRecords()", function(){

		describe("Given an XHR response", function(){

			describe("First:", function(){

				it("Set the .rawXml property", function(){
					noUrlDs.loadRecords({responseText: testRecordsStr});
					expect(noUrlDs.rawXml).toEqual(luga.data.xml.parseFromString(testRecordsStr));
				});

			});

			describe("Then", function(){

				it("Calls luga.data.xml.evaluateXPath() to extract the nodes from the XML", function(){
					spyOn(luga.data.xml, "evaluateXPath").and.callThrough();
					noUrlDs.loadRecords({responseText: testRecordsStr});
					expect(luga.data.xml.evaluateXPath).toHaveBeenCalled();
				});

			});

			describe("Finally:", function(){

				it("Calls .insert(), passing the relevant data", function(){
					spyOn(noUrlDs, "insert");
					noUrlDs.loadRecords({responseText: testRecordsStr});
					expect(noUrlDs.insert).toHaveBeenCalled();
				});

			});

		});

	});

	describe(".setPath()", function(){
		it("Set the the XPath expression to be used to extract data out of the XML", function(){
			var ds = new luga.data.XmlDataSet({uuid: "myDs"});
			ds.setPath("test");
			expect(ds.getPath()).toEqual("test");
		});
	});

});