if(location.protocol === "file:"){
	alert("Large parts of the documentation will not be visible if you try to access it directly from the file system. Please use a web server instead");
}

luga.namespace("luga.docs");

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