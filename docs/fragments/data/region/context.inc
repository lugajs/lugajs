<script>
	(function(){
		"use strict";
		var ladiesDs = new luga.data.JsonDataSet({
			uuid: "ladiesDs",
			url: "../test/fixtures/data/people.json",
			path: "ladies"
		});
		jQuery(document).ready(function(){
			ladiesDs.loadData();
		});
	}());
</script>

</head>

<div class="panel panel-default">
	<div class="panel-heading">The context object</div>
	<div class="panel-body">
		<p>
			Every time a dataSource (either a dataSet or a detailSet) notify a region about changes inside its data or
			state, it send along a <strong>context</strong> object.
			All the data stored inside this object can be referred from a template.
		</p>

		<div class="alert alert-info" role="alert">
			<strong>Heads up!</strong><br>
			In the case of a dataSet the context contains an <strong>entities</strong> property, this is an array of
			objects and it can be empty in case the dataSet has no records.<br>
			For a detailSet instead, it contains an <strong>entity</strong> property that can be either an object of
			name/value pairs or null.
		</div>
		<p>
			The context object also contains some additional properties, metadata that reflect the dataSource current
			state:
		</p>
		<table class="table table-bordered luga-docs-api">
			<th colspan="3">Context properties</th>
			<tr>
				<td>recordCount</td>
				<td>
					{number}
				</td>
				<td>
					The amount of records currently stored inside the dataSet (not available for detailSet)
				</td>
			</tr>
			<tr>
				<td>state</td>
				<td>
					{string}
				</td>
				<td>
					Current dataSource state, expressed as a string
				</td>
			</tr>
			<tr>
				<td>isStateLoading</td>
				<td>
					{boolean}
				</td>
				<td>
					True if the dataSource is currently loading data
				</td>
			</tr>
			<tr>
				<td>isStateError</td>
				<td>
					{boolean}
				</td>
				<td>
					True if the dataSource encountered an error during an XHR request
				</td>
			</tr>
			<tr>
				<td>isStateReady</td>
				<td>
					{boolean}
				</td>
				<td>
					True if the dataSource is ready to be used
				</td>
			</tr>
		</table>

		<p>
			All these properties can be used inside a region's template.
			Information about state can be especially useful for <a href="#data/region/state">displaying different content
			depending on the datasource state</a>.
		</p>

		<p>
			<a href="#data/extensibility/custom-dataset">Custom dataSets</a> may add their own metadata or return a
			customized context
		</p>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Context properties in action</div>
	<div class="panel-body">

		<p>
			This sample region demonstrates the properties available inside a dataSet's context.
		</p>

<pre><code class="line-numbers language-markup">&lt;div data-lugaregion="true"
	data-lugaregion-datasource-uuid="ladiesDs"&gt;

	&lt;ul&gt;
		&lt;li&gt;recordCount: {{recordCount}}&lt;/li&gt;
		&lt;li&gt;state: {{state}}&lt;/li&gt;
		&lt;li&gt;isStateLoading: {{isStateLoading}}&lt;/li&gt;
		&lt;li&gt;isStateError: {{isStateError}}&lt;/li&gt;
		&lt;li&gt;isStateReady: {{isStateReady}}&lt;/li&gt;
	&lt;/ul&gt;

	&lt;ul&gt;
		{{#each entities}}
			&lt;li&gt;{{firstName}} {{lastName}}&lt;/li&gt;
		{{/each}}
	&lt;/ul&gt;

&lt;/div&gt;</code></pre>

		<div data-lugaregion="true" data-lugaregion-datasource-uuid="ladiesDs">

			<ul class="luga-docs-list">
				<li>recordCount: {{recordCount}}</li>
				<li>state: {{state}}</li>
				<li>isStateLoading: {{isStateLoading}}</li>
				<li>isStateError: {{isStateError}}</li>
				<li>isStateReady: {{isStateReady}}</li>
			</ul>

			<ul class="luga-docs-list">
				{{#each entities}}
					<li>{{firstName}} {{lastName}}</li>
				{{/each}}
			</ul>

		</div>

	</div>
</div>