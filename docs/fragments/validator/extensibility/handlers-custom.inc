<script>
	handlers = {};
	handlers.before = function(formNode, event){
		alert("I am a custom before handler");
	};
	handlers.error = function(formNode, validators){
		alert("I am a custom error handler");
	};
	handlers.after = function(formNode, event){
		alert("I am a custom after handler");
	};
</script>

<div class="panel panel-default">
	<div class="panel-heading">Custom handlers</div>
	<div class="panel-body">

		<p>
			Luga Validator let you run <a href="#validator/extensibility/custom-error">your own error handlers</a>, you can also specify some
			JavaScript function to execute before or after validation.
		</p>

<pre><code class="line-numbers language-javascript">handlers = {};
handlers.before = function(formNode, event){
	alert("I am a custom before handler");
};
handlers.error = function(formNode, validators){
	alert("I am a custom error handler");
};
handlers.after = function(formNode, event){
	alert("I am a custom after handler");
};</code></pre>

		<p>
			The HTML will look like:
		</p>

<pre><code class="language-markup">&lt;form data-lugavalidator-validate="true"
	data-lugavalidator-before="handlers.before"
	data-lugavalidator-error="handlers.error"
	data-lugavalidator-after="handlers.after"&gt;</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Custom handlers</div>
	<div class="panel-body">
		<form data-lugavalidator-validate="true"
			  data-lugavalidator-before="handlers.before"
			  data-lugavalidator-error="handlers.error"
			  data-lugavalidator-after="handlers.after">
			<div class="form-group">
				<input type="text" class="form-control" name="name" data-lugavalidator-required="true"
					   data-lugavalidator-errorclass="invalid" data-lugavalidator-message="Invalid!"/>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>