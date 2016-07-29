<div class="panel panel-default">
	<div class="panel-heading">Together with Luga Validator</div>
	<div class="panel-body">
		<p>
			If you want to first use Luga Validator and then send the form using Ajaxform,
			you can leverage the data-lugavalidator-after attribute and the build-in
			luga.ajaxform.handlers.afterValidation function
		</p>

<pre><code class="language-markup">&lt;form action="ajaxform-action.json"
	data-lugavalidator-validate="true"
	data-lugavalidator-after="luga.ajaxform.handlers.afterValidation"&gt;
	&lt;input type="text" name="name"/&gt;
	&lt;input type="submit" value="Submit"/&gt;
&lt;/form&gt;</code></pre>

	</div>
</div>
<div class="panel panel-default">
	<div class="panel-heading">First validate, then send by XHR</div>
	<div class="panel-body">
		<form action="ajaxform-action.json" data-lugavalidator-validate="true"
			  data-lugavalidator-after="luga.ajaxform.handlers.afterValidation">
			<div class="form-group">
				<label for="age">Age (required, positive integer, min 18, max 75)</label>
				<input type="text" class="form-control" id="age" name="age" value="18"
					   data-lugavalidator-required="true"
					   data-lugavalidator-errorclass="invalid"
					   data-lugavalidator-message="Please insert a valid age"
					   data-lugavalidator-pattern="positiveinteger"
					   data-lugavalidator-minnumber="18"
					   data-lugavalidator-maxnumber="75"
					   data-lugavalidator-filters="numbersonly"/>
			</div>
			<div class="form-group">
				<label for="name" class="control-label">Name (required)</label>
				<input type="text" class="form-control" id="name" name="name"
					   data-lugavalidator-required="true"
					   data-lugavalidator-errorclass="invalid"
					   data-lugavalidator-message="Please insert a name"/>
			</div>
			<div class="form-group">
				<label for="email" class="control-label">Email</label>
				<input type="text" class="form-control" id="email" name="email"
					   data-lugavalidator-required="true"
					   data-lugavalidator-errorclass="invalid"
					   data-lugavalidator-message="Please insert a valid email"
					   data-lugavalidator-email="true"/>
			</div>
			<div class="form-group">
				<label for="date">Date (not required, date, YYYY-MM-DD)</label>
				<input type="text" class="form-control" id="date" name="date" value="2005-05-09"
					   data-lugavalidator-message="Please insert a valid date using the YYYY-MM-DD format"
					   data-lugavalidator-errorclass="invalid"
					   data-lugavalidator-datepattern="YYYY-MM-DD"/>
			</div>
			<div class="form-group">
				<label for="comments">Comments (not required, min 3 chars, max 10)</label>
						<textarea id="comments" class="form-control" name="comments" cols="20" rows="3"
								  data-lugavalidator-message="Comments should be from 3 to 10 chars"
								  data-lugavalidator-errorclass="invalid"
								  data-lugavalidator-minlength="3"
								  data-lugavalidator-maxlength="10">
						</textarea>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>