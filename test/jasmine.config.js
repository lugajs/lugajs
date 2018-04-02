jasmine.getEnv().randomizeTests(false);

window.isIE = function(){
	"use strict";
	return /Trident\/|MSIE/.test(window.navigator.userAgent);
};