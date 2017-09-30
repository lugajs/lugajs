<script>
	(function(){
		"use strict";

		var BASE_URL = "https://heroes.stage.waylon.cloud/v1/search/character";
		var master = new luga.data.JsonDataSet({
			uuid: "masterDs",
			url: BASE_URL + "/?offset=0&limit=200",
			path: "result",
			timeout: 20000,
			incrementalLoad: true
		});

		new luga.data.widgets.ShowMoreScrolling({
			dataSet: master,
			url: BASE_URL + "/?offset={lastOffset}&limit=200"
		});

		jQuery(document).ready(function(){
			master.loadData();
		});

	}());
</script>

<script id="masterTemplate" type="text/x-handlebars-template">
	Record count: <span class="badge">{{recordCount}}</span>
	<ul class="luga-docs-list">
		{{#each entities}}
		<li>
			{{name}}
		</li>
		{{/each}}
	</ul>
	{{#if isStateLoading}}
	<span class="alert-info">Loading more...</span>
	{{/if}}
</script>

<div class="panel panel-default">
	<div id="master" class="panel-heading">Infinite scrolling</div>
	<div class="panel-body">

		<p>
			So you want to implement an <a href="https://www.smashingmagazine.com/2013/05/infinite-scrolling-lets-get-to-the-bottom-of-this/">infinite
			scrolling</a> GUI,
			fetching just a bunch of records at time?
			The ShowMoreScrolling widget offers that capability and you can see it in action here (fetching 200 records
			at time).
		</p>

		<p>
			There are a few things worth noting in the JavaScript code:
		</p>

		<ul class="luga-docs-list">
			<li>
				Line 7. We use a querystring parameter to tell the REST endpoint to retrieve 200 records at time.
				The syntax will vary depending on the REST API you use.
			</li>
			<li>
				Line 9. We increment the <strong>timeout</strong> to 20 seconds, compared to the default 10. Just to be
				safe.
			</li>
			<li>
				Line 10. We set the <strong>incrementalLoad</strong> parameter to true.
				This means that every time we call .loadData() the results will be added to the ones already fetched.
			</li>
			<li>
				Line 15. The <strong>url</strong> parameter is a string template, containing one or more placeholders.
				Our REST endpoint requires a <strong>startKey</strong> parameter inside the querystring.
				This parameter must change at run time.
				The value of this parameter is returned by the server, each time we fetch data, and is stored inside the
				JSON.
			</li>
		</ul>

<pre><code class="line-numbers language-javascript">(function(){
	"use strict";

	var BASE_URL = "https://heroes.stage.waylon.cloud/v1/search/character";
	var master = new luga.data.JsonDataSet({
		uuid: "masterDs",
		url: BASE_URL + "/?offset=0&limit=200",
		path: "result",
		timeout: 20000,
		incrementalLoad: true
	});

	new luga.data.widgets.ShowMoreScrolling({
		dataSet: master,
		url: BASE_URL + "/?offset={lastOffset}&limit=200"
	});

	jQuery(document).ready(function(){
		master.loadData();
	});

}());
</code></pre>
		<p>
			If you need infinite scrolling inside a specific HTML element, not the whole page,
			just pass an <a href="#data/json-dataset/showmore-scrolling-div">additional parameter</a>
		</p>

		<div role="alert" class="alert alert-warning">
			<strong>Warning!</strong><br>
			This widget may not work as expected on some old touch devices.
		</div>

	</div>

</div>

<div class="panel panel-default">
	<div class="panel-heading">In action</div>
	<div class="panel-body">

		<div id="characters" class="col-xs-6 col-sm-6" data-lugaregion="true"
			 data-lugaregion-datasource-uuid="masterDs"
			 data-lugaregion-template-id="masterTemplate"></div>

	</div>

</div>