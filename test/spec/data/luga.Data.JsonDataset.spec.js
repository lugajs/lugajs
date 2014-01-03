describe("luga.data.JsonDataset", function(){

	beforeEach(function(){

		testDs = new luga.data.JsonDataSet({id: "jsonDs", url: "fixtures/data/ladies.json"});
		DEFAULT_TIMEOUT = 2000;

	});

	it("Extends luga.data.HttpDataSet", function(){
		expect(jQuery.isFunction(testDs.loadData)).toBeTruthy();
	});

	it("Is the JSON dataset class", function(){
		expect(jQuery.isFunction(luga.data.JsonDataSet)).toBeTruthy();
	});

	describe("Its constructor options are the same as luga.data.HttpDataSet and may also contains:", function(){
		it("A path (options.path)", function(){
			var ds = new luga.data.JsonDataSet({id: "myDs", path: "myPath"});
			expect(ds.path).toEqual("myPath");
		});

	});

});