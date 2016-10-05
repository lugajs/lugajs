<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>
<script>
	luga.namespace("test");
	test.ladiesMaster = new luga.data.JsonDataSet({
		uuid: "ladies",
		url: "../test/fixtures/data/people.json",
		path: "ladies"
	});
	test.ladyDetails = new luga.data.DetailSet({uuid: "lady", parentDataSet: test.ladiesMaster});
	jQuery(document).ready(function(){
		test.ladiesMaster.loadData();
	});

	var customRegion = function(options){
		luga.extend(luga.data.region.Base, this, [options]);

		/** @override */
		this.render = function(){
			var records = this.dataSource.getContext().entities;
			var htmlStr = "<ul  class='luga-docs-list'>";
			for(var i = 0; i < records.length; i++){
				var item = records[i];
				htmlStr += "<li>";
				htmlStr += "<a href='javascript:;' onclick='test.ladiesMaster.setCurrentRowId(\"" + item.lugaRowId + "\")'>";
				htmlStr += item.lastName;
				htmlStr += "</a></li>";
			}
			htmlStr += "</ul>";
			this.config.node.html(htmlStr);
		};
	};
	/**
	 * This simplified implementation of a custom region handler should not be considered production-ready
	 * @extends luga.data.region.Base
	 */
	var underscoreTemplate = function(options){
		luga.extend(luga.data.region.Base, this, [options]);

		// Underscore specific part
		var templateId = this.config.templateId;
		var templateStr = jQuery("#" + templateId).html();
		var compiledTemplate = _.template(templateStr);

		/** @override */
		this.render = function(){
			var context = this.dataSource.getContext();
			// DetailSet
			if((context.entity !== undefined) && (context.entity !== null)){
				this.config.node.html(compiledTemplate(context.entity));
			}
			// DataSet
			if(context.entities !== undefined){
				this.config.node.html(compiledTemplate(context.entities));
			}
		};

	};

</script>

<script id="detailsTemplate" type="text/x-underscore-template">
	<ul>
		<li>Firstname: <%= firstName %></li>
		<li>Lastname: <%= lastName %></li>
		<li>Country: <%= country %></li>
	</ul>
</script>

<div class="panel panel-default">
	<div class="panel-heading">Custom regions and templating</div>
	<div class="panel-body">
		<p>
			You can fully customize the way a region is rendered, either using a different templating engine or not
			using templating at all.
		</p>

		<p>
			Add the data-lugaregion-type attribute with a value that matches an existing JavaScript
			constructor function:
		</p>
<pre><code class="language-markup">&lt;div data-lugaregion="true"
	data-lugaregion-datasource-uuid="lady"
	data-lugaregion-template-id="detailsTemplate"
	data-lugaregion-type="underscoreTemplate"&gt;&lt/div&gt;</code></pre>
		<p>
			The constructor should extend the luga.data.region.Base class and override its render() method:
		</p>

<pre><code class="line-numbers language-javascript">/**
	* This simplified implementation of a custom region handler should not be considered production-ready
	* @extends luga.data.region.Base
*/
var underscoreTemplate = function(options){
	luga.extend(luga.data.region.Base, this, [options]);

	// Underscore specific part
	var templateId = this.config.templateId;
	var templateStr = jQuery("#" + templateId).html();
	var compiledTemplate = _.template(templateStr);

	/** @override */
	this.render = function(){
		var context = this.dataSource.getContext();
		// DetailSet
		if((context.entity !== undefined) && (context.entity !== null)){
			this.config.node.html(compiledTemplate(context.entity));
		}
		// DataSet
		if(context.entities !== undefined){
			this.config.node.html(compiledTemplate(context.entities));
		}
	};

};</code></pre>

		<p>
			For default rendering, using Handlebars as template engine, there is no need to specify the
			data-lugaregion-type attribute, since luga.data.Region is used by default.
		</p>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Master (with no templating)</div>
	<div class="panel-body">
		<div data-lugaregion="true" data-lugaregion-datasource-uuid="ladies"
			 data-lugaregion-type="customRegion"></div>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Details (with Underscore JS template)</div>
	<div class="panel-body">
		<div data-lugaregion="true" data-lugaregion-datasource-uuid="lady"
			 data-lugaregion-template-id="detailsTemplate"
			 data-lugaregion-type="underscoreTemplate"></div>
	</div>
</div>