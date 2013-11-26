luga.namespace("luga.docs");

luga.docs.FILE_MESSAGE = "Large parts of the documentation will not be visible if you try to access it directly from the file system. </br>";
luga.docs.FILE_MESSAGE += "Please use a web server or visit the <a href='http://www.massimocorner.com/lugajs/docs/index.htm'>online documentation</a> instead";

jQuery(document).ready(function () {
	if(location.protocol === "file:"){
		luga.utils.displayErrorMessage(jQuery("section")[0], luga.docs.FILE_MESSAGE);
	}
});

luga.docs.initMainNav = function(rootNode, url, response){
	jQuery("a", rootNode).each(function(index, item){
		if((index > 0) && luga.docs.belongsToCurrentSection(jQuery(item).attr("href"))){
			jQuery(item).addClass("current");
		}
	});
};

luga.docs.belongsToCurrentSection = function(href){
	var tokens = href.split("/");
	var section = tokens[2];
	return location.href.indexOf(section) > 0;
};

