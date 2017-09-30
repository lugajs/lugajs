	<script>
		(function(){
			"use strict";

			var dateFormatter = function(row, rowIndex, dataSet){
				var dateObj = new Date(row.birthDate);
				// Turn date into a reasonable string rapresentation
				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toUTCString
				var dateStr = dateObj.toUTCString();
				var trimmedStr = dateStr.substring(0, dateStr.length -12);
				row.birthDateFormatted = trimmedStr;
				return row;
			};

			var ladies = new luga.data.JsonDataSet({
				uuid: "ladiesDs",
				url: "../test/fixtures/data/ladies.json",
				formatter: dateFormatter
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
				Birth date (original)
			</th>
			<th>
				Birth date (formatted)
			</th>
			{{#each entities}}
			<tr>
				<td>{{firstName}} {{lastName}}</td>
				<td>{{birthDate}}</td>
				<td>{{birthDateFormatted}}</td>
			</tr>
			{{/each}}
		</table>
	</script>

		<div class="panel panel-default">
			<div class="panel-heading">Using a formatter functions</div>
			<div class="panel-body">
				<p>
					A dataSet can use a function to format its data.
					The formatter must be passed to the <a href="#data/dataset/api">constructor</a>,
					unlike a filter, you can't apply it on the fly.
				</p>
				<p>
					The formatter is called once for each row in the dataSet.
					The formatter can alter rows, add or manipulate fields, then it must return the row object passed into the function.
				</p>
			</div>
		</div>

		<div class="panel panel-default">
			<div class="panel-heading">Use formatter to add calculated fields</div>
			<div class="panel-body">
				<p>
					Sometimes you have data that is not suited for a GUI.
					A typical case is a date in YYYY-MM-DD format, not the most human-readable format.
					So you want to modify it. The safer approach is to store a formatted copy inside another field.
					A formatter is the perfect solution for such a job.
				</p>
				<p>
					This approach may help whenever you have to <a href="#data/dataset/sort">sort your data</a> too.
				</p>

				<div id="ladiesRegion"
					 data-lugaregion="true"
					 data-lugaregion-datasource-uuid="ladiesDs"
					 data-lugaregion-template-id="ladiesTemplate"></div>

				<p>
					Just pass the formatter to the constructor.
					The formatter is called once for each row in the dataSet, with this signature: myFilter(row, rowIndex, dataSet):
				</p>

<pre><code class="line-numbers language-javascript">var dateFormatter = function(row, rowIndex, dataSet){
	var dateObj = new Date(row.birthDate);
	// Turn date into a reasonable string rapresentation
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toUTCString
	var dateStr = dateObj.toUTCString();
	var trimmedStr = dateStr.substring(0, dateStr.length -12);
	row.birthDateFormatted = trimmedStr;
	return row;
};

var ladies = new luga.data.JsonDataSet({
	uuid: "ladiesDs",
	url: "../test/fixtures/data/ladies.json",
	formatter: dateFormatter
});
</code></pre>
				
				<p>
					The template can use the "birthDateFormatted" field added by the formatter:
				</p>
				
<pre><code class="line-numbers language-markup">&lt;table class="table table-bordered table-striped"&gt;
	&lt;th&gt;
		Name
	&lt;/th&gt;
	&lt;th&gt;
		Birth date (original)
	&lt;/th&gt;
	&lt;th&gt;
		Birth date (formatted)
	&lt;/th&gt;
	{{#each entities}}
	&lt;tr&gt;
		&lt;td&gt;{{firstName}} {{lastName}}&lt;/td&gt;
		&lt;td&gt;{{birthDate}}&lt;/td&gt;
		&lt;td&gt;{{birthDateFormatted}}&lt;/td&gt;
	&lt;/tr&gt;
	{{/each}}
&lt;/table&gt;
</code></pre>				

			</div>
		</div>