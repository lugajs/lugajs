describe("luga.data.JsonDataset", function(){

	beforeEach(function(){

		testDs = new luga.data.JsonDataSet({id: "jsonDs", url: "fixtures/data/ladies.json"});
		DEFAULT_TIMEOUT = 2000;

		var ObserverClass = function(){
			this.onDataChangedHandler = function(data){
			};
			this.onCurrentRowChangedHandler = function(data){
			};
			this.onLoadingHandler = function(data){
			};
		};
		testObserver = new ObserverClass();
		testDs.addObserver(testObserver);
		spyOn(testObserver, "onDataChangedHandler");
		spyOn(testObserver, "onCurrentRowChangedHandler");
		spyOn(testObserver, "onLoadingHandler");
	});

	it("Extends luga.data.HttpDataSet", function(){
		expect(jQuery.isFunction(testDs.loadData)).toBeTruthy();
	});

	it("Is the JSON dataset class", function(){
		expect(jQuery.isFunction(luga.data.JsonDataSet)).toBeTruthy();
	});

	describe(".loadData()", function() {

		it("Triggers the loading of records from an URL containing JSON data", function(done) {
			testDs.loadData();
			expect(testObserver.onLoadingHandler).toHaveBeenCalledWith(testDs);
			setTimeout(function() {
				expect(testDs.getRecordsCount()).toEqual(7);
				expect(testObserver.onDataChangedHandler).toHaveBeenCalledWith(testDs);
				done();
			}, DEFAULT_TIMEOUT);
		});
	});

});