<div class="panel panel-default">
	<div class="panel-heading">Registration Form</div>
	<div class="panel-body">
		<form data-lugavalidator-validate="true">
			<div class="form-group">
				<label for="username">Username (required, alphanumeric)</label>
				<input type="text" name="username" id="username" class="form-control"
					   data-lugavalidator-required="true"
					   data-lugavalidator-pattern="alphanumeric"
					   data-lugavalidator-errorclass="invalid"
					   data-lugavalidator-message="Please insert a username using only numbers and letters"/>
			</div>
			<div class="form-group">
				<label for="password1">Password (required)</label>
				<input type="password" name="password1" id="password1" class="form-control"
					   data-lugavalidator-required="true"
					   data-lugavalidator-errorclass="invalid"/>
			</div>

			<div class="form-group">
				<label for="password2">Repeat Password (required)</label>
				<input type="password" name="password2" id="password2" class="form-control"
					   data-lugavalidator-required="true"
					   data-lugavalidator-errorclass="invalid"
					   data-lugavalidator-equalto="password1"
					   data-lugavalidator-message="Please insert two matching passwords"/>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
				
<pre><code class="line-numbers language-markup">&lt;form data-lugavalidator-validate="true"&gt;
	&lt;div class="form-group"&gt;
		&lt;label for="username"&gt;Username (required, alphanumeric)&lt;/label&gt;
		&lt;input type="text" name="username" id="username" class="form-control"
		data-lugavalidator-required="true"
		data-lugavalidator-pattern="alphanumeric"
		data-lugavalidator-errorclass="invalid"
		data-lugavalidator-message="Please insert a username using only numbers and letters"/&gt;
	&lt;/div&gt;
	&lt;div class="form-group"&gt;
		&lt;label for="password1"&gt;Password (required)&lt;/label&gt;
		&lt;input type="password" name="password1" id="password1" class="form-control"
		data-lugavalidator-required="true"
		data-lugavalidator-errorclass="invalid"/&gt;
	&lt;/div&gt;

	&lt;div class="form-group"&gt;
		&lt;label for="password2"&gt;Repeat Password (required)&lt;/label&gt;
		&lt;input type="password" name="password2" id="password2" class="form-control"
		data-lugavalidator-required="true"
		data-lugavalidator-errorclass="invalid"
		data-lugavalidator-equalto="password1"
		data-lugavalidator-message="Please insert two matching passwords"/&gt;
	&lt;/div&gt;
	&lt;div class="form-group"&gt;
		&lt;input type="submit" value="Submit"/&gt;
	&lt;/div&gt;
&lt;/form&gt;</code></pre>

	</div>
</div>