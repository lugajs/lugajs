if(typeof(luga) === "undefined"){
	throw("toMatchDuckType: Unable to find Luga");
}

(function(){
	"use strict";

	var newMatcher = {

		toMatchDuckType: function(util, customEqualityTesters){
			return {
				compare: function(actual, duckType, matchType){
					var result = {};
					if(duckType === undefined){
						result.message = "Please specify an instance of a duckType";
						return result;
					}
					if(luga.type(actual) !== luga.type(duckType)){
						result.message = "Type mismatch: " + luga.type(actual) + " vs " + luga.type(duckType);
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
								if(luga.type(duckProp) !== luga.type(actual[key])){
									result.message = "Type of: ." + key + " does not match. Supposed to be: " + luga.type(duckProp);
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

	jasmine.getEnv().beforeEach(function(){
		jasmine.getEnv().addMatchers(newMatcher);
	});

}());