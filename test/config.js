jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
jasmine.getFixtures().fixturesPath = "fixtures";
jasmine.getJSONFixtures().fixturesPath = "fixtures";

var lugaMatchers = {

	toMatchDuckType: function(util, customEqualityTesters){
		"use strict";
		return {
			compare: function(actual, duckType, matchType){
				var result = {};
				if(duckType === undefined){
					result.message = "Please specify an instance of a duckType";
					return result;
				}
				if(duckType === undefined){
					// By default we check for type
					matchType = true;
				}
				for(var key in duckType){
					var duckProp = duckType[key];
					if(actual.hasOwnProperty(key)){
						if(matchType === false){
							if(jQuery.type(duckProp) !== jQuery.type(actual[key])){
								result.message = "Type of: ." + key + " does not match. Supposed to be: " + jQuery.type(duckProp);
								return result;
							}
						}
					}
					else{
						result.message = "The following duck property is missing: ." + key;
						return result;
					}
				}

				result.pass = true;
				return result;
			}
		};
	}
};

beforeEach(function(){
	jasmine.addMatchers(lugaMatchers);
});