<script>
	// <![CDATA[
	handlers = {};
	handlers.alertBefore = function(formNode){
		alert("I am executed before the form is send");
	};
	handlers.alertAfter = function(formNode){
		alert("I am executed after the form is send");
	};
	//]]>
</script>

<div class="panel panel-default">
	<div class="panel-heading">Before/after handlers</div>
	<div class="panel-body">
		<p>
			If you want to execute some code before or after the form is send, you can use the
			data-lugajax-before and data-lugajax-after custom attributes
		</p>

<pre><code class="language-markup">&lt;form action="ajaxform-action.json" data-lugajax-form="true"
	data-lugajax-after="handlers.alertAfter"
	data-lugajax-before="handlers.alertBefore"&gt;
	&lt;input type="text" name="name"/&gt;
	&lt;input type="submit" value="Submit"/&gt;
&lt;/form&gt;</code></pre>

		<p>
			Matching existing JavaScript code:
		</p>

<pre><code class="language-javascript">handlers = {};
handlers.alertBefore = function(formNode){
	alert("I am executed before the form is send");
};
handlers.alertAfter = function(formNode){
	alert("I am executed after the form is send");
};</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">data-lugajax-after/data-lugajax-before</div>
	<div class="panel-body">
		<form action="ajaxform-action.json" data-lugajax-form="true"
			  data-lugajax-after="handlers.alertAfter"
			  data-lugajax-before="handlers.alertBefore">
			<div class="form-group">
				<input type="text" class="form-control" name="name"/>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>