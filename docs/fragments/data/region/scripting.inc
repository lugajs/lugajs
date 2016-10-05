<div class="alert alert-info" role="alert">
	<strong>Heads up!</strong><br>
	On this page you can find some more advanced tips about working with regions.
	Familiarity with JavaScript and OOP is assumed.
</div>

<div class="panel panel-default">
	<div class="panel-heading">luga.data.region.getReferenceFromNode(node)</div>
	<div class="panel-body">
		<p>
			This static method requires a jQuery object wrapping an HTML node, returns the region object associated to
			it
			Returns undefined if the node is not associated to region.
		</p>

		<p>
			What you get is an istance of <a href="../src/luga.data.region.Base.js">luga.data.region.Base</a>.
			This way you can directly call its <strong>.render()</strong> or register as <a href="#common/notifier">observer</a>
			and listen to the <strong>regionRendered</strong> event.
		</p>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Create a region programmatically</div>
	<div class="panel-body">
		<p>
			The easier, most practical, way of creating a region is to do it in a declarative way,
			just use <a href="#data/region/getting-started">HTML with custom attributes</a>.
			Yet sometimes you may want to do it programmatically, directly invoking <a
				href="../src/luga.data.region.Handlebars.js">luga.data.region.Handlebars</a> constructor like:
		</p>

<pre><code class="language-javascript">var myRegion = new luga.data.region.Handlebars({
	node: jQuery("#myDiv"),
	dsUuid: "myDatasetUuid"
});
</code></pre>

		<p>
			From here you may directly call its <strong>.render()</strong> or register as <a
				href="#common/notifier">observer</a>
			and listen to the <strong>regionRendered</strong> event.
		</p>

		<div class="alert alert-warning" role="alert">
			<strong>Warning!</strong><br>
			Your region will automatically render the HTML only whenever the binded dataSource triggers a notification.
			If you create a region programmatically and your dataSource has already loaded its data,
			you will have to explicitly call the .render() method.
		</div>
	</div>
</div>

<div class="panel panel-default">
	<div id="constructor" class="panel-heading luga-docs-api-heading">luga.data.region.Handlebars(options)</div>
	<div class="panel-body">
		<p>
			Region's constructor. This class triggers a "regionRendered" notification.
		</p>
	</div>
	<table class="table table-bordered luga-docs-api">
		<th colspan="3">Arguments</th>
		<tr>
			<td>options.node</td>
			<td>
				{jquery}
			</td>
			<td>
				A jQuery object wrapping the node or the naked DOM object that will contain the region. Required.
			</td>
		</tr>
		<tr>
			<td>options.ds</td>
			<td class="luga-docs-type">
				{luga.data.DataSet|luga.data.DetailSet}
			</td>
			<td>
				DataSource. Required if dsUuid is not specified.
			</td>
		</tr>
		<tr>
			<td>options.dsUuid</td>
			<td>
				{string}
			</td>
			<td>
				DataSource's uuid. Can be specified inside the data-lugaregion-datasource attribute too. Required if ds
				is not specified.
			</td>
		</tr>
		<tr>
			<td>options.traits</td>
			<td class="luga-docs-type">
				{array.&lt;string&gt;}
			</td>
			<td>
				An array of function names that will be called every time the Region is rendered. Optional.
			</td>
		</tr>
		<tr>
			<td>options.templateId</td>
			<td>
				{string}
			</td>
			<td>
				Id of HTML element containing the template. Can be specified inside the data-lugaregion-template
				attribute too.
				If not available it assumes the node contains the template.
			</td>
		</tr>
	</table>
	<table class="table table-bordered luga-docs-api">
		<th>Examples</th>
	</table>

<pre><code class="language-javascript">var myRegion = new luga.data.region.Handlebars({
	node: jQuery("#myDiv"),
	dsUuid: "myDatasetUuid",
	traits: ["myFirstTrait", "anotherTrait"]
});
</code></pre>

</div>

<div class="panel panel-default">
	<div class="panel-heading luga-docs-api-heading">luga.data.region.initRegions(rootNode)</div>
	<div class="panel-body">
		Bootstrap any region contained within the given node.
		The library internally calls this as soon as the document load.
		You can invoke it in case the DOM as changed and new regions has been added to the document.
		If you have to bootstrap a single region, you better use luga.data.region.init(node) instead
	</div>
	<table class="table table-bordered luga-docs-api">
		<th colspan="3">Arguments</th>
		<tr>
			<td>rootNode</td>
			<td>
				{jquery}
			</td>
			<td>
				A jQuery object. Optional. If not specified it will default to jQuery("body")
			</td>
		</tr>

	</table>
</div>

<div class="panel panel-default">
	<div class="panel-heading luga-docs-api-heading">luga.data.region.init(node)</div>
	<div class="panel-body">
		Bootstrap the region contained within the given node.
		You can invoke it in case the DOM as changed and a new region has been added to the document.
		Can be very useful on single-page applications or other scenarios where the DOM is significantly altered at run-time
	</div>
	<table class="table table-bordered luga-docs-api">
		<th colspan="3">Arguments</th>
		<tr>
			<td>node</td>
			<td>
				{jquery}
			</td>
			<td>
				A jQuery object. Required
			</td>
		</tr>

	</table>
</div>

<div class="panel panel-default">
	<div class="panel-heading luga-docs-api-heading">luga.data.region.setup(options)</div>
	<div class="panel-body">
		<p>
			Allows to change default settings for regions.
			If called without arguments, return an object containing name/value pairs reflecting the current settings
		</p>
	</div>
	<table class="table table-bordered luga-docs-api">
		<th colspan="3">Arguments</th>
		<tr>
			<td>options.autoregister</td>
			<td>
				{boolean}
			</td>
			<td>
				By default the library calls luga.data.region.init() on jQuery(document).ready()
				to automatically bootstrap all the regions contained inside the current document.
				Set this to false if you prefer to have more flexibility and bootstrap the regions programmatically
			</td>
		</tr>
	</table>
	<table class="table table-bordered luga-docs-api">
		<th>Examples</th>
	</table>

<pre><code class="language-javascript">luga.data.region.setup({
	autoregister: false
});
</code></pre>

</div>