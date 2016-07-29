<div class="panel panel-default">
	<div class="panel-heading">Getting started</div>
	<div class="panel-body">
		<p>
			In order to enable validation, you must include the JavaScript files. First jQuery, then
			<a href="../dist/luga.common.min.js">Luga Common</a>
			and <a href="../dist/luga.validator.min.js">Luga Validator</a> (in this order)
		</p>

<pre><code class="language-markup">&lt;script src="js/jquery.min.js"&gt;&lt;/script&gt;
&lt;script src="js/luga.common.min.js"&gt;&lt;/script&gt;
&lt;script src="js/luga.ajaxform.min.js"&gt;&lt;/script&gt;
</code></pre>

		<p>Then add the data-lugavalidator-validate="true" attribute to the form tag</p>

<pre><code class="language-markup">&lt;form data-lugavalidator-validate="true"&gt;
	&lt;input type="text" name="name"
	data-lugavalidator-required="true"
	data-lugavalidator-errorclass="invalid"
	data-lugavalidator-message="Invalid!"/&gt;
	&lt;input type="submit" value="Submit"/&gt;
&lt;/form&gt;</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Basic form</div>
	<div class="panel-body">
		<form data-lugavalidator-validate="true">
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