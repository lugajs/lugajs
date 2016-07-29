<div class="panel panel-default">
	<div class="panel-heading">Getting started</div>
	<div class="panel-body">
		<p>
			In order to turn a form into an Ajaxform, you must include the JavaScript files. First jQuery, then
			<a href="../dist/luga.common.min.js">Luga Common</a>
			and <a href="../dist/luga.ajaxform.min.js">Luga Ajaxform</a> (in this order)
		</p>

<pre><code class="language-markup">&lt;script src="js/jquery.min.js"&gt;&lt;/script&gt;
&lt;script src="js/luga.common.min.js"&gt;&lt;/script&gt;
&lt;script src="js/luga.ajaxform.min.js"&gt;&lt;/script&gt;
</code></pre>

		<p>Then add the data-lugajax-form="true" attribute to the form tag</p>

<pre><code class="language-markup">&lt;form action="ajaxform-action.json" data-lugajax-form="true"&gt;
	&lt;input type="text" name="name"/&gt;
	&lt;input type="submit" value="Submit"/&gt;
&lt;/form&gt;</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Basic form</div>
	<div class="panel-body">
		<form action="ajaxform-action.json" data-lugajax-form="true">
			<div class="form-group">
				<input type="text" class="form-control" name="name"/>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>

<div class="alert alert-warning" role="alert">
	<strong>Warning!</strong><br>
	<ul class="luga-docs-list">
		<li>Please note Ajaxform can't handle file upload!</li>
		<li>Don't use "action" or "method" as field name! Certain browsers will mess up on this</li>
		<li>Keep in mind, XMLHttpRequest expects UTF-8 and will force the response to UTF-8. Any non-UTF-8 charset you
			send downstream may be turned into rubbish
		</li>
	</ul>
</div>