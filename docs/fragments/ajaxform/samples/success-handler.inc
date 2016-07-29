<script>
	//<![CDATA[
	handlers = {};
	handlers.displayBox = function(msg, formNode, textStatus, jqXHR){
		// Get the message out of the JSON returned by the server
		var serverMsg = jqXHR.responseJSON.message;
		// Display the message in a box above the form
		luga.utils.displayBox(formNode, serverMsg);
	};
	//]]>
</script>

<div class="panel panel-default">
	<div class="panel-heading">Success handler</div>
	<div class="panel-body">
		<p>
			By default Ajaxform uses luga.ajaxform.handlers.replaceForm as success handler.
			It replaces the form either with a standard message or the content of the data-lugajax-successmsg custom
			attribute
		</p>

<pre><code class="language-markup">&lt;form action="ajaxform-action.json" data-lugajax-form="true"
	data-lugajax-successmsg="Your error message here"&gt;
	&lt;input type="text" name="name" /&gt;
	&lt;input type="submit" value="Submit"/&gt;
&lt;/form&gt;</code></pre>

	</div>
</div>
<div class="panel panel-default">
	<div class="panel-heading">Default success handler</div>
	<div class="panel-body">
		<form action="ajaxform-action.json" data-lugajax-form="true"
			  data-lugajax-successmsg="The form is replaced with the value of successmsg">
			<div class="form-group">
				<input type="text" class="form-control" name="name"/>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Custom success handler</div>
	<div class="panel-body">
		<p>
			You can write your own success handler and use it instead
		</p>

<pre><code class="language-javascript">handlers = {};
	handlers.displayBox = function(msg, formNode, textStatus, jqXHR){
	// Get the message out of the JSON returned by the server
	var serverMsg = jqXHR.responseJSON.message;
	// Display the message in a box above the form
	luga.utils.displayBox(formNode, serverMsg);
};</code></pre>

<pre><code class="language-markup">&lt;form action="ajaxform-action.json" data-lugajax-form="true"
	data-lugajax-success="handlers.displayBox"&gt;
	&lt;input type="text" name="name"/&gt;
	&lt;input type="submit" value="Submit"/&gt;
&lt;/form&gt;</code></pre>

	</div>
</div>
<div class="panel panel-default">
	<div class="panel-heading">Custom handler</div>
	<div class="panel-body">
		<form action="ajaxform-action.json" data-lugajax-form="true" data-lugajax-success="handlers.displayBox">
			<div class="form-group">
				<input type="text" class="form-control" name="name"/>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Handler's signature</div>
	<div class="panel-body">
		The handler will be invoked with four arguments
	</div>
	<table class="table table-bordered luga-docs-api">
		<th colspan="3">Arguments</th>
		<tr>
			<td>msg</td>
			<td>
				{string}
			</td>
			<td>
				Value of the data-lugajax-errormsg attribute
			</td>
		</tr>
		<tr>
			<td>formNode</td>
			<td>
				{jquery}
			</td>
			<td>
				jQuery object wrapping the form
			</td>
		</tr>
		<tr>
			<td>textStatus</td>
			<td>
				{string}
			</td>
			<td>
				HTTP status
			</td>
		</tr>
		<tr>
			<td>jqXHR</td>
			<td>
				{object}
			</td>
			<td>
				jQuery wrapper around XMLHttpRequest
			</td>
		</tr>
	</table>

</div>