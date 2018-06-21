(function(){
	"use strict";

	luga.namespace("luga.data.sort");

	/**
	 * @typedef {String} luga.data.sort.ORDER
	 * @enum {String}
	 */
	luga.data.sort.ORDER = {
		ASC: "ascending",
		DESC: "descending",
		TOG: "toggle"
	};

	const CONST = {
		ERROR_MESSAGES: {
			UNSUPPORTED_DATA_TYPE: "luga.data.sort. Unsupported dataType: {0",
			UNSUPPORTED_SORT_ORDER: "luga.data.sort. Unsupported sortOrder: {0}"
		}
	};

	/**
	 * Return true if the passed order is supported
	 * @param {string}  sortOrder
	 * @return {boolean}
	 */
	luga.data.sort.isValidSortOrder = function(sortOrder){
		for(let key in luga.data.sort.ORDER){
			if(luga.data.sort.ORDER[key] === sortOrder){
				return true;
			}
		}
		return false;
	};

	/**
	 * Retrieve the relevant sort function matching the given combination of dataType and sortOrder
	 * @param {string}               dataType
	 * @param {luga.data.sort.ORDER} sortOrder
	 * @return {Function}
	 */
	luga.data.sort.getSortStrategy = function(dataType, sortOrder){
		if(luga.data.sort[dataType] === undefined){
			throw(luga.string.format(CONST.ERROR_MESSAGES.UNSUPPORTED_DATA_TYPE, [dataType]));
		}
		if(luga.data.sort[dataType][sortOrder] === undefined){
			throw(luga.string.format(CONST.ERROR_MESSAGES.UNSUPPORTED_SORT_ORDER, [sortOrder]));
		}
		return luga.data.sort[dataType][sortOrder];
	};

	/*
	 Lovingly adapted from Spry
	 Very special thanks to Kin Blas https://github.com/jblas
	 */

	luga.namespace("luga.data.sort.date");

	luga.data.sort.date.ascending = function(prop){
		return function(a, b){
			let dA = luga.lookupProperty(a, prop);
			let dB = luga.lookupProperty(b, prop);
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dA - dB;
		};
	};

	luga.data.sort.date.descending = function(prop){
		return function(a, b){
			let dA = luga.lookupProperty(a, prop);
			let dB = luga.lookupProperty(b, prop);
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dB - dA;
		};
	};

	luga.namespace("luga.data.sort.number");

	luga.data.sort.number.ascending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? 1 : -1);
			}
			return a - b;
		};
	};

	luga.data.sort.number.descending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? -1 : 1);
			}
			return b - a;
		};
	};

	luga.namespace("luga.data.sort.string");

	luga.data.sort.string.ascending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? 1 : -1);
			}
			const tA = a.toString();
			const tB = b.toString();
			const tAlower = tA.toLowerCase();
			const tBlower = tB.toLowerCase();
			const minLen = tA.length > tB.length ? tB.length : tA.length;

			for(let i = 0; i < minLen; i++){
				const aLowerChar = tAlower.charAt(i);
				const bLowerChar = tBlower.charAt(i);
				const aChar = tA.charAt(i);
				const bChar = tB.charAt(i);
				if(aLowerChar > bLowerChar){
					return 1;
				}
				else if(aLowerChar < bLowerChar){
					return -1;
				}
				else if(aChar > bChar){
					return 1;
				}
				else if(aChar < bChar){
					return -1;
				}
			}
			if(tA.length === tB.length){
				return 0;
			}
			else if(tA.length > tB.length){
				return 1;
			}
			return -1;
		};
	};

	luga.data.sort.string.descending = function(prop){
		return function(a, b){
			a = luga.lookupProperty(a, prop);
			b = luga.lookupProperty(b, prop);
			if(a === undefined || b === undefined){
				return (a === b) ? 0 : (a ? -1 : 1);
			}
			const tA = a.toString();
			const tB = b.toString();
			const tAlower = tA.toLowerCase();
			const tBlower = tB.toLowerCase();
			const minLen = tA.length > tB.length ? tB.length : tA.length;
			for(let i = 0; i < minLen; i++){
				const aLowerChar = tAlower.charAt(i);
				const bLowerChar = tBlower.charAt(i);
				const aChar = tA.charAt(i);
				const bChar = tB.charAt(i);
				if(aLowerChar > bLowerChar){
					return -1;
				}
				else if(aLowerChar < bLowerChar){
					return 1;
				}
				else if(aChar > bChar){
					return -1;
				}
				else if(aChar < bChar){
					return 1;
				}
			}
			if(tA.length === tB.length){
				return 0;
			}
			else if(tA.length > tB.length){
				return -1;
			}
			return 1;
		};
	};

}());