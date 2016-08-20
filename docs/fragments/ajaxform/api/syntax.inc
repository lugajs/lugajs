<div class="panel panel-default">
	<div class="panel-heading">API Syntax reference</div>
	<div class="panel-body">
		<p>
			While Luga Ajaxform makes it very easy to handle forms in a declarative way, you can use it programmatically
			too.
			First you can create a new instance of luga.ajaxform.Sender, then you call its send() or sendJson() method.
			See <a href="#ajaxform/api/samples">samples</a>
		</p>

		<p>
			It's important to note that each and every options available as <a href="#ajaxform/syntax">custom
			attribute</a> can be passed to luga.ajaxform.Sender 's constructor too.
			See below for a full list
		</p>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading luga-docs-api-heading">luga.ajaxform.Sender(options)</div>
	<div class="panel-body">
		Form handler's constructor. You can invoke its <a href="#ajaxform/api/samples">send()</a> or <a
			href="#ajaxform/api/raw-json">sendJson()</a> method to serialize the form and send its contents using XHR
	</div>
	<table class="table table-bordered luga-docs-api">
		<th colspan="3">Arguments</th>
		<tr>
			<td>options.formNode</td>
			<td>
				{jquery}
			</td>
			<td>
				A jQuery object wrapping the form. Required
			</td>
		</tr>
		<tr>
			<td>options.action</td>
			<td>
				{string}
			</td>
			<td>
				URL to where the form will be send. Default to the current URL
			</td>
		</tr>
		<tr>
			<td>options.method</td>
			<td>
				{string}
			</td>
			<td>
				HTTP method to be used. Default to GET
			</td>
		</tr>
		<tr>
			<td>options.timeout</td>
			<td>
				{number}
			</td>
			<td>
				Timeout to be used during the HTTP call (milliseconds). Default to 30000
			</td>
		</tr>
		<tr>
			<td>options.success</td>
			<td>
				{string}
			</td>
			<td>
				Name of the function to be invoked if the form is successfully submitted. Default to
				"luga.ajaxform.handlers.replaceForm"
			</td>
		</tr>
		<tr>
			<td>options.error</td>
			<td>
				{string}
			</td>
			<td>
				Name of the function to be invoked if the HTTP call failed. Default to
				"luga.ajaxform.handlers.errorAlert"
			</td>
		</tr>
		<tr>
			<td>options.successmsg</td>
			<td>
				{string}
			</td>
			<td>
				Message that will be displayed to the user if the form is successfully submitted. Default to "Thanks for
				submitting the form"
			</td>
		</tr>
		<tr>
			<td>options.errormsg</td>
			<td>
				{string}
			</td>
			<td>
				Message that will be displayed to the user if the HTTP call failed. Default to "Failed to submit the
				form"
			</td>
		</tr>
		<tr>
			<td>options.before</td>
			<td>
				{string}
			</td>
			<td>
				Name of the function to be invoked before the form is send. Default to null
			</td>
		</tr>
		<tr>
			<td>options.after</td>
			<td>
				{string}
			</td>
			<td>
				Name of the function to be invoked after the form is send. Default to null
			</td>
		</tr>
		<tr>
			<td>options.headers</td>
			<td>
				{object}
			</td>
			<td>
				A set of name/value pairs to be used as custom HTTP headers. Available only with JavaScript API. Default
				to null
			</td>
		</tr>

	</table>
	<table class="table table-bordered luga-docs-api">
		<th>Examples</th>
	</table>

<pre><code class="language-javascript">// Minimal set-up, leverage default
	var simpleSender = new luga.ajaxform.Sender({
	formNode: jQuery("#basic")
})

// Using all options
var fullOptionSender = new luga.ajaxform.Sender({
	formNode: jQuery("#basic"),
	action: "configAction",
	method: "POST",
	timeout: 40000,
	success: "customSuccessHandler",
	successmsg: "Success",
	error: "customErrorHandler",
	errormsg: "Error",
	before: "customBefore",
	after: "customAfter",
	headers: {"x-msg": "Ciao Mamma"}
})</code></pre>

</div>

<div class="panel panel-default">
	<div class="panel-heading luga-docs-api-heading">luga.ajaxform.initForms(rootNode)</div>
	<div class="panel-body">
		Initialize all the ajaxforms contained inside the given node.
		The library internally calls this as soon as the document load.
		You can invoke it in case the DOM as changed and new forms has been added to the document
	</div>
	<table class="table table-bordered luga-docs-api">
		<th colspan="3">Arguments</th>
		<tr>
			<td>options.rootNode</td>
			<td>
				{jquery}
			</td>
			<td>
				A jQuery object wrapping the form. Optional. If not specified it will default to jQuery("body")
			</td>
		</tr>

	</table>
</div>