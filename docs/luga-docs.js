luga.namespace("luga.docs");

luga.docs.initMainNav = function(rootNode, url, response){
	jQuery("a", rootNode).each(function(index, item){
		if((index > 0) && luga.docs.belongsToCurrentSection(jQuery(item).attr("href"))){
			jQuery(item).parent().addClass("active");
		}
	});
};

luga.docs.belongsToCurrentSection = function(href){
	var tokens = href.split("/");
	var section = tokens[2];
	return location.href.indexOf(section) > 0;
};

