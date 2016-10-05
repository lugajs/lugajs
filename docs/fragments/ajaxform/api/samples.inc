<script>
	//<![CDATA[
	function submitAsGet(formNode){
		var sender = new luga.ajaxform.Sender({
			formNode: formNode,
			action: "ajaxform-action.json",
			method: "GET",
			successmsg: "Form send with GET"
		});
		sender.send();
	};
	//]]>
</script>

<div class="panel panel-default">
	<div class="panel-heading">Programmatically use Ajaxform</div>
	<div class="panel-body">
		<p>
			Instead of using custom attributes you can implement a script based solution.
			First, create a new instance of luga.ajaxform.Sender, then call its send() method
		</p>

		<p>
			For a complete list of available options, see the <a href="#ajaxform/api/syntax">syntax reference</a>
		</p>

<pre><code class="language-javascript">function submitAsGet(formNode){
	var sender = new luga.ajaxform.Sender({
		formNode: formNode,
		action: "../action.json",
		method: "GET",
		successmsg: "Form send with GET"
	});
	sender.send();
};
</code></pre>

<pre><code class="language-markup">&lt;form id="getForm"&gt;
	&lt;input type="text" name="name"/&gt;
	&lt;input type="button" value="Send" onclick="submitAsGet(jQuery('#getForm'))"/&gt;
&lt;/form&gt;</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Use XHR programmatically</div>
	<div class="panel-body">
		<form action="../action.json" id="getForm">
			<div class="form-group">
				<input type="text" class="form-control" name="name"/>
			</div>
			<div class="form-group">
				<input type="button" value="Submit" onclick="submitAsGet(jQuery('#getForm'))"/>
			</div>
		</form>
	</div>
</div>