<!-- Page-specific -->
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>

<script>

	/**
	 * Turn an <input> field into a jQuery UI Datepicker
	 * @param {luga.data.region.traits.options} options
	 */
	function datePickerTrait(options){
		var SELECTOR = "input[data-trait-datepicker='true']";
		// Use .find() to only select elements contained inside the region, not outside
		options.node.find(SELECTOR).each(function(index, item){
			var $item = jQuery(item);
			var dateObj = new Date($item.val());
			$item.datepicker();
			$item.datepicker("setDate", dateObj);
		});
	}
	;

	(function(){
		"use strict";

		var ladies = new luga.data.JsonDataSet({
			uuid: "ladiesDs",
			url: "../test/fixtures/data/ladies.json"
		});

		jQuery(document).ready(function(){
			// Fetch JSON data
			ladies.loadData();
		});
	}());
</script>

<script id="ladiesTemplate" type="text/x-handlebars-template">
	<table class="table table-bordered table-striped">
		<th>
			Name
		</th>
		<th>
			Birth date
		</th>
		{{#each entities}}
		<tr>
			<td>{{firstName}} {{lastName}}</td>
			<td>
				<input type="text" value="{{birthDate}}" data-trait-datepicker="true">
			</td>
		</tr>
		{{/each}}
	</table>
</script>

<div class="panel panel-default">
	<div class="panel-heading">Writing custom traits</div>
	<div class="panel-body">
		<p>
			You can write your own, custom <a href="#data/region/traits">trait.</a>
			A trait is essentially just a function with a specific signature.
			It gets invoked with a single options arguments, containing two keys:
		<ul class="luga-docs-list">
			<li>
				<strong>node</strong>: a jQuery object wrapping the Region's node.
			</li>
			<li>
				<strong>dataSource</strong>: either a dataSet or a detailSet.
			</li>
		</ul>
		The function is invoked every time a region render, generating its HTML.
		</p>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">The JavaScript code</div>
	<div class="panel-body">
		<p>
			For this example we are going to write a custom trait to turn an &lt;input&gt; tag
			into a <a href="http://api.jqueryui.com/datepicker/">jQuery Datepicker</a>.
		</p>

<pre><code class="language-javascript">/**
	* Turn an &lt;input&gt; field into a jQuery UI Datepicker
	* @param {luga.data.region.traits.options} options
*/
function datePickerTrait(options){
	var SELECTOR = "input[data-trait-datepicker='true']";
	// Use .find() to only select elements contained inside the region, not outside
	options.node.find(SELECTOR).each(function(index, item){
		var $item = jQuery(item);
		var dateObj = new Date($item.val());
		$item.datepicker();
		$item.datepicker("setDate", dateObj);
	});
};
</code></pre>

		<p>
			The code looks inside the region, for elements that match the "input[data-trait-datepicker='true']"
			selector.
			For each of them, if any, initialize the a datepicker.
		</p>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Custom trait in action</div>
	<div class="panel-body">
		<p>
			Your region code is going to look like this,
			with the <strong> data-lugaregion-traits</strong> attribute containing a comma-delimited list of function
			names:
		</p>
				
<pre><code class="language-markup">&lt;div id="ladiesRegion"
	data-lugaregion="true"
	data-lugaregion-datasource-uuid="ladiesDs"
	data-lugaregion-template-id="ladiesTemplate"
	data-lugaregion-traits="datePickerTrait"&gt;&lt;/div&gt;
</code></pre>

		<div id="ladiesRegion"
			 data-lugaregion="true"
			 data-lugaregion-datasource-uuid="ladiesDs"
			 data-lugaregion-template-id="ladiesTemplate"
			 data-lugaregion-traits="datePickerTrait"></div>

		<div class="alert alert-info" role="alert">
			<strong>Heads up!</strong><br>
			You can achieve the same results writing an object that initialize the datepickers and register itself as
			observer of the <a href="../region/scripting.htm">region</a>.
			Pick the solutions that better fits your needs.
			A trait is easier to reuse, a region observer instead gives you more control.
		</div>

	</div>

</div>