if(self.location.protocol === "file:"){
	alert("The documentation is not going to work properly if accessed froma  file system. You should use a webserver instead.");
}

luga.namespace("luga.docs");

luga.docs.initMainNav = function(rootNode, url, response){
	jQuery("a", rootNode).each(function(index, item){
		if((index > 0) && luga.docs.belongsToCurrentSection(jQuery(item).attr("href"))){
			jQuery(item).parent().addClass("current");
		}
	});
};

luga.docs.belongsToCurrentSection = function(href){
	var tokens = href.split("/");
	var section = tokens[2];
	return location.href.indexOf(section) > 0;
};

luga.docs.initLocalNav = function(rootNode, url, response){
	jQuery("a", rootNode).each(function(index, item){
		if(luga.docs.isCurrentPage(jQuery(item).attr("href"))){
			jQuery(item).parent().addClass("current");
		}
	});
};

luga.docs.isCurrentPage = function(href){
	var tokens = href.split("/");
	var destination = tokens[tokens.length -2] + "/" + tokens[tokens.length -1];
	return location.href.indexOf(destination) > 0;
};

