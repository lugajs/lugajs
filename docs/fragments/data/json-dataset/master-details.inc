<script>
	(function(){
		"use strict";

		var master = new luga.data.JsonDataSet({
			uuid: "masterDs",
			path: "result",
			url: "https://heroes.stage.waylon.cloud/v1/search/character?offset=0&limit=10"
		});
		var details = new luga.data.ChildJsonDataSet({
			uuid: "detailDs",
			parentDataSet: master,
			url: "https://heroes.stage.waylon.cloud/v1/character/{uuid}"
		});

		jQuery(document).ready(function(){
			master.loadData();
		});

	}());
</script>

<script id="masterTemplate" type="text/x-handlebars-template">
	{{#if isStateLoading}}
	Loading master data...
	{{/if}}
	<ul class="luga-docs-list">
		{{#each entities}}
		<li>
			<a href="#" data-lugaregion-setrowid="{{lugaRowId}}"
			   data-lugaregion-select="luga-docs-selected">{{name}}</a>
		</li>
		{{/each}}
	</ul>
</script>
<script id="detailsTemplate" type="text/x-handlebars-template">
	{{#if isStateLoading}}
		Loading details data...
	{{/if}}
	{{#if isStateReady}}
		{{#each entities}}
		<img src="{{images_thumbnail}}">
		<ul class="luga-docs-list">
			<li>Name: {{name}}</li>
		</ul>
		<img height="200" width="200" src="{{thumbnail}}">
		<p>
			{{description}}
		</p>
		{{/each}}
	{{/if}}
</script>

<div class="panel panel-default">
	<div class="panel-heading">Master-details with two HTTP calls</div>
	<div class="panel-body">

		<div role="alert" class="alert alert-warning">
			<strong>Warning!</strong><br>
			If your REST endpoint returns all the required info for your master-details within one HTTP request,
			you better use a <a href="#data/detailset/master-details">DetailSet</a>.
		</div>

		<p>
			In a typical master-details scenario you retrieve a collection of data for the master dataSet,
			then you call a different URL to retrieve the details belonging to a specific record.
		</p>

		<p>
			For such scenarios you should use a ChildJsonDataSet.
			This is a special kind of dataSet that is binded to a parent dataSet and change its URL on the fly,
			depending on its parent currentRow.
			In order to being able to do so, the URL is expressed as a string template.
		</p>

		<p>
			You should pay attention to ChildJsonDataSet signature:
		<ul class="luga-docs-list">
			<li>
				A <strong>parentDataSet</strong> parameter is required
			</li>
			<li>
				The <strong>url</strong> parameter is a string template, binded to the master currentRow
			</li>
		</ul>
		</p>

<pre><code class="line-numbers language-javascript">(function(){
	"use strict";
	var master = new luga.data.JsonDataSet({
		uuid: "masterDs",
		path: "result",
		url: "https://heroes.stage.waylon.cloud/v1/search/character?offset=0&limit=10"
	});
	var details = new luga.data.ChildJsonDataSet({
		uuid: "detailDs",
		parentDataSet: master,
		url: "https://heroes.stage.waylon.cloud/v1/character/{uuid}"

	});

	jQuery(document).ready(function(){
		master.loadData();
	});
}());
</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div id="master" class="panel-heading">Master-details in action</div>
	<div class="panel-body">

		<div class="col-xs-6 col-sm-6" data-lugaregion="true"
			 data-lugaregion-datasource-uuid="masterDs"
			 data-lugaregion-template-id="masterTemplate"></div>

		<div class="col-xs-6 col-sm-6" data-lugaregion="true"
			 data-lugaregion-datasource-uuid="detailDs"
			 data-lugaregion-template-id="detailsTemplate"></div>

	</div>

</div>